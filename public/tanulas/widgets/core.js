// Interaktív szemléltetések és mini feladatok – közös keret.
// Egy widget: W.register({ id, title, module, kind: 'demo' | 'task', lead, mount(el, api) })
//   mount: a widget a kapott el-be rajzol (DOM/SVG), és az api-t használja:
//   api.done(ok, msg)  – feladatnál: eredmény kiírása, siker esetén mentés (localStorage)
//   api.note(msg, cls) – szabad visszajelzés ('good' | 'bad' | '')
//   api.reset()        – a widget újrarajzolása
// Az oldal a .wslot[data-w="<id>"] helyekre tölti be őket; a gyakorlat.html mindet listázza.
;(function () {
  const KEY = 'villanyvizsga.widgets.done'
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] } }
  const write = (v) => { try { localStorage.setItem(KEY, JSON.stringify(v)) } catch {} }

  /** h('div', { class: 'x', onclick: fn }, 'szöveg', child) – kis DOM-segéd */
  function h(tag, attrs, ...kids) {
    const n = document.createElement(tag)
    for (const [k, v] of Object.entries(attrs || {})) {
      if (k.startsWith('on')) n.addEventListener(k.slice(2), v)
      else if (k === 'style' && typeof v === 'object') Object.assign(n.style, v)
      else if (v !== false && v != null) n.setAttribute(k, v === true ? '' : v)
    }
    for (const c of kids.flat()) if (c != null && c !== false) n.append(c.nodeType ? c : document.createTextNode(String(c)))
    return n
  }
  /** s('line', { x1, ... }) – SVG elem; s.root(w, h) – méretezhető svg gyökér */
  const NS = 'http://www.w3.org/2000/svg'
  function s(tag, attrs, ...kids) {
    const n = document.createElementNS(NS, tag)
    for (const [k, v] of Object.entries(attrs || {})) {
      if (k.startsWith('on')) n.addEventListener(k.slice(2), v)
      else if (v !== false && v != null) n.setAttribute(k, v)
    }
    for (const c of kids.flat()) if (c != null && c !== false) n.append(c.nodeType ? c : document.createTextNode(String(c)))
    if (attrs?.role === 'button' && attrs.onclick && !attrs.onkeydown) n.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); attrs.onclick(e) }
    })
    return n
  }
  s.root = (w, hh) => s('svg', { viewBox: `0 0 ${w} ${hh}`, class: 'wsvg', role: 'group', 'data-native': w })

  /** Fisher–Yates keverés (új tömb) */
  const shuffle = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]] } return b }
  /** magyar számformátum */
  const fmt = (x, d = 2) => Number(x).toLocaleString('hu-HU', { maximumFractionDigits: d })

  const list = []
  function register(def) { list.push(def) }
  function updateStat() {
    const st = document.getElementById('wstat')
    if (st) st.textContent = `${list.filter((d) => d.kind === 'task' && read().includes(d.id)).length} / ${list.filter((d) => d.kind === 'task').length} mini feladat megoldva`
  }

  function mount(slot, def) {
    const body = h('div', { class: 'wbody' })
    const fb = h('div', { class: 'wfb', 'aria-live': 'polite', 'aria-atomic': 'true' })
    const badge = h('span', { class: 'wbadge ' + def.kind }, def.kind === 'task' ? 'Mini feladat' : 'Szemléltetés')
    const ok = h('span', { class: 'wok' }, '✓ megoldva')
    const card = h('div', { class: 'widget', id: 'w-' + def.id },
      h('div', { class: 'whead' }, badge, h('b', {}, def.title), ok,
        h('button', { type: 'button', class: 'wreset', onclick: () => draw() }, '↺ Újra')),
      def.lead ? h('p', { class: 'wlead' }, def.lead) : null, body, fb)
    let cleanup
    const paintDone = () => card.classList.toggle('solved', read().includes(def.id))
    const clearOld = (e) => {
      api.note('')
      const row = e.target.closest?.('li, .bf-card')
      if (row) {
        row.classList.remove('ok', 'no')
        row.querySelectorAll('select').forEach((sel) => { sel.style.borderColor = '' })
      }
    }
    body.addEventListener('click', clearOld, true)
    body.addEventListener('input', clearOld, true)
    body.addEventListener('change', clearOld, true)
    const api = {
      note(msg, cls = '') { fb.className = 'wfb ' + cls; fb.textContent = msg },
      done(good, msg) {
        api.note(msg || (good ? 'Helyes!' : 'Még nem jó – nézd meg újra.'), good ? 'good' : 'bad')
        if (good && !read().includes(def.id)) write([...read(), def.id])
        paintDone(); updateStat()
      },
      reset: () => draw(),
    }
    function draw() {
      if (cleanup) cleanup()
      body.replaceChildren(); api.note('')
      cleanup = def.mount(body, api)
      body.querySelectorAll('svg.wsvg').forEach((svg) => {
        svg.setAttribute('aria-label', svg.getAttribute('aria-label') || def.title)
        const wrap = h('div', { class: 'wdiagram', tabindex: 0, role: 'region', 'aria-label': `${def.title} – nagyítható műszaki ábra` })
        svg.replaceWith(wrap); wrap.append(svg)
      })
    }
    slot.replaceChildren(card)
    draw(); paintDone()
  }

  function boot() {
    const by = Object.fromEntries(list.map((d) => [d.id, d]))
    document.querySelectorAll('.wslot[data-w]').forEach((el) => { const d = by[el.dataset.w]; if (d) mount(el, d) })
    // gyűjtőoldal: #wall – minden widget modulonként
    const wall = document.getElementById('wall')
    if (wall) {
      const mods = window.W_MODULES || {}
      const keys = [...new Set(list.map((d) => d.module))].sort()
      for (const k of keys) {
        wall.append(h('h2', { id: k }, mods[k] || k))
        for (const d of list.filter((x) => x.module === k)) { const slot = h('div', { class: 'wslot' }); wall.append(slot); mount(slot, d) }
      }
      updateStat()
    }
  }

  window.W = { register, h, s, shuffle, fmt, list, boot }
  document.addEventListener('DOMContentLoaded', boot)
})()
