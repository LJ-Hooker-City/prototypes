/* =====================================================================
   🎨 Style picker (explorer tool, not part of the demo site)

   Adds a round 🎨 button to the bottom-left of a demo page. It opens a
   panel for changing fonts, colours and borders live. Choices are saved
   in this browser only (per page) and "Reset" puts everything back.

   Each page loads it with ONE line just before </body>:
     <script src="../shared/style-picker.js" data-framework="bootstrap"></script>
   data-framework is one of: bootstrap, tailwind, bulma, materialize, foundation

   Modelled on the token picker in ../Music_website_Ryan_Berlin/index.html.
   To remove it from a page, delete that one <script> line.
   ===================================================================== */
(function () {
  var me = document.currentScript;
  var FW = (me && me.getAttribute('data-framework')) || 'bootstrap';

  /* ---------- Fonts: [label, CSS font-family, Google Fonts spec or null] ---------- */
  var SANS = ', system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
  var FONTS = [
    ['Framework default', '', null],
    ['System sans',       'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif', null],
    ['System serif',      'Georgia, "Times New Roman", serif', null],
    ['System mono',       'ui-monospace, Menlo, Consolas, monospace', null],
    ['Inter',             '"Inter"' + SANS, 'Inter:wght@400;500;600;700'],
    ['DM Sans',           '"DM Sans"' + SANS, 'DM+Sans:wght@400;500;600;700'],
    ['Work Sans',         '"Work Sans"' + SANS, 'Work+Sans:wght@400;500;600;700'],
    ['Montserrat',        '"Montserrat"' + SANS, 'Montserrat:wght@400;500;600;700'],
    ['Poppins',           '"Poppins"' + SANS, 'Poppins:wght@400;500;600;700'],
    ['Nunito',            '"Nunito"' + SANS, 'Nunito:wght@400;600;700'],
    ['Space Grotesk',     '"Space Grotesk"' + SANS, 'Space+Grotesk:wght@400;500;600;700'],
    ['Oswald',            '"Oswald"' + SANS, 'Oswald:wght@400;500;600;700'],
    ['Bebas Neue',        '"Bebas Neue"' + SANS, 'Bebas+Neue'],
    ['Archivo Black',     '"Archivo Black"' + SANS, 'Archivo+Black'],
    ['Fraunces',          '"Fraunces", Georgia, serif', 'Fraunces:opsz,wght@9..144,400..700'],
    ['Playfair Display',  '"Playfair Display", Georgia, serif', 'Playfair+Display:wght@400;600;700'],
    ['EB Garamond',       '"EB Garamond", Garamond, Georgia, serif', 'EB+Garamond:wght@400;500;600'],
    ['Lora',              '"Lora", Georgia, serif', 'Lora:wght@400;600;700'],
    ['Merriweather',      '"Merriweather", Georgia, serif', 'Merriweather:wght@400;700'],
    ['Libre Baskerville', '"Libre Baskerville", Georgia, serif', 'Libre+Baskerville:wght@400;700'],
    ['Space Mono',        '"Space Mono", ui-monospace, monospace', 'Space+Mono:wght@400;700'],
    ['Courier Prime',     '"Courier Prime", ui-monospace, monospace', 'Courier+Prime:wght@400;700'],
    ['Caveat',            '"Caveat", cursive', 'Caveat:wght@400;700']
  ];
  function fontByValue(v) { for (var i = 0; i < FONTS.length; i++) if (FONTS[i][1] === v) return FONTS[i]; return null; }
  function gfUrl(specs) { return 'https://fonts.googleapis.com/css2?family=' + specs.join('&family=') + '&display=swap'; }
  var loadedFonts = {};
  function addFontLink(specs) {
    specs = specs.filter(function (s) { return s && !loadedFonts[s]; });
    if (!specs.length) return;
    var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = gfUrl(specs);
    document.head.appendChild(l); specs.forEach(function (s) { loadedFonts[s] = true; });
  }
  function loadFont(v) { var f = fontByValue(v); if (f) addFontLink([f[2]]); }
  function loadAllPreviews() { addFontLink(FONTS.map(function (f) { return f[2]; })); }

  /* ---------- Small colour helpers ---------- */
  function rgbOf(hex) {
    hex = hex.replace('#', ''); if (hex.length === 3) hex = hex.replace(/./g, '$&$&');
    var n = parseInt(hex, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function rgbStr(hex) { return rgbOf(hex).join(', '); }
  function isLight(hex) {
    var c = rgbOf(hex).map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2] > 0.4;
  }
  function onColour(hex) { return isLight(hex) ? '#111111' : '#ffffff'; }
  function hslOf(hex) {
    var c = rgbOf(hex).map(function (v) { return v / 255; });
    var max = Math.max.apply(null, c), min = Math.min.apply(null, c), l = (max + min) / 2, h = 0, s = 0, d = max - min;
    if (d) {
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      h = max === c[0] ? (c[1] - c[2]) / d + (c[1] < c[2] ? 6 : 0) : max === c[1] ? (c[2] - c[0]) / d + 2 : (c[0] - c[1]) / d + 4;
      h *= 60;
    }
    return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
  }
  function hslHex(h, s, l) {
    s /= 100; l /= 100;
    var k = function (n) { return (n + h / 30) % 12; }, a = s * Math.min(l, 1 - l);
    var f = function (n) { return Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))))).toString(16).padStart(2, '0'); };
    return '#' + f(0) + f(8) + f(4);
  }
  function mix(a, pct, b) { return 'color-mix(in srgb, ' + a + ' ' + pct + '%, ' + b + ')'; }
  function shade(a, pct) { return mix(a, 100 - pct, 'black'); }   // darker by pct%

  /* ---------- What the panel controls ---------- */
  var COLOUR_TOKENS = [
    ['primary', 'Main colour (buttons, links)'],
    ['bg',      'Page background'],
    ['text',    'Text'],
    ['heading', 'Headings'],
    ['card',    'Cards and panels'],
    ['nav',     'Top menu bar'],
    ['border',  'Border colour']
  ];
  var LABELS = { fontBody: 'Body font', fontHeading: 'Heading font', borderWidth: 'Border thickness',
                 borderStyle: 'Border style', radius: 'Corner roundness' };
  COLOUR_TOKENS.forEach(function (c) { LABELS[c[0]] = c[1]; });

  var HEADINGS = 'h1,h2,h3,h4,h5,h6,.h1,.h2,.h3,.h4,.h5,.h6,.title,.subtitle,.display-4,.card-title,.card-header-title,.modal-title,.modal-card-title,.navbar-brand,.brand-logo,.menu-text,.title-bar-title';

  /* ---------- Per-framework translations ----------
     defaults: what each control shows before you change it (the framework's own look)
     boxes:    things that get the border thickness/style/colour
     round:    things that get the corner roundness (where the framework has no variable for it)
     cards:    things that get the "Cards and panels" colour
     dark:     dark/coloured areas whose headings should stay as they are
     css(v, has): extra framework-specific CSS                                        */
  var ADAPTERS = {
    bootstrap: {
      defaults: { primary: '#0d6efd', bg: '#ffffff', text: '#212529', heading: '#212529', card: '#ffffff', nav: '#f8f9fa', border: '#dee2e6', borderWidth: 1, borderStyle: 'solid', radius: 6 },
      boxes: '.card, .list-group-item, .accordion-item, .modal-content, .form-control, .form-select, .border, .border-bottom, .border-top, .border-start, .border-end',
      cards: '.card, .list-group-item:not(.active), .accordion-item, .accordion-button.collapsed, .modal-content',
      dark: '.bg-dark, .text-bg-dark, .text-bg-primary, .text-white',
      navLinks: '.navbar .nav-link, .navbar-brand',
      css: function (v, has) {
        var o = '';
        if (has.primary) {
          var P = v.primary, T = onColour(P), D = shade(P, 15), D2 = shade(P, 25);
          o += ':root{--bs-primary:' + P + ';--bs-primary-rgb:' + rgbStr(P) + ';--bs-link-color:' + P + ';--bs-link-color-rgb:' + rgbStr(P) +
               ';--bs-link-hover-color:' + D + ';--bs-primary-bg-subtle:' + mix(P, 14, v.bg) + ';--bs-primary-border-subtle:' + mix(P, 40, v.bg) +
               ';--bs-primary-text-emphasis:' + shade(P, 40) + '}\n';
          o += '.btn-primary{--bs-btn-bg:' + P + ';--bs-btn-border-color:' + P + ';--bs-btn-color:' + T + ';--bs-btn-hover-color:' + T + ';--bs-btn-active-color:' + T +
               ';--bs-btn-hover-bg:' + D + ';--bs-btn-hover-border-color:' + D + ';--bs-btn-active-bg:' + D2 + ';--bs-btn-active-border-color:' + D2 +
               ';--bs-btn-disabled-bg:' + P + ';--bs-btn-disabled-border-color:' + P + '}\n';
          o += '.btn-outline-primary{--bs-btn-color:' + P + ';--bs-btn-border-color:' + P + ';--bs-btn-hover-bg:' + P + ';--bs-btn-hover-border-color:' + P +
               ';--bs-btn-active-bg:' + P + ';--bs-btn-active-border-color:' + P + ';--bs-btn-hover-color:' + T + ';--bs-btn-active-color:' + T + '}\n';
          o += '.btn-link{--bs-btn-color:' + P + ';--bs-btn-hover-color:' + D + '}\n';
          o += '.nav-pills{--bs-nav-pills-link-active-bg:' + P + '}.nav{--bs-nav-link-color:' + P + ';--bs-nav-link-hover-color:' + D + '}\n';
          o += '.pagination{--bs-pagination-color:' + P + ';--bs-pagination-hover-color:' + D + ';--bs-pagination-active-bg:' + P + ';--bs-pagination-active-border-color:' + P + ';--bs-pagination-focus-color:' + D + '}\n';
          o += '.progress,.progress-stacked{--bs-progress-bar-bg:' + P + '}.list-group{--bs-list-group-active-bg:' + P + ';--bs-list-group-active-border-color:' + P + '}\n';
          o += '.accordion{--bs-accordion-active-color:' + shade(P, 30) + ';--bs-accordion-active-bg:' + mix(P, 12, v.bg) + ';--bs-accordion-btn-focus-box-shadow:0 0 0 .25rem ' + mix(P, 25, 'transparent') + '}\n';
          o += '.form-check-input:checked{background-color:' + P + ';border-color:' + P + '}\n';
          o += '.form-control:focus,.form-select:focus,.form-check-input:focus{border-color:' + mix(P, 55, 'white') + ';box-shadow:0 0 0 .25rem ' + mix(P, 25, 'transparent') + '}\n';
        }
        if (has.bg) o += ':root{--bs-body-bg:' + v.bg + ';--bs-body-bg-rgb:' + rgbStr(v.bg) + ';--bs-tertiary-bg:' + mix(v.text, 4, v.bg) + ';--bs-secondary-bg:' + mix(v.text, 9, v.bg) + '}\n.bg-body-tertiary:not(.navbar){background-color:' + mix(v.text, 4, v.bg) + '!important}\n';
        if (has.text) o += ':root{--bs-body-color:' + v.text + ';--bs-body-color-rgb:' + rgbStr(v.text) + ';--bs-secondary-color:' + mix(v.text, 72, 'transparent') + '}\n';
        if (has.heading) o += ':root{--bs-emphasis-color:' + v.heading + ';--bs-emphasis-color-rgb:' + rgbStr(v.heading) + '}\n';
        if (has.bg || has.text) o += '.table{--bs-table-bg:transparent;--bs-table-color:' + v.text + ';--bs-table-striped-color:' + v.text + ';--bs-table-hover-color:' + v.text + ';--bs-table-striped-bg:' + mix(v.text, 6, 'transparent') + ';--bs-table-hover-bg:' + mix(v.text, 9, 'transparent') + '}' +
                                     '.table-light{--bs-table-bg:' + mix(v.text, 7, v.bg) + ';--bs-table-color:' + v.heading + '}\n';
        if (has.border) o += ':root{--bs-border-color:' + v.border + ';--bs-border-color-translucent:' + v.border + '}\n';
        if (has.radius) { var r = v.radius; o += ':root{--bs-border-radius:' + r + 'px;--bs-border-radius-sm:' + r * 0.66 + 'px;--bs-border-radius-lg:' + r * 1.33 + 'px;--bs-border-radius-xl:' + r * 2 + 'px;--bs-border-radius-xxl:' + r * 3 + 'px}\n'; }
        if (has.nav) o += '.navbar{--bs-navbar-color:' + mix(onColour(v.nav), 80, 'transparent') + ';--bs-navbar-hover-color:' + onColour(v.nav) + ';--bs-navbar-active-color:' + onColour(v.nav) + ';--bs-navbar-brand-color:' + onColour(v.nav) + ';--bs-navbar-brand-hover-color:' + onColour(v.nav) + '}\n';
        return o;
      }
    },

    tailwind: {
      defaults: { primary: '#0284c7', bg: '#f8fafc', text: '#1e293b', heading: '#1e293b', card: '#ffffff', nav: '#ffffff', border: '#e2e8f0', borderWidth: 1, borderStyle: 'solid', radius: 8 },
      boxes: '.ring-1, .border',
      cards: '.bg-white:not(nav *), #modal > div',
      dark: '.bg-slate-900, .bg-slate-800, .text-white, footer, [class*="from-sky-500"]',
      navLinks: 'nav a:not([class*="bg-sky"]), nav button',
      layer: true,   // headings rule goes in Tailwind's base layer so utility classes still win
      css: function (v, has) {
        var o = '';
        if (has.primary) {   // re-tint the whole "sky" palette from the chosen colour
          var P = v.primary, B = v.bg;
          o += ':root{--color-sky-50:' + mix(P, 6, B) + ';--color-sky-100:' + mix(P, 14, B) + ';--color-sky-200:' + mix(P, 28, B) + ';--color-sky-300:' + mix(P, 45, B) +
               ';--color-sky-400:' + mix(P, 68, B) + ';--color-sky-500:' + mix(P, 86, B) + ';--color-sky-600:' + P + ';--color-sky-700:' + shade(P, 15) +
               ';--color-sky-800:' + shade(P, 32) + ';--color-sky-900:' + shade(P, 48) + '}\n';
          if (isLight(P)) o += '.bg-sky-600{color:#111!important}\n';   // keep button text readable on pale colours
        }
        if (has.bg) o += ':root{--color-slate-50:' + mix(v.text, 3, v.bg) + ';--color-slate-100:' + mix(v.text, 7, v.bg) + '}\n';
        if (has.text) o += ':root{--color-slate-500:' + mix(v.text, 75, v.bg) + ';--color-slate-600:' + mix(v.text, 88, v.bg) + ';--color-slate-700:' + v.text + '}\n';
        if (has.border) o += '.border-slate-100,.border-slate-200,.border-slate-300,.divide-slate-100>*,.divide-slate-200>*{border-color:' + v.border + '}.ring-slate-200{--tw-ring-color:' + v.border + '}\n';
        if (has.bg) o += '.bg-gradient-to-br.via-white{background-image:linear-gradient(135deg,var(--color-sky-100),' + v.bg + ' 50%,' + mix(v.bg, 90, '#10b981') + ')!important}\n';
        if (has.radius) { var r = v.radius; o += ':root{--radius-sm:' + r * 0.5 + 'px;--radius-md:' + r * 0.75 + 'px;--radius-lg:' + r + 'px;--radius-xl:' + r * 1.5 + 'px;--radius-2xl:' + r * 2 + 'px;--radius-3xl:' + r * 3 + 'px}\n'; }
        if (has.borderWidth || has.borderStyle || has.border) o += '.ring-1{--tw-ring-shadow:0 0 #0000!important}\n';
        if (has.nav) o += '#mobileMenu{background-color:' + v.nav + '!important}\n';
        return o;
      }
    },

    bulma: {
      defaults: { primary: '#00d1b2', bg: '#ffffff', text: '#4a4f5a', heading: '#2b2f37', card: '#ffffff', nav: '#ffffff', border: '#d5d9e0', borderWidth: 0, borderStyle: 'solid', radius: 6 },
      boxes: '.card, .box, .panel, .message, .notification, .modal-card, .input, .textarea, .select select, .table-container',
      round: '.card, .box, .panel, .message, .notification, .modal-card, .button:not(.is-rounded), .input, .textarea, .select select, .tag:not(.is-rounded), .demo-cell, .pagination-link',
      cards: '.card, .box, .panel, .modal-card-body',
      dark: '.hero, .has-background-dark, .message-header, .panel-heading, .notification, .has-text-white',
      navLinks: '.navbar-item:not(.button):not(.buttons), .navbar-burger',
      css: function (v, has) {
        var o = '';
        function hslVars(name, hex, lightText) {
          var c = hslOf(hex);
          return '--bulma-' + name + '-h:' + c.h + 'deg;--bulma-' + name + '-s:' + c.s + '%;--bulma-' + name + '-l:' + c.l + '%;--bulma-' + name + '-invert-l:' + (lightText ? 100 : 4) + '%;' +
                 '--bulma-' + name + '-on-scheme-l:' + (isLight(v.bg) ? Math.min(c.l, 40) : Math.max(c.l, 65)) + '%;';
        }
        if (has.primary) {
          var P = v.primary, light = !isLight(P);
          o += ':root{' + hslVars('primary', P, light) + hslVars('link', P, light) + '}\n';
          o += '.hero.is-primary{background-color:' + P + ';color:' + onColour(P) + '}.hero.is-primary :is(.title,.subtitle,a:not(.button)){color:' + onColour(P) + '}\n';
          o += '.button.is-primary,.tag.is-primary,.panel.is-primary .panel-heading{background-color:' + P + ';color:' + onColour(P) + '}.button.is-primary:hover{background-color:' + shade(P, 10) + '}\n';
          o += '.button.is-primary.is-outlined{background-color:transparent;color:' + P + ';border-color:' + P + '}.button.is-primary.is-outlined:hover{background-color:' + P + ';color:' + onColour(P) + '}\n';
          o += '.hero .box,.hero .card{color:' + v.text + '}.hero.is-primary .box :is(.title,.subtitle),.hero.is-primary .card :is(.title,.subtitle){color:' + v.heading + '}.hero .tag.is-light{color:#363636!important}\n';
          o += '.has-background-primary-light{background-color:' + mix(P, 12, v.bg) + '!important}.demo-cell{background:' + mix(P, 16, v.bg) + '}\n';
          o += '.tabs li.is-active a{color:' + P + ';border-bottom-color:' + P + '}.pagination-link.is-current{background-color:' + P + ';border-color:' + P + ';color:' + onColour(P) + '}\n';
          o += '.progress::-webkit-progress-value{background-color:' + P + '}.progress::-moz-progress-bar{background-color:' + P + '}\n';
        }
        if (has.bg) o += ':root{--bulma-body-background-color:' + v.bg + ';--bulma-scheme-main:' + v.bg + ';--bulma-scheme-main-bis:' + mix(v.text, 3, v.bg) + ';--bulma-scheme-main-ter:' + mix(v.text, 6, v.bg) + ';--bulma-background:' + mix(v.text, 5, v.bg) + '}\n';
        if (has.text) o += ':root{--bulma-text:' + v.text + ';--bulma-body-color:' + v.text + '}.content,.label,.menu-list a{color:' + v.text + '}\n';
        if (has.heading) o += ':root{--bulma-text-strong:' + v.heading + '}\n';
        if (has.card || has.text) o += ':is(.box,.card) .has-text-dark{color:' + v.text + '!important}\n';
        if (has.border) o += ':root{--bulma-border:' + v.border + ';--bulma-border-weak:' + v.border + '}\n';
        if (has.nav) o += '.navbar-menu{background-color:' + v.nav + '}\n';
        return o;
      }
    },

    materialize: {
      defaults: { primary: '#009688', bg: '#fafafa', text: '#212121', heading: '#212121', card: '#ffffff', nav: '#009688', border: '#e0e0e0', borderWidth: 0, borderStyle: 'solid', radius: 2 },
      boxes: '.card:not(.blue-grey), .card-panel, .collection, .collapsible, .modal, .chip, .tabs',
      round: '.card, .card-panel, .collection, .collapsible, .modal, .btn, .btn-large, .btn-small, .btn-flat, .demo-cell, .badge, .pagination li',
      cards: '.card:not(.blue-grey), .card-panel:not(.teal), .collection-item:not(.active), .collapsible-header, .collapsible-body, .modal, .modal .modal-footer, .card .card-reveal, .card-tabs, .card-tabs .tabs',
      dark: '.page-footer, .blue-grey, .card-panel.teal, .grey.darken-4, nav, .white-text, .carousel',
      navLinks: 'body > nav a, body > nav .brand-logo',
      css: function (v, has) {
        var o = '';
        if (has.primary) {
          var P = v.primary, T = onColour(P), B = v.bg;
          o += '.teal{background-color:' + P + '!important}.teal.lighten-5{background-color:' + mix(P, 8, B) + '!important}.teal.lighten-4{background-color:' + mix(P, 28, B) + '!important}' +
               '.teal.lighten-1{background-color:' + mix(P, 85, 'white') + '!important}.teal.darken-2{background-color:' + shade(P, 22) + '!important}\n';
          o += '.teal-text{color:' + P + '!important}.btn:not(.btn-flat),.btn-large:not(.btn-flat),.btn-small:not(.btn-flat),.btn-floating{background-color:' + P + '}.btn.teal,.btn-large.teal,.btn-small.teal,.btn-floating.teal,.chip.teal{color:' + T + '!important}\n';
          o += '.tabs .tab a,.tabs .tab a:hover,.tabs .tab a.active{color:' + P + '}.tabs .indicator{background-color:' + P + '}.tabs .tab a:focus.active{background-color:' + mix(P, 12, 'transparent') + '}\n';
          o += '.collection .collection-item.active,.pagination li.active{background-color:' + P + '}.demo-cell{background:' + mix(P, 28, B) + '}a{color:' + P + '}\n';
          o += '[type="checkbox"].filled-in:checked+span:not(.lever):after{border-color:' + P + ';background-color:' + P + '}.switch label input[type=checkbox]:checked+.lever{background-color:' + mix(P, 45, 'white') + '}.switch label input[type=checkbox]:checked+.lever:after{background-color:' + P + '}\n';
          o += 'input:not([type]):focus:not([readonly]),input[type=text]:focus:not([readonly]),input[type=email]:focus:not([readonly]),input[type=tel]:focus:not([readonly]),textarea.materialize-textarea:focus:not([readonly]){border-bottom-color:' + P + '!important;box-shadow:0 1px 0 0 ' + P + '!important}' +
               '.input-field input:focus+label,.input-field textarea:focus+label,.input-field .prefix.active{color:' + P + '!important}.spinner-green-only{border-color:' + P + '}\n';
        }
        if (has.text) o += 'body{color:' + v.text + '}\n';
        if (has.bg || has.text || has.card) o += 'table.striped>tbody>tr:nth-child(odd),table.highlight>tbody>tr:hover{background-color:' + mix(v.text, 7, 'transparent') + '}\n';
        if (has.nav) o += 'body > nav, body > nav.teal, .sidenav{background-color:' + v.nav + '!important}\n';
        return o;
      }
    },

    foundation: {
      defaults: { primary: '#1779ba', bg: '#fefefe', text: '#0a0a0a', heading: '#0a0a0a', card: '#fefefe', nav: '#e6e6e6', border: '#e6e6e6', borderWidth: 1, borderStyle: 'solid', radius: 0 },
      boxes: '.card, .callout, .accordion, .accordion-content, .tabs, .tabs-content, .reveal, input[type=text], input[type=email], input[type=tel], input[type=date], select, textarea',
      round: '.card, .callout, .accordion, .tabs, .tabs-content, .reveal, .button, .label, .badge, input[type=text], input[type=email], input[type=tel], input[type=date], select, textarea, .demo-cell, .progress, .pagination a, .pagination .current',
      cards: '.card, .accordion, .accordion-content, .accordion-title, .tabs, .tabs-content, .reveal, .callout:not(.primary):not(.success):not(.warning):not(.alert):not(.secondary)',
      dark: '.hero, .info-bar, footer, .orbit, .card-divider',
      navLinks: '.top-bar a:not(.button), .top-bar .menu-text, .title-bar',
      css: function (v, has) {
        var o = '';
        var NOTS = ':not(.secondary):not(.success):not(.warning):not(.alert)';
        if (has.primary) {
          var P = v.primary, T = onColour(P), D = shade(P, 15);
          o += 'a{color:' + P + '}a:hover,a:focus{color:' + D + '}\n';
          o += '.button' + NOTS + ':not(.hollow):not(.clear){background-color:' + P + ';color:' + T + '}.button' + NOTS + ':not(.hollow):not(.clear):hover,.button' + NOTS + ':not(.hollow):not(.clear):focus{background-color:' + D + ';color:' + T + '}\n';
          o += '.button.hollow' + NOTS + ',.button.clear' + NOTS + '{color:' + P + ';border-color:' + P + '}\n';
          o += '.badge' + NOTS + ',.label' + NOTS + ',.progress-meter,.menu .is-active>a,.pagination .current,.switch-input:checked~.switch-paddle,.orbit-bullets button.is-active{background-color:' + P + ';color:' + T + '}\n';
          o += '.callout.primary{background-color:' + mix(P, 14, v.bg) + '}.tabs-title>a,.accordion-title,.breadcrumbs a,.pagination a{color:' + P + '}.tabs-title>a:focus,.tabs-title>a[aria-selected=true]{color:' + P + ';background:' + mix(P, 10, v.bg) + '}\n';
          o += '.hero{background:linear-gradient(135deg,' + P + ',' + shade(P, 35) + ');color:' + T + '}.demo-cell{background:' + mix(P, 16, v.bg) + '}\n';
          o += '.dropdown.menu>li.is-dropdown-submenu>a::after{border-top-color:' + P + '}\n';
        }
        if (has.bg) o += '.top-bar ul ul, .dropdown.menu .is-dropdown-submenu{background-color:' + v.bg + '}\n';
        if (has.text) o += 'body, p, li, label{color:' + v.text + '}\n';
        if (has.bg || has.text || has.card) o += 'table thead,table tbody,table tfoot{background-color:' + v.card + '!important;color:' + v.text + '}table thead{background-color:' + mix(v.text, 6, v.card) + '!important;color:' + v.heading + '}' +
                                                'table tbody tr,table.unstriped tbody tr{background-color:transparent}table:not(.unstriped) tbody tr:nth-child(even){background-color:' + mix(v.text, 5, v.card) + '}table.hover tbody tr:hover{background-color:' + mix(v.text, 9, v.card) + '}table thead,table tbody,table tfoot,table tbody tr{border-color:' + v.border + '}\n';
        if (has.nav) o += '.top-bar ul{background-color:' + v.nav + '!important}\n';
        return o;
      }
    }
  };
  var A = ADAPTERS[FW] || ADAPTERS.bootstrap;

  /* ---------- Saved state ---------- */
  var DEFAULTS = Object.assign({ fontBody: '', fontHeading: '' }, A.defaults);
  var KEY = 'keystone-style-picker:' + location.pathname;
  var saved = {};
  try { saved = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) {}
  function save() { try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch (e) {} }
  function val(t) { return t in saved ? saved[t] : DEFAULTS[t]; }

  /* ---------- Turn choices into CSS ---------- */
  var styleEl = document.createElement('style'); styleEl.id = 'style-picker-css';
  function notIn(sel) { return ':not(' + sel + '):not(' + sel.split(',').map(function (s) { return s.trim() + ' *'; }).join(',') + ')'; }
  function buildCss() {
    var v = {}, has = {};
    Object.keys(DEFAULTS).forEach(function (t) { v[t] = val(t); has[t] = t in saved; });
    var o = '';
    if (has.fontBody) o += 'body, button, input, optgroup, select, textarea, .button, .btn{font-family:' + v.fontBody + '}\n';
    if (has.fontHeading) o += ':is(' + HEADINGS + (FW === 'tailwind' ? ', nav a.font-bold' : '') + '):not(#sp-panel *){font-family:' + v.fontHeading + '!important}\n';
    if (has.bg) o += 'html, body{background-color:' + v.bg + '!important}\n';
    if (has.text) o += 'body{color:' + v.text + '}\n';
    if (has.heading) {
      var h = ':is(h1,h2,h3,h4,h5,h6,.title)' + notIn(A.dark) + '{color:' + v.heading + '}';
      o += (A.layer ? '@layer base{' + h + '}' : h) + '\n';
    }
    if (has.card) o += A.cards.split(',').map(function (s) { return s.trim(); }).join(', ') + '{background-color:' + v.card + '!important}\n';
    if (has.nav) {
      var navSel = { bootstrap: 'nav.navbar', tailwind: 'body > nav', bulma: 'nav.navbar', materialize: 'body > nav', foundation: '.top-bar, .title-bar' }[FW];
      o += navSel + '{background-color:' + v.nav + '!important}\n' + A.navLinks + '{color:' + onColour(v.nav) + '!important}\n';
    }
    if (has.borderWidth || has.borderStyle || has.border) {
      var w = (has.borderWidth || v.borderWidth > 0) ? v.borderWidth : 1;   // picking a style/colour on a borderless framework shows a 1px line
      o += A.boxes + '{border-width:' + w + 'px!important;border-style:' + v.borderStyle + '!important;border-color:' + v.border + '!important}\n';
    }
    if (has.radius && A.round) o += A.round + '{border-radius:' + v.radius + 'px!important}\n';
    o += A.css(v, has);
    styleEl.textContent = o;
  }
  function attachStyle() { document.head.appendChild(styleEl); }   // always last in <head> so it wins
  if (saved.fontBody) loadFont(saved.fontBody);
  if (saved.fontHeading) loadFont(saved.fontHeading);
  buildCss(); attachStyle();
  window.addEventListener('load', attachStyle);   // re-append after anything the page added late

  function set(t, value) {
    if (value === '' || value === null) delete saved[t]; else saved[t] = value;
    save(); buildCss();
  }

  /* ---------- Panel UI ---------- */
  var UI_CSS = [
    '#sp-fab, #sp-panel, #sp-panel :where(*) { all: revert; box-sizing: border-box; }',
    '#sp-fab { position: fixed; left: 1rem; bottom: 1rem; z-index: 2147483000; width: 3.25rem; height: 3.25rem; border-radius: 50%; border: 1px solid #ccc; background: #fff; font-size: 1.5rem; line-height: 1; cursor: pointer; box-shadow: 0 3px 12px rgba(0,0,0,.25); display: grid; place-items: center; padding: 0; }',
    '#sp-fab:hover { transform: scale(1.06); } #sp-fab[aria-expanded="true"] { background: #eef1fb; border-color: #485fc7; }',
    '#sp-fab:focus-visible { outline: 3px solid #485fc7; outline-offset: 2px; }',
    '#sp-panel { position: fixed; left: 1rem; bottom: 5rem; z-index: 2147483000; width: min(350px, calc(100vw - 2rem)); max-height: calc(100vh - 6.5rem); overflow-y: auto;',
    '  background: #fff; color: #222; border: 1px solid #ddd; border-radius: 12px; padding: 0 1rem 1rem; box-shadow: 0 8px 30px rgba(0,0,0,.25);',
    '  font: 14px/1.4 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; text-align: left; letter-spacing: normal; text-transform: none; }',
    '#sp-panel[hidden] { display: none; }',
    '#sp-panel .sp-head { position: sticky; top: 0; z-index: 2; display: flex; align-items: center; justify-content: space-between; margin: 0 -1rem .25rem; padding: .8rem 1rem .5rem; background: #fff; border-bottom: 1px solid #eee; }',
    '#sp-panel .sp-title { font-weight: 700; font-size: 16px; }',
    '#sp-panel .sp-close { border: 0; background: none; font-size: 18px; cursor: pointer; color: #666; padding: .2rem .4rem; }',
    '#sp-panel .sp-hint { color: #777; font-size: 12px; margin: .4rem 0 0; }',
    '#sp-panel .sp-h { font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: .05em; color: #888; margin: 1rem 0 .3rem; }',
    '#sp-panel .sp-row { display: flex; align-items: center; justify-content: space-between; gap: .5rem; padding: .25rem 0; margin: 0; font-size: 14px; color: #222; cursor: default; }',
    '#sp-panel .sp-row > span:first-child { flex: 1; }',
    '#sp-panel .sp-row.is-changed > span:first-child::after { content: " •"; color: #485fc7; font-weight: 700; }',
    '#sp-panel input[type=color] { width: 2.6rem; height: 1.9rem; border: 1px solid #ccc; border-radius: 6px; padding: 2px; background: #fff; cursor: pointer; }',
    '#sp-panel input[type=range] { width: 7rem; accent-color: #485fc7; margin: 0; }',
    '#sp-panel output { font: 12px ui-monospace, monospace; color: #666; min-width: 2.6rem; text-align: right; }',
    '#sp-panel select { font: inherit; font-size: 14px; padding: .25rem .4rem; border: 1px solid #ccc; border-radius: 6px; background: #fff; color: #222; width: 9.5rem; display: inline-block; height: auto; }',
    '#sp-panel .sp-presets { display: flex; flex-wrap: wrap; gap: .35rem; }',
    '#sp-panel .sp-chip { display: inline-flex; align-items: center; gap: .35rem; font: inherit; font-size: 13px; padding: .3rem .6rem; border: 1px solid #ccc; border-radius: 999px; background: #fff; color: #222; cursor: pointer; }',
    '#sp-panel .sp-chip:hover, #sp-panel .sp-btn:hover, #sp-panel .sp-fp-btn:hover { border-color: #485fc7; background: #f5f7ff; }',
    '#sp-panel .sp-dot { width: 12px; height: 12px; border-radius: 50%; display: inline-block; border: 1px solid rgba(0,0,0,.15); }',
    '#sp-panel .sp-actions { display: flex; flex-wrap: wrap; gap: .5rem; margin-top: 1rem; padding-top: .75rem; border-top: 1px solid #eee; }',
    '#sp-panel .sp-btn { font: inherit; font-size: 13px; font-weight: 600; padding: .45rem .8rem; border: 1px solid #ccc; border-radius: 8px; background: #fff; color: #222; cursor: pointer; }',
    '#sp-panel .sp-btn.sp-primary { background: #485fc7; border-color: #485fc7; color: #fff; }',
    '#sp-panel .sp-btn.sp-primary:hover { background: #3a51b8; }',
    '#sp-panel .sp-btn.sp-danger { color: #b00020; }',
    '#sp-panel .sp-fp { padding: .25rem 0; }',
    '#sp-panel .sp-fp-btn { width: 9.5rem; display: flex; justify-content: space-between; align-items: center; gap: .25rem; font-size: 15px; padding: .25rem .5rem; border: 1px solid #ccc; border-radius: 6px; background: #fff; color: #222; cursor: pointer; text-align: left; }',
    '#sp-panel .sp-fp-btn span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }',
    '#sp-panel .sp-fp-btn::after { content: "▾"; font: 12px system-ui, sans-serif; color: #777; }',
    '#sp-panel .sp-fp-list { list-style: none; margin: .35rem 0 0; padding: .25rem; max-height: 14rem; overflow-y: auto; border: 1px solid #ccc; border-radius: 8px; background: #fff; }',
    '#sp-panel .sp-fp-list[hidden] { display: none; }',
    '#sp-panel .sp-fp-list:focus { outline: 2px solid #485fc7; outline-offset: 1px; }',
    '#sp-panel .sp-fp-list li { padding: .35rem .5rem; margin: 0; border-radius: 4px; font-size: 17px; color: #222; cursor: pointer; line-height: 1.3; list-style: none; }',
    '#sp-panel .sp-fp-list li.is-active { background: #eef1fb; }',
    '#sp-panel .sp-fp-list li[aria-selected="true"] { font-weight: 700; }',
    '#sp-panel .sp-fp-list li[aria-selected="true"]::before { content: "✓ "; font-family: system-ui, sans-serif; }',
    '@media (max-width: 600px) { #sp-panel { left: .75rem; right: .75rem; width: auto; bottom: 4.75rem; max-height: 70vh; } }'
  ].join('\n');

  var PRESETS = [
    { name: 'Ocean', swatch: '#0e7490', v: { primary: '#0e7490', bg: '#f0f9ff', text: '#1e293b', heading: '#0c4a6e', card: '#ffffff', nav: '#ffffff', border: '#bae6fd' } },
    { name: 'Forest', swatch: '#2f6b3a', v: { primary: '#2f6b3a', bg: '#f6f5ee', text: '#2d2d2a', heading: '#1f3d24', card: '#ffffff', nav: '#1f3d24', border: '#d6d3c4', fontHeading: '"Lora", Georgia, serif' } },
    { name: 'Sunset', swatch: '#e8590c', v: { primary: '#e8590c', bg: '#fff8f1', text: '#3b2f2a', heading: '#7c2d12', card: '#ffffff', nav: '#ffffff', border: '#fcd9bd', fontHeading: '"Poppins"' + SANS } },
    { name: 'Navy & gold', swatch: '#c9a227', v: { primary: '#b8901c', bg: '#f7f5ef', text: '#1f2937', heading: '#0b1f3a', card: '#ffffff', nav: '#0b1f3a', border: '#e5dcc3', fontHeading: '"Playfair Display", Georgia, serif' } },
    { name: 'Dark', swatch: '#1e293b', v: { primary: '#60a5fa', bg: '#0f172a', text: '#cbd5e1', heading: '#f8fafc', card: '#1e293b', nav: '#020617', border: '#334155' } }
  ];

  var uiStyle = document.createElement('style'); uiStyle.textContent = UI_CSS; document.head.appendChild(uiStyle);

  var fab = document.createElement('button');
  fab.id = 'sp-fab'; fab.type = 'button'; fab.textContent = '🎨';
  fab.title = 'Change fonts, colours and borders'; fab.setAttribute('aria-label', 'Change fonts, colours and borders');
  fab.setAttribute('aria-expanded', 'false'); fab.setAttribute('aria-controls', 'sp-panel');

  var panel = document.createElement('div');
  panel.id = 'sp-panel'; panel.hidden = true; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', 'Style picker');
  panel.innerHTML =
    '<div class="sp-head"><span class="sp-title">🎨 Style picker</span><button type="button" class="sp-close" aria-label="Close">✕</button></div>' +
    '<p class="sp-hint">Changes show straight away and are saved in this browser. A • means you changed it.</p>' +
    '<div id="sp-body"></div>' +
    '<div class="sp-actions">' +
      '<button type="button" class="sp-btn sp-primary" id="sp-copy">📋 Copy my choices</button>' +
      '<button type="button" class="sp-btn sp-danger" id="sp-reset">Reset all</button>' +
    '</div>' +
    '<p class="sp-hint">Tip: “Copy my choices”, then paste it to your AI agent and ask it to make a new page with this look.</p>';

  function addUi() { document.body.appendChild(panel); document.body.appendChild(fab); }
  if (document.body) addUi(); else document.addEventListener('DOMContentLoaded', addUi);

  var body = panel.querySelector('#sp-body');
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function heading(text) { body.appendChild(el('div', 'sp-h', text)); }
  function row(token, label, control, extra) {
    var r = el('label', 'sp-row' + (token in saved ? ' is-changed' : ''));
    r.appendChild(el('span', null, label)); if (extra) r.appendChild(extra); r.appendChild(control);
    body.appendChild(r); return r;
  }
  var seq = 0;

  // Custom dropdown so every font is shown in its own typeface (a normal dropdown can't do that)
  function fontPicker(token, label) {
    var id = 'sp-fp' + (seq++);
    var wrap = el('div', 'sp-fp');
    var r = el('div', 'sp-row' + (token in saved ? ' is-changed' : ''));
    var lab = el('span', null, label); lab.id = id + '-label';
    var btn = el('button', 'sp-fp-btn'); btn.type = 'button'; btn.id = id + '-btn';
    btn.setAttribute('aria-haspopup', 'listbox'); btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-labelledby', id + '-label ' + id + '-btn');
    var btnText = el('span'); btn.appendChild(btnText);
    r.appendChild(lab); r.appendChild(btn); wrap.appendChild(r);
    var list = el('ul', 'sp-fp-list'); list.hidden = true; list.tabIndex = -1;
    list.setAttribute('role', 'listbox'); list.setAttribute('aria-labelledby', id + '-label');
    var options = FONTS.slice(), cur = val(token);
    if (!fontByValue(cur)) options.splice(1, 0, ['Custom', cur, null]);
    var selected = 0, active = 0, items = [];
    options.forEach(function (f, i) {
      var li = el('li', null, f[0]); li.id = id + '-o' + i; li.setAttribute('role', 'option');
      if (f[1]) li.style.fontFamily = f[1];
      if (f[1] === cur) selected = i;
      li.addEventListener('click', function () { choose(i); });
      li.addEventListener('mousemove', function () { setActive(i, false); });
      list.appendChild(li); items.push(li);
    });
    wrap.appendChild(list);
    function render() {
      btnText.textContent = options[selected][0]; btn.style.fontFamily = options[selected][1] || '';
      items.forEach(function (li, i) { li.setAttribute('aria-selected', String(i === selected)); });
    }
    function setActive(i, scroll) {
      items[active].classList.remove('is-active'); active = i; items[i].classList.add('is-active');
      list.setAttribute('aria-activedescendant', items[i].id); if (scroll) items[i].scrollIntoView({ block: 'nearest' });
    }
    function open() { loadAllPreviews(); list.hidden = false; btn.setAttribute('aria-expanded', 'true'); setActive(selected, true); list.focus(); }
    function close(refocus) { list.hidden = true; btn.setAttribute('aria-expanded', 'false'); if (refocus) btn.focus(); }
    function choose(i) {
      selected = i; loadFont(options[i][1]); set(token, options[i][1]); render(); close(true);
      r.classList.toggle('is-changed', token in saved);
    }
    btn.addEventListener('click', function () { list.hidden ? open() : close(false); });
    btn.addEventListener('keydown', function (e) { if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); open(); } });
    list.addEventListener('keydown', function (e) {
      var n = items.length;
      if (e.key === 'ArrowDown') { e.preventDefault(); setActive((active + 1) % n, true); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((active - 1 + n) % n, true); }
      else if (e.key === 'Home') { e.preventDefault(); setActive(0, true); }
      else if (e.key === 'End') { e.preventDefault(); setActive(n - 1, true); }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(active); }
      else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(true); }
      else if (e.key === 'Tab') close(false);
    });
    document.addEventListener('click', function (e) { if (!list.hidden && !wrap.contains(e.target)) close(false); });
    render(); body.appendChild(wrap);
  }

  function slider(token, label, min, max, unit) {
    var input = el('input'); input.type = 'range'; input.min = min; input.max = max; input.step = 1; input.value = val(token);
    var out = el('output', null, val(token) + unit);
    var r = row(token, label, input, out);
    input.addEventListener('input', function () { out.textContent = input.value + unit; set(token, Number(input.value)); r.classList.add('is-changed'); });
  }

  function build() {
    body.innerHTML = '';
    heading('Quick looks');
    var presets = el('div', 'sp-presets');
    PRESETS.forEach(function (p) {
      var b = el('button', 'sp-chip'); b.type = 'button';
      var dot = el('span', 'sp-dot'); dot.style.background = p.swatch; b.appendChild(dot); b.appendChild(document.createTextNode(p.name));
      b.addEventListener('click', function () { applyAll(p.v); });
      presets.appendChild(b);
    });
    var rnd = el('button', 'sp-chip', '🎲 Surprise me'); rnd.type = 'button'; rnd.addEventListener('click', surprise);
    presets.appendChild(rnd); body.appendChild(presets);

    heading('Fonts');
    fontPicker('fontBody', 'Body text');
    fontPicker('fontHeading', 'Headings');

    heading('Colours');
    COLOUR_TOKENS.forEach(function (c) {
      var input = el('input'); input.type = 'color'; input.value = val(c[0]);
      var r = row(c[0], c[1], input);
      input.addEventListener('input', function () { set(c[0], input.value); r.classList.add('is-changed'); });
    });

    heading('Borders');
    slider('borderWidth', 'Thickness', 0, 8, 'px');
    var sel = el('select');
    [['solid', 'Solid line'], ['dashed', 'Dashed'], ['dotted', 'Dotted'], ['double', 'Double line'], ['groove', 'Groove'], ['ridge', 'Ridge']].forEach(function (o) {
      var op = el('option', null, o[1]); op.value = o[0]; sel.appendChild(op);
    });
    sel.value = val('borderStyle');
    var sr = row('borderStyle', 'Style', sel);
    sel.addEventListener('change', function () { set('borderStyle', sel.value); sr.classList.add('is-changed'); });
    slider('radius', 'Corner roundness', 0, 32, 'px');
  }

  function applyAll(values) {
    saved = {};
    Object.keys(values).forEach(function (t) { saved[t] = values[t]; });
    if (saved.fontBody) loadFont(saved.fontBody);
    if (saved.fontHeading) loadFont(saved.fontHeading);
    save(); buildCss(); build();
  }
  function surprise() {
    var h = Math.random() * 360, c = (h + 150 + Math.random() * 60) % 360, dark = Math.random() < 0.3;
    var pick = function () { return FONTS[1 + Math.floor(Math.random() * (FONTS.length - 1))][1]; };
    applyAll({
      primary: hslHex(c, 70, dark ? 62 : 42), bg: hslHex(h, 30, dark ? 9 : 97), text: hslHex(h, 15, dark ? 80 : 22),
      heading: hslHex(h, 45, dark ? 95 : 14), card: hslHex(h, 25, dark ? 14 : 100), nav: hslHex(h, 35, dark ? 6 : (Math.random() < 0.5 ? 99 : 20)),
      border: hslHex(h, 20, dark ? 26 : 86), borderWidth: Math.floor(Math.random() * 4), radius: [0, 4, 8, 14, 24][Math.floor(Math.random() * 5)],
      borderStyle: Math.random() < 0.75 ? 'solid' : ['dashed', 'dotted', 'double'][Math.floor(Math.random() * 3)],
      fontBody: pick(), fontHeading: pick()
    });
  }
  build();

  function toggle(open) {
    panel.hidden = !open; fab.setAttribute('aria-expanded', String(open));
    if (open) loadAllPreviews();
  }
  fab.addEventListener('click', function () { toggle(panel.hidden); });
  panel.querySelector('.sp-close').addEventListener('click', function () { toggle(false); fab.focus(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) { toggle(false); fab.focus(); } });

  panel.querySelector('#sp-reset').addEventListener('click', function () { saved = {}; save(); buildCss(); build(); });

  panel.querySelector('#sp-copy').addEventListener('click', function (e) {
    var btn = e.currentTarget;
    var page = location.pathname.split('/').slice(-2).join('/');
    var keys = Object.keys(saved);
    var lines = keys.length ? keys.map(function (t) {
      var v = saved[t];
      if (t === 'fontBody' || t === 'fontHeading') { var f = fontByValue(v); v = f ? f[0] : v; }
      if (t === 'borderWidth' || t === 'radius') v += 'px';
      return '- ' + (LABELS[t] || t) + ': ' + v;
    }) : ['- (no changes yet, this is the framework’s default look)'];
    var text = 'Style picker choices for ' + page + ':\n' + lines.join('\n') +
      '\n\nPlease make a copy of this page with these fonts, colours and borders built in, using the framework’s own settings where possible.';
    var done = function (msg) { btn.textContent = msg; setTimeout(function () { btn.textContent = '📋 Copy my choices'; }, 1600); };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(function () { done('Copied!'); }, fallback);
    else fallback();
    function fallback() {
      var ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); done('Copied!'); } catch (err) { console.log(text); done('See console'); }
      ta.remove();
    }
  });
})();
