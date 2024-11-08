use crate::app::AppPacket;
use std::sync::mpsc::{Receiver, Sender};
use std::thread;

pub struct AppProtocol {
    id: u16,
    to_net_sender: Sender<AppPacket>,
    from_net_receiver: Receiver<AppPacket>,
}

impl AppProtocol {
    pub fn new(
        id: u16,
        to_net_sender: Sender<AppPacket>,
        from_net_receiver: Receiver<AppPacket>,
    ) -> Self {
        Self {
            id,
            to_net_sender,
            from_net_receiver,
        }
    }

    pub fn run(self) {
        let id = self.id;
        let from_net_receiver = self.from_net_receiver;
        let to_net_sender = self.to_net_sender;

        let net_handler = thread::spawn(move || loop {
            let app_packet = from_net_receiver.recv().unwrap();

            println!("app received: {:?}", app_packet.data);
        });

        let app_handler = thread::spawn(move || loop {
            if id == 1 {
                let app_packet = AppPacket::new(id, 2, "hello".as_bytes().try_into().unwrap());
                to_net_sender.send(app_packet).unwrap();
            }
        });

        net_handler.join().unwrap();
        app_handler.join().unwrap();
    }
}
