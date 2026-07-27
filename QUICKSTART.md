# Guardian AI — Quick Start in Cursor

## 1. Open in Cursor
File → Open Folder → select the `guardian-ai` folder

## 2. Open Terminal
Press Ctrl+` (Windows/Linux) or Cmd+` (Mac)

## 3. Install dependencies
```bash
npm install
```

## 4. Set up environment variables
```bash
cp .env.example .env.local
```
Open `.env.local` and fill in your keys from:
- Supabase: supabase.com → Project → Settings → API
- Stripe: dashboard.stripe.com → Developers → API Keys

## 5. Run Supabase schema
Go to supabase.com → SQL Editor → run `supabase/schema.sql` then `supabase/subscription_schema.sql`

## 6. Create Stripe products (in terminal)
```bash
STRIPE_SECRET_KEY=sk_test_... npm run stripe:setup
```
Copy the price IDs output into `.env.local`

## 7. Start webhook listener (new terminal tab)
```bash
npm run stripe:listen
```
Copy the `whsec_...` into `.env.local`

## 8. Run the app
```bash
npm run dev
```
Open http://localhost:3000

## 9. Create your account
Visit http://localhost:3000/signup

## 10. Deploy to Vercel
```bash
npm install -g vercel
vercel login
vercel --prod
```
Then add all .env.local variables in Vercel dashboard → Settings → Environment Variables

---
Full deployment guide: DEPLOY.md
Stripe setup guide: STRIPE_SETUP.md
