# Loom & Lore — Storefront

Portfolio DTC storefront for the Loom & Lore lifecycle marketing/Klaviyo project.

Live site: https://loom-and-lore.vercel.app/

## Portfolio implementation

The checkout is a portfolio simulation. It does not process real payments.

When a portfolio order is submitted, the Vercel serverless endpoint at `/api/order` sends a server-side `Placed Order` event to Klaviyo. The Klaviyo private API key is kept in a Vercel environment variable and is never exposed to browser JavaScript.

### Vercel environment variable

Create:

`KLAVIYO_PRIVATE_API_KEY`

Use a Klaviyo private API key with permission to write events. Never commit the key to GitHub.

### Event payload

The event contains:
- customer email
- first name
- order ID
- order value
- currency
- product names
- product IDs
- quantities
- item prices
- storefront source

This supports the portfolio Post-Purchase flow and can later be used for purchase suppression in Abandoned Cart and purchase-recency logic for Win-Back.

## Important

This is a self-directed portfolio project. Do not claim real customer revenue or real campaign performance.
