# Framework Explorer: instructions for AI coding agents

This project helps a **non-technical person** compare five CSS frameworks and explore designs by asking you for changes. Keep things simple and safe for them.

## What's here

```
index.html              Landing page (plain CSS, no framework). Links to each demo and lists "My experiments".
bootstrap/index.html    Bootstrap 5.3 demo
tailwind/index.html     Tailwind CSS 4 demo (browser build)
bulma/index.html        Bulma 1.0 demo
materialize/index.html  Materialize 1.0 demo
foundation/index.html   Foundation 6.8 demo (needs jQuery)
shared/style-picker.js  🎨 Style picker (fonts, colours, borders). Every demo loads it with one <script> line before </body>.
```

Every demo page builds the **same pretend property inspection website** ("Keystone Inspections"), with the same sections in the same order: navbar, hero, services, pricing table, sample report (tabs, alerts, progress, modal), booking form, **Layout & Containers** showcase, buttons and badges, then a "Try this with your AI agent" prompt box. That makes side-by-side comparison fair.

## Rules

1. **Never overwrite the original demo pages** (`*/index.html`) unless the user explicitly asks you to. For any new design, **make a copy** in the same framework folder with a short, descriptive name, for example `bootstrap/dark-navy.html` or `tailwind/luxury.html`.
2. **Register every new page on the landing page.** Add an `<li>` inside `<ul id="experiment-list">` in `/index.html`. The link opens in a new tab:
   ```html
   <li><a href="bootstrap/dark-navy.html" target="_blank" rel="noopener">Bootstrap: dark navy</a> <span class="muted">(premium look with gold accents)</span></li>
   ```
3. **No build tools.** No npm, bundlers or installs. Everything loads from a CDN with a pinned version, and files open directly in the browser by double-clicking them. Keep using the same CDN links that are already in each page.
4. **Use lorem ipsum for body text.** Short labels (brand name, menu items, headings, buttons, form labels) stay in property inspection terms, and paragraphs and descriptions are lorem ipsum. Follow this unless the user asks for real copy.
5. **Keep the explorer pieces** on copied pages: the dark "You're viewing X" bar at the top with its `../index.html` back link, the prompt box at the bottom, and the `<script src="../shared/style-picker.js" data-framework="...">` line before `</body>` (the 🎨 button). Update the prompt box with ideas that fit the new design.
6. **Use the framework's own components** (its cards, grid, modals and so on) rather than lots of custom CSS. The point is to show what each framework does. A small `<style>` block for tweaks is fine.
7. **Explain in plain language.** When you finish, tell the user which file you made, how to open it (via "My experiments" on the home page), and what changed, without jargon. If they use a component name from the grey labels (such as "horizontal card" or "accordion"), that's the matching section of the page.
8. **"Copy my choices" messages** come from the 🎨 picker (a list like "Main colour: #b8901c, Heading font: Playfair Display, Corner roundness: 16px"). Build that look into a new copy using the framework's own settings (CSS variables, theme colours) rather than piling on overrides. To teach the picker a new component, edit the matching framework section in `ADAPTERS` inside `shared/style-picker.js`.
9. If they ask to compare frameworks, build the same design in each one as separate files so they can flip between tabs.
