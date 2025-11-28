# Newsletter Subscription Setup Guide

## Overview
This guide will help you set up the "Stay Informed" newsletter subscription form to:
1. Store email addresses in Supabase
2. Send you email notifications at **cojovi@icloud.com** when someone subscribes

---

## Part 1: Supabase Project Setup (5 minutes)

### 1. Create Supabase Account & Project
1. Go to [https://supabase.com](https://supabase.com)
2. Sign up (free tier is perfect for this)
3. Click "New Project"
4. Fill in:
   - **Name**: northstar-news (or whatever you want)
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to your users
5. Click "Create new project" (takes ~2 minutes)

### 2. Create the Database Table

Once your project is ready:

1. Click on **"SQL Editor"** in the left sidebar
2. Click **"New Query"**
3. Paste this SQL and click **"Run"**:

```sql
-- Create newsletter subscriptions table
CREATE TABLE newsletter_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  source TEXT DEFAULT 'homepage',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for faster lookups
CREATE INDEX idx_newsletter_email ON newsletter_subscriptions(email);

-- Enable Row Level Security (RLS)
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (subscribe)
CREATE POLICY "Allow public to subscribe"
ON newsletter_subscriptions
FOR INSERT
TO anon
WITH CHECK (true);

-- Only authenticated users can read (for your admin use)
CREATE POLICY "Only authenticated users can view subscriptions"
ON newsletter_subscriptions
FOR SELECT
TO authenticated
USING (true);
```

4. You should see "Success. No rows returned"

### 3. Get Your API Keys

1. Click on **"Settings"** (gear icon) in the left sidebar
2. Click **"API"** under Project Settings
3. You'll see:
   - **Project URL** (starts with https://...)
   - **anon public** key (long string starting with eyJ...)

Keep this page open - you'll need these values next!

---

## Part 2: Configure Your Local Environment (2 minutes)

### 1. Create .env File

In your project root, create a file named `.env`:

```bash
# Create the file
touch .env
```

### 2. Add Your Supabase Credentials

Open `.env` and paste (replace with YOUR actual values from Supabase):

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Add .env to .gitignore

Make sure `.env` is in your `.gitignore`:

```bash
echo ".env" >> .gitignore
```

---

## Part 3: Email Notifications Setup (10 minutes)

Now let's set up automatic email notifications to **cojovi@icloud.com** when someone subscribes.

### Option A: Supabase Webhook (Recommended - Easiest)

#### 1. Set Up Webhook Service

We'll use **Zapier** or **Make.com** (both have free tiers):

**Using Zapier (Free - 100 tasks/month):**

1. Go to [https://zapier.com](https://zapier.com) and sign up
2. Click "Create Zap"
3. **Trigger:**
   - Search for "Webhooks by Zapier"
   - Choose "Catch Hook"
   - Copy the webhook URL they give you
4. **Action:**
   - Search for "Email by Zapier"
   - Choose "Send Outbound Email"
   - To Email: `cojovi@icloud.com`
   - Subject: `New Newsletter Subscription - Northstar Ledger`
   - Body:
     ```
     New subscriber!

     Email: {{email}}
     Subscribed At: {{subscribed_at}}
     Source: {{source}}
     ```
5. Click "Publish"

#### 2. Connect Supabase to Webhook

Back in Supabase:

1. Go to **"Database"** → **"Webhooks"** in the left sidebar
2. Click **"Enable Webhooks"** (if needed)
3. Click **"Create a new hook"**
4. Fill in:
   - **Name**: newsletter-notification
   - **Table**: newsletter_subscriptions
   - **Events**: Check only "Insert"
   - **Type**: HTTP Request
   - **HTTP Request**:
     - **Method**: POST
     - **URL**: Paste your Zapier webhook URL
     - **HTTP Headers**: `Content-Type: application/json`
5. Click **"Create webhook"**

#### 3. Test It!

1. Run your dev server: `npm run dev`
2. Go to homepage
3. Enter an email in the "Stay Informed" box
4. Click Subscribe
5. Check your email at cojovi@icloud.com - you should get a notification!

---

### Option B: Supabase Edge Function (More Control)

If you want more control over the email format:

#### 1. Create Edge Function

In Supabase dashboard:
1. Click **"Edge Functions"** in sidebar
2. Click **"Create a new function"**
3. Name it: `notify-new-subscriber`
4. Paste this code:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  try {
    const { record } = await req.json()

    // Send email using any email service (SendGrid, Resend, etc.)
    // For now, we'll use a simple HTTP request to a service like FormSubmit

    const emailData = {
      to: 'cojovi@icloud.com',
      subject: 'New Newsletter Subscription - Northstar Ledger',
      message: `
        New subscriber!

        Email: ${record.email}
        Subscribed At: ${record.subscribed_at}
        Source: ${record.source}
      `
    }

    // You can integrate with any email service here
    console.log('New subscription:', emailData)

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
```

#### 2. Create Database Trigger

In SQL Editor, run:

```sql
CREATE OR REPLACE FUNCTION notify_new_subscription()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://your-project-ref.supabase.co/functions/v1/notify-new-subscriber',
    body := json_build_object('record', NEW)::text,
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_newsletter_subscription
  AFTER INSERT ON newsletter_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_subscription();
```

---

## Part 4: Testing (2 minutes)

### 1. Start Dev Server
```bash
npm run dev
```

### 2. Test the Form
1. Open http://localhost:5173
2. Scroll to the "Stay Informed" box
3. Enter a test email
4. Click "Subscribe"
5. You should see "Thanks for subscribing!"

### 3. Verify in Supabase
1. Go to Supabase → **"Table Editor"**
2. Click **newsletter_subscriptions**
3. You should see your test email!

### 4. Check Email Notification
- Check cojovi@icloud.com for notification email

---

## Part 5: View Your Subscribers

### Anytime you want to see who subscribed:

1. Go to Supabase dashboard
2. Click **"Table Editor"**
3. Click **newsletter_subscriptions**
4. See all subscribers with timestamps

### Export to CSV:
1. Click the **"..."** menu at top right
2. Click **"Export to CSV"**
3. Download your subscriber list

---

## Troubleshooting

### "Something went wrong" error
- Check browser console for errors
- Verify your .env file has correct credentials
- Make sure Supabase table exists

### No email notification received
- Check Zapier task history for errors
- Verify webhook URL is correct in Supabase
- Check spam folder

### "Email already subscribed"
- This is working correctly - prevents duplicates
- You can delete the test entry in Supabase to try again

---

## Production Deployment

### When deploying to Netlify/Vercel:

1. Add environment variables in your hosting dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

2. These will be automatically loaded in production

---

## Security Notes

✅ **Safe to expose:**
- Supabase Project URL
- Anon key (public key designed for client-side use)

❌ **Never expose:**
- Service role key (keep this secret!)
- Database password

The anon key is safe because:
- It respects Row Level Security (RLS) policies
- Can only do what you allow in RLS policies
- In our case, only allows INSERT to subscriptions table

---

## Cost

**100% Free for:**
- Up to 50,000 rows (email subscriptions)
- Up to 500 MB database
- Unlimited API requests
- 2 GB file storage
- 2 GB bandwidth

You'd need 50,000 subscribers before hitting any limits!

---

## Questions?

If something doesn't work:
1. Check browser console for errors
2. Check Supabase logs in Dashboard → Logs
3. Verify all credentials are correct
4. Make sure table exists and has correct structure
