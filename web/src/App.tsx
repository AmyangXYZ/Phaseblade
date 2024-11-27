import MainScene from "./MainScene"
import Header from "./Header"
import { useEffect, useState } from "react"
import { useRef } from "react"
import { EngineState } from "phaseblade"
import StatusBar from "./StatusBar"

function App() {
  const workerRef = useRef<Worker | null>(null)
  const [engineState, setEngineState] = useState<EngineState>()
  const [newNode, setNewNode] = useState<{
    id: number
    type: string
    cycle_per_tick: bigint
    cycle_offset: bigint
    micros_per_tick: bigint
  } | null>(null)

  useEffect(() => {
    workerRef.current = new Worker(new URL("./pbWorker.ts", import.meta.url), {
      type: "module",
    })
    workerRef.current.postMessage({
      method: "engine",
      propagation_delay: 100n,
      transmission_rate: 100n,
    })

    workerRef.current.onmessage = (e) => {
      if (e.data.method === "state") {
        setEngineState(e.data.state)
      }
    }
  }, [])

  const step = () => {
    workerRef.current?.postMessage({
      method: "step",
    })
  }
  const addNode = (id: number, type: string, cycle_per_tick: bigint, cycle_offset: bigint, micros_per_tick: bigint) => {
    workerRef.current?.postMessage({
      method: "add_node",
      id,
      type,
      cycle_per_tick,
      cycle_offset,
      micros_per_tick,
    })
    setNewNode({ id, type, cycle_per_tick, cycle_offset, micros_per_tick })
  }

  return (
    <>
      <Header step={step} addNode={addNode} />
      <MainScene newNode={newNode} />
      <StatusBar cycle={engineState?.cycle || 0n} />
      {engineState && <pre>{JSON.stringify(engineState, null, 2)}</pre>}
    </>
  )
}

export default App
