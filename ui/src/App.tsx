import PbEngine from "./PbEngine"
import BjsScene from "./BjsScene"

function App() {
  return (
    <>
      <div style={{ position: "absolute", zIndex: 10, fontSize: "1.4rem" }}>PHASEBLADE</div>
      <BjsScene />
      <PbEngine />
    </>
  )
}

export default App
