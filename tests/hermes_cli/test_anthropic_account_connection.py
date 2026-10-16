"""The Anthropic Account card counts the login ``hermes auth add anthropic`` keeps in the pool."""

import json
import time

import pytest

from hermes_cli.web_server_oauth import _anthropic_oauth_status

_ENV_VARS = ("ANTHROPIC_API_KEY", "ANTHROPIC_TOKEN", "CLAUDE_CODE_OAUTH_TOKEN")


@pytest.fixture
def anthropic_pool(tmp_path, monkeypatch):
    home = tmp_path / "hermes-home"
    home.mkdir()
    monkeypatch.setenv("HERMES_HOME", str(home))
    for var in _ENV_VARS:
        monkeypatch.delenv(var, raising=False)

    def write(*rows: dict) -> None:
        (home / "auth.json").write_text(json.dumps({
            "version": 1, "providers": {}, "credential_pool": {"anthropic": list(rows)}}))

    return write


def _oauth_row(source: str) -> dict:
    return {
        "id": "a1", "label": "anthropic-oauth-1", "priority": 0, "auth_type": "oauth", "source": source,
        "access_token": "sk-ant-oat01-pooled-login", "refresh_token": "refresh-token",
        "expires_at_ms": int((time.time() + 8 * 3600) * 1000),
    }


def test_auth_add_login_reads_as_connected(anthropic_pool):
    """``hermes auth add anthropic`` writes only the pool row, never ``~/.hermes/.anthropic_oauth.json``."""
    anthropic_pool(_oauth_row("manual:hermes_pkce"))

    status = _anthropic_oauth_status()

    assert status["logged_in"] is True
    assert status["source"] == "hermes_pkce"
    assert status["token_preview"] == "…-login"
    assert status["has_refresh_token"] is True


def test_borrowed_claude_code_row_does_not_count(anthropic_pool):
    """Claude Code's login has its own ``claude-code`` card; counting it here would shadow a real key."""
    anthropic_pool(_oauth_row("claude_code"))

    assert _anthropic_oauth_status()["logged_in"] is False


def test_disconnect_clears_the_pooled_login(anthropic_pool):
    from hermes_cli.web_routers.oauth import _clear_anthropic_auth

    anthropic_pool(_oauth_row("manual:hermes_pkce"))

    assert _clear_anthropic_auth() is True
    assert _anthropic_oauth_status()["logged_in"] is False
