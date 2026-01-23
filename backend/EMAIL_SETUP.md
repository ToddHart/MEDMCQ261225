# Email Configuration Guide

## Overview

The MedMCQ application uses two separate email addresses for different purposes:

- **noreply@medmcq.com.au** - System emails (no-reply)
- **support@medmcq.com.au** - User-facing emails (replies expected)

## Email Types

### NoReply Email (noreply@)
Used for automated system emails where user replies are not expected:
- Email verification
- Password reset requests
- Qualifying session notifications

### Support Email (support@)
Used for user-facing communications where replies are expected:
- Contact form submissions (receives from users)
- Question report notifications (receives from users)
- Admin-to-user emails
- Admin email inbox/sent management

## Environment Variables

Add these to your `.env` file in the backend directory:

```bash
# SMTP Configuration
SMTP_HOST=smtp.zoho.com
SMTP_PORT=587

# NoReply Email (for system emails)
NOREPLY_EMAIL=noreply@medmcq.com.au
NOREPLY_PASSWORD=your_noreply_password_here

# Support Email (for user-facing emails)
SUPPORT_EMAIL=support@medmcq.com.au
SUPPORT_PASSWORD=your_support_password_here

# IMAP Configuration (for reading support inbox)
IMAP_HOST=imap.zoho.com
IMAP_PORT=993

# Application URL
APP_URL=https://your-app-url.com
```

## Email Provider Recommendations

### Current Usage: ~200 emails/week

For your current volume (<200 emails/week), here are the recommended providers:

### Option 1: **Gmail (Google Workspace) - RECOMMENDED** ⭐
**Cost:** $6 USD/user/month (~$9 AUD/month per email address)

**Pros:**
- Reliable SMTP/IMAP with no daily limits for Workspace accounts
- Excellent deliverability and spam protection
- Web interface for managing emails
- 30GB storage per user
- Easy setup and configuration
- Industry standard

**Cons:**
- Requires payment for Workspace (free Gmail has stricter limits)
- Need 2 accounts ($12/month total) for noreply@ and support@

**Setup:**
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
```

**Note:** You'll need to use App Passwords instead of regular passwords.

---

### Option 2: **AWS SES (Amazon Simple Email Service)** 💰
**Cost:** $0.10 per 1,000 emails sent (~$0.08/week = ~$0.30/month)

**Pros:**
- Extremely cheap for low volume
- Highly scalable (scales to millions)
- No monthly minimums
- Excellent deliverability with proper domain setup
- AWS infrastructure reliability

**Cons:**
- Requires AWS account and some technical setup
- No built-in inbox (sending only) - need separate IMAP service
- Requires domain verification and SPF/DKIM setup
- Steeper learning curve

**Best for:** If you only need sending capability and want the cheapest option. You'd still need a separate solution for the support@ inbox (could use Gmail free tier or Zoho free).

---

### Option 3: **SendGrid**
**Cost:** Free tier (100 emails/day), Paid starts at $19.95 USD/month

**Pros:**
- Free tier sufficient for your volume
- Good API and SMTP support
- Excellent deliverability
- Email analytics and tracking

**Cons:**
- No inbox (sending only)
- Free tier has SendGrid branding
- Need separate IMAP solution for support@

---

### Option 4: **Zoho Mail** (Current Solution)
**Free Tier:**
- 5 GB storage
- 25 MB attachment limit
- SMTP/IMAP access
- Web interface

**Limitations of Free Tier:**
- Limited to 5 users
- No advanced features
- May have rate limits

**Paid Tier ($1 USD/user/month):**
- 30 GB storage
- Full SMTP/IMAP access
- No rate limits
- Better support

**Recommendation:** If Zoho free is working, the paid tier at $2/month for 2 accounts is the cheapest full-featured option.

---

### Option 5: **Mailgun**
**Cost:** Free tier (1,000 emails/month), $35 USD/month for more

**Pros:**
- Free tier covers your needs
- Good API and SMTP
- Designed for developers

**Cons:**
- No inbox (sending only)
- Requires credit card even for free tier
- More complex setup

---

## Recommended Solution for MedMCQ

### Best Overall: **Zoho Mail Paid ($1/user/month × 2 = $2/month total)**

**Why:**
1. Already familiar with the platform
2. Cheapest full-featured solution
3. Both SMTP (sending) and IMAP (receiving) included
4. Web interface for managing emails
5. $24/year for complete email solution

**Alternative if budget allows: Gmail Workspace ($12 USD/month)**
- More reliable
- Better spam protection
- Industry standard
- Worth the extra $10/month for professional use

## Implementation Checklist

- [ ] Set up noreply@medmcq.com.au email account
- [ ] Set up support@medmcq.com.au email account
- [ ] Generate app-specific passwords (if using Gmail)
- [ ] Add all environment variables to .env file
- [ ] Test email verification (uses noreply@)
- [ ] Test password reset (uses noreply@)
- [ ] Test contact form (goes to support@)
- [ ] Test question reports (goes to support@)
- [ ] Test admin email sending (from support@)
- [ ] Verify admin can read support@ inbox
- [ ] Set up SPF, DKIM, and DMARC records for domain
- [ ] Monitor delivery rates and spam folder placement

## Admin Email Interface

The admin email interface (`/admin/email`) provides:
- **Inbox:** View all emails received at support@medmcq.com.au
- **Sent:** View all emails sent from support@medmcq.com.au
- **Compose:** Send emails to users
- **Reply:** Reply to incoming emails
- **Unread Count:** Badge showing unread messages

Access the admin email client at: `https://your-app-url.com/admin/email`

## Troubleshooting

### Emails not sending
1. Check environment variables are correct
2. Verify email credentials are valid
3. Check SMTP host and port
4. Enable "Less secure app access" or use app passwords
5. Check server logs for detailed error messages

### Emails going to spam
1. Set up SPF record for your domain
2. Set up DKIM signing
3. Set up DMARC policy
4. Warm up the email address gradually
5. Avoid spam trigger words in content

### Cannot read inbox
1. Verify IMAP credentials
2. Check IMAP host and port (usually 993 with SSL)
3. Enable IMAP access in email provider settings
4. Check firewall allows IMAP connections

## Security Best Practices

1. **Never commit .env file** - Already in .gitignore
2. **Use app-specific passwords** - Don't use main account passwords
3. **Rotate passwords regularly** - Every 3-6 months
4. **Monitor for unauthorized access** - Check login logs
5. **Use environment variables** - Never hardcode credentials
6. **Enable 2FA** - On email accounts
7. **Restrict SMTP/IMAP access** - IP allowlisting if possible

## Future Considerations

As your email volume grows:
- **<1,000 emails/month:** Current setup adequate
- **1,000-10,000 emails/month:** Consider SendGrid or AWS SES
- **10,000+ emails/month:** AWS SES or dedicated email service
- **Need advanced analytics:** SendGrid, Mailgun, or AWS SES with analytics

## Contact

For questions about email configuration, contact the development team.
