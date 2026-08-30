from __future__ import annotations

import json
from datetime import date, timedelta
from urllib.parse import parse_qs, urlparse

import pytest
from playwright.sync_api import Page, Route, expect


FORM_PATH = "/iGrill/InqueryForm/index.html"
pytestmark = pytest.mark.form_test(merchant="iGrill", form="InqueryForm")


def future_date() -> date:
    candidate = date.today() + timedelta(days=2)
    if candidate.month != date.today().month:
        candidate = candidate.replace(day=2)
    return candidate


def mock_google_api(page: Page, availability: list[dict], submit_status: int = 200) -> None:
    def handler(route: Route) -> None:
        query = parse_qs(urlparse(route.request.url).query)
        if query.get("action") == ["submitInquiry"]:
            route.fulfill(
                status=submit_status,
                content_type="application/json",
                body=json.dumps({"success": submit_status < 400}),
            )
            return

        callback = query.get("callback", ["onAvailabilityLoaded"])[0]
        route.fulfill(
            status=200,
            content_type="application/javascript",
            body=f"{callback}({json.dumps(availability)});",
        )

    page.route("**/script.google.com/**", handler)


def open_form(page: Page, base_url: str) -> None:
    page.goto(f"{base_url}{FORM_PATH}")
    expect(page.get_by_role("heading", name="Banquet Hall Availability Inquiry")).to_be_visible()


def select_lunch(page: Page, target: date) -> None:
    target_month = target.strftime("%B %Y")
    while page.locator("#calendar-title").inner_text() != target_month:
        page.locator("#next-month").click()
    label = target.strftime("%B %-d, %Y, lunch available")
    page.get_by_role("button", name=label).click()


def complete_form(page: Page) -> None:
    page.locator("#name").fill("Test Guest")
    page.locator("#phone").fill("669-555-0100")
    page.locator("#email").fill("guest@example.com")
    page.locator("#adultGuests").fill("50")


def test_availability_response_renders_open_and_booked_slots(page: Page, base_url: str) -> None:
    target = future_date()
    date_string = target.isoformat()
    mock_google_api(page, [
        {"date": date_string, "slot": "Lunch", "isOpen": True},
        {"date": date_string, "slot": "Dinner", "isOpen": False},
    ])

    open_form(page, base_url)

    expect(page.get_by_role("button", name=target.strftime("%B %-d, %Y, lunch available"))).to_be_visible()
    expect(page.locator(f'[title="{date_string} - Dinner: Booked / TempHold"]')).to_be_visible()


def test_availability_api_failure_shows_error(page: Page, base_url: str) -> None:
    page.route("**/script.google.com/**", lambda route: route.abort("failed"))

    open_form(page, base_url)

    expect(page.get_by_role("alert")).to_have_text(
        "Availability could not be loaded. Please try again later."
    )


def test_successful_inquiry_submission(page: Page, base_url: str) -> None:
    target = future_date()
    mock_google_api(page, [{"date": target.isoformat(), "slot": "Lunch", "isOpen": True}])
    open_form(page, base_url)
    select_lunch(page, target)
    complete_form(page)

    page.locator("#submit-btn").click()

    expect(page.locator("#form-status")).to_have_class("form-status success")
    expect(page.locator("#form-status")).to_have_text(
        "Thank you! Your inquiry was submitted successfully."
    )
    expect(page.locator("#name")).to_have_value("")


def test_submission_api_failure_preserves_form_and_allows_retry(page: Page, base_url: str) -> None:
    target = future_date()
    mock_google_api(
        page,
        [{"date": target.isoformat(), "slot": "Lunch", "isOpen": True}],
        submit_status=500,
    )
    open_form(page, base_url)
    select_lunch(page, target)
    complete_form(page)

    page.locator("#submit-btn").click()

    expect(page.locator("#form-status")).to_have_class("form-status error")
    expect(page.locator("#form-status")).to_have_text(
        "We could not submit your inquiry. Please try again."
    )
    expect(page.locator("#name")).to_have_value("Test Guest")
    expect(page.locator("#submit-btn")).to_be_enabled()
