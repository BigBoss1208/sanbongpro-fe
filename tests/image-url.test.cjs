/* eslint-env node */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { buildSync } = require('esbuild');
const path = require('node:path');
function load(file) {
  const result = buildSync({ entryPoints: [path.join(__dirname, '..', file)], bundle: true, format: 'cjs', platform: 'node', write: false, define: { 'import.meta.env': '{}' } });
  const holder = { exports: {} };
  new Function('module', 'exports', 'require', result.outputFiles[0].text)(holder, holder.exports, require);
  return holder.exports;
}
const { validateImageUrl, loadImageUrl } = load('src/utils/imageUrl.js');
const { fieldImageUrl } = load('src/utils/fieldImage.js');
test('external HTTPS image works without a MinIO public base', () => {
  assert.equal(fieldImageUrl('https://images.example.com/pitch.jpg'), 'https://images.example.com/pitch.jpg');
  assert.equal(fieldImageUrl('http://images.example.com/pitch.jpg'), '/assets/court-placeholder.svg');
});
test('rejects local, credential-bearing and temporary image URLs', () => {
  for (const value of ['http://example.com/a.jpg', 'https://127.0.0.1/a.jpg', 'https://localhost/a.jpg', 'https://user:pass@example.com/a.jpg', 'https://example.com/a.jpg?token=x', 'javascript:alert(1)', 'https://example.com/']) assert.throws(() => validateImageUrl(value));
});
test('only applies URLs after a successful image decode', async () => {
  class GoodImage { set src(value) { this.naturalWidth = 100; this.onload(); } }
  class BadImage { set src(value) { this.onerror(); } }
  assert.equal(await loadImageUrl('https://images.example.com/a.jpg', GoodImage), 'https://images.example.com/a.jpg');
  await assert.rejects(loadImageUrl('https://images.example.com/a.jpg', BadImage), /Ảnh cũ/);
});
