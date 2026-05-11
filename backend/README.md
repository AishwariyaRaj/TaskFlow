# SaaS MERN Backend

This folder contains the Express/MongoDB backend for the multi-tenant task management SaaS.

Quick start

1. Copy `.env.example` to `.env` and fill values.
2. Install dependencies: `npm install` (run in `backend`)
3. Start in dev: `npm run dev`

Design notes
- Multi-tenancy: models include a `workspace` field and `User.memberships` tracks roles.
- Auth: JWT access + refresh tokens. Refresh tokens persisted on user document.
- RBAC: middleware checks membership role per workspace.
- Real-time: Socket.io rooms by workspace.

Stripe Test Mode subscriptions

1. Create Stripe Prices (test mode)
   - Option A: run `node setup-stripe.js` (creates Products + Prices and updates `.env`)
   - Option B: create prices in the Stripe Dashboard and set:
     - `STRIPE_SECRET` (must start with `sk_test_`)
     - `STRIPE_PRICE_PRO`
     - `STRIPE_PRICE_TEAM`

2. Configure Stripe Webhook (test mode)
   - Install Stripe CLI and login: `stripe login`
   - Start webhook forwarder: `stripe listen --forward-to localhost:4000/api/webhooks/stripe`
   - Copy the webhook signing secret into `STRIPE_WEBHOOK_SECRET` (starts with `whsec_`)

3. Run backend + frontend and upgrade a workspace from the Billing page
   - Workspace plan is stored on `Workspace.plan` as `FREE`, `PRO`, or `TEAM`
   - Premium routes (analytics + file uploads) are blocked for `FREE` workspaces
