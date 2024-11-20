use phaseblade::Engine;

fn main() {
    let mut engine = Engine::new(10, 100);
    engine.add_tsch_node(0, 10, 0, 100);

    engine.step();
    println!("State: {:?}", engine.get_state());
    engine.step();
    println!("State: {:?}", engine.get_state());
}
