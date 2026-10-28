/* eslint-env node */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { buildSync } = require('esbuild');
const path = require('node:path');
const output = buildSync({ entryPoints: [path.join(__dirname, '../src/utils/pitchAssistant.js')], bundle: true, format: 'cjs', platform: 'node', write: false });
const holder = { exports: {} };
new Function('module', 'exports', output.outputFiles[0].text)(holder, holder.exports);
const { answerPitchQuestion: answer } = holder.exports;
const fields = [
  { id: 1, tenSan: 'Sân A', loaiSan: 'Sân 5', tenCumSan: 'Cụm Trung Tâm', giaThapNhat: 300000, trangThai: 'HOAT_DONG' },
  { id: 2, tenSan: 'Sân B', loaiSan: 'Sân 7', giaThapNhat: 200000, trangThai: 'HOAT_DONG' },
  { id: 3, tenSan: 'Sân C', loaiSan: 'Sân 5', giaThapNhat: null, trangThai: 'HOAT_DONG' },
  { id: 4, tenSan: 'Closed', loaiSan: 'Sân 5', giaThapNhat: 100000, trangThai: 'TAM_NGUNG' },
];
test('uses supplied real prices and Vietnamese type/budget filters', () => {
  assert.deepEqual(answer('Sân 5 dưới 400k', fields).fields.map(x => x.id), [1]);
  assert.deepEqual(answer('Sân 7 ngân sách 0,3 triệu', fields).fields.map(x => x.id), [2]);
  assert.equal(answer('Giá sân', fields).fields[0].price, 200000);
  assert.equal(answer('Giá sân', fields).fields.at(-1).price, null);
});
test('never invents popularity, availability or missing prices', () => {
  assert.match(answer('sân hot', fields).text, /Chưa có thống kê/);
  assert.equal(answer('sân hot', fields).fields.some(x => x.id === 4), false);
  assert.equal(answer('sân trống hôm nay', null).fields, undefined);
  assert.match(answer('Sân 5 dưới 100k', fields).text, /Chưa có sân/);
  assert.match(answer('Giá sân', []).text, /Chưa có sân/);
  assert.throws(() => answer('Giá sân', { bad: true }));
});
test('FAQ works without backend and does not perform actions', () => {
  assert.equal(answer('cách đặt sân', null).links[0].href, '/tim-san');
  assert.equal(answer('lịch sử đặt sân', null).links[0].href, '/lich-su-dat-san');
  assert.match(answer('thanh toán VNPay', null).text, /chưa được bật/);
  assert.match(answer('mật khẩu', null).text, /Không gửi mật khẩu/);
  assert.match(answer('xin chào', null).text, /Mình hỗ trợ/);
});
