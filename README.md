# monitor-web-page-changes

Narzędzie monitoruje zmiany wizualne strony WWW przy pomocy Playwright i uruchamia się jako GitHub Actions workflow.

## Co robi workflow

- uruchamia się ręcznie przez `workflow_dispatch` z parametrem `url`
- uruchamia się cyklicznie co 2 godziny przez `schedule`
- pobiera zrzut strony do `new_screenshot.png`
- porównuje go z zapisanym stanem `last_screenshot.png`
- przy zmianie tworzy `diff.png`, wysyła e-mail i zapisuje nowy stan do repozytorium

## Pliki

- `/monitor.js` - skrypt monitorujący
- `/package.json` - zależności Node.js
- `/.github/workflows/monitor.yml` - workflow GitHub Actions

## Wymagane sekrety

Dodaj w repozytorium GitHub (`Settings -> Secrets and variables -> Actions`) następujące sekrety:

- `SMTP_SERVER` - adres serwera SMTP
- `SMTP_PORT` - port serwera SMTP
- `SMTP_USERNAME` - login SMTP
- `SMTP_PASSWORD` - hasło SMTP
- `MAIL_TO` - adres odbiorcy powiadomień
- `MAIL_FROM` - adres nadawcy

## Wymagana zmienna repozytorium

Dodaj zmienną `MONITOR_URL`, jeśli chcesz korzystać z uruchomień harmonogramu bez ręcznego podawania adresu URL.

## Ręczne uruchomienie

Uruchom workflow `Monitor web page changes` i podaj parametr `url`.

## Dostosowanie czułości porównania

W workflow możesz zmienić:

- `PIXELMATCH_THRESHOLD` - czułość porównania pikseli
- `MIN_CHANGED_PIXELS` - minimalna liczba różniących się pikseli wymagana do uznania zmiany
- `SCREENSHOT_DELAY_MS` - dodatkowe opóźnienie po załadowaniu strony
