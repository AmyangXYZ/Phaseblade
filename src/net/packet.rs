use crate::app::AppPacket;

pub struct NetPacket {
    pub src_addr: u32,
    pub dst_addr: u32,
    pub payload: AppPacket,
}

impl NetPacket {
    pub fn new(src_addr: u32, dst_addr: u32, payload: AppPacket) -> Self {
        Self {
            src_addr,
            dst_addr,
            payload,
        }
    }

    pub fn into_app(self) -> AppPacket {
        self.payload
    }
}
