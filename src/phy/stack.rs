use crate::mac::MacPacket;
use crate::phy::PhyFrame;
use std::sync::mpsc::{Receiver, Sender};
use std::thread;

pub struct PhyStack {
    id: u16,
    eui64: u64,
    to_mac_sender: Sender<MacPacket>,
    from_mac_receiver: Receiver<MacPacket>,
    to_orchestrator_sender: Sender<PhyFrame>,
    from_orchestrator_receiver: Receiver<PhyFrame>,
}

impl PhyStack {
    pub fn new(
        id: u16,
        eui64: u64,
        to_mac_sender: Sender<MacPacket>,
        from_mac_receiver: Receiver<MacPacket>,
        to_orchestrator_sender: Sender<PhyFrame>,
        from_orchestrator_receiver: Receiver<PhyFrame>,
    ) -> Self {
        Self {
            id,
            eui64,
            to_mac_sender,
            from_mac_receiver,
            to_orchestrator_sender,
            from_orchestrator_receiver,
        }
    }

    pub fn run(self) {
        let id = self.id;
        let eui64 = self.eui64;

        let to_mac_sender = self.to_mac_sender;
        let from_mac_receiver = self.from_mac_receiver;
        let to_orchestrator_sender = self.to_orchestrator_sender;
        let from_orchestrator_receiver = self.from_orchestrator_receiver;

        let mac_handler = thread::spawn(move || loop {
            let mac_packet = from_mac_receiver.recv().unwrap();

            if let Err(e) = to_orchestrator_sender.send(PhyFrame::new(mac_packet)) {
                println!(
                    "[{}-{:016X} PHY] failed to send to orchestrator: {}",
                    id, eui64, e
                );
            }
        });

        let orchestrator_handler = thread::spawn(move || loop {
            let phy_frame = from_orchestrator_receiver.recv().unwrap();

            if let Err(e) = to_mac_sender.send(phy_frame.into_mac()) {
                println!("[{}-{:016X} PHY] failed to send to mac: {}", id, eui64, e);
            }
        });

        mac_handler.join().unwrap();
        orchestrator_handler.join().unwrap();
    }
}
