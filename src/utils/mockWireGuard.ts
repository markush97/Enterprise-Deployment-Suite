// Mock WireGuard implementation for development
interface WireGuardConfig {
  privateKey: string;
  publicKey: string;
  endpoint: string;
  allowedIPs: string[];
  persistentKeepalive: number;
}

class MockWireGuard {
  private isConnected = false;

  async up(config: WireGuardConfig): Promise<void> {
    if (this.isConnected) {
      throw new Error('WireGuard is already connected');
    }

    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Validate config
    if (!config.privateKey || !config.publicKey || !config.endpoint) {
      throw new Error('Invalid WireGuard configuration');
    }

    this.isConnected = true;
    console.log('WireGuard connected:', config.endpoint);
  }

  async down(): Promise<void> {
    if (!this.isConnected) {
      throw new Error('WireGuard is not connected');
    }

    // Simulate disconnection delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    this.isConnected = false;
    console.log('WireGuard disconnected');
  }

  isUp(): boolean {
    return this.isConnected;
  }
}

export const wireGuard = new MockWireGuard();