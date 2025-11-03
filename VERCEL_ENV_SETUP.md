# Vercel Environment Variables Setup

## Required Environment Variables

These must be set in your Vercel dashboard for the application to work:

### 1. `DATABASE_URL` ⚠️ **REQUIRED**
- **What it is**: PostgreSQL database connection string
- **Format**: `postgresql://username:password@host:port/database?sslmode=require`
- **Where to get it**: 
  - Vercel Postgres (recommended): Go to your Vercel project → Storage → Create Database → Copy connection string
  - Supabase: Project Settings → Database → Connection String (URI mode)
  - Railway/Neon: Copy from your database dashboard
- **Example**: `postgresql://user:pass@host.vercel-storage.com:5432/dbname?sslmode=require`

### 2. `NEXTAUTH_SECRET` ⚠️ **REQUIRED**
- **What it is**: Secret key for encrypting NextAuth.js sessions (must be random and secure)
- **How to generate**:
  ```bash
  # Option 1: Using OpenSSL
  openssl rand -base64 32
  
  # Option 2: Using Node.js
  node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
  
  # Option 3: Online generator
  # Visit: https://generate-secret.vercel.app/32
  ```
- **Length**: Minimum 32 characters (recommended: 64+)
- **Important**: Keep this secret! Never commit it to git.

### 3. `NEXTAUTH_URL` ⚠️ **REQUIRED**
- **What it is**: Your production URL (Vercel will set this automatically, but you should verify)
- **Format**: `https://your-app.vercel.app` (or your custom domain)
- **Note**: Vercel automatically sets this, but you can override if using a custom domain
- **Example**: `https://jnrgames-website.vercel.app`

### 4. `NEXT_PUBLIC_BASE_URL` 📝 **RECOMMENDED**
- **What it is**: Public base URL used for sitemap, robots.txt, structured data, and API calls
- **Format**: `https://your-app.vercel.app`
- **Note**: Has fallback to `http://localhost:3000` but should be set in production
- **Example**: `https://jnrgames-website.vercel.app`

## Optional Environment Variables

These are optional and only used for development/initial setup:

### `ADMIN_USERNAME` (Optional)
- **What it is**: Default admin username for migration script
- **Note**: Only used by `scripts/migrate.js` for creating initial admin user
- **Default**: `admin` (if not set)

### `ADMIN_PASSWORD` (Optional)
- **What it is**: Default admin password for migration script
- **Note**: Only used by `scripts/migrate.js` for creating initial admin user
- **Important**: If used, will be hashed before storage
- **Default**: `admin123` (if not set) ⚠️ **Change this in production!**

## How to Set Environment Variables in Vercel

### Step 1: Access Vercel Dashboard
1. Go to [vercel.com](https://vercel.com) and sign in
2. Select your project: `JnRGamesWebsite`

### Step 2: Add Environment Variables
1. Go to **Settings** → **Environment Variables**
2. Click **Add New**
3. Add each variable:
   - **Key**: (e.g., `DATABASE_URL`)
   - **Value**: (paste your value)
   - **Environment**: Select all (Production, Preview, Development) OR just Production
4. Click **Save**

### Step 3: Redeploy
After adding environment variables, you need to redeploy:
- Go to **Deployments** tab
- Click **⋯** (three dots) on latest deployment
- Click **Redeploy**

Or push a new commit to trigger automatic deployment.

## Quick Setup Checklist

- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `NEXTAUTH_SECRET` - Generated secure random string (32+ chars)
- [ ] `NEXTAUTH_URL` - Your Vercel app URL (usually auto-set)
- [ ] `NEXT_PUBLIC_BASE_URL` - Your Vercel app URL

## Example .env.local (for local development)

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/jnrgames_db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-generated-secret-here-minimum-32-characters"

# Public URL (for local dev)
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# Optional: For initial admin setup
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="your-secure-password"
```

## Security Notes

⚠️ **Important**:
- Never commit `.env` files to git (already in `.gitignore`)
- `NEXTAUTH_SECRET` should be unique and random
- Use strong passwords for database credentials
- In production, use SSL/HTTPS for database connections (`?sslmode=require`)
- `ADMIN_PASSWORD` is only used during initial setup - change admin password after first login

## Troubleshooting

### "NEXTAUTH_SECRET is required in production"
- Make sure `NEXTAUTH_SECRET` is set in Vercel dashboard
- Ensure it's at least 32 characters long
- Redeploy after adding the variable

### Database connection errors
- Verify `DATABASE_URL` format is correct
- Check that database allows connections from Vercel IPs
- Ensure SSL mode is set: `?sslmode=require`
- For Vercel Postgres, connection string should work automatically

### API routes returning errors
- Check that `NEXT_PUBLIC_BASE_URL` matches your actual domain
- Verify environment variables are set for the correct environment (Production/Preview)

