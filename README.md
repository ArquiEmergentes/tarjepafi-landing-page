# TarjePAFI Landing Page

Landing Page for **TarjePAFI**, an NFC credential and IoT platform for attendance, access control, space booking and occupancy monitoring at universities. Built by PAFI Solutions.

Built with **HTML5, CSS3 and vanilla JavaScript** only. It has no build step and no dependencies.

## Features

| User Story | Implementation |
| --- | --- |
| US26 - Features overview | `#features` section with six feature cards. |
| US27 - Contact and support | Contact button in the header, hero, mobile menu and a floating button. Each opens a contact modal. There is also an inline form in `#contact`. Both forms validate on the client and show a confirmation. |
| US05 - Mobile use | Responsive layout with a hamburger menu below 900px. |
| US09 - FAQ | `#faq` accordion. Each question expands its answer. |
| TS-CON03 - i18n and accessibility | English by default, Spanish (es-419) via the EN/ES switch or `?lang=es`. Semantic landmarks, skip link, keyboard support, ARIA states and reduced-motion support. |

## Project structure

```
index.html
css/styles.css          Styles (tokens from the report's Style Guidelines)
js/i18n.js              EN / ES translations
js/main.js              Menu, language switch, FAQ, modals, form validation
assets/images/          Logo, favicon and illustrations (SVG)
```

## Run locally

Open `index.html` in a browser, or serve the folder:

```bash
npx serve .
# or
python -m http.server 8080
```

## Deployment

Deployed with GitHub Pages from the `main` branch, root folder (`Settings > Pages > Deploy from a branch`).

## Notes

- The contact form has no backend yet. Submissions are simulated in `js/main.js` (`initForms`).
- The photos in `assets/images/*.png` are exported from the Figma mock-up without their badges. The badges are HTML (`.media-badge`), so they follow the language switch.
