# DJ / Club Event Ticketing

A reusable, mobile-first ticketing website for DJ and club events. Customers pay by bank transfer, upload a receipt, and receive a ticket number by email after an administrator verifies the payment.

The site supports manual bank-transfer verification and optional PayHere checkout.

## Features

- Event landing page with configurable event, venue, bank, theme, and ticket details
- Bank-transfer checkout with receipt upload
- Optional PayHere sandbox/live checkout
- Client-side image compression for receipt images
- Private Supabase Storage for receipts
- Manual admin approval and rejection workflow
- Ticket email delivery through Gmail SMTP
- Customer order-status lookup
- Ticket number generation with configurable prefix
- Capacity limits and sales-open/closed controls
- Admin receipt preview through short-lived signed URLs
- Door check-in by ticket number, name, or email
- Partial check-in for multi-ticket orders
- Event-scoped data, so multiple events can reuse the same database

## Technology

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Postgres, Auth, and Storage
- `@supabase/ssr` and `@supabase/supabase-js`
- Nodemailer with Gmail SMTP
- Vercel-compatible server-side API routes

## Requirements

- Node.js 20 or newer
- npm
- A Supabase project
- A Gmail or Google Workspace account with 2-Step Verification and an App Password

## Developer setup

### 1. Install the project

```bash
npm install
```

### 2. Configure environment variables

Copy the example file:

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GMAIL_USER=tickets@example.com
GMAIL_APP_PASSWORD=your-16-character-app-password
NEXT_PUBLIC_SITE_URL=http://localhost:3000
PAYHERE_SANDBOX=true
PAYHERE_MERCHANT_ID=your-payhere-merchant-id
PAYHERE_MERCHANT_SECRET=your-payhere-merchant-secret
PAYHERE_NOTIFY_URL=https://your-public-domain.example/api/payhere/notify
```

The following variables are server-only and must never be renamed with a `NEXT_PUBLIC_` prefix:

- `SUPABASE_SERVICE_ROLE_KEY`
- `GMAIL_USER`
- `GMAIL_APP_PASSWORD`

Never commit `.env.local`.

For local PayHere testing, `PAYHERE_NOTIFY_URL` must be a publicly reachable HTTPS
URL. PayHere cannot send notifications to `localhost`; use a deployed preview URL
or an HTTPS tunnel. Keep the merchant secret server-only.

### 3. Configure Supabase

1. Open the Supabase project SQL Editor.
2. Run [`supabase/migrations/001_initial.sql`](./supabase/migrations/001_initial.sql).
3. Confirm that the `receipts` Storage bucket is private.
4. Run [`supabase/migrations/002_payhere.sql`](./supabase/migrations/002_payhere.sql)
   if PayHere checkout will be enabled.
5. Create an Auth user with email and password.
6. Add that user's UUID to the admin table:

   ```sql
   insert into public.admins (user_id)
   values ('AUTH_USER_UUID');
   ```

7. Disable public signups in Supabase Auth settings.

The migration creates:

- `orders`
- `admins`
- Row Level Security policies
- The private `receipts` bucket
- Storage policies for public upload and admin-only reads

If checkout reports that receipt storage or the database is not configured, run the
entire migration in the Supabase SQL Editor. The storage bucket and database tables
must be created in the same Supabase project referenced by `NEXT_PUBLIC_SUPABASE_URL`.

### 4. Configure the event

All event-specific values belong in [`config/event.ts`](./config/event.ts). Do not hardcode event information in pages, API routes, metadata, or emails.

At minimum, replace:

- `eventId`
- `eventName`
- `tagline`
- `date`
- `doorsOpenTime`
- `venueName`
- `venueAddress`
- Bank details
- Support contact details
- `emailSubject`
- `emailFooterNote`

The `eventId` must be a new unique slug for every new event.

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 6. Build for production

```bash
npm run build
npm run start
```

## Project structure

```text
app/
  page.tsx                  Public event landing page
  buy/page.tsx              Ticket purchase form
  status/page.tsx           Customer order lookup
  confirmation/page.tsx     Post-submission confirmation
  admin/login/page.tsx      Admin login
  admin/orders/page.tsx     Verification dashboard
  admin/checkin/page.tsx    Door check-in dashboard
  api/                      Server-side order and admin APIs
components/                 Shared UI components
config/event.ts             Single source of event-specific configuration
lib/
  email.ts                  Config-driven ticket email delivery
  validation.ts              Shared input validation
  supabase/                  Browser, server, and service-role clients
supabase/migrations/        Database schema and RLS migration
```

## User guide

### Buying a ticket

1. Open the event website.
2. Read the bank-transfer instructions.
3. Transfer the ticket total to the configured bank account.
4. Select **Buy ticket**.
5. Enter your full name, email, phone number, ticket quantity, and bank reference.
6. Upload the payment receipt as a JPG, PNG, WEBP, or PDF under 5 MB.
7. Submit the order.

The order remains pending until an administrator verifies the payment. After approval, the ticket number is sent to the submitted email address. Customers should check their spam folder.

### PayHere checkout

When PayHere is selected, the site creates a pending order and redirects the
customer to PayHere. The order is approved automatically only after the
server-side `/api/payhere/notify` route verifies PayHere's notification hash,
currency, and amount. Sandbox credentials and the live credentials are separate.

Set `PAYHERE_SANDBOX=true` while testing. After creating a sandbox merchant,
copy its merchant ID and secret into `.env.local`, configure the public
`PAYHERE_NOTIFY_URL`, and run migration 002. Never expose the merchant secret
with a `NEXT_PUBLIC_` prefix.

### Checking order status

Open `/status` and enter the same email address used when buying the ticket. The page shows pending, approved, or rejected orders. Approved orders include the ticket number.

### At the entrance

Show the ticket email and ticket number to door staff. Staff may search using the ticket number, name, or email address.

## Admin guide

### Signing in

Open `/admin/login` and sign in with a Supabase Auth user that is listed in `public.admins`.

Creating an Auth user alone does not grant admin access. The user's ID must also exist in `public.admins`.

### Verifying orders

1. Open `/admin/orders`.
2. Select the **Pending** tab.
3. Review the customer details, bank reference, submission time, and uploaded receipt.
4. Use **Receipt** to open a temporary signed URL.
5. Watch for duplicate bank-reference warnings.
6. Select **Approve** or **Reject**.
7. If approval email delivery fails, the order remains approved and **Resend email** can be used later.

Rejected orders may include an optional reason, which is emailed to the customer.

### Checking in customers

1. Open `/admin/checkin`.
2. Search by ticket number, name, or email.
3. Ticket-number searches accept different capitalization and tolerate missing spaces or dashes.
4. For a multi-ticket order, select the number of tickets being used.
5. Select **Check in**.

The page displays approved, checked-in, and remaining ticket counters. A customer who has already used all tickets receives a clear warning.

## Gmail App Password

The normal Gmail password cannot be used for SMTP.

1. Sign in to the Google account that will send ticket emails.
2. Open [Google Account Security](https://myaccount.google.com/security).
3. Enable 2-Step Verification.
4. Open **App passwords**.
5. Create an app password named something like `DJ Ticket Website`.
6. Copy the generated 16-character value into `GMAIL_APP_PASSWORD`.

Use a dedicated event email account where possible. Do not commit the App Password or share it publicly.

## Vercel deployment

1. Push the project to a Git provider.
2. Import the repository into Vercel.
3. Add all five variables from `.env.example` in Vercel Project Settings → Environment Variables.
4. Deploy.
5. Confirm the production URL can:
   - Load the homepage
   - Submit an order
   - Open the status page
   - Sign in as an admin
   - Send an approval email

Use separate Supabase projects and Gmail accounts for development and production when possible.

## Reusing the site for a new event

No SQL changes are needed.

1. Open [`config/event.ts`](./config/event.ts).
2. Change `eventId` to a new unique slug, for example:

   ```ts
   eventId: "neon-night-2027"
   ```

3. Replace the event name, tagline, date, doors time, venue, address, map link, and theme.
4. Replace the ticket price, currency, ticket prefix, capacity, and bank-transfer instructions.
5. Replace the support contacts and email footer text.
6. Set `salesOpen` to `true`.
7. Run a production build.
8. Redeploy to Vercel.

Existing orders remain in the database because every order is stored with its original `event_id`. Public pages, admin pages, counters, check-in searches, and API routes only use the current event configuration.

## Pre-launch checklist

### Configuration

- [ ] All `REPLACE_ME` values have been replaced in [`config/event.ts`](./config/event.ts).
- [ ] `eventId` is unique for this event.
- [ ] `ticketPrefix` is correct.
- [ ] `salesOpen` has the intended value.
- [ ] `totalCapacity` is correct or intentionally unset.
- [ ] Bank account details have been checked.
- [ ] Support email and phone number are correct.

### Supabase and security

- [ ] The SQL migration has been run.
- [ ] The `receipts` bucket is private.
- [ ] Public signups are disabled.
- [ ] At least one admin Auth user exists.
- [ ] The admin user is present in `public.admins`.
- [ ] The service-role key is only in server environment variables.
- [ ] `.env.local` is not committed.

### Functional testing

- [ ] Submit a valid order.
- [ ] Reject invalid email input.
- [ ] Reject unsupported receipt files.
- [ ] Reject receipts over 5 MB.
- [ ] Confirm receipt upload works.
- [ ] Confirm duplicate bank references show a warning.
- [ ] Confirm capacity limits block excess orders.
- [ ] Approve an order and confirm the email arrives.
- [ ] Confirm the ticket number appears in the status lookup.
- [ ] Test email failure and **Resend email**.
- [ ] Reject an order with a reason.
- [ ] Search check-in using a ticket number with and without dashes.
- [ ] Test partial check-in for a multi-ticket order.
- [ ] Test attempting to check in the same ticket twice.

## Important security notes

- Never expose `SUPABASE_SERVICE_ROLE_KEY` to browser code.
- Never expose `GMAIL_APP_PASSWORD` to browser code.
- Do not make the `receipts` bucket public.
- Do not add public `SELECT` policies to `orders`.
- Status lookup intentionally returns only minimal order information.
- Admin API routes verify both the Supabase session and membership in `public.admins`.
