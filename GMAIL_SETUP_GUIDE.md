# Gmail Free Setup Guide - MedMCQ Email Configuration

## 🎯 What You're Setting Up

**2 Free Gmail Accounts:**
1. `medmcqnoreply@gmail.com` - For system emails (verification, password reset)
2. `medmcqsupport@gmail.com` - For support emails (contact form, reports)

**Cost:** $0/month (completely free!)

**What you get:**
- ✅ Full SMTP (sending) support
- ✅ Full IMAP (receiving) support
- ✅ 15 GB storage per account
- ✅ Reliable and professional
- ✅ Easy to upgrade to custom domain later

---

## 📝 Step-by-Step Setup (20 minutes)

### **Step 1: Create Gmail Account #1 (NoReply)**

1. Go to: https://accounts.google.com/signup
2. Fill in the form:
   - **First name:** MedMCQ
   - **Last name:** NoReply
   - **Username:** `medmcqnoreply` (or similar if taken)
   - **Password:** Create a strong password and save it!
3. Complete the verification (phone number, etc.)
4. Skip optional steps
5. **Write down:**
   - Email: `medmcqnoreply@gmail.com`
   - Password: `[your password]`

---

### **Step 2: Create Gmail Account #2 (Support)**

1. Go to: https://accounts.google.com/signup
2. Fill in the form:
   - **First name:** MedMCQ
   - **Last name:** Support
   - **Username:** `medmcqsupport` (or similar if taken)
   - **Password:** Create a strong password and save it!
3. Complete the verification
4. Skip optional steps
5. **Write down:**
   - Email: `medmcqsupport@gmail.com`
   - Password: `[your password]`

---

### **Step 3: Generate App Passwords (Required for Security)**

Google requires "App Passwords" for apps to access Gmail via SMTP/IMAP.

#### **For Account #1 (medmcqnoreply@gmail.com):**

1. Sign in to: https://myaccount.google.com/
2. Go to **Security** → **2-Step Verification**
   - If not enabled, click **Get Started** and set it up (required!)
3. Once 2-Step Verification is on, go back to **Security**
4. Scroll down to **App passwords**
5. Click **App passwords**
6. Select:
   - **App:** Mail
   - **Device:** Other (Custom name)
   - **Name:** MedMCQ NoReply
7. Click **Generate**
8. **Copy the 16-character password** (looks like: `abcd efgh ijkl mnop`)
9. **SAVE THIS PASSWORD!** You'll need it for Emergent.

#### **For Account #2 (medmcqsupport@gmail.com):**

1. Sign out and sign in to: https://myaccount.google.com/ with `medmcqsupport@gmail.com`
2. Repeat the same process:
   - Enable 2-Step Verification (if not already on)
   - Go to **App passwords**
   - Select Mail → Other → Name: MedMCQ Support
   - Click **Generate**
   - **Copy the 16-character password**
   - **SAVE THIS PASSWORD!**

---

### **Step 4: Enable IMAP in Both Gmail Accounts**

#### **For medmcqnoreply@gmail.com:**
1. Sign in to Gmail: https://mail.google.com
2. Click the **gear icon** (top right) → **See all settings**
3. Go to **Forwarding and POP/IMAP** tab
4. Under **IMAP access**, select **Enable IMAP**
5. Click **Save Changes**

#### **For medmcqsupport@gmail.com:**
1. Sign out and sign in with `medmcqsupport@gmail.com`
2. Repeat: Gear icon → Settings → Forwarding and POP/IMAP
3. **Enable IMAP**
4. Click **Save Changes**

---

### **Step 5: Add to Emergent Environment Variables**

1. Log in to your **Emergent** dashboard
2. Go to your app → **Settings** → **Environment Variables**
3. Add the following variables (click **Add Variable** for each):

```
SMTP_HOST
smtp.gmail.com

SMTP_PORT
587

NOREPLY_EMAIL
medmcqnoreply@gmail.com

NOREPLY_PASSWORD
[paste your 16-char App Password for noreply account]

SUPPORT_EMAIL
medmcqsupport@gmail.com

SUPPORT_PASSWORD
[paste your 16-char App Password for support account]

IMAP_HOST
imap.gmail.com

IMAP_PORT
993

APP_URL
https://medmcq.com.au
```

**IMPORTANT:**
- Use the **App Passwords** (16 characters), NOT your regular Gmail passwords!
- Remove any spaces from the App Passwords when pasting

4. Click **Save** after adding all variables

---

### **Step 6: Redeploy Your App**

1. In Emergent, click **Redeploy**
2. Wait 2-3 minutes for the build to complete
3. Your emails are now configured! ✅

---

## ✅ **Testing Your Email Setup**

### **Test 1: Email Verification (uses noreply@)**
1. Go to your app and create a new user account
2. Check the inbox of the email you registered with
3. You should receive a verification email from `medmcqnoreply@gmail.com`
4. ✅ If you got the email, verification works!

### **Test 2: Password Reset (uses noreply@)**
1. On the login page, click "Forgot Password"
2. Enter your email
3. Check your inbox
4. You should receive a password reset email from `medmcqnoreply@gmail.com`
5. ✅ If you got the email, password reset works!

### **Test 3: Contact Form (goes to support@)**
1. Go to the contact page on your app
2. Fill out the contact form
3. Submit it
4. Sign in to Gmail at https://mail.google.com with `medmcqsupport@gmail.com`
5. You should see the contact form submission in your inbox
6. ✅ If you got the email, contact form works!

### **Test 4: Admin Email Inbox (reads from support@)**
1. Login to your app as admin
2. Go to `/admin/email`
3. You should see the inbox with emails from `medmcqsupport@gmail.com`
4. ✅ If you can see emails, admin inbox works!

---

## 📊 **What Each Email Does**

### **medmcqnoreply@gmail.com** (System Emails - Automated)
- ✉️ Email verification when users sign up
- ✉️ Password reset requests
- ✉️ Qualifying session notifications
- 📤 **Sending only** (users shouldn't reply)

### **medmcqsupport@gmail.com** (Support Emails - Interactive)
- 📥 Receives contact form submissions from users
- 📥 Receives question report notifications
- 📤 Send emails to users from admin panel
- 📬 **Full inbox** - you can read and reply

---

## 🔧 **Troubleshooting**

### ❌ "Authentication failed" error

**Fix:**
1. Make sure you're using **App Passwords**, not regular Gmail passwords
2. Remove any spaces from the App Password
3. Verify 2-Step Verification is enabled on both accounts
4. Regenerate App Passwords if needed

### ❌ Emails not sending

**Check:**
1. Are the environment variables saved in Emergent?
2. Did you redeploy after adding variables?
3. Are the App Passwords correct (no spaces)?
4. Check Emergent logs for error messages

### ❌ Emails going to spam

**Solutions:**
1. Ask recipients to mark as "Not Spam"
2. Gmail free accounts are sometimes flagged initially
3. Send a few emails manually from the Gmail web interface first to "warm up" the account
4. When you commercialize, upgrade to Gmail Workspace with your domain

### ❌ Cannot read inbox in admin panel

**Check:**
1. Is IMAP enabled in Gmail settings?
2. Is `IMAP_HOST=imap.gmail.com` and `IMAP_PORT=993`?
3. Is the App Password for support@ correct?
4. Try regenerating the App Password

---

## 💰 **Cost Breakdown**

**Current Setup:**
- medmcqnoreply@gmail.com: **FREE**
- medmcqsupport@gmail.com: **FREE**
- **Total: $0/month** ✅

**When You Commercialize (Optional Upgrade):**
- Gmail Workspace with custom domain: $12/month for both emails
- Emails will come from `noreply@medmcq.com.au` and `support@medmcq.com.au`
- More professional appearance

---

## 📋 **Quick Checklist**

- [ ] Created `medmcqnoreply@gmail.com`
- [ ] Created `medmcqsupport@gmail.com`
- [ ] Enabled 2-Step Verification on both accounts
- [ ] Generated App Password for noreply@
- [ ] Generated App Password for support@
- [ ] Enabled IMAP on both accounts
- [ ] Added all environment variables to Emergent
- [ ] Redeployed app
- [ ] Tested email verification
- [ ] Tested password reset
- [ ] Tested contact form
- [ ] Tested admin email inbox

---

## 🎯 **Summary**

You now have:
- ✅ Fully functional email system
- ✅ 2 Gmail accounts (free)
- ✅ SMTP + IMAP support
- ✅ Separate emails for system vs support
- ✅ Admin inbox to manage support emails
- ✅ $0/month cost

**Everything is ready to go!** 🚀

---

## 📞 **Need Help?**

If you run into issues:
1. Check the troubleshooting section above
2. Verify all environment variables are correct
3. Check Emergent deployment logs
4. Regenerate App Passwords if authentication fails

**Your email system is now configured!** Test it by creating a new user account and checking for the verification email.
