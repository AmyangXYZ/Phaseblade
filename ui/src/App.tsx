import PbEngine from "./PbEngine"
import BjsScene from "./BjsScene"
import { GitHub } from "@mui/icons-material"
import { IconButton } from "@mui/material"

function App() {
  return (
    <>
      <div className="header">
        <b>PHASEBLADE</b>
        <a href="https://github.com/AmyangXYZ/Phaseblade" target="_blank">
          <IconButton>
            <GitHub sx={{ color: "white" }} />
          </IconButton>
        </a>
      </div>
      <BjsScene />
      <PbEngine />
    </>
  )
}

export default App
