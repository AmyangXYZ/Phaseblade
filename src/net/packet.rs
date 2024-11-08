use crate::app::AppPacket;

pub struct NetPacket {
    pub src_id: u16,
    pub dst_id: u16,
    pub app_packet: AppPacket,
}

impl NetPacket {
    pub fn new(src_id: u16, dst_id: u16, app_packet: AppPacket) -> Self {
        Self {
            src_id,
            dst_id,
            app_packet,
        }
    }

    pub fn into_app(self) -> AppPacket {
        self.app_packet
    }
}
