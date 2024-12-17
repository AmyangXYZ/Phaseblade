use wasm_bindgen::prelude::*;

use crate::{
    engine::{Engine, EngineState},
    node::{NodeConfig, NodeState},
    task::TaskConfig,
};

#[wasm_bindgen(js_name = Engine)]
pub struct WasmEngine(Engine);

#[wasm_bindgen(js_class = Engine)]
impl WasmEngine {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Self(Engine::new())
    }

    #[wasm_bindgen(js_name = getState)]
    pub fn state(&self) -> JsValue {
        serde_wasm_bindgen::to_value(&self.0.state()).unwrap()
    }

    #[wasm_bindgen(js_name = addNode)]
    pub fn add_node(&mut self, config: JsValue) {
        let config: NodeConfig =
            serde_wasm_bindgen::from_value(config).expect("Failed to parse NodeConfig");
        self.0.add_node(config);
    }

    #[wasm_bindgen(js_name = step)]
    pub fn step(&mut self) {
        self.0.step();
    }

    #[wasm_bindgen(js_name = run)]
    pub fn run(&mut self, cycles: u64) {
        self.0.run(cycles);
    }
}

#[wasm_bindgen(js_name = NodeConfig)]
pub struct WasmNodeConfig;

#[wasm_bindgen(js_class = NodeConfig)]
impl WasmNodeConfig {
    #[wasm_bindgen(constructor)]
    pub fn new(
        id: u16,
        unit_type: String,
        position: Vec<f64>,
        cpu_freq_hz: u64,
        tick_interval: u64,
        cycle_offset: u64,
        clock_drift_factor: f64,
        tasks: Vec<JsValue>,
    ) -> JsValue {
        let tasks: Vec<TaskConfig> = tasks
            .iter()
            .map(|task| serde_wasm_bindgen::from_value(task.clone()).unwrap())
            .collect();
        serde_wasm_bindgen::to_value(&NodeConfig::new(
            id,
            unit_type,
            position,
            cpu_freq_hz,
            tick_interval,
            cycle_offset,
            clock_drift_factor,
            tasks,
        ))
        .unwrap()
    }
}

#[wasm_bindgen(js_name = TaskConfig)]
pub struct WasmTaskConfig;

#[wasm_bindgen(js_class = TaskConfig)]
impl WasmTaskConfig {
    #[wasm_bindgen(constructor)]
    pub fn new(id: u8, name: &str, priority: u8) -> JsValue {
        serde_wasm_bindgen::to_value(&TaskConfig::new(id, name, priority)).unwrap()
    }
}

#[wasm_bindgen(js_name = EngineState)]
pub struct WasmEngineState(EngineState);

#[wasm_bindgen(js_class = EngineState)]
impl WasmEngineState {
    #[wasm_bindgen(getter)]
    pub fn cycle(&self) -> u64 {
        self.0.cycle
    }

    #[wasm_bindgen(getter)]
    pub fn nodes(&self) -> Vec<JsValue> {
        self.0
            .nodes
            .iter()
            .map(|node| serde_wasm_bindgen::to_value(node).unwrap())
            .collect()
    }
}

#[wasm_bindgen(js_name = NodeState)]
pub struct WasmNodeState(NodeState);

#[wasm_bindgen(js_class = NodeState)]
impl WasmNodeState {
    #[wasm_bindgen(getter)]
    pub fn id(&self) -> u16 {
        self.0.id
    }

    #[wasm_bindgen(getter)]
    pub fn position(&self) -> Vec<f64> {
        self.0.position.clone()
    }

    #[wasm_bindgen(getter)]
    pub fn unit_type(&self) -> String {
        self.0.unit_type.clone()
    }

    #[wasm_bindgen(getter)]
    pub fn local_cycle(&self) -> u64 {
        self.0.local_cycle
    }

    #[wasm_bindgen(getter)]
    pub fn local_time(&self) -> f64 {
        self.0.local_time
    }

    #[wasm_bindgen(getter)]
    pub fn task_schedule(&self) -> Vec<String> {
        self.0.task_schedule.clone()
    }
}
