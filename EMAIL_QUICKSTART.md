# Email Setup - Quick Start Guide

## What You Need

To get emails working in MedMCQ, you need:

1. **Two email addresses:**
   - `noreply@medmcq.com.au` - For system emails (verification, password reset)
   - `support@medmcq.com.au` - For user emails (contact form, reports)

2. **Their passwords**

3. **5 minutes** to configure

---

## Step-by-Step Setup

### Step 1: Set Up Your Email Accounts

You have two options:

#### **Option A: Zoho Mail (Recommended - Cheapest)**
- **Free tier:** Works but has limits
- **Paid tier:** $1/month per email = $2/month total
- Sign up at: https://www.zoho.com/mail/

#### **Option B: Gmail (Google Workspace)**
- **Cost:** $6/month per email = $12/month total
- More reliable, better spam protection
- Sign up at: https://workspace.google.com/

### Step 2: Create a .env File

1. Go to the `backend` folder in your project
2. Copy the file `.env.example` and rename it to `.env`
3. Open the `.env` file in a text editor

### Step 3: Fill In Your Email Credentials

Edit your `.env` file with your actual credentials:

```bash
# SMTP Configuration
SMTP_HOST=smtp.zoho.com
SMTP_PORT=587

# NoReply Email
NOREPLY_EMAIL=noreply@medmcq.com.au
NOREPLY_PASSWORD=your_actual_noreply_password

# Support Email
SUPPORT_EMAIL=support@medmcq.com.au
SUPPORT_PASSWORD=your_actual_support_password

# IMAP Configuration (for inbox)
IMAP_HOST=imap.zoho.com
IMAP_PORT=993

# Your app URL
APP_URL=https://medmcq.com.au
```

**If using Gmail instead of Zoho:**
```bash
SMTP_HOST=smtp.gmail.com
IMAP_HOST=imap.gmail.com
```

**Important for Gmail:** You must use "App Passwords" instead of your regular password.
- Generate at: https://myaccount.google.com/apppasswords
- Select "Mail" and "Other (Custom name)"
- Copy the 16-character password

### Step 4: Deploy the Configuration

#### If using Emergent:
1. Open Emergent dashboard
2. Go to Settings → Environment Variables
3. Add each variable from your `.env` file:
   - `SMTP_HOST` = `smtp.zoho.com`
   - `SMTP_PORT` = `587`
   - `NOREPLY_EMAIL` = `noreply@medmcq.com.au`
   - `NOREPLY_PASSWORD` = `your_password`
   - `SUPPORT_EMAIL` = `support@medmcq.com.au`
   - `SUPPORT_PASSWORD` = `your_password`
   - `IMAP_HOST` = `imap.zoho.com`
   - `IMAP_PORT` = `993`
   - `APP_URL` = `https://your-site.com`
4. Save and redeploy

#### If using another hosting platform:
- Add the environment variables in your platform's dashboard
- Redeploy your application

### Step 5: Test It!

Test each email function in your app:

1. **Email Verification:**
   - Create a new user account
   - Check if verification email arrives

2. **Password Reset:**
   - Click "Forgot Password"
   - Check if reset email arrives

3. **Contact Form:**
   - Submit the contact form
   - Check if email arrives at `support@medmcq.com.au`

4. **Admin Email Inbox:**
   - Login as admin
   - Go to `/admin/email`
   - Verify you can see inbox messages

---

## Troubleshooting

### ❌ Emails Not Sending

**Check these:**
1. Are your email credentials correct?
2. Did you save the `.env` file?
3. Did you redeploy after adding environment variables?
4. Check the server logs for error messages

**For Gmail users:**
- Make sure you're using an App Password, not your regular password
- Enable "Less secure app access" if using regular password (not recommended)

**For Zoho users:**
- Make sure SMTP/IMAP is enabled in Zoho settings
- Try logging into Zoho webmail to verify the account works

### ❌ Emails Going to Spam

This is normal initially. To fix:
1. Ask recipients to mark as "Not Spam"
2. Set up SPF and DKIM records (see full EMAIL_SETUP.md)
3. Send emails gradually to build reputation

### ❌ Cannot Read Support Inbox

**Check:**
1. Is `IMAP_HOST` and `IMAP_PORT` correct?
2. Is IMAP enabled in your email provider settings?
3. Are your `SUPPORT_EMAIL` and `SUPPORT_PASSWORD` correct?

---

## Cost Summary

### Zoho Mail (Recommended)
- **Free tier:** $0/month (limited)
- **Paid tier:** $2/month for both emails
- **Annual cost:** $24/year

### Gmail (Google Workspace)
- **Cost:** $12/month for both emails
- **Annual cost:** $144/year

### AWS SES (Technical)
- **Cost:** ~$0.30/month
- **Note:** Sending only, need separate inbox solution

---

## Need More Help?

- **Full documentation:** See `backend/EMAIL_SETUP.md`
- **Email service code:** See `backend/email_service.py`
- **Issues?** Create a GitHub issue

---

## Security Reminder

🔒 **NEVER commit your `.env` file to GitHub!**

The `.env` file contains your passwords and is automatically ignored by git (it's in `.gitignore`). Always keep it private!

---

That's it! Your emails should now be working. 🎉
