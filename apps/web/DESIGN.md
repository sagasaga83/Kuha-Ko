---
name: Kuha Ko
description: A coffee bar and a thrift boutique under one roof in Iloilo City. Kape ko. Kuha ko.
colors:
  canvas: "#FFFFFF"
  linen: "#F3EBDD"
  paper: "#FBF7EF"
  kraft: "#E8D9BF"
  line: "#D8CBB4"
  espresso: "#3B2A20"
  ink-muted: "#5E4B3C"
  rust: "#9A4A26"
  on-rust: "#FFFFFF"
  sage: "#7A8C5A"
  sage-ink: "#556640"
  mustard: "#D9A15A"
  board: "#3B2A20"
  on-board: "#F3EBDD"
  focus-ring: "#9A4A26"
typography:
  display:
    fontFamily: "Fraunces, Georgia, 'Times New Roman', serif"
    fontSize: "clamp(60px, 10.5vw, 160px)"
    fontWeight: 600
    lineHeight: 0.92
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Fraunces, Georgia, 'Times New Roman', serif"
    fontSize: "clamp(38px, 6vw, 72px)"
    fontWeight: 600
    lineHeight: 1.02
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Fraunces, Georgia, 'Times New Roman', serif"
    fontSize: "22px"
    fontWeight: 600
    lineHeight: 1.25
  tagline:
    fontFamily: "Fraunces, Georgia, 'Times New Roman', serif"
    fontSize: "24px"
    fontWeight: 400
    lineHeight: 1.3
  body:
    fontFamily: "'DM Sans', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.55
  small:
    fontFamily: "'DM Sans', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "'Courier Prime', 'Courier New', Courier, monospace"
    fontSize: "13px"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "3px"
  tag:
    fontFamily: "'Courier Prime', 'Courier New', Courier, monospace"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  sm: "4px"
  md: "8px"
  tag: "60px"
  pill: "999px"
spacing:
  space-1: "4px"
  space-2: "8px"
  space-3: "16px"
  space-4: "24px"
  space-5: "40px"
  space-6: "64px"
components:
  button-primary:
    backgroundColor: "{colors.rust}"
    textColor: "{colors.on-rust}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "0 24px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.espresso}"
    textColor: "{colors.linen}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.espresso}"
    rounded: "{rounded.sm}"
    padding: "0 24px"
    height: "48px"
  button-secondary-hover:
    backgroundColor: "{colors.espresso}"
    textColor: "{colors.linen}"
  input-field:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.espresso}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "12px"
    height: "48px"
  panel:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.espresso}"
    rounded: "{rounded.sm}"
    padding: "24px"
  hang-tag:
    backgroundColor: "{colors.kraft}"
    textColor: "{colors.espresso}"
    typography: "{typography.tag}"
    rounded: "{rounded.tag}"
    width: "170px"
  claim-banner:
    backgroundColor: "{colors.board}"
    textColor: "{colors.mustard}"
    rounded: "{rounded.sm}"
    padding: "40px"
  nav-link:
    textColor: "{colors.espresso}"
    typography: "{typography.label}"
  nav-link-active:
    textColor: "{colors.rust}"
---

# Design System: Kuha Ko

## Overview

**Creative North Star: "The Tagged Rack"**

The site is a well-kept rack in a small shop: plain white walls, a hairline rail, and on it one piece at a time, each with a kraft tag that tells you the truth about it. Fraunces is the painted sign above the rack, Courier Prime is the typewriter that fills in the tags and the receipts, and DM Sans is the friend behind the counter explaining things in plain words. The coffee side and the thrift side hang on the same rail; colour tells them apart (rust for coffee, sage-ink for thrift) only where a customer needs to know which is which.

Density is low and the pace is unhurried. Sections breathe (80 to 152px of space between them), headings are large, and lists read like menus and tag cards rather than dashboards. Depth comes from paper, not light: linen and paper panels, hairline rules and the occasional dark sign board. Nothing floats on a shadow.

The interface is warm and playful in its details. Things that hang react when a hand reaches them: rack pieces and price tags swing, a stamp thunks onto a claimed item, the basket nods, the receipt prints, the lamp chain switches the evening theme, the name's word cards draw a rust hairline and say "KOO-ha' ko" syllable by syllable. Motion that answers a touch is welcome; motion that plays on its own is rationed to a few signature moments (the hero's entrance, the rack's pieces sliding along the rail, and the name section's text rising in word by word each time it scrolls into view, using transitions.dev's texts reveal). The photography rule is the same as the tag rule: real drinks and real pieces in daylight, nothing staged or generated.

**Key Characteristics:**
- White canvas, linen and paper bands, one dark board per page at most.
- Square corners everywhere except the hang tag, which is the one rounded shape.
- Hairlines instead of shadows.
- Serif signs, typewriter tags, sans body: three faces, each with one job.
- Things that hang, swing; things that are claimed, get stamped.

## Colors

Wood, linen, kraft paper and coffee: warm neutrals carry the page, and each shop gets one earthy accent. Every token has an Evening (dark) value; the Evening theme swaps them all, and pairs that pass in Linen pass in Evening too.

### Primary
- **Rust** (rust): the Kuha Ko Coffee accent. Prices, links, the active nav item, the italic "Ko" in the wordmark, the primary button fill, and the keyboard focus ring. As text on canvas, linen and paper; as a fill only under on-rust text.

### Secondary
- **Sage Ink** (sage-ink): the Kuha Ko Thrift accent as text: thrift section labels, hang-tag names, thrift buttons and prices. On kraft only at 24px and larger.
- **Sage** (sage): a fill, never text. Plants, the thrift block, cover shapes.

### Tertiary
- **Mustard** (mustard): lamp-light on the board. The KUHA KO! claim word and small highlights on board panels, the "Ko" of the reversed wordmark. Never on linen, canvas or paper.

### Neutral
- **Canvas** (canvas): the website's page ground, plain white (evening brown in the dark theme).
- **Linen** (linen): the warm wall. Section bands, photo placeholders, soft panels.
- **Paper** (paper): raised panels: cards, the menu panel, the sign-up box, the inside of a stamp.
- **Kraft** (kraft): anything that is real paper: hang tags, sleeves, bags.
- **Line** (line): hairlines and card borders. Decorative only.
- **Espresso** (espresso): main text and the logo.
- **Ink Muted** (ink-muted): secondary text, notes, captions, inactive tabs.
- **Board** (board) with **On Board** (on-board): the dark sign board for the menu board, the live-selling banner and the announcement bar.
- **On Rust** (on-rust): text on a rust fill.

### Named Rules
**The One Accent Rule.** A piece of the page belongs to one shop at a time: rust for coffee, sage-ink for thrift. The shared shop uses espresso alone, with rust only for prices. Never put both accents on the same component.

**The Board Rule.** Mustard lives only on board. If a highlight needs to appear on linen, canvas or paper, it is rust or sage-ink, never mustard.

**The Hairline Is Not a State Rule.** A line-coloured hairline decorates; it never alone tells two states apart. Selected, active and error states change text colour, weight or fill as well.

## Typography

**Display Font:** Fraunces (with Georgia, Times New Roman)
**Body Font:** DM Sans (with Helvetica Neue, Arial)
**Label/Mono Font:** Courier Prime (with Courier New, Courier)

**Character:** An old-style serif painted on a sign, a typewriter filling in tags and receipts, and a clean sans for everything you read in sentences. Each face has one job and they don't swap.

### Hierarchy
- **Display** (600, clamp 60 to 160px, 0.92): the hero line only ("Kape ko. Kuha ko."), tightly tracked (-0.035em). The second line sets in italic weight 400 in rust.
- **Headline** (600, clamp 38 to 72px, 1.02): page and section titles, tracked -0.025em. Sentence case.
- **Title** (600, 22px, 1.25): menu item names (20px inside a menu row), card and panel titles, sheet titles.
- **Tagline** (400 italic, 24px, 1.3): taglines and pull quotes; the one place italics run longer than a word.
- **Body** (400, 16px, 1.55): descriptions and running text; ledes step up to 18px. Ledes hold to 40 to 52ch.
- **Small** (400, 14px, 1.5): notes and fine print. Never smaller than 14px on screen for reading text.
- **Label** (700, 13px, 3px tracking, capitals): section labels, nav items (2px tracking), stamps, the announcement bar.
- **Tag** (400, 15px, 1.6): hang tags, prices, item numbers, receipts, measurements.

### Named Rules
**The Capitals Are for Labels Rule.** Capitals appear only in the label style, the stamp and the claim word KUHA KO!. Headings, menu items and buttons are sentence case.

**The Typewriter Tells the Truth Rule.** Anything factual about an item (number, size, measurements, price, "One of one") is set in Courier Prime, like a tag filled in by hand at the counter.

**The Wordmark Rule.** Kúha Ko, with its acute accent, bold "Kúha" and light italic "Ko", exists only as logo artwork. In type and copy it is Kuha Ko.

## Layout

A single centred column, 1240px wide at most, with 24px side margins (or the device's safe-area inset when larger). Sections stack with generous vertical space (clamp 80 to 152px) and a hairline between neighbouring sections; linen bands mark a change of subject. Section heads use a 1:3 grid: a small label in the narrow left column and the large heading in the wide right one; lists that follow line up with the heading column. Below 860px everything collapses to one column.

Spacing steps through six tokens: 4, 8, 16, 24, 40 and 64px. Cards and panels pad at 24px; items in a list sit 16px apart; sections separate at 40px and up.

On phones and from the home screen the site becomes an iOS-style app: large 34px titles that collapse into the bar, inset grouped lists, a segmented control, bottom sheets, and a five-tab bar at the bottom. Gutters are 16px plus the safe-area inset; screen edges always use the safe-area variables, never raw insets.

## Elevation & Depth

The system is flat. There are no drop shadows anywhere. Depth is tonal and material: canvas is the floor, linen is the wall, paper is a sheet laid on top, kraft is a tag, and board is a painted sign. Hairlines (1px, line colour) separate things that sit on the same level. The two places where something truly sits above the page, the phone tab bar and the bottom sheet, use a translucent canvas with blur (tab bar) or a dimmed board-tinted backdrop (sheet), still without a shadow.

### Named Rules
**The Paper, Not Light Rule.** To lift something, change its paper (canvas to paper to kraft) or draw a hairline. Never add a box-shadow, glow or gradient.

## Shapes

Square-cornered and honest. Cards, panels, buttons, fields and sign boards share a small 4px radius that reads as square at a glance. The hang tag is the one rounded shape: an 8px radius on its square end, a 60px arc on its top end, and a punched hole. Pills (999px) are kept for the round stamp, the profile icon and status chips. Borders are 1px hairlines; the hang tag and the sub-brand label use a heavier 2px rule, like a printed tag edge.

### Named Rules
**The One Round Shape Rule.** If it isn't a hang tag, a stamp or a status chip, its corners are 4px. Rounded cards and pill buttons don't belong here.

## Components

The components are tactile objects with a little play in them: they press, swing, stamp and nod when touched, and stay square and plain at rest.

### Buttons
- **Shape:** square-cornered (4px), 48px tall, 24px side padding, DM Sans 16px bold, sentence case.
- **Primary:** rust fill with on-rust text. Hover turns it espresso with linen text.
- **Secondary:** transparent with a 2px espresso border and espresso text; hover fills espresso with linen text.
- **Press:** every button scales to 0.97 the moment it is pressed, not when it is released.
- **Text links:** espresso with a hairline underline that fills in rust from the left on hover. No arrows appended.
- **Small "Add" buttons** on products are outlined in the shop's accent and fill with it on hover.

### Cards / Containers
- **Corner Style:** 4px.
- **Background:** paper on canvas, or linen bands behind photos; board for the menu board and claim banner.
- **Shadow Strategy:** none; see Elevation & Depth.
- **Border:** 1px line hairline where a panel sits on canvas.
- **Internal Padding:** 24px.

### Inputs / Fields
- **Style:** canvas background, 1px hairline (ink-muted on the sign-up field), 4px corners, 48px tall, 16px text so phones don't zoom.
- **Focus:** a solid 2px rust focus ring with a 2px gap in the ground colour; never a glow.
- **Labels:** above the field in DM Sans 15px medium; help text in 13px ink-muted.

### Navigation
- **Desktop:** the wordmark on the left, then Courier Prime labels (13px, 2px tracking, capitals) on the right. Hover draws a hairline under the word from the left; the current page is rust with the underline held.
- **Header:** white, sticky, gains a hairline once scrolled and slides away when scrolling down.
- **Phone (full site):** a menu that drops from the header with large Fraunces links, revealed one after another.
- **Phone (app layout):** a translucent bottom tab bar of five tabs, line icons with short labels; the selected tab is rust.

### Hang Tag (signature)
A kraft tag with a punched hole, a rounded top, a 2px espresso edge, the item's name in Fraunces italic (sage-ink) and its facts typed below in Courier Prime. On the rack, each piece hangs from the rail on a wire with its tag tied on; reaching a piece sets it and its tag swinging. Item numbers read "No. 0001" and one-off pieces say "One of one".

### Claim Banner (signature)
A board panel with KUHA KO! in large Fraunces (mustard), a small mustard label, and the how-to in on-board text. It is the live-selling call and appears where claiming is explained.

### Menu Item
Name (Fraunces 20px) and price (Courier Prime, rust) on one line, the kind in label capitals, then a one-line description. Rows are separated by hairlines. On hover the words slide 8px and the name turns rust; the price stays put.

### Sheet
The product and cart sheet rises from the bottom on phones and slides in from the right as a drawer on wide screens. It can be dragged by its grabber or title bar, follows the finger, resists being pulled the wrong way, and leaves the way it came.

## Do's and Don'ts

### Do:
- **Do** keep corners at 4px (radius-sm) on every card, panel, button and field; save the 60px arc for hang tags.
- **Do** separate with 1px hairlines and paper panels.
- **Do** give each piece of the page one accent: rust for coffee, sage-ink for thrift, espresso for the shared shop.
- **Do** set item facts (numbers, sizes, measurements, prices) in Courier Prime.
- **Do** keep every text pair at 4.5:1 contrast in both Linen and Evening.
- **Do** show press feedback on press (scale 0.97) and let hanging things swing when touched.
- **Do** use real photos of the shop's own drinks and pieces in daylight; until they exist, show the photo placeholder with its shot brief.
- **Do** use simple line icons (1.5px stroke, espresso) with a word next to them.

### Don't:
- **Don't** add drop shadows, glows or gradients.
- **Don't** use mustard anywhere but on board, or sage as a text colour.
- **Don't** set headings, buttons or menu items in capitals; capitals are for labels, the stamp and KUHA KO! only.
- **Don't** use the accented Kúha outside the logo artwork.
- **Don't** use emoji, stock photos or AI-made images of products the shop sells.
- **Don't** hard-code colours; every colour comes from a token so the Evening theme works.
- **Don't** fade and slide sections in as they scroll into view; keep entrance motion to the hero, the rack and the name section.
- **Don't** append arrows to links or number things that aren't a sequence.
