import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  integrations: [],
  output: 'static',  // or 'hybrid' if using server features
  adapter: cloudflare(),
  base: '/',  // Important! Make sure this is '/'
});