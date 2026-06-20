import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/*
 * Peridot is distributed in two static-hosting forms:
 * - itch.io ZIP builds are extracted at the site root, so they need relative
 *   asset paths (`./`).
 * - GitHub Pages serves this project under
 *   /peridot-humanistic-data/, so that deployment needs the repository prefix.
 *
 * The GitHub Actions workflow sets GITHUB_PAGES=true only for the Pages build.
 * Normal local `npm run build` behavior remains suitable for itch.io packaging.
 */
export default defineConfig({
  plugins: [react()],
  base:
    process.env.GITHUB_PAGES === 'true'
      ? '/peridot-humanistic-data/'
      : './',
});
