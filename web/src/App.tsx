import MainScene from "./MainScene"
import Header from "./Header"
import StatusBar from "./StatusBar"
import NodeCard from "./NodeCard"

import { useEffect, useState } from "react"
import { useRef } from "react"
import { EngineState } from "phaseblade"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import { CssBaseline } from "@mui/material"

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#0f1116",
      paper: "#0f1116",
    },
  },
})

function App() {
  const workerRef = useRef<Worker | null>(null)
  const [engineState, setEngineState] = useState<EngineState>()
  const [cycle, setCycle] = useState<bigint>(0n)

  const [newNode, setNewNode] = useState<{
    id: number
    unit_type: string
    protocol: string
    cycle_per_tick: bigint
    cycle_offset: bigint
    micros_per_tick: bigint
  } | null>(null)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)

  useEffect(() => {
    workerRef.current = new Worker(new URL("./pbWorker.ts", import.meta.url), {
      type: "module",
    })

    workerRef.current.onmessage = (e) => {
      if (e.data.method === "state") {
        setEngineState(e.data.state)
        setCycle(e.data.state.cycle)
      }
    }
  }, [])

  const step = () => {
    workerRef.current?.postMessage({
      method: "step",
    })
  }

  const addNode = (
    id: number,
    unit_type: string,
    protocol: string,
    cycle_per_tick: bigint,
    cycle_offset: bigint,
    micros_per_tick: bigint
  ) => {
    workerRef.current?.postMessage({
      method: "add_node",
      id,
      unit_type,
      protocol,
      cycle_per_tick,
      cycle_offset,
      micros_per_tick,
    })
    setNewNode({ id, unit_type, protocol, cycle_per_tick, cycle_offset, micros_per_tick })
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Header step={step} addNode={addNode} />
      <MainScene newNode={newNode} selectedNode={selectedNode} setSelectedNode={setSelectedNode} />
      <NodeCard
        selectedNode={selectedNode}
        nodeState={engineState?.nodes.find((node) => node.id === Number(selectedNode?.split("-")[1])) || null}
      />
      <StatusBar cycle={cycle} numNodes={engineState?.nodes.length || 0} />
    </ThemeProvider>
  )
}

export default App
