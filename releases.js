/* What changed, newest first. Every update adds an entry here; after the
   update the app shows the new entries once (whatsnew.js), and the About
   sheet shows the version and opens the whole list. */
const RELEASES = [
  { v: "1.2.0", date: "2026-10-13", notes: {
    en: ["About & share shows the date and time of this update next to the version"],
    zh: ["「关于与分享」里的版本号旁边会显示这一版的更新日期和时间"],
    ms: ["Perihal & kongsi menunjukkan tarikh dan masa kemas kini ini di sebelah versi"] } },
  { v: "1.1.0", date: "2026-10-13", notes: {
    en: ["After an update the app now shows what changed: the version, the date and what is new; the full list is in About & share"],
    zh: ["App 更新后会自动弹出「更新了什么」：版本号、日期和改动内容；在「关于与分享」里可以随时查看全部更新记录"],
    ms: ["Selepas kemas kini, aplikasi kini menunjukkan apa yang berubah: versi, tarikh dan perkara baharu; senarai penuh ada dalam Perihal & kongsi"] } },
  { v: "1.0.0", date: "2026-09-30", notes: {
    en: ["Share the app with a QR code, choose a language on first launch, and updates arrive by themselves"],
    zh: ["可以用二维码分享 App，第一次打开时选择语言，新版本会自动更新"],
    ms: ["Kongsi aplikasi dengan kod QR, pilih bahasa semasa kali pertama dibuka, dan kemas kini sampai dengan sendirinya"] } },
];
const APP_VERSION = RELEASES[0].v;
