/* 把新版本送到已经装了 App 的手机上。

   以前要发新版，得记得去改 sw.js 里的 CACHE_VERSION —— 忘了改，手机上就
   一直是旧的。就算改了，新版也要等到人完全关掉 App 再重开才会生效，而
   iPhone 上从主屏幕打开的 App 是「切回来」远多于「重新启动」的，所以旧代码
   可以跑上好几天。最后大家只好去清缓存。

   现在页面会在打开时、切回屏幕时、以及使用中每十五分钟，问一次服务器现在
   线上是哪个版本。下面这几个函数决定问到的结果该怎么处理。

   这里只放纯粹的判断，不碰 DOM，也不碰 fetch —— 因为搞错了不会报错，只会
   悄悄给人送旧代码，所以这部分要能单独测。 */

/* 服务器上的 index.html 是不是比页面正在跑的这份新。

   两边都是 index.html 的 Last-Modified，GitHub Pages 每次部署都会更新它：
   正在跑的那份来自 document.lastModified（本地时间，"MM/DD/YYYY hh:mm:ss"），
   线上那份来自 HEAD 请求（HTTP 日期）。两种写法、两个时区，Date.parse 都能
   还原成同一个时刻。

   只有更新的才算 —— 回滚不会被推到手机上 —— 读不出时间的一律当作没有更新。
   差一秒以内也当作同一个版本，免得时间戳的精度差异触发重载。 */
function newerRevision(running, live){
  const a = Date.parse(String(running || '')), b = Date.parse(String(live || ''));
  return isFinite(a) && isFinite(b) && b - a >= 1000;
}

/* 知道线上有新版本之后要做什么。

   apply  — 马上重载：App 刚打开、刚切回来，或者用户自己按了更新，
            这时候没有打断任何事情
   banner — 弹一条「有新版本了」加一个按钮：正在读某一章的人不会被硬拉走
   defer  — App 在后台：等它回到屏幕再说

   「刚刚」是三秒 —— 够覆盖这次检查本身花掉的时间。 */
const JUST_MS = 3000;
function updateAction(s){
  if(s.hidden) return 'defer';
  if(s.asked) return 'apply';
  if(!s.busy && s.sinceVisibleMs <= JUST_MS) return 'apply';
  return 'banner';
}

/* 同一个版本，十分钟内只自动重载一次。

   没有 service worker 接管的时候（无痕浏览、第一次访问），浏览器自己的 HTTP
   缓存在部署后最多十分钟内还会给旧文件（GitHub Pages 发 max-age=600）；这时
   重载会落回旧版本、又看到线上有新的、又重载 —— 停不下来。自动试过一次之后
   就改成弹提示条，而用户自己按的那一下永远放行。 */
const RETRY_MS = 10 * 60e3;
function mayAutoReload(tried, v, now){
  return !(tried && tried.v === v && now - tried.at < RETRY_MS);
}

if(typeof module !== 'undefined') module.exports = {newerRevision, updateAction, mayAutoReload, JUST_MS};
