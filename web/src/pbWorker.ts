import init, { Engine, NodeConfig, TaskConfig } from "phaseblade";

await init();

const engine: Engine = new Engine();

engine.addNode(
  new NodeConfig(
    Math.floor(Math.random() * 1000),
    "c2",
    new Float64Array([0, 0.5, 0]),
    100000000n,
    10n,
    0n,
    1,
    [new TaskConfig(0, "Sensing", 0), new TaskConfig(1, "TSCH MAC", 0)]
  )
);

postMessage({ type: "state", data: engine.getState() });

onmessage = (e) => {
  if (e.data.method === "add_node") {
    engine.addNode(e.data.params as NodeConfig);
  }
  if (e.data.method === "step") {
    engine.step();
  }

  postMessage({ type: "state", data: engine.getState() });
};
