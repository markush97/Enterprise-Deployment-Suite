export interface DHCPServerConfig {
  port: number;
  leaseTime: number;
  range: [string, string];
  domainName: string;
  timeServer: string;
  router: string[];
  dns: string[];
  tftpServer: string;
  bootFile: string;
}
