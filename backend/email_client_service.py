"""
Email Client Service for MedMCQ Admin
Full IMAP/SMTP client for support@medmcq.com.au
"""

import imaplib
import smtplib
import ssl
import email
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.header import decode_header
from email.utils import parsedate_to_datetime, formatdate
import os
import logging
from pathlib import Path
from dotenv import load_dotenv
from datetime import datetime
from typing import List, Dict, Optional
import re

# Load environment variables
load_dotenv(Path(__file__).parent / '.env')

logger = logging.getLogger(__name__)

# Email configuration
IMAP_HOST = os.environ.get('IMAP_HOST', 'imap.zoho.com')
IMAP_PORT = int(os.environ.get('IMAP_PORT', '993'))
SMTP_HOST = os.environ.get('SMTP_HOST', 'smtp.zoho.com')
SMTP_PORT = int(os.environ.get('SMTP_PORT', '587'))
SUPPORT_EMAIL = os.environ.get('SUPPORT_EMAIL', 'support@medmcq.com.au')
SUPPORT_PASSWORD = os.environ.get('SUPPORT_EMAIL_PASSWORD', '')


def decode_email_header(header_value):
    """Decode email header handling various encodings"""
    if not header_value:
        return ""
    
    decoded_parts = []
    for part, charset in decode_header(header_value):
        if isinstance(part, bytes):
            try:
                decoded_parts.append(part.decode(charset or 'utf-8', errors='replace'))
            except:
                decoded_parts.append(part.decode('utf-8', errors='replace'))
        else:
            decoded_parts.append(part)
    return ' '.join(decoded_parts)


def get_email_body(msg):
    """Extract plain text body from email message"""
    body = ""
    
    if msg.is_multipart():
        for part in msg.walk():
            content_type = part.get_content_type()
            content_disposition = str(part.get("Content-Disposition", ""))
            
            # Skip attachments
            if "attachment" in content_disposition:
                continue
            
            if content_type == "text/plain":
                try:
                    charset = part.get_content_charset() or 'utf-8'
                    payload = part.get_payload(decode=True)
                    if payload:
                        body = payload.decode(charset, errors='replace')
                        break
                except Exception as e:
                    logger.error(f"Error decoding email part: {e}")
            elif content_type == "text/html" and not body:
                # Fallback to HTML if no plain text
                try:
                    charset = part.get_content_charset() or 'utf-8'
                    payload = part.get_payload(decode=True)
                    if payload:
                        html_body = payload.decode(charset, errors='replace')
                        # Strip HTML tags for plain text
                        body = re.sub(r'<[^>]+>', '', html_body)
                        body = re.sub(r'\s+', ' ', body).strip()
                except Exception as e:
                    logger.error(f"Error decoding HTML part: {e}")
    else:
        try:
            charset = msg.get_content_charset() or 'utf-8'
            payload = msg.get_payload(decode=True)
            if payload:
                body = payload.decode(charset, errors='replace')
        except Exception as e:
            logger.error(f"Error decoding email body: {e}")
    
    return body.strip()


def parse_email_address(addr_string):
    """Parse email address from header"""
    if not addr_string:
        return {"name": "", "email": ""}
    
    # Handle "Name <email@domain.com>" format
    match = re.match(r'^(.*?)\s*<(.+?)>$', addr_string.strip())
    if match:
        name = match.group(1).strip().strip('"\'')
        email_addr = match.group(2).strip()
    else:
        name = ""
        email_addr = addr_string.strip()
    
    return {"name": name, "email": email_addr}


def fetch_emails(folder: str = "INBOX", limit: int = 50) -> List[Dict]:
    """
    Fetch emails from specified folder
    
    Args:
        folder: INBOX or Sent
        limit: Maximum number of emails to fetch
    
    Returns:
        List of email dictionaries
    """
    if not SUPPORT_PASSWORD:
        logger.error("Support email password not configured")
        return []
    
    emails = []
    
    try:
        # Connect to IMAP
        context = ssl.create_default_context()
        mail = imaplib.IMAP4_SSL(IMAP_HOST, IMAP_PORT, ssl_context=context)
        mail.login(SUPPORT_EMAIL, SUPPORT_PASSWORD)
        
        # Select folder (Zoho uses "Sent" for sent items)
        folder_name = folder if folder == "INBOX" else "Sent"
        status, messages = mail.select(folder_name, readonly=True)
        
        if status != 'OK':
            logger.error(f"Failed to select folder {folder_name}")
            mail.logout()
            return []
        
        # Search for all emails
        status, message_ids = mail.search(None, 'ALL')
        
        if status != 'OK':
            mail.logout()
            return []
        
        # Get message IDs (most recent first)
        ids = message_ids[0].split()
        ids = list(reversed(ids))[:limit]  # Reverse for newest first
        
        for msg_id in ids:
            try:
                status, msg_data = mail.fetch(msg_id, '(RFC822 FLAGS)')
                
                if status != 'OK':
                    continue
                
                raw_email = msg_data[0][1]
                msg = email.message_from_bytes(raw_email)
                
                # Parse flags (for read/unread status)
                flags = msg_data[0][0].decode() if msg_data[0][0] else ""
                is_read = "\\Seen" in flags
                
                # Parse date
                date_str = msg.get('Date', '')
                try:
                    date_obj = parsedate_to_datetime(date_str)
                    date_formatted = date_obj.strftime('%Y-%m-%d %H:%M')
                except:
                    date_formatted = date_str
                
                # Parse sender/recipient
                from_addr = parse_email_address(decode_email_header(msg.get('From', '')))
                to_addr = parse_email_address(decode_email_header(msg.get('To', '')))
                
                email_data = {
                    "id": msg_id.decode(),
                    "subject": decode_email_header(msg.get('Subject', '(No Subject)')),
                    "from": from_addr,
                    "to": to_addr,
                    "date": date_formatted,
                    "is_read": is_read,
                    "preview": get_email_body(msg)[:150] + "..." if len(get_email_body(msg)) > 150 else get_email_body(msg),
                    "folder": folder
                }
                
                emails.append(email_data)
                
            except Exception as e:
                logger.error(f"Error parsing email {msg_id}: {e}")
                continue
        
        mail.logout()
        
    except imaplib.IMAP4.error as e:
        logger.error(f"IMAP error: {e}")
    except Exception as e:
        logger.error(f"Error fetching emails: {e}")
    
    return emails


def fetch_email_by_id(email_id: str, folder: str = "INBOX") -> Optional[Dict]:
    """
    Fetch a single email by ID with full body
    """
    if not SUPPORT_PASSWORD:
        logger.error("Support email password not configured")
        return None
    
    try:
        context = ssl.create_default_context()
        mail = imaplib.IMAP4_SSL(IMAP_HOST, IMAP_PORT, ssl_context=context)
        mail.login(SUPPORT_EMAIL, SUPPORT_PASSWORD)
        
        folder_name = folder if folder == "INBOX" else "Sent"
        mail.select(folder_name)
        
        status, msg_data = mail.fetch(email_id.encode(), '(RFC822)')
        
        if status != 'OK':
            mail.logout()
            return None
        
        # Mark as read
        mail.store(email_id.encode(), '+FLAGS', '\\Seen')
        
        raw_email = msg_data[0][1]
        msg = email.message_from_bytes(raw_email)
        
        # Parse date
        date_str = msg.get('Date', '')
        try:
            date_obj = parsedate_to_datetime(date_str)
            date_formatted = date_obj.strftime('%Y-%m-%d %H:%M')
        except:
            date_formatted = date_str
        
        from_addr = parse_email_address(decode_email_header(msg.get('From', '')))
        to_addr = parse_email_address(decode_email_header(msg.get('To', '')))
        
        email_data = {
            "id": email_id,
            "subject": decode_email_header(msg.get('Subject', '(No Subject)')),
            "from": from_addr,
            "to": to_addr,
            "date": date_formatted,
            "body": get_email_body(msg),
            "message_id": msg.get('Message-ID', ''),
            "folder": folder
        }
        
        mail.logout()
        return email_data
        
    except Exception as e:
        logger.error(f"Error fetching email {email_id}: {e}")
        return None


def send_email_from_support(
    to_email: str,
    subject: str,
    body: str,
    reply_to_message_id: str = None
) -> bool:
    """
    Send email from support@medmcq.com.au
    
    Args:
        to_email: Recipient email address
        subject: Email subject
        body: Plain text email body
        reply_to_message_id: Message-ID for threading replies
    
    Returns:
        bool: True if sent successfully
    """
    if not SUPPORT_PASSWORD:
        logger.error("Support email password not configured")
        return False
    
    try:
        # Create message
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = f"MedMCQ Support <{SUPPORT_EMAIL}>"
        message["To"] = to_email
        message["Date"] = formatdate(localtime=True)
        
        # Add threading headers for replies
        if reply_to_message_id:
            message["In-Reply-To"] = reply_to_message_id
            message["References"] = reply_to_message_id
        
        # Create HTML version of the body
        html_body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="white-space: pre-wrap;">{body}</div>
            <br>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="color: #888; font-size: 12px;">
                MedMCQ Support<br>
                <a href="mailto:support@medmcq.com.au">support@medmcq.com.au</a>
            </p>
        </body>
        </html>
        """
        
        # Attach both plain text and HTML versions
        part1 = MIMEText(body, "plain")
        part2 = MIMEText(html_body, "html")
        message.attach(part1)
        message.attach(part2)
        
        # Send via SMTP
        context = ssl.create_default_context()
        
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls(context=context)
            server.login(SUPPORT_EMAIL, SUPPORT_PASSWORD)
            server.sendmail(SUPPORT_EMAIL, to_email, message.as_string())
        
        logger.info(f"Email sent from support to {to_email}")
        return True
        
    except smtplib.SMTPAuthenticationError as e:
        logger.error(f"SMTP Authentication failed: {e}")
        return False
    except smtplib.SMTPException as e:
        logger.error(f"SMTP error: {e}")
        return False
    except Exception as e:
        logger.error(f"Error sending email: {e}")
        return False


def get_unread_count() -> int:
    """Get count of unread emails in inbox"""
    if not SUPPORT_PASSWORD:
        return 0
    
    try:
        context = ssl.create_default_context()
        mail = imaplib.IMAP4_SSL(IMAP_HOST, IMAP_PORT, ssl_context=context)
        mail.login(SUPPORT_EMAIL, SUPPORT_PASSWORD)
        mail.select("INBOX")
        
        status, messages = mail.search(None, 'UNSEEN')
        
        if status == 'OK':
            unread_ids = messages[0].split()
            count = len(unread_ids)
        else:
            count = 0
        
        mail.logout()
        return count
        
    except Exception as e:
        logger.error(f"Error getting unread count: {e}")
        return 0
