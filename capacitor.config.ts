import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'in.hotelmart.in',
  appName: 'hmfront',
  webDir: 'public',  // Corrected the path to just 'public'
  server: {
    url: 'http://13.201.119.25:3000/api',
    cleartext: true
  }
};

export default config;

