/* eslint-env node */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { buildSync } = require('esbuild');
const path = require('node:path');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const store = new Map();
global.localStorage = {getItem:key=>store.get(key) ?? null,setItem:(key,value)=>store.set(key,value),removeItem:key=>store.delete(key)};
global.sessionStorage = { getItem: () => null, setItem() {}, removeItem() {} };
global.window = {location:{pathname:'/',protocol:'http:'},addEventListener(){},removeEventListener(){},dispatchEvent(){}};
function component(file, exportName = "default", env = {}) {
 const output=buildSync({entryPoints:[path.join(__dirname,'..',file)],bundle:true,write:false,format:'cjs',platform:'node',jsx:'automatic',loader:{'.css':'empty'},external:['react','react/jsx-runtime','prop-types'],define:{'import.meta.env':JSON.stringify(env)}});
 const module={exports:{}};
 new Function('require','module','exports',output.outputFiles[0].text)(require,module,module.exports);
 return module.exports[exportName];
}
const Guest=component('src/components/GuestLayout.jsx');
const Layout=component('src/components/Layout.jsx');
const App=component('src/App.jsx');
const Home=component('src/pages/PremiumHomePage.jsx');
const render=(C,props={})=>renderToStaticMarkup(React.createElement(C,{onNavigate(){},onLogout(){},children:'CONTENT',...props}));
const bookingButton=html=>/<button\b[^>]*>Đặt sân<\/button>/.test(html);
test('public navigation replaces old booking pill on every customer page and retains favorites',()=>{
 const pages=['home','search','featured','field-detail','favorites','history','profile'];
 for(const page of pages){
  const html=render(Layout,{role:'customer',currentPage:page,userName:'QA'});
  assert.equal(bookingButton(html),false); assert.match(html,/Sân yêu thích/); assert.match(html,/Trang chủ/); assert.match(html,/Tìm sân/);
  assert.doesNotMatch(html,/nav-pill|hideBookingNav/);
 }
 for(const page of ['home','search','favorites','field-detail']) assert.equal(bookingButton(render(Guest,{currentPage:page})),false);
 const html=render(Guest,{currentPage:'search'});
 assert.equal((html.match(/aria-current="page"/g)||[]).length,1);
 assert.match(html,/<a[^>]+aria-current="page"[^>]*>Tìm sân<\/a>/);
 assert.doesNotMatch(html,/Tin tức/);
});
test('guest and customer admin URLs render denial; onsite payment URL allowed only to onsite/admin',()=>{
 store.clear(); window.location.pathname='/admin/dashboard'; assert.match(render(App),/403/);
 store.set('phien',JSON.stringify({role:'KHACH_HANG',hoTen:'QA'})); assert.match(render(App),/403/);
 window.location.pathname='/onsite/thanh-toan'; assert.match(render(App),/403/);
 store.set('phien',JSON.stringify({role:'NHAN_VIEN_SAN',hoTen:'QA'})); assert.match(render(App),/Giao dịch thanh toán/);
 store.clear(); window.location.pathname='/';
});
test('homepage renders truthful loading state and keeps booking CTA without fake prices/status',()=>{
 const html=render(Home);
 assert.match(html,/Đặt sân ngay/); assert.match(html,/Đang tải danh sách sân/);
 assert.doesNotMatch(html,/300\.000|100%|Còn trống/);
 assert.match(html,/TÌM SÂN/); assert.match(html,/ĐẶT GIỜ/);
});

test('legacy staff exports render current matrix and check-in screens', () => {
 assert.match(render(component('src/pages/StaffPages.jsx', 'MatrixCalendarPage')), /lịch/i);
 assert.match(render(component('src/pages/StaffPages.jsx', 'OnsitePosPage')), /Check-in/);
});

test('guest favorites renders login prompt and both auth screens use shared layout',()=>{
 store.clear(); window.location.pathname='/yeu-thich'; assert.match(render(App),/Đăng nhập để xem/);
 const pages=component('src/pages/GuestPages.jsx','RegisterPage');
 const html=render(pages); assert.match(html,/club-auth/); assert.match(html,/Hiện mật khẩu/); assert.match(html,/register-email/);
 const login=render(component('src/pages/GuestPages.jsx','LoginPage'),{onLoginSuccess(){}});
 assert.match(login,/club-auth/); assert.match(login,/Ghi nhớ đăng nhập/);
});

test('all operational routes render for authorized roles without route regressions',()=>{
 for (const [role,paths] of Object.entries({ADMIN:['/admin/dashboard','/admin/quan-ly-san','/admin/cum-san','/admin/khung-gio-gia','/admin/thanh-toan','/admin/khach-hang','/admin/nhan-vien','/admin/doanh-thu','/admin/bao-cao'],NHAN_VIEN_PAGE:['/staff-page/requests','/staff-page/matrix'],NHAN_VIEN_SAN:['/onsite/pos','/onsite/walkin','/onsite/matrix','/onsite/thanh-toan']})){
  store.set('phien',JSON.stringify({role,username:'qa'}));
  for(const pathname of paths){window.location.pathname=pathname;assert.doesNotMatch(render(App),/403 -/);}
 }
 store.clear(); window.location.pathname='/';
});
test('dashboard charts expose supplied data and honest empty states',()=>{
 const Line=component('src/components/DashboardCharts.jsx','RevenueLineChart');
 assert.match(render(Line,{rows:[{ngay:'T2',giaTri:220000}]}),/220.000/);
 assert.match(render(Line,{rows:[{ngay:'T2',giaTri:0}]}),/Chưa có doanh thu/);
 const Types=component('src/components/DashboardCharts.jsx','FieldTypeChart');
 assert.match(render(Types,{fields:[{loaiSan:'Sân 5'},{loaiSan:'Sân 7'}]}),/50%/);
 assert.match(render(Types,{fields:[]}),/Chưa có dữ liệu/);
});

test('price form permits normal whole-VND prices without offset step mismatch',()=>{
 const html=render(component('src/pages/AdminOperationsPages.jsx','AdminSchedulePage'));
 assert.match(html,/min="1" step="1"/); assert.doesNotMatch(html,/step="1000"/);
});

test('field images normalize keys and owned URLs without duplicate bucket',()=>{
 const image=component('src/utils/fieldImage.js','fieldImageUrl',{VITE_MINIO_PUBLIC_URL:'https://personal-storage.example.invalid/pitches'});
 assert.equal(image('san/pitch.png'),'https://personal-storage.example.invalid/pitches/san/pitch.png');
 assert.equal(image('pitches/san/pitch.png'),image('san/pitch.png'));
 assert.equal(image('https://personal-storage.example.invalid/pitches/san/pitch.png?expired=1'),image('san/pitch.png'));
 for(const invalid of ['',null,'../private','san/%invalid','https://foreign.invalid/pitch.png']) assert.equal(image(invalid),'/assets/court-placeholder.svg');
});
test('field images never fall back to storage when personal storage is not configured',()=>{
 const image=component('src/utils/fieldImage.js','fieldImageUrl');
 assert.equal(image('san/pitch.png'),'/assets/court-placeholder.svg');
 assert.equal(image('https://foreign.invalid/pitch.png'),'/assets/court-placeholder.svg');
});
test('payment result route ignores browser success flags and works on reload without session',()=>{
 store.clear(); window.location.pathname='/ket-qua-thanh-toan'; window.location.search='?ref=example&vnp_ResponseCode=00';
 const html=render(App); assert.match(html,/Đang xác minh thanh toán/); assert.match(html,/Vui lòng đăng nhập/); assert.doesNotMatch(html,/Thanh toán thành công/);
 store.set('phien',JSON.stringify({role:'KHACH_HANG'})); assert.match(render(App),/Đang xác minh thanh toán/);
 store.clear();window.location.pathname='/';window.location.search='';
});

test('customer navigation exposes canonical history link while guests get login prompt',()=>{
 const customer=render(Layout,{role:'customer',userName:'QA',currentPage:'history'});
 assert.match(customer,/<a[^>]+href="\/lich-su-dat-san"[^>]+aria-current="page"[^>]*>Lịch sử đặt sân<\/a>/);
 const guest=render(Guest);assert.doesNotMatch(guest,/href="\/lich-su-dat-san"/);
 store.clear();window.location.pathname='/lich-su-dat-san';assert.match(render(App),/Đăng nhập để xem lịch sử đặt sân/);
 store.set('phien',JSON.stringify({role:'KHACH_HANG',hoTen:'QA'}));assert.match(render(App),/Đang tải lịch sử đặt sân/);
 window.location.pathname='/lich-su';assert.match(render(App),/Đang tải lịch sử đặt sân/);
 store.clear();window.location.pathname='/';
});

test('existing image can be replaced without clearing preview and is protected during upload',()=>{
 const Upload=component('src/components/ui.jsx','ImageUploadField');
 const props={value:'http://storage.invalid/nhom2/san/old.png',onChange(){},onClear(){}};
 const ready=render(Upload,props);assert.match(ready,/Thay ảnh/);assert.match(ready,/type="file"/);assert.match(ready,/san\/old.png/);
 const busy=render(Upload,{...props,loading:true});assert.match(busy,/san\/old.png/);assert.match(busy,/Đang tải/);
 assert.match(busy,/<input[^>]+disabled/);assert.match(busy,/<button[^>]+disabled/);
});
