# Sneak Beat — demo website · handoff (read this first in a new chat)

## 1. What this is
A premium demo website for **Sneak Beat**, a sneaker store at **4 Aram St, 1st floor, Kentron, Yerevan** (Instagram **@sneakbeat.yvn**, verified, 14K followers; linked to the distributor @fstyle.group). The store has no website. This demo is a **pitch** to sell them a site. It will be shown **in person on the laptop** (no public link — see §7).

Store facts used: hours 10:00–22:00 daily · store phone +374 43 300366 · delivery phone +374 96 501514 · map 40.179191, 44.514619 · brands on shelves: Nike, Jordan, adidas, New Balance, On, Vans, Puma, Converse, Crocs, Camper · captions mostly Armenian · bio "In the heart of Yerevan, we move in beat" · brand = red "SNEAK BEAT" wordmark (~#C1232A) on grey (#DADADA).

## 1b. Where the code lives
**GitHub (private): https://github.com/WebSpace-am/sneakbeat-demo** — branch `main`. Levon (GitHub `lamer1333`, admin) deploys it on a temporary domain (~4 days, from 27 Oct 2026) to show the store's manager; take it down afterwards. Every page carries a demo notice ("not the official store — nothing is sold or sent"). In a new chat: `gh repo clone WebSpace-am/sneakbeat-demo`.

## 2. Run it
```
# inside the cloned repo (repo root = the site)
python3 -m http.server 5173
```
- Mac: http://localhost:5173 (hard refresh Cmd+Shift+R after changes)
- Phone on the same Wi-Fi: http://<Mac's IP>:5173 (was 192.168.0.104)
- Node for syntax checks: `~/.nvm/versions/node/v24.22.0/bin/node --check js/app.js`

## 3. Tech & files (plain HTML/CSS/JS, no build step, no framework)
| File | What's in it |
|---|---|
| `index.html` | Shell: header (logo · Shop · Brands · Store · ENG/РУС/ՀԱՅ · search · favourites · account · bag), mega-menu containers, promo strip, footer, layers (bag drawer, search, auth modal, phone menu, size guide, zoom), toast |
| `js/data.js` | **Everything the owner edits**: store info, delivery fees, hero film, `drop` (weekly hero, off), `brandInfo` (stories + Instagram photo per brand), `logos`, `brands`, feed, size chart, colours, model descriptions, **18 products** |
| `js/i18n.js` | All interface text in **en / ru / hy** (~260 keys each) |
| `js/app.js` | Hash router + all views: Home, Shop (filters/sort/chips, brand pages), Product page, Checkout, Order done, Favourites, Account, Store, Help, 404; header/mega menus (Shop + Brands, interactive rail), phone menu, bag, search, email-first auth, curved logo band, assistant |
| `css/style.css` | Design system + all styles |
| `assets/products/` | 18 products × 4–6 studio angles (borrowed from kith.com — DEMO ONLY) |
| `assets/ig/` | 12 photos from @sneakbeat.yvn (512px max, public profile) |
| `assets/video/` | Hero film: Mixkit #98 "person walking on crosswalk" (free licence) + alternative #4893 |
| `assets/logos/` | Brand logos: Simple Icons (Nike, Jordan, adidas, New Balance, Puma) + Wikimedia (On, Vans, Converse, Crocs public domain; Camper CC BY-SA 3.0) |
| `assets/store/` | Storefront photo from the user, split into left ("SNEAK") and right ("BEAT") halves + full version (used as share preview image) |
| `NEXT-STEPS.md` | Running log of decisions, critique and plan |

Routes: `#/` home · `#/shop?gender=&brand=&size=&color=&style=&price=&sort=&q=` · `#/p/<slug>` · `#/checkout` · `#/order/<id>` · `#/favorites` · `#/account` · `#/store` · `#/help/<section>`.
Data saved only in the visitor's browser (localStorage `sb_*`): bag, favourites, accounts (hashed passwords), orders, language. **No backend.**

## 4. What the site has now
- **Header:** transparent white over the hero film on the home page, solid white elsewhere; hides on scroll down. Logo · Shop · Brands · Store · language button (ENG/РУС/ՀԱՅ + small menu) · icons.
- **Shop mega menu** (desktop): Nike/adidas style, interactive — New in / Men / Women / All shoes on the left; hovering swaps Style, Brands and 2 newest pairs on the right. 18px bold headings. Widths set from measured HY/RU/EN labels.
- **Brands mega menu**: same pattern — 10 brands left (Crocs/Camper grey "Store"); hover shows story, "Shop all X · N pairs", newest pairs.
- **Phone menu**: rows with dividers + chevrons (New in · Shop › · Brands › · Store), sections open with "‹ Back · Title" bar; Brands rows have shoe thumbnails; Favourites / Sign in / Help / Instagram below.
- **Home**: On-style hero film (short caption "In the heart of Yerevan / We move in beat.", Shop new in, pause button) → trust strip (evenly spaced, centred) → "Just dropped" rail → **curved, endlessly rotating logo band** (plain-JS port of a React "tilted grid hero"; black logos on white cards, Crocs/Camper in original colours, clickable, pauses on hover/touch, frozen for reduced motion) + big pill brand buttons → dark store band ("Come try them on") → Instagram feed (4, no repeats) → drop-alert email → red-on-grey footer (3 columns, giant wordmark).
- **Shop page**: filters (gender without counts, brand, size, price, colour, style), sort, chips, 3–4 columns.
- **Brand pages** (`#/shop?brand=X`): big name, one-line story (HY/RU/EN), New in/Men/Women chips, the store's Instagram photo ("As seen on @sneakbeat.yvn"), brand switcher row.
- **Product page**: all angles in a 2-column grid on desktop / swipe on phone, colourway thumbnails, EU size grid with "please select a size" shake, sold-out sizes crossed, fly-to-bag animation, accordions, sticky add-to-bag on phones, size guide.
- **Bag drawer** (free-delivery line), **distraction-free checkout** (logo + "Questions? Call"), order confirmation, **email-first sign-in/join**, account, favourites, **search** (product cards), **store page** (storefront diptych, address, hours, both phones, map), **help** page.
- **Assistant** (END.-style floating panel, "Ask" button): finds shoes by brand/colour/style/men-women/price with cards + exact "See all N" link, converts EU/US/UK sizes, answers delivery/exchange/payment/address/hours, hands off to Instagram/phone. **Rule-based demo, no AI, no key** — says so under "About this assistant". To make it real AI: replace `reply()` in `js/app.js` with a call to a small server proxy holding an Anthropic API key (never put the key in the website).
- 3 languages everywhere; 44px touch targets; no horizontal overflow at 375–1920px; 0 JS errors in the last full audit.

## 5. The user's preferences (important)
- **Minimalism over everything.** They removed the animated "Beat" hero, a classic hero, a red brand ticker and a demo switch. Don't propose flashy animation unless asked (the logo band was their own request).
- Likes **On / Nike / adidas / END.** patterns; asks to "analyse popular stores" before redesigns — do real research, measure, then recommend one option.
- Wants **their Instagram photos** rather than Unsplash; no "AI-looking" details; dislikes unreadable text (no faded links, no squeezed Armenian headline font in menus).
- Asks for a critique + hint first, then says "build it". Reply in plain language; they verify on their phone.
- Weekly-drop hero idea ("Samba OG is back") is **off** — they'll pitch it to the client themselves (`drop: null` in data.js; example commented there).

## 6. Open items
- Optional: 2 Instagram posts instead of 4 on phones.
- Home "Come try them on" band still uses the two in-store reels (could use the storefront photo).
- Pitch pack for the client: questions list (below), shoot brief, weekly-drop idea, phase-2 scope.
- **Before any launch**: replace Kith product photos, Mixkit film and demo logos with the client's own/official files; real prices & stock; privacy + terms pages; WebP/AVIF images; real backend (orders, accounts, payments: ArCa/Visa/MC, Idram, Telcell, cash on delivery; order alerts to Telegram/email); domain + hosting.

## 7. Rules to keep
- **Do not publish the demo publicly**: it uses the real store's name, address and phones, has sign-up/checkout forms, and borrowed Kith photos. Show it in person or on the same Wi-Fi only, until the client approves and supplies their own content.
- Never invent reviews, ratings, stock counts or "X people viewing". Prices, delivery fees (1 000 ֏ Yerevan, 2 500 ֏ regions, free over 50 000 ֏) and the 14-day exchange are **demo values to confirm**.

## 8. Questions for the client
1. Vector logo (SVG)
2. Original photos/videos from their SMM team; a product shoot on light grey (side, pair, toe, heel, sole); a 10–15 s film for the hero (slow motion, street + store, plus a vertical phone version)
3. Real product list: names, prices, sizes in stock
4. Delivery fees, free-delivery threshold, exchange policy
5. Payment methods
6. Where orders should arrive (Telegram / email); real accounts + database?
7. Default language (now: visitor's browser language, Armenian otherwise)
8. Official brand logo files from the distributor

## 9. Starter prompt for a new chat
> I'm continuing a demo website for Sneak Beat (sneaker store, Yerevan). Clone it with `gh repo clone WebSpace-am/sneakbeat-demo` (private, my account Morpheusedo has access). Read `HANDOFF.md` and `NEXT-STEPS.md` first, start the local server (`python3 -m http.server 5173` in the repo root), then wait for my next request. I prefer minimal, readable design like On / Nike / END., critique + recommendation before building, and plain-language answers.
