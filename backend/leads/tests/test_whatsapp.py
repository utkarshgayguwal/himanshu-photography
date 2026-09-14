from unittest.mock import patch

import requests

from leads.whatsapp import _send


class TestSend:
    def test_skipped_when_unconfigured(self, settings):
        settings.CALLMEBOT_API_KEY = ''
        settings.WHATSAPP_ALERT_PHONE = ''
        with patch('leads.whatsapp.requests.get') as mock_get:
            _send('hello')
        mock_get.assert_not_called()

    def test_calls_callmebot_with_expected_params(self, settings):
        settings.CALLMEBOT_API_KEY = 'test-key'
        settings.WHATSAPP_ALERT_PHONE = '+911234567890'
        with patch('leads.whatsapp.requests.get') as mock_get:
            _send('hello')
        mock_get.assert_called_once_with(
            'https://api.callmebot.com/whatsapp.php',
            params={'phone': '+911234567890', 'text': 'hello', 'apikey': 'test-key'},
            timeout=5,
        )

    def test_swallows_request_exception(self, settings):
        settings.CALLMEBOT_API_KEY = 'test-key'
        settings.WHATSAPP_ALERT_PHONE = '+911234567890'
        with patch('leads.whatsapp.requests.get', side_effect=requests.RequestException('boom')):
            _send('hello')  # must not raise
