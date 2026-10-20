# Giải thích pipeline CI/CD (`.gitlab-ci.yml`)

Tài liệu này mô tả mục đích và ý nghĩa của từng phần trong file `.gitlab-ci.yml`
của project **fe-cicd** (React + Vite, đóng gói và phục vụ bằng nginx).

## Tổng quan luồng chạy

Pipeline chạy tuần tự qua 4 giai đoạn (stage):

```
build   ->   test   ->   package   ->   deploy
(npm build)  (lint)   (docker image)  (chạy container)
```

Mỗi lần `git push`, GitLab tự kích hoạt pipeline. Một stage chỉ chạy khi stage
trước thành công.

---

## 1. Khai báo các stage

```yaml
stages:
  - build
  - test
  - package
  - deploy
```

- Định nghĩa thứ tự các giai đoạn. Job cùng stage chạy song song, khác stage
  chạy tuần tự.

---

## 2. Biến toàn cục (`variables`)

```yaml
variables:
  VITE_API_BASE_URL: "http://localhost:8084"
  IMAGE_TAG: "$CI_REGISTRY_IMAGE:$CI_COMMIT_SHORT_SHA"
  IMAGE_LATEST: "$CI_REGISTRY_IMAGE:latest"
```

- `VITE_API_BASE_URL`: địa chỉ backend API. Với Vite, biến này được **nhúng
  thẳng vào bundle lúc build** (không phải lúc chạy). Vì vậy nếu deploy thật,
  bạn cần đặt lại giá trị này (ví dụ `https://api.example.com`) trong
  **Settings > CI/CD > Variables** của GitLab.
- `IMAGE_TAG`: tên image Docker gắn theo mã commit ngắn — mỗi commit một image.
- `IMAGE_LATEST`: tag `latest` trỏ tới bản mới nhất.

> Các biến `$CI_...` là biến dựng sẵn của GitLab (xem bảng ở mục 8).

---

## 3. Cache node_modules

```yaml
cache:
  key: "$CI_COMMIT_REF_SLUG"
  paths:
    - node_modules/
```

- Lưu lại `node_modules/` để các lần chạy sau không phải cài lại từ đầu.
- `key` tách cache theo từng nhánh.

---

## 4. Stage `build` — cài đặt và build bundle

```yaml
build:
  stage: build
  image: node:18-alpine
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/
    expire_in: 1 hour
```

- `image: node:18-alpine`: image Node.js 18 gọn nhẹ để build.
- `npm ci`: cài dependency chính xác theo `package-lock.json` (sạch và nhất quán
  hơn `npm install`, phù hợp CI).
- `npm run build`: Vite build ra thư mục `dist/` (HTML/CSS/JS tĩnh đã tối ưu).
- `artifacts.paths: dist/`: giữ kết quả build để stage sau dùng.
- `expire_in: 1 hour`: tự xóa sau 1 giờ.

---

## 5. Stage `test` — kiểm tra chất lượng mã (lint)

```yaml
test:
  stage: test
  image: node:18-alpine
  script:
    - npm ci
    - npm run lint
  allow_failure: false
```

- `npm run lint`: chạy ESLint kiểm tra lỗi cú pháp / quy chuẩn code.
- `allow_failure: false`: nếu lint fail thì pipeline **dừng** (không cho qua
  stage sau). Đây là "cổng chất lượng" trước khi đóng gói.

> Có thể mở rộng stage này bằng unit test (ví dụ Vitest/Jest) khi cần.

---

## 6. Stage `package` — build và đẩy Docker image

```yaml
package:
  stage: package
  image: docker:24.0
  services:
    - docker:24.0-dind
  variables:
    DOCKER_TLS_CERTDIR: "/certs"
  before_script:
    - echo "$CI_REGISTRY_PASSWORD" | docker login -u "$CI_REGISTRY_USER" --password-stdin "$CI_REGISTRY"
  script:
    - docker build --build-arg VITE_API_BASE_URL="$VITE_API_BASE_URL" -t "$IMAGE_TAG" -t "$IMAGE_LATEST" .
    - docker push "$IMAGE_TAG"
    - docker push "$IMAGE_LATEST"
  rules:
    - if: '$CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH'
```

- `image: docker:24.0` + `services: docker:24.0-dind`: bật **Docker-in-Docker**
  để chạy `docker build` bên trong job.
- `DOCKER_TLS_CERTDIR: "/certs"`: bật kết nối TLS an toàn giữa client và daemon dind.
- `before_script`: đăng nhập Container Registry của GitLab bằng credentials dựng
  sẵn (`--password-stdin` để không lộ mật khẩu trong log).
- `docker build --build-arg VITE_API_BASE_URL=...`: **điểm khác biệt quan trọng
  so với BE**. FE cần truyền URL API vào lúc build vì Vite nhúng biến này vào
  bundle tĩnh. Giá trị này khớp với `ARG VITE_API_BASE_URL` trong `Dockerfile`.
- `docker push`: đẩy 2 tag (`:sha` và `:latest`) lên registry.
- `rules`: chỉ build/push khi commit ở **nhánh mặc định** (main/master).

---

## 7. Stage `deploy` — triển khai (mẫu)

```yaml
deploy:
  stage: deploy
  image: docker:24.0
  services:
    - docker:24.0-dind
  variables:
    DOCKER_TLS_CERTDIR: "/certs"
  before_script:
    - echo "$CI_REGISTRY_PASSWORD" | docker login -u "$CI_REGISTRY_USER" --password-stdin "$CI_REGISTRY"
  script:
    - docker pull "$IMAGE_TAG"
    - docker rm -f fe-cicd || true
    - docker run -d --name fe-cicd -p 80:80 "$IMAGE_TAG"
  environment:
    name: staging
    url: http://localhost
  rules:
    - if: '$CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH'
      when: manual
```

- `docker pull`: tải image vừa build.
- `docker rm -f fe-cicd || true`: xóa container cũ nếu có (`|| true` để không
  fail khi chưa tồn tại).
- `docker run -d -p 80:80`: chạy container nginx phục vụ web ở cổng 80.
- `environment`: khai báo môi trường `staging` để GitLab theo dõi trong mục
  **Environments**.
- `when: manual`: chờ bấm nút deploy thủ công, tránh triển khai ngoài ý muốn.

> Bản mẫu chạy container ngay trên runner. Thực tế thay bằng SSH tới server +
> `docker compose`, hoặc `kubectl apply` nếu dùng Kubernetes.

---

## 8. Biến GitLab dựng sẵn đã dùng

| Biến | Ý nghĩa |
|------|---------|
| `$CI_COMMIT_SHORT_SHA` | Mã commit ngắn (8 ký tự) |
| `$CI_COMMIT_REF_SLUG` | Tên nhánh đã "làm sạch" để dùng an toàn |
| `$CI_COMMIT_BRANCH` | Tên nhánh của commit hiện tại |
| `$CI_DEFAULT_BRANCH` | Nhánh mặc định của repo (main/master) |
| `$CI_REGISTRY` | Địa chỉ Container Registry |
| `$CI_REGISTRY_IMAGE` | Đường dẫn image của project trong registry |
| `$CI_REGISTRY_USER` / `$CI_REGISTRY_PASSWORD` | Thông tin đăng nhập registry (tự cấp) |

---

## 9. Khác biệt chính so với pipeline BE

| | BE (be-cicd) | FE (fe-cicd) |
|---|---|---|
| Runtime build | Maven + JDK 11 | Node 18 + Vite |
| Stage `test` | `mvn test` (unit test) | `npm run lint` (ESLint) |
| Cache | `.m2/repository` | `node_modules/` |
| Cấu hình URL | đọc lúc chạy (`application.yml`) | **nhúng lúc build** qua `--build-arg VITE_API_BASE_URL` |
| Image runtime | `eclipse-temurin:11-jre` (cổng 8084) | `nginx:1.25-alpine` (cổng 80) |

---

## 10. Điều kiện tiên quyết

1. Project đã bật **Container Registry** trong GitLab.
2. GitLab Runner hỗ trợ Docker + dịch vụ `dind` (privileged mode).
3. Có `package-lock.json` để `npm ci` chạy được (được tạo sau khi `npm install`
   lần đầu — nhớ commit file này).
4. File `Dockerfile` và `nginx.conf` nằm ở thư mục gốc — đã có sẵn.
