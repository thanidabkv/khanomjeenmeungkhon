# ขนมจีนเมืองคอน ถนนพานยม · Khanom Jeen Mueang Khon

A one-page website for Khanom Jeen Mueang Khon, a family Southern Thai khanom jeen restaurant on Thanon Phanyom, Nakhon Si Thammarat (since 1977).

Plain HTML, CSS and JavaScript. No build step: open `index.html` or host the folder on GitHub Pages.

## What's on the page

- Fixed nav with a scroll progress bar, the active section highlighted, a phone menu, and a sound button
- An "Open now / Closed" badge using Thailand time (08:00–15:00)
- Hero with drifting steam over the curry pots and the real logo
- Story with a drag-through-the-years timeline (1977 → today)
- City section: parallax temple photo, a map pin that walks from Wat Phra Mahathat to the shop as you scroll, and an optional temple bell (synthesised in the browser, off until you turn it on)
- Five Pots infographic: tap a bowl and it lifts, fills with its curry colour and builds a bowl (noodles, curry, vegetables); heat and richness meters; the best side dish to order with it, with its price
- Tabbed menu with official prices
- How to Eat, plus a "tap to taste" pairing guide with a crunch sound when sound is on
- Signature dessert (กวนขาว) that fades in slowly on a darker background
- Visit with a Google Maps embed, photo credits in the footer
- Works on phones; respects "reduce motion"

## Files

```
index.html
styles.css
script.js
assets/
  logo-mark.png        real triple-spiral mark (from the restaurant's Canva files)
  logo-full-white.png  real full logo, white
  favicon.png
  img/                 restaurant photos + three Wikimedia Commons photos (credited)
```

## Run it locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Still missing / to confirm

- **Opening hours:** the Canva poster says 08:00–15:00, but the brief and the notes on the Canva dessert slide say 08:00–15:30. The site uses 08:00–15:00 (in the page and in `script.js`).
- **Phone numbers:** 075-342-615 and 089-871-8867 still need confirming.
- **Facebook and Google Reviews links:** the page shows the names but doesn't link to them yet. Add the real URLs.
- **Logo:** the logo PNGs were cut out of slide exports. A vector (SVG/AI) original would be sharper.
- **Photos:** the dessert and fried side photos are small crops from slides and look soft on large screens. The official menu photos would look better.
- **หนังไก่กรอบ** has a photo but no price on the official menu.
- **English descriptions** of the nam ya and some menu notes were written for the site. Ask the family to check them.
- **Heat/richness levels (น้ำพริก set as the mildest), best side dishes and pairings** in the Five Pots and Tap-to-taste features are a best guess. Ask the family to confirm.
- **Timeline:** only 1977 and "today" are facts. Add real family milestones (who started it, who cooks now) and old photos if there are any.
- **Photo credits / permission:** food photos come from the restaurant's Canva decks; confirm they can be published. Three photos come from Wikimedia Commons under CC BY-SA 4.0 and are credited in the footer:
  - Wat Phra Mahathat, by Preecha.MJ
  - Chedi with pigeons, by Pthawatc
  - ผักเหนาะ collage, by Supisara.plus
- **No English/Thai toggle:** the page mixes both languages.
- **Not included:** ordering, delivery links (Grab, LINE MAN), a LINE contact, and a custom domain.
- **UNESCO claim** for Wat Phra Mahathat was left out because it hasn't been verified.
