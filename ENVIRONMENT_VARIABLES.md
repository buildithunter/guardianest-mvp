# Guardianest Secrets & Environment Variables

This document defines all environment variables required for the system.  
Values must be set in **GitHub Actions Secrets**, **Vercel**, **Cloudflare Workers**, and **Expo EAS**.

| Name                          | Used By                 | Scope        | Where to set                                             | Notes |
|-------------------------------|-------------------------|--------------|----------------------------------------------------------|-------|
| SUPABASE_URL                  | server, web, mobile     | dev/prod     | GitHub, Vercel, EAS, Wrangler vars                      | e.g., https://xyzcompany.supabase.co |
| SUPABASE_ANON_KEY             | server, web, mobile     | dev/prod     | GitHub, Vercel, EAS, Wrangler vars                      | Client-side (safe to expose) |
| SUPABASE_SERVICE_ROLE_KEY     | server only             | dev/prod     | GitHub, Wrangler vars                                   | Never expose to client apps |
| SUPABASE_JWT_SECRET           | server only             | dev/prod     | GitHub, Wrangler vars                                   | From Supabase project settings |
| OPENAI_API_KEY                | server                  | dev/prod     | GitHub, Wrangler vars                                   | For AI completion endpoints |
| GOOGLE_VISION_API_KEY         | server                  | dev/prod     | GitHub, Wrangler vars                                   | For OCR endpoint |
| NEXT_PUBLIC_APP_URL           | web                     | dev/prod     | Vercel env                                              | Domain of the web app |
| EXPO_PUBLIC_SUPABASE_URL      | mobile                  | dev/prod     | EAS secrets                                             | Expo requires `EXPO_PUBLIC_*` prefix |
| EXPO_PUBLIC_SUPABASE_ANON_KEY | mobile                  | dev/prod     | EAS secrets                                             | Same as web but for Expo |
| APP_ENV                       | all                     | dev/prod     | GitHub, Vercel, EAS, Wrangler vars                      | "development" or "production" |

## Platform-Specific Configuration

### 🔧 GitHub Actions Secrets

Set these in **Repository Settings** > **Secrets and variables** > **Actions**:

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_JWT_SECRET=your-jwt-secret-here

# OpenAI
OPENAI_API_KEY=sk-proj-...

# Google Cloud
GOOGLE_VISION_API_KEY=AIzaSy...

# Deployment tokens
VERCEL_TOKEN=vercel-token-here
VERCEL_ORG_ID=team_xxx
VERCEL_PROJECT_ID=prj_xxx
CLOUDFLARE_API_TOKEN=cloudflare-token-here
CLOUDFLARE_ACCOUNT_ID=account-id-here
EXPO_TOKEN=expo-access-token-here

# Environment
APP_ENV=production
```

### ☁️ Cloudflare Workers

Set environment variables in **Cloudflare Dashboard** > **Workers** > **Your Worker** > **Settings** > **Variables**:

#### Production Environment
```bash
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_ANON_KEY  
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
wrangler secret put SUPABASE_JWT_SECRET
wrangler secret put OPENAI_API_KEY
wrangler secret put GOOGLE_VISION_API_KEY
wrangler secret put APP_ENV
```

#### Development Environment
```bash
wrangler secret put SUPABASE_URL --env development
wrangler secret put SUPABASE_ANON_KEY --env development
wrangler secret put SUPABASE_SERVICE_ROLE_KEY --env development  
wrangler secret put SUPABASE_JWT_SECRET --env development
wrangler secret put OPENAI_API_KEY --env development
wrangler secret put GOOGLE_VISION_API_KEY --env development
wrangler secret put APP_ENV --env development
```

### 🔷 Vercel Environment Variables

Set in **Vercel Dashboard** > **Your Project** > **Settings** > **Environment Variables**:

#### Production
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=https://guardianest.vercel.app
APP_ENV=production
```

#### Preview/Development
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-dev-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=https://guardianest-dev.vercel.app
APP_ENV=development
```

### 📱 Expo EAS Secrets

Set using EAS CLI:

```bash
# Production
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "https://your-project.supabase.co"
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
eas secret:create --scope project --name APP_ENV --value "production"

# Development (if using separate EAS project)
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "https://your-dev-project.supabase.co"
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
eas secret:create --scope project --name APP_ENV --value "development"
```

## Local Development Files

### 🖥️ Server (.dev.vars)

Create `apps/server/.dev.vars`:
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_JWT_SECRET=your-jwt-secret-here
OPENAI_API_KEY=sk-proj-...
GOOGLE_VISION_API_KEY=AIzaSy...
APP_ENV=development
```

### 🌐 Web App (.env.local)

Create `apps/web/.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=http://localhost:3000
APP_ENV=development
```

### 📱 Mobile App (.env.local)

Create `apps/mobile/.env.local`:
```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
APP_ENV=development
```

## How to Get These Values

### 🗄️ Supabase

1. **SUPABASE_URL**: Project Settings → API → Project URL
2. **SUPABASE_ANON_KEY**: Project Settings → API → Project API keys → `anon` `public`
3. **SUPABASE_SERVICE_ROLE_KEY**: Project Settings → API → Project API keys → `service_role` `secret`
4. **SUPABASE_JWT_SECRET**: Project Settings → API → JWT Settings → JWT Secret

### 🤖 OpenAI

1. Go to [OpenAI API Platform](https://platform.openai.com/)
2. Navigate to **API Keys** section
3. Click **Create new secret key**
4. Copy the key (starts with `sk-proj-...`)

### 👁️ Google Cloud Vision

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Enable **Cloud Vision API**
4. Go to **APIs & Services** → **Credentials**
5. Create **API Key** or **Service Account Key**

### 🚀 Deployment Tokens

#### Vercel
1. Go to [Vercel Account Settings](https://vercel.com/account/tokens)
2. Create a new token with appropriate scopes
3. Get **Team ID** from team settings (if using team account)
4. Get **Project ID** from project settings

#### Cloudflare
1. Go to [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Create token with **Cloudflare Workers:Edit** permissions
3. Get **Account ID** from the right sidebar of your dashboard

#### Expo
1. Go to [Expo Access Tokens](https://expo.dev/accounts/[account]/settings/access-tokens)
2. Create a new access token
3. Use with appropriate scopes for EAS builds

## Security Best Practices

### ✅ DO
- Use environment variables for all secrets
- Set different values for development/production
- Use `EXPO_PUBLIC_*` prefix only for client-safe values
- Rotate API keys regularly
- Monitor usage and set billing limits

### ❌ DON'T
- Commit secrets to version control
- Expose `SERVICE_ROLE_KEY` to client apps
- Use production keys in development
- Share API keys in plain text
- Leave unused API keys active

## Environment Validation

To verify your environment variables are set correctly, use these test commands:

### Server
```bash
cd apps/server
npm run dev
curl http://localhost:8787/health
```

### Web App
```bash
cd apps/web  
npm run dev
# Check browser console for connection errors
```

### Mobile App
```bash
cd apps/mobile
npm run dev
# Check Expo console for authentication errors
```

## Troubleshooting

### Common Issues

| Error | Solution |
|-------|----------|
| "Invalid API key" | Check key format and regenerate if needed |
| "Project not found" | Verify Supabase URL and project status |
| "Unauthorized" | Check service role key permissions |
| "CORS error" | Verify domain configuration in Supabase |
| "Build failed" | Check all required secrets are set |

### Debug Commands

```bash
# Check GitHub secrets (won't show values)
gh secret list

# Verify Cloudflare Worker vars
wrangler secret list

# Check EAS secrets
eas secret:list

# Verify Vercel env vars
vercel env ls
```

---

**⚠️ Important**: Never commit this file with actual secret values. This template should only contain placeholder examples.
