/* What changed, newest first. Every update adds an entry here; after the
   update the app shows the new entries once (whatsnew.js), and the Settings
   drawer shows the version and opens the whole list. */
const RELEASES = [
  { v: "1.5.0", date: "2026-10-18", notes: {
    en: ["Settings now offers System, Light and Dark modes, four light themes (Classic, Paper, Mint, Lavender) and four dark themes (Midnight, OLED Black, Slate, Grape). In System mode the app uses your chosen light theme when your phone is light and your dark theme when it is dark"],
    zh: ["设置里新增「跟随系统」模式，以及 4 种浅色主题（经典、纸张、薄荷、薰衣草）和 4 种深色主题（午夜、纯黑 OLED、石板、葡萄）。「跟随系统」时，手机为浅色就用你选的浅色主题，为深色就用你选的深色主题"],
    ms: ["Tetapan kini ada mod Sistem, Cerah dan Gelap, empat tema cerah (Klasik, Kertas, Pudina, Lavender) dan empat tema gelap (Tengah Malam, Hitam OLED, Batu Loh, Anggur). Dalam mod Sistem, apl menggunakan tema cerah pilihan anda apabila telefon cerah dan tema gelap apabila telefon gelap"] } },
  { v: "1.4.0", date: "2026-10-14", notes: {
    en: ["Long-press and drag to select just a few words or a sentence, then highlight or underline it, pick a colour, or add a note (as in the Bible app); tap marked words to change the colour, add a note or remove it",
         "Marks on selected words show in the language they were made in (the same sentence uses different words in each language); the Notes list says which language. Tapping a whole paragraph works as before"],
    zh: ["长按并拖动，就能只选一段里的几个字或一句话，给它画荧光笔或下划线、选颜色、加笔记（跟圣经 App 一样）；点一下画过的字可以换颜色、加笔记或移除",
         "选几个字做的画线只会在当时的语言里显示（同一句话在三种语言里字不一样）；「笔记」页会注明是在哪个语言做的。点一下整段标记的方式照旧"],
    ms: ["Tekan lama dan seret untuk memilih beberapa perkataan atau satu ayat sahaja, kemudian serlah atau garis bawah, pilih warna, atau tambah nota (seperti aplikasi Bible); ketik perkataan bertanda untuk tukar warna, tambah nota atau buang",
         "Tanda pada perkataan terpilih dipaparkan dalam bahasa ia dibuat (ayat yang sama menggunakan perkataan berbeza dalam setiap bahasa); senarai Nota menyatakan bahasanya. Ketik seluruh perenggan berfungsi seperti biasa"] } },
  { v: "1.3.1", date: "2026-10-14", notes: {
    en: ["Fixed: on some computers and phones the new bottom menu and the colour tool bar showed without a background and overlapped each other"],
    zh: ["修好：部分电脑和手机上，新的底部菜单和画线工具栏没有底色、叠在一起"],
    ms: ["Dibaiki: pada sesetengah komputer dan telefon, menu bawah baharu dan bar alat warna dipaparkan tanpa latar dan bertindih"] } },
  { v: "1.3.0", date: "2026-10-13", notes: {
    en: ["Highlight or underline any paragraph in five colours: tap it, pick Highlight or Underline, then a colour",
         "Add your own notes and bookmarks to any paragraph; find them all under Notes and Bookmarks",
         "Read aloud: the app reads the text to you from where you are, paragraph by paragraph, with speed and voice in Settings",
         "New menu bar at the bottom of the screen — Contents, Read aloud, Notes, Bookmarks and Settings — easier to reach with your thumb",
         "Language and light/dark mode have moved into Settings; you can also back up your notes there"],
    zh: ["任何段落都可以用荧光笔或下划线标记，有五种颜色：点一下段落，选「荧光笔」或「下划线」，再选颜色",
         "可以在任何段落加笔记和书签；全部集中在底部的「笔记」和「书签」里",
         "朗读：从你正在看的地方开始一段一段读给你听；语速和声音可在「设置」里调整",
         "新的底部菜单栏：目录、朗读、笔记、书签、设置，单手用拇指就按得到",
         "语言和浅色／深色切换移到「设置」里；也可以在那里备份笔记"],
    ms: ["Serlah atau garis bawah mana-mana perenggan dalam lima warna: ketik perenggan, pilih Serlah atau Garis bawah, kemudian warna",
         "Tambah nota dan penanda sendiri pada mana-mana perenggan; semuanya ada di bawah Nota dan Penanda",
         "Baca kuat: aplikasi membacakan teks dari tempat anda berada, perenggan demi perenggan; kelajuan dan suara dalam Tetapan",
         "Bar menu baharu di bawah skrin — Kandungan, Baca kuat, Nota, Penanda dan Tetapan — lebih mudah dicapai dengan ibu jari",
         "Bahasa dan mod cerah/gelap kini dalam Tetapan; anda juga boleh membuat sandaran nota di sana"] } },
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
