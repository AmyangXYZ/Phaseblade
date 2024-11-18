pub trait Packet {
    fn get_id(&self) -> u64;
    fn get_src(&self) -> u16;
    fn get_dst(&self) -> u16;
    fn get_size(&self) -> u64;
    fn set_arrival_time(&mut self, arrival_time: u64);
    fn get_arrival_time(&self) -> u64;
}
