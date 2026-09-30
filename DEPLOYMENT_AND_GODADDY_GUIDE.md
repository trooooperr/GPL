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

## Part 2: Configuring Database & Environment Variables in Vercel

### Step 1: MongoDB Atlas IP Access (CRITICAL)
Vercel uses dynamic serverless IP addresses that change on every request. If MongoDB Atlas does not allow connections from anywhere, Vercel will be blocked from connecting:
1. Log into your [MongoDB Atlas Dashboard](https://cloud.mongodb.com).
2. Go to **Network Access** (under the "Security" menu on the left sidebar).
3. Click **+ Add IP Address**.
4. Click **ALLOW ACCESS FROM ANYWHERE** (this sets `0.0.0.0/0`).
5. Click **Confirm**. (It takes about 1-2 minutes to become active).

### Step 2: Add Environment Variables in Vercel
In your Vercel Dashboard > Select Project > **Settings** > **Environment Variables**, add the following:

| Key | Example Value | Description |
| :--- | :--- | :--- |
| `MONGODB_URI` | `mongodb+srv://...` | **Required.** Your full MongoDB Atlas connection string |
| `JWT_SECRET` | *(Random 32+ char string)* | **Required.** Secret used to sign admin session tokens |
| `ADMIN_USERNAME` | `admin` | Admin dashboard username |
| `ADMIN_PASSWORD` | `admin123` | Admin dashboard password |
| `GMAIL_USER` | `goregaonpremierleague11@gmail.com` | (Optional) Email sender for registrations |
| `GMAIL_APP_PASSWORD` | *(16-char Google App Password)* | (Optional) App password for Gmail |
| `ADMIN_NOTIFICATION_EMAIL` | `random.alokgupta@gmail.com` | (Optional) Admin notification receiver |
| `NEXT_PUBLIC_APP_URL` | `https://goregaonpremierleague.in` | Your live custom domain or vercel URL |

> ⚠️ **IMPORTANT**: After adding or updating Environment Variables in Vercel, you **MUST Redeploy**:
> - Go to **Deployments** tab in Vercel > Click the **three dots (...)** on the latest deployment > Click **Redeploy**.
> - (New environment variables do NOT take effect on previously existing builds until redeployed).

### Step 3: Verify Database Connection
Once deployed, open:
`https://your-app-domain.vercel.app/api/db-check`

You should see:
```json
{
  "success": true,
  "status": "CONNECTED",
  "message": "Successfully connected to MongoDB Atlas from Vercel!"
}
```
If anything is wrong (e.g. missing variable or blocked IP), this endpoint will tell you the exact cause and how to fix it!

---

## Part 3: Linking Your GoDaddy Domain to Vercel

Once your domain is purchased on GoDaddy (e.g., `goregaonpremierleague.in`):

### Step 1: Add Domain in Vercel
1. Open your Vercel project dashboard.
2. Go to **Settings** → **Domains**.
3. Type your domain: `goregaonpremierleague.in` and click **Add**.
4. Select the recommended option: `Redirect goregaonpremierleague.in to www.goregaonpremierleague.in` (or vice-versa).

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
- Your website is now live worldwide at `https://goregaonpremierleague.in`!
