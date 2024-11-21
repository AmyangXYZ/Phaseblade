import Card from "./components/Card"
import { Upload } from "@mui/icons-material"
import PbEngine from "./PbEngine"
import BjsScene from "./BjsScene"
function App() {
  return (
    <>
      <PbEngine />
      <BjsScene />
      <div style={{ position: "absolute", zIndex: 2 }}>
        <Card
          title="Mission"
          icon={<Upload sx={{ color: "black" }} />}
          subtitle="RETRIEVE VALUABLE DATA"
          body={<div>Retrieve and transmit the vital research data.</div>}
          footer="SELECT MISSION"
          width="420px"
        />

        <Card
          title="Header"
          subtitle="Subtitle"
          body={
            <div>
              Body <br />
              body
            </div>
          }
          width="200px"
          // height="200px"
        />
        <Card body={<div>Body </div>} width="200px" outlineColor="red" />
      </div>
    </>
  )
}

export default App
