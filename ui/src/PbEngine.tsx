import init, { Engine, EngineState } from "phaseblade"
import { useEffect, useRef, useState } from "react"

function PbEngine() {
  const engineRef = useRef<Engine | null>(null)
  const [engineState, setEngineState] = useState<EngineState>()

  useEffect(() => {
    init().then(() => {
      const engine = new Engine(100n, 100n)
      engineRef.current = engine
      engine.addTschNode(0, 10n, 0n, 1000n)
      engine.step()
      const state = engine.getState()
      setEngineState(state)
    })
  }, [])
  return (
    <>
      <div>Phaseblade Engine </div>
      {engineState && <div>Cycle: {engineState.cycle.toString()}</div>}
    </>
  )
}

export default PbEngine
