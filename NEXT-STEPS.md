# Sneak Beat — where we stopped (22 Oct 2026)

## Run it
```
cd sneakbeat && python3 -m http.server 5173
```
Open http://localhost:5173 (phone on same Wi-Fi: http://192.168.0.104:5173). Hard refresh with Cmd+Shift+R after changes.

## What's done
- Home: On-style film hero (transparent nav over video, short caption, pause button), trust strip, "Just dropped" rail, compact brand grid, store band, Instagram feed (4, no repeats), drop alerts, red-on-grey footer.
- Nav: logo · Shop · Brands · Store · icons only. Language switch in footer + mobile menu.
- Shop page (filters, sort, chips), product page (all angles grid on desktop, swipe on phone, colourways, sizes, sticky add-to-bag), bag drawer, checkout, order confirmation, email-first sign in / join, account, favourites, search, store page with map, help page.
- 18 demo products (Kith studio photos), 3 languages (HY/RU/EN), 44px touch targets, reduced-motion support.

## Critique of the site today
| # | Area | Problem | Severity |
|---|---|---|---|
| 1 | Shop menu | Hard to read: fading links, tight Armenian headline font, 3 text styles + photos, spread across full width | High |
| 2 | Menus overall | Desktop dropdowns and the mobile menu are two different systems; Brands dropdown is still a plain list | Medium |
| 3 | Shop filters | Men 14 / Women 12 counts include unisex pairs twice — looks wrong to a customer | Medium |
| 4 | Checkout, sign-in, search | Built on day 1, never re-reviewed against the new minimal style | Medium |
| 5 | Content | Demo photos (Kith), demo film (Mixkit), demo prices, Instagram images only 512px, typeset logo | High before launch |
| 6 | Speed | Video 3 MB, product JPGs 1200px — convert to WebP/AVIF with responsive sizes before launch | Medium |
| 7 | Legal / trust | No privacy or terms-of-sale pages (sign-in and checkout text refer to them) | Medium before launch |
| 8 | Backend | Accounts, orders, stock, payments are browser-only demo | Launch blocker |

## Done on 23 Oct (pre-pitch session)
- Pre-pitch audit: 0 JS errors on all pages × HY/RU/EN, no phone overflow, purchase + sign-up/sign-in flows pass, test data cleaned.
- Shop menu rebuilt Nike/adidas-style and interactive: New in · Men · Women · All shoes on the left; hovering swaps Style, Brands and the 2 newest pairs on the right. Plain text font, black text, no fading. Column widths set from measured HY/RU/EN labels; no wrapping at 1024–1920px.
- Gender filter shows no counts (unisex belonged to both); brand counts add up to 18.
- Small thumbnails zoom the shoe (bag, checkout, search, sticky bar, orders, colourways).
- Checkout is distraction-free: logo + "Questions? Call +374 43 300366"; no menu, promo line or footer.
- Search results are product cards.
- Desktop dropdowns are switched off below 1024px.
- Demo is shown in person on the laptop — no public link needed (keeps the borrowed Kith photos private).

- Language switch moved to the header (ENG / РУС / ՀԱՅ button + small menu); footer language panel and "AMD ֏" removed (prices are dram only).
- Shop menu headings are real headings (18px bold); links lighter.
- Brands menu rebuilt with the same interactive pattern: brands on the left, hovering shows story + "Shop all" + newest pairs; Crocs/Camper marked "Store".
- Assistant (END.-style floating panel, "Ask" button bottom-right; full screen on phones; hidden on checkout): finds shoes by brand / colour / style / men-women / price with product cards and an exact "See all N" shop link, converts EU/US/UK sizes, answers delivery / exchange / payment / address / hours, hands off to Instagram or phone. HY/RU/EN. DEMO ENGINE — rule-based, no AI and no API key; the panel says so under "About this assistant". To make it real AI: replace `reply()` in js/app.js with a call to a small local/server proxy holding an Anthropic API key.
- Brand pages: big brand name, one-line story (HY/RU/EN, editable in `brandInfo` in js/data.js), New in / Men / Women chips, the store's own Instagram photo per brand ("As seen on @sneakbeat.yvn"; New Balance, Puma, Converse are text-only), and a brand switcher row.
- Homepage "Shop by brand" is now a curved, endlessly rotating band of logo cards (plain-JS port of the "tilted grid hero" React component): black logos on white cards over studio grey, Crocs and Camper in their original colours, cards link to brand pages (store page for Crocs/Camper), pauses under the mouse / finger, frozen for reduced-motion, plain list of brand links underneath for keyboard and screen readers.
- DEMO LOGOS in assets/logos: Simple Icons (Nike, Jordan, adidas, New Balance, Puma) + Wikimedia Commons (On, Vans, Converse, Crocs: public domain; Camper: CC BY-SA 3.0). Replace with official files from the brands / distributor before launch.
- Phone menu rebuilt (Footpatrol / Nike app pattern): New in · Shop › · Brands › · Store as rows with dividers and chevrons; sections open with a "‹ Back · Title" bar; Shop has New in / Men / Women / All shoes + Style group; Brands rows carry the key-shoe thumbnail, Crocs/Camper in grey "In store"; Favourites, Sign in, Help, Instagram below.

## Done on 22 Oct (session 3)
- Ask button is Sneak Beat red with a walking "beat": 4 footsteps (dip, squash, tilt left/right) at 112 steps/min, then a rest; holds still under the cursor/focus; off for reduced motion. Pace = `--step` in `.as-launch` (css/style.css).
- Logo band no longer pauses under the mouse/finger — it keeps swinging (still frozen for reduced motion).
- Phones: hero pause button moved above the Ask button (they overlapped, pause couldn't be tapped).
- "Shop by brand" is one full screen (100svh, 560–1100px) on the studio grey: heading top, band fills the middle, brand pills at the bottom. Cards are never cut top/bottom (checked 375, 768, 1280, 1440, 1920 wide). Band 25% faster (`speed: 4` s per card in `BAND`, js/app.js). Phones: cards may be 62% of the width (`MAX_WIDTH_PHONE`) so they fill the screen.

- Brand pages (Nike / END. style): a wide official brand photo edge to edge under the header (≈56% of the screen on laptops so the first pairs peek in, 4:5 on phones), name + one line + New in / Men / Women in white bottom-left over a dark fade (`light: true` = deeper fade for pale photos). All 8 brand pages have one — sources in assets/brands/SOURCES.md (DEMO ONLY, replace before launch). The store's Instagram photo moved below the products ("As seen on @sneakbeat.yvn"). A brand can also take a looping `video` instead of a photo (same pause button as the home film).

## Still open
- Optional: 2 Instagram posts instead of 4 on phones.
- Pitch pack for the client (questions, shoot brief, weekly-drop idea, phase-2 scope).
- Ask the client/distributor for official brand banner photos (16:9 or wider, calm area bottom-left) to replace the demo ones.

## Plan from 22 Oct (original order)
1. **On-style menu panel** — "Shop" opens a white panel from the right (≈40% desktop, full screen on phone): New in · Men · Women · All shoes in 28px black semi-bold, normal letter-spacing; Style ▸ and Brands ▸ expand into 18px black links; no photos, no fading, page dims behind. Same panel replaces the mobile menu and the Brands dropdown.
2. **Filter counts** — count unisex once; show "Men (incl. unisex)" logic clearly.
3. **Design pass** on shop page, product page, checkout, sign-in and search with the new header (spacing under the transparent nav, one red, two text sizes).
4. *(Optional)* **Phone only:** show 2 Instagram posts instead of 4 (≈400px shorter). Homepage length is fine as is: 5.3 screens on desktop and 5.8 on phone, versus END. 4.9, On 7.1, Kith 9.2, Nike 13.2.
5. **Pitch pack for the client** — questions list, shoot brief (film + product angles), weekly-drop hero idea (code ready: `drop` in js/data.js).

## Questions for the client (still open)
- Vector logo (SVG)
- Original photos/videos from the SMM team; product shoot on light grey (side, pair, toe, heel, sole)
- Real product list: names, prices, sizes in stock
- Delivery fees, free-delivery threshold, exchange policy (demo: 1 000 ֏ Yerevan, 2 500 ֏ regions, free over 50 000 ֏, 14-day exchange)
- Payments: card bank (ArCa/Visa/MC), Idram, Telcell, cash on delivery?
- Where orders should arrive (Telegram / email), and whether to set up real accounts + database (Supabase)
- Default language (currently: visitor's browser language, Armenian otherwise)
