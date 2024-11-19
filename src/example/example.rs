use phaseblade::tsch::TschNode;
use phaseblade::Engine;

fn main() {
    let mut engine = Engine::new(10, 100);
    for i in 0..1 {
        let tsch_node = TschNode::new(i, 10, 0, 100);
        engine.add_node(Box::new(tsch_node));
    }

    engine.step();
    println!("State: {:?}", engine.get_state());
    engine.step();
    println!("State: {:?}", engine.get_state());
}
