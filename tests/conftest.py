from __future__ import annotations

import contextlib
import http.server
import socket
import threading
from pathlib import Path

import pytest
from playwright.sync_api import Browser, Page, Playwright, sync_playwright


REPOSITORY_ROOT = Path(__file__).resolve().parents[1]


def pytest_addoption(parser: pytest.Parser) -> None:
    selection = parser.getgroup("form selection")
    selection.addoption(
        "--merchant",
        action="store",
        help="Run tests for one merchant (for example: iGrill).",
    )
    selection.addoption(
        "--form",
        action="store",
        help="Run tests for one form (for example: MenuSelection).",
    )


def pytest_collection_modifyitems(
    config: pytest.Config, items: list[pytest.Item]
) -> None:
    merchant = config.getoption("--merchant")
    form = config.getoption("--form")
    if not merchant and not form:
        return

    selected: list[pytest.Item] = []
    deselected: list[pytest.Item] = []
    for item in items:
        marker = item.get_closest_marker("form_test")
        marker_merchant = str(marker.kwargs.get("merchant", "")) if marker else ""
        marker_form = str(marker.kwargs.get("form", "")) if marker else ""
        merchant_matches = not merchant or marker_merchant.casefold() == merchant.casefold()
        form_matches = not form or marker_form.casefold() == form.casefold()
        (selected if merchant_matches and form_matches else deselected).append(item)

    config.hook.pytest_deselected(items=deselected)
    items[:] = selected


class QuietStaticHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format: str, *args: object) -> None:
        pass


@pytest.fixture(scope="session")
def playwright_instance() -> Playwright:
    with sync_playwright() as instance:
        yield instance


@pytest.fixture(scope="session")
def browser(playwright_instance: Playwright) -> Browser:
    instance = playwright_instance.chromium.launch(headless=True)
    yield instance
    instance.close()


@pytest.fixture(scope="session")
def base_url() -> str:
    handler = lambda *args, **kwargs: QuietStaticHandler(
        *args, directory=str(REPOSITORY_ROOT), **kwargs
    )

    with contextlib.closing(socket.socket()) as probe:
        probe.bind(("127.0.0.1", 0))
        port = probe.getsockname()[1]

    server = http.server.ThreadingHTTPServer(("127.0.0.1", port), handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    yield f"http://127.0.0.1:{port}"
    server.shutdown()
    thread.join()


@pytest.fixture
def page(browser: Browser, base_url: str) -> Page:
    page = browser.new_page()
    yield page
    page.close()
