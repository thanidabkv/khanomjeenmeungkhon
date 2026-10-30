# ขนมจีนเมืองคอน ถนนพานยม · Khanom Jeen Mueang Khon

A one-page website for Khanom Jeen Mueang Khon, a family Southern Thai khanom jeen restaurant on Thanon Phanyom, Nakhon Si Thammarat (since 1977).

Plain HTML, CSS and JavaScript. No build step: open `index.html` or host the folder on GitHub Pages.

## What's on the page

- Fixed nav with a scroll progress bar, the active section highlighted, and a phone menu
- An "Open now / Closed" badge using Thailand time (08:00–15:00)
- Hero, Story, the five nam ya, a tabbed menu with prices, How to Eat, the signature dessert (กวนขาว), Wat Phra Mahathat, Visit (with a Google Maps embed) and a footer
- Works on phones; respects "reduce motion"

## Files

```
index.html
styles.css
script.js
assets/
  logo-mark.svg      redrawn triple-spiral mark
  favicon.svg
  img/               photos cropped from the restaurant's Canva decks
```

## Run it locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Still missing / to confirm

- **Opening hours:** the Canva poster says 08:00–15:00, but an earlier brief said 08:00–15:30. The site uses 08:00–15:00 (in the page and in `script.js`).
- **Phone numbers:** 075-342-615 and 089-871-8867 still need confirming.
- **Facebook and Google Reviews links:** the page shows the names but doesn't link to them yet. Add the real URLs.
- **Logo:** `assets/logo-mark.svg` is a redrawn version of the triple spiral. Replace it with the original vector if there is one.
- **Photos:** the dessert and fried side photos are small crops from slides and look soft on large screens. The official menu photos would look better.
- **หนังไก่กรอบ** has a photo but no price on the official menu.
- **English descriptions** of the nam ya and some menu notes were written for the site. Ask the family to check them.
- **Photo credits / permission:** all photos come from the restaurant's own Canva decks. Confirm they can be published.
- **No English/Thai toggle:** the page mixes both languages.
- **Not included:** ordering, delivery links (Grab, LINE MAN), a LINE contact, and a custom domain.
- **UNESCO claim** for Wat Phra Mahathat was left out because it hasn't been verified.
