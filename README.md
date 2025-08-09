## StudyPathshala (Booksreading)

A full‑stack app with a React (Vite) client and a Node.js/Express/MongoDB API server.

### Repository layout

- `client/`: React app (Vite, Tailwind)
- `server/`: Express API, MongoDB models, file uploads served from `server/public/static`

---

## Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+ (or pnpm/yarn if you prefer)
- MongoDB (local instance or Atlas connection string)

---

## 1) Local development (step by step)

### 1.1 Install dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### 1.2 Configure environment variables

- Create `server/.env`:

```bash
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/studypathshala
JWT_SECRET=change_this_in_dev_and_prod
# Comma-separated list of allowed web origins (for CORS and CSP connect-src)
CLIENT_ORIGIN=http://localhost:5173

# Optional (used by the create-admin script)
# ADMIN_EMAIL=admin@studypathshala.com
# ADMIN_PASSWORD=Admin@12345
# ADMIN_NAME=Administrator
```

- Create `client/.env`:

```bash
VITE_API_URL=http://localhost:5000
```

Notes:
- The API also exposes a health check at `GET /api/health`.
- CORS and CSP will allow origins listed in `CLIENT_ORIGIN`.

### 1.3 Start MongoDB

If running locally, make sure your MongoDB service is started. The default URI is `mongodb://127.0.0.1:27017/studypathshala`.

### 1.4 Run the API server (dev)

```bash
cd server
npm run dev
# API will listen on http://localhost:5000
```

Optional: seed an admin user (you can pass args or use envs from `.env`):

```bash
# Using args: email password name
npm run create-admin -- admin@example.com "Password123!" "Admin User"
```

### 1.5 Run the web client (dev)

Open a second terminal:

```bash
cd client
npm run dev
# App will open on http://localhost:5173
```

Login/Registration is available in the UI. Admin‑only endpoints require the admin token created above.

---

## 2) Production setup (two common approaches)

### Approach A: Single server (monorepo on one host)

1. Prepare the host
   - Install Node.js 18+ and MongoDB (or point to Atlas in `MONGO_URI`).
   - Set a strong `JWT_SECRET` and correct `CLIENT_ORIGIN` (e.g., `https://your-domain.com`).

2. Build the client
   ```bash
   cd client
   npm ci
   npm run build
   ```

3. Install API deps and start
   ```bash
   cd ../server
   npm ci
   NODE_ENV=production npm run start
   # or: pm2 start src/index.js --name studypathshala --update-env
   ```

4. Reverse proxy (example Nginx)
   - Point your domain to the server.
   - Example Nginx server block:

   ```nginx
   server {
     listen 80;
     server_name your-domain.com;

     location / {
       proxy_pass http://127.0.0.1:5000;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
     }
   }
   ```

   - Add HTTPS with Let’s Encrypt/Certbot.

Notes:
- In production, the API auto‑serves the built client if `client/dist` exists in this repo layout. That enables a single‑process deployment.
- Static uploads are stored under `server/public/static` and are served at `/static/*`. Ensure this directory is writable and persisted.

### Approach B: Split deploy (API and Web separate)

1. Deploy API (server/) to your compute of choice (VM, Docker, Render, Fly, etc.)
   - Set `NODE_ENV=production`, `MONGO_URI`, `JWT_SECRET`, and `CLIENT_ORIGIN` to include your web app origin(s).
   - Start the server: `npm ci && npm run start` (or use PM2/systemd).

2. Deploy Web (client/) to Netlify/Vercel/S3+CloudFront/etc.
   - Set `VITE_API_URL` to your API URL.
   - Build and deploy: `npm ci && npm run build`.

3. CORS
   - Ensure `CLIENT_ORIGIN` on the API lists your deployed web origins, e.g. `https://app.your-domain.com,https://your-domain.com`.

---

## Useful endpoints and rate limits

- `GET /api/health` – health check
- `POST /api/auth/register` – create account
- `POST /api/auth/login` – sign in (returns JWT)
- `GET /api/auth/me` – current user (auth required)
- `GET /api/books` – list books
- `GET /api/books/:id` – book details
- `POST /api/books` – create (admin only; supports `cover` (image) and `pdf` uploads)
- `PUT /api/books/:id` – update (admin only; supports new uploads)
- `DELETE /api/books/:id` – delete (admin only)
- `GET /api/books/:id/page/:n.png` – page preview with watermark (premium books require auth)
- `GET /api/events` – SSE stream emits `bookCreated` and `bookDeleted`

Global rate limit: 120 req/min; tighter limits on auth and book rendering routes.

---

## File uploads and persistence

- Uploaded files are written to `server/public/static` and exposed at `/static/*`.
- If deploying on ephemeral filesystems, mount a persistent volume for this directory.

---

## Security and production notes

- Set a strong `JWT_SECRET` in production.
- Use HTTPS. With `NODE_ENV=production`, HSTS is enabled.
- Keep `CLIENT_ORIGIN` restricted to your actual web origins.

---

## Troubleshooting

- CORS errors in browser
  - Make sure your web origin is listed in `CLIENT_ORIGIN` on the API (comma‑separated) and you restarted the server.

- Cannot connect to MongoDB
  - Verify `MONGO_URI`. If using Atlas, ensure IP allowlist and credentials are correct.

- Module not found: compression
  - If you see an error about `compression`, install it in `server/`:
    ```bash
    cd server && npm install compression
    ```

- Puppeteer on Linux servers
  - The API uses headless Chromium via Puppeteer to render book pages as PNGs.
  - On minimal Linux images you may need extra packages (fonts/Chromium deps). Start with:
    ```bash
    sudo apt-get update && sudo apt-get install -y ca-certificates fonts-liberation libasound2 libatk-bridge2.0-0 libatk1.0-0 \
      libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 \
      libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 \
      libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 lsb-release wget xdg-utils
    ```
  - The app launches Chromium with `--no-sandbox`; prefer a hardened container/VM runtime.

---

## Scripts reference

### server/package.json

- `npm run dev` – start API with nodemon
- `npm run start` – start API (prod)
- `npm run seed` – run `src/seed.js` (optional, if implemented)
- `npm run create-admin` – create or update an admin user

### client/package.json

- `npm run dev` – start Vite dev server
- `npm run build` – build production assets into `client/dist`
- `npm run preview` – preview the production build locally

---

## License

ISC (see package metadata). Update as needed.


