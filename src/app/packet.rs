#[derive(Debug)]
pub struct AppPacket {
    pub src_id: u16,
    pub dst_id: u16,
    pub data: Vec<u8>,
}

impl AppPacket {
    pub fn new(src_id: u16, dst_id: u16, data: &[u8]) -> Self {
        Self {
            src_id,
            dst_id,
            data: data.to_vec(),
        }
    }
}
