import init, { Engine } from "phaseblade"
import { NodeConfigJS } from "./index.d"

await init()

const engine: Engine = new Engine()

engine.addNode({
  id: Math.floor(Math.random() * 1000),
  unit_type: "c2",
  protocol: "TSCH",
  position: new Float64Array([Math.random() * 40 - 20, 0.5, Math.random() * 40 - 20]),
  cpu_freq_hz: 100000000n,
  tick_interval: 10n,
  cycle_offset: 0n,
  clock_drift_factor: 1,
  tasks: [
    {
      id: 0,
      name: "Sensing",
      priority: 0,
    },
    {
      id: 1,
      name: "TSCH MAC",
      priority: 0,
    },
  ],
} as NodeConfigJS)

postMessage({ type: "state", data: engine.getState() })

onmessage = (e) => {
  if (e.data.method === "add_node") {
    engine.addNode(e.data.params as NodeConfigJS)
  }
  if (e.data.method === "step") {
    engine.step()
  }

  postMessage({ type: "state", data: engine.getState() })
}
