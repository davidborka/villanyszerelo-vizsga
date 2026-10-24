// Áramkörös szemléltetések és mini feladatok: világításvezérlés (m05), érintésvédelem (m03),
// motorok (m13), mérőhely (m07), fürdőszoba (m14).
;(function () {
  const { h, s, fmt, shuffle } = W

  // --- közös stílus (egyszer, ac- előtaggal) ---
  if (!document.getElementById('ac-style')) {
    const st = document.createElement('style')
    st.id = 'ac-style'
    st.textContent = `
.ac-w{stroke:var(--muted);stroke-width:3;fill:none;stroke-linecap:round;stroke-linejoin:round}
.ac-w.live{stroke:#e0412b;stroke-width:4.5;stroke-dasharray:9 6;animation:acflow .7s linear infinite}
.ac-w.n{stroke:#2f80ed}.ac-w.pe{stroke:#2e9d3a}.ac-w.pey{stroke:#f2d21b;stroke-dasharray:6 6}
.ac-w.cut{stroke-dasharray:3 5}
@keyframes acflow{to{stroke-dashoffset:-15}}
.ac-box{fill:var(--card);stroke:var(--fg);stroke-width:2}
.ac-dot{fill:var(--fg)}
.ac-lamp{fill:var(--card);stroke:var(--fg);stroke-width:2}
.ac-lamp.on{fill:#ffd84a;stroke:#8a6300}
.ac-hit{fill:transparent;stroke:var(--line);stroke-width:1;stroke-dasharray:4 4;rx:8}
.ac-hit:focus{outline:none;stroke:var(--acc);stroke-width:2}
.ac-sel{fill:var(--acc)!important}.ac-sel+text{fill:#181200}
.ac-spin{transform-box:fill-box;transform-origin:center;animation:acspin 1s linear infinite}
@keyframes acspin{to{transform:rotate(360deg)}}
.ac-bar{display:flex;height:24px;border-radius:6px;overflow:hidden;position:relative;border:1px solid var(--line)}
.ac-bar i{display:block;height:100%}
.ac-bar b{position:absolute;top:-3px;bottom:-3px;width:3px;background:var(--fg)}
.ac-sel-row li{flex-wrap:wrap}.ac-sel-row li span{flex:1 1 110px}.ac-sel-row select{min-height:36px;min-width:0;max-width:100%;flex:1 1 200px}
.wbody .wlist li button{min-width:36px;min-height:36px}
@media (max-width:520px){svg.ac text{font-size:16px}}
@media (prefers-reduced-motion:reduce){.ac-w.live,.ac-spin{animation:none}}
`
    document.head.append(st)
  }

  const root = (w, hh) => { const g = s.root(w, hh); g.classList.add('ac'); return g }
  const W_ = (x1, y1, x2, y2, cls = '') => s('line', { x1, y1, x2, y2, class: 'ac-w ' + cls })
  const P = (d, cls = '') => s('path', { d, class: 'ac-w ' + cls })
  const T = (x, y, t, a = {}) => s('text', Object.assign({ x, y, 'text-anchor': 'middle' }, a), t)
  const dot = (x, y, r = 4) => s('circle', { cx: x, cy: y, r, class: 'ac-dot' })
  const lamp = (x, y, on, r = 16) => s('g', {},
    s('circle', { cx: x, cy: y, r, class: 'ac-lamp' + (on ? ' on' : '') }),
    P(`M${x - r * 0.7} ${y - r * 0.7}L${x + r * 0.7} ${y + r * 0.7}M${x - r * 0.7} ${y + r * 0.7}L${x + r * 0.7} ${y - r * 0.7}`))
  /** kattintható (és billentyűzettel kezelhető) terület */
  const hit = (x, y, w, hh, fn, label) => s('rect', {
    x, y, width: w, height: hh, class: 'ac-hit hot', tabindex: 0, role: 'button', 'aria-label': label,
    onclick: fn, onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn() } },
  })
  const live = (b) => (b ? 'live' : '')
  function paintSvg(box, g) {
    const active = document.activeElement
    const label = box.contains(active) ? active.getAttribute('aria-label') : null
    const wrap = box.querySelector('.wdiagram')
    g.setAttribute('aria-label', box.closest('.widget')?.querySelector('.whead b')?.textContent || 'Műszaki ábra')
    ;(wrap || box).replaceChildren(g)
    if (label) [...g.querySelectorAll('[aria-label]')].find((n) => n.getAttribute('aria-label') === label)?.focus({ preventScroll: true })
  }
  /** gombsor egy választással: [[érték, felirat], ...] */
  function choice(opts, cur, on) {
    const row = h('div', { class: 'wrow' })
    const paint = (v) => [...row.children].forEach((b, i) => {
      const selected = opts[i][0] === v
      b.classList.toggle('on', selected); b.setAttribute('aria-pressed', selected)
    })
    opts.forEach(([v, t]) => row.append(h('button', { type: 'button', onclick: () => { paint(v); on(v) } }, t)))
    paint(cur)
    return row
  }

  // ============ 1. Váltó–kereszt–váltó szemléltetés ============
  W.register({
    id: 'valto-demo', module: 'm05-vilagitasvezerlesek', kind: 'demo',
    title: 'Váltó- és keresztkapcsolás élőben',
    lead: 'Kattints a kapcsolókra (V1, K, V2)! A piros, mozgó vonal a fázist vivő szakasz. Fent választhatsz két- vagy háromhelyes kapcsolást.',
    mount(el) {
      let three = true, v1 = 0, k = 0, v2 = 0
      const box = h('div'), info = h('p', { class: 'wsmall' })
      el.append(choice([[false, 'Váltó–váltó (2 hely)'], [true, 'Váltó–kereszt–váltó (3 hely)']], three, (v) => { three = v; draw() }), box, info)
      function draw() {
        const out = three && k ? 1 - v1 : v1 // melyik korrespondáló visz fázist V2-nél
        const on = v2 === out
        const g = root(640, 250)
        const ty = [95, 165]
        g.append(T(14, 134, 'L'), T(14, 219, 'N'))
        g.append(W_(24, 130, 120, 130, 'live'), s('rect', { x: 50, y: 118, width: 34, height: 24, class: 'ac-box' }), T(67, 112, 'B10', { 'font-size': 11 }))
        // V1
        g.append(W_(120, 130, 170, ty[v1], 'live'), dot(120, 130), dot(170, 95), dot(170, 165), T(140, 210, 'V1'), T(184, 90, '1', { 'font-size': 11 }), T(184, 182, '2', { 'font-size': 11 }), T(108, 150, 'C', { 'font-size': 11 }))
        if (three) {
          ty.forEach((y, i) => g.append(W_(170, y, 290, y, live(v1 === i))))
          g.append(s('rect', { x: 290, y: 65, width: 80, height: 130, class: 'ac-box' }), T(330, 210, 'K'))
          const pairs = k ? [[0, 1], [1, 0]] : [[0, 0], [1, 1]]
          pairs.forEach(([a, b]) => g.append(W_(296, ty[a], 364, ty[b], live(a === v1))))
          g.append(dot(296, 95), dot(296, 165), dot(364, 95), dot(364, 165),
            T(306, 86, '1', { 'font-size': 11 }), T(306, 184, '2', { 'font-size': 11 }), T(354, 86, '3', { 'font-size': 11 }), T(354, 184, '4', { 'font-size': 11 }))
          ty.forEach((y, i) => g.append(W_(370, y, 470, y, live(out === i))))
          g.append(T(230, 88, 'a', { 'font-size': 12 }), T(230, 158, 'b', { 'font-size': 12 }), T(420, 88, 'c', { 'font-size': 12 }), T(420, 158, 'd', { 'font-size': 12 }))
          g.append(hit(284, 60, 92, 140, () => { k = 1 - k; draw() }, 'Keresztkapcsoló átváltása'))
        } else {
          ty.forEach((y, i) => g.append(W_(170, y, 470, y, live(v1 === i))))
          g.append(T(320, 88, 'a (korrespondáló)', { 'font-size': 12 }), T(320, 158, 'b (korrespondáló)', { 'font-size': 12 }))
        }
        // V2
        g.append(W_(520, 130, 470, ty[v2], live(on)), dot(470, 95), dot(470, 165), dot(520, 130), T(500, 210, 'V2'), T(456, 90, '1', { 'font-size': 11 }), T(456, 182, '2', { 'font-size': 11 }), T(532, 150, 'C', { 'font-size': 11 }))
        g.append(W_(520, 130, 579, 130, live(on)), lamp(595, 130, on), W_(611, 130, 626, 130, 'n'), P('M626 130V215H24', 'n'))
        g.append(hit(100, 70, 92, 120, () => { v1 = 1 - v1; draw() }, 'V1 átváltása'), hit(448, 70, 92, 120, () => { v2 = 1 - v2; draw() }, 'V2 átváltása'))
        paintSvg(box, g)
        const names = three ? ['c', 'd'] : ['a', 'b']
        info.textContent = (on
          ? 'A lámpa világít: a fázis V1 közös kapcsáról a(z) „' + names[out] + '” korrespondálón át V2 közös kapcsára, onnan a lámpára jut. '
          : 'A lámpa nem világít: a fázis a(z) „' + names[out] + '” korrespondálón V2 nyitott kapcsáig jut, a lámpa felé nincs út. ') +
          'A két korrespondáló közül mindig pontosan egy visz fázist' + (three ? '; a keresztkapcsoló a két vezetéket egyenesen vagy keresztben vezeti tovább' : '') +
          ', ezért bármelyik kapcsoló átváltása megfordítja a lámpa állapotát. A kapcsolók a fázist bontják, a lámpa N-t (és PE-t) közvetlenül kap.'
      }
      draw()
    },
  })

  // ============ 2. Váltó–(kereszt–)váltó bekötése ============
  W.register({
    id: 'valto-bekotes', module: 'm05-vilagitasvezerlesek', kind: 'task',
    title: 'Kösd be a váltókapcsolást!',
    lead: 'Minden kapocsnál válaszd ki, mihez kötöd (az azonos betűjelű kapcsok egy vezetékre kerülnek). Az „Ellenőrzés” végigkapcsolja az összes állást. A keresztkapcsoló belül: egyenes állásban 1–3 és 2–4, keresztezett állásban 1–4 és 2–3.',
    mount(el, api) {
      const three = Math.random() < 0.5
      const nets = [['', '— (nincs bekötve)'], ['L', 'L – fázis a kismegszakítóról'], ['N', 'N – nulla (N-sín)'],
        ['a', three ? 'a – korrespondáló (V1–K)' : 'a – korrespondáló'], ['b', three ? 'b – korrespondáló (V1–K)' : 'b – korrespondáló']]
      if (three) nets.push(['c', 'c – korrespondáló (K–V2)'], ['d', 'd – korrespondáló (K–V2)'])
      nets.push(['x', 'x – lámpavezeték (kapcsolt fázis)'])
      const terms = [['V1.C', 'V1 közös (C)'], ['V1.1', 'V1 1'], ['V1.2', 'V1 2']]
      if (three) terms.push(['K.1', 'K 1'], ['K.2', 'K 2'], ['K.3', 'K 3'], ['K.4', 'K 4'])
      terms.push(['V2.1', 'V2 1'], ['V2.2', 'V2 2'], ['V2.C', 'V2 közös (C)'], ['LA.L', 'Lámpa L'], ['LA.N', 'Lámpa N'])
      const val = {}
      const ul = h('ul', { class: 'wlist ac-sel-row' })
      const table = h('div', { class: 'wsmall' })
      for (const [id, name] of terms) {
        const sel = h('select', { 'aria-label': name, onchange: (e) => { val[id] = e.target.value; table.replaceChildren() } }, nets.map(([v, t]) => h('option', { value: v }, t)))
        val[id] = ''
        ul.append(h('li', {}, h('span', {}, h('b', {}, name)), sel))
      }
      el.append(h('p', { class: 'wsmall' }, three ? 'Feladat: váltó–kereszt–váltó (V1, K, V2), a lámpa három helyről kapcsolható.' : 'Feladat: váltó–váltó (V1, V2), a lámpa két helyről kapcsolható.'),
        ul, h('div', { class: 'wrow' }, h('button', { type: 'button', class: 'primary', onclick: test }, 'Ellenőrzés')), table)

      const sw = three ? ['V1', 'K', 'V2'] : ['V1', 'V2']
      const states = []
      for (let i = 0; i < 1 << sw.length; i++) states.push(sw.map((_, j) => (i >> j) & 1))
      const stName = (st) => sw.map((n, i) => n + '=' + (n === 'K' ? (st[i] ? 'kereszt' : 'egyenes') : st[i] + 1)).join(', ')
      function sim(st) {
        const par = {}
        const f = (a) => { while (par[a] && par[a] !== a) a = par[a]; return a }
        const u = (a, b) => { const x = f(a), y = f(b); if (x !== y) par[x] = y }
        for (const [id] of terms) if (val[id]) u(id, val[id] === 'L' ? 'SL' : val[id] === 'N' ? 'SN' : 'net:' + val[id])
        sw.forEach((n, i) => {
          if (n === 'K') { if (st[i]) { u('K.1', 'K.4'); u('K.2', 'K.3') } else { u('K.1', 'K.3'); u('K.2', 'K.4') } }
          else u(n + '.C', n + '.' + (st[i] + 1))
        })
        const same = (a, b) => f(a) === f(b)
        return { short: same('SL', 'SN'), lit: (same('LA.L', 'SL') && same('LA.N', 'SN')) || (same('LA.L', 'SN') && same('LA.N', 'SL')) }
      }
      function test() {
        const empty = terms.filter(([id]) => !val[id]).map(([, n]) => n)
        table.replaceChildren()
        if (empty.length) return api.done(false, 'Még nincs bekötve: ' + empty.join(', ') + '. Minden kapocsnak legyen helye.')
        const res = states.map((st) => ({ st, ...sim(st) }))
        table.append(h('ul', { class: 'wlist' }, res.map((r) => h('li', { class: r.short ? 'no' : '' },
          h('span', {}, stName(r.st)), r.short ? 'RÖVIDZÁR' : r.lit ? '● világít' : '○ nem világít'))))
        const sc = res.find((r) => r.short)
        if (sc) return api.done(false, `Rövidzár (${stName(sc.st)}): ebben az állásban az L és az N összeér – a kismegszakító kiold. Az N csak a lámpa N kapcsára menjen.`)
        const swN = terms.filter(([id]) => !id.startsWith('LA') && val[id] === 'N')
        if (swN.length || val['LA.N'] !== 'N') return api.done(false, 'A kapcsolók a nullát kapcsolják (vagy a lámpa N kapcsa nem a nullán van). A lámpa N kapcsa közvetlenül az N-re menjen, a kapcsolók a fázist bontsák – különben kikapcsolt lámpán is fázis marad.')
        if (val['LA.L'] === 'L') return api.done(false, 'A lámpa L kapcsa közvetlenül a kismegszakítóról kap fázist, megkerülve a kapcsolókat – mindig világít. A lámpára a V2 közös kapcsáról jövő lámpavezeték kell.')
        if (res.every((r) => !r.lit)) return api.done(false, 'A lámpa egyik állásban sem világít. Ellenőrizd: az L a V1 közös kapcsára, a V2 közös kapcsa a lámpavezetéken a lámpára, a korrespondálók a váltók 1–2 kapcsai között' + (three ? ' (V1 → K 1–2, K 3–4 → V2).' : '.'))
        if (res.every((r) => r.lit)) return api.done(false, 'A lámpa minden állásban világít – a kapcsolók nem bontják a fázist.')
        for (let i = 0; i < sw.length; i++) {
          const bad = res.find((r) => { const o = [...r.st]; o[i] ^= 1; return sim(o).lit === r.lit })
          if (bad) {
            const kHint = three && ['a', 'b'].every((n) => terms.some(([id]) => (id === 'K.1' || id === 'K.2') && val[id] === n)) ? '' :
              three ? ' A kereszt bemenete 1–2 (V1 felől), kimenete 3–4 (V2 felé) – ha a korrespondálók 1–3-ra kerülnek, a kereszt nem cseréli fel őket.' : ''
            return api.done(false, `A korrespondálók rosszul vannak bekötve: ${sw[i]} átváltása nem mindig vált (pl. ${stName(bad.st)} állásban). Bármely kapcsoló átváltásának meg kell fordítania a lámpa állapotát.${kHint}`)
          }
        }
        api.done(true, 'Működik minden helyről! L → V1 közös, a korrespondálók ' + (three ? 'V1 1–2 → K 1–2 és K 3–4 → V2 1–2' : 'V1 1–2 → V2 1–2') + ', V2 közös → lámpa, a lámpa N közvetlenül. Minden állásban egy kapcsoló átváltása megfordítja a lámpát, és kikapcsolt lámpán nincs fázis.')
      }
    },
  })

  // ============ 3. Impulzusrelé és lépcsőházi automata ============
  W.register({
    id: 'impulzus-demo', module: 'm05-vilagitasvezerlesek', kind: 'demo',
    title: 'Impulzusrelé és lépcsőházi automata',
    lead: 'Válassz fület, és nyomd meg a nyomógombokat (S1–S3) az ábrán!',
    mount(el) {
      let tab = 'rele', relay = false, pressed = -1, pressT = 0, minutes = 3, end = 0, lastSecond = -1
      const box = h('div'), ctl = h('div'), info = h('p', { class: 'wsmall' })
      el.append(choice([['rele', 'Impulzusrelé'], ['auto', 'Lépcsőházi automata']], tab, (v) => { tab = v; pressed = -1; lastSecond = -1; draw() }), box, ctl, info)
      const tick = setInterval(() => {
        if (tab !== 'auto' || !end) return
        const second = Math.ceil(Math.max(0, end - Date.now()) / 1000)
        if (Date.now() >= end) end = 0
        if (second !== lastSecond) { lastSecond = second; draw() }
      }, 250)
      function press(i) {
        pressed = i; clearTimeout(pressT)
        if (tab === 'rele') relay = !relay
        else end = Date.now() + minutes * 10000
        pressT = setTimeout(() => { pressed = -1; draw() }, 450)
        draw()
      }
      function draw() {
        const g = root(640, 270)
        const xs = [70, 150, 230], ctrlY = 160
        const outOn = tab === 'rele' ? relay : end > Date.now()
        g.append(W_(30, 30, 620, 30, 'live'), T(16, 34, 'L'), W_(30, 245, 620, 245, 'n'), T(16, 249, 'N'))
        xs.forEach((x, i) => {
          const p = pressed === i
          g.append(W_(x, 30, x, 78, 'live'), dot(x, 78), dot(x, 112),
            p ? W_(x, 78, x, 112, 'live') : W_(x - 14, 82, x - 14, 108), W_(x - 22, 95, p ? x : x - 14, 95),
            W_(x, 112, x, ctrlY, live(p)), T(x + 24, 100, 'S' + (i + 1)))
          g.append(hit(x - 34, 62, 68, 66, () => press(i), 'S' + (i + 1) + ' nyomógomb'))
        })
        const p = pressed >= 0
        if (tab === 'rele') {
          g.append(W_(70, ctrlY, 330, ctrlY, live(p)), T(200, ctrlY + 18, 'vezérlővezeték', { 'font-size': 11 }))
          g.append(s('rect', { x: 300, y: 70, width: 140, height: 150, class: 'ac-box' }), T(370, 236, 'impulzusrelé', { 'font-size': 12 }))
          g.append(W_(330, ctrlY, 330, 140, live(p)), s('rect', { x: 318, y: 140, width: 24, height: 40, class: 'ac-box', style: p ? 'fill:#e0412b' : '' }),
            W_(330, 180, 330, 245, 'n'), T(318, 136, 'A1', { 'font-size': 11, 'text-anchor': 'end' }), T(318, 196, 'A2', { 'font-size': 11, 'text-anchor': 'end' }))
          g.append(W_(400, 30, 400, 95, 'live'), dot(400, 95), dot(400, 165), relay ? W_(400, 95, 400, 165, 'live') : W_(400, 95, 420, 155),
            T(412, 92, '11', { 'font-size': 11, 'text-anchor': 'start' }), T(412, 180, '14', { 'font-size': 11, 'text-anchor': 'start' }))
          g.append(P('M400 165V185H460V100H560V114', live(relay)), W_(500, 100, 500, 114, live(relay)), lamp(500, 130, relay), lamp(560, 130, relay), W_(500, 146, 500, 245, 'n'), W_(560, 146, 560, 245, 'n'))
          ctl.replaceChildren(h('div', { class: 'wmeter', role: 'status' }, relay ? 'LÁMPÁK: BE' : 'LÁMPÁK: KI'))
          info.textContent = (p ? 'Gombnyomás: L → nyomógomb → A1, a tekercs A2-n át az N-re zár – a relé átvált. ' : '') +
            'A nyomógombok párhuzamosan kötve, bármelyik ugyanazt a rövid impulzust adja; a relé minden impulzusra vált (be → ki → be). A 11–14 érintkező kapcsolja a lámpák fázisát (11 ← L, 14 → lámpák). A nyomógombokhoz 2 ér megy: L és a vezérlővezeték az A1-re.'
        } else {
          const left = Math.max(0, end - Date.now())
          const sim = Math.ceil(left / 1000) * 6 // 10 s valós = 1 perc szimulált
          const simT = `${Math.floor(sim / 60)}:${String(sim % 60).padStart(2, '0')}`
          g.append(W_(70, ctrlY, 330, ctrlY, live(p)), T(200, ctrlY + 18, 'nyomógomb-vezeték', { 'font-size': 11 }))
          g.append(s('rect', { x: 300, y: 70, width: 150, height: 150, class: 'ac-box' }), T(375, 236, 'lépcsőházi automata', { 'font-size': 12 }))
          g.append(W_(320, 30, 320, 90, 'live'), T(320, 106, 'L', { 'font-size': 11 }), W_(345, 205, 345, 245, 'n'), T(345, 200, 'N', { 'font-size': 11 }),
            W_(330, ctrlY, 360, ctrlY, live(p)), T(372, ctrlY + 4, 'S', { 'font-size': 11 }),
            T(420, 106, 'kimenet', { 'font-size': 11 }), T(375, 140, outOn ? simT : '–', { 'font-size': 15, 'font-weight': 700 }))
          g.append(P('M420 90V50H560V114', live(outOn)), W_(500, 50, 500, 114, live(outOn)), lamp(500, 130, outOn), lamp(560, 130, outOn), W_(500, 146, 500, 245, 'n'), W_(560, 146, 560, 245, 'n'))
          const timeText = () => `Következő indítás időtartama: ${minutes} perc (gyorsítva ${minutes * 10} s)`
          const range = h('input', { type: 'range', min: 1, max: 6, step: 1, value: minutes, 'aria-label': 'Következő indítás időtartama', 'aria-valuetext': `${minutes} perc`, oninput: (e) => { minutes = +e.target.value; e.target.setAttribute('aria-valuetext', `${minutes} perc`); lab.textContent = timeText() } })
          const lab = h('div', { class: 'wsmall' }, timeText())
          if (!ctl.querySelector('input')) ctl.replaceChildren(lab, range, h('div', { class: 'wmeter', role: 'status' }))
          ctl.querySelector('.wmeter').textContent = outOn ? `hátra ${simT} perc` : 'LÁMPÁK: KI'
          info.textContent = (p ? 'Gombnyomás: az automata (újra)indítja az időzítést a teljes beállított időtől. ' : outOn ? 'Az idő lejártakor az automata magától lekapcsol. ' : '') +
            'Négyvezetékes bekötés: a lépcsőházban L, N, a nyomógomb-vezeték és a lámpavezeték fut végig. A nyomógombok párhuzamosan a fázist adják az automata nyomógomb-bemenetére (S vagy 3), a lámpák az automata kimenetéről kapnak fázist – a gombokon nem a lámpák árama folyik.'
        }
        paintSvg(box, g)
      }
      draw()
      return () => { clearInterval(tick); clearTimeout(pressT) }
    },
  })

  // ============ 4. Testzárlat TN-C-S rendszerben ============
  W.register({
    id: 'hibaaram-demo', module: 'm03-aramutes-elleni-vedelem', kind: 'demo',
    title: 'Testzárlat és önműködő lekapcsolás (TN-C-S)',
    lead: 'Kapcsold be a testzárlatot, állítsd a hurokimpedanciát (Zs) és a kismegszakítót. Lekapcsol-e 0,4 s-on belül?',
    mount(el) {
      let fault = true, zs = 1.2, prot = 'B16', peCut = false
      const box = h('div'), meter = h('div', { class: 'wmeter', role: 'status', style: { fontSize: '15px', textAlign: 'left', whiteSpace: 'pre-line' } }), info = h('p', { class: 'wsmall' })
      const zl = h('div', { class: 'wsmall' })
      const faultB = h('button', { type: 'button', onclick: () => { fault = !fault; draw() } })
      const peB = h('button', { type: 'button', onclick: () => { peCut = !peCut; draw() } })
      el.append(box, h('div', { class: 'wrow' }, faultB, peB),
        choice([['B16', 'B16'], ['C16', 'C16'], ['B10', 'B10'], ['C10', 'C10']], prot, (v) => { prot = v; draw() }),
        zl, h('input', { type: 'range', min: 0.2, max: 3, step: 0.05, value: zs, 'aria-label': 'Zs hurokimpedancia', 'aria-valuetext': `${fmt(zs)} ohm`, oninput: (e) => { zs = +e.target.value; e.target.setAttribute('aria-valuetext', `${fmt(zs)} ohm`); draw() } }), meter, info)
      function draw() {
        const In = +prot.slice(1), kk = prot[0] === 'B' ? 5 : 10, Ia = kk * In, If = 230 / zs, trips = If >= Ia
        const flow = fault && !peCut
        faultB.textContent = fault ? 'Hibahely: BE (L a testen)' : 'Hibahely: KI'
        faultB.classList.toggle('on', fault); faultB.setAttribute('aria-pressed', fault)
        peB.textContent = peCut ? 'PE-szakadás: VAN' : 'PE-szakadás: nincs'
        peB.classList.toggle('on', peCut); peB.setAttribute('aria-pressed', peCut)
        zl.textContent = `Zs = ${fmt(zs)} Ω (hurokimpedancia)`
        const g = root(640, 270)
        // trafó
        g.append(s('circle', { cx: 50, cy: 70, r: 22, class: 'ac-box' }), s('circle', { cx: 50, cy: 100, r: 22, class: 'ac-box' }), T(50, 20, 'trafó', { 'font-size': 12 }))
        g.append(P('M50 122V210', live(flow)), P('M50 210V240M38 240H62M42 246H58M46 252H54'), T(66, 250, 'üzemi földelés', { 'font-size': 11, 'text-anchor': 'start' }))
        g.append(P('M72 70H200', live(fault)), s('rect', { x: 200, y: 56, width: 50, height: 28, class: 'ac-box', style: flow && trips ? 'stroke:#2e9d3a;stroke-width:3' : '' }),
          T(225, 75, prot, { 'font-size': 12 }), P('M250 70H470V110', live(fault)), T(130, 62, 'L', { 'font-size': 12 }))
        g.append(P('M50 210H300', 'pe'), P('M50 210H300', 'pey'), flow ? P('M50 210H300', 'live') : '', T(150, 202, 'PEN', { 'font-size': 12 }), dot(300, 210, 5), T(300, 196, 'szétválasztás', { 'font-size': 11 }))
        g.append(P('M300 210V245H520V200', 'n'), T(410, 240, 'N', { 'font-size': 12 }))
        const pe = 'M300 210H585V180'
        g.append(P(pe, 'pe'), P(pe, 'pey'), flow ? P(pe, 'live') : '', T(450, 204, 'PE', { 'font-size': 12 }))
        if (peCut) g.append(s('path', { d: 'M505 198L525 222M525 198L505 222', stroke: '#e0412b', 'stroke-width': 4 }))
        g.append(s('rect', { x: 440, y: 110, width: 170, height: 70, rx: 6, class: 'ac-box', style: fault && (peCut || !trips) ? 'fill:rgba(224,65,43,.18)' : 'fill:rgba(136,136,136,.18)' }),
          T(525, 128, 'fém test (készülék)', { 'font-size': 11 }))
        if (fault) g.append(P('M470 110L480 130L460 140L480 150L470 170', live(fault)), P('M470 170H585V180', live(fault)), T(500, 160, '⚡ hibahely', { 'font-size': 11, 'text-anchor': 'start' }))
        paintSvg(box, g)
        if (!fault) {
          meter.textContent = `Hiba nincs\n${prot}: Ia = ${kk}·In = ${Ia} A\nZs,max = ${fmt(230 / Ia)} Ω`
          info.textContent = 'Normál üzemben a test a PE-n keresztül földpotenciálon van, a PE-n nem folyik áram. Kapcsold be a hibahelyet!'
        } else if (peCut) {
          meter.textContent = 'Hibaáram: ~0 A\na kismegszakító NEM old ki\na test feszültsége ≈ 230 V'
          info.textContent = 'PE-szakadásnál a hibaáramnak nincs visszaútja: a kismegszakító nem érzékel semmit, a fém test tartósan feszültség alatt marad – aki megérinti, azon át folyik az áram a föld felé (életveszély). 30 mA-es ÁVK esetén az érintéskor a testen át elfolyó áram különbözeti áramként jelentkezik, és az ÁVK lekapcsol – ezért kiegészítő védelem. A hiányzó PE-t azonban az ÁVK sem pótolja: hiányzó védővezető = érvénytelen vizsga.'
        } else {
          meter.textContent = `Ik (hibaáram) = U0/Zs = 230/${fmt(zs)} = ${fmt(If, 0)} A\nIa (gyors kioldás): ${kk}·In = ${Ia} A\nZs,max = ${fmt(230 / Ia)} Ω → ${trips ? 'LEKAPCSOL' : 'NEM kapcsol le időben'}`
          info.textContent = trips
            ? `A hibaáram (${fmt(If, 0)} A) eléri a ${prot} mágneses (zárlati) kioldásának határát (${Ia} A), így a kismegszakító 0,4 s-on belül lekapcsol. Az ábra a lekapcsolás előtti hibaáram-utat mutatja: L → kismegszakító → hibahely → test → PE → PEN → trafó csillagpontja. Feltétel: Zs ≤ U0/Ia = ${fmt(230 / Ia)} Ω.`
            : `A hibaáram (${fmt(If, 0)} A) kisebb, mint a ${prot} mágneses kioldási határa (${Ia} A): a gyors (mágneses) kioldás nem garantált, a hőkioldó lassú – a 0,4 s-os lekapcsolás nem biztosított, a test addig veszélyes feszültség alatt lehet. Megoldás: kisebb Zs (rövidebb vagy vastagabb vezeték), B karakterisztika vagy kisebb In, illetve ÁVK kiegészítő védelemként.`
        }
      }
      draw()
    },
  })

  // ============ 5. ÁVK működése ============
  W.register({
    id: 'avk-demo', module: 'm03-aramutes-elleni-vedelem', kind: 'demo',
    title: 'Áram-védőkapcsoló (ÁVK) működése',
    lead: 'Az L és az N is átmegy az áramváltón; az ÁVK a kettő különbségét figyeli. Állítsd a szivárgó áramot és az IΔn-t, próbáld ki a hibákat!',
    mount(el) {
      let load = true, leak = 0, idn = 30, nBypass = false, touch = false, test = false, tripped = false, tripDiff = 0
      const ILOAD = 10000 // mA, kb. 2,3 kW-os fogyasztó
      const TOUCH = 115 // mA ≈ 230 V / 2000 Ω (példa)
      const box = h('div'), meter = h('div', { class: 'wmeter', role: 'status', style: { fontSize: '15px', textAlign: 'left', whiteSpace: 'pre-line' } }), bar = h('div'), info = h('p', { class: 'wsmall' })
      const lk = h('div', { class: 'wsmall' })
      const btn = (t, fn) => h('button', { type: 'button', onclick: fn }, t)
      const bLoad = btn('', () => { load = !load; draw() }), bN = btn('', () => { nBypass = !nBypass; draw() }), bT = btn('', () => { touch = !touch; draw() })
      el.append(box, h('div', { class: 'wrow' }, bLoad, btn('TESZT gomb', () => { test = true; draw(); test = false }), btn('Visszakapcsolás', () => { tripped = false; draw() })),
        h('div', { class: 'wrow' }, bN, bT), choice([[30, 'IΔn = 30 mA'], [300, 'IΔn = 300 mA']], idn, (v) => { idn = v; tripped = false; draw() }),
        lk, h('input', { type: 'range', min: 0, max: 40, step: 1, value: 0, 'aria-label': 'Szivárgó áram', 'aria-valuetext': '0 milliamper', oninput: (e) => { leak = +e.target.value; e.target.setAttribute('aria-valuetext', `${leak} milliamper`); draw() } }), bar, meter, info)
      function draw() {
        const IL = (load ? ILOAD : 0) + leak + (touch ? TOUCH : 0)
        const INthru = nBypass ? 0 : load ? ILOAD : 0
        const diff = test ? Math.max(idn * 1.2, IL - INthru) : IL - INthru
        if (!tripped && diff >= idn) { tripped = true; tripDiff = diff }
        const on = !tripped
        bLoad.textContent = load ? 'Fogyasztó: BE (10 A)' : 'Fogyasztó: KI'; bLoad.classList.toggle('on', load); bLoad.setAttribute('aria-pressed', load)
        bN.textContent = '„N nem megy át az ÁVK-n” hiba'; bN.classList.toggle('on', nBypass); bN.setAttribute('aria-pressed', nBypass)
        bT.textContent = 'Ember megérinti a fázist'; bT.classList.toggle('on', touch); bT.setAttribute('aria-pressed', touch)
        lk.textContent = `Szivárgó áram (szigetelési hiba a PE felé): ${leak} mA`
        const g = root(640, 250)
        const lOn = on
        g.append(T(14, 64, 'L'), T(14, 134, 'N'), W_(24, 60, 140, 60, 'live'), W_(24, 130, 140, 130, 'n'))
        g.append(s('rect', { x: 140, y: 30, width: 170, height: 140, class: 'ac-box', style: tripped ? 'stroke:#e0412b;stroke-width:3' : '' }), T(225, 186, tripped ? 'ÁVK – KIOLDOTT' : `ÁVK ${idn} mA`, { 'font-size': 12 }))
        g.append(s('ellipse', { cx: 225, cy: 95, rx: 22, ry: 62, fill: 'none', stroke: '#888', 'stroke-width': 8 }), T(225, 22, 'áramváltó', { 'font-size': 11 }))
        g.append(W_(140, 60, 160, 60, 'live'), W_(160, 60, 290, 60, live(lOn)), W_(290, 60, 310, 60, live(lOn)))
        if (!nBypass) g.append(W_(140, 130, 310, 130, 'n'))
        else g.append(W_(140, 130, 150, 130, 'n'))
        if (tripped) g.append(W_(160, 54, 175, 40), T(185, 52, 'nyitva', { 'font-size': 10, 'text-anchor': 'start' }))
        g.append(P('M310 60H470V80', live(lOn)), s('rect', { x: 440, y: 80, width: 60, height: 60, class: 'ac-box', style: load && lOn ? 'fill:rgba(255,216,74,.5)' : '' }), T(470, 115, 'fogyasztó', { 'font-size': 11 }))
        g.append(nBypass ? P('M150 130V215H470V140', 'n') : P('M310 130H380V200H470V140', 'n'))
        if (nBypass) g.append(T(300, 210, 'N az ÁVK mellett', { 'font-size': 11 }))
        g.append(P('M500 110H570V230', 'pe'), P('M500 110H570V230', 'pey'), T(590, 230, 'PE', { 'font-size': 12 }))
        if (leak && lOn) g.append(T(535, 104, `${leak} mA →`, { 'font-size': 11 }))
        if (touch) g.append(s('circle', { cx: 380, cy: 30, r: 9, class: 'ac-box' }), P('M380 39V62M368 50L380 60', live(lOn)), P('M380 62L372 82M380 62L388 82', ''), T(400, 26, lOn ? `testen át ${TOUCH} mA` : 'áramtalan', { 'font-size': 11, 'text-anchor': 'start' }))
        paintSvg(box, g)
        const scale = idn * 1.5, pct = (x) => Math.min(100, (x / scale) * 100)
        bar.replaceChildren(h('div', { class: 'ac-bar', title: 'kioldási sávok' },
          h('i', { style: { width: '33.33%', background: 'rgba(46,157,58,.45)' } }), h('i', { style: { width: '33.33%', background: 'rgba(232,196,0,.55)' } }),
          h('i', { style: { width: '33.34%', background: 'rgba(224,65,43,.45)' } }), h('b', { style: { left: `calc(${pct(diff)}% - 1px)` } })),
        h('div', { class: 'wrow wsmall', style: { justifyContent: 'space-between' } }, h('span', {}, '0'), h('span', {}, `IΔn/2 = ${idn / 2} mA`), h('span', {}, `IΔn = ${idn} mA`), h('span', {}, `${scale} mA+`)))
        meter.textContent = tripped ? `ÁVK KIOLDOTT – a kör áramtalan\nkioldáskor ΔI = ${fmt(tripDiff, 0)} mA` : `IL = ${fmt(IL / 1000, 3)} A\nIN (ÁVK-n át) = ${fmt(INthru / 1000, 3)} A\nΔI = ${fmt(diff, 0)} mA`
        let t
        if (test) t = 'A TESZT gomb egy ellenálláson át mesterséges különbözeti áramot hoz létre – az ÁVK-nak ki kell oldania. Ez a kioldószerkezetet ellenőrzi, a kioldási időt és áramot nem méri.'
        else if (nBypass && load) t = 'Az N nem az ÁVK-n át tér vissza: a fogyasztó teljes árama különbözeti áramnak látszik, ezért terhelés bekapcsolásakor azonnal kiold (fals kioldás). Az ÁVK-n az L-nek és az N-nek is át kell mennie, a PE-nek soha.'
        else if (touch && idn === 30) t = `Az emberen át a föld felé folyó áram (példa: 230 V / 2000 Ω ≈ ${TOUCH} mA) nem tér vissza az N-en, ezért a 30 mA-es ÁVK kiold – ez a kiegészítő védelem. Ha valaki egyszerre fogja meg az L-t és az N-t, az áram mindkét vezetőn átmegy, nincs különbözeti áram: ez ellen az ÁVK nem véd.`
        else if (touch) t = `A testen át folyó ≈ ${TOUCH} mA a 300 mA-es ÁVK-nál még az IΔn/2 = 150 mA alatt van – nem old ki. A 300 mA-es ÁVK tűzvédelmi célú, személyvédelemre nem elég.`
        else if (diff >= idn) t = `ΔI = ${fmt(diff, 0)} mA ≥ IΔn: az ÁVK biztosan kiold (MSZ EN 61008: IΔn-nél legfeljebb 0,3 s alatt, 5·IΔn-nél 40 ms alatt).`
        else if (diff >= idn / 2) t = `ΔI = ${fmt(diff, 0)} mA az IΔn/2 és IΔn között van: a szabvány szerint itt kioldhat is, meg nem is – gyártó- és példányfüggő (sárga sáv).`
        else t = `ΔI = ${fmt(diff, 0)} mA < IΔn/2 = ${idn / 2} mA: az ÁVK nem old ki. A befolyó és a visszatérő áram egyenlő, a fogyasztó áramának nagysága közömbös.`
        info.textContent = (tripped && !test ? 'Az ÁVK kioldott (Visszakapcsolás gombbal tudod újra bekapcsolni). ' : '') + t
      }
      draw()
    },
  })

  // ============ 6. Csillag–delta a kapocstáblán ============
  W.register({
    id: 'csillag-delta', module: 'm13-motorok-vezerles', kind: 'task',
    title: 'Csillag vagy delta? Kösd be a kapocstáblát!',
    lead: 'Olvasd le az adattáblát, majd „Híd” módban kattints két kapocsra a híd fel-/levételéhez; L1/L2/L3 módban kattints arra a kapocsra, ahová a fázist kötöd. Végül Ellenőrzés.',
    mount(el, api) {
      const star = Math.random() < 0.5
      const kw = shuffle(star ? ['0,75', '1,1', '1,5', '2,2'] : ['4', '5,5', '7,5', '11'])[0]
      const plate = star ? '230/400 V Δ/Y' : '400/690 V Δ/Y'
      const pos = { U1: [140, 120], V1: [280, 120], W1: [420, 120], W2: [140, 240], U2: [280, 240], V2: [420, 240] }
      const wind = [['U', 'U1', 'U2'], ['V', 'V1', 'V2'], ['W', 'W1', 'W2']]
      let mode = 'hid', first = null, bridges = [], ph = {} // ph: kapocs -> 'L1'
      const box = h('div')
      el.append(h('div', { class: 'wmeter', style: { fontSize: '15px', textAlign: 'left' } }, `Adattábla: 3~ motor · ${kw} kW · ${plate} · 50 Hz`, h('br'), 'Hálózat: 3 × 400 V / 50 Hz'),
        choice([['hid', 'Híd'], ['L1', 'L1'], ['L2', 'L2'], ['L3', 'L3']], mode, (v) => { mode = v; first = null; draw() }),
        box, h('div', { class: 'wrow' }, h('button', { class: 'primary', onclick: check }, 'Ellenőrzés'), h('button', { onclick: () => { bridges = []; ph = {}; first = null; draw() } }, 'Minden levétele')))
      const key = (a, b) => [a, b].sort().join('-')
      function click(t) {
        if (mode === 'hid') {
          if (!first) first = t
          else if (first === t) first = null
          else { const k = key(first, t); bridges = bridges.includes(k) ? bridges.filter((x) => x !== k) : [...bridges, k]; first = null }
        } else {
          if (ph[t] === mode) delete ph[t]
          else { for (const k in ph) if (ph[k] === mode) delete ph[k]; ph[t] = mode }
        }
        draw()
      }
      function draw() {
        const g = root(560, 300)
        const lx = { L1: 140, L2: 280, L3: 420 }
        for (const [n, a, b] of wind) {
          const [x1, y1] = pos[a], [x2, y2] = pos[b]
          g.append(s('line', { x1, y1, x2, y2, stroke: 'var(--muted)', 'stroke-width': 1.5, 'stroke-dasharray': '3 5', opacity: 0.7 }))
          g.append(T(x1 + 0.2 * (x2 - x1) + (n === 'W' ? 10 : -10), y1 + 0.2 * (y2 - y1) + 4, n, { 'font-size': 12, style: 'fill:var(--muted)' }))
        }
        for (const L in lx) g.append(T(lx[L], 22, L, { 'font-weight': 700 }))
        for (const [t, L] of Object.entries(ph)) { const [x, y] = pos[t]; g.append(P(`M${lx[L]} 30V${y - 40}L${x} ${y - 30}`, 'live')) }
        for (const b of bridges) { const [a, c] = b.split('-'); g.append(s('line', { x1: pos[a][0], y1: pos[a][1], x2: pos[c][0], y2: pos[c][1], stroke: '#b08d3c', 'stroke-width': 12, 'stroke-linecap': 'round' })) }
        for (const [t, [x, y]] of Object.entries(pos)) {
          g.append(s('circle', { cx: x, cy: y, r: 26, class: 'ac-box' + (first === t ? ' ac-sel' : '') }), T(x, y + 5, t, { 'font-weight': 700 }))
          g.append(hit(x - 30, y - 30, 60, 60, () => click(t), t + ' kapocs'))
        }
        g.append(T(280, 290, 'szaggatott vonal: a tekercsek (U1–U2, V1–V2, W1–W2)', { 'font-size': 11 }))
        paintSvg(box, g)
        api.note('')
        if (first) api.note(`${first} kiválasztva – kattints a másik kapocsra a híd fel-/levételéhez.`)
      }
      function check() {
        const par = {}
        const f = (a) => { while (par[a] && par[a] !== a) a = par[a]; return a }
        for (const b of bridges) { const [a, c] = b.split('-'); const x = f(a), y = f(c); if (x !== y) par[x] = y }
        const netPh = {}
        for (const [t, L] of Object.entries(ph)) (netPh[f(t)] ||= new Set()).add(L)
        const P_ = (t) => { const s_ = netPh[f(t)]; return s_ ? [...s_] : [] }
        const phases = new Set(Object.values(ph))
        if (phases.size < 3) return api.done(false, 'Mindhárom fázist (L1, L2, L3) kösd be egy-egy kapocsra.')
        for (const st of Object.values(netPh)) if (st.size > 1) return api.done(false, `Zárlat: ${[...st].join(' és ')} egy hídon/ponton találkozik – két fázis nem kerülhet egy pontra.`)
        for (const [n, a, b] of wind) if (f(a) === f(b)) return api.done(false, `A(z) ${n} tekercs rövidre van zárva (${a} és ${b} egy ponton) – a híd soha nem köthet össze egy tekercs két végét.`)
        // csillag: minden tekercs egyik vége fázison, a másik a közös, fázis nélküli csillagponton
        let isStar = false
        const nets = wind.map(([, a, b]) => [P_(a), P_(b), f(a), f(b)])
        for (const pick of [0, 1, 2, 3, 4, 5, 6, 7]) {
          const pp = nets.map((w, i) => ((pick >> i) & 1 ? w[1] : w[0]))
          const sp = nets.map((w, i) => ((pick >> i) & 1 ? w[2] : w[3]))
          const spPh = nets.map((w, i) => ((pick >> i) & 1 ? w[0] : w[1]))
          if (pp.every((x) => x.length === 1) && new Set(pp.map((x) => x[0])).size === 3 && sp.every((x) => x === sp[0]) && spPh.every((x) => x.length === 0)) isStar = true
        }
        const isDelta = nets.every((w) => w[0].length === 1 && w[1].length === 1 && w[0][0] !== w[1][0]) &&
          new Set(nets.map((w) => [w[0][0], w[1][0]].sort().join())).size === 3
        if (!isStar && !isDelta) {
          const loose = wind.find(([, a, b]) => !P_(a).length && !bridges.some((x) => x.split('-').includes(a)) || !P_(b).length && !bridges.some((x) => x.split('-').includes(b)))
          return api.done(false, 'Ez se nem csillag, se nem delta.' + (loose ? ` A(z) ${loose[0]} tekercs egyik vége sehová nincs kötve.` : '') + ' Csillag: U2–V2–W2 összekötve (két híd az alsó soron), a fázisok U1, V1, W1-re. Delta: három függőleges híd (U1–W2, V1–U2, W1–V2), a fázisok a felső sorra.')
        }
        if (star && isDelta) return api.done(false, `Deltát kötöttél, de a motor ${plate}: a tekercsek 230 V-osak. Deltában a tekercsre a vonali 400 V jutna – a motor túlmelegszik, leég. 3 × 400 V-on csillag kell (tekercsenként 400/√3 ≈ 230 V).`)
        if (!star && isStar) return api.done(false, `Csillagot kötöttél, de a motor ${plate}: a tekercsek 400 V-osak. Csillagban csak 400/√3 ≈ 230 V jutna rájuk, a nyomatéka kb. harmadára esne, terhelve túlmelegszik. 3 × 400 V-on delta kell.`)
        api.done(true, star
          ? `Helyes: csillag. ${plate} motor 3 × 400 V-on csillagban üzemel – a tekercsenkénti feszültség 400/√3 ≈ 230 V. (Ez a motor csillag–delta indításra nem alkalmas.)`
          : `Helyes: delta. ${plate} motor 3 × 400 V-on deltában üzemel – minden tekercs a vonali 400 V-ot kapja. Ilyen motor indítható csillag–delta indítással is.`)
      }
      draw()
    },
  })

  // ============ 7. Öntartás mágneskapcsolóval ============
  W.register({
    id: 'ontartas-demo', module: 'm13-motorok-vezerles', kind: 'demo',
    title: 'Öntartó kapcsolás mágneskapcsolóval',
    lead: 'Nyomd meg a START-ot, a STOP-ot, és próbáld ki a hőrelé (F2) kioldását! A piros szakasz a feszültség alatti vezérlő áramút.',
    mount(el) {
      let k1 = false, start = false, stop = false, f2 = false, tS = 0
      const log = []
      const box = h('div'), steps = h('ol', { class: 'wsmall', 'aria-live': 'polite', style: { margin: 0, paddingLeft: '20px' } })
      const say = (t) => { log.push(t); if (log.length > 5) log.shift() }
      const bF2 = h('button', { type: 'button', onclick: () => { f2 = !f2; say(f2 ? 'F2 hőrelé kiold (túlterhelés): a 95-96 bontó nyit, K1 tekercse áramtalan, K1 elenged – a motor megáll, az öntartás megszűnik.' : 'F2 visszaállítva (reset): a 95-96 újra zár, de a motor NEM indul magától – START kell.'); update() } })
      const pulse = (which) => {
        clearTimeout(tS); start = which === 'start'; stop = which === 'stop'
        update()
        tS = setTimeout(() => { start = stop = false; update() }, 700)
      }
      el.append(box, h('div', { class: 'wrow' }, h('button', { type: 'button', class: 'primary', onclick: () => pulse('start') }, 'START (S1, záró)'), h('button', { type: 'button', onclick: () => pulse('stop') }, 'STOP (S0, bontó)'), bF2), steps)
      function update() {
        const was = k1
        const a1 = !f2, a2 = a1 && !stop
        k1 = a2 && (start || k1)
        if (!was && k1) say('START: L → F2 → S0 → S1 → K1 tekercs (A1–A2) → N; K1 behúz, a főérintkezők indítják a motort, a 13-14 segédzáró zár.')
        if (was && k1 && !start && log[log.length - 1]?.startsWith('START')) say('START elengedve: az áram a START-tal párhuzamos K1 13-14 segédzárón át folyik tovább – ez az öntartás.')
        if (was && !k1 && stop) say('STOP: a bontó érintkező megszakítja a tekercs áramát, K1 elenged, a 13-14 is nyit – a gomb elengedése után sem indul újra.')
        if (!was && !k1 && start && f2) say('START hatástalan: a hőrelé 95-96 bontója nyitva, amíg vissza nem állítod.')
        draw(a1, a2)
      }
      function draw(a1, a2) {
        bF2.textContent = f2 ? 'F2: KIOLDOTT – reset' : 'F2 hőrelé kioldása'
        bF2.classList.toggle('on', f2); bF2.setAttribute('aria-pressed', f2)
        const g = root(640, 300)
        const node = a2 && (start || k1)
        g.append(T(16, 84, 'L'), W_(26, 80, 70, 80, 'live'))
        const contact = (x, y, closed, liveIn, liveOut, label, nc) => {
          g.append(dot(x, y), dot(x + 50, y), closed ? W_(x, y, x + 50, y, live(liveIn && liveOut)) : W_(x, y, x + 46, y - 18, live(liveIn)), T(x + 25, y - 22, label, { 'font-size': 11 }))
          if (nc) g.append(T(x + 25, y + 18, 'bontó', { 'font-size': 10 }))
          else g.append(T(x + 25, y + 18, 'záró', { 'font-size': 10 }))
        }
        contact(70, 80, !f2, true, a1, 'F2 95-96', true)
        g.append(W_(120, 80, 170, 80, live(a1)))
        contact(170, 80, !stop, a1, a2, 'S0 STOP', true)
        g.append(W_(220, 80, 270, 80, live(a2)), dot(270, 80), W_(270, 80, 290, 80, live(a2)), P('M270 80V160H290', live(a2)))
        contact(290, 80, start, a2, node, 'S1 START', false)
        contact(290, 160, k1, a2, node, 'K1 13-14', false)
        g.append(W_(340, 80, 380, 80, live(node)), P('M340 160H380V80', live(node)), dot(380, 80), W_(380, 80, 430, 80, live(node)))
        g.append(s('rect', { x: 430, y: 62, width: 60, height: 36, class: 'ac-box', style: k1 ? 'fill:rgba(224,65,43,.35)' : '' }), T(460, 85, 'K1', { 'font-weight': 700 }),
          T(430, 56, 'A1', { 'font-size': 10 }), T(490, 56, 'A2', { 'font-size': 10 }), W_(490, 80, 600, 80, 'n'), T(616, 84, 'N'))
        g.append(T(460, 120, k1 ? 'tekercs: BEHÚZVA' : 'tekercs: elengedve', { 'font-size': 11 }))
        // főáramkör vázlat
        g.append(T(20, 215, 'Főáramkör: L1 L2 L3 → Q1 → K1 → F2 → M', { 'font-size': 11, 'text-anchor': 'start' }))
        const mg = s('g', {}, s('circle', { cx: 470, cy: 240, r: 34, class: 'ac-box', style: k1 ? 'stroke:#2e9d3a;stroke-width:3' : '' }), T(470, 236, 'M', { 'font-weight': 700 }), T(470, 252, '3~', { 'font-size': 11 }))
        const fan = s('g', { class: k1 ? 'ac-spin' : '' }, s('path', { d: 'M560 240l0-26M560 240l22 13M560 240l-22 13', stroke: 'var(--fg)', 'stroke-width': 5, 'stroke-linecap': 'round' }))
        g.append(mg, W_(504, 240, 560, 240), fan, T(560, 290, k1 ? 'forog' : 'áll', { 'font-size': 12 }))
        paintSvg(box, g)
        steps.replaceChildren(...(log.length ? log : ['Alapállapot: K1 elengedve, a motor áll. Nyomd meg a START-ot!']).map((t) => h('li', {}, t)))
      }
      update()
      return () => clearTimeout(tS)
    },
  })

  // ============ 8. Mérőhely bekötése ============
  W.register({
    id: 'merohely-bekotes', module: 'm07-merohely', kind: 'task',
    title: 'Egyfázisú mérőhely: kapcsok és sorrend',
    lead: '(a) Válaszd ki, melyik vezeték kerül az 1–3–4–6 kapcsos egyfázisú direkt mérő egyes kapcsaira. (b) Állítsd sorrendbe (↑/↓) a fázis útját a csatlakozástól a fogyasztóig. Végül Ellenőrzés.',
    mount(el, api) {
      const wires = shuffle([['Lb', 'méretlen L (a főkismegszakítóról)'], ['Lk', 'mért L ki (a lakás főelosztója felé)'], ['Nb', 'N be (a PEN-szétválasztás N-kapcsáról)'], ['Nk', 'N ki (a lakás főelosztója felé)']])
      const want = { 1: 'Lb', 3: 'Lk', 4: 'Nb', 6: 'Nk' }
      const sel = {}
      const ul = h('ul', { class: 'wlist ac-sel-row' })
      for (const t of [1, 3, 4, 6]) {
        sel[t] = ''
        ul.append(h('li', { 'data-t': t }, h('span', {}, h('b', {}, `${t}. kapocs`)),
          h('select', { 'aria-label': `Mérő ${t}. kapocs`, onchange: (e) => { sel[t] = e.target.value } }, h('option', { value: '' }, '— válassz —'), wires.map(([v, n]) => h('option', { value: v }, n)))))
      }
      const correct = ['Csatlakozó vezeték (méretlen L + PEN)', 'Plombálható főkismegszakító (pl. B32), a fázisban', 'Fogyasztásmérő (L: 1 → 3)', 'Mért fővezeték (10 mm² Cu)', 'Lakás főelosztó: ÁVK 30 mA', 'Kismegszakítók (B10, B16) → fogyasztók']
      let order = shuffle(correct)
      while (order.join() === correct.join()) order = shuffle(correct)
      const ol = h('ul', { class: 'wlist' })
      const paint = () => ol.replaceChildren(...order.map((t, i) => h('li', {}, h('b', {}, i + 1 + '.'), h('span', {}, t),
        h('button', { type: 'button', 'aria-label': `${t} feljebb, jelenleg ${i + 1}.`, disabled: i === 0, onclick: () => move(i, -1) }, '↑'),
        h('button', { type: 'button', 'aria-label': `${t} lejjebb, jelenleg ${i + 1}.`, disabled: i === order.length - 1, onclick: () => move(i, 1) }, '↓'))))
      function move(i, delta) {
        const t = order[i]; [order[i + delta], order[i]] = [order[i], order[i + delta]]
        paint(); api.note(`„${t}” új helye: ${i + delta + 1}.`)
        const buttons = ol.children[i + delta].querySelectorAll('button')
        const button = buttons[delta < 0 ? 0 : 1]
        ;(button.disabled ? buttons[delta < 0 ? 1 : 0] : button).focus({ preventScroll: true })
      }
      paint()
      el.append(h('b', {}, '(a) A mérő kapcsai'), ul, h('b', {}, '(b) A fázis útja'), ol, h('div', { class: 'wrow' }, h('button', { type: 'button', class: 'primary', onclick: check }, 'Ellenőrzés')))
      function check() {
        const msgs = []
        ul.querySelectorAll('li').forEach((li) => { const t = li.dataset.t; li.className = sel[t] === want[t] ? 'ok' : 'no' })
        if (Object.values(sel).some((v) => !v)) msgs.push('Minden mérőkapocshoz válassz vezetéket.')
        else if (sel[1] === 'Lk' && sel[3] === 'Lb') msgs.push('A mérő fázisa fordítva: 1 = méretlen L be, 3 = mért L ki.')
        else if (sel[4] === 'Nk' && sel[6] === 'Nb') msgs.push('A mérő nullája fordítva: 4 = N be, 6 = N ki.')
        else if (['Lb', 'Lk'].includes(sel[4]) || ['Lb', 'Lk'].includes(sel[6])) msgs.push('Fázis és nulla felcserélve: a fázis az 1–3, a nulla a 4–6 kapcsokon halad át.')
        else if ([1, 3, 4, 6].some((t) => sel[t] !== want[t])) msgs.push('A kapcsok kiosztása nem jó: 1 = méretlen L be, 3 = mért L ki, 4 = N be, 6 = N ki.')
        const pos = (t) => order.indexOf(correct[t])
        ol.querySelectorAll('li').forEach((li, i) => { li.className = order[i] === correct[i] ? 'ok' : 'no' })
        if (pos(1) > pos(2)) msgs.push('A főkismegszakító a mérő ELŐTT van (a méretlen oldalon, a fázisban, plombálható térben).')
        if (pos(4) < pos(2)) msgs.push('Az ÁVK csak a mért, már szétválasztott (TN-S) oldalon lehet – a mérő előtt tilos.')
        if (pos(5) < pos(4)) msgs.push('A lakás főelosztóban az ÁVK a kismegszakítók előtt van (ÁVK → kismegszakítók → fogyasztók).')
        if (!msgs.length && order.join() !== correct.join()) msgs.push('A sorrend még nem jó: csatlakozó vezeték → főkismegszakító → mérő → mért fővezeték → ÁVK → kismegszakítók.')
        if (msgs.length) return api.done(false, msgs.join(' '))
        api.done(true, 'Helyes! Méretlen L → főkismegszakító → mérő 1 → 3 → mért fővezeték → ÁVK → kismegszakítók. A PEN a főföldelő (PE) sínre kerül, onnan híd az N-kapocsra; a mérőn az N (4 → 6) megy át, a PEN soha. Méretlen leágazás nem lehet. (Valódi mérőhelynél a szekrény jóváhagyott rajza és az elosztó előírása dönt.)')
      }
    },
  })

  // ============ 9. Fürdőszoba zónák ============
  W.register({
    id: 'furdo-zonak', module: 'm14-kabelek-szereles-kulonleges-helyek', kind: 'task',
    title: 'Fürdőszoba: melyik zónába szerelhető?',
    lead: 'Minden eszközhöz válaszd ki a legbelső (legszigorúbb) zónát, ahová még szerelhető – vagy azt, hogy a 0–2. zónában sehol. (MSZ HD 60364-7-701)',
    mount(el, api) {
      const pool = [
        { n: '230 V-os dugaszolóaljzat (2P+F)', a: 'x', why: '230 V-os dugaszolóaljzat a 0–2. zónában nem lehet; a zónákon kívül, 30 mA-es ÁVK mögött.' },
        { n: '230 V-os dugaszolóaljzat, IP44-es fedeles', a: 'x', why: 'A jobb IP-védettség sem teszi megengedetté: 230 V-os dugalj a 0–2. zónában nem lehet.' },
        { n: 'IPX4-es lámpatest, 230 V, fixen bekötve', a: '1', why: 'Fix bekötésű, legalább IPX4-es lámpatest az 1. zónában (és így a 2.-ban) is lehet; a 0. zónába nem.' },
        { n: '12 V-os SELV lámpatest, IPX7, 0. zónába gyártva (a biztonsági transzformátor a zónákon kívül)', a: '0', why: 'A 0. zónában csak fix bekötésű, oda szánt, IPX7-es, legfeljebb 12 V AC SELV-ről táplált eszköz lehet, a tápforrás a zónákon kívül.' },
        { n: 'Villanybojler (vízmelegítő), fixen bekötve, IPX4', a: '1', why: 'Fixen bekötött, oda szánt, IPX4-es vízmelegítő az 1. zónában is lehet.' },
        { n: 'Elszívó ventilátor, fixen bekötve, IPX4', a: '1', why: 'Fixen bekötött, IPX4-es szellőztető ventilátor az 1. zónában is lehet.' },
        { n: 'IP20-as (nem vízvédett) lámpatest, 230 V', a: 'x', why: 'A 0–2. zónában legalább IPX4 kell (0. zónában IPX7) – IP20-as lámpatest csak a zónákon kívülre.' },
      ]
      const items = shuffle(pool).slice(0, 5).map((d) => ({ ...d, v: '' }))
      const g = root(640, 300)
      const m = 89 // px / m
      const top = 270 - 2.25 * m
      g.append(s('rect', { x: 40, y: top, width: 200, height: 270 - top - 40, fill: 'rgba(31,111,209,.10)' }), T(140, top + 60, '1. zóna', { 'font-weight': 700 }))
      g.append(s('rect', { x: 240, y: top, width: 0.6 * m, height: 270 - top, fill: 'rgba(46,157,58,.12)' }), T(240 + 0.3 * m, top + 60, '2.', { 'font-weight': 700 }))
      g.append(P('M40 230H240V270', ''), s('path', { d: 'M48 232H232V262Q140 272 48 262Z', fill: 'rgba(31,111,209,.35)' }), T(140, 254, '0. zóna (kád belseje)', { 'font-size': 11 }))
      g.append(W_(30, 270, 630, 270), W_(40, 20, 40, 270), T(400, 290, 'padló', { 'font-size': 11 }))
      g.append(s('line', { x1: 240, y1: top, x2: 240, y2: 270, stroke: 'var(--fg)', 'stroke-dasharray': '4 4' }), s('line', { x1: 240 + 0.6 * m, y1: top, x2: 240 + 0.6 * m, y2: 270, stroke: 'var(--fg)', 'stroke-dasharray': '4 4' }), s('line', { x1: 40, y1: top, x2: 240 + 0.6 * m, y2: top, stroke: 'var(--fg)', 'stroke-dasharray': '4 4' }))
      g.append(T(48, top - 6, '2,25 m a padlótól', { 'font-size': 11, 'text-anchor': 'start' }), T(240 + 0.3 * m, top - 8, '0,6 m', { 'font-size': 11 }), T(450, 150, 'zónán kívül', { 'font-size': 12 }))
      const ul = h('ul', { class: 'wlist' })
      const opts = [['0', '0.'], ['1', '1.'], ['2', '2.'], ['x', 'sehol (0–2)']]
      items.forEach((d) => {
        const row = h('div', { class: 'wrow', role: 'group', 'aria-label': `${d.n} – zónaválasztás` })
        opts.forEach(([v, t]) => row.append(h('button', { type: 'button', 'aria-pressed': 'false', onclick: () => {
          d.v = v
          ;[...row.children].forEach((b, i) => { const selected = opts[i][0] === v; b.classList.toggle('on', selected); b.setAttribute('aria-pressed', selected) })
        } }, t)))
        d.li = h('li', { style: { flexWrap: 'wrap' } }, h('span', { style: { minWidth: 'min(180px, 100%)' } }, d.n), row)
        ul.append(d.li)
      })
      el.append(g, ul, h('div', { class: 'wrow' }, h('button', { type: 'button', class: 'primary', onclick: check }, 'Ellenőrzés')))
      function check() {
        if (items.some((d) => !d.v)) return api.done(false, 'Minden eszközhöz válassz zónát.')
        const bad = []
        items.forEach((d) => {
          const ok = d.v === d.a
          d.li.className = ok ? 'ok' : 'no'
          if (!ok) {
            let why = d.why
            if (d.a !== 'x' && d.v !== 'x' && +d.v > +d.a) why = `A ${d.v}. zónába is szerelhető, de beljebb is: ` + d.why
            bad.push(`${d.n}: ${why}`)
          }
        })
        if (bad.length) return api.done(false, bad.join(' · '))
        api.done(true, 'Mind helyes! Ne feledd: a fürdőszoba összes áramkörét 30 mA-es ÁVK védje, és ahol a terv vagy az előírás megköveteli, helyi egyenpotenciálra hozás kell. A 0–2. zónában csak oda szánt, fixen bekötött eszköz lehet.')
      }
    },
  })
})()
