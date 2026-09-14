"""Fire-and-forget WhatsApp lead alert via CallMeBot."""
import logging
import threading

import requests
from django.conf import settings

logger = logging.getLogger(__name__)

CALLMEBOT_URL = 'https://api.callmebot.com/whatsapp.php'
REQUEST_TIMEOUT = 5  # seconds


def _build_message(name, phone, service, date, message):
    lines = [
        'New photography lead!',
        f'Name: {name}',
        f'Phone: {phone}',
        f'Service: {service}',
    ]
    if date:
        lines.append(f'Date: {date}')
    if message:
        lines.append(f'Message: {message}')
    return '\n'.join(lines)


def _send(text):
    phone = settings.WHATSAPP_ALERT_PHONE
    api_key = settings.CALLMEBOT_API_KEY
    if not phone or not api_key:
        logger.info('WhatsApp alert skipped: CALLMEBOT_API_KEY/WHATSAPP_ALERT_PHONE not configured.')
        return
    try:
        response = requests.get(
            CALLMEBOT_URL,
            params={'phone': phone, 'text': text, 'apikey': api_key},
            timeout=REQUEST_TIMEOUT,
        )
        response.raise_for_status()
    except requests.RequestException:
        logger.exception('WhatsApp alert failed to send via CallMeBot.')


def notify_new_lead(submission):
    """Send the WhatsApp alert in a background thread so a slow/failed CallMeBot
    call never delays or breaks the visitor's contact-form response."""
    text = _build_message(
        submission.name, submission.phone, submission.service, submission.date, submission.message
    )
    threading.Thread(target=_send, args=(text,), daemon=True).start()
