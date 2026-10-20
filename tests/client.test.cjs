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
const storage = new Map();
global.localStorage = { getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value), removeItem: (key) => storage.delete(key) };
const temporaryStorage = new Map();
global.sessionStorage = { getItem: (key) => temporaryStorage.get(key) ?? null, setItem: (key, value) => temporaryStorage.set(key, value), removeItem: (key) => temporaryStorage.delete(key) };
global.window = { location: { protocol: 'https:' }, dispatchEvent: () => {} };
const api = load('src/api/http.js');
test('corrupt session JSON cannot prevent an API request', async () => {
 storage.set('phien', '{bad'); assert.equal(api.getPhien(), null);
 global.fetch = async () => new Response('[{"id":7}]', { headers: { 'content-type': 'application/json' } });
 assert.deepEqual((await api.http('/api/san')).data, [{ id: 7 }]);
});
test('401 clears session tokens and preserves backend validation details', async () => {
 storage.set('token', 'test-only'); storage.set('accessToken', 'test-only'); storage.set('phien', '{}');
 global.fetch = async () => new Response(JSON.stringify({ message: 'Expired', fields: { token: 'Login again' } }), { status: 401 });
 await assert.rejects(api.http('/api/nguoi-dung/me'), (error) => error.status === 401 && error.message.includes('Login again'));
 assert.equal(storage.has('token'), false); assert.equal(storage.has('phien'), false);
});
test('403 preserves the session and provides a permission error', async () => {
 storage.set('token', 'test-only'); global.fetch = async () => new Response('', { status: 403 });
 await assert.rejects(api.http('/api/admin/dashboard'), (error) => error.status === 403);
 assert.equal(storage.get('token'), 'test-only'); storage.clear();
});
test('empty responses and plain text success retain API compatibility', async () => {
 global.fetch = async () => new Response(null, { status: 204 }); assert.equal((await api.http.delete('/api/item/1')).data, null);
 global.fetch = async () => new Response('Đổi mật khẩu thành công', { headers: { 'content-type': 'text/plain' } });
 assert.equal((await api.http.put('/api/nguoi-dung/doi-mat-khau', {})).data, 'Đổi mật khẩu thành công');
});
test('malformed success JSON reports an error, not fake empty data', async () => {
 global.fetch = async () => new Response('{invalid', { headers: { 'content-type': 'application/json' } });
 await assert.rejects(api.http('/api/san'), /JSON/);
});
test('shared client safely encodes params and uses authenticated multipart', async () => {
 storage.set('token', 'test-only'); let seen;
 global.fetch = async (url, options) => { seen = { url, options }; return new Response('{}'); };
 const body = new FormData(); await api.http.post('/api/upload', body, { params: { q: 'a & b', unused: null } });
 assert.equal(seen.url, '/api/upload?q=a+%26+b'); assert.equal(seen.options.headers.Authorization, 'Bearer test-only'); assert.equal(seen.options.headers['Content-Type'], undefined); storage.clear();
});
const dates = load('src/api/dates.js');
test('Vietnam calendar dates cross UTC midnight without shifting report boundaries', () => {
 assert.equal(dates.vietnamDate(new Date('2026-10-11T18:00:00Z')), '2026-10-12');
 assert.equal(dates.daysBefore('2026-10-12', 6), '2026-10-06');
 assert.equal(dates.validDateRange('2026-10-12', '2026-10-01'), false);
});
const courts = load('src/utils/courtSearch.js');
test('court search handles Vietnamese accents, clusters, types, and unknown price ordering', () => {
 const list = [{ id: 1, tenSan: 'Đông Đô', cumSanId: 7, loaiSan: 'Sân 5', giaThapNhat: 200 }, { id: 2, tenSan: 'Đông Bắc', cumSanId: 7, loaiSan: 'Sân 7', giaThapNhat: 100 }, { id: 3, tenSan: 'A', giaThapNhat: null }];
 assert.deepEqual(courts.filterCourts(list, { keyword: 'dong do', cluster: '7', type: 'Sân 5' }).map((court) => court.id), [1]);
 assert.deepEqual(courts.filterCourts(list, { sort: 'price-asc' }).map((court) => court.id), [2, 1, 3]);
 assert.deepEqual(courts.filterCourts(list, { sort: 'price-desc' }).map((court) => court.id), [1, 2, 3]);
 assert.equal(list[0].id, 1);
});

test('remember preference chooses storage, profile preserves it, logout clears both', () => {
 api.savePhien({ token: 'temporary-test-token' }, false);
 assert.equal(storage.has('phien'), false); assert.equal(api.getToken(), 'temporary-test-token');
 api.savePhien({ ...api.getPhien(), hoTen: 'Updated' });
 assert.equal(temporaryStorage.has('phien'), true);
 api.savePhien({ token: 'persistent-test-token' }, true);
 assert.equal(temporaryStorage.size, 0); assert.equal(storage.has('phien'), true);
 api.xoaPhien(); assert.equal(storage.size, 0); assert.equal(temporaryStorage.size, 0);
});

const { exclusiveAction } = load('src/utils/exclusiveAction.js');
test('mutation guard blocks simultaneous submits and releases after failure', async () => {
 let calls = 0, release;
 const guarded = exclusiveAction(async () => { calls++; await new Promise(resolve => { release = resolve; }); throw new Error('expected'); });
 const first = guarded(); await guarded(); assert.equal(calls, 1);
 release(); await assert.rejects(first, /expected/);
 const second = guarded(); assert.equal(calls, 2); release(); await assert.rejects(second, /expected/);
});

const { favoriteApi } = load('src/api/favoriteApi.js');
test('favorites client preserves authenticated list/add/remove API contract', async () => {
 storage.set('token','test-only'); const calls=[];
 global.fetch=async (url,options)=>{ calls.push([url,options.method||'GET',options.headers.Authorization]); return options.method==='DELETE' ? new Response(null,{status:204}) : new Response(options.method==='POST' ? '{"id":7}' : '[{"id":7}]'); };
 assert.deepEqual(await favoriteApi.list(),[{id:7}]); assert.deepEqual(await favoriteApi.add(7),{id:7}); await favoriteApi.remove(7);
 assert.deepEqual(calls,[['/api/yeu-thich','GET','Bearer test-only'],['/api/yeu-thich/7','POST','Bearer test-only'],['/api/yeu-thich/7','DELETE','Bearer test-only']]); storage.clear();
});
