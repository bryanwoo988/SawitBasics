const {test} = require('node:test');
const assert = require('node:assert');
const {newerRevision, updateAction, mayAutoReload} = require('../updatelogic.js');

/* ---- 哪个版本是线上的 ----
   用的是 index.html 的 Last-Modified —— GitHub Pages 每次部署都会更新它。
   页面自己那份从 document.lastModified 读（本地时间，"MM/DD/YYYY hh:mm:ss"），
   线上那份从 HEAD 请求读（HTTP 日期格式）。两边写法不同、时区不同，但指的是
   同一个时刻。这样发新版不需要任何人记得去改版本号。 */
const pad = n => String(n).padStart(2, '0');
const docStamp = ms => { const d = new Date(ms);        /* document.lastModified 的样子 */
  return `${pad(d.getMonth() + 1)}/${pad(d.getDate())}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`; };
const httpStamp = ms => new Date(ms).toUTCString();     /* Last-Modified 头的样子 */
const DEPLOY = Date.UTC(2026, 8, 30, 8, 16, 54);

test('同一个版本：不算新（两种写法、时区不同也一样）', () => {
  assert.strictEqual(newerRevision(docStamp(DEPLOY), httpStamp(DEPLOY)), false);
});
test('服务器上的 index.html 比较新：算新', () => {
  assert.strictEqual(newerRevision(docStamp(DEPLOY), httpStamp(DEPLOY + 10 * 60e3)), true);
});
test('服务器上的比较旧（例如回滚）：不自动推给手机', () => {
  assert.strictEqual(newerRevision(docStamp(DEPLOY), httpStamp(DEPLOY - 10 * 60e3)), false);
});
test('读不到时间就不当成新版本', () => {
  assert.strictEqual(newerRevision(docStamp(DEPLOY), null), false);
  assert.strictEqual(newerRevision('', httpStamp(DEPLOY)), false);
  assert.strictEqual(newerRevision(docStamp(DEPLOY), 'garbage'), false);
  assert.strictEqual(newerRevision(undefined, undefined), false);
});
test('只差不到一秒：当成同一个版本，不重载', () => {
  assert.strictEqual(newerRevision(docStamp(DEPLOY), httpStamp(DEPLOY + 400)), false);
});

/* ---- 发现新版本之后要做什么 ----
   更新不应该要人手动刷新或者关掉重开；也不应该在人正在看东西的时候
   把页面从底下抽走。 */
test('刚打开或刚切回 App：直接更新', () => {
  assert.strictEqual(updateAction({hidden:false, sinceVisibleMs:800, busy:false}), 'apply');
});
test('正在用，而且有抽屉／图片／搜索开着：只弹提示条，不打断', () => {
  assert.strictEqual(updateAction({hidden:false, sinceVisibleMs:800, busy:true}), 'banner');
});
test('已经读了一阵子：弹提示条，让他自己决定', () => {
  assert.strictEqual(updateAction({hidden:false, sinceVisibleMs:60000, busy:false}), 'banner');
});
test('App 在后台：等回来再说', () => {
  assert.strictEqual(updateAction({hidden:true, sinceVisibleMs:0, busy:false}), 'defer');
});
test('在后台而且正忙：还是等回来，不越过 hidden', () => {
  assert.strictEqual(updateAction({hidden:true, sinceVisibleMs:0, busy:true}), 'defer');
});
test('用户自己按了「立即更新」：直接更新，不管在忙什么', () => {
  assert.strictEqual(updateAction({hidden:false, sinceVisibleMs:60000, busy:true, asked:true}), 'apply');
});

/* ---- 不可以变成重载死循环 ----
   没有 service worker 接管的时候（无痕浏览、第一次访问），浏览器自己的 HTTP
   缓存在部署后最多十分钟内还会给旧文件（GitHub Pages 发 max-age=600）。
   那样重载会落回旧版本、又发现线上有新版本、又重载 —— 一直转。 */
const T0 = 1790000000000;
const R1 = 'Wed, 30 Sep 2026 08:16:54 GMT', R2 = 'Wed, 30 Sep 2026 09:02:10 GMT';
test('第一次自动更新：可以', () => {
  assert.strictEqual(mayAutoReload(null, R1, T0), true);
});
test('同一个版本十分钟内已经自动试过：不再自动重载', () => {
  assert.strictEqual(mayAutoReload({v:R1, at:T0}, R1, T0 + 60e3), false);
});
test('过了十分钟：可以再试一次', () => {
  assert.strictEqual(mayAutoReload({v:R1, at:T0}, R1, T0 + 11 * 60e3), true);
});
test('又出了一个更新的版本：可以', () => {
  assert.strictEqual(mayAutoReload({v:R1, at:T0}, R2, T0 + 60e3), true);
});
