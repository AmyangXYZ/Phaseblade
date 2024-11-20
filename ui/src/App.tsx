import { useEffect, useRef, useState } from "react"
import { Button } from "@mui/material"
import init, { Engine, EngineState } from "phaseblade"

function App() {
  const pbEngineRef = useRef<Engine | null>(null)
  const initializingRef = useRef(false)
  const [engineState, setEngineState] = useState<EngineState>()

  useEffect(() => {
    if (pbEngineRef.current || initializingRef.current) return
    initializingRef.current = true

    init().then(() => {
      const engine = new Engine(100n, 100n)
      pbEngineRef.current = engine
      engine.addTschNode(0, 10n, 0n, 1000n)
      const state = engine.getState()
      setEngineState(state)
    })
  }, [])
  return (
    <>
      <div>Phaseblade Engine </div>
      <Button
        onClick={() => {
          pbEngineRef.current?.step()
          setEngineState(pbEngineRef.current?.getState())
        }}
      >
        Step
      </Button>
      {engineState && <div>Cycle: {engineState.cycle.toString()}</div>}
    </>
  )
}

export default App
