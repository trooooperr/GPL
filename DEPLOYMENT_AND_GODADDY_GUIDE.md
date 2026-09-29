# 🚀 Vercel Deployment & GoDaddy Domain Linking Guide

This application is built with Next.js App Router and is 100% optimized for zero-configuration, lightning-fast deployment on **Vercel** with full custom domain support from **GoDaddy**.

---

## Part 1: Deploying to Vercel (2 Quick Methods)

### Method A: Via Vercel CLI (Fastest, No Git required)
1. In your terminal inside `/Users/alok/Desktop/goregaon-premier-league`, run:
   ```bash
   npx vercel
   ```
2. Log in with your email or GitHub account when prompted.
3. Accept the defaults:
   - Set up and deploy? **Yes**
   - Which scope? (Select your account)
   - Link to existing project? **No**
   - Project name: **goregaon-premier-league**
   - In which directory? **./**
4. Deploy to production:
   ```bash
   npx vercel --prod
   ```
5. You will receive an instant live URL like `https://goregaon-premier-league.vercel.app`!

### Method B: Via GitHub & Vercel Dashboard
1. Initialize a git repository and push to GitHub:
   ```bash
   git init
   git add .
   git commit -m "GPL 2026 Production Ready Portal"
   # Push to your GitHub repo
   ```
2. Go to [vercel.com](https://vercel.com) and click **Add New Project**.
3. Import your GitHub repository.
4. Click **Deploy**.

---

## Part 2: Configuring Environment Variables in Vercel

In your Vercel Dashboard > Project > **Settings** > **Environment Variables**, add:
- `ADMIN_PASSWORD`: Your secret admin password (e.g., `MySuperSecretGPL@2026!`)
- `JWT_SECRET`: A long random string for cryptographically signing admin tokens

---

## Part 3: Linking Your GoDaddy Domain to Vercel

Once your domain is purchased on GoDaddy (e.g., `goregaonpremierleague.com`):

### Step 1: Add Domain in Vercel
1. Open your Vercel project dashboard.
2. Go to **Settings** → **Domains**.
3. Type your domain: `goregaonpremierleague.com` and click **Add**.
4. Select the recommended option: `Redirect goregaonpremierleague.com to www.goregaonpremierleague.com` (or vice-versa).

### Step 2: Configure DNS Records in GoDaddy
1. Log into your [GoDaddy Account](https://dcc.godaddy.com/manage/dns).
2. Go to **My Products** → click **DNS** next to your domain name.
3. In the **DNS Records** table, add or edit the following two records:

| Type | Name / Host | Value / Points to | TTL |
| :--- | :--- | :--- | :--- |
| **A** | `@` | `76.76.21.21` | 1/2 Hour (or Default) |
| **CNAME** | `www` | `cname.vercel-dns.com` | 1/2 Hour (or Default) |

*(Delete any conflicting old parked A-records or parking page records from GoDaddy if present)*.

### Step 3: Verification & Automatic SSL
- Within 5 to 30 minutes, Vercel will verify the DNS records, display a green checkmark, and automatically issue an **SSL Certificate (HTTPS)** for your domain.
- Your website is now live worldwide at `https://goregaonpremierleague.com`!
