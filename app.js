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

/* pick the right language out of a value that may be a plain string */
const T = (v) => (v == null ? "" : typeof v === "string" ? v : (v[lang] ?? v.en ?? ""));

const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
};

const CHEV = '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';

/* ---------------- theme ---------------- */

function applyTheme() {
  document.documentElement.setAttribute("data-theme", theme);
  const meta = $('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme === "dark" ? "#0d1511" : "#f1f4ec");
  const btn = $("#themeBtn");
  if (btn) btn.innerHTML = theme === "dark" ? SUN : MOON;
}

const MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
const SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>';

/* ---------------- block renderers ---------------- */

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
    const lab = el("span", "lab", b.t === "warn"
      ? { en: "Careful", zh: "注意", ms: "Awas" }[lang]
      : { en: "Field note", zh: "田间提示", ms: "Nota ladang" }[lang]);
    box.appendChild(lab);
    box.appendChild(document.createTextNode(T(b.v)));
    return box;
  }

  if (b.t === "note") return el("p", "table-note", T(b.v));

  if (b.t === "table") {
    const wrap = el("div", "tablewrap");
    const table = el("table");
    const thead = el("thead");
    const hr = el("tr");
    T(b.head).forEach((cell, i) => {
      const th = el("th", i > 0 ? "num" : null, cell);
      hr.appendChild(th);
    });
    thead.appendChild(hr);
    table.appendChild(thead);

    const tbody = el("tbody");
    b.rows.forEach((row) => {
      const tr = el("tr");
      row.forEach((cell, i) => {
        const text = T(cell);
        const short = text.length <= 14;
        tr.appendChild(el("td", i > 0 && short ? "num" : null, text));
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

function renderFacts() {
  const sec = el("section", "section");
  sec.id = "numbers";
  sec.dataset.sec = "numbers";

  const head = el("div", "section-head");
  head.appendChild(el("span", "section-num", "00"));
  head.appendChild(el("h2", null, { en: "Numbers to know by heart", zh: "必须记住的数字", ms: "Angka yang perlu dihafal" }[lang]));
  sec.appendChild(head);
  sec.appendChild(el("p", "section-blurb",
    { en: "The figures that come up in every interview and every morning muster.",
      zh: "面试和每天早会上都会用到的数字。",
      ms: "Angka yang muncul dalam setiap temu duga dan perhimpunan pagi." }[lang]));

  FACTS.forEach((g) => {
    sec.appendChild(el("h3", "facts-group-title", T(g.group)));
    const grid = el("div", "facts");
    g.items.forEach((f) => {
      const card = el("div", "fact searchable");
      card.appendChild(el("div", "k", T(f.k)));
      card.appendChild(el("div", "v", T(f.v)));
      if (f.n) card.appendChild(el("div", "n", T(f.n)));
      grid.appendChild(card);
    });
    sec.appendChild(grid);
  });
  return sec;
}

function renderChapter(ch) {
  const sec = el("section", "section");
  sec.id = ch.id;
  sec.dataset.sec = ch.id;

  const head = el("div", "section-head");
  head.appendChild(el("span", "section-num", ch.num));
  head.appendChild(el("h2", null, T(ch.title)));
  sec.appendChild(head);
  sec.appendChild(el("p", "section-blurb", T(ch.blurb)));

  const topics = el("div", "topics");
  ch.topics.forEach((tp) => {
    const d = el("details", "topic searchable");
    d.dataset.topic = ch.id + "/" + tp.id;

    const s = el("summary", "topic-head");
    s.appendChild(el("span", null, T(tp.title)));
    s.insertAdjacentHTML("beforeend", CHEV);
    d.appendChild(s);

    const body = el("div", "topic-body");
    tp.body.forEach((b) => body.appendChild(renderBlock(b)));
    d.appendChild(body);
    topics.appendChild(d);
  });
  sec.appendChild(topics);
  return sec;
}

function renderGlossary() {
  const sec = el("section", "section");
  sec.id = "glossary";
  sec.dataset.sec = "glossary";

  const head = el("div", "section-head");
  head.appendChild(el("span", "section-num", "09"));
  head.appendChild(el("h2", null, { en: "Glossary", zh: "术语表", ms: "Glosari" }[lang]));
  sec.appendChild(head);
  sec.appendChild(el("p", "section-blurb",
    { en: "Each term in all three languages, because the muster ground mixes them freely.",
      zh: "每个术语都给出三种语言，因为工地上本来就是混着说的。",
      ms: "Setiap istilah dalam tiga bahasa, kerana di ladang ketiga-tiganya bercampur." }[lang]));

  const wrap = el("div", "gloss");
  GLOSSARY.forEach((g) => {
    const card = el("div", "gterm searchable");
    const heads = el("div", "heads");
    const primary = { en: g.en, zh: g.zh, ms: g.ms }[lang];
    const others = LANGS.filter((l) => l !== lang).map((l) => ({ en: g.en, zh: g.zh, ms: g.ms }[l]));
    heads.appendChild(el("span", "en", primary));
    heads.appendChild(el("span", "alt", others.join("  ·  ")));
    card.appendChild(heads);
    card.appendChild(el("div", "def", T(g.def)));
    wrap.appendChild(card);
  });
  sec.appendChild(wrap);
  return sec;
}

let quizState = [];

function renderQuiz() {
  const sec = el("section", "section");
  sec.id = "quiz";
  sec.dataset.sec = "quiz";

  const head = el("div", "section-head");
  head.appendChild(el("span", "section-num", "10"));
  head.appendChild(el("h2", null, { en: "Test yourself", zh: "自我测验", ms: "Uji diri" }[lang]));
  sec.appendChild(head);
  sec.appendChild(el("p", "section-blurb",
    { en: "Questions of the kind an interviewer actually asks.",
      zh: "面试官真的会问的那种题。",
      ms: "Soalan yang memang ditanya penemu duga." }[lang]));

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

  const updateScore = () => {
    const done = quizState.filter((v) => v !== null).length;
    const right = quizState.filter((v, i) => v === QUIZ[i].a).length;
    score.textContent = `${T(UI.quizScore)}: ${right} / ${done || 0}`;
  };

  const wrap = el("div", "quiz");
  QUIZ.forEach((q, qi) => {
    const card = el("div", "qcard searchable");
    card.appendChild(el("div", "q", `${qi + 1}. ${T(q.q)}`));
    const opts = el("div", "opts");
    q.o.forEach((o, oi) => {
      const b = el("button", "opt", T(o));
      const answered = quizState[qi] !== null && quizState[qi] !== undefined;
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
    if (quizState[qi] !== null && quizState[qi] !== undefined) {
      const why = el("div", "why", `${T(UI.why)}: ${T(q.why)}`);
      card.appendChild(why);
    }
    wrap.appendChild(card);
  });
  sec.appendChild(wrap);
  updateScore();
  return sec;
}

/* replace only the quiz section, so answering does not reset scroll */
function refreshQuiz() {
  const old = document.getElementById("quiz");
  if (!old) return;
  const fresh = renderQuiz();
  old.replaceWith(fresh);
  if (observer) observer.observe(fresh);
  if (query) applySearch();
}

/* ---------------- rail ---------------- */

function renderRail() {
  const rail = $("#rail");
  rail.innerHTML = "";
  rail.appendChild(el("h2", null, T(UI.contents)));
  const list = el("ol");

  const entries = [
    { id: "numbers", label: { en: "Key numbers", zh: "关键数字", ms: "Angka utama" }[lang] },
    ...CHAPTERS.map((c) => ({ id: c.id, label: T(c.title) })),
    { id: "glossary", label: { en: "Glossary", zh: "术语表", ms: "Glosari" }[lang] },
    { id: "quiz", label: { en: "Test yourself", zh: "自我测验", ms: "Uji diri" }[lang] }
  ];

  entries.forEach((e) => {
    const li = el("li");
    const a = el("a", null, e.label);
    a.href = "#" + e.id;
    a.dataset.target = e.id;
    li.appendChild(a);
    list.appendChild(li);
  });
  rail.appendChild(list);
}

/* ---------------- main render ---------------- */

function openTopics() {
  return new Set($$("details.topic[open]").map((d) => d.dataset.topic));
}

function render(keepOpen) {
  const open = keepOpen || openTopics();

  document.documentElement.lang = HTML_LANG[lang];
  document.title = T(UI.title) + " · " + T(UI.sub);

  $("#brandTitle").textContent = T(UI.title);
  $("#brandSub").textContent = T(UI.sub);
  $("#search").placeholder = T(UI.search);
  $("#clearBtn").setAttribute("aria-label", T(UI.clear));
  $("#themeBtn").setAttribute("aria-label", T(UI.theme));
  $("#langSeg").setAttribute("aria-label", T(UI.lang));
  $$("#langSeg button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));

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
  main.appendChild(renderQuiz());

  $$("details.topic").forEach((d) => {
    if (open.has(d.dataset.topic)) d.open = true;
  });

  renderRail();
  observeSections();
  applySearch();
}

/* ---------------- search ---------------- */

let query = "";

function clearMarks(root) {
  $$("mark", root).forEach((m) => {
    const parent = m.parentNode;
    parent.replaceChild(document.createTextNode(m.textContent), m);
    parent.normalize();
  });
}

function highlight(root, q) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) =>
      n.parentNode && n.parentNode.nodeName !== "MARK" && n.nodeValue.trim()
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT
  });
  const targets = [];
  while (walker.nextNode()) targets.push(walker.currentNode);

  const lower = q.toLowerCase();
  targets.forEach((node) => {
    const text = node.nodeValue;
    const idx = text.toLowerCase().indexOf(lower);
    if (idx === -1) return;
    const frag = document.createDocumentFragment();
    let pos = 0;
    let i = idx;
    while (i !== -1) {
      frag.appendChild(document.createTextNode(text.slice(pos, i)));
      const m = el("mark", null, text.slice(i, i + q.length));
      frag.appendChild(m);
      pos = i + q.length;
      i = text.toLowerCase().indexOf(lower, pos);
    }
    frag.appendChild(document.createTextNode(text.slice(pos)));
    node.parentNode.replaceChild(frag, node);
  });
}

function applySearch() {
  const main = $("#content");
  clearMarks(main);
  $("#empty").classList.add("hidden");
  $("#clearBtn").classList.toggle("hidden", !query);

  const items = $$(".searchable", main);

  if (!query) {
    items.forEach((n) => n.classList.remove("hidden"));
    $$(".section", main).forEach((s) => s.classList.remove("hidden"));
    $$(".facts-group-title", main).forEach((s) => s.classList.remove("hidden"));
    return;
  }

  const q = query.toLowerCase();
  let hits = 0;

  items.forEach((n) => {
    const match = n.textContent.toLowerCase().includes(q);
    n.classList.toggle("hidden", !match);
    if (match) {
      hits++;
      if (n.tagName === "DETAILS") n.open = true;
      highlight(n, query);
    }
  });

  $$(".section", main).forEach((s) => {
    const visible = $$(".searchable", s).some((n) => !n.classList.contains("hidden"));
    s.classList.toggle("hidden", !visible);
  });

  $$(".facts-group-title", main).forEach((t) => {
    const grid = t.nextElementSibling;
    const visible = grid && $$(".fact", grid).some((n) => !n.classList.contains("hidden"));
    t.classList.toggle("hidden", !visible);
  });

  if (hits === 0) {
    $("#empty").textContent = T(UI.noHits);
    $("#empty").classList.remove("hidden");
  }
}

/* ---------------- scroll spy ---------------- */

let observer = null;

function observeSections() {
  if (observer) observer.disconnect();
  const links = $$("#rail a");
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const id = e.target.dataset.sec;
        links.forEach((a) => a.classList.toggle("current", a.dataset.target === id));
      });
    },
    { rootMargin: "-140px 0px -60% 0px", threshold: 0 }
  );
  $$("#content .section").forEach((s) => observer.observe(s));
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

  $$("#langSeg button").forEach((b) => {
    b.addEventListener("click", () => {
      lang = b.dataset.lang;
      localStorage.setItem("opb-lang", lang);
      render();
    });
  });

  let debounce;
  $("#search").addEventListener("input", (e) => {
    clearTimeout(debounce);
    const val = e.target.value.trim();
    debounce = setTimeout(() => {
      query = val;
      applySearch();
    }, 140);
  });

  $("#clearBtn").addEventListener("click", () => {
    $("#search").value = "";
    query = "";
    applySearch();
    $("#search").focus();
  });

  render();

  if (!window.matchMedia("(display-mode: standalone)").matches) {
    $("#installHint").classList.add("show");
  }
}

document.addEventListener("DOMContentLoaded", init);

/* ---------------- service worker ---------------- */

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}
