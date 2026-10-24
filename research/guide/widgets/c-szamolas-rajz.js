// Interaktív mini feladatok – C csomag: lépésenkénti számolás és rajzértelmezés.
;(function () {
  const { h, s, fmt, shuffle } = W
  const SQ3 = Math.sqrt(3)
  const RHO = 0.0178
  const IZ = { 1.5: 17.5, 2.5: 24, 4: 32, 6: 41, 10: 57, 16: 76 }
  const AS = [1.5, 2.5, 4, 6, 10, 16]
  const IN_STD = [6, 10, 13, 16, 20, 25, 32, 40, 50, 63]
  const pick = (a) => a[Math.floor(Math.random() * a.length)]
  const rint = (a, b) => a + Math.floor(Math.random() * (b - a + 1))
  const rstep = (a, b, step) => Math.round((a + Math.floor(Math.random() * (Math.round((b - a) / step) + 1)) * step) * 1000) / 1000
  const num = (x) => {
    const raw = String(x).replace(/\s/g, '')
    return /^[+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+)$/.test(raw) ? Number(raw.replace(',', '.')) : NaN
  }
  const near = (got, want, tol = 0.02) => Number.isFinite(got) && Math.abs(got - want) <= Math.abs(want) * tol + 1e-9
  const f = (x, d = 2) => fmt(x, d)

  if (!document.getElementById('cr-style')) {
    const st = document.createElement('style')
    st.id = 'cr-style'
    st.textContent = `
.cr-task{display:flex;flex-direction:column;gap:10px}.cr-brief{margin:0;font-size:15px;line-height:1.55}.cr-card{display:none;min-width:0;flex-direction:column;gap:8px;background:var(--bg);border:1px solid var(--line);border-left:3px solid var(--acc);border-radius:8px;padding:10px}.cr-card.current{display:flex}.cr-card.ok,.cr-card.shown{display:flex;border-left-color:var(--good)}.cr-card.shown{opacity:.82}.cr-card.no{display:flex;border-color:var(--bad)}.cr-step{font-weight:700;line-height:1.45}.cr-input{width:120px;max-width:100%}.cr-unit{min-width:28px}.cr-help{margin:0;padding:8px 10px;border:1px solid var(--line);border-radius:7px;background:var(--card);font-size:14px;line-height:1.5;white-space:pre-line;overflow-wrap:anywhere}.cr-help.solution{border-color:var(--acc)}.cr-result{margin:0;font-size:14px;line-height:1.5}.cr-learn{margin:0;padding:9px 11px;border-left:3px solid var(--good);background:var(--bg);border-radius:6px;font-size:14px;line-height:1.5}.cr-table{border-collapse:collapse;width:100%;font-size:13px;background:var(--bg)}.cr-table th,.cr-table td{border:1px solid var(--line);padding:6px;text-align:center}.cr-table th{background:var(--card)}.cr-tablewrap{max-width:100%;overflow-x:auto}.cr-questions{display:flex;flex-direction:column;gap:9px}.cr-q{display:flex;min-width:0;flex-direction:column;gap:7px;padding:9px 10px;background:var(--bg);border:1px solid var(--line);border-radius:8px}.cr-q.ok{border-color:var(--good)}.cr-q.no{border-color:var(--bad)}.cr-q select{min-width:0;max-width:100%}.cr-why{margin:0;font-size:13px;line-height:1.5;color:var(--muted);overflow-wrap:anywhere}.cr-q.no .cr-why{color:var(--bad)}.cr-q.ok .cr-why{color:var(--good)}.cr-checks{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(180px,100%),1fr));gap:4px}.cr-checks label{display:flex;align-items:center;gap:7px;min-height:36px}.cr-hit{fill:transparent;stroke:transparent;stroke-width:2;cursor:pointer;outline:none}.cr-hit:hover{stroke:var(--acc)}.cr-hit:focus-visible{stroke:var(--acc);stroke-width:4}.cr-selected{stroke:var(--acc)!important;stroke-width:4!important}.cr-bad{stroke:var(--bad)!important;stroke-width:4!important}.cr-good{stroke:var(--good)!important;stroke-width:4!important}.cr-wire{fill:none;stroke:var(--fg);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}.cr-thin{fill:none;stroke:var(--muted);stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}.cr-box{fill:var(--card);stroke:var(--fg);stroke-width:2}.cr-dot{fill:var(--fg)}.cr-l{stroke:#8b4513}.cr-n{stroke:#1f6fd1}.cr-pe{stroke:#2e9d3a}.cr-pey{stroke:#f2d21b;stroke-dasharray:7 7}.cr-svgtext{font-size:13px}.cr-small{font-size:11px}.cr-big{font-size:16px;font-weight:700}.cr-palette{display:flex;gap:7px;flex-wrap:wrap}.cr-palette button[aria-pressed=true]{background:var(--acc);color:var(--on-acc);border-color:var(--acc)}.cr-two{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(280px,100%),1fr));gap:10px;align-items:start}.cr-meter{font-family:ui-monospace,monospace;background:var(--card);border:1px solid var(--line);padding:8px;border-radius:7px;white-space:pre-line;font-size:14px}@media(max-width:520px){.cr-card{padding:9px 8px}.cr-table{font-size:12px}.cr-input{width:105px}.wdiagram .wsvg[data-native="680"]{min-width:480px}}
`
    document.head.append(st)
  }

  const root = (w, hh, label) => { const g = s.root(w, hh); if (label) g.setAttribute('aria-label', label); return g }
  const T = (x, y, text, a = {}) => s('text', { x, y, class: 'cr-svgtext', 'text-anchor': 'middle', ...a }, text)
  const L = (x1, y1, x2, y2, cls = 'cr-wire', a = {}) => s('line', { x1, y1, x2, y2, class: cls, ...a })
  const P = (d, cls = 'cr-wire', a = {}) => s('path', { d, class: cls, ...a })
  const R = (x, y, w, hh, cls = 'cr-box', a = {}) => s('rect', { x, y, width: w, height: hh, class: cls, ...a })
  const C = (x, y, r, cls = 'cr-dot', a = {}) => s('circle', { cx: x, cy: y, r, class: cls, ...a })
  const hit = (x, y, w, hh, fn, label, pressed = false) => s('rect', { x, y, width: Math.max(52, w), height: Math.max(52, hh), class: 'cr-hit hot', tabindex: 0, role: 'button', 'aria-label': label, 'aria-pressed': pressed, 'data-focus-key': label.split(',')[0], onclick: fn })
  function paint(box, g) {
    const active = document.activeElement, key = box.contains(active) ? active.getAttribute('data-focus-key') || active.getAttribute('aria-label') : null
    const wrap = box.querySelector('.wdiagram')
    ;(wrap || box).replaceChildren(g)
    if (key) [...g.querySelectorAll('[aria-label]')].find((n) => n.getAttribute('data-focus-key') === key || n.getAttribute('aria-label') === key)?.focus({ preventScroll: true })
  }
  const learn = (text) => h('p', { class: 'cr-learn' }, h('b', {}, 'Mit tanultál? '), text)
  const brief = (text) => h('p', { class: 'cr-brief' }, text)
  const table = (heads, rows) => h('div', { class: 'cr-tablewrap' }, h('table', { class: 'cr-table' }, h('thead', {}, h('tr', {}, heads.map((x) => h('th', {}, x)))), h('tbody', {}, rows.map((r) => h('tr', {}, r.map((x) => h('td', {}, x)))))))
  const sel = (opts, label, ph = '— válassz —') => h('select', { 'aria-label': label }, h('option', { value: '' }, ph), opts.map((o) => h('option', { value: o.v ?? o }, o.t ?? o)))
  const choice = (opts, onPick, initial) => {
    let cur = initial
    const row = h('div', { class: 'wrow' })
    const bs = opts.map((o) => {
      const v = o.v ?? o, t = o.t ?? o
      const b = h('button', { type: 'button', 'aria-pressed': v === cur, class: v === cur ? 'on' : '', onclick: () => { cur = v; bs.forEach((x, i) => { const on = (opts[i].v ?? opts[i]) === cur; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on) }); if (onPick) onPick(v) } }, t)
      row.append(b); return b
    })
    return { el: row, get: () => cur, set(v) { cur = v; bs.forEach((x, i) => { const on = (opts[i].v ?? opts[i]) === cur; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on) }) } }
  }

  const N = (label, value, unit, formula, sub, hint, traps = [], extra = {}) => ({ type: 'number', label, value, unit, formula, sub, hint, traps, ...extra })
  const Q = (label, answer, options, explanation, extra = {}) => ({ type: 'choice', label, answer, options: options.map((v) => ({ v, t: v })), explanation, ...extra })
  const trapUnits = (got, want, unit) => {
    if (near(got, want * 1000) || near(got, want / 1000)) return `Ezres váltási hiba: ellenőrizd a W ↔ kW, A ↔ mA átváltást. A kért mértékegység: ${unit}.`
    return ''
  }

  /** Közös, sorrendben feloldódó számolós lépések. */
  function calcSteps(el, api, steps, finalText, onAdvance) {
    let index = 0, own = 0
    const cards = []
    const finish = () => {
      api.done(true, `Kész: ${own}/${steps.length} lépést oldottál meg megmutatás nélkül. ${own === steps.length ? 'Mind a saját megoldásod!' : 'A megmutatott lépéseket érdemes az Újra gombbal önállóan is kiszámolni.'} ${finalText}`)
    }
    const advance = (card, helped) => {
      if (!helped) own++
      card.className = 'cr-card ' + (helped ? 'shown' : 'ok')
      card.querySelectorAll('input,button,select').forEach((x) => { x.disabled = true })
      index++
      if (onAdvance) onAdvance(index)
      if (index < steps.length) {
        cards[index].className = 'cr-card current'
        cards[index].querySelector('input,select,button')?.focus({ preventScroll: true })
      } else finish()
    }
    steps.forEach((st, i) => {
      const feedback = h('p', { class: 'cr-result', 'aria-live': 'polite' })
      const help = h('pre', { class: 'cr-help', style: { display: 'none', margin: 0 } })
      const card = h('div', { class: 'cr-card' + (i === 0 ? ' current' : ''), 'data-step': i + 1 }, h('div', { class: 'cr-step' }, `${i + 1}. lépés · ${st.label}`))
      if (st.extraEl) card.append(st.extraEl)
      let input
      if (st.type === 'number') {
        input = h('input', { class: 'cr-input', inputmode: 'decimal', autocomplete: 'off', 'aria-label': `${st.label}, mértékegység: ${st.unit}` })
        card.append(h('div', { class: 'wrow' }, h('label', { class: 'bf-lab' }, input, h('span', { class: 'cr-unit' }, st.unit))))
      } else {
        input = sel(st.options, st.label)
        card.append(input)
      }
      const check = () => {
        if (st.pre) { const msg = st.pre(); if (msg) { feedback.textContent = msg; card.className = 'cr-card no'; api.note(msg, 'bad'); return } }
        let ok = false, msg = ''
        if (st.type === 'number') {
          const got = num(input.value)
          ok = near(got, st.value) && (!st.integer || Number.isInteger(got))
          if (!ok) {
            const tr = (st.traps || []).find((t) => near(got, t[0], t[2] ?? 0.02))
            msg = st.integer && Number.isFinite(got) && !Number.isInteger(got) ? 'Egész számot írj: darab vagy menet nem lehet tört.' : tr ? tr[1] : trapUnits(got, st.value, st.unit) || `Még nem jó. A kért eredményt ${st.unit} mértékegységben add meg; a kerekítés miatt ±2% az elfogadott.`
          }
        } else {
          ok = st.accepted ? st.accepted.includes(input.value) : input.value === String(st.answer)
          if (!ok) msg = input.value ? st.explanation : 'Válaszd ki a lehetőséget.'
        }
        if (ok) {
          feedback.textContent = st.type === 'number' ? `✓ Helyes: ${f(st.value, st.digits ?? 3)} ${st.unit}.` : '✓ Helyes. ' + st.explanation
          api.note(`✓ ${i + 1}. lépés rendben.`, 'good')
          advance(card, false)
        } else {
          card.className = 'cr-card no'; feedback.textContent = msg; api.note(msg, 'bad')
        }
      }
      const show = () => {
        if (st.preShow) st.preShow()
        help.className = 'cr-help solution'; help.style.display = ''
        help.textContent = st.type === 'number'
          ? `${st.formula}\n= ${st.sub} = ${f(st.value, st.digits ?? 3)} ${st.unit}`
          : st.explanation
        feedback.textContent = 'Megmutatott lépés – ez nem számít saját megoldásnak.'
        api.note('A teljes behelyettesítést megmutattam; a következő lépés nyílik.')
        advance(card, true)
      }
      const tip = () => { help.className = 'cr-help'; help.style.display = ''; help.textContent = 'Tipp: ' + st.hint; api.note('') }
      const bCheck = h('button', { type: 'button', class: 'primary', onclick: check }, 'Ellenőrzés')
      card.append(h('div', { class: 'wrow' }, bCheck, h('button', { type: 'button', onclick: tip }, 'Tipp'), h('button', { type: 'button', onclick: show }, 'Megmutatom')), help, feedback)
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && st.type === 'number') check() })
      cards.push(card); el.append(card)
    })
    return { cards }
  }

  function lamp(g, x, y, r = 15, label = '') {
    g.append(C(x, y, r, 'cr-box'), L(x - r * .7, y - r * .7, x + r * .7, y + r * .7), L(x + r * .7, y - r * .7, x - r * .7, y + r * .7))
    if (label) g.append(T(x, y + r + 18, label, { class: 'cr-small' }))
  }
  function ground(g, x, y) { g.append(L(x, y - 24, x, y), L(x - 16, y, x + 16, y), L(x - 11, y + 6, x + 11, y + 6), L(x - 6, y + 12, x + 6, y + 12)) }
  function resistor(g, x, y, label, value, onclick, selected) {
    const group = s('g', { class: onclick ? 'hot' : '' }, R(x - 34, y - 15, 68, 30, 'cr-box', selected ? { style: 'stroke:var(--acc);stroke-width:4' } : {}), L(x - 50, y, x - 34, y), L(x + 34, y, x + 50, y), T(x, y - 21, label, { class: 'cr-small' }), T(x, y + 5, f(value, 2) + ' Ω', { class: 'cr-small' }))
    if (onclick) group.append(hit(x - 42, y - 32, 84, 64, onclick, `${label}, ${f(value, 2)} ohm`, selected))
    g.append(group)
  }
  function contact(g, x, y, closed, label, onclick, selected) {
    g.append(C(x, y, 3), C(x + 48, y, 3), closed ? L(x, y, x + 48, y) : L(x, y, x + 43, y - 19), T(x + 24, y - 26, label, { class: 'cr-small' }))
    if (onclick) g.append(hit(x - 8, y - 38, 64, 58, onclick, label, selected))
  }

  // ===================================================================== 1. Eredő ellenállás
  function eredoData() {
    const vals = () => [pick([5, 10, 15, 20, 30]), pick([10, 20, 30, 40, 60]), pick([15, 30, 45, 60, 90]), pick([20, 40, 60, 80, 100]), pick([5, 10, 20, 25, 50])]
    const v = vals(), U = pick([12, 24, 230])
    const leaf = (id, i) => ({ id, value: v[i], leaf: true })
    const par = (a, b, id) => ({ id, type: 'par', a, b, value: a.value * b.value / (a.value + b.value) })
    const ser = (a, b, id) => ({ id, type: 'ser', a, b, value: a.value + b.value })
    let tree, ops
    const family = rint(0, 4)
    if (family === 0) {
      const p = par(leaf('R2', 1), leaf('R3', 2), 'E1')
      tree = ser(ser(leaf('R1', 0), p, 'E2'), leaf('R4', 3), 'E3')
      ops = [{ ids: ['R2', 'R3'], type: 'par', id: 'E1', value: p.value }, { ids: ['R1', 'E1'], type: 'ser', id: 'E2', value: tree.a.value }, { ids: ['E2', 'R4'], type: 'ser', id: 'E3', value: tree.value }]
    } else if (family === 1) {
      const a = ser(leaf('R1', 0), leaf('R2', 1), 'E1'), b = ser(leaf('R3', 2), leaf('R4', 3), 'E2')
      tree = ser(par(a, b, 'E3'), leaf('R5', 4), 'E4')
      ops = [{ ids: ['R1', 'R2'], type: 'ser', id: 'E1', value: a.value }, { ids: ['R3', 'R4'], type: 'ser', id: 'E2', value: b.value }, { ids: ['E1', 'E2'], type: 'par', id: 'E3', value: tree.a.value }, { ids: ['E3', 'R5'], type: 'ser', id: 'E4', value: tree.value }]
    } else if (family === 2) {
      const a = ser(leaf('R2', 1), leaf('R3', 2), 'E1'), p = par(a, leaf('R4', 3), 'E2')
      tree = ser(ser(leaf('R1', 0), p, 'E3'), leaf('R5', 4), 'E4')
      ops = [{ ids: ['R2', 'R3'], type: 'ser', id: 'E1', value: a.value }, { ids: ['E1', 'R4'], type: 'par', id: 'E2', value: p.value }, { ids: ['R1', 'E2'], type: 'ser', id: 'E3', value: tree.a.value }, { ids: ['E3', 'R5'], type: 'ser', id: 'E4', value: tree.value }]
    } else if (family === 3) {
      const p = par(leaf('R1', 0), leaf('R2', 1), 'E1'), a = ser(p, leaf('R3', 2), 'E2')
      tree = par(a, leaf('R4', 3), 'E3')
      ops = [{ ids: ['R1', 'R2'], type: 'par', id: 'E1', value: p.value }, { ids: ['E1', 'R3'], type: 'ser', id: 'E2', value: a.value }, { ids: ['E2', 'R4'], type: 'par', id: 'E3', value: tree.value }]
    } else {
      const p = par(leaf('R2', 1), leaf('R3', 2), 'E1')
      tree = ser(leaf('R1', 0), p, 'E2')
      ops = [{ ids: ['R2', 'R3'], type: 'par', id: 'E1', value: p.value }, { ids: ['R1', 'E1'], type: 'ser', id: 'E2', value: tree.value }]
    }
    return { tree, ops, U, family }
  }
  function eredoHeight(n) { return n.leaf ? 72 : n.type === 'ser' ? Math.max(...[n.a, n.b].map(eredoHeight)) : eredoHeight(n.a) + eredoHeight(n.b) }
  function eredoDraw(g, n, x, y, w, selected, onclick) {
    if (n.leaf) { resistor(g, x + w / 2, y + 36, n.id, n.value, () => onclick(n.id), selected.includes(n.id)); return }
    if (n.type === 'ser') {
      eredoDraw(g, n.a, x + 20, y, w / 2 - 25, selected, onclick); eredoDraw(g, n.b, x + w / 2 + 5, y, w / 2 - 25, selected, onclick)
      g.append(L(x + w / 2 - 5, y + 36, x + w / 2 + 5, y + 36))
    } else {
      const ha = eredoHeight(n.a)
      eredoDraw(g, n.a, x + 35, y, w - 70, selected, onclick); eredoDraw(g, n.b, x + 35, y + ha, w - 70, selected, onclick)
      g.append(P(`M${x + 15} ${y + 36}H${x + 35}M${x + 15} ${y + 36}V${y + ha + 36}H${x + 35}M${x + w - 35} ${y + 36}H${x + w - 15}V${y + ha + 36}H${x + w - 35}`))
      g.append(C(x + 15, y + 36, 3), C(x + w - 15, y + 36, 3))
    }
  }
  W.register({
    id: 'lepes-eredo', module: 'm11-alapszamitasok', kind: 'task',
    title: 'Vegyes ellenálláshálózat – összevonás lépésenként',
    lead: 'Jelöld ki a két összevonandó ellenállást, válaszd a soros/párhuzamos műveletet, majd írd be az eredőt. A helyes lépés után a rajz egyszerűsödik.',
    mount(el, api) {
      const d = eredoData(); let tree = d.tree, selected = []
      const box = h('div'), task = h('div', { class: 'cr-task' })
      const mode = choice([{ v: 'ser', t: 'Soros' }, { v: 'par', t: 'Párhuzamos' }], null, 'ser')
      el.append(brief(`Egy mérési gyakorlópanelen az ábrán látható hálózatot U = ${d.U} V feszültségre kötjük. Add össze a belső ágakat, amíg egy eredő marad, utána számold ki a teljes áramot.`), box, h('div', {}, h('span', { class: 'wsmall' }, 'A kijelölt párt így vonod össze:'), mode.el), task, learn('A vizsgán először a legszűkebb soros vagy párhuzamos párt kell felismerni; csak utána jöhet az I = U/Re.'))
      function draw() {
        const g = root(640, Math.max(170, eredoHeight(tree) + 55), 'Egyszerűsülő ellenálláshálózat')
        eredoDraw(g, tree, 55, 25, 530, selected, (id) => { selected = selected.includes(id) ? selected.filter((x) => x !== id) : [...selected.slice(-1), id]; draw() })
        g.append(T(320, g.viewBox.baseVal.height - 8, 'Kattints két összevonható elemre. Kijelölés: ' + (selected.join(' + ') || 'még nincs'), { class: 'cr-small' }))
        paint(box, g)
      }
      const steps = d.ops.map((op) => N(`${op.ids.join(' és ')} összevonása (${op.type === 'ser' ? 'soros' : 'párhuzamos'})`, op.value, 'Ω', op.type === 'ser' ? 'Re = R1 + R2' : 'Re = R1 · R2 / (R1 + R2)', op.type === 'ser' ? `${f(find(op.ids[0]).value)} + ${f(find(op.ids[1]).value)}` : `${f(find(op.ids[0]).value)} · ${f(find(op.ids[1]).value)} / (${f(find(op.ids[0]).value)} + ${f(find(op.ids[1]).value)})`, op.type === 'ser' ? 'Soros ágban ugyanaz az áram: az ellenállások összeadódnak.' : 'Két párhuzamos ellenállásnál szorzat per összeg; az eredő a kisebbiknél is kisebb.', [[op.ids.reduce((a, id) => a + find(id).value, 0), 'Ez az összeg. Párhuzamos kapcsolásnál nem adódik össze a két ellenállás; szorzat per összeg kell.']], {
        pre: () => selected.length !== 2 ? 'Előbb jelölj ki pontosan két elemet a rajzon.' : !op.ids.every((id) => selected.includes(id)) ? `Most a(z) ${op.ids.join(' és ')} elemet lehet összevonni. Kijelölve: ${selected.join(' + ')}.` : mode.get() !== op.type ? `A kijelölt elemek ${op.type === 'ser' ? 'sorosan' : 'párhuzamosan'} vannak: ugyanaz a két végpontjuk. Állítsd át a kapcsolás típusát.` : '',
        preShow: () => { selected = [...op.ids]; mode.set(op.type); draw() },
      }))
      function find(id) { const op = d.ops.find((o) => o.id === id); if (op) return op; const search = (n) => n.id === id ? n : n.leaf ? null : search(n.a) || search(n.b); return search(d.tree) }
      steps.push(N('A hálózat teljes árama a megadott feszültségen', d.U / d.tree.value, 'A', 'I = U / Re', `${d.U} / ${f(d.tree.value)}`, 'Ohm törvénye: a feszültséget az összesített eredővel oszd.', [[d.U * d.tree.value, 'Szoroztál osztás helyett. I = U/Re.']]))
      calcSteps(task, api, steps, `Végül Re = ${f(d.tree.value)} Ω, I = ${f(d.U / d.tree.value)} A.`, (idx) => {
        if (idx <= d.ops.length) { tree = idx === d.ops.length ? { id: d.ops[idx - 1].id, value: d.ops[idx - 1].value, leaf: true } : replace(tree, d.ops[idx - 1]); selected = []; draw() }
      })
      function replace(n, op) { if ((n.a?.id === op.ids[0] && n.b?.id === op.ids[1]) || (n.a?.id === op.ids[1] && n.b?.id === op.ids[0])) return { id: op.id, value: op.value, leaf: true }; if (n.leaf) return n; return { ...n, a: replace(n.a, op), b: replace(n.b, op) } }
      draw()
    },
  })

  // ===================================================================== 2. Háromfázisú teljesítmény
  W.register({
    id: 'lepes-3f-teljesitmeny', module: 'm11-alapszamitasok', kind: 'task',
    title: 'Háromfázisú S, P, Q – teljesítményháromszög',
    lead: 'Számold ki sorrendben a látszólagos, hatásos és meddő teljesítményt kVA/kW/kvar-ban. A háromszög a helyes részeredményeiddel rajzolódik ki.',
    mount(el, api) {
      const I = pick([6, 8, 10, 12, 16, 20, 25]), cos = pick([0.75, 0.8, 0.85, 0.9]), U = 400
      const S = SQ3 * U * I / 1000, P3 = S * cos, Qv = S * Math.sqrt(1 - cos * cos)
      const box = h('div'), task = h('div', { class: 'cr-task' })
      el.append(brief(`Egy háromfázisú szellőzőtelep vonali adatai: U = 400 V, I = ${I} A, cos φ = ${f(cos)}. A terhelés szimmetrikus és induktív.`), box, task, learn('Háromfázisban √3 kell; a Q-t a Pitagorasz-tételből kapod, nem S − P kivonással.'))
      function triangle(done) {
        const g = root(520, 290, 'Méretarányos teljesítményháromszög')
        const max = Math.max(S, 1), scale = 330 / max, pw = P3 * scale, qh = Qv * scale
        const x = 70, y = 240
        g.append(L(x, y, x + 390, y, 'cr-thin'), L(x, y, x, 20, 'cr-thin'))
        if (done >= 2) g.append(P(`M${x} ${y}H${x + pw}V${y - qh}Z`, 'cr-wire', { fill: 'rgba(196,106,0,.10)' }))
        if (done >= 1) g.append(L(x, y, x + pw, y - qh, 'cr-wire', { style: 'stroke:var(--acc);stroke-width:4' }))
        if (done >= 3) g.append(L(x + pw, y, x + pw, y - qh, 'cr-wire', { style: 'stroke:var(--good);stroke-width:4' }))
        if (done >= 2) g.append(T(x + pw / 2, y + 23, `P = ${f(P3)} kW`, { class: 'cr-big' }))
        if (done >= 3) g.append(T(Math.min(x + pw + 48, 470), y - qh / 2, `Q = ${f(Qv)} kvar`, { class: 'cr-big' }))
        if (done >= 1) g.append(T(x + pw / 2 - 10, y - qh / 2 - 10, `S = ${f(S)} kVA`, { class: 'cr-big' }))
        g.append(T(70, 270, `cos φ = ${f(cos)}`, { 'text-anchor': 'start' }))
        paint(box, g)
      }
      const steps = [
        N('Látszólagos teljesítmény', S, 'kVA', 'S = √3 · U · I / 1000', `1,732 · 400 · ${I} / 1000`, 'Vonali feszültséggel és vonali árammal számolj; VA-ból kVA ezressel.', [[400 * I / 1000, 'Kimaradt a √3: egyfázisú képletet használtál háromfázisra.']]),
        N('Hatásos teljesítmény', P3, 'kW', 'P = S · cos φ', `${f(S)} · ${f(cos)}`, 'A látszólagos teljesítmény cos φ-szorosa a hatásos.', [[S / cos, 'Osztottál szorzás helyett: P = S·cosφ.']]),
        N('Meddő teljesítmény', Qv, 'kvar', 'Q = √(S² − P²)', `√(${f(S)}² − ${f(P3)}²)`, 'A teljesítményháromszög derékszögű: Q² = S² − P².', [[S - P3, 'Q ≠ S − P: ez derékszögű háromszög, nem kivonás.']]),
      ]
      calcSteps(task, api, steps, `Ellenőrzés: ${f(P3)}² + ${f(Qv)}² ≈ ${f(S)}².`, triangle)
      triangle(0)
    },
  })

  // ===================================================================== 3. Motoradattábla
  W.register({
    id: 'lepes-motor', module: 'm13-motorok-vezerles', kind: 'task',
    title: 'Motor adattáblája – áram, szlip, csillag–delta',
    lead: 'Olvasd ki az SVG-adattáblát. A P2 tengelyen leadott teljesítmény; a 400/690 V Δ/Y motor 400 V-on deltában üzemel.',
    mount(el, api) {
      const P2 = pick([2.2, 3, 4, 5.5, 7.5, 11]), eta = pick([0.84, 0.86, 0.88, 0.9]), cos = pick([0.78, 0.8, 0.82, 0.85]), poles = pick([2, 4, 4, 6, 8]), p = poles / 2, n0 = 3000 / p
      const slip = pick([0.025, 0.03, 0.04, 0.05, 0.06]), n = Math.round(n0 * (1 - slip)), k = pick([5, 6, 7])
      const P1 = P2 / eta, In = P2 * 1000 / (SQ3 * 400 * cos * eta), Id = k * In, Iy = Id / 3
      const g = root(560, 300, 'Motor névleges adattáblája')
      g.append(R(35, 20, 490, 255, 'cr-box', { rx: 8 }), T(280, 52, 'HÁROMFAZISÚ ASZINKRONMOTOR', { class: 'cr-big' }))
      const rows = [['P2', f(P2, 1) + ' kW'], ['Δ/Y', '400/690 V'], ['cos φ', f(cos)], ['η', f(eta)], ['n', n + ' 1/min'], ['f', '50 Hz']]
      rows.forEach((r, i) => { const y = 78 + i * 29; g.append(L(55, y + 8, 505, y + 8, 'cr-thin'), T(95, y, r[0], { 'text-anchor': 'start', class: 'cr-svgtext' }), T(475, y, r[1], { 'text-anchor': 'end', class: 'cr-svgtext' })) })
      const task = h('div', { class: 'cr-task' })
      el.append(brief(`Egy szivattyú motorja közvetlen deltaindításnál ${k}·In áramot vesz fel. Számold ki a névleges üzemi és indítási adatokat.`), g, task, learn('Az adattábla P2-je leadott teljesítmény; η-val osztasz, a névleges fordulat fölötti szinkron értéket választod, csillagban pedig a vonali indítóáram 1/3.'))
      const steps = [
        N('Felvett hatásos teljesítmény', P1, 'kW', 'P1 = P2 / η', `${f(P2, 1)} / ${f(eta)}`, 'A felvett teljesítmény nagyobb a leadottnál, ezért η-val osztani kell.', [[P2 * eta, 'Így a leadottnál kisebb lett a felvett teljesítmény. η-val osztani kell, nem szorozni.']]),
        N('Szinkron fordulatszám', n0, '1/min', 'n0 = 60 · f / p', `60 · 50 / ${p}`, `A ${n} 1/min fölötti legközelebbi szokásos szinkron fordulatot válaszd.`, [[6000 / poles, 'A pólusszámmal osztottál, pedig p a póluspárok száma.']], { digits: 0, integer: true }),
        Q('Póluspárok száma', String(p), ['1', '2', '3', '4'], `p = 60·f/n0 = 3000/${n0} = ${p}; a motor ${poles} pólusú.`),
        N('Névleges szlip százalékban', 100 * (n0 - n) / n0, '%', 's = (n0 − n) / n0 · 100', `(${n0} − ${n}) / ${n0} · 100`, 'A szinkron és a névleges fordulat különbségét a szinkron fordulathoz viszonyítod.', [[100 * (n0 - n) / n, 'A nevező n0, nem a mért névleges fordulat.']]),
        N('Névleges vonali áram', In, 'A', 'In = P2 · 1000 / (√3 · U · cos φ · η)', `${P2 * 1000} / (1,732 · 400 · ${f(cos)} · ${f(eta)})`, 'W-ban helyettesíts; a nevezőben √3, U, cosφ és η is szerepel.', [[P2 * 1000 / (SQ3 * 400 * cos), 'Kimaradt az η: az adattáblán leadott teljesítmény szerepel.'], [P2 * 1000 / (400 * cos * eta), 'Kimaradt a √3 a háromfázisú képletből.']]),
        N('Közvetlen deltaindítás árama', Id, 'A', `Iind,Δ = ${k} · In`, `${k} · ${f(In)}`, 'A feladat adott indítóáram-többszörösét a számított In-nel szorozd.'),
        N('Indítóáram csillag fokozatban', Iy, 'A', 'Iind,Y = Iind,Δ / 3', `${f(Id)} / 3`, 'A hálózati vonali áram csillagban harmada a deltaindításnak, nem 1/√3-szorosa.', [[Id / SQ3, 'A tekercsfeszültség 1/√3-szoros, de a hálózati indítóáram aránya 1/3.']]),
      ]
      calcSteps(task, api, steps, `Ellenőrzés: P1 = ${f(P1)} kW > P2, In = ${f(In)} A, s = ${f(100 * (n0 - n) / n0)}%.`)
    },
  })

  // ===================================================================== 4. Hurokimpedancia
  W.register({
    id: 'lepes-hurok', module: 'm12-vezetekmeretezes-vedelem', kind: 'task',
    title: 'Hurokimpedancia összetevői – lekapcsol 0,4 s alatt?',
    lead: 'Számold össze a hibahurok impedanciáját, majd hasonlítsd a zárlati áramot a kismegszakító biztos mágneses kioldási áramával.',
    mount(el, api) {
      const Zsrc = rstep(0.25, 0.55, 0.05), l = pick([20, 25, 30, 40, 50, 60]), A = pick([1.5, 2.5, 4]), In = pick([6, 10, 16, 20]), ch = Math.random() < .5 ? 'B' : 'C', k = ch === 'B' ? 5 : 10
      const Rw = RHO * 2 * l / A, Zs = Zsrc + Rw, Ik = 230 / Zs, Ia = k * In, ok = Ik >= Ia
      let remedy
      if (ok) remedy = 'Igen, Ik ≥ Ia, a 0,4 s-os lekapcsolás teljesül.'
      else if (ch === 'C' && 230 / Zs >= 5 * In) remedy = 'Nem; azonos In mellett B karakterisztikára váltanék, és újramérném.'
      else remedy = 'Nem; nagyobb keresztmetszetű vezetéket alkalmaznék, és újramérném.'
      const g = root(640, 235, 'TN hibahurok impedanciájának összetevői')
      g.append(C(75, 75, 24, 'cr-box'), C(75, 108, 24, 'cr-box'), T(75, 36, 'trafó'), P('M99 75H205', 'cr-wire cr-l'), R(205, 58, 78, 34), T(244, 80, ch + In), P(`M283 75H510V126`, 'cr-wire cr-l'), T(400, 65, `l = ${l} m · ${f(A, 1)} mm² Cu`), R(485, 126, 90, 55), T(530, 150, 'fém test'), T(530, 167, 'testzárlat'), P('M75 132V198H530V181', 'cr-wire cr-pe'), P('M75 132V198H530V181', 'cr-wire cr-pey'), ground(g, 75, 210), T(320, 220, `Zforrás = ${f(Zsrc)} Ω · U0 = 230 V`))
      const task = h('div', { class: 'cr-task' })
      el.append(brief(`A kerti műhely ${l} m-re van az elosztótól. A trafó és a hálózat együttes hurokimpedanciája a mérőhelyig ${f(Zsrc)} Ω; onnan ${f(A, 1)} mm²-es rézvezeték megy a fogyasztóhoz. A védelem ${ch}${In}, U0 = 230 V, ρ = 0,0178 Ω·mm²/m.`), g, task, learn('TN-ben a 0,4 s-os feltételhez Ik = U0/Zs ≥ Ia kell; B-nél 5·In, C-nél 10·In a biztos mágneses határ.'))
      const opts = shuffle([remedy,
        ok ? 'Nem; a kismegszakító névleges áramát megnövelném.' : 'Nem; vékonyabb vezetéket és nagyobb In-t választanék.',
        ok ? 'Nem; az In önmagában nagyobb, mint a zárlati áram.' : 'Nem; C karakterisztikára váltanék B-ről, mert az előbb leold.',
        'Csak az üzemi In és Ik aránya dönt, a karakterisztika nem számít.'])
      const steps = [
        N('A fogyasztói vezeték oda-vissza ellenállása', Rw, 'Ω', 'Rvez = ρ · 2l / A', `0,0178 · 2 · ${l} / ${f(A, 1)}`, 'A hibahurokban az áram odafelé és visszafelé is vezetéken folyik: 2l.', [[Rw / 2, 'Kimaradt a 2-es szorzó: csak az oda utat számoltad.']]),
        N('Teljes hurokimpedancia', Zs, 'Ω', 'Zs = Zforrás + Rvez', `${f(Zsrc)} + ${f(Rw)}`, 'A forrásoldali és a fogyasztói vezeték impedanciája sorban összeadódik.'),
        N('Várható zárlati áram', Ik, 'A', 'Ik = U0 / Zs', `230 / ${f(Zs)}`, 'A 230 V-ot a teljes Zs-szel oszd.', [[230 * Zs, 'Szoroztál osztás helyett: Ik = U0/Zs.']]),
        N(`Biztos mágneses kioldási áram (${ch})`, Ia, 'A', `Ia = ${k} · In`, `${k} · ${In}`, 'A biztos gyors kioldáshoz B-nél 5·In, C-nél 10·In.', [[In, 'A névleges áram a túlterhelési érték; a gyors zárlati kioldás B-nél 5·In, C-nél 10·In.']]),
        Q('Megfelel-e a 0,4 s-os lekapcsolás, és mi a teendő?', remedy, opts, `Ik = ${f(Ik)} A ${ok ? '≥' : '<'} Ia = ${Ia} A. ${remedy}`),
      ]
      calcSteps(task, api, steps, `Zs,max = 230/${Ia} = ${f(230 / Ia)} Ω; a számított Zs = ${f(Zs)} Ω.`)
    },
  })

  // ===================================================================== 5. Keresztmetszet és korrekció
  W.register({
    id: 'lepes-keresztmetszet', module: 'm12-vezetekmeretezes-vedelem', kind: 'task',
    title: 'Keresztmetszet: Ib ≤ In ≤ Iz′ és feszültségesés',
    lead: 'Válaszd ki a vezetéket és a védelmet együtt. A megadott terhelhetőségek és korrekciós tényezők tájékoztatók; valós tervezésnél a szerelési mód hivatalos táblázata dönt.',
    mount(el, api) {
      const Pw = pick([2200, 3000, 3600, 4500, 5500]), l = pick([18, 25, 32, 40, 50]), limit = Math.random() < .5 ? 3 : 5, kt = pick([0.8, 0.87, 0.9]), kg = pick([0.7, 0.8, 1])
      const Ib = Pw / 230, In = IN_STD.find((x) => x >= Ib), A0 = AS.find((a) => IZ[a] >= In), Iz0 = IZ[A0] * kt * kg
      const A = AS.find((a) => IZ[a] * kt * kg >= In && 100 * (2 * Ib * l * RHO / a) / 230 <= limit)
      const dU = 2 * Ib * l * RHO / A, eps = 100 * dU / 230, good = eps <= limit
      const g = root(640, 175, 'Egyfázisú vezeték méretezése')
      g.append(R(30, 55, 110, 60), T(85, 82, 'Elosztó'), T(85, 100, 'B' + In), P('M140 85H480', 'cr-wire cr-l'), P('M140 115H480', 'cr-wire cr-n'), T(310, 75, `l = ${l} m · A = ? mm² Cu`), R(480, 50, 130, 80), T(545, 83, `${f(Pw / 1000)} kW`), T(545, 105, '230 V'), T(320, 155, `Megengedett esés: ${limit}%`))
      const task = h('div', { class: 'cr-task' })
      el.append(brief(`Egy ${Pw} W-os ohmos kerti fűtőkészülék 230 V-ról, ${l} m-re üzemel. A környezeti hőmérséklet és a közös cső miatt csökkenteni kell a terhelhetőséget. A megengedett feszültségesés ${limit}%.`), g,
        table(['Tájékoztató adat', 'Érték'], [['k₁ hőmérsékleti tényező', f(kt)], ['k₂ csoportosítási tényező', f(kg)], ['ρ réz', '0,0178 Ω·mm²/m'], ['Szabványos In', IN_STD.join(', ') + ' A']]),
        table(['A (mm²)', ...AS.map((a) => f(a, 1))], [['Iz alapérték (A)', ...AS.map((a) => f(IZ[a], 1))]]), task,
        learn('A vizsgán a korrekciók utáni Iz′ dönt, utána a feszültségesést is ellenőrizni kell; a két feltételből a nagyobb keresztmetszet a jó.'))
      const aOpts = shuffle(AS.map((a) => f(a, 1) + ' mm²'))
      const steps = [
        N('Tervezett üzemi áram', Ib, 'A', 'Ib = P / U', `${Pw} / 230`, 'Ohmos fogyasztónál cosφ = 1; a W nem kW.', [[Pw / 1000 / 230 * 1000, 'Itt a kW/W keveredés miatt rossz az átváltás. Használd közvetlenül a wattot: P/U.']]),
        Q('Legkisebb szabványos kismegszakító (B)', 'B' + In, IN_STD.map((x) => 'B' + x), `In ≥ Ib: ${f(Ib)} A után az első szabványos érték B${In}.`),
        N(`A ${f(A0, 1)} mm² korrekciós terhelhetősége`, Iz0, 'A', 'Iz′ = Iz · k₁ · k₂', `${f(IZ[A0], 1)} · ${f(kt)} · ${f(kg)}`, 'A két csökkentő tényezőt összeszorzod az alap Iz-vel.', [[IZ[A0] * (kt + kg), 'A tényezők szorzódnak, nem adódnak össze.']]),
        Q('Legkisebb keresztmetszet, amely Iz′ és ΔU szerint is megfelel', f(A, 1) + ' mm²', aOpts, `A választott A = ${f(A, 1)} mm²: Iz′ = ${f(IZ[A] * kt * kg)} A ≥ In = ${In} A, és a feszültségesés is határon belül van.`),
        N('Feszültségesés a választott vezetéken', dU, 'V', 'ΔU = 2 · Ib · l · ρ / A', `2 · ${f(Ib)} · ${l} · 0,0178 / ${f(A, 1)}`, 'Egyfázisban az oda-vissza út miatt 2-es szorzó kell.', [[dU / 2, 'Kimaradt a 2-es szorzó: az L és az N ellenállása együtt számít.']]),
        N('Feszültségesés százalékban', eps, '%', 'ε = ΔU / U · 100', `${f(dU)} / 230 · 100`, 'A kapott voltot 230 V-hoz viszonyítod, majd százzal szorzod.'),
        Q(`Megfelel-e a ${limit}%-os határnak?`, good ? 'Igen' : 'Nem', ['Igen', 'Nem'], `ε = ${f(eps)}% ${good ? '≤' : '>'} ${limit}%.`),
      ]
      calcSteps(task, api, steps, `Végeredmény: B${In} és ${f(A, 1)} mm² Cu; ${f(Ib)} ≤ ${In} ≤ ${f(IZ[A] * kt * kg)} A, ε = ${f(eps)}%.`)
    },
  })

  // ===================================================================== 6. Energia és költség
  W.register({
    id: 'lepes-energia', module: 'm11-alapszamitasok', kind: 'task',
    title: 'Havi energia, költség és LED-csere',
    lead: 'Minden teljesítményt W-ban kapsz. Előbb kW-ra váltasz, azután P·t·30; a végén a Ft/kWh árral számolsz.',
    mount(el, api) {
      const tariff = pick([52, 65, 70, 75]), days = 30
      const pool = shuffle([
        { n: 'villanybojler', P: pick([1800, 2000, 2200, 2400]), h: pick([1.5, 2, 2.5, 3]) },
        { n: 'mosógép (átlagos felvétel)', P: pick([700, 900, 1200]), h: pick([0.5, 0.75, 1]) },
        { n: 'hűtőszekrény (átlagos felvétel)', P: pick([100, 120, 150]), h: pick([6, 8, 10]) },
        { n: 'számítógép', P: pick([180, 250, 350]), h: pick([2, 3, 4, 5]) },
      ])
      const light = { n: 'régi világítás', P: pick([80, 100, 120, 160]), h: pick([3, 4, 5, 6]) }
      const items = [...pool.slice(0, 3), light].map((x) => ({ ...x, E: x.P / 1000 * x.h * days }))
      const total = items.reduce((a, x) => a + x.E, 0), cost = total * tariff, max = items.reduce((a, x) => x.E > a.E ? x : a)
      const newP = Math.max(10, Math.round(light.P / 8 / 5) * 5), saving = (light.P - newP) / 1000 * light.h * days * tariff
      const g = root(640, 210, 'Háztartási fogyasztók és napi üzemidők')
      g.append(R(25, 35, 125, 120), T(87, 80, '230 V'), T(87, 105, 'mérő'), T(87, 130, `${tariff} Ft/kWh`))
      items.forEach((x, i) => { const y = 32 + i * 42; g.append(P(`M150 115H190V${y}H250`, 'cr-thin'), R(250, y - 16, 350, 32), T(270, y + 5, `${x.n}: ${x.P} W · ${f(x.h, 1)} h/nap`, { 'text-anchor': 'start', class: 'cr-svgtext' })) })
      const task = h('div', { class: 'cr-task' })
      el.append(brief(`Egy háztartás ${items.length} jellemző fogyasztóját vizsgáljuk 30 napos hónapban. A világítást ${newP} W-os, azonos üzemidejű LED-re cseréljük.`), g, task, learn('A vizsgán a W → kW váltás és a havi óraszám a kulcs; megtakarításnál a régi és új teljesítmény különbségével számolj.'))
      const steps = items.map((x) => N(`${x.n} havi energiája`, x.E, 'kWh', 'E = P/1000 · tnapi · 30', `${x.P}/1000 · ${f(x.h, 1)} · 30`, 'Előbb W-ból kW, majd kW · h · nap.', [[x.E * 1000, 'W-ban hagytad a teljesítményt: kWh-hoz ezrel osztani kell.']]))
      steps.push(
        N('A négy fogyasztó havi összenergiája', total, 'kWh', 'Eössz = E1 + E2 + E3 + E4', items.map((x) => f(x.E)).join(' + '), 'A részenergiákat most már azonos mértékegységben adod össze.'),
        N('Havi villamosenergia-költség', cost, 'Ft', 'K = Eössz · tarifa', `${f(total)} · ${tariff}`, 'kWh-t szorzol Ft/kWh-val; az eredmény Ft.', [], { digits: 0 }),
        Q('Melyik a legnagyobb energiatétel?', max.n, items.map((x) => x.n), `${max.n}: ${f(max.E)} kWh/hó, ez a legnagyobb. Nem a legnagyobb watt, hanem a P·t szorzat dönt.`),
        N('Havi megtakarítás a LED-cserével', saving, 'Ft', 'Kmegt = (Prégi − PLED)/1000 · tnapi · 30 · tarifa', `(${light.P} − ${newP})/1000 · ${f(light.h, 1)} · 30 · ${tariff}`, 'A teljesítménykülönbségből számold a megtakarított kWh-t, utána szorozd a tarifával.', [], { digits: 0 }),
      )
      calcSteps(task, api, steps, `Összesen ${f(total)} kWh, ${f(cost, 0)} Ft; a LED-csere hozzávetőlegesen ${f(saving, 0)} Ft/hó.`)
    },
  })

  // ===================================================================== 7. TT földelés
  W.register({
    id: 'lepes-tt-foldeles', module: 'm03-aramutes-elleni-vedelem', kind: 'task',
    title: 'TT rendszer: földelési ellenállás és érintési feszültség',
    lead: 'TT-ben az önműködő lekapcsolás feltétele RA·IΔn ≤ 50 V. A 30 mA-et mindig 0,03 A-re váltod.',
    mount(el, api) {
      const idmA = pick([30, 100, 300]), Idn = idmA / 1000, RAmax = 50 / Idn, R1 = pick([45, 60, 80, 100, 120, 160, 200]), RA = Math.round(R1 * pick([0.7, 0.9, 1.1, 1.3])), ok = RA <= RAmax, Rp = R1 / 2, Ut = Rp * Idn
      const g = root(640, 260, 'TT földelés ÁVK-val és két földelőszondával')
      g.append(P('M45 50H265', 'cr-wire cr-l'), P('M45 85H265', 'cr-wire cr-n'), R(150, 30, 100, 80), T(200, 65, `ÁVK ${idmA} mA`), T(200, 88, 'IΔn'), P('M265 50H450V95', 'cr-wire cr-l'), P('M265 85H450V110', 'cr-wire cr-n'), R(410, 95, 100, 60), T(460, 130, 'fém test'), P('M460 155V190H180V220', 'cr-wire cr-pe'), P('M460 155V190H180V220', 'cr-wire cr-pey'), ground(g, 180, 225), ground(g, 280, 225), P('M180 195H280V201', 'cr-wire cr-pe'), T(370, 224, `RA,mért = ${RA} Ω`), T(230, 250, `két egyforma szonda: R1 = R2 = ${R1} Ω`))
      const task = h('div', { class: 'cr-task' })
      el.append(brief(`Egy TT rendszerű hétvégi ház készülékeit ${idmA} mA-es ÁVK védi. A meglévő földelési ellenállás ${RA} Ω. Két egyforma, egyenként ${R1} Ω-os szondát párhuzamosan kötünk (egyszerűsített számítás, a mért értéktől független vizsgálati példa).`), g, task, learn('TT-ben nem a kismegszakító Zs-feltétele a kiindulás: RA·IΔn ≤ 50 V; két egyforma szonda eredője feleződik.'))
      const steps = [
        N('Megengedett legnagyobb RA', RAmax, 'Ω', 'RA,max = UL / IΔn = 50 / IΔn', `50 / ${f(Idn, 2)}`, 'mA-ból A: 1000-rel osztasz. UL = 50 V.', [[50 / idmA, 'mA-ben osztottál: előbb 0,' + String(idmA).padStart(2, '0') + ' A-re kell váltani.']]),
        Q(`A mért ${RA} Ω megfelel-e az ÁVK-val?`, ok ? 'Megfelel' : 'Nem felel meg', ['Megfelel', 'Nem felel meg'], `${RA} Ω ${ok ? '≤' : '>'} ${f(RAmax)} Ω.`),
        N('Két párhuzamos, egyforma szonda eredője', Rp, 'Ω', 'Reredő = R1 · R2 / (R1 + R2) = R1/2', `${R1} · ${R1} / (${R1} + ${R1})`, 'Egyforma párhuzamos ellenállásoknál az eredő az egyik fele.', [[2 * R1, 'Párhuzamosan az eredő kisebb, nem kétszeres. Két egyformánál R1/2.']]),
        N('Érintési feszültség az IΔn-nél, az eredő RA-val', Ut, 'V', 'Ut ≈ Reredő · IΔn', `${f(Rp)} · ${f(Idn, 2)}`, 'Ohm törvénye: U = R·I; az áramot A-ben helyettesíted.', [[Rp * idmA, 'mA és A keveredése: az áramot A-ben kell behelyettesíteni.']]),
        Q('50 V alatt marad-e az érintési feszültség?', Ut <= 50 ? 'Igen' : 'Nem', ['Igen', 'Nem'], `Ut = ${f(Ut)} V ${Ut <= 50 ? '≤' : '>'} 50 V.`),
      ]
      calcSteps(task, api, steps, `RA,max = ${f(RAmax)} Ω; a két szonda eredője ${f(Rp)} Ω, Ut = ${f(Ut)} V.`)
    },
  })

  // ===================================================================== 8. Világítási számítás
  W.register({
    id: 'lepes-vilagitas', module: 'm14-kabelek-szereles-kulonleges-helyek', kind: 'task',
    title: 'Lámpatestszám lumenmódszerrel és elrendezés',
    lead: 'Egyszerűsített lumenmódszer: N = E·A/(F·k·η). A lámpatestszámot mindig felfelé kerekíted.',
    mount(el, api) {
      const a = pick([4, 5, 6]), b = pick([3, 4, 5, 6]), E = pick([100, 200, 300, 500]), F = pick([1600, 2400, 3200, 4000]), k = pick([0.7, 0.8]), eta = pick([0.5, 0.6, 0.7])
      const area = a * b, flux = E * area / (k * eta), exact = flux / F, count = Math.ceil(exact)
      const candidates = []
      for (let r = 1; r <= Math.ceil(Math.sqrt(count)); r++) for (let c = Math.ceil(count / r); c <= Math.ceil(count / r) + 1; c++) candidates.push([r, c])
      candidates.push([1, count], [count, 1])
      const layouts = [...new Map(candidates.map((x) => [x.join('x'), x])).values()].slice(0, 5)
      const bestCap = Math.min(...layouts.map(([r, c]) => r * c)), best = layouts.find(([r, c]) => r * c === bestCap)
      const layoutText = (x) => `${x[0]} sor × ${x[1]} oszlop (${x[0] * x[1]} test)`
      const answer = layoutText(best), options = shuffle(layouts.map(layoutText))
      const box = h('div'), task = h('div', { class: 'cr-task' })
      el.append(brief(`Egy ${a} m × ${b} m-es munkahelyiségben ${E} lx átlagos megvilágítást ír elő a terv. Egy lámpatest fényárama ${F} lm, karbantartási tényező k = ${f(k)}, helyiség- és lámpahatásfok η = ${f(eta)}.`), box, task, learn('A világítási alapszámításnál a szükséges összfényáramot a két tényező csökkenti; a kapott testszámot felfelé kerekíted, a rácsban a sor×oszlop szorzat legalább ennyi.'))
      function room(done) {
        const g = root(520, 330, 'Helyiség és lámpatest-elrendezés')
        g.append(R(45, 35, 420, 250), T(255, 18, `${a} m × ${b} m = ${area} m²`))
        if (done >= 4) {
          for (let r = 0; r < best[0]; r++) for (let c = 0; c < best[1]; c++) {
            const x = 70 + (c + .5) * 370 / best[1], y = 55 + (r + .5) * 210 / best[0]
            lamp(g, x, y, 10)
          }
          g.append(T(255, 312, `${answer}; szükséges: ${count} db`, { class: 'cr-big' }))
        } else g.append(T(255, 165, 'Az elrendezés a 4. lépés után rajzolódik ki.'))
        paint(box, g)
      }
      const steps = [
        N('Helyiség alapterülete', area, 'm²', 'A = a · b', `${a} · ${b}`, 'A két méretet m-ben szorzod.', [], { digits: 0 }),
        N('Szükséges hasznos összfényáram', flux, 'lm', 'Φ = E · A / (k · η)', `${E} · ${area} / (${f(k)} · ${f(eta)})`, 'A karbantartási és hatásfoktényező miatt nagyobb fényáram kell: mindkettővel osztasz.', [[E * area * k * eta, 'Szoroztál osztás helyett: a veszteségek miatt k·η-val osztani kell.']], { digits: 0 }),
        N('Szükséges lámpatestszám (felfelé kerekítve)', count, 'db', 'N = Φ / F, majd felfelé egészre', `${f(flux, 0)} / ${F} = ${f(exact)} → ${count}`, 'Még 4,1 test esetén is 5 kell: részlámpatest nem szerelhető.', [[Math.floor(exact), 'Lelőre kerekítetted; a megvilágítás így nem érné el az előírást.']], { digits: 0, integer: true }),
        Q('Leggazdaságosabb szabályos elrendezés a felkínáltak közül', answer, options, `A ${bestCap} férőhelyes rácsok felelnek meg: legalább ${count} hely, a felkínáltak között a legkevesebb fölösleggel. Például ${answer}.`, { accepted: layouts.filter(([r, c]) => r * c === bestCap).map(layoutText) }),
      ]
      calcSteps(task, api, steps, `Φ = ${f(flux, 0)} lm, N = ${count} db, elrendezés: ${answer}.`, room)
      room(0)
    },
  })

  // ===================================================================== 9. Transzformátor
  W.register({
    id: 'lepes-trafo', module: 'm15-tulfeszultseg-pv-transzformator', kind: 'task',
    title: 'Biztonsági transzformátor – áttétel, áramok, menetszám',
    lead: 'Ideális, egyfázisú SELV-transzformátorral számolj: a feszültségek aránya egyezik a menetszámok arányával, az áramok aránya fordított.',
    mount(el, api) {
      const U1 = 230, U2 = pick([12, 24]), Sva = pick([40, 60, 100, 120]), base = 230 / (U2 === 12 ? 2 : 1), mult = pick([4, 8, 10]), N1 = base * mult, N2 = N1 * U2 / U1, ratio = U1 / U2, I2 = Sva / U2, I1 = Sva / U1
      const g = root(640, 235, 'Egyfázisú biztonsági transzformátor')
      g.append(P('M45 75H215', 'cr-wire cr-l'), P('M45 155H215', 'cr-wire cr-n'), C(260, 85, 45, 'cr-box'), C(260, 155, 45, 'cr-box'), T(260, 30, 'T1'), P('M305 85H470', 'cr-wire cr-l'), P('M305 155H470', 'cr-wire cr-n'), R(470, 65, 125, 110), T(532, 103, 'SELV'), T(532, 128, `${U2} V`), T(532, 151, 'fogyasztó'), T(130, 60, `${U1} V`), T(390, 60, `${U2} V`), T(320, 218, `S = ${Sva} VA · N1 = ${N1} menet · megerősített szigetelés`))
      const task = h('div', { class: 'cr-task' })
      el.append(brief(`Egy ${U1}/${U2} V-os, ${Sva} VA-es biztonsági transzformátor nedves helyiség SELV-világítását táplálja. A primer menetszám ${N1}. Számold ki az áttételt, a névleges áramokat és a szekunder menetszámot.`), g, task, learn('S = U·I mindkét oldalon; U1/U2 = N1/N2, de I1/I2 = N2/N1. A biztonsági elválasztás a SELV lényege.'))
      const steps = [
        N('Feszültségáttétel', ratio, '', 'a = U1 / U2', `${U1} / ${U2}`, 'A nagyobb primer feszültséget a kisebb szekunderrel oszd.'),
        N('Névleges szekunder áram', I2, 'A', 'I2 = S / U2', `${Sva} / ${U2}`, 'VA/V = A; a látszólagos teljesítményt a szekunder feszültséggel oszd.'),
        N('Névleges primer áram', I1, 'A', 'I1 = S / U1', `${Sva} / ${U1}`, 'Ideális trafónál S1 = S2.', [[I2 * ratio, 'Az áramarány fordított: a primer áram kisebb, nem nagyobb a szekundernél.']]),
        N('Szekunder menetszám', N2, 'menet', 'N2 = N1 · U2 / U1', `${N1} · ${U2} / ${U1}`, 'A menetszám a feszültséggel azonos arányban változik.', [[N1 * ratio, 'Fordítva arányoztál: N2 = N1·U2/U1.']], { digits: 0, integer: true }),
      ]
      calcSteps(task, api, steps, `Ellenőrzés: U1·I1 = ${f(U1 * I1)} VA ≈ U2·I2 = ${f(U2 * I2)} VA.`)
    },
  })

  // ---------- Közös rajzos kérdéssor ----------
  function questionTask(el, api, questions, okText) {
    const wrap = h('div', { class: 'cr-questions' })
    const rows = questions.map((q, i) => {
      const why = h('p', { class: 'cr-why' })
      let input
      if (q.external) input = { el: h('span', { class: 'wsmall' }, 'A rajzon kijelölt elem a válasz.'), get value() { return q.external() } }
      else if (q.multi) {
        const boxes = []
        input = { get value() { return boxes.filter((b) => b.checked).map((b) => b.value).sort() } }
        const grid = h('div', { class: 'cr-checks', role: 'group', 'aria-label': q.label })
        q.options.forEach((o) => { const b = h('input', { type: 'checkbox', value: o.v ?? o }); boxes.push(b); grid.append(h('label', {}, b, o.t ?? o)) })
        input.el = grid
      } else input = { el: sel(q.options, q.label), get value() { return this.el.value } }
      const card = h('div', { class: 'cr-q', 'data-question': i + 1 }, h('b', {}, `${i + 1}. ${q.label}`), input.el, why)
      wrap.append(card)
      return { q, input, card, why }
    })
    el.append(wrap, h('div', { class: 'wrow' }, h('button', { type: 'button', class: 'primary', onclick: () => {
      let good = 0
      rows.forEach((r) => {
        const value = r.input.value
        const ok = r.q.multi ? Array.isArray(value) && value.length === r.q.answer.length && value.every((v, i) => v === [...r.q.answer].sort()[i]) : String(value) === String(r.q.answer)
        r.card.className = 'cr-q ' + (ok ? 'ok' : 'no')
        r.why.textContent = (ok ? '✓ ' : '✗ ') + r.q.explanation
        if (ok) good++
      })
      api.done(good === rows.length, good === rows.length ? okText : `${good}/${rows.length} válasz helyes. A bekeretezett magyarázatok mutatják a javítást.`)
    } }, 'Ellenőrzés')))
  }

  function installSym(kind, x, y, scale = .55) {
    const st = { stroke: 'var(--fg)', 'stroke-width': 2.2, fill: 'none', 'stroke-linecap': 'round' }
    const l = (x1, y1, x2, y2) => s('line', { x1, y1, x2, y2, ...st })
    const arm = (dir, ticks = 1) => {
      const g = s('g', {}, l(32 + dir * 4.2, 34 - dir * 4.2, 32 + dir * 20, 34 - dir * 20))
      for (let i = 0; i < ticks; i++) { const t = 1 - i * .22, bx = 32 + dir * (4.2 + 15.8 * t), by = 34 - dir * (4.2 + 15.8 * t); g.append(l(bx, by, bx + dir * 5, by + dir * 5)) }
      return g
    }
    const armB = (dir) => { const x2 = 32 + dir * 20, y2 = 34 + dir * 20; return s('g', {}, l(32 + dir * 4.2, 34 + dir * 4.2, x2, y2), l(x2, y2, x2 - dir * 5, y2 + dir * 5)) }
    const g = s('g', { transform: `translate(${x} ${y}) scale(${scale})` })
    if (kind === 'lampa') g.append(s('circle', { cx: 32, cy: 32, r: 14, ...st }), l(22, 22, 42, 42), l(42, 22, 22, 42))
    else if (kind === 'dugalj') g.append(s('path', { d: 'M16 30 A16 16 0 0 0 48 30', ...st }), l(16, 30, 48, 30), l(14, 22, 50, 22), l(32, 22, 32, 10))
    else if (kind === 'nyomogomb') g.append(s('circle', { cx: 32, cy: 32, r: 12, ...st }), s('circle', { cx: 32, cy: 32, r: 4, fill: 'var(--fg)' }))
    else {
      g.append(s('circle', { cx: 32, cy: 34, r: 4, fill: 'var(--fg)' }))
      if (kind === 'egypolusu') g.append(arm(1))
      if (kind === 'csillar') g.append(arm(1, 2))
      if (kind === 'valto') g.append(arm(1), arm(-1))
      if (kind === 'kereszt') g.append(arm(1), arm(-1), armB(1), armB(-1))
    }
    return g
  }
  function ticks(g, x, y, n, vertical = false) {
    for (let i = 0; i < n; i++) {
      const dx = (i - (n - 1) / 2) * 6
      if (vertical) g.append(L(x + dx - 3, y + 5, x + dx + 3, y - 5, 'cr-thin'))
      else g.append(L(x + dx - 3, y + 6, x + dx + 3, y - 6, 'cr-thin'))
    }
  }
  function junction(g, x, y, name) { g.append(C(x, y, 10, 'cr-box'), C(x, y, 3), T(x, y - 16, name, { class: 'cr-small' })) }

  // ===================================================================== 10. Alaprajz-olvasás
  const PLAN_TEMPLATES = [
    {
      name: 'A', room: 'Szoba + előszoba, váltókapcsolt előszobai lámpa', scale: '1:50 · 1 rajzi egység = 0,05 m', length: 8.4,
      dev: [['egypolusu', 120, 270, 'S1 · 101'], ['valto', 420, 270, 'S2 · 106'], ['valto', 535, 95, 'S3 · 106'], ['lampa', 220, 120, 'E1'], ['lampa', 465, 155, 'E2'], ['dugalj', 115, 75, 'DZ1'], ['dugalj', 300, 75, 'DZ2'], ['dugalj', 520, 235, 'DZ3']],
      paths: [[335, 305, 120, 305], [120, 305, 120, 285], [120, 285, 120, 200], [120, 200, 335, 200], [335, 200, 335, 160], [335, 160, 220, 160], [220, 160, 220, 128], [335, 305, 420, 305], [420, 305, 420, 285], [420, 285, 420, 200], [420, 200, 535, 200], [535, 200, 535, 115], [535, 115, 535, 155], [535, 155, 474, 155], [335, 305, 335, 95], [335, 95, 555, 95]],
      tick: [480, 200, 4, false], tickLabel: 'X–Y: S2–S3 közti szakasz',
      questions: [
        ['Melyik lámpát kapcsolja S1?', 'E1', ['E1', 'E2', 'E1 és E2'], 'S1 (101) egy kapcsolt fázisa E1-hez fut; E2-t nem kapcsolja.'],
        ['Melyik lámpát kapcsolja S2 és S3?', 'E2', ['E1', 'E2', 'E1 és E2'], 'A két 106-os váltókapcsoló az E2 előszobai lámpát kapcsolja két helyről.'],
        ['Hány ér fut az X–Y (S2–S3) szakaszon, PE-vel együtt?', '4', ['2', '3', '4', '5'], '2 korrespondáló + N + PE = 4 ér; a vonalkák is 4-et jelölnek.'],
        ['Hány kapcsoló kell összesen?', '3', ['2', '3', '4'], '1 db 101 + 2 db 106 = 3 db kapcsoló.'],
        ['Hány 2P+F dugalj látható?', '3', ['2', '3', '4'], 'DZ1, DZ2, DZ3: 3 db védőérintkezős dugalj.'],
      ],
    },
    {
      name: 'B', room: 'Szoba + előszoba, csillárkapcsolós szobai világítás', scale: '1:50 · 1 rajzi egység = 0,05 m', length: 6.8,
      dev: [['csillar', 120, 270, 'S1 · 105'], ['egypolusu', 520, 270, 'S2 · 101'], ['lampa', 175, 115, 'E1'], ['lampa', 300, 115, 'E2'], ['lampa', 465, 155, 'E3'], ['dugalj', 115, 75, 'DZ1'], ['dugalj', 525, 235, 'DZ2']],
      paths: [[335, 305, 120, 305], [120, 305, 120, 285], [120, 285, 120, 200], [120, 200, 335, 200], [335, 200, 335, 160], [335, 160, 175, 160], [175, 160, 175, 124], [335, 160, 300, 160], [300, 160, 300, 124], [335, 305, 520, 305], [520, 305, 520, 285], [520, 285, 520, 155], [520, 155, 474, 155], [335, 305, 335, 95], [335, 95, 555, 95]],
      tick: [220, 200, 4, false], tickLabel: 'X–Y: S1–D1 közti szakasz',
      questions: [
        ['Melyik lámpákat kapcsolja az S1 (105)?', 'E1 és E2', ['E1', 'E2', 'E3', 'E1 és E2'], 'A csillárkapcsoló két kimenete a szobai E1 és E2 lámpaköröket kapcsolja külön és együtt.'],
        ['Melyik lámpát kapcsolja S2?', 'E3', ['E1', 'E2', 'E3'], 'S2 (101) az előszobai E3-at kapcsolja.'],
        ['Hány ér fut az X–Y (S1–D1) szakaszon, PE-vel együtt?', '4', ['3', '4', '5'], '2 kapcsolt fázis + N + PE = 4 ér. A kapcsoló bemeneti L-je nem folytatódik ezen a szakaszon.'],
        ['Hány külön kapcsolószerelvény kell?', '2', ['2', '3', '4'], '1 db 105-ös csillárkapcsoló és 1 db 101-es kapcsoló.'],
        ['Hány kötődoboz van a világítási ágak elágazásánál?', '2', ['1', '2', '3'], 'D1 a két szobai lámpakörhöz, D2 az előszobai ághoz: 2 doboz.'],
      ],
    },
    {
      name: 'C', room: 'Szoba + előszoba, három lámpakör és négy dugalj', scale: '1:50 · 1 rajzi egység = 0,05 m', length: 10.2,
      dev: [['egypolusu', 105, 270, 'S1 · 101'], ['egypolusu', 250, 270, 'S2 · 101'], ['valto', 430, 270, 'S3 · 106'], ['valto', 550, 95, 'S4 · 106'], ['lampa', 125, 115, 'E1'], ['lampa', 295, 115, 'E2'], ['lampa', 465, 155, 'E3'], ['dugalj', 90, 70, 'DZ1'], ['dugalj', 245, 70, 'DZ2'], ['dugalj', 475, 235, 'DZ3'], ['dugalj', 555, 235, 'DZ4']],
      paths: [[335, 305, 105, 305], [105, 305, 105, 285], [105, 285, 105, 200], [105, 200, 335, 200], [335, 200, 335, 160], [335, 160, 125, 160], [125, 160, 125, 124], [335, 305, 250, 305], [250, 305, 250, 285], [250, 285, 250, 180], [250, 180, 295, 180], [295, 180, 295, 124], [335, 305, 430, 305], [430, 305, 430, 285], [430, 285, 430, 200], [430, 200, 550, 200], [550, 200, 550, 115], [550, 115, 550, 155], [550, 155, 474, 155], [335, 305, 335, 95], [335, 95, 565, 95]],
      tick: [490, 200, 4, false], tickLabel: 'X–Y: S3–S4 közti szakasz',
      questions: [
        ['Melyik lámpát kapcsolja S2?', 'E2', ['E1', 'E2', 'E3'], 'S2 saját kapcsolt fázisa E2-höz fut.'],
        ['Melyik lámpa kapcsolható S3-mal és S4-gyel?', 'E3', ['E1', 'E2', 'E3'], 'A két váltókapcsoló az E3-at kapcsolja.'],
        ['Hány ér fut az X–Y (S3–S4) szakaszon?', '4', ['2', '3', '4', '5'], '2 korrespondáló + N + PE = 4 ér.'],
        ['Hány kapcsoló szerepel az anyagjegyzékben?', '4', ['3', '4', '5'], '2 db 101 + 2 db 106 = 4 db.'],
        ['Hány dugalj és lámpa együtt?', '7', ['6', '7', '8'], '4 dugalj + 3 lámpa = 7 szerelvény/fényforrás-kimenet.'],
      ],
    },
  ]
  W.register({
    id: 'rajz-alaprajz', module: 'm16-dokumentacio-anyagjegyzek-hibakereses', kind: 'task',
    title: 'Alaprajz-olvasás: kapcsolás, érszám, anyagjegyzék',
    lead: 'Olvasd a nagy egyvonalas alaprajzot. A ferde vonalkák az erek számát jelölik (PE-vel együtt); a szobák határát vastag vonal rajzolja.',
    mount(el, api) {
      const d = pick(PLAN_TEMPLATES)
      const g = root(640, 405, `${d.name} változatú lakásalaprajz`)
      g.append(R(35, 30, 570, 340, 'cr-box', { style: 'fill:var(--bg);stroke-width:5' }), L(375, 30, 375, 250, 'cr-wire', { style: 'stroke-width:5' }), L(375, 315, 375, 370, 'cr-wire', { style: 'stroke-width:5' }))
      g.append(T(200, 52, 'SZOBA', { class: 'cr-big', style: 'fill:var(--muted)' }), T(490, 52, 'ELŐSZOBA', { class: 'cr-big', style: 'fill:var(--muted)' }))
      g.append(T(382, 288, 'ajtó', { class: 'cr-small' }), P('M375 250A65 65 0 0 1 440 315', 'cr-thin'))
      d.paths.forEach((p) => g.append(L(...p, 'cr-thin')))
      junction(g, 335, 160, 'D1'); junction(g, 335, 305, 'D2')
      d.dev.forEach(([kind, x, y, label]) => { g.append(installSym(kind, x - 18, y - 18, .58), T(x, y + 31, label, { class: 'cr-small' })) })
      ticks(g, ...d.tick); g.append(T(d.tick[0], d.tick[1] + 22, d.tickLabel, { class: 'cr-small' }))
      g.append(T(320, 393, `${d.scale} · D1/D2: kötődoboz · NYM-J / H07V-U a terv szerint`, { class: 'cr-small' }))
      const perColor = Math.ceil(d.length * 1.1), wire = 3 * perColor
      const qs = d.questions.map(([label, answer, options, explanation]) => ({ label, answer, options: shuffle(options.map((v) => ({ v, t: v }))), explanation }))
      qs.push({ label: `A dugaljkör nyomvonala ${f(d.length, 1)} m. Kb. hány méter H07V-U 2,5 mm² ér kell összesen (L+N+PE), +10% ráhagyással, színenként egész méterre felfelé?`, answer: String(wire), options: shuffle([perColor, wire, Math.ceil(d.length * 3 * 1.1), wire + 5].map((v) => ({ v: String(v), t: v + ' m' }))), explanation: `Színenként: ${f(d.length, 1)} m × 1,10 = ${f(d.length * 1.1)} m → ${perColor} m/szín. Összesen 3 × ${perColor} = ${wire} m; a beszerzést színenként kerekítjük.` })
      el.append(brief(`${d.name} sablon · ${d.room}. Előbb kövesd a vezetékvonalat a kapcsolótól a lámpáig, utána számold a rajzjeleket.`), g, learn('A vizsgán a rajz adja az anyagjegyzéket: jelmagyarázat, kapcsolási út, ér×hossz és ráhagyás – nem a csatornahossz önmaga.'))
      questionTask(el, api, qs, `Hibátlan rajzolvasás. A dugaljkör vezetékigénye kb. ${wire} m (három ér, 10% ráhagyással).`)
    },
  })

  // ===================================================================== 11. Érszám szakaszonként
  const CORE_VARIANTS = [
    { id: 'valto2', title: 'Váltó–váltó (106 + 106)', nodes: ['F1', 'V1', 'V2', 'E1'], counts: [3, 4, 3], why: ['L + N + PE a V1 dobozáig.', '2 korrespondáló + áthaladó N + PE.', 'kapcsolt L + N + PE a lámpáig.'], branches: [] },
    { id: 'valto3', title: 'Váltó–kereszt–váltó (106 + 107 + 106)', nodes: ['F1', 'V1', 'K', 'V2', 'E1'], counts: [3, 4, 4, 3], why: ['L + N + PE a V1 dobozáig.', '2 korrespondáló + áthaladó N + PE.', '2 korrespondáló + áthaladó N + PE.', 'V2 közöséről kapcsolt L + N + PE.'], branches: [] },
    { id: 'csillar', title: 'Csillárkapcsoló (105), két lámpakör', nodes: ['F1', 'S105', 'D1'], counts: [3, 4], why: ['L + N + PE a kapcsoló dobozáig.', '2 kapcsolt fázis + N + PE a D1 kötődobozig.'], branches: [{ from: 2, to: 'E1', count: 3, why: 'D1 → E1: az 1-es kimenet kapcsolt fázisa + N + PE.' }, { from: 2, to: 'E2', count: 3, why: 'D1 → E2: a 2-es kimenet kapcsolt fázisa + N + PE.' }] },
    { id: 'impulzus', title: 'Impulzusrelé két nyomógombbal', nodes: ['F1', 'IR/D1', 'S1', 'S2'], counts: [3, 2, 2], why: ['L + N + PE a relé/kötődoboz helyéig.', 'L + vezérlővezeték az A1 felé.', 'L + vezérlővezeték tovább a következő párhuzamos gombra.'], branches: [{ from: 1, to: 'E1', count: 3, why: 'IR/D1 → E1: a relé 14-es kimenetének kapcsolt fázisa + N + PE.' }] },
    { id: 'lepcso', title: 'Négyvezetékes lépcsőházi automata', nodes: ['F1', 'LA/D1', 'S1', 'S2'], counts: [3, 2, 2], why: ['L + N + PE az automata dobozáig.', 'L + nyomógomb-bemenet (S) vezetéke.', 'L + S vezeték a következő párhuzamos gombig.'], branches: [{ from: 1, to: 'E1', count: 3, why: 'LA/D1 → E1: az automata lámpakimenete + N + PE.' }] },
  ]
  W.register({
    id: 'rajz-eroszam', module: 'm05-vilagitasvezerlesek', kind: 'task',
    title: 'Érszám minden vezetékszakaszon – PE-vel együtt',
    lead: 'Írd be az egyvonalas rajz minden jelölt szakaszára az erek számát. A nyomógombos vezérlőágban nincs PE, de a lámpáig kötelező.',
    mount(el, api) {
      const d = pick(CORE_VARIANTS), g = root(640, 285, d.title)
      const xs = d.nodes.map((_, i) => 55 + i * (530 / (d.nodes.length - 1)))
      d.nodes.forEach((n, i) => {
        const x = xs[i]
        if (i < d.nodes.length - 1) g.append(L(x + 25, 120, xs[i + 1] - 25, 120), T((x + xs[i + 1]) / 2, 93, String.fromCharCode(65 + i), { class: 'cr-big' }), T((x + xs[i + 1]) / 2, 143, '? ér', { class: 'cr-small' }))
        if (n.startsWith('E')) lamp(g, x, 120, 18, n)
        else if (n === 'F1') g.append(W.s('rect', { x: x - 20, y: 106, width: 40, height: 28, rx: 3, fill: 'var(--card)', stroke: 'var(--fg)', 'stroke-width': 1.6 }), T(x, 125, 'B10', { class: 'cr-small' }), T(x, 165, 'F1 elosztó', { class: 'cr-svgtext' }))
        else if (n.includes('D1')) {
          const box = n.includes('/') ? W.s('rect', { x: x - 22, y: 104, width: 44, height: 32, rx: 4, fill: 'var(--card)', stroke: 'var(--fg)', 'stroke-width': 1.6 }) : W.s('circle', { cx: x, cy: 120, r: 13, fill: 'var(--card)', stroke: 'var(--fg)', 'stroke-width': 1.6 })
          g.append(box, n.includes('/') ? T(x, 125, n.split('/')[0], { class: 'cr-small' }) : W.s('circle', { cx: x, cy: 120, r: 3.5, fill: 'var(--fg)' }), T(x, 165, n.includes('/') ? n + ' (relé/automata a dobozban)' : n + ' kötődoboz', { class: 'cr-svgtext' }))
        } else {
          const kind = n.includes('105') ? 'csillar' : n === 'K' ? 'kereszt' : n.startsWith('V') ? 'valto' : n.startsWith('S') ? 'nyomogomb' : 'egypolusu'
          g.append(installSym(kind, x - 18, 102, .56), T(x, 165, n, { class: 'cr-svgtext' }))
        }
      })
      d.branches.forEach((b, i) => {
        const x = xs[b.from], nb = d.branches.length, letter = String.fromCharCode(65 + d.counts.length + i)
        const bx = Math.max(70, Math.min(x + (i - (nb - 1) / 2) * 150 - (x > 500 ? 60 : 0), 560))
        g.append(P(`M${x} 175V192H${bx}V197`, 'cr-thin'), T(bx + (bx < x ? 18 : -18), 188, letter, { class: 'cr-big' }), T(bx + 30, 222, '? ér', { class: 'cr-small', 'text-anchor': 'start' }))
        lamp(g, bx, 215, 16, b.to)
      })
      g.append(T(320, 270, 'Kövesd a vezeték funkcióját; ellenőrzés után az érlista is megjelenik.', { class: 'cr-small' }))
      const opts = [2, 3, 4, 5, 6].map((v) => ({ v: String(v), t: v + ' ér' }))
      const qs = d.counts.map((count, i) => ({ label: `${String.fromCharCode(65 + i)} szakasz: ${d.nodes[i]} → ${d.nodes[i + 1]} – hány ér?`, answer: String(count), options: opts, explanation: `${count} ér: ${d.why[i]}` }))
      d.branches.forEach((b, i) => qs.push({ label: `${String.fromCharCode(65 + d.counts.length + i)} szakasz: ${d.nodes[b.from]} → ${b.to} – hány ér?`, answer: String(b.count), options: opts, explanation: `${b.count} ér: ${b.why}` }))
      el.append(brief(`${d.title}. A betűvel jelölt szakaszokhoz válaszd ki az érszámot; ellenőrzéskor minden szakaszhoz megkapod az erlistát.`), g, learn('A vizsgán az érszám nem találgatás: korrespondálók és kapcsolt fázisok + áthaladó N + PE; nyomógombhoz csak L és vezérlőér.'))
      questionTask(el, api, qs, 'Minden szakasz érszáma helyes. A vonalkák és a funkciós erlista is ugyanazt mondja.')
    },
  })

  // ===================================================================== 12. Áramútrajz hibakeresés
  const FAULT_TYPES = [
    { v: 'null', t: 'A kapcsoló a nullát bontja', why: 'A kapcsolónak a fázist kell bontania. Nullakapcsolásnál a kikapcsolt lámpa L kapcsán fázis marad: izzócsere életveszélyes.' },
    { v: 'pe', t: 'Hiányzik a lámpatest PE-vezetője', why: 'I. osztályú fém lámpatestnél a PE kötelező. Hiányában testzárlatkor a burkolat veszélyes feszültségen maradhat.' },
    { v: 'cross', t: 'A keresztkapcsoló korrespondálói rossz kapcsokon vannak', why: 'A kereszt bemenete 1–2, kimenete 3–4. A 1–3 / 2–4 bekötés nem cseréli megfelelően a korrespondálókat, ezért nem minden helyről vált.' },
    { v: 'bypass', t: 'A lámpa megkerüli az impulzusrelé érintkezőjét', why: 'A közvetlen L-híd miatt a lámpa relétől függetlenül fázist kap és folyamatosan világít. Csak a 11–14 érintkezőn át jöhet a kapcsolt fázis.' },
    { v: 'buttonn', t: 'A nyomógomb N-t ad a relé A1 kapcsára', why: 'A nyomógomboknak L-t kell adniuk az A1-re, A2 pedig N-re megy. A1 és A2 között így nincs 230 V, a relé nem működik.' },
  ]
  function faultDiagram(g, type, correct) {
    const wire = (d, cls = 'cr-wire cr-l') => g.append(P(d, cls))
    const rails = () => { g.append(T(24, 54, 'L', { class: 'cr-big' }), T(24, 209, 'N', { class: 'cr-big' }), T(24, 249, 'PE', { class: 'cr-big' })) }
    rails()
    if (type === 'null') {
      if (correct) { wire('M45 50H220'); contact(g, 220, 50, false, 'S1'); wire('M268 50H500V105') } else wire('M45 50H500V105')
      wire('M45 205H220', 'cr-wire cr-n'); if (!correct) contact(g, 220, 205, false, 'S1'); wire('M268 205H500V145', 'cr-wire cr-n')
      wire('M45 245H535V145', 'cr-wire cr-pe'); wire('M45 245H535V145', 'cr-wire cr-pey'); lamp(g, 510, 125, 20, 'E1 fém test')
      g.append(T(320, 285, correct ? 'Helyes: S1 az L-ben; N és PE közvetlen.' : 'Tünet: kikapcsolva is fázis mérhető a lámpán.'))
    } else if (type === 'pe') {
      wire('M45 50H220'); contact(g, 220, 50, false, 'S1'); wire('M268 50H500V105'); wire('M45 205H500V145', 'cr-wire cr-n')
      if (correct) { wire('M45 245H535V145', 'cr-wire cr-pe'); wire('M45 245H535V145', 'cr-wire cr-pey') } else { wire('M45 245H390', 'cr-wire cr-pe'); wire('M45 245H390', 'cr-wire cr-pey'); g.append(T(395, 235, 'szakadt / nincs bekötve', { class: 'cr-small', 'text-anchor': 'start' })) }
      lamp(g, 510, 125, 20, 'E1 I. osztály'); g.append(T(320, 285, correct ? 'Helyes: a PE a fém lámpatest védőkapcsára kötve.' : 'A fém test védőkapcsa üresen maradt.'))
    } else if (type === 'cross') {
      wire('M45 50H90V100')
      g.append(C(90, 100, 4), C(150, 60, 4), C(150, 140, 4), L(90, 100, 140, 60), L(90, 100, 140, 140, 'cr-thin', { 'stroke-dasharray': '5 4' }), T(75, 92, 'C', { class: 'cr-small' }), T(150, 48, '1', { class: 'cr-small' }), T(150, 158, '2', { class: 'cr-small' }), T(120, 28, 'V1 · 106'))
      wire('M150 60H230'); wire('M150 140H230')
      g.append(R(230, 35, 130, 145), T(295, 26, 'K · 107'), T(242, 54, '1', { class: 'cr-small' }), T(242, 134, '2', { class: 'cr-small' }), T(348, 54, correct ? '3' : '4', { class: 'cr-small' }), T(348, 134, correct ? '4' : '3', { class: 'cr-small' }), L(230, 60, 360, 60, 'cr-thin'), L(230, 140, 360, 140, 'cr-thin'))
      wire('M360 60H450'); wire('M360 140H450')
      g.append(C(450, 60, 4), C(450, 140, 4), C(500, 100, 4), L(450, 60, 490, 100), L(450, 140, 490, 100, 'cr-thin', { 'stroke-dasharray': '5 4' }), T(450, 48, '1', { class: 'cr-small' }), T(450, 158, '2', { class: 'cr-small' }), T(515, 92, 'C', { class: 'cr-small' }), T(475, 28, 'V2 · 106'))
      wire('M500 100H555V105'); wire('M45 205H555V145', 'cr-wire cr-n'); wire('M45 245H585V145', 'cr-wire cr-pe'); wire('M45 245H585V145', 'cr-wire cr-pey'); lamp(g, 560, 125, 20, 'E1')
      g.append(T(320, 285, correct ? 'Helyes: V1 1–2 → K1–2; K3–4 → V2 1–2; V2 C → lámpa.' : 'Tünet: a lámpa csak bizonyos kapcsolóállásokban vezérelhető.'))
    } else if (type === 'bypass') {
      wire('M45 50H190'); R(185, 32, 110, 90, 'cr-box'); g.append(T(240, 65, 'IR relé'), T(240, 87, '11–14')); contact(g, 195, 105, false, '11–14'); wire('M295 105H500V105')
      if (!correct) wire('M100 50V20H520V103')
      wire('M45 205H500V145', 'cr-wire cr-n'); wire('M45 245H540V145', 'cr-wire cr-pe'); wire('M45 245H540V145', 'cr-wire cr-pey'); lamp(g, 510, 125, 20, 'E1')
      wire('M80 50V165H155'); contact(g, 155, 165, false, 'S1'); wire('M203 165H240V122'); wire('M240 122V205', 'cr-wire cr-n'); g.append(T(240, 183, 'A1–A2'))
      g.append(T(320, 285, correct ? 'Helyes: nincs közvetlen L-híd; a 14-es kapcs adja a lámpafázist.' : 'Tünet: a lámpa mindig világít, a relé nem tudja lekapcsolni.'))
    } else {
      wire('M45 50H190'); R(185, 32, 110, 90, 'cr-box'); g.append(T(240, 65, 'IR relé'), T(240, 87, '11–14')); contact(g, 195, 105, false, '11–14'); wire('M295 105H500V105'); lamp(g, 510, 125, 20, 'E1')
      wire('M45 205H500V145', 'cr-wire cr-n'); wire('M45 245H540V145', 'cr-wire cr-pe'); wire('M45 245H540V145', 'cr-wire cr-pey')
      wire(correct ? 'M80 50V165H155' : 'M80 205V165H155', correct ? 'cr-wire cr-l' : 'cr-wire cr-n'); contact(g, 155, 165, false, 'S1'); wire('M203 165H240V122'); wire('M240 122V205', 'cr-wire cr-n'); g.append(T(240, 183, 'A1–A2'))
      g.append(T(320, 285, correct ? 'Helyes: S1 L-t ad A1-re; A2 közvetlen N.' : 'Tünet: gombnyomásra a relé nem vált; A1 és A2 azonos potenciálon van.'))
    }
  }
  const FAULT_HITS = {
    null: [{ id: 'S1', x: 210, y: 172, w: 70, h: 55, label: 'S1 kapcsoló a nullavezetékben' }, { id: 'E1', x: 475, y: 90, w: 70, h: 70, label: 'E1 lámpa' }, { id: 'PE', x: 330, y: 226, w: 100, h: 38, label: 'PE-vezeték' }],
    pe: [{ id: 'PE', x: 380, y: 220, w: 145, h: 55, label: 'Hiányzó PE a lámpatest felé' }, { id: 'S1', x: 210, y: 20, w: 70, h: 55, label: 'S1 kapcsoló' }, { id: 'N', x: 320, y: 185, w: 100, h: 40, label: 'N-vezeték' }],
    cross: [{ id: 'K', x: 225, y: 30, w: 140, h: 155, label: 'K keresztkapcsoló kapcsai' }, { id: 'V1', x: 85, y: 45, w: 75, h: 105, label: 'V1 váltókapcsoló' }, { id: 'E1', x: 525, y: 90, w: 70, h: 70, label: 'E1 lámpa' }],
    bypass: [{ id: 'BYP', x: 95, y: 5, w: 435, h: 42, label: 'Közvetlen fázishíd a lámpára' }, { id: 'IR', x: 180, y: 30, w: 120, h: 100, label: 'IR impulzusrelé' }, { id: 'S1', x: 145, y: 130, w: 70, h: 65, label: 'S1 nyomógomb' }],
    buttonn: [{ id: 'S1', x: 70, y: 130, w: 145, h: 70, label: 'S1 nyomógomb N-táplálása' }, { id: 'IR', x: 180, y: 30, w: 120, h: 100, label: 'IR impulzusrelé' }, { id: 'E1', x: 475, y: 90, w: 75, h: 70, label: 'E1 lámpa' }],
  }
  const FAULT_RIGHT = { null: 'S1', pe: 'PE', cross: 'K', bypass: 'BYP', buttonn: 'S1' }
  W.register({
    id: 'rajz-aramut-hiba', module: 'm05-vilagitasvezerlesek', kind: 'task',
    title: 'Áramútrajz: kattints a hibára és nevezd meg',
    lead: 'A többvonalas rajzon egyetlen bekötési hiba van. Kattints a hibás vezetékre/elemre, válaszd ki a hiba típusát, majd ellenőrizd. Jó válasznál a helyes rajz is megjelenik.',
    mount(el, api) {
      const d = pick(FAULT_TYPES), type = d.v; let selected = ''
      const box = h('div'), typeSel = sel(shuffle(FAULT_TYPES.map((x) => ({ v: x.v, t: x.t }))), 'A hiba típusa'), chosen = h('b', {}, 'Nincs kijelölve hibás elem.')
      function draw(correct = false) {
        const g = root(640, 300, correct ? 'Helyes áramútrajz' : 'Hibás áramútrajz')
        faultDiagram(g, type, correct)
        if (!correct) FAULT_HITS[type].forEach((p) => g.append(hit(p.x, p.y, p.w, p.h, () => { selected = p.id; chosen.textContent = 'Kijelölve: ' + p.label; draw(); api.note('Most válaszd ki a hiba típusát.') }, p.label, selected === p.id)))
        paint(box, g)
      }
      el.append(brief('Vizsgáld végig az L, N és PE útját, valamint a vezérlés érintkezőit. A kattintható elemek billentyűzettel is kijelölhetők.'), box, h('div', { class: 'wrow' }, chosen, typeSel, h('button', { type: 'button', class: 'primary', onclick: () => {
        if (!selected) return api.note('Előbb kattints a hibás elemre a rajzon.', 'bad')
        if (!typeSel.value) return api.note('Válaszd ki a hiba típusát is.', 'bad')
        if (selected !== FAULT_RIGHT[type]) return api.done(false, 'Nem ezt az elemet kell megváltoztatni. Kövesd a vezetéket a forrástól a fogyasztóig, és keresd azt a pontot, ahol eltér a helyes funkció.')
        if (typeSel.value !== type) return api.done(false, 'A helyet eltaláltad, de a hibatípus nem ez. ' + d.why)
        draw(true); api.done(true, 'Megtaláltad! ' + d.why + ' A rajz most a helyes bekötést mutatja.')
      } }, 'Ellenőrzés')), learn('A vizsgán a tünetből és az áramútból azonosítod a hibát: nullakapcsolás, hiányzó PE, rossz kereszt vagy relé-megkerülés biztonsági/működési hiba.'))
      draw()
    },
  })

  // ===================================================================== 13. Elosztó egyvonalas rajz
  const PANEL_TEMPLATES = [
    { groups: [['Q1', ['F1', 'F2', 'F3']], ['–', ['F4']]], circuits: [
      ['F1', 'B10', '1,5', 'szobai világítás'], ['F2', 'B16', '2,5', 'szobai dugaljak'], ['F3', 'B16', '2,5', 'fürdőszobai dugalj'], ['F4', 'B20', '1,5', 'konyhai világítás']], bad: 'F4', modules: 8 },
    { groups: [['Q1', ['F1', 'F2', 'F3']], ['Q2', ['F4', 'F5']]], circuits: [
      ['F1', 'B10', '1,5', 'világítás'], ['F2', 'B16', '2,5', 'szobai dugaljak'], ['F3', 'B16', '2,5', 'fürdőszobai dugalj'], ['F4', 'B16', '2,5', 'konyhai dugaljak'], ['F5', 'B25', '2,5', 'mosógép']], bad: 'F5', modules: 11 },
    { groups: [['Q1', ['F1', 'F2']], ['–', ['F3']], ['Q2', ['F4']]], circuits: [
      ['F1', 'B10', '1,5', 'világítás'], ['F2', 'B16', '2,5', 'fürdőszobai dugalj'], ['F3', 'B20', '1,5', 'előszobai világítás'], ['F4', 'B16', '2,5', 'konyhai dugaljak']], bad: 'F3', modules: 10 },
  ]
  W.register({
    id: 'rajz-eloszto', module: 'm06-eloszto-csatorna', kind: 'task',
    title: 'Elosztó egyvonalas rajza – ÁVK, kioldás, modulhely',
    lead: 'A Q jelű 2P ÁVK-k 30 mA-esek, a főkapcsoló Q0 2 modul, minden ÁVK 2 modul, minden egypólusú kismegszakító 1 modul.',
    mount(el, api) {
      const d = pick(PANEL_TEMPLATES), g = root(680, 390, 'Lakáselosztó egyvonalas rajza')
      g.append(R(15, 15, 650, 355, 'cr-box', { rx: 8 }), T(340, 40, 'LAKÁSELOSZTÓ', { class: 'cr-big' }))
      g.append(R(35, 65, 95, 55), T(82, 88, 'Q0'), T(82, 107, 'főkapcsoló'))
      const xs = d.circuits.map((_, i) => 90 + i * (510 / (d.circuits.length - 1)))
      d.groups.forEach(([q, fs]) => {
        const inds = fs.map((id) => d.circuits.findIndex((c) => c[0] === id)), x1 = xs[Math.min(...inds)] - 35, x2 = xs[Math.max(...inds)] + 35, cx = (x1 + x2) / 2
        g.append(P(`M130 92H${cx}V${q === '–' ? 220 : 150}`, 'cr-wire'))
        if (q !== '–') { g.append(R(cx - 45, 135, 90, 48), T(cx, 156, q + ' 2P'), T(cx, 174, '30 mA ÁVK')); g.append(P(`M${cx} 183V220`, 'cr-wire')) }
        g.append(P(`M${x1} 220H${x2}`, 'cr-wire'))
        inds.forEach((i) => { const x = xs[i]; g.append(P(`M${x} 220V250`, 'cr-wire'), R(x - 38, 250, 76, 72), T(x, 270, d.circuits[i][0] + ' ' + d.circuits[i][1], { class: 'cr-svgtext' }), T(x, 290, d.circuits[i][2] + ' mm²', { class: 'cr-small' }), T(x, 312, d.circuits[i][3], { class: 'cr-small' }), L(x - 7, 230, x + 7, 244), L(x - 7, 244, x + 7, 230)) })
      })
      g.append(T(340, 352, 'A vízszintes elágazás mutatja, melyik kismegszakító melyik ÁVK kimenetéről kap tápot.', { class: 'cr-small' }))
      const q1 = d.groups[0][1], qs = [
        { label: 'Jelöld meg az összes áramkört, amely Q1 (30 mA) mögött van!', multi: true, answer: q1, options: d.circuits.map((c) => ({ v: c[0], t: `${c[0]} – ${c[3]}` })), explanation: `Q1 védi: ${q1.join(', ')}. A többi ág nem a Q1 kimeneti sínjéről indul.` },
        { label: 'A fürdőszobai dugaljnál testzárlat miatt 80 mA folyik a PE felé. Melyik védelem old ki biztosan?', answer: 'Q1', options: ['F1', 'F2', 'F3', 'Q0', 'Q1'], explanation: '80 mA > 30 mA: Q1 kiold. Ez különbözeti áram; a kismegszakító névleges áramát nem feltétlenül lépi túl.' },
        { label: 'Ugyanitt csak 20 mA szivárgás van. Melyik védelem old ki biztosan?', answer: 'Egyik sem biztosan', options: ['Q1', 'Q0', 'A fürdőszobai B16', 'Egyik sem biztosan'], explanation: '30 mA-es ÁVK-nál 15 mA alatt nem szabad kioldania, 20 mA-nél kioldhat, de nem kötelező, 30 mA-nél kell kioldania. Ezért 20 mA-nél egyik védelem kioldása sem biztos; túláram nincs.' },
        { label: 'Melyik áramkör méretezése hibás a rajz szerint?', answer: d.bad, options: d.circuits.map((c) => c[0]), explanation: `${d.bad}: ${d.circuits.find((c) => c[0] === d.bad)[1]} a ${d.circuits.find((c) => c[0] === d.bad)[2]} mm²-es vezetékre. A B10/1,5 és B16/2,5 párosítások megfelelőek; a nagyobb In nem védi a vékony vezetéket.` },
        { label: 'Hány DIN-modulhely kell a felsorolt készülékeknek?', answer: String(d.modules), options: shuffle([6, 8, 10, 11, 12, 14].map((v) => ({ v: String(v), t: v + ' modul' }))), explanation: `Q0 = 2, ÁVK-k = ${d.groups.filter((x) => x[0] !== '–').length} × 2, kismegszakítók = ${d.circuits.length} × 1 → összesen ${d.modules} modul.` },
      ]
      el.append(brief('Kövesd az elágazásokat: nem minden kismegszakító van ÁVK mögött. A modulhelyhez csak a feladatban felsorolt készülékeket számold.'), g, learn('Az elosztórajzból a védelmi csoport, az áramkör-felirat, az In–keresztmetszet páros és a modulhely is kiolvasható; 20 mA még nem 30 mA-es kioldás.'))
      questionTask(el, api, qs, 'Hibátlan elosztó-rajzolvasás: az ÁVK-csoport, a kioldás, a méretezési hiba és a modulhely is rendben.')
    },
  })

  // ===================================================================== 14. Motorvezérlés-rajz
  W.register({
    id: 'rajz-motor', module: 'm13-motorok-vezerles', kind: 'task',
    title: 'Motorrajz: öntartás vagy reteszelés',
    lead: 'Olvasd együtt a fő- és vezérlőáramkört. Válaszd ki a működési következményeket, majd kattints a kért segédérintkezőre.',
    mount(el, api) {
      const reverse = Math.random() < .5, expected = reverse ? 'K2NC' : 'K1NO'; let selected = ''
      const g = root(680, reverse ? 570 : 510, reverse ? 'Forgásirányváltás villamos reteszeléssel' : 'Mágneskapcsolós öntartás')
      g.append(T(340, 22, 'FŐÁRAMKÖR', { class: 'cr-big' }))
      ;[120, 250, 380].forEach((x, i) => { g.append(T(x, 48, 'L' + (i + 1)), P(`M${x} 55V95`, 'cr-wire')) })
      g.append(R(70, 95, 360, 42), T(250, 121, 'Q1 túláramvédelem'))
      if (reverse) { g.append(R(70, 157, 175, 48), R(255, 157, 175, 48), T(157, 185, 'K1 jobbra'), T(342, 185, 'K2 balra'), T(250, 222, 'L1↔L3 cseréje K2-nél', { class: 'cr-small' })) } else { g.append(R(70, 157, 360, 48), T(250, 185, 'K1 főérintkezők')) }
      g.append(R(70, 228, 360, 45), T(250, 255, 'F2 hőrelé fűtőelemei'), C(250, 330, 45, 'cr-box'), T(250, 326, 'M', { class: 'cr-big' }), T(250, 345, '3~'), P('M600 55V350H295', 'cr-wire cr-pe'), P('M600 55V350H295', 'cr-wire cr-pey'), ground(g, 600, 365))
      g.append(T(35, 380, 'VEZÉRLŐÁRAMKÖR', { class: 'cr-big', 'text-anchor': 'start' }))
      g.append(P('M35 425H85', 'cr-wire cr-l'), T(25, 429, 'L'), contact(g, 85, 425, true, 'F2 95-96'), contact(g, 170, 425, true, 'S0 STOP'))
      const hits = []
      if (!reverse) {
        g.append(P('M218 425H260', 'cr-wire'), P('M260 425V465H300', 'cr-wire'), contact(g, 260, 425, false, 'S1 START'), contact(g, 300, 465, false, 'K1 13-14'))
        g.append(P('M308 425H390V465H348', 'cr-wire'), P('M390 425V465', 'cr-wire'), R(390, 405, 85, 40), T(432, 430, 'K1 A1–A2'), P('M475 425H620', 'cr-wire cr-n'), T(635, 429, 'N'))
        hits.push({ id: 'K1NO', x: 292, y: 440, w: 66, h: 40, label: 'K1 13-14 segédzáró – öntartás' }, { id: 'S1', x: 250, y: 390, w: 66, h: 55, label: 'S1 START' }, { id: 'F2', x: 75, y: 390, w: 66, h: 55, label: 'F2 95-96' })
      } else {
        g.append(P('M218 425H245V395M245 425V465M245 395V435M293 395V435M245 465V525M293 465V525M293 395H330M293 465H330', 'cr-wire'))
        contact(g, 245, 395, false, 'S1 jobbra'); contact(g, 245, 435, false, 'K1 13-14'); contact(g, 330, 395, true, 'K2 21-22'); g.append(R(410, 378, 85, 36), T(452, 401, 'K1 tekercs'))
        contact(g, 245, 465, false, 'S2 balra'); contact(g, 245, 525, false, 'K2 13-14'); contact(g, 330, 465, true, 'K1 21-22'); g.append(R(410, 448, 85, 36), T(452, 471, 'K2 tekercs'))
        g.append(P('M378 395H410M495 395H620M378 465H410M495 465H620M620 395V465', 'cr-wire cr-n'), T(638, 431, 'N'))
        hits.push({ id: 'K2NC', x: 320, y: 360, w: 66, h: 55, label: 'K2 21-22 segédbontó a K1 ágban – villamos retesz' }, { id: 'K1NC', x: 320, y: 430, w: 66, h: 55, label: 'K1 21-22 segédbontó a K2 ágban' }, { id: 'S1', x: 235, y: 360, w: 66, h: 55, label: 'S1 jobbra' })
      }
      hits.forEach((p) => g.append(hit(p.x, p.y, p.w, p.h, () => { selected = p.id; [...g.querySelectorAll('.cr-hit')].forEach((x) => x.setAttribute('aria-pressed', x === p.el)); [...g.querySelectorAll('.cr-hit')].forEach((x) => x.classList.remove('cr-selected')); p.el.classList.add('cr-selected'); selectedText.textContent = 'Kijelölve: ' + p.label; api.note('') }, p.label)))
      const selectedText = h('b', {}, reverse ? 'Jelöld ki a K1 tekercságyában lévő villamos reteszt!' : 'Jelöld ki az öntartó érintkezőt!')
      // A kijelölhető elemek referenciáinak beállítása.
      let hi = 0; g.querySelectorAll('.cr-hit').forEach((x) => { x.classList.toggle('cr-hit', true); hits[hi++].el = x })
      const qs = reverse ? [
        { label: 'K1 behúzva, S1 elengedve. Mi történik S2 megnyomásakor?', answer: 'K2 nem húzhat be', options: ['K2 behúz és irányt vált', 'K2 nem húzhat be', 'F2 azonnal kiold'], explanation: 'K1 behúzva nyitja K1 21-22 bontóját a K2 ágban, ezért K2 nem kaphat feszültséget. Előbb STOP kell.' },
        { label: 'Mi történik F2 hőrelé kioldásakor?', answer: 'A motor leáll és nem indul újra magától', options: ['Csak az irány változik', 'A motor leáll és nem indul újra magától', 'K1 és K2 is behúz'], explanation: 'F2 95-96 nyitja a közös vezérlőtápot, mindkét tekercs elenged; reset és új START szükséges.' },
        { label: 'K1 21-22 segédbontója hiányzik, mechanikus retesz sincs. Mi a veszély?', answer: 'K1 és K2 együttes behúzása fáziszárlatot okozhat', options: ['A motor lassabban forog', 'Csak az öntartás marad el', 'K1 és K2 együttes behúzása fáziszárlatot okozhat'], explanation: 'A retesz nélkül K1 és K2 egyszerre zárhat; a fáziscserés főérintkezők így két fázist rövidre zárhatnak.' },
      ] : [
        { label: 'S1 START megnyomása után elengeded. Mi történik?', answer: 'K1 behúzva marad a 13-14 érintkezőn', options: ['K1 azonnal elenged', 'K1 behúzva marad a 13-14 érintkezőn', 'F2 kiold'], explanation: 'A K1 13-14 segédzáró áthidalja a START-ot: ez az öntartás.' },
        { label: 'F2 hőrelé kiold. Mi történik?', answer: 'K1 elenged, a motor leáll', options: ['A motor tovább forog', 'K1 elenged, a motor leáll', 'S1 önműködően zár'], explanation: 'A 95-96 bontó megszakítja K1 tekercsáramát, az öntartás megszűnik.' },
        { label: 'Reset után mi szükséges az újraindításhoz?', answer: 'Új START-gombnyomás', options: ['Semmi, magától indul', 'Új START-gombnyomás', 'A PE kikötése'], explanation: 'Az öntartó kapcsolás áramkimaradás vagy kioldás után nem indul újra magától.' },
      ]
      qs.push({ label: reverse ? 'Melyik elem a K1 ág villamos retesze? (rajzon is jelöld)' : 'Melyik elem adja az öntartást? (rajzon is jelöld)', answer: expected, external: () => selected, explanation: reverse ? 'A K1 tekercságyában a K2 21-22 segédbontó van sorosan: K2 behúzva megakadályozza K1 behúzását.' : 'K1 13-14 segédzáró az S1 START-tal párhuzamos: ez tartja fenn a tekercsáramot.' })
      el.append(brief(reverse ? 'Forgásirányváltás: a vezérlés alapváltozata STOP-on keresztül vált. A villamos és mechanikus retesz együtt szokásos.' : 'Öntartás: F2 és S0 soros bontó; S1 START és K1 13-14 párhuzamos záró.'), g, h('div', { class: 'cr-q' }, selectedText), learn('A vizsgán az érintkezőszám és a hely együtt dönt: 13-14 öntartás, a másik kapcsoló 21-22 bontója villamos retesz; F2 mindig leállít.'))
      questionTask(el, api, qs, 'Hibátlan motorrajz-értelmezés: a működést és a kért segédérintkezőt is jól azonosítottad.')
    },
  })

  // ===================================================================== 15. Mérési kapcsolás
  W.register({
    id: 'rajz-mero-kapcsolas', module: 'm04-meresek', kind: 'task',
    title: 'Mérési kapcsolás: A, V és teljesítménymérő',
    lead: 'Válassz műszert a palettáról, majd kattints egy rajzi helyre. A: soros árammérő; V: feszültségmérő; W-A: wattmérő áramtekercse; W-U: wattmérő feszültségtekercse.',
    mount(el, api) {
      let instrument = 'A'
      const placement = { S1: '', S2: '', P1: '', P2: '' }
      const names = { A: 'A – árammérő', V: 'V – voltmérő', WA: 'W-A – áramtekercs', WU: 'W-U – feszültségtekercs' }
      const keys = { A: 'A', V: 'V', WA: 'W-A', WU: 'W-U' }
      const want = { S1: 'A', S2: 'WA', P1: 'V', P2: 'WU' }
      const box = h('div'), selectedText = h('b')
      const pal = h('div', { class: 'cr-palette' })
      Object.keys(names).forEach((k) => pal.append(h('button', { type: 'button', 'aria-pressed': k === instrument, onclick: (e) => { instrument = k; [...pal.children].forEach((b) => { const on = b === e.currentTarget; b.setAttribute('aria-pressed', on) }); updateText() } }, names[k])))
      function updateText() { selectedText.textContent = 'Kiválasztva: ' + names[instrument] + ' – most kattints egy mérési helyre.' }
      function meter(g, x, y, label, vertical = false) {
        g.append(C(x, y, 22, 'cr-box'), T(x, y + 5, label || '?', { class: 'cr-big' }))
        if (vertical) { g.append(L(x, y - 36, x, y - 22), L(x, y + 22, x, y + 36)) } else { g.append(L(x - 36, y, x - 22, y), L(x + 22, y, x + 36, y)) }
      }
      function draw() {
        const g = root(640, 390, 'Mérési helyek egy ohmos áramkörben')
        g.append(T(320, 25, '230 V AC · ohmos fogyasztó', { class: 'cr-big' }))
        g.append(C(65, 145, 32, 'cr-box'), T(65, 140, '~'), T(65, 160, '230 V'))
        g.append(P('M65 113V65H170', 'cr-wire cr-l'), P('M170 65H350', 'cr-wire cr-l'), P('M350 65H500V145', 'cr-wire cr-l'))
        meter(g, 170, 65, keys[placement.S1] || ''); meter(g, 350, 65, keys[placement.S2] || '')
        g.append(R(500, 145, 70, 80), T(535, 180, 'R'), T(535, 203, 'fogyasztó'))
        g.append(P('M500 185H450V315H65V177', 'cr-wire cr-n'))
        g.append(P('M535 225V260H420V315', 'cr-thin'), P('M535 260H600V315', 'cr-thin'))
        meter(g, 420, 280, keys[placement.P1] || '', true); meter(g, 600, 280, keys[placement.P2] || '', true)
        const pts = { S1: [135, 28, 70, 72, 'S1 soros hely'], S2: [315, 28, 70, 72, 'S2 soros hely'], P1: [382, 242, 76, 76, 'P1 párhuzamos hely'], P2: [562, 242, 76, 76, 'P2 párhuzamos hely'] }
        Object.entries(pts).forEach(([id, p]) => g.append(hit(p[0], p[1], p[2], p[3], () => { placement[id] = instrument; draw(); api.note(`${names[instrument]} → ${id}. Ha minden kész, Ellenőrzés.`) }, `${p[4]}, jelenleg: ${placement[id] ? names[placement[id]] : 'üres'}`, false)))
        g.append(T(170, 18, 'S1 · soros', { class: 'cr-small' }), T(350, 18, 'S2 · soros', { class: 'cr-small' }), T(420, 345, 'P1 · párhuzamos', { class: 'cr-small' }), T(600, 345, 'P2 · párhuzamos', { class: 'cr-small' }))
        paint(box, g)
      }
      el.append(brief('Mind a négy műszer/tekercs a helyére kerüljön. A wattmérő áramtekercse soros, feszültségtekercse párhuzamos; a polaritást a valós mérésnél a műszer jelölése adja.'), pal, selectedText, box,
        h('div', { class: 'wrow' }, h('button', { type: 'button', onclick: () => { Object.keys(placement).forEach((k) => { placement[k] = '' }); draw(); api.note('Műszerek levéve.') } }, 'Műszerek levétele'), h('button', { type: 'button', class: 'primary', onclick: () => {
          const empty = Object.keys(placement).filter((k) => !placement[k]); if (empty.length) return api.note('Még üres mérési hely: ' + empty.join(', ') + '.', 'bad')
          const msgs = []
          for (const [slot, k] of Object.entries(placement)) {
            if (k === want[slot]) continue
            if (k === 'A' && slot.startsWith('P')) msgs.push(`${slot}: az ampermérő kis belső ellenállása párhuzamosan rövidzárat okoz – nem mérés, hanem védelem-kioldás/károsodás.`)
            else if (k === 'V' && slot.startsWith('S')) msgs.push(`${slot}: a voltmérő nagy belső ellenállású, sorosan nem így mérünk feszültséget; a terhelés is szinte áramtalan marad.`)
            else if (k === 'WA' && slot.startsWith('P')) msgs.push(`${slot}: a wattmérő áramtekercse is soros áramút; párhuzamosan zárlatot okozhat.`)
            else if (k === 'WU' && slot.startsWith('S')) msgs.push(`${slot}: a wattmérő feszültségtekercse a fogyasztóra párhuzamosan kötendő.`)
            else msgs.push(`${slot}: ide ${names[want[slot]]} kell; a(z) ${names[k]} máshova való.`)
          }
          api.done(!msgs.length, msgs.length ? msgs.join(' ') : 'Helyes! A sorosan, V a fogyasztóval párhuzamosan; a wattmérő áramtekercse soros, feszültségtekercse párhuzamos. Így P = U·I·cosφ mérhető.')
        } }, 'Ellenőrzés')), learn('A vizsgán az ampermérőt megbontott áramútba sorosan, a voltmérőt párhuzamosan kötöd; wattmérőnél a két tekercs funkcióját nem cserélheted fel.'))
      updateText(); draw()
    },
  })
})()
