/* Oil Palm Basics — service worker

   这里不再有要手动改的版本号。

   以前每改一个文件都得记得把 CACHE_VERSION 往上加一格，忘了的话，已经把
   App 加到主屏幕的人就永远停在旧版本；而且当时是 cache-first，就算记得改，
   新版也要打开两次才看得到 —— 第一次只是偷偷把缓存刷新了。

   现在每个请求都跟服务器核对（network first + no-cache），页面那边靠
   index.html 的 Last-Modified 判断线上是不是有新版本（updatelogic.js）。
   所以这个文件只有在 worker 自己的逻辑要改的时候才需要动。 */

const SHELL = 'opb-shell';

/* App 必须有的文件。图片（fig-*.webp 有八十几张、好几 MB）不放进来：
   装的时候要求一次全部下载成功太脆弱，它们会在被看到时顺手缓存。 */
const SHELL_FILES = [
  './',
  './index.html',
  './styles.css',
  './data.js',
  './figures.js',
  './updatelogic.js',
  './app.js',
  './manifest.webmanifest',
  './qr.svg',
  './logo.png',
  './favicon-32.png',
  './apple-touch-icon.png',
  './icon-192.png',
  './icon-512.png',
  './icon-192-maskable.png',
  './icon-512-maskable.png'
];

/* 等网络等多久才退回缓存。够慢速移动网络赢一次，又不会让断网的人一直对着
   空白页。 */
const NET_TIMEOUT_MS = 2500;

/* 缓存里的键：去掉 query 的 URL。脚本是以 app.js?r=<index.html 的版本> 请求的，
   如果连 query 一起当键，每部署一次就会多存一份所有文件，而离线打开时又只找
   得到「正好是自己那个版本」的那份。 */
function cacheKey(urlString){
  const u = new URL(urlString);
  u.search = '';
  return u.href;
}

/* 自己的文件必须全部缓存成功，否则放弃这次安装。

   容忍单个文件失败的话，信号不好的时候会让一个装了一半的版本上位，并且把
   上一个完整的缓存删掉 —— 下一次在没信号的园里打开，就找不到 app.js 了。
   拒绝安装则会让旧的 worker 和它完整的缓存继续服务，等下一次机会再装。

   'reload' 跳过浏览器自己的 HTTP 缓存：GitHub Pages 允许它存十分钟，足够让
   新 worker 把旧版本的文件装进来。 */
self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(SHELL);
    await c.addAll(SHELL_FILES.map((u) => new Request(u, {cache: 'reload'})));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    /* 以前那些手动编号的缓存（oil-palm-basics-v1…v7）在这里清掉 */
    await Promise.all(keys.filter((k) => k !== SHELL).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

/* 自己的文件一律 network first。

   以前是 cache-first，所以更新要打开两次才生效：第一次只是把缓存刷新了，
   第二次才终于显示出来。人打开一次、没看到任何新东西、于是就在旧版本上待
   好几个星期。现在第一次打开就拿到新代码，缓存退回去当后备。 */
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if(req.method !== 'GET') return;

  const url = new URL(req.url);
  if(url.origin !== self.location.origin) return;

  e.respondWith((async () => {
    const key = cacheKey(req.url);
    const cached = await caches.match(key);

    let timer;
    const timeout = new Promise((r) => { timer = setTimeout(() => r(null), NET_TIMEOUT_MS); });

    /* 'no-cache' 表示每次都问服务器（没变就回 304，所以并不贵）。GitHub Pages
       给每个文件打 max-age=600，普通的 fetch 在那十分钟里可以直接拿浏览器
       缓存里的旧文件回答 —— 那种「network first」其实还是在送旧版本。
       导航请求不能带着 options 重新发，所以改成按 URL 发。 */
    const net = (req.mode === 'navigate'
        ? fetch(req.url, {cache: 'no-cache', credentials: 'same-origin'})
        : fetch(req, {cache: 'no-cache'}))
      .then((res) => {
        if(res && res.ok) caches.open(SHELL).then((c) => c.put(key, res.clone())).catch(() => {});
        return res && res.ok ? res : null;
      })
      .catch(() => null);

    const fresh = await Promise.race([net, timeout]);
    clearTimeout(timer);
    if(fresh) return fresh;
    if(cached) return cached;

    /* 缓存里没有、网络也还没回来：与其在超时那一刻直接失败，不如让慢网络
       把它跑完 */
    const late = await net;
    if(late) return late;

    if(req.mode === 'navigate'){
      const fallback = await caches.match('./index.html');
      if(fallback) return fallback;
    }
    return new Response('Offline', {status: 503, statusText: 'Offline'});
  })());
});
