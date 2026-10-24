// Interaktív szemléltetések és mini feladatok – B csomag (vizsgastratégia, munkavédelem, mérések,
// elosztó, alapszámítások, vezetékméretezés, kábelek, PV, hibakeresés, rajzjelek).
// A keretet a core.js adja (W.register, W.h, W.s, W.shuffle, W.fmt).
;(function () {
  const { h, s, shuffle, fmt } = W
  const pick = (a) => a[Math.floor(Math.random() * a.length)]
  const rint = (a, b) => a + Math.floor(Math.random() * (b - a + 1))
  /** véletlen érték a..b között, step lépésközzel */
  const rstep = (a, b, step) => Math.round((a + Math.floor(Math.random() * (Math.round((b - a) / step) + 1)) * step) * 1000) / 1000
  /** magyar tizedesvesszős szám beolvasása */
  const num = (x) => parseFloat(String(x).replace(/\s/g, '').replace(',', '.'))
  const near = (got, want, tol) => Number.isFinite(got) && Math.abs(got - want) <= Math.abs(want) * tol + 1e-9
  const SQ3 = Math.sqrt(3)
  const RHO = 0.0178 // Ω·mm²/m, réz
  // tájékoztató terhelhetőség (src/sim/generated.ts és a 12. modul táblázata)
  const IZ = { 1.5: 17.5, 2.5: 24, 4: 32, 6: 41, 10: 57, 16: 76 }
  const IN_STD = [6, 10, 13, 16, 20, 25, 32, 40, 50, 63]
  // a src/sim/score.ts grade() függvénye: a százalékot kerekítve sorolja be
  function grade(pct) {
    const p = Math.round(pct)
    if (p >= 80) return { jegy: 5, nev: 'jeles' }
    if (p >= 60) return { jegy: 4, nev: 'jó' }
    if (p >= 50) return { jegy: 3, nev: 'közepes' }
    if (p >= 40) return { jegy: 2, nev: 'elégséges' }
    return { jegy: 1, nev: 'elégtelen' }
  }

  // egyszeri kiegészítő stílus (bf- előtag)
  if (!document.getElementById('bf-style')) {
    const st = document.createElement('style')
    st.id = 'bf-style'
    st.textContent = `
.bf-ar{display:flex;gap:4px}.wbody .bf-ar button{min-width:36px;min-height:36px;padding:0 6px}
.wbody button{min-height:36px}
.bf-card{background:var(--bg);border:1px solid var(--line);border-radius:8px;padding:8px 10px;display:flex;flex-direction:column;gap:6px}
.bf-card.ok{border-color:var(--good)}.bf-card.no{border-color:var(--bad)}
.bf-why{font-size:13px;color:var(--muted);margin:0}
.bf-card.no .bf-why{color:var(--bad)}.bf-card.ok .bf-why{color:var(--good)}
.bf-sl{display:grid;grid-template-columns:1fr auto;gap:2px 10px;align-items:center}
.bf-sl input{grid-column:1/-1}
.bf-meter{font-size:18px;min-width:130px;align-self:flex-start}
.bf-in{width:96px}
.bf-fit select{max-width:100%;min-width:0;flex:1 1 200px}
.bf-card select{max-width:100%;min-width:0}.bf-card .wrow>select:only-of-type{flex:1 1 160px}
.bf-lab{display:inline-flex;gap:6px;align-items:center}
.bf-sym{width:76px;height:76px;padding:4px!important;color:var(--fg)}
.bf-sym svg{width:100%;height:100%;display:block}
.wbody button.bf-sel{outline:3px solid var(--acc);outline-offset:1px}
.wbody button.bf-done{opacity:.45;border-color:var(--good)}
.bf-ol{margin:0;padding-left:20px;font-size:14px}.bf-ol li{margin:3px 0}
.bf-pre{white-space:pre-line;font-size:14px;background:var(--bg);border:1px solid var(--line);border-radius:6px;padding:6px 10px;margin:0}
.wsvg .bf-t{font-size:11px}.wsvg .bf-b{font-weight:700}
`
    document.head.append(st)
  }

  /** gombsor egyetlen választással; onPick(érték) */
  function choice(opts, onPick, cls, init) {
    let cur = init === undefined ? null : init
    const row = h('div', { class: 'wrow' + (cls ? ' ' + cls : '') })
    const btns = opts.map((o) => {
      const b = h('button', { type: 'button', class: o.v === cur ? 'on' : null, onclick: () => { cur = o.v; btns.forEach((x) => x.classList.toggle('on', x === b)); onPick && onPick(o.v) } }, o.t)
      row.append(b)
      return b
    })
    return { el: row, get: () => cur }
  }
  /** legördülő lista; az első üres elem a „válassz” */
  function select(opts, ph = 'válassz…') {
    return h('select', {}, h('option', { value: '' }, ph), ...opts.map((o) => h('option', { value: o.v }, o.t)))
  }

  /** ↑/↓ gombos sorbarendezés. items: helyes sorrendben [{t, why, hint}] */
  function orderTask(el, api, items, okMsg) {
    let order = shuffle(items.map((_, i) => i))
    while (order.every((v, i) => v === i)) order = shuffle(order)
    const ul = h('ol', { class: 'wlist' })
    const why = h('div', {})
    function draw(marks) {
      ul.replaceChildren(...order.map((idx, pos) => {
        const li = h('li', { class: marks ? (marks[pos] ? 'ok' : 'no') : '' },
          h('b', {}, pos + 1 + '.'), h('span', {}, items[idx].t),
          h('div', { class: 'bf-ar' },
            h('button', { type: 'button', 'aria-label': 'feljebb', disabled: pos === 0, onclick: () => { [order[pos - 1], order[pos]] = [order[pos], order[pos - 1]]; draw(); why.replaceChildren(); api.note('') } }, '↑'),
            h('button', { type: 'button', 'aria-label': 'lejjebb', disabled: pos === order.length - 1, onclick: () => { [order[pos + 1], order[pos]] = [order[pos], order[pos + 1]]; draw(); why.replaceChildren(); api.note('') } }, '↓')))
        return li
      }))
    }
    draw()
    const check = h('button', { type: 'button', class: 'primary', onclick: () => {
      const marks = order.map((v, i) => v === i)
      draw(marks)
      const good = marks.filter(Boolean).length
      if (good === items.length) {
        api.done(true, okMsg)
        why.replaceChildren(h('b', {}, 'Miért ebben a sorrendben?'), h('ol', { class: 'bf-ol' }, ...items.map((it) => h('li', {}, h('b', {}, it.t + ': '), it.why))))
      } else {
        const first = marks.indexOf(false)
        const it = items[order[first]]
        api.done(false, `${good}/${items.length} lépés van jó helyen. ${first === 0 || first === 4 ? 'Az' : 'A'} ${first + 1}. helyen álló „${it.t}” nem oda való: ${it.hint}`)
        why.replaceChildren()
      }
    } }, 'Ellenőrzés')
    el.append(ul, h('div', { class: 'wrow' }, check), why)
  }

  // ===================================================================== 1. Pontkalkulátor
  W.register({
    id: 'pont-kalkulator', module: 'm01-vizsga-strategia', kind: 'demo',
    title: 'Pontkalkulátor: mennyi kell a következő jegyhez?',
    lead: 'Állítsd be a várható eredményeidet. Projekt = 20% portfólió + 40% szerelés + 40% mérőhely; végeredmény = 70% projekt + 30% interaktív vizsga. Mindkét vizsgatevékenységen külön legalább 40% kell.',
    mount(el) {
      const v = { p: 70, ii: 60, iii: 60, it: 50 }
      const names = { p: 'I. Portfólió (a projekt 20%-a)', ii: 'II. Épületvillamossági szerelés (40%)', iii: 'III. Fogyasztásmérő hely (40%)', it: 'Központi interaktív vizsga' }
      let bad = false
      const grid = h('div', { class: 'bf-sl' })
      for (const k of Object.keys(v)) {
        const out = h('b', {}, v[k] + '%')
        const inp = h('input', { type: 'range', min: 0, max: 100, step: 1, value: v[k], 'aria-label': names[k], oninput: (e) => { v[k] = +e.target.value; out.textContent = v[k] + '%'; upd() } })
        grid.append(h('span', {}, names[k]), out, inp)
      }
      const cb = h('label', { class: 'bf-lab' }, h('input', { type: 'checkbox', onchange: (e) => { bad = e.target.checked; upd() } }), 'Hiba az áramütés elleni védelemben (pl. hiányzó PE)')

      const svg = s.root(640, 150)
      const X0 = 130, WD = 490
      const bars = {}
      ;[['proj', 'Projekt', 22], ['it', 'Interaktív', 62], ['tot', 'Végeredmény', 108]].forEach(([k, lab, y]) => {
        svg.append(s('text', { x: 4, y: y + 15, class: k === 'tot' ? 'bf-b' : '' }, lab))
        svg.append(s('rect', { x: X0, y, width: WD, height: 22, rx: 4, fill: 'var(--bg)', stroke: 'var(--line)' }))
        bars[k] = s('rect', { x: X0, y, width: 0, height: 22, rx: 4, fill: 'var(--acc)' })
        bars[k + 't'] = s('text', { x: X0 + 6, y: y + 16, class: 'bf-b' }, '')
        svg.append(bars[k], bars[k + 't'])
      })
      const tx = (p) => X0 + (WD * p) / 100
      // 40%-os minimum a két vizsgatevékenységen, jegyhatárok a végeredményen
      for (const y of [22, 62]) svg.append(s('line', { x1: tx(40), x2: tx(40), y1: y - 3, y2: y + 25, stroke: 'var(--bad)', 'stroke-width': 2, 'stroke-dasharray': '4 3' }))
      svg.append(s('text', { x: tx(40) + 3, y: 58, class: 'bf-t', fill: 'var(--bad)' }, 'min. 40%'))
      ;[[40, '2'], [50, '3'], [60, '4'], [80, '5']].forEach(([p, j]) => {
        svg.append(s('line', { x1: tx(p), x2: tx(p), y1: 104, y2: 134, stroke: 'var(--fg)', 'stroke-width': 1.5 }))
        svg.append(s('text', { x: tx(p), y: 146, 'text-anchor': 'middle', class: 'bf-t' }, `${p}%`), s('text', { x: tx(p) + 2, y: 102, class: 'bf-t bf-b' }, j))
      })
      const res = h('p', { style: { margin: 0, fontSize: '16px' } })
      svg.append(s('text', { x: X0 + WD, y: 102, 'text-anchor': 'end', class: 'bf-t' }, 'jegy'))
      const info = h('p', { class: 'wsmall', style: { margin: 0 } })
      el.append(grid, cb, svg, res, info)

      function upd() {
        // pontosan a score.ts forecast() logikája: érvénytelen résznél 0, bármely vizsgatevékenység < 40% → sikertelen
        const proj = (20 * v.p + 40 * v.ii + 40 * (bad ? 0 : v.iii)) / 100
        const total = 0.7 * proj + 0.3 * v.it
        const failed = bad || proj < 40 || v.it < 40
        const g = failed ? grade(0) : grade(total)
        const set = (k, p, red) => { bars[k].setAttribute('width', (WD * Math.max(0, p)) / 100); bars[k].setAttribute('fill', red ? 'var(--bad)' : 'var(--good)'); bars[k + 't'].textContent = fmt(p, 1) + '%' }
        set('proj', proj, bad || proj < 40)
        set('it', v.it, v.it < 40)
        set('tot', total, failed)
        res.replaceChildren(`Projekt: ${fmt(proj, 1)}% · végeredmény: ${fmt(total, 1)}% → `, h('b', { style: { color: failed ? 'var(--bad)' : 'var(--good)' } }, bad ? 'ÉRVÉNYTELEN vizsga (elégtelen)' : `${g.nev} (${g.jegy})`))
        let t
        if (bad) t = 'Az áramütés elleni védelem hibája érvénytelen vizsgát jelent: ezt semmilyen más ponttal nem lehet pótolni. Ezért kezdd a vezetékezést a PE-vel, és bekapcsolás előtt szemrevételezz.'
        else if (proj < 40 || v.it < 40) {
          const parts = []
          if (proj < 40) parts.push(`a projekt ${fmt(proj, 1)}% – még ${fmt(40 - proj, 1)} %-pont kell benne (pl. +${fmt((40 - proj) / 0.4, 1)} %-pont a szerelésben vagy a mérőhelyen)`)
          if (v.it < 40) parts.push(`az interaktív vizsga ${v.it}% – még ${40 - v.it} %-pont kell a 40%-hoz`)
          t = `Sikertelen, mert ${parts.join(', és ')}. A 40%-os minimum mindkét vizsgatevékenységen külön feltétel, a másikban szerzett többlet nem pótolja.`
        } else if (g.jegy < 5) {
          const T = { 2: 50, 3: 60, 4: 80 }[g.jegy]
          const need = T - 0.5 - total // a jegy a kerekített százalékból jön (pl. 79,5% → 80% → jeles)
          const opts = [['az interaktív vizsgán', 0.3, v.it], ['a szerelésben', 0.28, v.ii], ['a mérőhelyen', 0.28, v.iii], ['a portfólión', 0.14, v.p]]
            .filter(([, w, cur]) => cur + need / w <= 100).map(([n, w]) => `+${fmt(need / w, 1)} %-pont ${n}`)
          t = `A következő jegyhez (${grade(T).nev}, ${T}%) még ${fmt(need, 1)} %-pont kell a végeredményben (a százalékot kerekítik).` +
            (opts.length ? ` Ez például: ${opts.join(' vagy ')}.` : ' Ez egyetlen részből már nem jön ki, több részen kell javítani.') +
            ' Egy %-pont a szerelésben vagy a mérőhelyen 0,28, az interaktív vizsgán 0,3 %-pontot ér a végeredményben.'
        } else t = 'Jeles. A legbiztosabb tartalék: hibátlan áramütés elleni védelem és a szerszám-, műszerválasztás (a szerelés 20%-a).'
        info.textContent = t
      }
      upd()
    },
  })

  // ===================================================================== 2. Az öt szabály
  W.register({
    id: 'ot-szabaly', module: 'm02-munkavedelem', kind: 'task',
    title: 'A feszültségmentesítés öt szabálya – sorrendben',
    lead: 'Rakd helyes sorrendbe a ↑/↓ gombokkal, majd ellenőrizd. A vizsgán sorrendben kell elmondanod és végrehajtanod.',
    mount(el, api) {
      orderTask(el, api, [
        { t: 'Kikapcsolás, leválasztás minden betáplálási oldalról', why: 'Előbb meg kell szüntetni a táplálást (kismegszakító, főkapcsoló) – minden irányból, ahonnan feszültség érkezhet.', hint: 'ez az első lépés: amíg nincs leválasztva, nincs mit biztosítani és ellenőrizni.' },
        { t: 'Visszakapcsolás elleni biztosítás (lakat, tábla)', why: 'A leválasztott kapcsolót lakattal, tiltótáblával biztosítod, hogy más ne kapcsolhassa vissza, amíg dolgozol.', hint: 'a visszakapcsolás elleni biztosítás közvetlenül a leválasztás után jön, még az ellenőrzés előtt.' },
        { t: 'Feszültségmentesség ellenőrzése', why: 'Kétpólusú feszültségvizsgálóval minden pólus között (L–N, L–PE, N–PE) – csak a biztosított leválasztás után van értelme. Fázisceruza erre nem alkalmas.', hint: 'feszültségmentességet csak a leválasztás és a visszakapcsolás elleni biztosítás után ellenőrzünk.' },
        { t: 'Földelés és rövidrezárás (ahol szükséges)', why: 'Csak a feszültségmentesség megállapítása után szabad földelni és rövidre zárni – feszültség alatti részen ez zárlat lenne.', hint: 'földelni és rövidre zárni csak a feszültségmentesség ellenőrzése után szabad.' },
        { t: 'Szomszédos, feszültség alatt álló részek letakarása, elkerítése', why: 'Végül a közelben maradó, feszültség alatti részeket letakarod, elkeríted, hogy véletlenül se érintsd meg őket.', hint: 'a szomszédos részek letakarása az utolsó, ötödik lépés.' },
      ], 'Helyes! Visszakapcsoláskor fordított sorrendben haladsz, és meggyőződsz róla, hogy senki nem dolgozik a berendezésen.')
    },
  })

  // ===================================================================== 3. Szerszámválasztás
  const TOOLJOBS = [
    { job: 'Feszültségmentesség ellenőrzése a dobozban', opts: [
      ['Kétpólusú feszültségvizsgáló', 1, 'Két ponton (L–N, L–PE, N–PE) méri a feszültséget – erre való.'],
      ['Fázisceruza (egypólusú)', 0, 'A fázisceruza a testeden át jelez, nem mér két pont között: feszültségmentesség megállapítására nem alkalmas.'],
      ['Lakatfogó', 0, 'A lakatfogó áramot mér; a feszültségmentességről nem mond semmit.'],
      ['Szigetelési ellenállásmérő', 0, 'Szigetelést csak feszültségmentes körön szabad mérni – nem feszültségvizsgáló.']] },
    { job: 'PVC kábelcsatorna vágása', opts: [
      ['Finomfogú fémfűrész + gérvágóláda', 1, 'Tiszta, egyenes, pontos 45°/90°-os vágás.'],
      ['Sarokcsiszoló (flex)', 0, 'A PVC-t megolvasztja, pontatlan és balesetveszélyes.'],
      ['Oldalcsípő fogó', 0, 'Összeroppantja a csatornát, csorba, ferde él marad.']] },
    { job: 'NYM-J kábel köpenyének eltávolítása', opts: [
      ['Köpenyeltávolító (köpenyhántoló)', 1, 'Csak a köpenyt vágja körbe és hosszában, az erek szigetelését nem sérti.'],
      ['Oldalcsípő fogó', 0, 'Bevágja az erek szigetelését is – sérült szigetelés = zárlat- és áramütésveszély.'],
      ['Kombinált fogó', 0, 'Tépi a köpenyt, és megsértheti az erek szigetelését.']] },
    { job: 'Érvéghüvely felsajtolása hajlékony érre', opts: [
      ['Érvéghüvely-krimpelő (présfogó)', 1, 'Egyenletesen, a hüvely méretéhez illő profillal sajtol; utána húzópróba.'],
      ['Kombinált fogó', 0, 'Csak laposra nyomja a hüvelyt: nem tart, kicsúszhat a kapocsból.'],
      ['Oldalcsípő fogó', 0, 'Vágószerszám: elvágja vagy bevágja a hüvelyt.']] },
    { job: 'Szigetelési ellenállás mérése', opts: [
      ['Installációs multifunkciós műszer (szigetelésmérés)', 1, 'Szabványos mérőfeszültséget ad (pl. 500 V DC) és MΩ-ban mér.'],
      ['Digitális multiméter (ohm-mérés)', 0, 'Néhány voltos mérőfeszültséggel mér – a szigetelés hibáit így nem mutatja ki, nem szabványos mérés.'],
      ['Kétpólusú feszültségvizsgáló', 0, 'Csak feszültséget jelez, ellenállást nem mér.']] },
    { job: 'Hurokimpedancia (Zs) mérése', opts: [
      ['Installációs multifunkciós műszer (hurokimpedancia)', 1, 'Feszültség alatt, rövid terheléssel méri a hibahurok impedanciáját.'],
      ['Digitális multiméter', 0, 'Nem tud hurokimpedanciát mérni.'],
      ['Lakatfogó', 0, 'Üzemi áramot mér, hurokimpedanciát nem.']] },
    { job: 'Falhorony készítése süllyesztett vezetéknek', opts: [
      ['Falhoronymaró porelszívóval', 1, 'Két párhuzamos tárcsával egyenletes mélységű, egyenes hornyot vág.'],
      ['Akkus fúró-csavarozó', 0, 'Furatot fúr, egyenes hornyot nem tud.'],
      ['Finomfogú fémfűrész', 0, 'Műanyaghoz és fémhez való, falazatra nem.']] },
    { job: 'Süllyesztett szerelvénydoboz helyének kifúrása', opts: [
      ['Fúrókalapács + dobozfúró korona', 1, 'Pontos, kerek, a doboz méretének megfelelő furatot ad.'],
      ['Falhoronymaró', 0, 'Egyenes hornyot vág, kerek dobozhelyet nem.'],
      ['Lépcsős lemezfúró', 0, 'Vékony lemezhez való, falazatba nem.']] },
    { job: 'Áramerősség mérése üzem közben', opts: [
      ['Lakatfogó', 1, 'Egy érre fogva, az áramkör megbontása nélkül mér.'],
      ['Digitális multiméter árammérő állásban', 0, 'Ehhez az áramkört meg kellene bontani, és a műszert sorba kötni.'],
      ['Kétpólusú feszültségvizsgáló', 0, 'Feszültséget jelez, áramot nem mér.']] },
    { job: 'Kismegszakító kapcsainak meghúzása', opts: [
      ['Szigetelt csavarhúzó (VDE 1000 V)', 1, 'Villamos kapcsokhoz mindig szigetelt (VDE) szerszám kell, feszültségmentes állapotban is.'],
      ['Nem szigetelt csavarhúzó', 0, 'Villamos kapcsokhoz csak VDE szigetelt szerszám használható.'],
      ['Kombinált fogó', 0, 'Csavar meghúzására nem való, a fejet tönkreteszi.']] },
    { job: 'H07V-U ér szigetelésének csupaszolása', opts: [
      ['Automata csupaszoló fogó', 1, 'A szigetelést a rézér sérülése nélkül, pontos hosszon húzza le.'],
      ['Kés', 0, 'Bemetszi a rézeret: ott később eltörhet, melegedhet.'],
      ['Oldalcsípő fogó', 0, 'Könnyen bevágja vagy elvágja az eret.']] },
  ]
  W.register({
    id: 'szerszamvalasztas', module: 'm02-munkavedelem', kind: 'task',
    title: 'Melyik szerszám vagy műszer kell?',
    lead: 'Mind az öt munkafolyamathoz válaszd ki a megfelelő szerszámot vagy műszert, majd ellenőrizd. A szerszám- és műszerválasztás a szerelési vizsgarész 20%-a.',
    mount(el, api) {
      const jobs = shuffle(TOOLJOBS).slice(0, 5)
      const rows = jobs.map((j) => {
        const why = h('p', { class: 'bf-why' })
        const opts = shuffle(j.opts)
        const ch = choice(opts.map((o, i) => ({ t: o[0], v: i })))
        const card = h('div', { class: 'bf-card' }, h('b', {}, j.job), ch.el, why)
        el.append(card)
        return { card, why, ch, opts }
      })
      el.append(h('div', { class: 'wrow' }, h('button', { type: 'button', class: 'primary', onclick: () => {
        let ok = 0, miss = 0
        for (const r of rows) {
          const i = r.ch.get()
          if (i == null) { miss++; r.card.className = 'bf-card'; r.why.textContent = 'Még nem választottál.'; continue }
          const o = r.opts[i]
          const good = r.opts.find((x) => x[1])
          r.card.className = 'bf-card ' + (o[1] ? 'ok' : 'no')
          r.why.textContent = o[1] ? '✓ ' + o[2] : `✗ ${o[2]} Helyesen: ${good[0]}.`
          if (o[1]) ok++
        }
        if (miss) return api.note(`Még ${miss} munkafolyamathoz nem választottál.`, 'bad')
        api.done(ok === rows.length, ok === rows.length ? 'Mind az öt jó. A vizsgán ezt a bizottság figyeli: rossz szerszám (pl. fázisceruza, flex) pontlevonás.' : `${ok}/${rows.length} jó – a pirossal jelölteknél olvasd el, miért nem megfelelő.`)
      } }, 'Ellenőrzés')))
    },
  })

  // ===================================================================== 4. Mérési sorrend
  W.register({
    id: 'meres-sorrend', module: 'm04-meresek', kind: 'task',
    title: 'Az első ellenőrzés lépései – sorrendben',
    lead: 'Rakd a szerelői (első) ellenőrzés lépéseit az MSZ HD 60364-6 szerinti sorrendbe a ↑/↓ gombokkal.',
    mount(el, api) {
      orderTask(el, api, [
        { t: 'Szemrevételezés', why: 'Feszültség alá helyezés előtt: vezetékszínek, kötések, PE mindenhol, burkolatok, feliratok. A szembeötlő hibát nem mérni kell.', hint: 'a szemrevételezés mindig az első, még minden mérés előtt.' },
        { t: 'Védővezetők (PE, EPH) folytonossága', why: 'Feszültségmentesen, legalább 0,2 A mérőárammal. Előbb kell a szigetelésmérésnél, mert ott a PE-hez képest mérünk – szakadt PE-vel a szigetelésmérés semmit sem bizonyít.', hint: 'a PE folytonossága közvetlenül a szemrevételezés után jön, a szigetelésmérés előtt (ahhoz a PE a viszonyítási pont).' },
        { t: 'Szigetelési ellenállás', why: 'Feszültségmentesen, 230 V-os körben 500 V DC-vel, határérték ≥ 1 MΩ. Csak ép szigetelés mellett szabad feszültség alá helyezni.', hint: 'a szigetelésmérés feszültségmentes mérés: a folytonosság után, de minden feszültség alatti mérés előtt van.' },
        { t: 'Polaritás', why: 'Ellenőrzöd, hogy az egypólusú kapcsolók és védelmek a fázist bontják, és a dugaljakban jó helyen van az L és az N.', hint: 'a polaritás a feszültségmentes mérések (folytonosság, szigetelés) után, az önműködő lekapcsolás vizsgálata előtt jön.' },
        { t: 'Önműködő lekapcsolás: hurokimpedancia (Zs)', why: 'Feszültség alatt: Zs ≤ U0/Ia, hogy testzárlatkor a kismegszakító időben lekapcsoljon.', hint: 'a hurokimpedancia már feszültség alatti mérés, ezért a szigetelés és a polaritás után jön, az ÁVK vizsgálata előtt.' },
        { t: 'ÁVK vizsgálata (kioldóáram, kioldási idő)', why: 'A kiegészítő védelem: kioldás IΔn-nél ≤ 300 ms, 5·IΔn-nél ≤ 40 ms; a próbagomb (T) is.', hint: 'az ÁVK vizsgálata a hurokimpedancia után, a fázissorrend és a működési próba előtt van.' },
        { t: 'Fázissorrend (háromfázisú körnél)', why: 'Többfázisú körnél a forgásirány miatt (motorok, CEE aljzatok) ellenőrizni kell a fázissorrendet.', hint: 'a fázissorrend a védelmi vizsgálatok (hurokimpedancia, ÁVK) után, a működési próba előtt jön.' },
        { t: 'Működési próba', why: 'A végén minden kapcsolót, nyomógombot, üzemállapotot kipróbálsz – a berendezés csak a biztonsági vizsgálatok után működtethető.', hint: 'a működési próba az utolsó lépés, minden biztonsági mérés után.' },
      ], 'Helyes! Feszültségmentes mérések (folytonosság, szigetelés) előbb, feszültség alattiak (Zs, ÁVK) utána, működési próba a végén.')
    },
  })

  // ===================================================================== 5. Szigetelésmérés
  const ISO_CIRC = [
    { n: 'SELV 12 V-os világítás (biztonsági transzformátorról)', U: 250, lim: 0.5 },
    { n: 'PELV 24 V-os vezérlőáramkör', U: 250, lim: 0.5 },
    { n: '230 V-os világítási kör', U: 500, lim: 1 },
    { n: '230 V-os dugaljkör', U: 500, lim: 1 },
    { n: '3 × 400 V-os motoráramkör', U: 500, lim: 1 },
    { n: '3 × 400 V-os tűzhely áramköre', U: 500, lim: 1 },
    { n: '690 V-os ipari motoráramkör', U: 1000, lim: 1 },
  ]
  W.register({
    id: 'szigeteles-meres', module: 'm04-meresek', kind: 'task',
    title: 'Virtuális szigetelésvizsgáló',
    lead: 'Válaszd ki mindegyik áramkörhöz a mérőfeszültséget – a műszer ekkor kiírja a mért értéket –, majd döntsd el, megfelel-e (MSZ HD 60364-6). Végül jelöld, mit kell elvégezni a mérés előtt.',
    mount(el, api) {
      const list = shuffle(ISO_CIRC).slice(0, 4).map((c) => {
        const good = Math.random() < 0.55
        let R
        if (good) R = pick(c.lim === 0.5 ? ['>299', 85, 12.4, 0.68] : ['>299', 145, 23.5, 1.6])
        else R = pick(c.lim === 0.5 ? [0.21, 0.36, 0.04] : [0.42, 0.78, 0.09])
        return { ...c, R, ok: good }
      })
      const rows = list.map((c) => {
        const meter = h('span', { class: 'wmeter bf-meter' }, '– – – MΩ')
        const uCh = choice([250, 500, 1000].map((u) => ({ t: u + ' V DC', v: u })), (u) => { meter.textContent = `${typeof c.R === 'string' ? c.R : fmt(c.R, 2)} MΩ  @${u} V` })
        const jCh = choice([{ t: 'Megfelel', v: true }, { t: 'Nem felel meg', v: false }])
        const why = h('p', { class: 'bf-why' })
        const card = h('div', { class: 'bf-card' }, h('b', {}, c.n), h('span', { class: 'wsmall' }, 'Mérőfeszültség:'), uCh.el, meter, jCh.el, why)
        el.append(card)
        return { c, uCh, jCh, card, why }
      })
      const PRE = shuffle([
        ['Feszültségmentesítés az öt szabály szerint', true, 'Feszültség alatt szigetelést mérni tilos – a műszer is tönkremehet.'],
        ['A fogyasztók (lámpák, készülékek) leválasztása', true, 'A bekötött fogyasztó L–N között „átvezet”, hamis kis értéket ad, és a fogyasztó is károsodhat.'],
        ['Az érzékeny elektronika (elektronikus kapcsoló, időrelé, túlfeszültség-levezető, elektronikus ÁVK) leválasztása', true, 'Az 500 V DC tönkreteheti őket, a túlfeszültség-levezető pedig hamis hibát mutat.'],
        ['A PE leválasztása a PE-sínről', false, 'A PE marad: az L és N vezetőket éppen a PE-hez képest méred.'],
        ['A kismegszakítók bekapcsolása feszültség alatt, hogy minden szakasz mérve legyen', false, 'Feszültség alatt tilos szigetelést mérni.'],
        ['A műszer mindig 1000 V-ra állítása, mert az a biztosabb', false, 'A mérőfeszültséget a névleges feszültség szabja meg; a túl nagy feszültség károsíthatja a szerelvényeket.'],
      ])
      const preBox = h('div', { class: 'bf-card' }, h('b', {}, 'Mit kell elvégezni a szigetelésmérés előtt? (több jó válasz)'))
      const pre = PRE.map((p) => { const i = h('input', { type: 'checkbox' }); const w = h('p', { class: 'bf-why' }); preBox.append(h('label', { class: 'bf-lab' }, i, p[0]), w); return { p, i, w } })
      el.append(preBox)
      el.append(h('div', { class: 'wrow' }, h('button', { type: 'button', class: 'primary', onclick: () => {
        let ok = 0
        for (const r of rows) {
          const u = r.uCh.get(), j = r.jCh.get(), c = r.c
          const msgs = []
          const lim = c.lim === 0.5 ? '0,5' : '1'
          if (u !== c.U) msgs.push(c.U === 250 ? 'SELV/PELV áramkört 250 V DC-vel mérünk (határ ≥ 0,5 MΩ).' : c.U === 500 ? 'Legfeljebb 500 V névleges feszültségű körnél (a 230 V-os és a 3 × 400 V-os is) 500 V DC a mérőfeszültség, határ ≥ 1 MΩ.' : '500 V feletti névleges feszültségnél 1000 V DC a mérőfeszültség, határ ≥ 1 MΩ.')
          if (j == null) msgs.push('Nem döntöttél.')
          else if (j !== c.ok) msgs.push(`A határérték ≥ ${lim} MΩ, a mért érték ${typeof c.R === 'string' ? c.R : fmt(c.R, 2)} MΩ → ${c.ok ? 'megfelel' : 'nem felel meg'}.`)
          const good = !msgs.length
          if (good) ok++
          r.card.className = 'bf-card ' + (good ? 'ok' : 'no')
          r.why.textContent = good ? `✓ ${c.U} V DC, határ ≥ ${lim} MΩ → ${c.ok ? 'megfelel' : 'nem felel meg'}.` : '✗ ' + msgs.join(' ')
        }
        let preOk = true
        for (const q of pre) {
          const right = q.i.checked === q.p[1]
          if (!right) preOk = false
          q.w.textContent = q.i.checked || q.p[1] ? (right ? '✓ ' : '✗ ') + q.p[2] : ''
          q.w.style.color = right ? 'var(--good)' : 'var(--bad)'
        }
        const all = ok === rows.length && preOk
        api.done(all, all ? 'Hibátlan. Táblázat (MSZ HD 60364-6): SELV/PELV 250 V DC ≥ 0,5 MΩ; ≤ 500 V 500 V DC ≥ 1 MΩ; > 500 V 1000 V DC ≥ 1 MΩ.' : `${ok}/${rows.length} áramkör jó${preOk ? '' : ', és az előfeltételeknél is van hiba'} – nézd meg a piros magyarázatokat.`)
      } }, 'Ellenőrzés')))
    },
  })

  // ===================================================================== 6. Elosztó összeállítása
  const LOADS1 = [
    { n: 'Világítási kör (lakás), 800 W', P: 800, ph: 1, avk: true, sock: false, avkWhy: 'Lakásban a lámpatesteket tápláló végáramkör is 30 mA-es ÁVK mögé kerül (MSZ HD 60364-4-41:2017).' },
    { n: 'Dugaljkör (szoba), 3,0 kW', P: 3000, ph: 1, avk: true, sock: true, avkWhy: 'Dugaszolóaljzat-áramkör (≤ 32 A): 30 mA-es ÁVK kötelező (MSZ HD 60364-4-41).' },
    { n: 'Konyhai dugaljkör, 3,5 kW', P: 3500, ph: 1, avk: true, sock: true, avkWhy: 'Dugaszolóaljzat-áramkör (≤ 32 A): 30 mA-es ÁVK kötelező.' },
    { n: 'Mosógép saját dugalja, 2,2 kW', P: 2200, ph: 1, avk: true, sock: true, avkWhy: 'Ez is dugaszolóaljzat-áramkör: 30 mA-es ÁVK kötelező.' },
    { n: 'Villanybojler 2 kW, fixen bekötve (kamrában)', P: 2000, ph: 1, avk: false, sock: false, avkWhy: 'Fixen bekötött készülék, nem fürdőszobában: ezen az alapon nem kötelező (de megengedett, gyakran az egész lakás ÁVK mögött van).' },
  ]
  const LOADS3 = [
    { n: 'Háromfázisú tűzhely 7,5 kW, fixen bekötve', P: 7500, ph: 3, avk: false, sock: false, avkWhy: 'Fixen bekötött készülék: ezen az alapon nem kötelező (de megengedett).' },
    { n: 'Háromfázisú átfolyós vízmelegítő 12 kW (konyhában, fixen)', P: 12000, ph: 3, avk: false, sock: false, avkWhy: 'Fixen bekötött készülék, nem fürdőszobában: ezen az alapon nem kötelező (de megengedett).' },
  ]
  W.register({
    id: 'eloszto-osszeallitas', module: 'm06-eloszto-csatorna', kind: 'task',
    title: 'Lakáselosztó összeállítása: kismegszakító és keresztmetszet',
    lead: 'Minden áramkörhöz válassz kismegszakítót (B karakterisztika), pólusszámot és rézkeresztmetszetet úgy, hogy Ib ≤ In ≤ Iz teljesüljön (ohmos terhelés, cos φ = 1; tájékoztató Iz: 1,5 → 17,5 A; 2,5 → 24 A; 4 → 32 A; 6 → 41 A). Jelöld azt is, melyik kör elé kötelező a 30 mA-es ÁVK.',
    mount(el, api) {
      const loads = shuffle([...shuffle(LOADS1).slice(0, rint(3, 4)), pick(LOADS3)])
      const rows = loads.map((L) => {
        const Ib = L.ph === 1 ? L.P / 230 : L.P / (SQ3 * 400)
        const inS = select([6, 10, 13, 16, 20, 25].map((x) => ({ t: 'B' + x, v: x })), 'In')
        const poS = select([{ t: '1P', v: 1 }, { t: '3P', v: 3 }], 'pólus')
        const aS = select([1.5, 2.5, 4, 6].map((x) => ({ t: fmt(x, 1) + ' mm²', v: x })), 'mm²')
        const avk = h('input', { type: 'checkbox' })
        const why = h('p', { class: 'bf-why' })
        const card = h('div', { class: 'bf-card' }, h('b', {}, L.n), h('span', { class: 'wsmall' }, L.ph === 1 ? '230 V, egyfázisú' : '3 × 400 V, háromfázisú'),
          h('div', { class: 'wrow' }, inS, poS, aS, h('label', { class: 'bf-lab' }, avk, '30 mA ÁVK kell')), why)
        el.append(card)
        return { L, Ib, inS, poS, aS, avk, card, why }
      })
      el.append(h('div', { class: 'wrow' }, h('button', { type: 'button', class: 'primary', onclick: () => {
        let ok = 0
        for (const r of rows) {
          const In = +r.inS.value, po = +r.poS.value, A = +r.aS.value, L = r.L
          const ib = fmt(r.Ib, 2)
          const calc = L.ph === 1 ? `Ib = P/U = ${L.P}/230 = ${ib} A` : `Ib = P/(√3·U) = ${L.P}/(1,732·400) = ${ib} A`
          const m = []
          if (!In || !po || !A) m.push('Válassz kismegszakítót, pólusszámot és keresztmetszetet.')
          else {
            if (po !== L.ph) m.push(L.ph === 3 ? 'Háromfázisú fogyasztóhoz 3P kismegszakító kell: mindhárom fázist egyszerre kapcsolja le.' : 'Egyfázisú körre 1P kismegszakító kell.')
            if (In < r.Ib) m.push(`${calc} > In = ${In} A: a kismegszakító üzem közben is lekapcsolna.`)
            if (In > IZ[A]) m.push(`In = ${In} A > Iz = ${fmt(IZ[A], 1)} A (${fmt(A, 1)} mm²): a vezeték túlmelegedhet, mielőtt a kismegszakító kiold – kisebb In vagy nagyobb keresztmetszet kell.`)
            if (L.sock && In > 16) m.push('A 2P+F dugalj névleges árama 16 A – ennél nagyobb kismegszakító a dugaljat nem védi túlterhelés ellen.')
          }
          if (L.avk && !r.avk.checked) m.push('ÁVK: ' + L.avkWhy)
          const good = !m.length
          if (good) ok++
          r.card.className = 'bf-card ' + (good ? 'ok' : 'no')
          r.why.textContent = good ? `✓ ${calc} ≤ In = ${In} A ≤ Iz = ${fmt(IZ[A], 1)} A. ${L.avk || r.avk.checked ? 'ÁVK: ' + L.avkWhy : ''}${L.sock && A < 2.5 ? ' Megjegyzés: dugaljkörhöz a gyakorlatban 2,5 mm² a szokásos (B16 – 2,5 mm²).' : ''}` : '✗ ' + m.join(' ')
        }
        api.done(ok === rows.length, ok === rows.length ? 'Kész az elosztó. Lakásban a szokásos párosítás: világítás 1,5 mm² – B10, dugaljkör 2,5 mm² – B16. (Az Iz tájékoztató érték; valós tervezésnél a szerelési mód és a csökkentő tényezők is számítanak.)' : `${ok}/${rows.length} áramkör jó – a piros magyarázatok megmutatják, melyik feltétel sérül.`)
      } }, 'Ellenőrzés')))
    },
  })

  // ===================================================================== 7. Csatornavágás
  /** a darabok legkevesebb 2 m-es szálba osztása (kevés darab: teljes keresés) */
  function minRods(pieces, L = 2) {
    const p = [...pieces].sort((a, b) => b - a)
    let best = p.length
    const bins = []
    ;(function go(i) {
      if (bins.length >= best) return
      if (i === p.length) { best = bins.length; return }
      for (let k = 0; k < bins.length; k++) if (bins[k] + p[i] <= L + 1e-9) { bins[k] += p[i]; go(i + 1); bins[k] -= p[i] }
      bins.push(p[i]); go(i + 1); bins.pop()
    })(0)
    return best
  }
  W.register({
    id: 'csatorna-vagas', module: 'm06-eloszto-csatorna', kind: 'task',
    title: 'Kábelcsatorna: hossz, szálak, sarkok',
    lead: 'A rajz a szerelőfal nézete, a méretek a csatorna külső élén értendők. Számold ki a szükséges csatornahosszt, hogy hány 2 m-es szál kell, és mennyi a hulladék; utána válaszolj a vágásra vonatkozó kérdésekre.',
    mount(el, api) {
      const shape = pick([['U', 'R', 'D'], ['R', 'U', 'R'], ['U', 'R', 'D', 'R'], ['U', 'R', 'R']])
      // két egymást követő R: a második szakasz egy T-elágazás nélküli egyenes folytatás – helyette egyesítjük
      const dirs = shape.filter((d, i) => !(d === 'R' && shape[i - 1] === 'R'))
      const segs = dirs.map((d) => ({ d, len: d === 'R' ? rstep(0.6, 2.9, 0.05) : rstep(0.4, 1.2, 0.05) }))
      const total = segs.reduce((a, x) => a + x.len, 0)
      const pieces = []
      for (const g of segs) { let l = g.len; while (l > 2 + 1e-9) { pieces.push(2); l = Math.round((l - 2) * 1000) / 1000 } pieces.push(l) }
      const rods = minRods(pieces)
      const waste = Math.round((rods * 2 - total) * 1000) / 1000
      const corners = segs.length - 1
      // rajz
      let x = 0, y = 0
      const pts = [[0, 0]]
      for (const g of segs) { if (g.d === 'R') x += g.len; if (g.d === 'U') y += g.len; if (g.d === 'D') y -= g.len; pts.push([x, y]) }
      const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1])
      const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys)
      const sc = Math.min(460 / Math.max(0.5, maxX - minX), 170 / Math.max(0.3, maxY - minY))
      const offX = 90 + (460 - (maxX - minX) * sc) / 2
      const P = (p) => [offX + (p[0] - minX) * sc, 125 - (p[1] - (maxY + minY) / 2) * sc]
      const svg = s.root(640, 260)
      svg.append(s('rect', { x: 2, y: 2, width: 636, height: 256, fill: 'none', stroke: 'var(--line)' }))
      const sp = pts.map(P)
      svg.append(s('polyline', { points: sp.map((p) => p.join(',')).join(' '), fill: 'none', stroke: 'var(--muted)', 'stroke-width': 12, 'stroke-linejoin': 'miter', opacity: 0.5 }))
      svg.append(s('polyline', { points: sp.map((p) => p.join(',')).join(' '), fill: 'none', stroke: 'var(--fg)', 'stroke-width': 1.5 }))
      // elosztó az elején, dugalj a végén
      svg.append(s('rect', { x: sp[0][0] - 30, y: sp[0][1], width: 60, height: 30, fill: 'var(--card)', stroke: 'var(--fg)' }), s('text', { x: sp[0][0], y: sp[0][1] + 20, 'text-anchor': 'middle', class: 'bf-t' }, 'elosztó'))
      const e = sp[sp.length - 1]
      svg.append(s('circle', { cx: e[0], cy: e[1], r: 9, fill: 'var(--card)', stroke: 'var(--fg)', 'stroke-width': 2 }), s('text', { x: e[0], y: e[1] + 24, 'text-anchor': 'middle', class: 'bf-t' }, 'dugalj'))
      segs.forEach((g, i) => {
        const a = sp[i], b = sp[i + 1], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2
        const horiz = g.d === 'R'
        svg.append(s('text', { x: horiz ? mx : mx + 12, y: horiz ? my - 12 : my + 4, 'text-anchor': horiz ? 'middle' : 'start', class: 'bf-b' }, fmt(g.len, 2) + ' m'))
      })
      for (let i = 1; i < sp.length - 1; i++) {
        svg.append(s('circle', { cx: sp[i][0], cy: sp[i][1], r: 11, fill: 'var(--acc)' }), s('text', { x: sp[i][0], y: sp[i][1] + 4, 'text-anchor': 'middle', fill: '#fff', class: 'bf-t bf-b', style: 'fill:#fff' }, String.fromCharCode(64 + i)))
      }
      el.append(svg, h('p', { class: 'wsmall', style: { margin: 0 } }, `${corners} sarok (${Array.from({ length: corners }, (_, i) => String.fromCharCode(65 + i)).join(', ')}) a fal síkjában. A 2 m-nél hosszabb egyenes szakaszt tompán (90°) toldjuk. A fűrészvágás szélességét elhanyagoljuk.`))
      const iT = h('input', { class: 'bf-in', inputmode: 'decimal', placeholder: 'm' })
      const iN = h('input', { class: 'bf-in', inputmode: 'numeric', placeholder: 'db' })
      const iW = h('input', { class: 'bf-in', inputmode: 'decimal', placeholder: 'm' })
      el.append(h('div', { class: 'wrow' }, h('label', { class: 'bf-lab' }, 'Csatorna összesen:', iT, 'm'), h('label', { class: 'bf-lab' }, '2 m-es szál:', iN, 'db'), h('label', { class: 'bf-lab' }, 'Hulladék:', iW, 'm')))
      const qs = [
        { q: 'Hogyan illeszted a jelölt sarkokat?', o: [['Mindkét darab végén 45°-os gérvágás', 1, 'A két 45°-os gér pontosan, rés nélkül zár, a fedél is.'], ['Egyenes 90°-os vágás, a darabokat egymásra tolva', 0, 'Rés vagy átfedés marad, a fedél nem zár – esztétikai és pontossági pontvesztés.'], ['Belső sarokidom', 0, 'A belső/külső sarokidom két fal találkozásánál (falsarokban) kell, nem a fal síkjában fekvő sarokhoz.']] },
        { q: 'Mivel vágod a PVC csatornát?', o: [['Finomfogú fémfűrész + gérvágóláda', 1, 'A gérvágóláda vezeti a fűrészt: pontos 45°/90°.'], ['Sarokcsiszoló', 0, 'Megolvasztja a PVC-t, pontatlan, balesetveszélyes.'], ['Oldalcsípő', 0, 'Összeroppantja a csatornát.']] },
        { q: 'Mit csinálsz a vágás után?', o: [['Sorjázás reszelővel / sorjázóval', 1, 'A sorja megsértheti a vezeték szigetelését, és csúnya rést hagy.'], ['Semmit, a fedél úgyis eltakarja', 0, 'A sorja a csatornában marad, sérti a szigetelést.'], ['Öngyújtóval leégetem a szálakat', 0, 'A PVC megolvad, eldeformálódik, mérgező füst keletkezik.']] },
      ].map((q) => {
        const opts = shuffle(q.o)
        const ch = choice(opts.map((o, i) => ({ t: o[0], v: i })))
        const why = h('p', { class: 'bf-why' })
        const card = h('div', { class: 'bf-card' }, h('b', {}, q.q), ch.el, why)
        el.append(card)
        return { opts, ch, why, card }
      })
      el.append(h('div', { class: 'wrow' }, h('button', { type: 'button', class: 'primary', onclick: () => {
        const m = []
        const t = num(iT.value), n = parseInt(iN.value, 10), w = num(iW.value)
        if (!(Math.abs(t - total) <= 0.005)) m.push(`A csatorna összesen ${segs.map((g) => fmt(g.len, 2)).join(' + ')} = ${fmt(total, 2)} m.`)
        if (n !== rods) m.push(`A darabok: ${pieces.map((p) => fmt(p, 2)).join('; ')} m – ezek legkevesebb ${rods} db 2 m-es szálból vághatók ki (egy darab nem lehet több szálból, ezért nem elég az összhossz / 2 felfelé kerekítése${Math.ceil(total / 2 - 1e-9) === rods ? ' – itt véletlenül egyezik' : ''}).`)
        if (!(Math.abs(w - waste) <= 0.005)) m.push(`Hulladék = ${rods} · 2 m − ${fmt(total, 2)} m = ${fmt(waste, 2)} m.`)
        let qok = 0
        for (const q of qs) {
          const i = q.ch.get()
          if (i == null) { q.why.textContent = 'Válassz!'; q.card.className = 'bf-card no'; continue }
          const o = q.opts[i]
          q.card.className = 'bf-card ' + (o[1] ? 'ok' : 'no')
          q.why.textContent = (o[1] ? '✓ ' : '✗ ') + o[2]
          if (o[1]) qok++
        }
        const all = !m.length && qok === qs.length
        api.done(all, all ? `Helyes: ${fmt(total, 2)} m csatorna, ${rods} szál, ${fmt(waste, 2)} m hulladék. Mérésnél gérvágott darabon a hosszabb (külső) élen mérj, ±2 mm-en belül.` : m.join(' ') + (qok < qs.length ? ` A kérdésekből ${qok}/${qs.length} jó.` : ''))
      } }, 'Ellenőrzés')))
    },
  })

  // ===================================================================== 8. Ohm-háromszög
  const DEVICES = [
    { n: 'izzólámpa', U: 230, P: [40, 60, 75, 100] },
    { n: 'villanybojler fűtőbetétje', U: 230, P: [1200, 1500, 1800, 2000] },
    { n: 'vízforraló', U: 230, P: [1800, 2000, 2200] },
    { n: 'fűtőszál', U: 230, R: [23, 46, 53, 92] },
    { n: 'forrasztópáka', U: 230, P: [25, 40, 60] },
    { n: 'autó fényszóró izzója', U: 12, P: [55, 60] },
    { n: '12 V-os halogén izzó', U: 12, P: [20, 35, 50] },
  ]
  const UNIT = { U: 'V', I: 'A', R: 'Ω', P: 'W' }
  const QN = { U: 'feszültség', I: 'áram', R: 'ellenállás', P: 'teljesítmény' }
  const sig = (x) => Number(x.toPrecision(3))
  /** a keresett mennyiség két ismertből: [érték, képlet, behelyettesítés] */
  function solve(k, g) {
    const f = (x) => fmt(x, 3)
    const has = (a, b) => g[a] !== undefined && g[b] !== undefined
    if (k === 'U') { if (has('I', 'R')) return [g.I * g.R, 'U = I · R', `${f(g.I)} · ${f(g.R)}`]; if (has('P', 'I')) return [g.P / g.I, 'U = P / I', `${f(g.P)} / ${f(g.I)}`]; return [Math.sqrt(g.P * g.R), 'U = √(P · R)', `√(${f(g.P)} · ${f(g.R)})`] }
    if (k === 'I') { if (has('U', 'R')) return [g.U / g.R, 'I = U / R', `${f(g.U)} / ${f(g.R)}`]; if (has('P', 'U')) return [g.P / g.U, 'I = P / U', `${f(g.P)} / ${f(g.U)}`]; return [Math.sqrt(g.P / g.R), 'I = √(P / R)', `√(${f(g.P)} / ${f(g.R)})`] }
    if (k === 'R') { if (has('U', 'I')) return [g.U / g.I, 'R = U / I', `${f(g.U)} / ${f(g.I)}`]; if (has('U', 'P')) return [(g.U * g.U) / g.P, 'R = U² / P', `${f(g.U)}² / ${f(g.P)}`]; return [g.P / (g.I * g.I), 'R = P / I²', `${f(g.P)} / ${f(g.I)}²`] }
    if (has('U', 'I')) return [g.U * g.I, 'P = U · I', `${f(g.U)} · ${f(g.I)}`]
    if (has('U', 'R')) return [(g.U * g.U) / g.R, 'P = U² / R', `${f(g.U)}² / ${f(g.R)}`]
    return [g.I * g.I * g.R, 'P = I² · R', `${f(g.I)}² · ${f(g.R)}`]
  }
  W.register({
    id: 'ohm-haromszog', module: 'm11-alapszamitasok', kind: 'task',
    title: 'Ohm-törvény és teljesítmény – végtelen gyakorló',
    lead: 'Két mennyiség adott, számold ki a harmadikat (±2% tűrés, tizedesvessző is jó). Ohmos fogyasztók, cos φ = 1. A háromszögekben kattints egy betűre: megmutatja a képletet (amit letakarsz, azt keresed).',
    mount(el, api) {
      // szemléltető háromszögek
      const svg = s.root(420, 150)
      const formula = h('p', { class: 'bf-pre' }, 'Kattints egy betűre a háromszögben.')
      const tri = (cx, top, l, r, fs) => {
        svg.append(s('path', { d: `M${cx} 10 L${cx + 95} 140 L${cx - 95} 140 Z`, fill: 'none', stroke: 'var(--fg)', 'stroke-width': 2 }))
        svg.append(s('line', { x1: cx - 58, x2: cx + 58, y1: 88, y2: 88, stroke: 'var(--fg)', 'stroke-width': 2 }), s('line', { x1: cx, x2: cx, y1: 88, y2: 140, stroke: 'var(--fg)', 'stroke-width': 2 }))
        ;[[top, cx, 70], [l, cx - 40, 125], [r, cx + 40, 125]].forEach(([k, x, y]) => {
          const g = s('g', { class: 'hot', role: 'button', tabindex: 0, onclick: () => { formula.textContent = fs[k]; api.note('') } },
            s('circle', { cx: x, cy: y - 9, r: 22, fill: 'var(--card)', stroke: 'var(--acc)', 'stroke-width': 2 }),
            s('text', { x, y: y - 3, 'text-anchor': 'middle', style: 'font-size:20px;font-weight:700' }, k))
          svg.append(g)
        })
      }
      tri(105, 'U', 'I', 'R', { U: 'U = I · R  (U letakarva: I és R egymás mellett → szorzás)', I: 'I = U / R  (I letakarva: U fent, R lent → osztás)', R: 'R = U / I  (R letakarva: U fent, I lent → osztás)' })
      tri(315, 'P', 'U', 'I', { P: 'P = U · I  (és ohmos fogyasztónál P = I² · R = U² / R)', U: 'U = P / I', I: 'I = P / U' })
      svg.append(s('text', { x: 2, y: 14, class: 'bf-t' }, 'Ohm-törvény'), s('text', { x: 418, y: 14, 'text-anchor': 'end', class: 'bf-t' }, 'Teljesítmény'))
      el.append(svg, formula)

      const box = h('div', { class: 'bf-card' })
      el.append(box)
      let streak = 0
      function next() {
        const d = pick(DEVICES)
        const U = d.U
        let P, R
        if (d.P) { P = pick(d.P); R = (U * U) / P } else { R = pick(d.R); P = (U * U) / R }
        const all = { U, I: P / U, R, P }
        const keys = shuffle(['U', 'I', 'R', 'P'])
        const given = keys.slice(0, 2), ask = keys[2]
        const g = {}
        for (const k of given) g[k] = sig(all[k])
        const [ans, form, subst] = solve(ask, g)
        const inp = h('input', { class: 'bf-in', inputmode: 'decimal', 'aria-label': QN[ask] })
        const sol = h('p', { class: 'bf-pre', style: { display: 'none' } })
        const chk = () => {
          const v = num(inp.value)
          if (!Number.isFinite(v)) return api.note('Írj be egy számot.', 'bad')
          if (near(v, ans, 0.02)) {
            streak++
            api.done(true, `Helyes: ${form} = ${subst} = ${fmt(ans, 3)} ${UNIT[ask]}. Sorozat: ${streak} jó egymás után.`)
            sol.style.display = 'none'
          } else {
            streak = 0
            let hint = ''
            if (near(v, ans * 1000, 0.02) || near(v, ans / 1000, 0.02)) hint = 'Ezres váltás hiba (W ↔ kW, A ↔ mA)? '
            api.done(false, `${hint}Nem jó (${fmt(v, 3)} ${UNIT[ask]}). Nézd meg a lépéseket:`)
            sol.textContent = `1. Ismert: ${given.map((k) => `${k} = ${fmt(g[k], 3)} ${UNIT[k]}`).join(', ')}.\n2. Keresett: ${ask} (${QN[ask]}) → képlet: ${form}.\n3. Behelyettesítve: ${ask} = ${subst} = ${fmt(ans, 3)} ${UNIT[ask]}.`
            sol.style.display = ''
          }
        }
        box.replaceChildren(
          h('p', { style: { margin: 0 } }, `Egy ${d.n}: `, h('b', {}, given.map((k) => `${k} = ${fmt(g[k], 3)} ${UNIT[k]}`).join(', ')), `. Mekkora ${ask === 'I' || ask === 'R' ? 'az' : 'a'} ${QN[ask]} (${ask})?`),
          h('div', { class: 'wrow' }, h('label', { class: 'bf-lab' }, ask + ' =', inp, UNIT[ask]), h('button', { type: 'button', class: 'primary', onclick: chk }, 'Ellenőrzés'), h('button', { type: 'button', onclick: () => { api.note(''); next() } }, 'Következő feladat →')),
          sol)
        inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') chk() })
      }
      next()
    },
  })

  // ===================================================================== 9. Feszültségesés
  W.register({
    id: 'feszultsegeses', module: 'm11-alapszamitasok', kind: 'demo',
    title: 'Feszültségesés és vezetékveszteség',
    lead: 'Mozgasd a csúszkákat: hogyan függ a feszültségesés a hossztól, az áramtól és a keresztmetszettől? A sáv a tájékoztató határt mutatja (világítás kb. 3%, egyéb fogyasztó kb. 5%).',
    mount(el) {
      const AS = [1.5, 2.5, 4, 6, 10, 16]
      const v = { l: 25, I: 16, ai: 1, ph: 1, cos: 1, vil: false }
      const grid = h('div', { class: 'bf-sl' })
      const sl = (k, lab, min, max, step, f) => {
        const out = h('b', {}, f(v[k]))
        grid.append(h('span', {}, lab), out, h('input', { type: 'range', min, max, step, value: v[k], 'aria-label': lab, oninput: (e) => { v[k] = +e.target.value; out.textContent = f(v[k]); upd() } }))
      }
      sl('l', 'Vezetékhossz (egy irányban)', 5, 100, 1, (x) => x + ' m')
      sl('I', 'Áram', 1, 32, 1, (x) => x + ' A')
      sl('ai', 'Keresztmetszet (Cu)', 0, 5, 1, (x) => fmt(AS[x], 1) + ' mm²')
      sl('cos', 'cos φ', 0.7, 1, 0.01, (x) => fmt(x, 2))
      const phCh = choice([{ t: 'Egyfázisú (230 V)', v: 1 }, { t: 'Háromfázisú (400 V)', v: 3 }], (x) => { v.ph = x; upd() }, '', 1)
      const usCh = choice([{ t: 'Egyéb fogyasztó (5%)', v: false }, { t: 'Világítás (3%)', v: true }], (x) => { v.vil = x; upd() }, '', false)
      const svg = s.root(420, 92)
      const X0 = 14, WD = 392, MAX = 10
      const tx = (p) => X0 + (WD * Math.min(p, MAX)) / MAX
      svg.append(s('rect', { x: X0, y: 20, width: WD, height: 26, rx: 4, fill: 'var(--bg)', stroke: 'var(--line)' }))
      const bar = s('rect', { x: X0, y: 20, width: 0, height: 26, rx: 4 })
      const lim = s('line', { y1: 12, y2: 54, stroke: 'var(--bad)', 'stroke-width': 3 })
      const limT = s('text', { y: 10, 'text-anchor': 'middle', class: 'bf-t bf-b', fill: 'var(--bad)' })
      const val = s('text', { y: 38, class: 'bf-b' })
      svg.append(bar, lim, limT, val)
      for (let p = 0; p <= MAX; p += 1) svg.append(s('line', { x1: tx(p), x2: tx(p), y1: 46, y2: 52, stroke: 'var(--fg)' }), p % 2 ? null : s('text', { x: tx(p), y: 66, 'text-anchor': 'middle', class: 'bf-t' }, p + '%'))
      const loss = s('text', { x: X0, y: 86, class: 'bf-t' })
      svg.append(loss)
      const out = h('p', { class: 'bf-pre' })
      const info = h('p', { class: 'wsmall', style: { margin: 0 } })
      el.append(grid, phCh.el, usCh.el, svg, out, info)
      function upd() {
        const A = AS[v.ai], one = v.ph === 1
        const U = one ? 230 : 400
        const dU = ((one ? 2 : SQ3) * v.I * v.l * RHO * v.cos) / A
        const pct = (100 * dU) / U
        const R1 = (RHO * v.l) / A
        const Pv = (one ? 2 : 3) * v.I * v.I * R1
        const limit = v.vil ? 3 : 5
        const ok = pct <= limit
        bar.setAttribute('width', tx(pct) - X0)
        bar.setAttribute('fill', ok ? 'var(--good)' : 'var(--bad)')
        lim.setAttribute('x1', tx(limit)); lim.setAttribute('x2', tx(limit))
        limT.setAttribute('x', tx(limit)); limT.textContent = `határ ${limit}%`
        val.setAttribute('x', Math.min(tx(pct) + 6, 330)); val.textContent = `${fmt(pct, 2)}%${pct > MAX ? ' (skálán kívül)' : ''}`
        loss.textContent = `Vezetékveszteség (hő): ${fmt(Pv, 1)} W`
        const f = (x, d = 2) => fmt(x, d)
        out.textContent = (one
          ? `ΔU = 2 · I · l · ρ · cos φ / A = 2 · ${v.I} · ${v.l} · 0,0178 · ${f(v.cos)} / ${f(A, 1)} = ${f(dU)} V`
          : `ΔU = √3 · I · l · ρ · cos φ / A = 1,732 · ${v.I} · ${v.l} · 0,0178 · ${f(v.cos)} / ${f(A, 1)} = ${f(dU)} V`) +
          `\nΔU% = ${f(dU)} / ${U} · 100 = ${f(pct)} %` +
          `\nEgy ér ellenállása: R = ρ · l / A = 0,0178 · ${v.l} / ${f(A, 1)} = ${f(R1, 4)} Ω` +
          `\nVeszteség: P = ${one ? 2 : 3} · I² · R = ${one ? 2 : 3} · ${v.I}² · ${f(R1, 4)} = ${f(Pv, 1)} W (${one ? 'két' : 'három'} terhelt ér)`
        info.textContent = (ok ? `Belefér a ${limit}%-ba. ` : `Túllépi a ${limit}%-ot: nagyobb keresztmetszet vagy rövidebb nyomvonal kell. `) +
          (one ? 'Egyfázisban 2-vel szorzunk, mert az áram az L-en oda és az N-en vissza is folyik. ' : 'Háromfázisban (szimmetrikus terhelés) √3-mal szorzunk és 400 V-hoz viszonyítunk. ') +
          'A vezeték reaktanciáját elhanyagoljuk; ohmos terhelésnél cos φ = 1. A határ tájékoztató – a feladat vagy a terv értéke az irányadó.'
      }
      upd()
    },
  })

  // ===================================================================== 10. Kismegszakító-választás
  W.register({
    id: 'kismegszakito-valasztas', module: 'm12-vezetekmeretezes-vedelem', kind: 'task',
    title: 'Kismegszakító és keresztmetszet méretezése',
    lead: 'Számold ki az üzemi áramot (Ib), majd válassz névleges áramot (In), jelleggörbét és rézkeresztmetszetet úgy, hogy Ib ≤ In ≤ Iz teljesüljön. Tájékoztató Iz: 1,5 → 17,5; 2,5 → 24; 4 → 32; 6 → 41; 10 → 57; 16 → 76 A.',
    mount(el, api) {
      const kind = pick(['r1', 'r3', 'm3', 'm3'])
      let L
      if (kind === 'r1') { const P = pick([1500, 2000, 2500, 3000, 3500, 4500]); L = { txt: `Ellenállásos fűtőkészülék, P = ${fmt(P / 1000, 1)} kW, 230 V, egyfázisú (cos φ = 1)`, Ib: P / 230, motor: false, calc: `Ib = P / U = ${P} / 230` } }
      else if (kind === 'r3') { const P = pick([6000, 7500, 9000, 12000, 15000]); L = { txt: `Háromfázisú ellenállásos fűtés, P = ${fmt(P / 1000, 1)} kW, 3 × 400 V (cos φ = 1)`, Ib: P / (SQ3 * 400), motor: false, calc: `Ib = P / (√3 · U) = ${P} / (1,732 · 400)` } }
      else {
        const P = pick([1.5, 2.2, 3, 4, 5.5, 7.5]), cos = pick([0.8, 0.82, 0.85]), eta = pick([0.8, 0.84, 0.86, 0.88])
        L = { txt: `Háromfázisú aszinkronmotor, közvetlen indítás: P = ${fmt(P, 1)} kW (leadott), 3 × 400 V, cos φ = ${fmt(cos, 2)}, η = ${fmt(eta, 2)}`, Ib: (P * 1000) / (SQ3 * 400 * cos * eta), motor: true, calc: `Ib = P / (√3 · U · cos φ · η) = ${P * 1000} / (1,732 · 400 · ${fmt(cos, 2)} · ${fmt(eta, 2)})` }
      }
      const iIb = h('input', { class: 'bf-in', inputmode: 'decimal' })
      const inS = select(IN_STD.map((x) => ({ t: x + ' A', v: x })), 'In')
      const chS = select(['B', 'C', 'D'].map((x) => ({ t: x, v: x })), 'jelleg')
      const aS = select([1.5, 2.5, 4, 6, 10, 16].map((x) => ({ t: fmt(x, 1) + ' mm²', v: x })), 'mm²')
      const sol = h('p', { class: 'bf-pre', style: { display: 'none' } })
      el.append(h('div', { class: 'bf-card' }, h('b', {}, L.txt),
        h('div', { class: 'wrow' }, h('label', { class: 'bf-lab' }, 'Ib =', iIb, 'A')),
        h('div', { class: 'wrow' }, inS, chS, aS)), sol)
      el.append(h('div', { class: 'wrow' }, h('button', { type: 'button', class: 'primary', onclick: () => {
        const ib = num(iIb.value), In = +inS.value, ch = chS.value, A = +aS.value
        const m = []
        const ibs = `${L.calc} = ${fmt(L.Ib, 2)} A`
        if (!near(ib, L.Ib, 0.02)) m.push(`Az üzemi áram: ${ibs}.${L.motor ? ' Motornál az adattáblán a leadott teljesítmény áll: a hatásfokkal (η) is osztani kell.' : ''}`)
        if (!In || !ch || !A) m.push('Válassz névleges áramot, jelleggörbét és keresztmetszetet.')
        else {
          if (In < L.Ib) m.push(`In = ${In} A < Ib = ${fmt(L.Ib, 2)} A: a kismegszakító üzem közben lekapcsolna.`)
          if (In > IZ[A]) m.push(`In = ${In} A > Iz = ${fmt(IZ[A], 1)} A (${fmt(A, 1)} mm²): a vezeték túlmelegedhet – nagyobb keresztmetszet kell.`)
          if (L.motor && ch === 'B') m.push('Motor közvetlen indításakor az indítóáram a névleges többszöröse: a B jelleggörbe (3–5 · In) indításkor leoldhat – C kell.')
          if (L.motor && ch === 'D') m.push('D jelleggörbe nagyon nagy bekapcsolási áramú gépekhez (nagy transzformátor, hegesztőgép) kell; ehhez a motorhoz C a szokásos, és D-nél a hurokimpedancia-feltétel (Ia = 20 · In) a legszigorúbb.')
          if (!L.motor && ch !== 'B') m.push('Ellenállásos terhelésnek nincs bekapcsolási áramlökése: B a szokásos, és B-nél a hurokimpedancia-feltétel (Zs ≤ 230 / (5 · In)) a legkönnyebben teljesül.')
        }
        const inMin = IN_STD.find((x) => x >= L.Ib)
        const aMin = [1.5, 2.5, 4, 6, 10, 16].find((a) => IZ[a] >= inMin)
        const best = `${L.motor ? 'C' : 'B'}${inMin}, ${fmt(aMin, 1)} mm²`
        if (!m.length) { api.done(true, `Helyes: ${fmt(L.Ib, 2)} A ≤ ${In} A ≤ ${fmt(IZ[A], 1)} A, ${ch} jelleggörbe. ${L.motor ? 'Motornál az indítóáram miatt C.' : 'Ohmos terhelésnél B.'} (A legkisebb megfelelő választás: ${best}.)`); sol.style.display = 'none' }
        else {
          api.done(false, 'Még nem jó – nézd meg a lépéseket alább.')
          sol.textContent = m.map((x) => '• ' + x).join('\n') + `\n\nMegoldás lépései:\n1. ${ibs}\n2. Ib ≤ In: a legkisebb szabványos In ≥ ${fmt(L.Ib, 2)} A → ${inMin} A\n3. In ≤ Iz: a legkisebb keresztmetszet, amelynek Iz ≥ ${inMin} A → ${fmt(aMin, 1)} mm² (Iz = ${fmt(IZ[aMin], 1)} A)\n4. Jelleggörbe: ${L.motor ? 'motor indítóárama miatt C' : 'ohmos terhelés → B'}\n→ ${best}`
          sol.style.display = ''
        }
      } }, 'Ellenőrzés')))
    },
  })

  // ===================================================================== 11. Érszín és kábeljelölés
  const CORES = [
    { c: 'barna', col: '#8b4513', f: 'L1' }, { c: 'fekete', col: '#222', f: 'L2' }, { c: 'szürke', col: '#888', f: 'L3' },
    { c: 'kék', col: '#1f6fd1', f: 'N' }, { c: 'zöld-sárga', col: '#2e9d3a', f: 'PE' },
  ]
  const CORE_WHY = { L1: 'A barna az L1 fázis.', L2: 'A fekete az L2 fázis.', L3: 'A szürke az L3 fázis.', N: 'A kék ér a nulla (N) – fázisnak soha nem használható.', PE: 'A zöld-sárga kizárólag védővezető (PE), más célra soha.' }
  const CABLES = [
    { d: 'NYM-J 3x2,5', parts: [['NYM', 'PVC szigetelésű és köpenyű szerelővezeték (épületen belül)'], ['-J', 'van zöld-sárga ér'], ['3', 'erek száma'], ['2,5', 'keresztmetszet, mm²']] },
    { d: 'H07V-U 1,5', parts: [['H', 'harmonizált jelölés'], ['07', '450/750 V névleges feszültség'], ['V', 'PVC szigetelés'], ['-U', 'tömör (egyhuzalos) vezető'], ['1,5', 'keresztmetszet, mm²']] },
    { d: 'NYY-J 5x4', parts: [['NYY', '0,6/1 kV-os PVC szigetelésű és köpenyű rézkábel (földbe is)'], ['-J', 'van zöld-sárga ér'], ['5', 'erek száma'], ['4', 'keresztmetszet, mm²']] },
    { d: 'H05VV-F 3G1,5', parts: [['H', 'harmonizált jelölés'], ['05', '300/500 V névleges feszültség'], ['VV', 'PVC szigetelés és PVC köpeny'], ['-F', 'hajlékony (finomhuzalos) vezető'], ['3', 'erek száma'], ['G', 'van zöld-sárga ér'], ['1,5', 'keresztmetszet, mm²']] },
    { d: 'CYKY-J 3x1,5', parts: [['C', 'rézvezető'], ['Y', 'PVC érszigetelés'], ['K', 'kábel'], ['Y ', 'PVC köpeny'], ['-J', 'van zöld-sárga ér'], ['3', 'erek száma'], ['1,5', 'keresztmetszet, mm²']] },
  ]
  const CABLE_DECOY = ['alumínium vezető', 'nincs zöld-sárga ér', 'gumi szigetelés', '300/300 V névleges feszültség', 'sodrott vezető', 'IP-védettség']
  W.register({
    id: 'erszin', module: 'm14-kabelek-szereles-kulonleges-helyek', kind: 'task',
    title: 'Érszínek és kábeljelölés',
    lead: '(a) Válassz egy funkciót (L1, L2, L3, N, PE), majd kattints arra az érre, amelyiké – MSZ EN 60445 színek szerint. (b) Fejtsd meg a kábeljelölés részeit a legördülőkből.',
    mount(el, api) {
      const order = shuffle(CORES)
      const asg = order.map(() => null)
      let fn = 'L1'
      const fnCh = choice(['L1', 'L2', 'L3', 'N', 'PE'].map((x) => ({ t: x, v: x })), (x) => { fn = x }, '', 'L1')
      const svg = s.root(400, 300)
      // köpeny
      svg.append(s('rect', { x: 4, y: 100, width: 96, height: 100, rx: 16, fill: '#555', stroke: 'var(--fg)' }), s('text', { x: 50, y: 154, 'text-anchor': 'middle', style: 'fill:#eee' }, 'köpeny'))
      const labels = []
      order.forEach((c, i) => {
        const y0 = 118 + i * 16, y1 = 30 + i * 60
        const d = `M96 ${y0} C 170 ${y0}, 170 ${y1}, 250 ${y1}`
        svg.append(s('path', { d, fill: 'none', stroke: 'var(--muted)', 'stroke-width': 15, 'stroke-linecap': 'round', opacity: 0.6 }))
        svg.append(s('path', { d, fill: 'none', stroke: c.col, 'stroke-width': 12, 'stroke-linecap': 'round' }))
        if (c.f === 'PE') svg.append(s('path', { d, fill: 'none', stroke: '#f2d21b', 'stroke-width': 12, 'stroke-dasharray': '14 14' }))
        // csupaszolt vég
        svg.append(s('line', { x1: 250, x2: 280, y1, y2: y1, stroke: '#c87533', 'stroke-width': 5 }))
        const lab = s('text', { x: 340, y: y1 + 7, 'text-anchor': 'middle', style: 'font-size:20px;font-weight:700' }, '?')
        labels.push(lab)
        const hit = s('g', { class: 'hot', role: 'button', tabindex: 0, 'aria-label': `${i + 1}. ér`, onclick: () => { asg[i] = fn; lab.textContent = fn; lab.style.fill = ''; api.note('') } },
          s('rect', { x: 170, y: y1 - 29, width: 230, height: 58, fill: 'transparent' }),
          s('rect', { x: 296, y: y1 - 22, width: 88, height: 44, rx: 6, fill: 'var(--card)', stroke: 'var(--acc)', 'stroke-width': 2 }), lab)
        svg.append(hit)
      })
      el.append(h('b', {}, '(a) Érszínek'), fnCh.el, svg)
      // (b) kábeljelölés
      const cab = pick(CABLES)
      const meanings = [...new Set(cab.parts.map((p) => p[1]))]
      const opts = shuffle([...meanings, ...shuffle(CABLE_DECOY.filter((x) => !meanings.includes(x))).slice(0, 2)])
      const sels = cab.parts.map((p) => { const sl = select(opts.map((o) => ({ t: o, v: o }))); return { p, sl, row: h('div', { class: 'wrow' }, h('b', { style: { minWidth: '48px', fontFamily: 'ui-monospace,monospace' } }, p[0].trim()), sl) } })
      const why = h('p', { class: 'bf-why' })
      const cabCard = h('div', { class: 'bf-card' }, h('b', {}, '(b) Mit jelent? ', h('span', { style: { fontFamily: 'ui-monospace,monospace', fontSize: '18px' } }, cab.d)), ...sels.map((x) => x.row), why)
      el.append(cabCard)
      el.append(h('div', { class: 'wrow' }, h('button', { type: 'button', class: 'primary', onclick: () => {
        const m = []
        order.forEach((c, i) => {
          const ok = asg[i] === c.f
          labels[i].style.fill = ok ? 'var(--good)' : 'var(--bad)'
          if (!ok) m.push(asg[i] ? `A ${c.c} ér nem ${asg[i]}: ${CORE_WHY[c.f]}` : `A ${c.c} érhez nem rendeltél funkciót.`)
        })
        const bad = sels.filter((x) => x.sl.value !== x.p[1])
        sels.forEach((x) => { x.sl.style.borderColor = x.sl.value === x.p[1] ? 'var(--good)' : 'var(--bad)' })
        cabCard.className = 'bf-card ' + (bad.length ? 'no' : 'ok')
        why.textContent = bad.length ? '✗ ' + bad.map((x) => `„${x.p[0].trim()}” = ${x.p[1]}`).join('; ') + '.' : '✓ ' + cab.parts.map((x) => `${x[0].trim()} = ${x[1]}`).join('; ') + '.'
        const all = !m.length && !bad.length
        api.done(all, all ? 'Hibátlan. Háromfázisú körben: L1 barna, L2 fekete, L3 szürke, N kék, PE zöld-sárga (MSZ EN 60445).' : m.join(' ') + (bad.length ? ` A kábeljelölésben ${bad.length} rész hibás.` : ''))
      } }, 'Ellenőrzés')))
    },
  })

  // ===================================================================== 12. PV string
  W.register({
    id: 'pv-string', module: 'm15-tulfeszultseg-pv-transzformator', kind: 'task',
    title: 'PV string: hány modul köthető sorba?',
    lead: 'Számold ki a modul üresjárási feszültségét a legalacsonyabb hőmérsékleten, és hogy legfeljebb hány modul köthető sorba úgy, hogy a string feszültsége ne lépje túl az inverter megengedett DC feszültségét.',
    mount(el, api) {
      const Voc = rstep(36, 50, 0.1), beta = pick([-0.26, -0.27, -0.28, -0.29, -0.3, -0.32]), T = pick([-10, -15, -20]), Umax = pick([600, 1000])
      const VT = Voc * (1 + (beta / 100) * (T - 25))
      const N = Math.floor(Umax / VT), Nstc = Math.floor(Umax / Voc)
      const iV = h('input', { class: 'bf-in', inputmode: 'decimal' }), iN = h('input', { class: 'bf-in', inputmode: 'numeric' })
      const whyQ = shuffle([
        ['Hidegben nő a cellák (üresjárási) feszültsége – a hőmérsékleti együttható negatív, 25 °C alatt az Uoc nagyobb.', 1],
        ['Hidegben nagyobb a napsugárzás, ezért nő a feszültség.', 0],
        ['Hidegben a vezeték ellenállása csökken, ezért nagyobb a feszültség.', 0],
      ])
      const wCh = choice(whyQ.map((q, i) => ({ t: q[0], v: i })), null, 'bf-col')
      wCh.el.style.flexDirection = 'column'; wCh.el.style.alignItems = 'stretch'
      const sol = h('p', { class: 'bf-pre', style: { display: 'none' } })
      el.append(h('div', { class: 'bf-card' },
        h('div', {}, `Modul: Uoc(STC, 25 °C) = `, h('b', {}, fmt(Voc, 1) + ' V'), ', hőmérsékleti együttható: ', h('b', {}, fmt(beta, 2) + ' %/K'), '. Legalacsonyabb cellahőmérséklet: ', h('b', {}, T + ' °C'), '. Inverter max. DC bemenő feszültsége: ', h('b', {}, Umax + ' V'), '.'),
        h('div', { class: 'wrow' }, h('label', { class: 'bf-lab' }, `Uoc(${T} °C) =`, iV, 'V'), h('label', { class: 'bf-lab' }, 'max. modulszám:', iN, 'db')),
        h('b', {}, 'Miért a leghidegebb hőmérséklettel számolunk?'), wCh.el), sol)
      el.append(h('div', { class: 'wrow' }, h('button', { type: 'button', class: 'primary', onclick: () => {
        const v = num(iV.value), n = parseInt(iN.value, 10), w = wCh.get()
        const m = []
        if (!near(v, VT, 0.005)) m.push(`Uoc(${T} °C) = ${fmt(Voc, 1)} · (1 + (${fmt(beta, 2)}/100) · (${T} − 25)) = ${fmt(Voc, 1)} · ${fmt(1 + (beta / 100) * (T - 25), 4)} = ${fmt(VT, 2)} V.`)
        if (n !== N) m.push(n === Nstc && Nstc !== N ? `${n} db a 25 °C-os (STC) értékkel jön ki – hidegben ${n} · ${fmt(VT, 2)} = ${fmt(n * VT, 1)} V > ${Umax} V, ez tönkreteheti az invertert.` : `N = ${Umax} / ${fmt(VT, 2)} = ${fmt(Umax / VT, 2)} → lefelé kerekítve ${N} db (felfelé kerekítve túllépnéd ${Umax === 1000 ? 'az' : 'a'} ${Umax} V-ot).`)
        if (w == null || !whyQ[w][1]) m.push('A miért kérdés: a napelemcella feszültsége a hőmérséklet csökkenésével nő (negatív hőmérsékleti együttható); a hideg, napos reggel adja a legnagyobb üresjárási feszültséget.')
        if (!m.length) { api.done(true, `Helyes: ${N} modul · ${fmt(VT, 2)} V = ${fmt(N * VT, 1)} V ≤ ${Umax} V. Lefelé kerekítünk, és a DC kapcsolók, csatlakozók feszültségállóságát is erre ellenőrizzük.`); sol.style.display = 'none' }
        else { api.done(false, 'Még nem jó – a lépések alább.'); sol.textContent = m.map((x) => '• ' + x).join('\n'); sol.style.display = '' }
      } }, 'Ellenőrzés')))
    },
  })

  // ===================================================================== 13. Hibakeresés
  const FAULTS = {
    mcb: { n: 'A kismegszakító lekapcsolt (kioldott)', why: 'Már az elosztóban (1) L–N és L–PE 0 V: a kismegszakító kimenetén nincs fázis. (Visszakapcsolás előtt keresd meg, miért oldott ki!)' },
    sw: { n: 'A kapcsoló hibás (BE állásban sem zár)', why: 'A kapcsoló bemenetén (2) 230 V van, a kimenetén (3) BE állásban is 0 V: a kapcsoló nem zár.' },
    lbr: { n: 'Fázisszakadás a kapcsoló és a lámpa között', why: 'A kapcsoló kimenetén (3) 230 V, a lámpánál (4) L–N és L–PE 0 V: a kapcsolt fázis a kapcsoló után szakadt.' },
    nbr: { n: 'Nullaszakadás a lámpa felé', why: 'A lámpánál (4) L–PE 230 V, de L–N ≈ 0 V és N–PE ≈ 230 V: a nulla szakadt; a lámpa N kapcsa az ép izzószálon át fázispotenciálra kerül – érintésre veszélyes!' },
    bulb: { n: 'A fényforrás (izzó) hibás', why: 'A lámpánál (4) L–N 230 V, a lámpa mégsem világít: a fényforrás hibás.' },
  }
  W.register({
    id: 'hibakereses', module: 'm16-dokumentacio-anyagjegyzek-hibakereses', kind: 'task',
    title: 'Hibakeresés egy lámpakörben',
    lead: 'Tünet: a kapcsoló BE állásban van, a lámpa nem világít. Válassz mérési pontot (1–4) a rajzon, majd mérj (L–N, L–PE, N–PE) – feszültség alatt, kétpólusú feszültségvizsgálóval vagy CAT III multiméterrel. Ha megvan, válaszd ki a hibát. Minél kevesebb mérés, annál jobb.',
    mount(el, api) {
      const fk = pick(Object.keys(FAULTS))
      // potenciálok (V): L az elosztóban, a kapcsoló be- és kimenetén, a lámpánál; N a lámpánál; PE = 0
      const Le = fk === 'mcb' ? 0 : 230
      const Lout = fk === 'sw' ? 0 : Le
      const Ll = fk === 'lbr' ? 0 : Lout
      const Nl = fk === 'nbr' ? Ll : 0 // szakadt nulla: az izzószálon át fázispotenciálon
      const pot = { 1: { L: Le, N: 0 }, 2: { L: Le, N: 0 }, 3: { L: Lout, N: 0 }, 4: { L: Ll, N: Nl } }
      const pname = { 1: 'Elosztó (F1 kimenete)', 2: 'Kapcsolódoboz – bejövő fázis', 3: 'Kapcsolódoboz – kapcsolt fázis', 4: 'Lámpa kapcsai' }
      let sel = null, count = 0
      const log = h('ol', { class: 'bf-ol' })
      const meter = h('span', { class: 'wmeter bf-meter' }, '– – – V')
      const where = h('b', {}, 'Válassz mérési pontot (a rajzon vagy a gombokkal).')
      const svg = s.root(640, 230)
      const BR = '#8b4513', BL = '#1f6fd1', GN = '#2e9d3a'
      // vezetékek
      const wire = (d, c, gy) => { svg.append(s('path', { d, fill: 'none', stroke: c, 'stroke-width': 4 })); if (gy) svg.append(s('path', { d, fill: 'none', stroke: '#f2d21b', 'stroke-width': 4, 'stroke-dasharray': '8 8' })) }
      wire('M130 70 H300', BR)             // L az elosztótól a kapcsolóig
      wire('M340 70 H560 V110', BR)        // kapcsolt fázis a lámpáig
      wire('M130 130 H560 V140', BL)       // N
      wire('M130 175 H600 V150', GN, true) // PE
      svg.append(s('text', { x: 200, y: 62, class: 'bf-t' }, 'L'), s('text', { x: 200, y: 124, class: 'bf-t' }, 'N'), s('text', { x: 200, y: 168, class: 'bf-t' }, 'PE'))
      // elosztó
      svg.append(s('rect', { x: 10, y: 30, width: 120, height: 170, rx: 6, fill: 'var(--card)', stroke: 'var(--fg)' }), s('text', { x: 70, y: 50, 'text-anchor': 'middle', class: 'bf-b' }, 'Elosztó'))
      svg.append(s('rect', { x: 70, y: 58, width: 26, height: 26, fill: 'none', stroke: 'var(--fg)' }), s('text', { x: 83, y: 98, 'text-anchor': 'middle', class: 'bf-t' }, 'F1 B10'), s('line', { x1: 96, x2: 130, y1: 70, y2: 70, stroke: BR, 'stroke-width': 4 }))
      // kapcsolódoboz
      svg.append(s('circle', { cx: 320, cy: 100, r: 52, fill: 'none', stroke: 'var(--fg)', 'stroke-dasharray': '5 4' }), s('text', { x: 320, y: 40, 'text-anchor': 'middle', class: 'bf-t' }, 'kapcsolódoboz (S1, BE)'))
      svg.append(s('circle', { cx: 300, cy: 70, r: 4, fill: 'var(--fg)' }), s('line', { x1: 300, y1: 70, x2: 340, y2: 70, stroke: 'var(--fg)', 'stroke-width': 3 }), s('circle', { cx: 340, cy: 70, r: 4, fill: 'var(--fg)' }))
      // lámpa
      svg.append(s('circle', { cx: 580, cy: 125, r: 18, fill: 'var(--card)', stroke: 'var(--fg)', 'stroke-width': 2 }), s('path', { d: 'M567 112 L593 138 M593 112 L567 138', stroke: 'var(--fg)', 'stroke-width': 2 }), s('text', { x: 580, y: 200, 'text-anchor': 'middle', class: 'bf-t' }, 'lámpa E1 (nem világít)'))
      const pts = { 1: [112, 112], 2: [282, 100], 3: [360, 100], 4: [530, 95] }
      const marks = {}
      for (const k of [1, 2, 3, 4]) {
        const [x, y] = pts[k]
        const c = s('circle', { cx: x, cy: y, r: 18, fill: 'var(--acc)', stroke: 'var(--fg)', 'stroke-width': 0 })
        marks[k] = c
        svg.append(s('g', { class: 'hot', role: 'button', tabindex: 0, 'aria-label': pname[k], onclick: () => pickPt(k) }, c, s('text', { x, y: y + 5, 'text-anchor': 'middle', style: 'fill:#fff;font-weight:700;font-size:15px' }, String(k))))
      }
      const pBtns = [1, 2, 3, 4].map((k) => h('button', { type: 'button', onclick: () => pickPt(k) }, `${k}. ${pname[k]}`))
      function pickPt(k) {
        sel = k; where.textContent = `Mérési pont: ${k}. ${pname[k]}`; meter.textContent = '– – – V'
        for (const j in marks) marks[j].setAttribute('stroke-width', +j === k ? 4 : 0)
        pBtns.forEach((b, i) => b.classList.toggle('on', i + 1 === k))
      }
      const meas = (a, b) => {
        if (!sel) return api.note('Előbb válassz mérési pontot (1–4) a rajzon.', 'bad')
        const p = { ...pot[sel], PE: 0 }
        const u = Math.abs(p[a] - p[b])
        const shown = u > 100 ? 229 + Math.round(Math.random() * 3) : 0
        count++
        meter.textContent = `${shown} V  ${a}–${b}`
        log.append(h('li', {}, `${sel}. ${pname[sel]}: ${a}–${b} = ${shown} V`))
        api.note('')
      }
      const fSel = select(shuffle(Object.keys(FAULTS)).map((k) => ({ t: FAULTS[k].n, v: k })), 'Mi a hiba?')
      el.append(svg,
        h('div', { class: 'wrow' }, ...pBtns),
        h('div', { class: 'wrow' }, where),
        h('div', { class: 'wrow' }, ...[['L', 'N'], ['L', 'PE'], ['N', 'PE']].map(([a, b]) => h('button', { type: 'button', onclick: () => meas(a, b) }, `${a}–${b}`)), meter),
        log,
        h('div', { class: 'wrow bf-fit' }, fSel, h('button', { type: 'button', class: 'primary', onclick: () => {
          if (!fSel.value) return api.note('Válaszd ki a hibát.', 'bad')
          if (!count) return api.note('Előbb mérj! Mérés nélkül csak tippelnél.', 'bad')
          if (fSel.value === fk) api.done(true, `Megtaláltad ${count} mérésből. ${FAULTS[fk].why} Jó logika: haladj a forrástól a fogyasztó felé (1 → 2 → 3 → 4), vagy kezdd középen (3) – 2–3 mérés elég.`)
          else api.done(false, `Nem ez a hiba. „${FAULTS[fSel.value].n}” esetén ezt mérnéd: ${FAULTS[fSel.value].why.split(':')[0]}. Hasonlítsd össze a mért értékeiddel, és mérj ott, ahol a fázis még megvan / már eltűnik.`)
        } }, 'Ez a hiba')))
    },
  })

  // ===================================================================== 14. Rajzjel-párosítás
  // a src/ui/Drawings.tsx Sym (installációs jelek) és SchemSym (kismegszakító, ÁVK, mérő) geometriája
  function symG(kind) {
    const st = { stroke: 'currentColor', 'stroke-width': 2.2, fill: 'none', 'stroke-linecap': 'round' }
    const L = (x1, y1, x2, y2) => s('line', { x1, y1, x2, y2, ...st })
    const arm = (dir, ticks = 1) => {
      const g = s('g', {}, L(32 + dir * 4.2, 34 - dir * 4.2, 32 + dir * 20, 34 - dir * 20))
      for (let i = 0; i < ticks; i++) { const t = 1 - i * 0.22, bx = 32 + dir * (4.2 + 15.8 * t), by = 34 - dir * (4.2 + 15.8 * t); g.append(L(bx, by, bx + dir * 5, by + dir * 5)) }
      return g
    }
    const armB = (dir) => { const x2 = 32 + dir * 20, y2 = 34 + dir * 20; return s('g', {}, L(32 + dir * 4.2, 34 + dir * 4.2, x2, y2), L(x2, y2, x2 - dir * 5, y2 + dir * 5)) }
    const dot = () => s('circle', { cx: 32, cy: 34, r: 4, fill: 'currentColor' })
    const contact = () => s('g', {}, L(32, 6, 32, 22), L(32, 42, 32, 58), L(32, 42, 20, 22))
    const g = s('g', {})
    switch (kind) {
      case 'lampa': g.append(s('circle', { cx: 32, cy: 32, r: 14, ...st }), L(22, 22, 42, 42), L(42, 22, 22, 42)); break
      case 'dugalj': g.append(s('path', { d: 'M16 30 A16 16 0 0 0 48 30', ...st }), L(16, 30, 48, 30), L(14, 22, 50, 22), L(32, 22, 32, 10)); break
      case 'nyomogomb': g.append(s('circle', { cx: 32, cy: 32, r: 12, ...st }), s('circle', { cx: 32, cy: 32, r: 4, fill: 'currentColor' })); break
      case 'egypolusu': g.append(dot(), arm(1)); break
      case 'csillar': g.append(dot(), arm(1, 2)); break
      case 'valto': g.append(dot(), arm(1), arm(-1)); break
      case 'kereszt': g.append(dot(), arm(1), arm(-1), armB(1), armB(-1)); break
      case 'kismegszakito': g.append(contact(), L(28, 18, 36, 26), L(36, 18, 28, 26)); break
      case 'avk': g.append(contact(), L(28, 18, 36, 26), L(36, 18, 28, 26), s('ellipse', { cx: 32, cy: 50, rx: 10, ry: 5, ...st })); break
      case 'mero': g.append(s('rect', { x: 10, y: 16, width: 44, height: 32, ...st }), s('text', { x: 32, y: 37, 'text-anchor': 'middle', style: 'font-size:13px', fill: 'currentColor' }, 'kWh')); break
    }
    return g
  }
  const SYMS = {
    egypolusu: ['Egypólusú kapcsoló', 'Kör (pont) egy ferde karral, a kar végén egy vonalka.'],
    valto: ['Váltókapcsoló', 'Két, ellentétes irányú kar egy-egy vonalkával.'],
    kereszt: ['Keresztkapcsoló', 'Négy kar: két váltókapcsoló-jel egymásra rajzolva.'],
    csillar: ['Csillárkapcsoló (sorozatkapcsoló)', 'Egy kar két vonalkával: két áramkört kapcsol.'],
    nyomogomb: ['Nyomógomb', 'Kör, a közepén teli ponttal.'],
    dugalj: ['Dugaszolóaljzat védőérintkezővel', 'Félkör (aljzat), felette a vízszintes vonal a védőérintkező.'],
    lampa: ['Lámpa (fényforrás kimenet)', 'Kör X-szel.'],
    kismegszakito: ['Kismegszakító', 'Kapcsolóérintkező, rajta X (túláramvédelmi kioldás).'],
    avk: ['Áram-védőkapcsoló (ÁVK)', 'Kapcsolóérintkező, alatta ellipszis (az összegáramváltó).'],
    mero: ['Fogyasztásmérő', 'Téglalap „kWh” felirattal.'],
  }
  W.register({
    id: 'rajzjel-par', module: 'm08-interaktiv-vizsga', kind: 'task',
    title: 'Rajzjelek párosítása',
    lead: 'Kattints egy rajzjelre, majd a nevére. Mind a hat jelet párosítsd (MSZ EN 60617 szerinti egyvonalas, alaprajzi jelölések).',
    mount(el, api) {
      const keys = shuffle(Object.keys(SYMS)).slice(0, 6)
      let cur = null, err = 0, done = 0
      const symBtns = {}, nameBtns = {}
      const symRow = h('div', { class: 'wrow' })
      for (const k of keys) {
        const svg = s('svg', { viewBox: '0 0 64 64', role: 'img', 'aria-hidden': 'true' }, symG(k))
        const b = h('button', { type: 'button', class: 'bf-sym', 'aria-label': 'rajzjel', onclick: () => {
          if (b.disabled) return
          cur = k
          for (const x in symBtns) symBtns[x].classList.toggle('bf-sel', x === k)
          api.note('Most kattints a nevére.')
        } }, svg)
        symBtns[k] = b
        symRow.append(b)
      }
      const nameRow = h('div', { class: 'wrow' })
      for (const k of shuffle(keys)) {
        const b = h('button', { type: 'button', onclick: () => {
          if (!cur) return api.note('Előbb kattints egy rajzjelre.', 'bad')
          if (cur === k) {
            done++
            symBtns[k].disabled = true; b.disabled = true
            symBtns[k].classList.remove('bf-sel'); symBtns[k].classList.add('bf-done'); b.classList.add('bf-done')
            symBtns[k].title = SYMS[k][0]
            cur = null
            if (done === keys.length) api.done(true, err ? `Kész, ${err} tévesztéssel. Próbáld újra hiba nélkül (↺ Újra).` : 'Hibátlan! Mind a hat jel a helyén.')
            else api.note(`✓ ${SYMS[k][0]}: ${SYMS[k][1]}`, 'good')
          } else {
            err++
            api.note(`✗ Ez nem „${SYMS[k][0]}”. A kiválasztott jel: ${SYMS[cur][1]} A „${SYMS[k][0]}” jele: ${SYMS[k][1]}`, 'bad')
          }
        } }, SYMS[k][0])
        nameBtns[k] = b
        nameRow.append(b)
      }
      el.append(symRow, nameRow)
    },
  })
})()
