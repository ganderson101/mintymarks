"""Provider-abstracted email sender for MintyMarks.

Dev (EMAIL_PROVIDER unset or 'console'): prints to stdout — no credentials needed.

Prod:
  EMAIL_PROVIDER=sendgrid  →  SMTP via SendGrid relay
    Required: SENDGRID_API_KEY, EMAIL_FROM
  EMAIL_PROVIDER=smtp      →  generic SMTP / Gmail
    Required: SMTP_HOST, SMTP_USER, SMTP_PASS, EMAIL_FROM
    Optional: SMTP_PORT (default 587)

Never hardcode secrets here.
"""
import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

_PROVIDER = os.environ.get("EMAIL_PROVIDER", "console").lower()
_FROM = os.environ.get("EMAIL_FROM", "noreply@mintymarks.local")
_FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:5173")

# True when no real email provider is configured (local/dev). In this mode callers
# may surface the magic link directly to the user instead of relying on email.
DEV_MODE = _PROVIDER == "console"


def _smtp_send(to: str, subject: str, body_text: str) -> None:
    if _PROVIDER == "sendgrid":
        api_key = os.environ.get("SENDGRID_API_KEY", "")
        if not api_key:
            raise RuntimeError("EMAIL_PROVIDER=sendgrid but SENDGRID_API_KEY is not set")
        host, port, user, pw = "smtp.sendgrid.net", 587, "apikey", api_key
    else:
        host = os.environ.get("SMTP_HOST", "")
        if not host:
            raise RuntimeError("EMAIL_PROVIDER=smtp but SMTP_HOST is not set")
        port = int(os.environ.get("SMTP_PORT", "587"))
        user = os.environ.get("SMTP_USER", "")
        pw = os.environ.get("SMTP_PASS", "")

    from_addr = os.environ.get("EMAIL_FROM", user)
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = from_addr
    msg["To"] = to
    msg.attach(MIMEText(body_text, "plain", "utf-8"))

    with smtplib.SMTP(host, port, timeout=10) as smtp:
        smtp.ehlo()
        smtp.starttls()
        if user:
            smtp.login(user, pw)
        smtp.sendmail(from_addr, [to], msg.as_string())


def send_magic_link(to_address: str, raw_token: str) -> str:
    """Send (or log) a magic-link email. raw_token is the unencoded token.

    Returns the sign-in link so dev/console callers can surface it directly.
    """
    link = f"{_FRONTEND_URL}/auth/verify?token={raw_token}"
    subject = "Your MintyMarks login link"
    body = (
        f"Click the link below to sign in to MintyMarks (expires in 30 minutes):\n\n"
        f"{link}\n\n"
        "This link can only be used once.\n"
        "If you did not request this, you can safely ignore this email."
    )
    if _PROVIDER == "console":
        print(f"\n[DEV] Magic link -> {to_address}\n  {link}\n", flush=True)
        return link
    _smtp_send(to_address, subject, body)
    return link


def send_digest(to_address: str, subject: str, body_text: str) -> None:
    if _PROVIDER == "console":
        print(f"[EMAIL console] To: {to_address}")
        print(f"[EMAIL console] Subject: {subject}")
        print(f"[EMAIL console] Body:\n{body_text}")
        return
    _smtp_send(to_address, subject, body_text)
    print(f"[digest] SENT: \"{subject}\" -> {to_address}")


if __name__ == "__main__":
    # Called directly by nightly-digest.mjs subprocess:
    #   python3 backend/email_sender.py <to> <subject> <body-from-stdin>
    import sys
    _to = sys.argv[1]
    _subject = sys.argv[2]
    _body = sys.stdin.read()
    send_digest(_to, _subject, _body)
