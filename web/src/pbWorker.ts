import init, { Engine } from "phaseblade"

await init()

const engine: Engine = new Engine()

onmessage = (e) => {
  if (e.data.method === "add_node") {
    if (e.data.params.protocol == "TSCH") {
      engine.addTschNode(
        e.data.params.id,
        e.data.params.cycle_per_tick,
        e.data.params.cycle_offset,
        e.data.params.micros_per_tick
      )
    }
  }
  if (e.data.method === "step") {
    engine.step()
  }

  postMessage({ type: "state", data: engine.getState() })
}
