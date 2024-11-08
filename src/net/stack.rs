use crate::app::AppPacket;
use crate::net::NetPacket;
use std::sync::mpsc::{Receiver, Sender};
use std::thread;

pub struct NetStack {
    id: u16,
    eui64: u64,
    to_app_sender: Sender<AppPacket>,
    from_app_receiver: Receiver<AppPacket>,
    to_mac_sender: Sender<NetPacket>,
    from_mac_receiver: Receiver<NetPacket>,
}

impl NetStack {
    pub fn new(
        id: u16,
        eui64: u64,
        to_app_sender: Sender<AppPacket>,
        from_app_receiver: Receiver<AppPacket>,
        to_mac_sender: Sender<NetPacket>,
        from_mac_receiver: Receiver<NetPacket>,
    ) -> Self {
        Self {
            id,
            eui64,
            to_app_sender,
            from_app_receiver,
            to_mac_sender,
            from_mac_receiver,
        }
    }

    pub fn run(self) {
        let id = self.id;
        let eui64 = self.eui64;

        let to_app_sender = self.to_app_sender;
        let from_app_receiver = self.from_app_receiver;
        let to_mac_sender = self.to_mac_sender;
        let from_mac_receiver = self.from_mac_receiver;

        let app_handler = thread::spawn(move || loop {
            let app_packet = from_app_receiver.recv().unwrap();
            let net_packet = NetPacket::new(
                app_packet.src_id as u32,
                app_packet.dst_id as u32,
                app_packet,
            );

            if let Err(e) = to_mac_sender.send(net_packet) {
                println!("[{}-{:016X} NET] failed to send to mac: {}", id, eui64, e);
            }
        });

        let mac_handler = thread::spawn(move || loop {
            let net_packet = from_mac_receiver.recv().unwrap();

            if let Err(e) = to_app_sender.send(net_packet.into_app()) {
                println!("[{}-{:016X} NET] failed to send to app: {}", id, eui64, e);
            }
        });

        app_handler.join().unwrap();
        mac_handler.join().unwrap();
    }
}
