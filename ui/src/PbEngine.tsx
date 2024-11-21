import { useEffect, useRef, useState } from "react"
import init, { Engine, EngineState } from "phaseblade"
import { Button } from "@mui/material"
import { Upload } from "@mui/icons-material"
import Card from "./components/Card"

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
    <div style={{ zIndex: 10, position: "absolute" }}>
      <Button
        onClick={() => {
          pbEngineRef.current?.step()
          setEngineState(pbEngineRef.current?.getState())
        }}
      >
        <span>Step</span>
      </Button>
      {engineState && <div>Cycle: {engineState.cycle.toString()}</div>}
      <Card
        title="Mission"
        icon={<Upload sx={{ color: "black" }} />}
        subtitle="RETRIEVE VALUABLE DATA"
        body={<div>Retrieve and transmit the vital research data.</div>}
        footer="SELECT MISSION"
        width="420px"
      />
    </div>
  )
}

export default PbEngine
