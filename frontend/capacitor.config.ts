import type { CapacitorConfig } from '@capacitor/cli';
const config: CapacitorConfig = {
  appId: 'com.luiscoco.smallestagent.ionic', appName: 'The Smallest Agent', webDir: 'dist/browser',
  server: { hostname: 'localhost', androidScheme: 'https', iosScheme: 'capacitor' },
  plugins: { CapacitorHttp: { enabled: false } },
};
export default config;
