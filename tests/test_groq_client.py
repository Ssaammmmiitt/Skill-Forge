"""Tests for Groq multi-key failover."""
import os
import sys
from unittest.mock import MagicMock, patch

import pytest

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api.exceptions import ApiError
from api.services import groq_client


class FakeRateLimitError(Exception):
    status_code = 429


class FakeServerError(Exception):
    status_code = 502


class FakeAuthError(Exception):
    status_code = 401


def test_should_try_next_key_for_rate_limit_and_server_errors():
    assert groq_client._should_try_next_key(FakeRateLimitError("rate limit"))
    assert groq_client._should_try_next_key(FakeServerError("bad gateway"))
    assert groq_client._should_try_next_key(FakeAuthError("invalid api key"))
    assert groq_client._should_try_next_key(ConnectionError("reset"))


def test_should_not_try_next_key_for_client_errors():
    class BadRequest(Exception):
        status_code = 400

    assert not groq_client._should_try_next_key(BadRequest("invalid model"))


@patch("groq.Groq")
@patch("api.services.groq_client.get_groq_api_keys", return_value=["key-a", "key-b"])
@patch("api.services.groq_client.get_groq_api_key", return_value="key-a")
def test_fails_over_to_second_key_on_rate_limit(_start, _keys, groq_cls):
    ok_client = MagicMock()
    ok_client.chat.completions.create.return_value = "ok-response"

    fail_client = MagicMock()
    fail_client.chat.completions.create.side_effect = FakeRateLimitError("429 rate limit")

    groq_cls.side_effect = [fail_client, ok_client]

    result = groq_client.groq_chat_completion(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": "hi"}],
        temperature=0.4,
        max_tokens=10,
    )

    assert result == "ok-response"
    assert groq_cls.call_count == 2
    groq_cls.assert_any_call(api_key="key-a")
    groq_cls.assert_any_call(api_key="key-b")


@patch("groq.Groq")
@patch("api.services.groq_client.get_groq_api_keys", return_value=["key-a", "key-b"])
@patch("api.services.groq_client.get_groq_api_key", return_value="key-a")
def test_fails_over_to_second_key_on_502(_start, _keys, groq_cls):
    ok_client = MagicMock()
    ok_client.chat.completions.create.return_value = "ok-response"

    fail_client = MagicMock()
    fail_client.chat.completions.create.side_effect = FakeServerError("502 bad gateway")

    groq_cls.side_effect = [fail_client, ok_client]

    result = groq_client.groq_chat_completion(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": "hi"}],
        temperature=0.4,
        max_tokens=10,
    )

    assert result == "ok-response"
    assert groq_cls.call_count == 2


@patch("groq.Groq")
@patch("api.services.groq_client.get_groq_api_keys", return_value=["key-a", "key-b"])
@patch("api.services.groq_client.get_groq_api_key", return_value="key-a")
def test_raises_after_all_keys_exhausted(_start, _keys, groq_cls):
    fail_client = MagicMock()
    fail_client.chat.completions.create.side_effect = FakeRateLimitError("429 rate limit")
    groq_cls.return_value = fail_client

    with pytest.raises(ApiError) as exc_info:
        groq_client.groq_chat_completion(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": "hi"}],
            temperature=0.4,
            max_tokens=10,
        )

    assert exc_info.value.status_code == 429
    assert "all 2 API keys" in exc_info.value.message
    assert groq_cls.call_count == 2
