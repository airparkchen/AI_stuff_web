# Skill: Build and Deploy

## Description
Build the project and verify it's ready for GitHub Pages deployment.

## Steps

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run production build:
   ```bash
   npm run build
   ```

3. Verify the `dist/` output directory contains:
   - `index.html`
   - `assets/` with JS and CSS bundles
   - VLM page files

4. If build succeeds, commit and push to trigger GitHub Actions deployment.

## Troubleshooting
- If `npm ci` fails in CI, ensure `package-lock.json` is committed
- If pages don't load, verify `base` in `vite.config.js` matches the repo name
