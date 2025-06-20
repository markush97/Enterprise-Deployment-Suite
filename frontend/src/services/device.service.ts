import { api } from '../api/api.service';

export const deviceService = {
  async updateDevice(id: string, data: Partial<{ name: string; type: string; assetTag: string }>) {
    return api.patch(`/devices/${id}`, data);
  },
};
