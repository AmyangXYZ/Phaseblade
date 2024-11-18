use phaseblade::tsch::{SensorTask, TschNode};
use phaseblade::{Engine, Node};

fn main() {
    let mut engine = Engine::new(10, 100);
    let mut tsch_node = TschNode::new(0, 20, 0);
    tsch_node.register_task(Box::new(SensorTask::new(0, "sensor".to_string(), 1)));
    engine.add_node(Box::new(tsch_node));

    engine.run(10);
}
