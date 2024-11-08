use crate::mac::MacPacket;
use crate::phy::PhyFrame;
use std::sync::mpsc::{Receiver, Sender};
use std::thread;

pub struct PhyProtocol {
    to_mac_sender: Sender<MacPacket>,
    from_mac_receiver: Receiver<MacPacket>,
    to_orchestrator_sender: Sender<PhyFrame>,
    from_orchestrator_receiver: Receiver<PhyFrame>,
}

impl PhyProtocol {
    pub fn new(
        to_mac_sender: Sender<MacPacket>,
        from_mac_receiver: Receiver<MacPacket>,
        to_orchestrator_sender: Sender<PhyFrame>,
        from_orchestrator_receiver: Receiver<PhyFrame>,
    ) -> Self {
        Self {
            to_mac_sender,
            from_mac_receiver,
            to_orchestrator_sender,
            from_orchestrator_receiver,
        }
    }

    pub fn run(self) {
        let to_mac_sender = self.to_mac_sender;
        let from_mac_receiver = self.from_mac_receiver;
        let to_orchestrator_sender = self.to_orchestrator_sender;
        let from_orchestrator_receiver = self.from_orchestrator_receiver;

        let mac_handler = thread::spawn(move || loop {
            let mac_packet = from_mac_receiver.recv().unwrap();

            to_orchestrator_sender
                .send(PhyFrame::new(mac_packet))
                .unwrap();
        });

        let orchestrator_handler = thread::spawn(move || loop {
            let phy_frame = from_orchestrator_receiver.recv().unwrap();

            to_mac_sender.send(phy_frame.into_mac()).unwrap();
        });

        mac_handler.join().unwrap();
        orchestrator_handler.join().unwrap();
    }
}
