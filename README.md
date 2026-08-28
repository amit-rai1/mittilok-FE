# MittiLok customer frontend

The customer app uses the REST API in `../Bcakend` for authentication and database-backed features.

1. Copy `.env.example` to `.env` if the API is not running at the default URL.
2. Run `npm install`.
3. Run `npm run dev`.

Customer registration uses a phone number, password, full name, and optional email. A successful registration stores the JWT session and takes the customer to `/account`, where future orders, bookings, wishlist items, plants, and care reminders belong to that account.