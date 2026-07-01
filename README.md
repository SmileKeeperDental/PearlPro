# PearlPro Dental Supply

Six-page dental product ordering website with a small Node backend.

## Run locally

```powershell
npm start
```

Open:

```text
http://localhost:8080
```

Do not open `index.html` directly when testing the order form. The order form posts to `/api/orders`, so it needs the backend server.

## Email delivery

The backend stores every order in `data/orders.jsonl`.

For real office email delivery, set these environment variables before starting the server:

```powershell
$env:RESEND_API_KEY="your_resend_api_key"
$env:OFFICE_EMAIL="office@example.com"
$env:FROM_EMAIL="Dental Orders <orders@your-domain.com>"
npm start
```

Without `RESEND_API_KEY`, the backend runs in development-capture mode: it saves the order and prints the email content in the terminal.

Set this to force real email delivery and reject orders if email is not configured:

```powershell
$env:REQUIRE_EMAIL_DELIVERY="true"
```
