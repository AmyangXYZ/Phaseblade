import MainScene from "./MainScene"
import Header from "./Header"
import { useEffect } from "react"
import { useState } from "react"
import { useRef } from "react"
import init, { Engine, EngineState } from "phaseblade"
import StatusBar from "./StatusBar"

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

  useEffect(() => {
    console.log(engineState)
  }, [engineState])

  return (
    <>
      <Header />
      <MainScene />
      <StatusBar />
    </>
  )
}

export default App
