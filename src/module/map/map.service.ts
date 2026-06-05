import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class MapService {
  // Geocode (internal)
  private async geocode(address: string) {
    const url = 'https://nominatim.openstreetmap.org/search';

    const res = await axios.get(url, {
      params: {
        q: address,
        format: 'json',
        limit: 1,
      },
      headers: {
        'User-Agent': 'nestjs-app',
      },
    });

    return res.data;
  }

  // Public API: chỉ cần truyền 2 địa chỉ
  async calculateRoadDistance(address1: string, address2: string) {
    const [res1, res2] = await Promise.all([
      this.geocode(address1),
      this.geocode(address2),
    ]);

    if (!res1.length || !res2.length) {
      throw new Error('Không tìm thấy địa chỉ');
    }

    const lat1 = parseFloat(res1[0].lat);
    const lon1 = parseFloat(res1[0].lon);
    const lat2 = parseFloat(res2[0].lat);
    const lon2 = parseFloat(res2[0].lon);

    const url = `http://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}`;

    const res = await axios.get(url, {
      params: {
        overview: false,
      },
    });

    const route = res.data.routes?.[0];

    if (!route) {
      throw new Error('Không tính được route');
    }

    return {
      distanceKm: route.distance / 1000,
      durationMinutes: route.duration / 60,
      distanceMeters: route.distance,
    };
  }
}