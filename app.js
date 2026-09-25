/* Oil Palm Basics — app logic */

const LANGS = ["en", "zh", "ms"];
const HTML_LANG = { en: "en", zh: "zh-Hans", ms: "ms" };

let lang = localStorage.getItem("opb-lang");
if (!LANGS.includes(lang)) lang = "en";

let theme = localStorage.getItem("opb-theme");
if (theme !== "light" && theme !== "dark") {
  theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/* a value may be a plain string (same in every language) or a {en,zh,ms} object */
const T = (v) => (v == null ? "" : typeof v === "string" ? v : (v[lang] ?? v.en ?? ""));

const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
};

const LBL = {
  contents: { en: "Contents", zh: "目录", ms: "Kandungan" },
  keyNumbers: { en: "Numbers to know by heart", zh: "必须记住的数字", ms: "Angka yang perlu dihafal" },
  keyNumbersShort: { en: "Key numbers", zh: "关键数字", ms: "Angka utama" },
  keyNumbersBlurb: { en: "The figures that come up in every interview and every morning muster.",
                     zh: "面试和每天早会上都会用到的数字。",
                     ms: "Angka yang muncul dalam setiap temu duga dan perhimpunan pagi." },
  glossary: { en: "Glossary", zh: "术语表", ms: "Glosari" },
  glossaryBlurb: { en: "Each term in all three languages, because the muster ground mixes them freely.",
                   zh: "每个术语都给出三种语言，因为工地上本来就是混着说的。",
                   ms: "Setiap istilah dalam tiga bahasa, kerana di ladang ketiga-tiganya bercampur." },
  sources: { en: "Sources", zh: "参考来源", ms: "Sumber rujukan" },
  sourcesBlurb: { en: "Every book, dataset and paper this app actually draws on, and what each one was used for.",
                  zh: "本 App 真正用到的每一本教材、每一份数据和论文，以及各自用在哪里。",
                  ms: "Setiap buku, data dan kajian yang benar-benar digunakan, dan untuk apa." },
  usedFor: { en: "Used for", zh: "用于", ms: "Digunakan untuk" },
  quiz: { en: "Test yourself", zh: "自我测验", ms: "Uji diri" },
  quizBlurb: { en: "Questions of the kind an interviewer actually asks.",
               zh: "面试官真的会问的那种题。",
               ms: "Soalan yang memang ditanya penemu duga." },
  fieldNote: { en: "Field note", zh: "田间提示", ms: "Nota ladang" },
  careful: { en: "Careful", zh: "注意", ms: "Awas" },
  photo: { en: "Photo", zh: "图片来源", ms: "Foto" },
  noHits: { en: "No match. Try a shorter word, or an English term — many field words are English in all three languages.",
            zh: "没有找到。试试更短的词，或用英文——很多田间术语三种语言都说英文。",
            ms: "Tiada padanan. Cuba perkataan lebih pendek, atau istilah Inggeris." },
  close: { en: "Close", zh: "关闭", ms: "Tutup" },
  openToc: { en: "Open contents", zh: "打开目录", ms: "Buka kandungan" }
};

const CHEV = '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';
const MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
const SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>';

/* ---------------- theme ---------------- */

function applyTheme() {
  document.documentElement.setAttribute("data-theme", theme);
  const meta = $('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme === "dark" ? "#0d1511" : "#f1f4ec");
  const btn = $("#themeBtn");
  if (btn) btn.innerHTML = theme === "dark" ? SUN : MOON;
}

/* ---------------- figures ---------------- */

function figureEl(f) {
  const fig = el("figure", "fig");
  const img = el("img");
  img.src = "./" + f.src;
  img.width = f.w;
  img.height = f.h;
  img.loading = "lazy";
  img.decoding = "async";
  img.alt = T(f.cap);
  img.addEventListener("click", () => openLightbox(f));
  fig.appendChild(img);
  const cap = el("figcaption", null, T(f.cap));
  if (f.credit) cap.appendChild(el("span", "credit", " " + T(LBL.photo) + ": " + f.credit));
  fig.appendChild(cap);
  return fig;
}

function figuresFor(key) {
  const list = (typeof FIGURES !== "undefined" && FIGURES[key]) || [];
  if (!list.length) return null;
  const wrap = el("div", "figs");
  list.filter((f) => f.full).forEach((f) => wrap.appendChild(figureEl(f)));
  const rest = list.filter((f) => !f.full);
  if (rest.length) {
    const grid = el("div", rest.length === 1 ? "fig-grid one" : "fig-grid");
    rest.forEach((f) => grid.appendChild(figureEl(f)));
    wrap.appendChild(grid);
  }
  return wrap;
}

function openLightbox(f) {
  const box = $("#lightbox");
  box.innerHTML = "";
  const inner = el("div", "lb-inner");
  const img = el("img");
  img.src = "./" + f.src;
  img.alt = T(f.cap);
  inner.appendChild(img);
  inner.appendChild(el("div", "lb-cap",
    T(f.cap) + (f.credit ? "  ·  " + T(LBL.photo) + ": " + f.credit : "")));
  box.appendChild(inner);
  const close = el("button", "lb-close", "\u00d7");
  close.setAttribute("aria-label", T(LBL.close));
  box.appendChild(close);
  box.classList.add("open");
  document.body.classList.add("locked");
  close.focus();
}

function closeLightbox() {
  $("#lightbox").classList.remove("open");
  document.body.classList.remove("locked");
}

/* ---------------- content blocks ---------------- */

function renderBlock(b) {
  if (b.t === "p") return el("p", null, T(b.v));
  if (b.t === "h") return el("h4", null, T(b.v));

  if (b.t === "ul" || b.t === "ol") {
    const list = el("ul", b.t === "ol" ? "steps" : null);
    (T(b.v) || []).forEach((item) => list.appendChild(el("li", null, item)));
    return list;
  }

  if (b.t === "tip" || b.t === "warn") {
    const box = el("div", b.t === "warn" ? "callout warn" : "callout");
    box.appendChild(el("span", "lab", T(b.t === "warn" ? LBL.careful : LBL.fieldNote)));
    box.appendChild(document.createTextNode(T(b.v)));
    return box;
  }

  if (b.t === "note") return el("p", "table-note", T(b.v));

  if (b.t === "table") {
    const wrap = el("div", "tablewrap");
    const table = el("table");
    const thead = el("thead");
    const hr = el("tr");
    T(b.head).forEach((cell, i) => hr.appendChild(el("th", i > 0 ? "num" : null, cell)));
    thead.appendChild(hr);
    table.appendChild(thead);
    const tbody = el("tbody");
    b.rows.forEach((row) => {
      const tr = el("tr");
      row.forEach((cell, i) => {
        const text = T(cell);
        tr.appendChild(el("td", i > 0 && text.length <= 14 ? "num" : null, text));
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    wrap.appendChild(table);
    return wrap;
  }

  return el("p", null, "");
}

/* ---------------- sections ---------------- */

function sectionShell(id, num, title, blurb) {
  const sec = el("section", "section");
  sec.id = id;
  sec.dataset.sec = id;
  const head = el("div", "section-head");
  head.appendChild(el("span", "section-num", num));
  head.appendChild(el("h2", null, title));
  sec.appendChild(head);
  if (blurb) sec.appendChild(el("p", "section-blurb", blurb));
  return sec;
}

function renderFacts() {
  const sec = sectionShell("numbers", "00", T(LBL.keyNumbers), T(LBL.keyNumbersBlurb));
  FACTS.forEach((g) => {
    sec.appendChild(el("h3", "facts-group-title", T(g.group)));
    const grid = el("div", "facts");
    g.items.forEach((f) => {
      const card = el("div", "fact");
      card.appendChild(el("div", "k", T(f.k)));
      const val = T(f.v);
      card.appendChild(el("div", val.length > 26 ? "v long" : "v", val));
      if (f.n) card.appendChild(el("div", "n", T(f.n)));
      grid.appendChild(card);
    });
    sec.appendChild(grid);
  });
  return sec;
}

function renderChapter(ch) {
  const sec = sectionShell(ch.id, ch.num, T(ch.title), T(ch.blurb));
  const topics = el("div", "topics");
  ch.topics.forEach((tp) => {
    const key = ch.id + "/" + tp.id;
    const d = el("details", "topic");
    d.id = "t-" + ch.id + "-" + tp.id;
    d.dataset.topic = key;

    const s = el("summary", "topic-head");
    s.appendChild(el("span", null, T(tp.title)));
    s.insertAdjacentHTML("beforeend", CHEV);
    d.appendChild(s);

    const body = el("div", "topic-body");
    tp.body.forEach((b) => body.appendChild(renderBlock(b)));
    const figs = figuresFor(key);
    if (figs) body.appendChild(figs);
    d.appendChild(body);
    topics.appendChild(d);
  });
  sec.appendChild(topics);
  return sec;
}

function renderGlossary() {
  const sec = sectionShell("glossary", "09", T(LBL.glossary), T(LBL.glossaryBlurb));
  const wrap = el("div", "gloss");
  GLOSSARY.forEach((g) => {
    const card = el("div", "gterm");
    const heads = el("div", "heads");
    const all = { en: g.en, zh: g.zh, ms: g.ms };
    heads.appendChild(el("span", "en", all[lang]));
    heads.appendChild(el("span", "alt", LANGS.filter((x) => x !== lang).map((x) => all[x]).join("  ·  ")));
    card.appendChild(heads);
    card.appendChild(el("div", "def", T(g.def)));
    wrap.appendChild(card);
  });
  sec.appendChild(wrap);
  return sec;
}

function renderSources() {
  const sec = sectionShell("sources", "10", T(LBL.sources), T(LBL.sourcesBlurb));
  if (typeof SOURCES === "undefined") return sec;
  SOURCES.forEach((g) => {
    sec.appendChild(el("h3", "facts-group-title", T(g.group)));
    if (g.note) sec.appendChild(el("p", "src-note", T(g.note)));
    const wrap = el("div", "gloss");
    g.items.forEach((it) => {
      const card = el("div", "gterm");
      card.appendChild(el("div", "src-title", it.title));
      const d = el("div", "def");
      d.appendChild(el("span", "src-lab", T(LBL.usedFor) + ": "));
      d.appendChild(document.createTextNode(T(it.used)));
      card.appendChild(d);
      if (it.url) {
        const a = el("a", "src-link", it.url);
        a.href = it.url;
        a.target = "_blank";
        a.rel = "noopener";
        card.appendChild(a);
      }
      wrap.appendChild(card);
    });
    sec.appendChild(wrap);
  });
  return sec;
}

let quizState = [];

function renderQuiz() {
  const sec = sectionShell("quiz", "11", T(LBL.quiz), T(LBL.quizBlurb));
  const bar = el("div", "quiz-bar");
  const score = el("span", "score");
  bar.appendChild(score);
  const reset = el("button", "btn", T(UI.quizReset));
  reset.addEventListener("click", () => {
    quizState = QUIZ.map(() => null);
    refreshQuiz();
    document.getElementById("quiz").scrollIntoView({ behavior: "smooth", block: "start" });
  });
  bar.appendChild(reset);
  sec.appendChild(bar);

  const wrap = el("div", "quiz");
  QUIZ.forEach((q, qi) => {
    const card = el("div", "qcard");
    card.appendChild(el("div", "q", (qi + 1) + ". " + T(q.q)));
    const opts = el("div", "opts");
    const answered = quizState[qi] !== null && quizState[qi] !== undefined;
    q.o.forEach((o, oi) => {
      const b = el("button", "opt", T(o));
      if (answered) {
        b.disabled = true;
        if (oi === q.a) b.classList.add("right");
        else if (oi === quizState[qi]) b.classList.add("wrong");
      }
      b.addEventListener("click", () => {
        if (quizState[qi] !== null && quizState[qi] !== undefined) return;
        quizState[qi] = oi;
        refreshQuiz();
      });
      opts.appendChild(b);
    });
    card.appendChild(opts);
    if (answered) card.appendChild(el("div", "why", T(UI.why) + ": " + T(q.why)));
    wrap.appendChild(card);
  });
  sec.appendChild(wrap);

  const done = quizState.filter((v) => v !== null && v !== undefined).length;
  const right = quizState.filter((v, i) => v === QUIZ[i].a).length;
  score.textContent = T(UI.quizScore) + ": " + right + " / " + done;
  return sec;
}

function refreshQuiz() {
  const old = document.getElementById("quiz");
  if (!old) return;
  const fresh = renderQuiz();
  old.replaceWith(fresh);
  if (observer) observer.observe(fresh);
}

/* ---------------- table of contents ---------------- */

function tocEntries() {
  const out = [{ id: "numbers", num: "00", label: T(LBL.keyNumbersShort), topics: [] }];
  CHAPTERS.forEach((c) => {
    out.push({
      id: c.id,
      num: c.num,
      label: T(c.title),
      topics: c.topics.map((t) => ({ id: "t-" + c.id + "-" + t.id, label: T(t.title) }))
    });
  });
  out.push({ id: "glossary", num: "09", label: T(LBL.glossary), topics: [] });
  out.push({ id: "sources", num: "10", label: T(LBL.sources), topics: [] });
  out.push({ id: "quiz", num: "11", label: T(LBL.quiz), topics: [] });
  return out;
}

function buildToc(root, onNavigate) {
  root.innerHTML = "";
  tocEntries().forEach((e) => {
    const item = el("div", "toc-item");
    item.dataset.target = e.id;

    const head = el("a", "toc-chapter");
    head.href = "#" + e.id;
    head.appendChild(el("span", "toc-num", e.num));
    head.appendChild(el("span", "toc-label", e.label));
    head.addEventListener("click", (ev) => {
      ev.preventDefault();
      jumpTo(e.id);
      if (onNavigate) onNavigate();
    });
    item.appendChild(head);

    if (e.topics.length) {
      const sub = el("div", "toc-subs");
      e.topics.forEach((t) => {
        const a = el("a", "toc-sub", t.label);
        a.href = "#" + t.id;
        a.addEventListener("click", (ev) => {
          ev.preventDefault();
          jumpTo(t.id, true);
          if (onNavigate) onNavigate();
        });
        sub.appendChild(a);
      });
      item.appendChild(sub);
    }
    root.appendChild(item);
  });
}

function jumpTo(id, openIt) {
  const node = document.getElementById(id);
  if (!node) return;
  if (openIt && node.tagName === "DETAILS") node.open = true;
  node.scrollIntoView({ behavior: "smooth", block: "start" });
  if (openIt) {
    node.classList.add("flash");
    setTimeout(() => node.classList.remove("flash"), 1500);
  }
}

function openToc() {
  $("#tocSheet").classList.add("open");
  document.body.classList.add("locked");
}
function closeToc() {
  $("#tocSheet").classList.remove("open");
  document.body.classList.remove("locked");
}

/* ---------------- search ---------------- */

let index = [];
let activeHit = -1;

/* readable text for search snippets: join block elements with spaces so
   table cells and list items do not run together */
function plainText(root) {
  if (!root) return "";
  const parts = $$("p, li, td, th, h4, figcaption, .lab", root).map((n) => n.textContent.trim());
  return parts.filter(Boolean).join(" · ").replace(/\s+/g, " ");
}

function buildIndex() {
  index = [];
  CHAPTERS.forEach((c) => {
    c.topics.forEach((t) => {
      const node = document.getElementById("t-" + c.id + "-" + t.id);
      if (!node) return;
      index.push({
        id: node.id, kind: "topic", title: T(t.title), where: T(c.title),
        text: plainText(node.querySelector(".topic-body"))
      });
    });
  });
  $$("#numbers .fact").forEach((card) => {
    const parts = $$(".k, .v, .n", card).map((n) => n.textContent.trim());
    index.push({
      id: "numbers", kind: "fact",
      title: parts[0] + " — " + parts[1],
      where: T(LBL.keyNumbersShort),
      text: parts.join(" · ")
    });
  });
  $$("#glossary .gterm").forEach((card) => {
    const parts = $$(".en, .alt, .def", card).map((n) => n.textContent.trim());
    index.push({
      id: "glossary", kind: "term", title: parts[0],
      where: T(LBL.glossary), text: parts.join(" · ")
    });
  });
}

function snippet(text, q) {
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i === -1) return text.slice(0, 90);
  const from = Math.max(0, i - 35);
  return (from > 0 ? "…" : "") + text.slice(from, from + 110).trim() + "…";
}

/* the panel is fixed, so place it under the input every time it opens —
   a sticky header with a blur filter cannot clip or cover it */
function placeHits() {
  const panel = $("#hits");
  if (!panel.classList.contains("open")) return;
  const box = $("#search").getBoundingClientRect();
  panel.style.top = (box.bottom + 7) + "px";
  panel.style.left = box.left + "px";
  panel.style.width = Math.max(box.width, Math.min(480, window.innerWidth - box.left - 14)) + "px";
  panel.style.maxHeight = Math.max(180, window.innerHeight - box.bottom - 24) + "px";
}

function search(q) {
  const panel = $("#hits");
  panel.innerHTML = "";
  activeHit = -1;
  if (!q) { panel.classList.remove("open"); return; }

  const needle = q.toLowerCase();
  const scored = [];
  index.forEach((e) => {
    const inTitle = e.title.toLowerCase().indexOf(needle);
    const inText = e.text.toLowerCase().indexOf(needle);
    if (inTitle === -1 && inText === -1) return;
    scored.push({ e, score: inTitle !== -1 ? inTitle : 1000 + inText });
  });
  scored.sort((a, b) => a.score - b.score);

  if (!scored.length) {
    panel.appendChild(el("div", "hit-empty", T(LBL.noHits)));
    panel.classList.add("open");
    placeHits();
    return;
  }

  scored.slice(0, 12).forEach(({ e }) => {
    const row = el("button", "hit");
    row.type = "button";
    const top = el("div", "hit-top");
    top.appendChild(el("span", "hit-title", e.title));
    top.appendChild(el("span", "hit-where", e.where));
    row.appendChild(top);
    row.appendChild(el("div", "hit-snip", snippet(e.text, q)));
    row.addEventListener("click", () => {
      closeSearch();
      jumpTo(e.id, e.kind === "topic");
      if (e.kind === "topic") markMatches(document.getElementById(e.id), q);
      else clearMarks();
    });
    panel.appendChild(row);
  });
  panel.classList.add("open");
  placeHits();
}

function clearMarks() {
  $$("mark.hit-mark").forEach((m) => {
    const parent = m.parentNode;
    parent.replaceChild(document.createTextNode(m.textContent), m);
    parent.normalize();
  });
}

function markMatches(root, q) {
  clearMarks();
  if (!root || !q) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) =>
      n.parentNode && n.parentNode.nodeName !== "MARK" && n.nodeValue.trim()
        ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  const lower = q.toLowerCase();
  nodes.forEach((node) => {
    const text = node.nodeValue;
    let i = text.toLowerCase().indexOf(lower);
    if (i === -1) return;
    const frag = document.createDocumentFragment();
    let pos = 0;
    while (i !== -1) {
      frag.appendChild(document.createTextNode(text.slice(pos, i)));
      frag.appendChild(el("mark", "hit-mark", text.slice(i, i + q.length)));
      pos = i + q.length;
      i = text.toLowerCase().indexOf(lower, pos);
    }
    frag.appendChild(document.createTextNode(text.slice(pos)));
    node.parentNode.replaceChild(frag, node);
  });
}

function closeSearch() {
  $("#hits").classList.remove("open");
  $("#search").blur();
}

function moveHit(step) {
  const rows = $$("#hits .hit");
  if (!rows.length) return;
  activeHit = (activeHit + step + rows.length) % rows.length;
  rows.forEach((r, i) => r.classList.toggle("active", i === activeHit));
  rows[activeHit].scrollIntoView({ block: "nearest" });
}

/* ---------------- scroll spy ---------------- */

let observer = null;

function observeSections() {
  if (observer) observer.disconnect();
  observer = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const id = e.target.dataset.sec;
      $$(".toc-item").forEach((n) => n.classList.toggle("current", n.dataset.target === id));
    });
  }, { rootMargin: "-130px 0px -62% 0px", threshold: 0 });
  $$("#content .section").forEach((s) => observer.observe(s));
}

/* ---------------- render ---------------- */

function render() {
  const open = new Set($$("details.topic[open]").map((d) => d.dataset.topic));

  document.documentElement.lang = HTML_LANG[lang];
  document.title = T(UI.title) + " · " + T(UI.sub);

  $("#brandTitle").textContent = T(UI.title);
  $("#brandSub").textContent = T(UI.sub);
  $("#search").placeholder = T(UI.search);
  $("#clearBtn").setAttribute("aria-label", T(UI.clear));
  $("#themeBtn").setAttribute("aria-label", T(UI.theme));
  $("#tocBtn").setAttribute("aria-label", T(LBL.openToc));
  $("#tocTitle").textContent = T(LBL.contents);
  $("#tocClose").setAttribute("aria-label", T(LBL.close));
  $("#railTitle").textContent = T(LBL.contents);
  const NEXT = { en: "中文", zh: "BM", ms: "EN" };
  const NAME = { en: "English", zh: "中文", ms: "Bahasa Melayu" };
  $("#langNow").textContent = { en: "EN", zh: "中文", ms: "BM" }[lang];
  $("#langBtn").setAttribute("aria-label", T(UI.lang) + ": " + NAME[lang]);
  $("#langBtn").title = NAME[lang] + " → " + NEXT[lang];

  $("#heroH").textContent = T(UI.heroH);
  $("#heroP").textContent = T(UI.heroP);
  $("#heroMeta").textContent = T(UI.heroMeta);
  $("#footText").textContent = T(UI.footer);
  $("#installHint").textContent = T(UI.install);

  const main = $("#content");
  main.innerHTML = "";
  main.appendChild(renderFacts());
  CHAPTERS.forEach((c) => main.appendChild(renderChapter(c)));
  main.appendChild(renderGlossary());
  main.appendChild(renderSources());
  main.appendChild(renderQuiz());

  $$("details.topic").forEach((d) => { if (open.has(d.dataset.topic)) d.open = true; });

  buildToc($("#railToc"), null);
  buildToc($("#sheetToc"), closeToc);
  buildIndex();
  observeSections();

  const q = $("#search").value.trim();
  if (q) search(q);
}

/* ---------------- wiring ---------------- */

function init() {
  quizState = QUIZ.map(() => null);
  applyTheme();

  $("#themeBtn").addEventListener("click", () => {
    theme = theme === "dark" ? "light" : "dark";
    localStorage.setItem("opb-theme", theme);
    applyTheme();
  });

  $("#langBtn").addEventListener("click", () => {
    lang = LANGS[(LANGS.indexOf(lang) + 1) % LANGS.length];
    localStorage.setItem("opb-lang", lang);
    render();
  });

  $("#tocBtn").addEventListener("click", openToc);
  $("#tocClose").addEventListener("click", closeToc);
  $("#tocSheet").addEventListener("click", (e) => { if (e.target.id === "tocSheet") closeToc(); });

  let debounce;
  const input = $("#search");
  input.addEventListener("input", () => {
    const val = input.value.trim();
    $("#clearBtn").classList.toggle("hidden", !val);
    clearTimeout(debounce);
    debounce = setTimeout(() => search(val), 120);
  });
  input.addEventListener("focus", () => { if (input.value.trim()) search(input.value.trim()); });
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); moveHit(1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); moveHit(-1); }
    else if (e.key === "Enter") {
      const rows = $$("#hits .hit");
      if (rows.length) { e.preventDefault(); (rows[activeHit] || rows[0]).click(); }
    } else if (e.key === "Escape") { closeSearch(); }
  });

  $("#clearBtn").addEventListener("click", () => {
    input.value = "";
    $("#clearBtn").classList.add("hidden");
    clearMarks();
    search("");
    input.focus();
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".searchwrap")) $("#hits").classList.remove("open");
  });

  window.addEventListener("resize", placeHits);
  window.addEventListener("scroll", placeHits, { passive: true });

  $("#lightbox").addEventListener("click", closeLightbox);
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if ($("#lightbox").classList.contains("open")) closeLightbox();
    else if ($("#tocSheet").classList.contains("open")) closeToc();
  });

  render();

  if (!window.matchMedia("(display-mode: standalone)").matches) {
    $("#installHint").classList.add("show");
  }
}

document.addEventListener("DOMContentLoaded", init);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}
