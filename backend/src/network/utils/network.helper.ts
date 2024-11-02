/**
 * Calculates broadcast address from IP address and CIDR/netmask
 * @param ip Host IP address (e.g., "192.168.1.100")
 * @param mask Either CIDR (e.g., 24) or netmask (e.g., "255.255.255.0")
 * @returns Broadcast address
 * @example
 * getBroadcast("192.168.1.100", 24)          // "192.168.1.255"
 * getBroadcast("192.168.1.100", "255.255.255.0") // "192.168.1.255"
 */
export function getBroadcast(ip: string, mask: number | string): string {
    // Convert IP to number
    const ipNum = ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;

    // Get CIDR from netmask if string provided
    const cidr = typeof mask === 'string'
        ? 32 - Math.log2(mask.split('.').reduce((acc, octet) => (acc << 8) + (255 - parseInt(octet, 10)), 0) + 1)
        : mask;

    // Calculate broadcast using bitwise operations
    const broadcast = (ipNum & ((~0) << (32 - cidr))) | ((~0) >>> cidr);

    // Convert back to dotted decimal
    return [24, 16, 8, 0].map(n => (broadcast >>> n) & 0xff).join('.');
}