import type { NextConfig } from 'next';

const config: NextConfig = { serverExternalPackages: ['@seismo/sdk', '@mswjs/interceptors'] };
export default config;
