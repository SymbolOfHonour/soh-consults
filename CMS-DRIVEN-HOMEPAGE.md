# CMS-driven homepage

The public `/` route now reads Site Manager settings at request time.

## Controlled from Site Manager
- section order and visibility
- section titles/descriptions/layouts/items
- mobile/tablet/desktop visibility
- hero copy
- navigation
- WhatsApp/contact settings
- latest update count
- footer text

The renderer falls back to safe defaults if the settings store is unavailable. Calculator logic, authentication, database schema and publishing APIs remain outside the visual page builder.
