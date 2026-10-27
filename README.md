# Sneak Beat — demo website

A pitch demo of an online store for **Sneak Beat** (sneaker store, 4 Aram St, Yerevan · [@sneakbeat.yvn](https://www.instagram.com/sneakbeat.yvn/)).
Plain HTML / CSS / JavaScript — **no build step, no backend, no dependencies**. Armenian · Russian · English.

> **Demo only.** Every page shows a notice that this is not the official store. Nothing is sold, charged or sent:
> bag, favourites, accounts and orders live only in the visitor's own browser (localStorage).

## Run locally
```
python3 -m http.server 5173
```
Open http://localhost:5173

## Deploy (temporary demo, ~4 days)
It is a static site: publish the **repository root** (where `index.html` is). No build command. Routing uses `#/…` hashes, so no rewrite rules are needed.

- **Netlify:** Add new site → Import from Git → pick this repo → Build command: *(empty)* → Publish directory: `.`
- **Vercel:** New Project → import repo → Framework preset: *Other* → Build command: *(empty)* → Output directory: `.`
- **Cloudflare Pages:** Create → Connect to Git → Build command: *(empty)* → Build output directory: `/`

Recommended: share the link only with the store's manager, add a password if the host offers it, and **take the deployment down after the demo**.

## Where things are
| File | Contents |
|---|---|
| `index.html` | Page shell: demo notice, header, menus, footer, drawers |
| `js/data.js` | Store info, delivery fees, brands, logos, products — **edit content here** |
| `js/i18n.js` | All interface text in en / ru / hy |
| `js/app.js` | Router, pages, menus, bag, checkout, accounts, search, logo band, assistant |
| `css/style.css` | Design system and styles |
| `HANDOFF.md`, `NEXT-STEPS.md` | Project notes, decisions, open items, questions for the client |

## Credits & licences — demo assets (replace before any real launch)
- **Product photos** (`assets/products/`): studio shots from kith.com, used **only** to show how the catalogue will look. Not licensed for production — replace with the brands' official assets or the store's own shoot.
- **Store photos** (`assets/ig/`, `assets/store/`): Sneak Beat's own Instagram posts and storefront photo.
- **Hero film** (`assets/video/`): [Mixkit](https://mixkit.co/) clip #98 (and #4893), Mixkit free licence.
- **Logos** (`assets/logos/`): Nike, Jordan, adidas, New Balance, Puma from [Simple Icons](https://simpleicons.org/) (CC0); On, Vans, Converse, Crocs from Wikimedia Commons (public domain); Camper — "Camper shoes Logo.png", Wikimedia Commons, **CC BY-SA 3.0**. All logos are trademarks of their owners; use official files from the brands / distributor for launch.
- Fonts: Inter, Inter Tight, Noto Sans Armenian (Google Fonts, SIL OFL).
