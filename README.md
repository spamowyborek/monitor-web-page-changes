# monitor-web-page-changes

This tool monitors visual changes on a web page with Playwright and runs as a GitHub Actions workflow.

## What the workflow does

- runs manually through `workflow_dispatch` with a required `url` input
- runs every 2 hours through `schedule`
- saves a fresh screenshot to `new_screenshot.png`
- compares it with the stored baseline `last_screenshot.png`
- when a change is detected, creates `diff.png`, sends an email, and stores the new baseline in the repository

## Files

- `/monitor.js` - monitoring script
- `/package.json` - Node.js dependencies
- `/.github/workflows/monitor.yml` - GitHub Actions workflow

## Required secrets

Add these secrets in GitHub under `Settings -> Secrets and variables -> Actions`:

- `SMTP_SERVER` - SMTP server hostname
- `SMTP_PORT` - SMTP server port
- `SMTP_USERNAME` - SMTP login
- `SMTP_PASSWORD` - SMTP password
- `MAIL_TO` - notification recipient address
- `MAIL_FROM` - notification sender address

## Required repository variable

Add the `MONITOR_URL` repository variable if you want scheduled runs to use a default URL.

## Manual run

Run the `Monitor web page changes` workflow and provide the `url` input.

## Tuning comparison sensitivity

You can adjust these workflow environment variables:

- `PIXELMATCH_THRESHOLD` - per-pixel comparison sensitivity
- `MIN_CHANGED_PIXELS` - minimum number of changed pixels required to treat a page as changed
- `SCREENSHOT_DELAY_MS` - extra delay after the page finishes loading
