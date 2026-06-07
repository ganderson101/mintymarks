"""Email sender — shared provider abstraction for MintyMarks.

EMAIL_PROVIDER env var controls the send backend:
  "console" (default/dev) — prints to stdout; no credentials needed.
  "smtp"                  — sends via Gmail SMTP using SMTP_* env vars.

Functions:
  send_magic_link(to_address, link)            — magic-link login email
  send_digest(to_address, subject, body_text)  — nightly firm digest
"""
import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

_PROVIDER = os.environ.get("EMAIL_PROVIDER", "console").lower()


def _smtp_send(to: str, subject: str, body_text: str) -> None:
    host = os.environ["SMTP_HOST"]
    port = int(os.environ.get("SMTP_PORT", "587"))
    user = os.environ["SMTP_USER"]
    password = os.environ["SMTP_PASS"]
    from_addr = os.environ.get("EMAIL_FROM", user)

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = from_addr
    msg["To"] = to
    msg.attach(MIMEText(body_text, "plain", "utf-8"))

    with smtplib.SMTP(host, port) as smtp:
        smtp.ehlo()
        smtp.starttls()
        smtp.login(user, password)
        smtp.sendmail(from_addr, [to], msg.as_string())


def send_magic_link(to_address: str, link: str) -> None:
    subject = "Your MintyMarks login link"
    body = (
        f"Click the link below to sign in to MintyMarks (expires in 15 minutes):\n\n"
        f"{link}\n\n"
        f"If you did not request this, you can safely ignore this email."
    )
    if _PROVIDER == "console":
        print(f"[EMAIL console] To: {to_address}")
        print(f"[EMAIL console] Subject: {subject}")
        print(f"[EMAIL console] Body:\n{body}")
        return
    _smtp_send(to_address, subject, body)


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
