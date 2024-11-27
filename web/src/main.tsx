import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./assets/main.css"
import App from "./App.tsx"
import init from "phaseblade"

await init()
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
