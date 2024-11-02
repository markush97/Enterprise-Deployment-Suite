export interface NetworkInterface {
    name: string;
    mac: string;
    addresses: NetworkAddress[]
    
}

export interface NetworkAddress {
    address: string;
    netmask: string;
    family: 'IPv4' | 'IPv6',
    internal: boolean;
    cidr: string;
}