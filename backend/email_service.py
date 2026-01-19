"""
Email Service for MedMCQ using Zoho SMTP
Handles email verification and password reset emails
"""

import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import logging
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv(Path(__file__).parent / '.env')

logger = logging.getLogger(__name__)

# Email configuration from environment
SMTP_HOST = os.environ.get('SMTP_HOST', 'smtp.zoho.com')
SMTP_PORT = int(os.environ.get('SMTP_PORT', '587'))
SMTP_USERNAME = os.environ.get('SMTP_USERNAME', '')
SMTP_PASSWORD = os.environ.get('SMTP_PASSWORD', '')
SMTP_FROM_EMAIL = os.environ.get('SMTP_FROM_EMAIL', '')
SMTP_FROM_NAME = os.environ.get('SMTP_FROM_NAME', 'MedMCQ')
SMTP_REPLY_TO = os.environ.get('SMTP_REPLY_TO', '')
APP_URL = os.environ.get('APP_URL', 'http://localhost:3000')


def send_email(to_email: str, subject: str, html_content: str, plain_content: str = None) -> bool:
    """
    Send an email using Zoho SMTP
    
    Args:
        to_email: Recipient email address
        subject: Email subject
        html_content: HTML email body
        plain_content: Plain text alternative (optional)
    
    Returns:
        bool: True if sent successfully, False otherwise
    """
    if not all([SMTP_USERNAME, SMTP_PASSWORD, SMTP_FROM_EMAIL]):
        logger.error("Email configuration incomplete. Check environment variables.")
        return False
    
    try:
        # Create message
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = f"{SMTP_FROM_NAME} <{SMTP_FROM_EMAIL}>"
        message["To"] = to_email
        if SMTP_REPLY_TO:
            message["Reply-To"] = SMTP_REPLY_TO
        
        # Add plain text version (required for better deliverability)
        if plain_content:
            part1 = MIMEText(plain_content, "plain")
            message.attach(part1)
        
        # Add HTML version
        part2 = MIMEText(html_content, "html")
        message.attach(part2)
        
        # Create secure connection and send
        context = ssl.create_default_context()
        
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls(context=context)
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.sendmail(SMTP_FROM_EMAIL, to_email, message.as_string())
        
        logger.info(f"Email sent successfully to {to_email}")
        return True
        
    except smtplib.SMTPAuthenticationError as e:
        logger.error(f"SMTP Authentication failed: {e}")
        return False
    except smtplib.SMTPException as e:
        logger.error(f"SMTP error sending email: {e}")
        return False
    except Exception as e:
        logger.error(f"Unexpected error sending email: {e}")
        return False


def send_verification_email(to_email: str, user_name: str, verification_token: str) -> bool:
    """
    Send email verification link to new users
    """
    verification_link = f"{APP_URL}/verify-email?token={verification_token}"
    
    subject = "Verify Your MedMCQ Account"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to MedMCQ!</h1>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="font-size: 16px;">Hi {user_name},</p>
            
            <p style="font-size: 16px;">Thank you for signing up for MedMCQ! Please verify your email address by clicking the button below:</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{verification_link}" style="background: linear-gradient(135deg, #2563eb, #7c3aed); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                    Verify Email Address
                </a>
            </div>
            
            <p style="font-size: 14px; color: #6b7280;">If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="font-size: 12px; color: #9ca3af; word-break: break-all;">{verification_link}</p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="font-size: 14px; color: #6b7280;">This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.</p>
            
            <p style="font-size: 14px; color: #6b7280;">
                Best regards,<br>
                The MedMCQ Team
            </p>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
            <p>MedMCQ - Medical Student Learning Platform</p>
            <p>For educational purposes only. Not for actual medical diagnosis.</p>
        </div>
    </body>
    </html>
    """
    
    plain_content = f"""
    Welcome to MedMCQ!
    
    Hi {user_name},
    
    Thank you for signing up for MedMCQ! Please verify your email address by clicking the link below:
    
    {verification_link}
    
    This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
    
    Best regards,
    The MedMCQ Team
    """
    
    return send_email(to_email, subject, html_content, plain_content)


def send_password_reset_email(to_email: str, user_name: str, reset_token: str) -> bool:
    """
    Send password reset link to users
    """
    reset_link = f"{APP_URL}/reset-password?token={reset_token}"
    
    subject = "Reset Your MedMCQ Password"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset Request</h1>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="font-size: 16px;">Hi {user_name},</p>
            
            <p style="font-size: 16px;">We received a request to reset your MedMCQ password. Click the button below to create a new password:</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{reset_link}" style="background: linear-gradient(135deg, #2563eb, #7c3aed); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                    Reset Password
                </a>
            </div>
            
            <p style="font-size: 14px; color: #6b7280;">If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="font-size: 12px; color: #9ca3af; word-break: break-all;">{reset_link}</p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="font-size: 14px; color: #6b7280;"><strong>This link will expire in 1 hour.</strong></p>
            
            <p style="font-size: 14px; color: #6b7280;">If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
            
            <p style="font-size: 14px; color: #6b7280;">
                Best regards,<br>
                The MedMCQ Team
            </p>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
            <p>MedMCQ - Medical Student Learning Platform</p>
            <p>For educational purposes only. Not for actual medical diagnosis.</p>
        </div>
    </body>
    </html>
    """
    
    plain_content = f"""
    Password Reset Request
    
    Hi {user_name},
    
    We received a request to reset your MedMCQ password. Click the link below to create a new password:
    
    {reset_link}
    
    This link will expire in 1 hour.
    
    If you didn't request a password reset, please ignore this email or contact support if you have concerns.
    
    Best regards,
    The MedMCQ Team
    """
    
    return send_email(to_email, subject, html_content, plain_content)


def send_qualifying_session_email(to_email: str, user_name: str, sessions_completed: int, score: float) -> bool:
    """
    Send congratulations email when user completes a qualifying session
    """
    subject = f"Congratulations! Qualifying Session {sessions_completed}/3 Complete"
    
    unlock_message = ""
    if sessions_completed >= 3:
        unlock_message = """
            <div style="background: #10b981; color: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                <h2 style="margin: 0 0 10px 0;">🎉 FULL QUESTION BANK UNLOCKED!</h2>
                <p style="margin: 0;">You now have access to all 60,000+ questions!</p>
            </div>
        """
    else:
        remaining = 3 - sessions_completed
        unlock_message = f"""
            <p style="font-size: 16px; color: #6b7280;">Only <strong>{remaining} more qualifying session(s)</strong> to unlock the full question bank!</p>
        """
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🏆 Qualifying Session Complete!</h1>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="font-size: 16px;">Hi {user_name},</p>
            
            <p style="font-size: 16px;">Congratulations! You've completed a qualifying session with a score of <strong>{score:.0f}%</strong>!</p>
            
            <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                <h2 style="color: #2563eb; margin: 0;">Sessions Completed: {sessions_completed}/3</h2>
            </div>
            
            {unlock_message}
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{APP_URL}/questions" style="background: linear-gradient(135deg, #2563eb, #7c3aed); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                    Continue Studying
                </a>
            </div>
            
            <p style="font-size: 14px; color: #6b7280;">
                Keep up the great work!<br>
                The MedMCQ Team
            </p>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
            <p>MedMCQ - Medical Student Learning Platform</p>
        </div>
    </body>
    </html>
    """
    
    plain_content = f"""
    Qualifying Session Complete!
    
    Hi {user_name},
    
    Congratulations! You've completed a qualifying session with a score of {score:.0f}%!
    
    Sessions Completed: {sessions_completed}/3
    
    {"🎉 FULL QUESTION BANK UNLOCKED! You now have access to all 60,000+ questions!" if sessions_completed >= 3 else f"Only {3 - sessions_completed} more qualifying session(s) to unlock the full question bank!"}
    
    Keep up the great work!
    The MedMCQ Team
    """
    
    return send_email(to_email, subject, html_content, plain_content)


def send_email_from_support(to_email: str, subject: str, message_body: str, user_name: str = "User") -> bool:
    """
    Send email from support@ (admin to user emails)
    Uses support@ as the from address for personal/reply-expected emails
    """
    support_email = SMTP_REPLY_TO or 'support@medmcq.com.au'
    
    if not all([SMTP_USERNAME, SMTP_PASSWORD]):
        logger.error("Email configuration incomplete. Check environment variables.")
        return False
    
    try:
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = f"MedMCQ Support <{support_email}>"
        message["To"] = to_email
        message["Reply-To"] = support_email
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Message from MedMCQ</h1>
            </div>
            
            <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
                <p style="font-size: 16px;">Hi {user_name},</p>
                
                <div style="font-size: 16px; white-space: pre-wrap;">{message_body}</div>
                
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                
                <p style="font-size: 14px; color: #6b7280;">
                    Best regards,<br>
                    The MedMCQ Support Team
                </p>
                
                <p style="font-size: 12px; color: #9ca3af;">
                    You can reply directly to this email if you have any questions.
                </p>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
                <p>MedMCQ - Medical Student Learning Platform</p>
            </div>
        </body>
        </html>
        """
        
        plain_content = f"""
        Hi {user_name},
        
        {message_body}
        
        Best regards,
        The MedMCQ Support Team
        
        You can reply directly to this email if you have any questions.
        """
        
        part1 = MIMEText(plain_content, "plain")
        message.attach(part1)
        part2 = MIMEText(html_content, "html")
        message.attach(part2)
        
        context = ssl.create_default_context()
        
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls(context=context)
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.sendmail(support_email, to_email, message.as_string())
        
        logger.info(f"Support email sent successfully to {to_email}")
        return True
        
    except Exception as e:
        logger.error(f"Error sending support email: {e}")
        return False


def send_question_report_notification(
    question_id: str,
    question_text: str,
    report_reason: str,
    reporter_email: str,
    reporter_name: str
) -> bool:
    """
    Send notification to support when a question is reported
    """
    support_email = SMTP_REPLY_TO or 'support@medmcq.com.au'
    
    subject = f"Question Reported: {question_id}"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">⚠️ Question Reported</h1>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <h3 style="color: #374151; margin-top: 0;">Report Details:</h3>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold; width: 120px;">Question ID:</td>
                    <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">{question_id}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Reported By:</td>
                    <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">{reporter_name} ({reporter_email})</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Reason:</td>
                    <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">{report_reason}</td>
                </tr>
            </table>
            
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <strong>Question Text:</strong>
                <p style="margin: 10px 0 0 0;">{question_text[:500]}{'...' if len(question_text) > 500 else ''}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{APP_URL}/admin/reported-issues" style="background: linear-gradient(135deg, #2563eb, #7c3aed); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                    Review in Admin Panel
                </a>
            </div>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
            <p>MedMCQ Admin Notification</p>
        </div>
    </body>
    </html>
    """
    
    plain_content = f"""
    Question Reported
    
    Question ID: {question_id}
    Reported By: {reporter_name} ({reporter_email})
    Reason: {report_reason}
    
    Question Text:
    {question_text[:500]}{'...' if len(question_text) > 500 else ''}
    
    Review this report in the admin panel.
    """
    
    return send_email(support_email, subject, html_content, plain_content)


def send_contact_form_notification(
    sender_name: str,
    sender_email: str,
    subject: str,
    message: str
) -> bool:
    """
    Send notification to support when contact form is submitted
    """
    support_email = SMTP_REPLY_TO or 'support@medmcq.com.au'
    
    email_subject = f"Contact Form: {subject}"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">📩 New Contact Form Submission</h1>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold; width: 100px;">From:</td>
                    <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">{sender_name}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Email:</td>
                    <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><a href="mailto:{sender_email}">{sender_email}</a></td>
                </tr>
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Subject:</td>
                    <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">{subject}</td>
                </tr>
            </table>
            
            <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 20px 0;">
                <strong>Message:</strong>
                <p style="margin: 10px 0 0 0; white-space: pre-wrap;">{message}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="mailto:{sender_email}?subject=Re: {subject}" style="background: linear-gradient(135deg, #2563eb, #7c3aed); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                    Reply to {sender_name}
                </a>
            </div>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
            <p>MedMCQ Contact Form Notification</p>
        </div>
    </body>
    </html>
    """
    
    plain_content = f"""
    New Contact Form Submission
    
    From: {sender_name}
    Email: {sender_email}
    Subject: {subject}
    
    Message:
    {message}
    """
    
    return send_email(support_email, email_subject, html_content, plain_content)
