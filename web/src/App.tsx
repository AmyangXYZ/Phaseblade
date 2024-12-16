import MainScene from "./MainScene"
import Header from "./Header"
import StatusBar from "./StatusBar"
import NodeCard from "./NodeCard"

import { useEffect, useState } from "react"
import { useRef } from "react"
import { EngineState, NodeState } from "phaseblade"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import { CssBaseline } from "@mui/material"
import { NodeConfigJS } from "./index.d"

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

  const [selectedNode, setSelectedNode] = useState<number | null>(null)

  useEffect(() => {
    workerRef.current = new Worker(new URL("./pbWorker.ts", import.meta.url), {
      type: "module",
    })

    workerRef.current.onmessage = (e) => {
      if (e.data.type === "state") {
        setEngineState(e.data.data as EngineState)
        setCycle(e.data.data.cycle)
      }
    }
  }, [])

  const step = () => {
    workerRef.current?.postMessage({
      method: "step",
    })
  }

  const addNode = (node: NodeConfigJS) => {
    workerRef.current?.postMessage({
      method: "add_node",
      params: node,
    })
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Header step={step} addNode={addNode} />
      <MainScene selectedNode={selectedNode} setSelectedNode={setSelectedNode} nodes={engineState?.nodes || []} />
      <NodeCard
        selectedNode={selectedNode}
        nodeState={engineState?.nodes.find((node: NodeState) => node.id === selectedNode) || null}
      />
      <StatusBar cycle={cycle} numNodes={engineState?.nodes.length || 0} />
    </ThemeProvider>
  )
}

export default App
