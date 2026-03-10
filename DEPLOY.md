# Deployment Guide — Tommi's Lab

## 1. Supabase Setup (5 min)

Go to your Supabase project dashboard → SQL Editor → run this:

```sql
CREATE TABLE app_passwords (
  slug TEXT PRIMARY KEY,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert app passwords (change these!)
INSERT INTO app_passwords (slug, password) VALUES 
  ('fro-dashboard', 'your-fro-password'),
  ('trading', 'your-trading-password');
```

Note your **Supabase URL** and **Service Role Key** from Settings → API.

## 2. Netlify Setup (5 min)

### Option A: Git deploy (recommended)
1. Push this folder to a GitHub/GitLab repo
2. Connect the repo to Netlify
3. Build settings: leave blank (static site, no build needed)
4. Publish directory: `public`

### Option B: Manual deploy
1. Drag the `public` folder to Netlify's deploy area

### Environment Variables
In Netlify → Site Settings → Environment Variables, add:

| Key | Value |
|-----|-------|
| `ANTHROPIC_API_KEY` | Your Claude API key (sk-ant-...) |
| `SUPABASE_URL` | https://yourproject.supabase.co |
| `SUPABASE_SERVICE_KEY` | Your service role key (eyJ...) |
| `ADMIN_PASSWORD` | Your master admin password |

## 3. File Structure

```
/
├── public/
│   ├── index.html              ← Landing page
│   └── apps/
│       ├── fro-dashboard.html  ← FRO Intelligence Dashboard
│       └── trading-dashboard.html ← Daily Trade Advisor
├── netlify/
│   └── functions/
│       ├── claude-proxy.js     ← Claude API proxy
│       └── verify-password.js  ← Password verification
└── netlify.toml                ← Routing config
```

## 4. How Auth Works

- Visitor sees app grid on landing page
- Clicks an app → password modal appears
- Password checked server-side via Netlify function against Supabase
- If the **admin password** is entered for ANY app, full admin access is granted (all apps)
- If an **app-specific password** is entered, access to that single app is granted
- Session stored in localStorage, expires after 7 days
- Session is validated on each app load (client-side check)

## 5. Adding New Apps

1. Create the HTML file in `public/apps/`
2. Replace `window.storage` calls with `localStorage`
3. Replace API endpoint with `/api/claude-proxy`
4. Add the auth gate script (copy from existing apps)
5. Add entry to the `APPS` array in `public/index.html`
6. Add password to Supabase: `INSERT INTO app_passwords VALUES ('slug', 'password');`

## 6. Changing Passwords

Update directly in Supabase:
```sql
UPDATE app_passwords SET password = 'new-password' WHERE slug = 'fro-dashboard';
```

Or change admin password in Netlify env vars (requires redeploy of functions).

## 7. Security Notes

- Passwords are stored in plaintext in Supabase (acceptable for personal use with friends)
- For production, hash with bcrypt and compare server-side
- The admin password is in Netlify env vars, never exposed to client
- Session tokens are base64-encoded JSON (not signed) — sufficient for this use case
- Claude API key never leaves the server (Netlify function only)
- Supabase service key never leaves the server
