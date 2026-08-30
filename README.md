# BanquetHall

## Browser tests

Set up the test environment once:

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements-test.txt
.venv/bin/playwright install chromium
```

Run tests for a specific merchant and form:

```bash
.venv/bin/pytest --merchant=iGrill --form=MenuSelection
```

Tests are tagged with the `form_test(merchant=..., form=...)` pytest marker. New
merchant or form suites can use the same marker and are automatically selected by
the corresponding CLI options. Running `.venv/bin/pytest` without filters runs
the complete suite.
