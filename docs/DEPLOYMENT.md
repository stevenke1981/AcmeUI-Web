# Deployment
## Static previews
Upload any `previews/<slug>` directory to Cloudflare Pages, Netlify, GitHub
Pages, Vercel static hosting, S3-compatible storage or a normal web server.
## Generated React / Vue
```bash
npm install
npm run build
```
Deploy `dist/`.
## Docker
```bash
docker build -t acmeui-web .
docker run --rm -p 8080:80 acmeui-web
```
## Cloudflare Pages
Build: `pnpm build`; output: `apps/gallery/dist`; Node: 20.19+.
