from __future__ import annotations

from datetime import date, timedelta
from urllib.parse import parse_qs

import pytest
from playwright.sync_api import Page, Route, expect


FORM_PATH = "/iGrill/MenuSelection/index.html"
pytestmark = pytest.mark.form_test(merchant="iGrill", form="MenuSelection")


def open_form(page: Page, base_url: str) -> None:
    # These third-party scripts are not needed until PDF generation. Blocking them
    # keeps the browser tests deterministic and independent of the public CDN.
    page.route("https://cdnjs.cloudflare.com/**", lambda route: route.abort())
    page.goto(f"{base_url}{FORM_PATH}")
    expect(page.get_by_role("heading", name="Banquet Hall Menu Selection")).to_be_visible()


def future_date() -> str:
    return (date.today() + timedelta(days=7)).isoformat()


def complete_valid_form(page: Page) -> None:
    page.locator("#name").fill("Test Guest")
    page.locator("#phone").fill("669-555-0100")
    page.locator("#email").fill("guest@example.com")
    page.locator("#eventDate").fill(future_date())
    page.locator("#adultGuests").fill("50")
    page.locator("#slot").select_option("Dinner")
    page.locator("#advancePaid").fill("$250.00")
    page.locator('input[name="welcomeDrink"]').first.check()

    menu_items = [
        "Gobi 65",
        "Channa Masala",
        "Masala Dal",
        "Vegetable Samosa",
        "Mix Veg Korma",
        "Lemon Rice",
    ]
    for item_number, item_name in enumerate(menu_items, start=1):
        page.locator(f"#item{item_number:02}").fill(item_name)

    page.evaluate("document.body.click()")
    page.locator('input[name="rice"]').first.check()
    page.locator("#servingTimes").fill("Dinner service at 7:00 PM")
    page.locator("#specialRequests").fill("No special requests")
    page.locator("#cleaningChargeAck").check()
    page.locator("#checkAllTC").check()
    page.locator("#finalAck").check()


@pytest.mark.test_case_id("MS-01")
def test_page_renders_with_minimum_date_and_company_footer(page: Page, base_url: str) -> None:
    open_form(page, base_url)

    expect(page.locator("#eventDate")).to_have_attribute(
        "min", (date.today() + timedelta(days=1)).isoformat()
    )
    expect(page.locator("footer")).to_have_text("Powered by Lightning Ventures LLC")


@pytest.mark.test_case_id("MS-02")
def test_allows_more_than_three_premium_menu_items_with_warning_note(
    page: Page, base_url: str
) -> None:
    submitted: dict[str, list[str]] = {}

    def capture_submission(route: Route) -> None:
        submitted.update(parse_qs(route.request.post_data or ""))
        route.fulfill(status=200, content_type="text/plain", body="ok")

    page.route("**/script.google.com/**", capture_submission)
    open_form(page, base_url)
    complete_valid_form(page)
    for item_number in range(1, 5):
        page.locator(f"#item{item_number:02}").fill("Paneer 65 *")
    page.evaluate("document.body.click()")

    warning_note = page.locator("#premiumWarningNote")
    expect(warning_note).to_be_visible()
    expect(warning_note).to_contain_text(
        "You have selected 4 items marked with *. The package allows a maximum of 3"
    )

    page.evaluate(
        "generateAndDownloadPDF = formData => { window.testPdfData = formData; }"
    )

    alerts: list[str] = []
    page.on("dialog", lambda dialog: (alerts.append(dialog.message), dialog.accept()))
    page.locator("#submitBtn").click()

    assert (
        "You have selected 4 items marked with *. The package allows a maximum of 3."
        not in alerts
    )
    assert alerts == [
        "Thank you! Your menu selections have been recorded. A PDF summary with agreed Terms & Conditions has been downloaded, and a copy has been emailed to you and banquet management."
    ]
    expect(page.locator("#name")).to_have_value("")
    assert submitted["name"] == ["Test Guest"]
    assert submitted["item01"] == ["Paneer 65 *"]
    assert submitted["item04"] == ["Paneer 65 *"]


@pytest.mark.test_case_id("MS-03")
def test_valid_menu_submission_posts_payload_and_resets_form(
    page: Page, base_url: str
) -> None:
    submitted: dict[str, list[str]] = {}

    def capture_submission(route: Route) -> None:
        submitted.update(parse_qs(route.request.post_data or ""))
        route.fulfill(status=200, content_type="text/plain", body="ok")

    page.route("**/script.google.com/**", capture_submission)
    open_form(page, base_url)
    complete_valid_form(page)
    # PDF rendering is a third-party concern; assert that this page invokes it
    # while keeping this test focused on form validation and submission.
    page.evaluate(
        "generateAndDownloadPDF = formData => { window.testPdfData = formData; }"
    )

    alerts: list[str] = []
    page.on("dialog", lambda dialog: (alerts.append(dialog.message), dialog.accept()))
    page.locator("#submitBtn").click()

    expect(page.locator("#name")).to_have_value("")
    assert submitted["name"] == ["Test Guest"]
    assert alerts == [
        "Thank you! Your menu selections have been recorded. A PDF summary with agreed Terms & Conditions has been downloaded, and a copy has been emailed to you and banquet management."
    ]
    assert submitted["adultGuests"] == ["50"]
    assert submitted["slot"] == ["Dinner"]
    assert page.evaluate("window.testPdfData.name") == "Test Guest"
