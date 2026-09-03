# Banquet Hall Test Case Catalog

This document summarizes the core automated test coverage for the Banquet Hall web flows implemented in the `iGrill` forms. It captures the test scenarios, input parameters, expected results, and edge cases for the main user journeys.

## Scope

- Menu Selection form
- Availability Inquiry form
- Validation and submission behavior
- Success and failure paths for external API interactions

## Source Coverage

The scenarios below are derived from the browser tests in:

- `tests/test_menu_selection.py`
- `tests/test_inquiry_form.py`

---

## 1. Menu Selection Form Test Cases

### MS-01: Page renders with minimum date and company footer

| Field | Details |
| --- | --- |
| Test name | `test_page_renders_with_minimum_date_and_company_footer` |
| Feature | Form initialization and baseline validation |
| Input parameters | Base URL, browser page, no user-entered values |
| Setup | Load `/iGrill/MenuSelection/index.html` |
| Expected outcome | The page renders the heading `Banquet Hall Menu Selection`; the `eventDate` field has a minimum date equal to `today + 1 day`; footer text is `Powered by Lightning Ventures LLC` |
| Edge cases | Date validation depends on the system date and must reflect the next valid booking day |

#### Execution flow
1. Open the menu selection page.
2. Assert the page heading is visible.
3. Check `#eventDate` has `min` attribute set to tomorrow's ISO date.
4. Verify the footer contains the expected company attribution.

#### Validation notes
- Ensures form visibility and date-floor validation before user interaction.
- Prevents invalid same-day reservations.

---

### MS-02: More than three premium menu items display a warning note and allow submission

| Field | Details |
| --- | --- |
| Test name | `test_allows_more_than_three_premium_menu_items_with_warning_note` |
| Feature | Premium item warning and submission allowance |
| Input parameters | Complete valid form, then set 4 menu rows to values ending with ` * ` |
| Setup | Use a valid menu configuration, then replace the first four `#itemNN` fields with `Paneer 65 *` |
| Expected outcome | A red warning note is displayed above the submit button stating: `Note: You have selected 4 items marked with *. The package allows a maximum of 3 (additional charges apply for extra premium dishes).` No blocking alert dialog is shown, and submission proceeds successfully. |
| Edge cases | Exactly 3 premium items are allowed without warning; selecting 4 or more shows the red warning note and still permits submission |

#### Execution flow
1. Open the form.
2. Complete all valid fields.
3. Mark four menu items as premium by appending ` * `.
4. Trigger blur/click to validate the form state.
5. Verify the red warning note is visible above the submit button.
6. Submit the form.
7. Confirm that submission succeeds and no blocking alert dialog appears.

#### Validation notes
- Extra premium items are permitted with clear notice that additional charges apply.
- Confirms the non-blocking warning note behaves properly and submission to Google Apps Script completes.

---

### MS-03: Valid menu submission posts payload and resets form

| Field | Details |
| --- | --- |
| Test name | `test_valid_menu_submission_posts_payload_and_resets_form` |
| Feature | Successful form submission and payload verification |
| Input parameters | Full valid menu submission payload including guest info, date, slot, menu items, selected rice, service details, acknowledgments |
| Setup | Fill all required fields and check all required acknowledgements; intercept `/script.google.com/**` requests to capture form data; override PDF generation callback |
| Expected outcome | The form resets after a successful submission; POST data includes `name`, `adultGuests`, and `slot`; a success alert is displayed; PDF data is generated with the submitted name |
| Success message | `Thank you! Your menu selections have been recorded. A PDF summary with agreed Terms & Conditions has been downloaded, and a copy has been emailed to you and banquet management.` |
| Edge cases | Ensures the form is cleared after success; confirms the payload is sent to the backend; verifies PDF generation hook is invoked |

#### Required sample inputs
- Name: `Test Guest`
- Phone: `669-555-0100`
- Email: `guest@example.com`
- Event date: a date 7 days in the future
- Adult guests: `50`
- Slot: `Dinner`
- Advance paid: `$250.00`
- Welcome drink: first option checked
- Menu items: `Gobi 65`, `Channa Masala`, `Masala Dal`, `Vegetable Samosa`, `Mix Veg Korma`, `Lemon Rice`
- Rice selection: first option checked
- Serving times: `Dinner service at 7:00 PM`
- Special requests: `No special requests`
- Mandatory acknowledgements: cleaning charge, T&C, final acknowledgement checked

#### Validation notes
- This is the main happy-path scenario for the menu workflow.
- Confirms that backend submission and user feedback happen together.

---

### MS-04: Decorator details toggle and capture in PDF & submission payload

| Field | Details |
| --- | --- |
| Test name | `test_decorator_selection_toggles_fields_and_captures_in_pdf` |
| Feature | Decorator selection conditional fields and PDF capture |
| Input parameters | Complete valid form, select "Yes" for "Are you using decorator(s) for your event?*", provide decorator name, decoration amount, and contact number |
| Setup | Fill all valid fields, click "Yes" radio for usingDecorators, fill #decoratorName, #decoratorAmount, #decoratorPhone |
| Expected outcome | When "Yes" is clicked, the decorator details container appears; when submitted, decorator fields are included in the Google Apps Script POST payload and captured in the PDF table; when "No" is selected, fields remain hidden and no extra decorator rows appear |
| Edge cases | Default state is "No" with fields hidden; selecting "No" hides and clears fields without affecting the form |

#### Validation notes
- Confirms conditional display logic for decorator details.
- Verifies that decorator information is properly captured in both the PDF agreement and the submission payload.

---

## 2. Availability Inquiry Form Test Cases

### INQ-01: Availability response renders open and booked slots

| Field | Details |
| --- | --- |
| Test name | `test_availability_response_renders_open_and_booked_slots` |
| Feature | Calendar availability rendering |
| Input parameters | Mock backend response with one open lunch slot and one booked dinner slot for a future date |
| Setup | Mock Google Apps Script API with `[{ "date": "<future-date>", "slot": "Lunch", "isOpen": true }, { "date": "<future-date>", "slot": "Dinner", "isOpen": false }]` |
| Expected outcome | The lunch slot button is visible with label like `Month Day, Year, lunch available`; the booked dinner slot appears as a disabled/labelled booked tile with title `"<date> - Dinner: Booked / TempHold"` |
| Edge cases | Verifies both positive and negative availability states on the same date |

#### Execution flow
1. Open the inquiry page.
2. Mock the availability API.
3. Wait for the calendar to render.
4. Assert the lunch slot appears as open.
5. Assert the dinner slot appears as booked.

#### Validation notes
- Ensures availability data is transformed correctly into visual calendar states.
- Validates the calendar tile names and states used by the UI.

---

### INQ-02: Availability API failure shows error

| Field | Details |
| --- | --- |
| Test name | `test_availability_api_failure_shows_error` |
| Feature | Error handling when availability service fails |
| Input parameters | Request to the Google Apps Script route is aborted intentionally |
| Setup | `page.route("**/script.google.com/**", lambda route: route.abort("failed"))` |
| Expected outcome | An alert is shown with `Availability could not be loaded. Please try again later.` |
| Edge cases | Covers the failure path where the external availability service is unreachable or returns no usable data |

#### Execution flow
1. Open the inquiry form.
2. Force the external API request to fail.
3. Expect the generic visibility alert to appear.

#### Validation notes
- Confirms graceful degradation when external data cannot be reached.
- Prevents a blank or stale calendar from being shown silently.

---

### INQ-03: Successful inquiry submission

| Field | Details |
| --- | --- |
| Test name | `test_successful_inquiry_submission` |
| Feature | Happy path for submitting a banquet inquiry |
| Input parameters | User selects a future lunch slot that is open; completes required personal details |
| Setup | Mock API with a valid open slot for the target date; choose the target lunch option; fill in `name`, `phone`, `email`, and `adultGuests` |
| Expected outcome | The form-status message changes to success, using `form-status success`; the text is `Thank you! Your inquiry was submitted successfully.`; the input values are cleared after submission |
| Edge cases | Ensures the form resets to a clean state after a successful request |

#### Required sample inputs
- Name: `Test Guest`
- Phone: `669-555-0100`
- Email: `guest@example.com`
- Adult guests: `50`
- Selected availability: an open lunch slot for a valid future date

#### Validation notes
- Validates full user journey from selecting a slot to receiving confirmation.
- Confirms that successful backend responses trigger UI success handling.

---

### INQ-04: Submission API failure preserves form and allows retry

| Field | Details |
| --- | --- |
| Test name | `test_submission_api_failure_preserves_form_and_allows_retry` |
| Feature | Submission failure recovery |
| Input parameters | Selected future lunch slot; valid contact details; mocked backend returns `500` for the submit action |
| Setup | Mock Google Apps Script availability data as open; set `submit_status=500` on form submit |
| Expected outcome | The form status becomes `form-status error` with message `We could not submit your inquiry. Please try again.`; user-entered values remain populated; `#submit-btn` remains enabled and can be retried |
| Edge cases | Covers a failed backend response while preserving entered user data for retry without resetting the form |

#### Validation notes
- This is the critical recovery case for the inquiry flow.
- It prevents data loss and keeps the user in a retryable state after a server-side failure.

---

## 3. Cross-Cutting Edge Cases and Business Rules

### Date handling
- Minimum event date must be `today + 1` for menu selection.
- Inquiry calendar logic should only show future valid dates and avoid invalid same-day selection.
- Calendar month navigation and date selection logic must handle month changes correctly.

### Validation boundaries
- More than 3 premium dishes shows a red warning note above submit button while allowing submission.
- Required user fields must be filled before submission for both flows.
- Both forms check mandatory acknowledgement toggles before submission.

### API failure paths
- Availability load failure shows a user-visible alert and prevents silent failure.
- Submit failure preserves the form state for retry.
- The UI should remain interactive after a failed submission.

### Success path behavior
- Successful menu submission posts the complete payload and clears the form.
- Successful inquiry submission resets form state while showing a success message.

---

## 4. Automation Mapping

The following test-case IDs are covered by real automated pytest tests in the Banquet Hall suite.

| Test Case ID | Automated test | File |
| --- | --- | --- |
| MS-01 | `test_page_renders_with_minimum_date_and_company_footer` | `tests/test_menu_selection.py` |
| MS-02 | `test_allows_more_than_three_premium_menu_items_with_warning_note` | `tests/test_menu_selection.py` |
| MS-03 | `test_valid_menu_submission_posts_payload_and_resets_form` | `tests/test_menu_selection.py` |
| MS-04 | `test_decorator_selection_toggles_fields_and_captures_in_pdf` | `tests/test_menu_selection.py` |
| INQ-01 | `test_availability_response_renders_open_and_booked_slots` | `tests/test_inquiry_form.py` |
| INQ-02 | `test_availability_api_failure_shows_error` | `tests/test_inquiry_form.py` |
| INQ-03 | `test_successful_inquiry_submission` | `tests/test_inquiry_form.py` |
| INQ-04 | `test_submission_api_failure_preserves_form_and_allows_retry` | `tests/test_inquiry_form.py` |

### Coverage assessment
- Yes: all the primary test cases listed above are automated.
- Note: this is feature-level coverage for the core flows, not an exhaustive list of every possible edge state or negative-input combination.

---

## 5. Coverage Summary

| Feature | Scenario type | Covered |
| --- | --- | --- |
| Menu rendering | Initial page state | Yes |
| Date validation | Minimum allowed value | Yes |
| Premium menu limit | Warning note & submission allowance | Yes |
| Decorator details toggle | Conditional fields & PDF capture | Yes |
| Successful menu submit | Payload + reset + PDF workflow | Yes |
| Availability display | Open versus booked slots | Yes |
| Availability load error | API failure message | Yes |
| Inquiry successful submit | Success confirmation + reset | Yes |
| Inquiry submit failure | Retry-safe error state | Yes |

This suite provides end-to-end coverage for the key customer interactions in the Banquet Hall experience, with emphasis on validation, error handling, and state restoration after both success and failure conditions.
