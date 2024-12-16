import init, { Engine } from "phaseblade"
import { NodeConfigJS } from "./index.d"

await init()

const engine: Engine = new Engine()

onmessage = (e) => {
  if (e.data.method === "add_node") {
    engine.addNode(e.data.params as NodeConfigJS)
  }
  if (e.data.method === "step") {
    engine.step()
  }

  postMessage({ type: "state", data: engine.getState() })
}
