use crate::app::AppPacket;
use crate::net::NetPacket;
use std::sync::mpsc::{Receiver, Sender};
use std::thread;

pub struct NetProtocol {
    to_app_sender: Sender<AppPacket>,
    from_app_receiver: Receiver<AppPacket>,
    to_mac_sender: Sender<NetPacket>,
    from_mac_receiver: Receiver<NetPacket>,
}

impl NetProtocol {
    pub fn new(
        to_app_sender: Sender<AppPacket>,
        from_app_receiver: Receiver<AppPacket>,
        to_mac_sender: Sender<NetPacket>,
        from_mac_receiver: Receiver<NetPacket>,
    ) -> Self {
        Self {
            to_app_sender,
            from_app_receiver,
            to_mac_sender,
            from_mac_receiver,
        }
    }

    pub fn run(self) {
        let to_app_sender = self.to_app_sender;
        let from_app_receiver = self.from_app_receiver;
        let to_mac_sender = self.to_mac_sender;
        let from_mac_receiver = self.from_mac_receiver;

        let net_handler = thread::spawn(move || loop {
            let app_packet = from_app_receiver.recv().unwrap();

            let net_packet = NetPacket::new(app_packet.src_id, app_packet.dst_id, app_packet);
            to_mac_sender.send(net_packet).unwrap();
        });

        let mac_handler = thread::spawn(move || loop {
            let net_packet = from_mac_receiver.recv().unwrap();

            to_app_sender.send(net_packet.into_app()).unwrap();
        });

        net_handler.join().unwrap();
        mac_handler.join().unwrap();
    }
}
