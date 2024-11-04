declare module 'dhcp' {
  import { EventEmitter } from 'events';
  import { Socket } from 'dgram';

  export interface DHCPOptions {
    [key: number]: any;
  }

  export interface LeaseState {
    bindTime: Date | null;
    leasePeriod: number;
    renewPeriod: number;
    rebindPeriod: number;
    state: string | null;
    server: string | null;
    address: string | null;
    options: DHCPOptions | null;
    tries: number;
    xid: number;
  }

  export interface DHCPPacket {
    op: number;
    htype: number;
    hlen: number;
    hops: number;
    xid: number;
    secs: number;
    flags: number;
    ciaddr: string;
    yiaddr: string;
    siaddr: string;
    giaddr: string;
    chaddr: string;
    sname: string;
    file: string;
    options: DHCPOptions;
  }

  /**
   * Configuration interface for DHCP server settings
   */
  export interface ServerConfig {
    /**
     * IP address range for DHCP pool [start, end]
     * @example ['192.168.1.100', '192.168.1.200']
     */
    range?: [string, string];

    /**
     * Static IP assignments by MAC address
     * Can be either an object mapping MAC addresses to IPs
     * or a function that returns an IP based on MAC and request
     * @example
     * // Object mapping
     * { "00:11:22:33:44:55": "192.168.1.10" }
     * // Function
     * (mac, req) => mac === "00:11:22:33:44:55" ? "192.168.1.10" : undefined
     */
    static?: { [key: string]: string } | ((mac: string, req: DHCPPacket) => string | undefined);

    /**
     * Whether to assign IP addresses randomly from the pool
     * @default false
     */
    randomIP?: boolean;

    /**
     * IP address of the DHCP server
     * @example "192.168.1.1"
     */
    server?: string;

    /**
     * Broadcast address for the network
     * @example "192.168.1.255"
     */
    broadcast?: string;

    /**
     * Lease time in seconds
     * @default 86400 (24 hours)
     */
    leaseTime?: number;

    /**
     * Array of DHCP options to force-send with every response
     * Can contain option names or numbers
     * @example ["subnet", "router", 6]
     */
    forceOptions?: (string | number)[];

    /**
     * Additional custom configuration options
     */
    [key: string]: any;
  }

  export interface ClientConfig {
    mac?: string;
    features?: string[];
    [key: string]: any;
  }

  export class Server extends EventEmitter {
    /**
     * Creates a new DHCP server instance
     * @param config Server configuration options
     * @param listenOnly If true, server will only listen for DHCP packets without responding
     */
    constructor(config: ServerConfig, listenOnly?: boolean);

    private _sock: Socket;
    private _conf: ServerConfig;
    private _state: { [key: string]: LeaseState };
    private _req: DHCPPacket | null;
    private _send(host: string, data: DHCPPacket): void;
    private _getOptions(pre: DHCPOptions, required: number[], requested?: number[]): DHCPOptions;
    private _selectAddress(clientMAC: string, req?: DHCPPacket): string;

    /**
     * Retrieves a configuration value by key
     * @param key The configuration key to retrieve
     * @returns The configuration value for the specified key
     */
    config(key: string): any;

    /**
     * Starts listening for DHCP packets
     * @param port Optional port number (default: 67)
     * @param host Optional host address to bind to
     * @param fn Optional callback function called when server starts listening
     */
    listen(port?: number, host?: string, fn?: () => void): void;

    /**
     * Stops the DHCP server and closes the socket
     * @param callback Optional callback function called when server is closed
     */
    close(callback?: () => void): void;

    protected handleDiscover(req: DHCPPacket): void;
    protected handleRequest(req: DHCPPacket): void;
    protected handleRelease(): void;
    protected handleRenew(): void;
    protected sendOffer(req: DHCPPacket): void;
    protected sendAck(req: DHCPPacket): void;
    protected sendNak(req: DHCPPacket): void;

    on(event: 'error', listener: (error: Error, packet?: DHCPPacket) => void): this;
    on(event: 'message', listener: (packet: DHCPPacket) => void): this;
    on(event: 'listening', listener: (socket: Socket) => void): this;
    on(event: 'close', listener: () => void): this;
    on(event: 'bound', listener: (state: { [key: string]: LeaseState }) => void): this;
  }

  export class Client extends EventEmitter {
    /**
     * Creates a new DHCP client instance
     * @param config Optional client configuration options
     */
    constructor(config?: ClientConfig);

    private _sock: Socket;
    private _conf: ClientConfig;
    private _state: LeaseState;
    private _req: DHCPPacket | null;
    private _send(host: string, data: DHCPPacket): void;

    /**
     * Retrieves a configuration value by key
     * @param key The configuration key to retrieve
     * @returns The configuration value for the specified key
     */
    config(key: string): any;

    /**
     * Starts listening for DHCP packets
     * @param port Optional port number (default: 68)
     * @param host Optional host address to bind to
     * @param fn Optional callback function called when client starts listening
     */
    listen(port?: number, host?: string, fn?: () => void): void;

    /**
     * Stops the DHCP client and closes the socket
     * @param callback Optional callback function called when client is closed
     */
    close(callback?: () => void): void;

    /**
     * Sends a DHCP discover packet to find available DHCP servers
     */
    sendDiscover(): void;

    /**
     * Sends a DHCP request packet to request the offered IP address
     * @param req The DHCP offer packet received from the server
     */
    sendRequest(req: DHCPPacket): void;

    /**
     * Sends a DHCP release packet to release the current IP address
     * @param req The current DHCP configuration packet
     */
    sendRelease(req: DHCPPacket): void;

    /**
     * Sends a DHCP renew packet to renew the current lease
     */
    sendRenew(): void;

    /**
     * Sends a DHCP rebind packet when renewal fails
     */
    sendRebind(): void;

    protected handleOffer(req: DHCPPacket): void;
    protected handleAck(req: DHCPPacket): void;

    on(event: 'error', listener: (error: Error, packet?: DHCPPacket) => void): this;
    on(event: 'message', listener: (packet: DHCPPacket) => void): this;
    on(event: 'listening', listener: (socket: Socket) => void): this;
    on(event: 'close', listener: () => void): this;
    on(event: 'bound', listener: (state: LeaseState) => void): this;
    on(event: 'released', listener: () => void): this;
  }

  /**
   * DHCP message type for DISCOVER messages
   */
  export const DHCPDISCOVER = 1;

  /**
   * DHCP message type for OFFER messages
   */
  export const DHCPOFFER = 2;

  /**
   * DHCP message type for REQUEST messages
   */
  export const DHCPREQUEST = 3;

  /**
   * DHCP message type for DECLINE messages
   */
  export const DHCPDECLINE = 4;

  /**
   * DHCP message type for ACK messages
   */
  export const DHCPACK = 5;

  /**
   * DHCP message type for NAK messages
   */
  export const DHCPNAK = 6;

  /**
   * DHCP message type for RELEASE messages
   */
  export const DHCPRELEASE = 7;

  /**
   * DHCP message type for INFORM messages
   */
  export const DHCPINFORM = 8;

  /**
   * Creates a new DHCP server instance
   * @param opt Optional server configuration options
   * @returns A new DHCP server instance
   */
  export function createServer(opt?: ServerConfig): Server;

  /**
   * Creates a new DHCP client instance
   * @param opt Optional client configuration options
   * @returns A new DHCP client instance
   */
  export function createClient(opt?: ClientConfig): Client;

  /**
   * Creates a new DHCP broadcast handler that only listens for DHCP packets
   * @returns A new DHCP server instance in listen-only mode
   */
  export function createBroadcastHandler(): Server;

  /**
   * Adds a custom DHCP option to the protocol
   * @param opt The option configuration to add
   */
  export function addOption(optCode:number, opt: any): void;

  export default {
    createServer,
    createClient,
    createBroadcastHandler,
    addOption,
    DHCPDISCOVER,
    DHCPOFFER,
    DHCPREQUEST,
    DHCPDECLINE,
    DHCPACK,
    DHCPNAK,
    DHCPRELEASE,
    DHCPINFORM
  };
}