# Order Form — captured from Annie's Google Form (2026-07-23)

Source: the live Google Form. Captured page by page. Pricing updated to $125 per Christine
(the Google Form still says $100). We did NOT submit the test — no fake response recorded.

## Google Form structure (verbatim)

### Intro
"Thank you for considering ordering a holiday arrangement from Luna's Bouquet!... Each arrangement
is carefully crafted with fresh, seasonal flowers for $100 [→ $125], which includes delivery within
the Phoenix Metro Area including Scottsdale. All payments can be made by check, Venmo or Zelle and I
will reach out for payment after the form is submitted." + Annie's note + ahnaleigh24@gmail.com.

### Page — Holiday Flower Arrangement Selection (checkboxes, multi-select)
Heading note: "Select the holidays you'd like arrangements for below. I'll reach out to confirm your
order and payment details for each date. 🌸 Order 3 or more arrangements and get $10 off each one!"
Group label: "Holiday Flower Arrangements - $100" [→ $125]
Options (label + delivery date):
- Thanksgiving — Tuesday, Nov 25th
- Christmas — Tuesday, Dec 23rd
- Valentines — Friday, Feb 13th
- Easter — Friday, April 3rd
- Mother's Day — Friday, May 8th
- Fourth of July — Tuesday, July 2nd
- Monthly Floral Arrangement Subscription — First Friday of the Month

### Page — Customer Info
- First & Last Name (short text)
- Phone Number (short text)
- Email (short text)

### Page — Recipient Info
- First & Last Name (short text)
- Recipient Address (paragraph)

### Page — Special Instructions
- Personalized Message for Card (short text)
- Any special delivery instructions? Gate code, leave with neighbor, etc. (paragraph)

## Our on-site form (single beautiful page, same fields + additions)
1. **What are you ordering** (checkbox group, multi-select), each $125:
   Thanksgiving, Christmas, Valentine's, Easter, Mother's Day, Fourth of July, Monthly Subscription.
   PLUS one added option: **Custom arrangement / Event** → reveals a details textarea + notes the
   $375 minimum for custom/event orders (business does events + one-offs; Google Form is holiday-only).
2. **Your info:** Name*, Phone*, Email* (required)
3. **Recipient:** Name*, Delivery address* (required)
4. **Card message** (optional)
5. **Delivery instructions** (optional)
6. Show a live estimate: count × $125, minus $10/each if 3+ arrangements. Note payment
   (Venmo/Zelle/check/cash) is arranged after; Annie reaches out to confirm.
7. Honeypot anti-spam field (hidden).

## Supabase `orders` table columns
id (uuid), created_at, customer_name, customer_phone, customer_email, recipient_name,
recipient_address, arrangements (text[]/jsonb), custom_details (text), card_message (text),
delivery_instructions (text), estimated_total (int), source (text default 'website').
