import { WgConfig } from 'wireguard-tools';

import { VpnProfile } from './entities/vpn-profile.entity';

export interface VPNConnection {
  profile: VpnProfile;
  id?: string;
  creationTime: Date;
  up: boolean;
  down: Function;
}
