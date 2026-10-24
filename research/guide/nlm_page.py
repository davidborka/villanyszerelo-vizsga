"""NotebookLM-anyagok (útmutató, kvíz, tanulókártyák, gondolattérkép) önálló oldalként: notebooklm.html.
Csak a nyilvános forrásokból generált változatokat használja (research/nlm/public)."""
import html, json, os, re

e = html.escape
TEX = [(r"\\text\{([^}]*)\}", r"\1"), (r"\\mathrm\{([^}]*)\}", r"\1"), (r"\{,\}", ","), (r"\\cdot", "·"), (r"\\times", "×"),
       (r"\\Omega", "Ω"), (r"\\mu", "µ"), (r"\\Delta", "Δ"), (r"\\varphi|\\phi", "φ"), (r"\\rho", "ρ"), (r"\\le(q)?", "≤"), (r"\\ge(q)?", "≥"),
       (r"\\approx", "≈"), (r"\\sqrt\{([^}]*)\}", r"√\1"), (r"\\frac\{([^}]*)\}\{([^}]*)\}", r"(\1)/(\2)"), (r"\\%", "%"), (r"\\pm", "±"),
       (r"\^\{?2\}?", "²"), (r"\^\{?3\}?", "³"), (r"_\{([^}]*)\}", r"\1"), (r"_([A-Za-z0-9])", r"\1"), (r"\\[,;! ]", " "), (r"\\to", "→"), (r"\\rightarrow", "→")]


def tex(s: str) -> str:
    def fix(m):
        t = m.group(1)
        for a, b in TEX:
            t = re.sub(a, b, t)
        return t.replace("{", "").replace("}", "").replace("\\", "")
    return re.sub(r"\$\$?([^$]+)\$\$?", fix, s)


def inline(s: str) -> str:
    s = e(tex(s))
    s = re.sub(r"\*\*([^*]+)\*\*", r"<b>\1</b>", s)
    s = re.sub(r"(?<!\*)\*([^*]+)\*(?!\*)", r"<i>\1</i>", s)
    return re.sub(r"`([^`]+)`", r"<code>\1</code>", s)


def md(text: str) -> str:
    """Kis Markdown-alakító: címek, táblázat, listák, elválasztó, bekezdés."""
    out, para, lines, i = [], [], text.splitlines(), 0
    flush = lambda: (out.append("<p>" + inline(" ".join(para)) + "</p>"), para.clear()) if para else None
    while i < len(lines):
        ln = lines[i].rstrip()
        if not ln.strip():
            flush(); i += 1; continue
        if m := re.match(r"(#{1,6})\s+(.*)", ln):
            flush(); lv = min(len(m.group(1)) + 1, 6); out.append(f"<h{lv}>{inline(m.group(2))}</h{lv}>"); i += 1; continue
        if re.match(r"^-{3,}$|^\*{3,}$", ln.strip()):
            flush(); out.append("<hr>"); i += 1; continue
        if ln.lstrip().startswith("|"):
            flush(); rows = []
            while i < len(lines) and lines[i].lstrip().startswith("|"):
                cells = [c.strip() for c in lines[i].strip().strip("|").split("|")]
                if not all(re.match(r"^:?-+:?$", c) for c in cells): rows.append(cells)
                i += 1
            out.append("<table>" + "".join("<tr>" + "".join(f"<{'th' if r == 0 else 'td'}>{inline(c)}</{'th' if r == 0 else 'td'}>" for c in row) + "</tr>" for r, row in enumerate(rows)) + "</table>")
            continue
        if re.match(r"^\s*([*\-+]|\d+\.)\s+", ln):
            flush(); ordered = bool(re.match(r"^\s*\d+\.", ln)); items = []
            while i < len(lines) and re.match(r"^\s*([*\-+]|\d+\.)\s+", lines[i]):
                items.append(re.sub(r"^\s*([*\-+]|\d+\.)\s+", "", lines[i])); i += 1
            tag = "ol" if ordered else "ul"
            out.append(f"<{tag}>" + "".join(f"<li>{inline(x)}</li>" for x in items) + f"</{tag}>"); continue
        para.append(ln.strip()); i += 1
    flush()
    return "\n".join(out)


def mind(n, depth=0):
    kids = n.get("children") or []
    name = inline(n.get("name", ""))
    if not kids:
        return f"<li>{name}</li>"
    return f"<li><details{' open' if depth < 1 else ''}><summary>{name}</summary><ul>" + "".join(mind(c, depth + 1) for c in kids) + "</ul></details></li>"


def flash_text(side):
    return " ".join(b.get("content", "") for b in side.get("flashcardContentBlock", []) if b.get("type") == "text")


def build(src: str, out: str):
    sections, nav = [], []
    p = os.path.join(src, "study-guide.md")
    if os.path.exists(p):
        nav.append(("utmutato", "Tanulási útmutató"))
        sections.append(f'<section id="utmutato"><h1>Tanulási útmutató</h1>{md(open(p).read())}</section>')
    p = os.path.join(src, "quiz.json")
    if os.path.exists(p):
        qs = json.load(open(p))["questions"]
        def item(q):
            base = {"q": tex(q["question"]), "hint": tex(q.get("hint") or ""), "type": q["type"]}
            if "answerOptions" in q:
                return {**base, "opts": [{"t": tex(o["text"]), "ok": bool(o.get("isCorrect")), "why": tex(o.get("rationale") or "")} for o in q["answerOptions"]]}
            if q["type"] == "fill_in_the_blank":
                return {**base, "accept": [tex(x).strip().lower() for x in q.get("acceptableAnswers") or [q.get("bestAnswer", "")]], "answer": tex(q.get("bestAnswer", "")), "why": tex(q.get("rationale") or "")}
            g = q.get("grading") or {}
            model = g.get("sampleAnswer") or g.get("modelAnswer") or g.get("answer") or ""
            pts = g.get("keyPoints") or g.get("rubric") or g.get("criteria") or []
            if isinstance(pts, list):
                pts = " · ".join(p if isinstance(p, str) else p.get("text") or p.get("description") or json.dumps(p, ensure_ascii=False) for p in pts)
            return {**base, "answer": tex(model or str(pts)), "why": tex(pts if model else "")}
        data = [item(q) for q in qs]
        nav.append(("kviz", f"Kvíz ({len(data)})"))
        sections.append('<section id="kviz"><h1>Kvíz</h1><p class="muted">Kattints egy válaszra; a magyarázat azonnal megjelenik.</p><div id="quiz"></div><p id="qscore"></p></section>'
                        f'<script>window.QUIZ={json.dumps(data, ensure_ascii=False)}</script>')
    p = os.path.join(src, "flashcards.json")
    if os.path.exists(p):
        cards = [{"f": tex(flash_text(c["front"])), "b": tex(flash_text(c["back"]))} for c in json.load(open(p))["cards"]]
        nav.append(("kartyak", f"Tanulókártyák ({len(cards)})"))
        sections.append('<section id="kartyak"><h1>Tanulókártyák</h1><p class="muted">Kattints a kártyára a megfordításhoz.</p><div class="cards">'
                        + "".join(f'<button class="card" data-b="{e(c["b"])}" data-f="{e(c["f"])}">{e(c["f"])}</button>' for c in cards) + "</div></section>")
    p = os.path.join(src, "mindmap.json")
    if os.path.exists(p):
        nav.append(("terkep", "Gondolattérkép"))
        sections.append(f'<section id="terkep"><h1>Gondolattérkép</h1><ul class="tree">{mind(json.load(open(p)))}</ul></section>')
    navhtml = "".join(f'<a href="#{k}">{e(v)}</a>' for k, v in nav)
    page = PAGE.replace("%NAV%", navhtml).replace("%BODY%", "\n".join(sections))
    open(os.path.join(out, "notebooklm.html"), "w").write(page)
    return [v for _, v in nav]


PAGE = """<!doctype html><html lang="hu"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>NotebookLM tananyag – villanyszerelő vizsga</title><style>
:root{--bg:#fbfaf6;--fg:#1b1d21;--muted:#666b73;--card:#fff;--line:#e4e1d8;--acc:#c46a00;--good:#1d7a46;--bad:#b42318}
@media (prefers-color-scheme:dark){:root{--bg:#111418;--fg:#e8ebef;--muted:#9aa3ae;--card:#1a1e24;--line:#2c323b;--acc:#ffb020;--good:#3ddc84;--bad:#ff6b6b}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.55 system-ui,-apple-system,Segoe UI,sans-serif}
header{position:sticky;top:0;background:var(--bg);border-bottom:1px solid var(--line);padding:10px 16px;display:flex;gap:14px;flex-wrap:wrap;align-items:center;z-index:2}
header a{color:var(--fg);text-decoration:none;font-size:14px}header a:hover{color:var(--acc)}main{max-width:920px;margin:0 auto;padding:16px}
section{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:18px;margin:18px 0}h1{font-size:26px;margin:0 0 10px}.muted{color:var(--muted)}
table{border-collapse:collapse;width:100%;margin:10px 0;font-size:14px;display:block;overflow-x:auto}td,th{border:1px solid var(--line);padding:6px 8px;text-align:left;vertical-align:top}
.q{border-top:1px solid var(--line);padding:12px 0}.q b{display:block;margin-bottom:6px}.opt{display:block;width:100%;text-align:left;margin:4px 0;padding:8px 10px;border-radius:8px;border:1px solid var(--line);background:var(--bg);color:var(--fg);font:inherit;cursor:pointer}
.opt.ok{border-color:var(--good);background:rgba(29,122,70,.12)}.opt.no{border-color:var(--bad);background:rgba(180,35,24,.1)}.why{font-size:14px;color:var(--muted);margin:4px 0 0}
.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px}.card{min-height:110px;text-align:left;padding:12px;border-radius:10px;border:1px solid var(--line);background:var(--bg);color:var(--fg);font:inherit;cursor:pointer}.card.flip{background:var(--acc);color:#fff}
.tree,.tree ul{list-style:none;padding-left:18px}.tree summary{cursor:pointer;font-weight:600}.tree li{margin:3px 0}
.src{font-size:13px;color:var(--muted)}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
</style></head><body>
<header><a href="./index.html"><b>← Mai terv</b></a>%NAV%</header>
<main><p class="src">Google NotebookLM-mel generált anyag a notebook nyilvános forrásaiból (KKK, vizsgaközponti mintafeladat, szolgáltatói előírások, saját tananyag-modulok, kérdésbank, videók). Ellenőrizd a hivatalos forrásokkal; eltérés esetén a KKK és a szabvány az irányadó.</p>
%BODY%
</main><script>
const box=document.getElementById('quiz');if(box&&window.QUIZ){let good=0,done=0;QUIZ.forEach((q,i)=>{const d=document.createElement('div');d.className='q';d.innerHTML='<b>'+(i+1)+'. '+q.q.replace(/</g,'&lt;')+'</b>';
if(!q.opts){const inp=document.createElement('input');inp.placeholder=q.type==='fill_in_the_blank'?'Írd be a választ…':'Fogalmazd meg röviden…';inp.style.cssText='font:inherit;padding:8px;width:100%;border-radius:8px;border:1px solid var(--line);background:var(--bg);color:var(--fg)';
const btn=document.createElement('button');btn.className='opt';btn.textContent=q.type==='fill_in_the_blank'?'Ellenőrzés':'Mintaválasz';btn.onclick=()=>{if(d.dataset.done)return;d.dataset.done=1;done++;
let ok=null;if(q.accept){ok=q.accept.includes(inp.value.trim().toLowerCase().replace('.',','))||q.accept.includes(inp.value.trim().toLowerCase());if(ok)good++;btn.classList.add(ok?'ok':'no')}
const w=document.createElement('p');w.className='why';w.textContent='Helyes válasz: '+q.answer+(q.why?' — '+q.why:'');d.appendChild(w);document.getElementById('qscore').textContent='Eredmény: '+good+' / '+done};
d.appendChild(inp);d.appendChild(btn);box.appendChild(d);return}
q.opts.forEach(o=>{const b=document.createElement('button');b.className='opt';b.textContent=o.t;b.onclick=()=>{if(d.dataset.done)return;d.dataset.done=1;done++;if(o.ok)good++;d.querySelectorAll('.opt').forEach((x,k)=>{if(q.opts[k].ok)x.classList.add('ok')});if(!o.ok)b.classList.add('no');
const w=document.createElement('p');w.className='why';w.textContent=(o.why||'')+(q.hint&&!o.ok?' Tipp: '+q.hint:'');d.appendChild(w);document.getElementById('qscore').textContent='Eredmény: '+good+' / '+done};d.appendChild(b)});box.appendChild(d)})}
document.querySelectorAll('.card').forEach(c=>c.onclick=()=>{c.classList.toggle('flip');c.textContent=c.classList.contains('flip')?c.dataset.b:c.dataset.f});
</script></body></html>"""
