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

## Default monitored URL

Scheduled runs now default to this Booking.com search page:

`https://www.booking.com/searchresults.pl.html?ss=Budapeszt%2C+Central+Hungary%2C+W%C4%99gry&efdco=1&lang=pl&src=index&dest_id=-850553&dest_type=city&ac_position=0&ac_click_type=b&ac_langcode=pl&ac_suggestion_list_length=5&search_selected=true&search_pageview_id=f9b951b5edcc06d2&checkin=2026-05-29&checkout=2026-05-31&group_adults=2&no_rooms=1&group_children=2&age=10&age=8&nflt=price%3DPLN-min-800-1%3Breview_score%3D80%3Bfc%3D2%3Bdi%3D2279#map_closed`

If needed, you can still override it with the `MONITOR_URL` repository variable.

## Manual run

Run the `Monitor web page changes` workflow and provide the `url` input.

## Tuning comparison sensitivity

You can adjust these workflow environment variables:

- `PIXELMATCH_THRESHOLD` - per-pixel comparison sensitivity
- `MIN_CHANGED_PIXELS` - minimum number of changed pixels required to treat a page as changed
- `SCREENSHOT_DELAY_MS` - extra delay after the page finishes loading
