# A4 ESPORTS website: fixes and setup

This set of changes is based on `a4esports-website` commit
`64e214658db4b5cf6b4d2f0d624c080b6606dc9e`. Review and test the changes
before merging them into the live branch.

## Main fixes

- Google sign-in now sends the ID token to the backend, which checks its signature,
  audience, issuer, expiry, and verified email before issuing an account token.
- Disabled the unsafe password-reset endpoints: the previous backend exposed reset
  codes in API responses and allowed a password change without a code. Password
  recovery needs a private email/SMS delivery implementation before re-enabling it.
- Removed a global browser `fetch` wrapper that could attach an account token to
  unrelated URLs. API services already send their own authorization headers.
- Public scrim responses no longer include room credentials. Participants receive
  them only after payment is `PAID` and an admin has released that room. Admins
  can still view stored room data through a protected endpoint.
- Past tournament dates close in India time, including on the backend. Search now
  filters upcoming open tournaments and is available on mobile and desktop.
- Registration validates team details and a 10-digit phone number, resumes an
  existing pending entry, and allows a rejected payment to be retried.
- Paid registration routes to `/payment/[registrationId]`, waits 15 seconds,
  and requests manual review without a UTR or screenshot. Review remains `PENDING`
  until an admin accepts it; cards and match pages distinguish pending, confirmed,
  and rejected payments.
- Payment review requests are idempotent. Admin verification or rejection applies
  only to a pending entry that requested review.
- Corrected misleading room and payment wording and unified contact email.

## Configure and run

1. Use `backend/.env.example` and `frontend/.env.example` as templates. Set the
   MySQL `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, and both matching Google
   client IDs. Set the frontend API URL and your actual `NEXT_PUBLIC_UPI_ID`.
2. Put your real UPI QR image under `frontend/public/` and set
   `NEXT_PUBLIC_UPI_QR_IMAGE` to that public path. The page shows a placeholder
   until a QR image is supplied. Check the UPI ID and QR destination before use.
3. In `backend`, run `npm ci`, apply your existing database migrations as needed,
   then `npm run dev`. In `frontend`, run `npm ci` and `npm run dev`.

The site does not automatically release a room at the 15-minute mark. An admin
must enter credentials and release a particular slot when there are room details
to share. A slot can remain unreleased if no room ID is supplied.

## Checks performed

- Backend: `npm test` and `npm run build` passed.
- Frontend: `npm run build` and `npm run lint` passed (lint reports warnings).
- No authenticated live registration or real UPI payment was performed against
  the production database. Test with a fresh future-dated scrim and a test
  account before replacing the deployed site.
