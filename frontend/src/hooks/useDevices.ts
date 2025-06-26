import { useQuery } from '@tanstack/react-query';

import { deviceService } from '../services/device.service';

export function useDevices() {
  const devicesQuery = useQuery({
    queryKey: ['devices'],
    queryFn: async () => {
      const res = await deviceService.getAllDevices();
      return res.data;
    },
  });
  return { devicesQuery };
}

export default useDevices;
