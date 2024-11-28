import init, { Engine } from "phaseblade"

await init()

const engine: Engine = new Engine()

onmessage = (e) => {
  if (e.data.method === "add_node") {
    if (e.data.protocol == "TSCH") {
      engine.addTschNode(e.data.id, e.data.cycle_per_tick, e.data.cycle_offset, e.data.micros_per_tick)
    }
  }
  if (e.data.method === "step") {
    engine.step()
  }

  postMessage({ method: "state", state: engine.getState() })
}
