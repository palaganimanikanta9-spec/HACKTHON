// Bootstrap environment variables to prevent startup crashes when keys are missing
if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_test_c29saWQtZWFyd2lnLTI5LmNsZXJrLmFjY291bnRzLmRldiQ";
}
if (!process.env.CLERK_SECRET_KEY) {
  process.env.CLERK_SECRET_KEY = "sk_test_1rrOconxkq6vr3tDyu0Z4aKlHf9fc6sLhpxJLWd6nL";
}
if (!process.env.NEXT_PUBLIC_API_URL) {
  process.env.NEXT_PUBLIC_API_URL = "/api/v1";
}
