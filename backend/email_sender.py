"""Provider-abstracted magic-link email sender.

Dev (EMAIL_PROVIDER unset or 'console'): prints the link to stdout — no
credentials needed, flow is fully testable without an email account.

Prod:
  EMAIL_PROVIDER=sendgrid  →  SMTP via SendGrid relay (no extra package)
    Required: SENDGRID_API_KEY, EMAIL_FROM
  EMAIL_PROVIDER=smtp      →  generic SMTP server
    Required: SMTP_HOST, EMAIL_FROM
    Optional: SMTP_PORT (default 587), SMTP_USER, SMTP_PASS

Never hardcode secrets here.  Never read or weaken MINTYMARKS_SECRET.
"""
import os
import smtplib
from email.mime.text import MIMEText

_PROVIDER = os.environ.get("EMAIL_PROVIDER", "console").lower()
_FROM = os.environ.get("EMAIL_FROM", "noreply@mintymarks.local")
_FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:5173")


def send_magic_link(to_address: str, raw_token: str) -> None:
    """Send (or log) a magic-link email.  raw_token is the unencoded token."""
    link = f"{_FRONTEND_URL}/auth/verify?token={raw_token}"

    if _PROVIDER == "console" or not _PROVIDER:
        print(
            f"\n[DEV] Magic link → {to_address}\n"
            f"  {link}\n",
            flush=True,
        )
        return

    body = (
        "Click the link below to log in to MintyMarks.\n\n"
        f"{link}\n\n"
        "This link expires in 30 minutes and can only be used once.\n"
        "If you did not request this, you can safely ignore this email."
    )
    msg = MIMEText(body)
    msg["Subject"] = "Your MintyMarks login link"
    msg["From"] = _FROM
    msg["To"] = to_address

    if _PROVIDER == "sendgrid":
        _via_sendgrid(msg)
    elif _PROVIDER == "smtp":
        _via_smtp(msg)
    else:
        # Unknown provider: fall back to console so dev flow still works.
        print(
            f"\n[DEV] Unknown EMAIL_PROVIDER='{_PROVIDER}', logging link:\n"
            f"  {link}\n",
            flush=True,
        )


def _via_sendgrid(msg: MIMEText) -> None:
    api_key = os.environ.get("SENDGRID_API_KEY", "")
    if not api_key:
        raise RuntimeError(
            "EMAIL_PROVIDER=sendgrid but SENDGRID_API_KEY is not set"
        )
    with smtplib.SMTP("smtp.sendgrid.net", 587, timeout=10) as smtp:
        smtp.starttls()
        smtp.login("apikey", api_key)
        smtp.send_message(msg)


def _via_smtp(msg: MIMEText) -> None:
    host = os.environ.get("SMTP_HOST", "")
    if not host:
        raise RuntimeError("EMAIL_PROVIDER=smtp but SMTP_HOST is not set")
    port = int(os.environ.get("SMTP_PORT", "587"))
    user = os.environ.get("SMTP_USER", "")
    pw = os.environ.get("SMTP_PASS", "")
    with smtplib.SMTP(host, port, timeout=10) as smtp:
        smtp.starttls()
        if user:
            smtp.login(user, pw)
        smtp.send_message(msg)
