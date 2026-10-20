
import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { sanApi } from "../api/sanApi";
import { favoriteApi } from "../api/favoriteApi";
import { getPhien } from "../api/http";
import { useExclusiveAction } from "../utils/useExclusiveAction";

import { fieldImageUrl as getImageUrl } from "../utils/fieldImage";

export default function FieldPresentation({
  fieldId,
  onNavigate,
}) {
  const [field, setField] = useState(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [reload, setReload] = useState(0);
  const [failedImage, setFailedImage] = useState(false);

  const session = getPhien();

  const customer = [
    "KHACH_HANG",
    "customer",
  ].includes(session?.role || session?.vaiTro);

  useEffect(() => {
    let active = true;

    setField(null);
    setError("");
    setFailedImage(false);

    sanApi
      .danhSachSan()
      .then((items) => {
        if (!active) return;

        const found = items.find(
          (item) => Number(item.id) === Number(fieldId)
        );

        if (!found) {
          throw new Error(
            "Không tìm thấy sân đang hoạt động."
          );
        }

        setField(found);
      })
      .catch((err) => {
        if (active) {
          setError(err.message);
        }
      });

    if (customer) {
      favoriteApi
        .list()
        .then((items) => {
          if (!active) return;

          setSaved(
            items.some(
              (item) =>
                Number(item.id) === Number(fieldId)
            )
          );
        })
        .catch((err) => {
          if (active) {
            setError(err.message);
          }
        });
    } else {
      setSaved(false);
    }

    return () => {
      active = false;
    };
  }, [fieldId, customer, reload]);

  const toggle = useExclusiveAction(async () => {
    if (!customer) {
      return onNavigate("login");
    }

    setBusy(true);
    setError("");

    try {
      if (saved) {
        await favoriteApi.remove(fieldId);
      } else {
        await favoriteApi.add(fieldId);
      }

      setSaved((value) => !value);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  });

  const imageUrl = getImageUrl(field?.hinhAnh);

  return (
    <section className="field-presentation">
      {error && (
        <p role="alert" className="club-alert">
          {error}{" "}
          <button
            type="button"
            onClick={() => setReload((value) => value + 1)}
          >
            Thử lại
          </button>
        </p>
      )}

      {field ? (
        <>
          <div className="field-presentation-image">
            {imageUrl && !failedImage ? (
              <img
                src={imageUrl}
                alt={field.tenSan || "Sân bóng"}
                onError={() => setFailedImage(true)}
              />
            ) : (
              <div className="court-photo-empty">
                Ảnh sân đang được cập nhật
              </div>
            )}
          </div>

          <div className="field-presentation-info">
            <p className="club-eyebrow">
              {field.tenCumSan || "THÔNG TIN SÂN"}
            </p>

            <h1>{field.tenSan}</h1>

            <p>{field.loaiSan}</p>

            <p>{field.moTa}</p>

            <button
              type="button"
              className="club-button club-button-outline"
              onClick={toggle}
              disabled={busy}
              aria-pressed={saved}
            >
              {saved
                ? "♥ Bỏ yêu thích"
                : "♡ Yêu thích sân"}
            </button>
          </div>
        </>
      ) : (
        !error && (
          <p role="status">
            Đang tải thông tin sân…
          </p>
        )
      )}
    </section>
  );
}

FieldPresentation.propTypes = {
  fieldId: PropTypes.number.isRequired,
  onNavigate: PropTypes.func.isRequired,
};
