const {test} = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

/* service worker 在浏览器里是另一个全局环境，而且开发用的那个浏览器根本不让
   注册 worker，所以这里自己搭一个假的 scope 把 sw.js 跑起来。

   要盯住的就是那几件「错了不会报错、只会悄悄送旧代码」的事：装到一半不许
   上位、每个请求都要真的去问服务器、?r=<版本> 不可以在缓存里各存一份。 */

const SW_SRC = fs.readFileSync(path.join(__dirname, '..', 'sw.js'), 'utf8');
const ORIGIN = 'https://bryanwoo988.github.io';
const SCOPE = ORIGIN + '/SawitBasics/';

const res = (body, ok = true) => ({
  ok, status: ok ? 200 : 404, body,
  clone(){ return res(body, ok); }
});

function makeScope(netFor){
  const caches_ = new Map();                       // name -> Map(url -> response)
  const fetched = [];                              // 每次真的发出去的请求

  const cacheObj = (m) => ({
    async addAll(reqs){
      for(const r of reqs){
        const u = typeof r === 'string' ? r : r.url;
        const got = await ctx.fetch(r);
        if(!got || !got.ok) throw new TypeError('addAll failed for ' + u);
        m.set(new URL(u, SCOPE).href, got);
      }
    },
    async put(key, value){ m.set(new URL(key, SCOPE).href, value); }
  });

  const ctx = {
    console,
    URL, TypeError, Promise, setTimeout, clearTimeout,
    /* sw.js 会 new Response(...) 来回 503，所以这个必须能当构造函数用 */
    Response: class { constructor(body, init){ const i = init || {}; this.body = body; this.status = i.status || 200; this.statusText = i.statusText || ''; this.ok = this.status >= 200 && this.status < 300; } clone(){ return this; } },
    Request: class { constructor(url, init){ this.url = new URL(url, SCOPE).href; this.init = init || {}; this.mode = this.init.mode; this.method = 'GET'; } },
    caches: {
      async open(name){
        if(!caches_.has(name)) caches_.set(name, new Map());
        return cacheObj(caches_.get(name));
      },
      async keys(){ return [...caches_.keys()]; },
      async delete(name){ return caches_.delete(name); },
      async match(key){
        const href = new URL(typeof key === 'string' ? key : key.url, SCOPE).href;
        for(const m of caches_.values()) if(m.has(href)) return m.get(href);
        return undefined;
      }
    },
    fetch(req, init){
      const url = typeof req === 'string' ? req : req.url;
      const href = new URL(url, SCOPE).href;
      const opts = init || (req && req.init) || {};
      fetched.push({href, cache: opts.cache});
      return netFor(href, opts);
    },
    self: {
      location: {origin: ORIGIN, href: SCOPE},
      listeners: {},
      addEventListener(type, fn){ (this.listeners[type] ||= []).push(fn); },
      skipWaiting: async () => {},
      clients: {claim: async () => {}}
    }
  };
  ctx.self.self = ctx.self;
  vm.createContext(ctx);
  vm.runInContext(SW_SRC, ctx);
  return {ctx, caches_, fetched};
}

/* 触发一个事件，并把 respondWith / waitUntil 收到的 promise 等完 */
async function fire(ctx, type, event){
  let held = null;
  const e = Object.assign({
    waitUntil(p){ held = p; },
    respondWith(p){ held = p; }
  }, event);
  for(const fn of (ctx.self.listeners[type] || [])) fn(e);
  return held ? await held : undefined;
}

const okNet = () => async (href) => res('fresh:' + href);

/* ---- 安装 ---- */

test('安装：shell 里每个文件都装进缓存，而且是绕过浏览器 HTTP 缓存拿的', async () => {
  const {ctx, caches_, fetched} = makeScope(okNet());
  await fire(ctx, 'install', {});
  const shell = caches_.get('opb-shell');
  assert.ok(shell.size >= 14, '装进去的文件太少：' + shell.size);
  assert.ok(shell.has(SCOPE + 'app.js'), 'app.js 没装进去');
  assert.ok(shell.has(SCOPE + 'updatelogic.js'), 'updatelogic.js 没装进去');
  assert.ok(fetched.every(f => f.cache === 'reload'), '安装时必须用 cache:reload');
});

test('安装：只要有一个文件下载失败，整个安装就要放弃（旧版本继续服务）', async () => {
  const {ctx, caches_} = makeScope(async (href) =>
    href.endsWith('app.js') ? res('', false) : res('ok'));
  await assert.rejects(fire(ctx, 'install', {}), '装到一半竟然算成功了');
  const shell = caches_.get('opb-shell');
  assert.ok(!shell || !shell.has(SCOPE + 'app.js'), '不完整的 app.js 不该留在缓存里');
});

/* ---- 激活 ---- */

test('激活：把以前手动编号的旧缓存清掉，自己这个留着', async () => {
  const {ctx, caches_} = makeScope(okNet());
  await fire(ctx, 'install', {});
  caches_.set('oil-palm-basics-v6', new Map());
  caches_.set('oil-palm-basics-v7', new Map());
  await fire(ctx, 'activate', {});
  assert.deepStrictEqual([...caches_.keys()], ['opb-shell']);
});

/* ---- 取文件 ---- */

const get = (url, mode) => ({method: 'GET', url, mode});

test('有网：拿服务器上的新文件，而且每次都真的去问（no-cache）', async () => {
  const {ctx, fetched} = makeScope(okNet());
  const out = await fire(ctx, 'fetch', {request: get(SCOPE + 'app.js')});
  assert.strictEqual(out.body, 'fresh:' + SCOPE + 'app.js');
  assert.ok(fetched.some(f => f.cache === 'no-cache'), '没有绕开浏览器缓存');
});

test('?r=<版本> 不会在缓存里各存一份：两个版本共用同一个条目', async () => {
  const {ctx, caches_} = makeScope(okNet());
  await fire(ctx, 'fetch', {request: get(SCOPE + 'app.js?r=09%2F30%2F2026')});
  await fire(ctx, 'fetch', {request: get(SCOPE + 'app.js?r=10%2F01%2F2026')});
  const shell = caches_.get('opb-shell');
  assert.strictEqual(shell.size, 1, '每个版本各存了一份');
  assert.ok(shell.has(SCOPE + 'app.js'), '缓存的键没有把 ?r= 去掉');
});

test('断网：退回缓存里的那份，App 照样打得开', async () => {
  const {ctx} = makeScope(okNet());
  await fire(ctx, 'install', {});
  ctx.fetch = async () => { throw new Error('offline'); };
  const out = await fire(ctx, 'fetch', {request: get(SCOPE + 'app.js')});
  assert.strictEqual(out.body, 'fresh:' + SCOPE + 'app.js');
});

test('断网时打开一个没缓存过的页面：退回 index.html，不是错误页', async () => {
  const {ctx} = makeScope(okNet());
  await fire(ctx, 'install', {});
  ctx.fetch = async () => { throw new Error('offline'); };
  const out = await fire(ctx, 'fetch', {request: get(SCOPE + 'some/deep/link', 'navigate')});
  assert.strictEqual(out.body, 'fresh:' + SCOPE + 'index.html');
});

test('全都拿不到：给一个 503，而不是卡住', async () => {
  const {ctx} = makeScope(async () => { throw new Error('offline'); });
  const out = await fire(ctx, 'fetch', {request: get(SCOPE + 'never-seen.webp')});
  assert.strictEqual(out.status, 503);
});

test('别人家的域名不插手', async () => {
  const {ctx} = makeScope(okNet());
  const out = await fire(ctx, 'fetch', {request: get('https://example.com/x.js')});
  assert.strictEqual(out, undefined);
});

test('POST 之类的不插手', async () => {
  const {ctx} = makeScope(okNet());
  const out = await fire(ctx, 'fetch', {request: {method: 'POST', url: SCOPE + 'app.js'}});
  assert.strictEqual(out, undefined);
});
