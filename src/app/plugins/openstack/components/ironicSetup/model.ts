export interface IPf9IronicInspector {
  dnsmasq_interface: string
  tftp_server_ip: string
}

export interface IPf9NeutronOvsAgent {
  bridge_mappings: string
}

export interface IPf9GlanceRole {
  filesystem_store_datadir: string
}
