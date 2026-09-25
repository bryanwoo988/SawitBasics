# Oil Palm Basics · 油棕基础 · Sawit Basics

A trilingual (English / 中文 / Bahasa Melayu) offline-capable PWA for people learning
oil palm plantation work — built for new management executives preparing for
interviews or their first months in the field.

## What is inside

| File | What it does |
|---|---|
| `index.html` | Page shell. Everything else loads from here. |
| `styles.css` | All styling, including dark mode. |
| `data.js` | All content in three languages. **Edit this file to change wording or add topics.** |
| `app.js` | Language switch, dark mode, search, quiz, service worker registration. |
| `sw.js` | Service worker — makes the app work with no signal. |
| `manifest.webmanifest` | App name, colours and icons for "Add to Home Screen". |
| `icons/` | App icons generated from your palm fruit image. |
| `.nojekyll` | Tells GitHub Pages to serve the files as they are. |

## Publishing on GitHub Pages

1. Create a repository, e.g. `oil-palm-basics`.
2. Upload every file and folder in this bundle to the repository root — keep `icons/`
   as a folder, do not flatten it.
3. Go to **Settings → Pages**, set **Source** to `Deploy from a branch`, branch `main`,
   folder `/ (root)`, and save.
4. Wait a minute, then open `https://<your-username>.github.io/oil-palm-basics/`.
5. On your phone, open that link and use the browser menu → **Add to Home Screen**.

All paths are relative (`./`), so the app works from a sub-folder like
`/oil-palm-basics/` without any changes.

## After uploading, check these three URLs

Replace the domain with your own if it differs. All three must work, or the app is
half-broken in ways that are easy to miss.

1. `https://bryanwoo988.github.io/SawitBasics/` — the app itself. If the palm icon next to
   the title shows as a broken square, the `icons/` folder did not upload.
2. `https://bryanwoo988.github.io/SawitBasics/icons/logo.png` — must show the palm fruit.
3. `https://bryanwoo988.github.io/SawitBasics/icons/og-image.png` — must show the palm fruit
   on a dark green square. This is the WhatsApp thumbnail.

GitHub Pages is case-sensitive: `Icons/Logo.png` is not the same file as `icons/logo.png`.
When uploading through the GitHub website, drag the whole `icons` **folder**, not the
files inside it — dragging files individually loses the folder.

## Updating the content later

1. Edit `data.js`. Each item carries `en`, `zh` and `ms` keys — keep all three, or the
   entry will fall back to English.
2. Open `sw.js` and change `CACHE_VERSION` (for example `v1` → `v2`).
   **This step matters.** Phones that already installed the app keep serving the cached
   copy until the version string changes.
3. Commit and push.

## Content sources

- Woittiez, L.S., Haryono, S., Turhina, S., Dani, H., Dukan, T.P., Smit, H. (2016).
  *Smallholder Oil Palm Handbook*, Modules 1–5, 3rd edition. Wageningen University and
  SNV International Development Organisation. Licensed CC BY-NC-SA 3.0.
- MPOB, *Overview of the Malaysian Oil Palm Industry 2025* — planted area, CPO
  production, FFB yield, OER and prices.
- MPOB licensing guidance under the Malaysian Palm Oil Board Act 1998 (Act 582);
  MSPO scheme documents for the MS 2530:2022 series.
- Mill process and by-product figures: AOCS palm oil technical overview and published
  work on palm oil mill by-products and POME.
- Pollinating weevil: published research on the 1981 introduction of
  *Elaeidobius kamerunicus* to Malaysia and its effect on fruit set.

The handbook is CC BY-NC-SA 3.0, so if you publish this app you should keep the
attribution in the footer, use it non-commercially, and share any adaptation under the
same licence.

## Chapters

00 Key numbers · 01 The palm and the plantation · 02 Planting material (dura, pisifera,
tenera) · 03 Harvesting, grading and transport · 04 Plantation maintenance ·
05 Fertiliser and nutrition · 06 Pests and diseases · 07 The mill · 08 Working in
Malaysia (MPOB licence, MSPO, prices) · 09 Glossary · 10 Self-test quiz

## Link previews (WhatsApp, Telegram, LinkedIn)

The `og:` tags in `index.html` control the thumbnail people see when the link is pasted
into a chat. **They use absolute URLs and are hard-coded to
`https://bryanwoo988.github.io/SawitBasics/`.** If you move the site or rename the repo,
edit every `og:url` and `og:image` line in `index.html` — a relative path there will show
no thumbnail at all.

WhatsApp caches a preview per URL for a long time. After changing these tags, test by
pasting the link with a dummy query string, e.g.
`https://bryanwoo988.github.io/SawitBasics/?v=2`. Facebook's Sharing Debugger can also
force a refresh.

## Notes and limits

- Figures such as fertiliser rates are general guides from the handbook. Real rates come
  from leaf and soil analysis and local advice. The app says so in the relevant sections.
- The handbook is written for Indonesian smallholders, so a few points (the government
  FFB price formula, seed certification rules) are Indonesian. Malaysian figures in the
  "Key numbers" section come from MPOB.
- MPOB statistics are updated yearly. When the 2026 overview is published, update the
  2025 figures in `FACTS` inside `data.js`.
- Chapter 08 covers licensing and certification rules that change. Verify against MPOB
  and MSPO before acting on any of it at work, and re-check the chapter each year.

---

## 简要说明

- 三语切换按钮在右上角（EN / 中文 / BM），夜间模式按钮在旁边，选择会自动记住。
- 搜索框可以搜全部内容，包括表格和术语表。
- 修改内容只需改 `data.js`；每条内容都有 `en`、`zh`、`ms` 三种语言。
- **改完内容后，记得把 `sw.js` 里的 `CACHE_VERSION` 改一个新版本号**，否则已经安装到手机上的旧版本不会更新。
- 上传到 GitHub 时，把所有文件放在仓库根目录，`icons/` 要保持文件夹结构。
