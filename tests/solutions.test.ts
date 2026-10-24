import { expect, test } from 'bun:test'
import { checkSchematic, computeResult } from '../src/sim/score'
import { solutionFor } from '../src/sim/solutions'
import { STAGES, useGame } from '../src/sim/store'
import { TASK_LIST } from '../src/sim/tasks'

for (const task of TASK_LIST) {
  test(`${task.title}: minden szakasz mintamegoldásával 100 pont, nincs kritikus hiba`, () => {
    const g = useGame.getState()
    g.start(task.id, 'vizsga')
    for (const st of STAGES) {
      if (st.id === 'ertekeles') continue
      useGame.getState().setStage(st.id)
      useGame.getState().solve()
    }
    const r = computeResult(useGame.getState())
    const lost = r.parts.filter((p) => p.v !== p.max).map((p) => `${p.name} ${p.v}/${p.max}`)
    expect(lost).toEqual([])
    expect(r.total).toBe(100)
    expect(r.critical).toEqual([])
    expect(useGame.getState().solved.length).toBe(7)
  })

  test(`${task.title}: a rajzfeladat mintamegoldása helyes`, () => {
    expect(checkSchematic(task, solutionFor(task.id).schematic)).toEqual({ ok: true, msg: 'Helyes kapcsolás.' })
  })
}

import { simulate } from '../src/sim/circuit'

test('bemutatás: a megoldás után minden lámpa világít, és beadás után is feszültség alatt marad', () => {
  for (const t of TASK_LIST) {
    useGame.getState().start(t.id, 'gyakorlo')
    for (const st of STAGES) {
      if (st.id === 'ertekeles') continue
      useGame.getState().setStage(st.id)
      useGame.getState().solve()
    }
    useGame.getState().submit()
    const g = useGame.getState()
    expect(g.powered).toBe(true)
    for (const l of t.loads.filter((x) => !x.socket)) expect(simulate(g).lit[l.id]).toBe(true)
  }
})
