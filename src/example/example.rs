use phaseblade::Engine;

fn main() {
    let mut engine = Engine::new();
    engine.add_tsch_node(0, 10, 0, 100);

    engine.run(10);
}
