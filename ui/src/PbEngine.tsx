import { useEffect, useRef, useState } from "react"
import init, { Engine, EngineState } from "phaseblade"
import { Button } from "@mui/material"

function PbEngine() {
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
    <div style={{ position: "absolute", top: "50px", zIndex: 10 }}>
      <Button
        onClick={() => {
          pbEngineRef.current?.step()
          setEngineState(pbEngineRef.current?.getState())
        }}
      >
        <span>Step</span>
      </Button>
      {engineState && <div>Cycle: {engineState.cycle.toString()}</div>}
    </div>
  )
}

export default PbEngine
