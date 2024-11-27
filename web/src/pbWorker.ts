import init, { Engine } from "phaseblade"

await init()

let engine: Engine | null = null

onmessage = (e) => {
  if (e.data.method === "engine") {
    engine = new Engine(e.data.propagation_delay, e.data.transmission_rate)
  }
  if (e.data.method === "add_node" && engine) {
    if (e.data.type == "TSCH") {
      engine.addTschNode(e.data.id, e.data.cycle_per_tick, e.data.cycle_offset, e.data.micros_per_tick)
    }
  }
  if (e.data.method === "step" && engine) {
    const state = engine.step()
    postMessage({ method: "state", state })
  }
}
