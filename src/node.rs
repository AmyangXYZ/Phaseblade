struct Node {
    pub id: u64,
    pub eui64: u64,
    pub mac_layer: MacLayer,
    pub net_layer: NetLayer,
    pub app_layer: AppLayer,
}
