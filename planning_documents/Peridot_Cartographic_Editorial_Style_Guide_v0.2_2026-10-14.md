# Peridot — Cartographic Editorial
## Visual identity and interface style guide · v0.2 · 14 October 2026

**Status:** Approved *exploratory aesthetic direction* for design studies; **not** an approved implementation specification, final brand kit, or permission to change code.

**Authoritative visual references, in priority order:** (1) the three participant-recruitment flyer concepts (editorial collage, modernist museum poster, cartographer's invitation); (2) the subsequent two large Home and Data workspace case-study mockups; (3) screenshots of the existing, working Peridot Home and Data pages. The flyers set the **aesthetic**; existing screenshots set the **current functional structure**. Generated UI mockups illustrate a possible translation, not actual application behavior. Preserve those source images alongside this document when making implementation decisions. This text alone cannot reproduce their exact imagery or typesetting.

**Production asset decision (14 Oct 2026):** use **licensed stock accents** and **real historical maps and archival materials** in the eventual interface, not AI-generated cartography, photographs, engravings, or ornamental assets. Generated mockups are visual references only. Licensing, rights, provenance and accessibility review are required before integration.

---

## 1. Design thesis

Peridot should feel like a **contemporary humanities research instrument presented through the visual language of a scholarly atlas, independent cultural journal, and museum exhibition publication**. The defining tension is **archival materiality × modern editorial composition**: elegant, high-contrast typography; richly layered historical imagery; oxblood, parchment and restrained forest green; and confident spatial hierarchy.

The redesign is **not** a simple light-theme conversion, a corporate dashboard, a literal antique reproduction, or an extension of the existing baroque ornamentation. It should be *scholarly without solemnity; expressive without clutter; playful without sacrificing research utility*.

### Five non-negotiable principles

1. **Scholarly, not baroque:** replace ubiquitous curls, gold outlines, striped fields and nested frames with a considered combination of archival material, typography, cropped imagery and a few precise cartographic marks.
2. **Editorial, not generic:** large typographic contrast, deliberate asymmetry, layered paper/map shapes, fine rules, generous but purposeful negative space, and visual rhythm. Avoid an anonymous cream dashboard with a red heading.
3. **Two complementary registers:** expressive visual storytelling on Home, Tutorials and About; restrained, research-dense surfaces in mapping, browsing, Inspector and visualization views. Maintain recognizably shared type, colors and navigation.
4. **Humanities-wide:** do not make cartography, early modern Italy or European archival sources appear to define the tool's valid datasets. Vary archival references by context, and avoid pretending decorative maps are the user's data.
5. **Data first:** all visual treatments yield to actual evidence, legible tables, accurate network/map/timeline displays, interaction feedback and workspace efficiency.

---

## 2. Visual signatures to preserve from the flyers and two case-study mockups

These are the distinguishing qualities we want future designs to reproduce—not incidental details of an image-generation result.

- **Confident display serif:** overscale, elegant, high-contrast letterforms, especially the oxblood PERIDOT name and major editorial headings. Large type belongs in the Home hero and selected entry/intro views, **not** in every workspace header.
- **Oxblood on antique ivory:** a warm, slightly aged paper base; deep red heading as the primary point of typographic drama; dark ink body copy.
- **Historical cartographic collage:** real maps shown as editorial artifacts, selectively masked/cropped/overlapped with paper shapes; fine lines and nodes evoke relationships without falsely representing analytical output.
- **Material layering:** irregular/torn edges, exposed map fragments, subtle paper grain, overprinting and small archival details. Apply to broad editorial regions, not functional widgets.
- **Fine-line details:** compass marks, unobtrusive geographic linework, routes, scale-like rules, occasional tiny botanical/engraving accents. Restraint is key; *one or two motifs per composition*, not every motif in every region.
- **High/low scale rhythm:** a prominent headline or graphic, small uppercase letter-spaced eyebrow, comfortable explanatory copy, and legible action labels.
- **Dark green as counterweight:** deep forest used selectively for buttons, minor blocks or navigation context rather than returning to dark green page-wide fields.
- **Substantial editorial composition:** the mockups' appeal comes from images, crop, scale and typography together—not merely from the color tokens.

### What is deliberately *not* prescriptive in the generated mockups

- The faux map labels, fictitious routes, illustrated Florence skyline, compass rose placement, pin positions and decorative scenery are **not historical claims**, assets to replicate exactly, or proposed data encodings.
- Mockup buttons, search, navigation and gateway cards are **not specifications of available functionality**. Do not add a global search merely because one was drawn.
- The large hero and ornamental Data introduction are **exploratory layouts**. Their exact height, ornament density and copy size must be tested against the desktop viewport and actual current workflow.
- Rounded CTA buttons are a deliberate editorial accent, not a requirement to turn every data control into a pill.

---

## 3. Color system — provisional tokens

The values below are working approximations of the visual direction. They are **not pixel samples or authoritative color matches** to the flyers. Compare them against the visual references and test in real components before final approval.

| Token | Value | Use |
|---|---|---|
| `--paper` | `#F5EFE4` | Main warm canvas; editorial negative space |
| `--parchment` | `#E8D8BC` | Distinct editorial blocks, optional image transitions |
| `--surface` | `#FBF8F2` | Clean form/table/panel surfaces |
| `--ink` | `#262722` | Primary body copy, dense information |
| `--oxblood` | `#7C211E` | Key display lettering, active nav, limited strong CTA |
| `--vermilion` | `#A63D2B` | Sparse secondary red emphasis, fine routes/accents |
| `--forest` | `#253C32` | Contrasting CTA, dataset switcher, selective grounding |
| `--sage` | `#6B7F6B` | Secondary accent, nonsemantic unless tested |
| `--sand` | `#C8A87A` | Tiny ornamental rules, not required text contrast |
| `--line` | `#D7CABC` | Hairlines, subtle borders and separators |

**Balance:** Paper and light surfaces should dominate the *functional* application; oxblood draws the eye; forest supplies small areas of contrast; ornament and sand remain subordinate. The Home hero may include substantial multicolored historical imagery. Avoid the existing full-viewport dark green with repeating gold stripes as the new default.

**States:** Colors for error, warning, success, focus, selection and disabled controls require distinct, accessible semantic tokens. Do not assign brand sage to “success” automatically. Verify normal/large text and nontext contrast against applicable WCAG 2.2 AA criteria.

**Data palettes are separate:** Graph nodes, relationship types, temporal categories, map overlays, categorical/sequential/diverging encodings, and selections need independent, tested palettes. Decorative route red in a background is not a data relationship.

---

## 4. Typography and typographic hierarchy — provisional

**Current suggested family stack:**

| Role | Candidate | Direction |
|---|---|---|
| Display/wordmark/hero | **Cormorant Garamond** (regular/medium), with Bodoni Moda as a possible campaign-only alternative | Dramatic, classical, refined; preserve elegant thin/thick stroke contrast |
| Editorial paragraphs/intro | **Source Serif 4** | Literate, spacious, readable at normal sizes |
| Controls and dense data | **Inter** | Precise, compact, clear for long sessions and tables |

The exact font in the generated images has **not been identified or verified**; do not claim these candidate families reproduce it exactly. Test actual renders in browsers before ratifying.

**Scale roles (guidance, not hardcoded CSS):**
- Hero title: commanding and deliberately oversized, balanced to the available hero area.
- Page-intro title: refined, prominent but markedly smaller than the Home hero; must not push actions below the fold.
- Eyebrow: small uppercase, restrained letterspacing in oxblood, sparingly used.
- Body: dark ink, generous line-height in editorial blocks; consistent reading width.
- Navigation/actions: compact and distinguishable. Use sans for densely repeated items.
- Tables, Inspector labels, timeline labels: practical sans; aligned and tabular figures where helpful.

**Anti-patterns:** making every heading huge; center-aligning long blocks; spreading tracked capitals across all controls; very thin high-contrast display faces at small sizes; using a dramatic serif for data cells.

---

## 5. Layout, composition and surfaces

- Use an **8px base spacing rhythm**, with 4px steps for dense UI; actual measurements require component audit.
- **Home:** strong asymmetric editorial hero, overlapping genuine map/document imagery, foreground paper area for copy, generous headline-to-body contrast; purposeful lower gateway band.
- **Data entry:** retain an obvious decision hierarchy and visible actions. Historical collage can frame the introductory area or page edges; the current Data page's three entry actions remain unmistakable and reachable without scrolling at typical desktop dimensions when feasible.
- **Workspace interiors:** neutral, relatively flat surfaces, true panel boundaries, usable space, compact navigation and readable data.
- Paper texture should be **subtle enough not to reduce contrast**. Prefer asset-based texture only in background/hero surfaces; avoid visible grain in input controls, selection overlays or table rows.
- Use hairlines and negative space in place of repeated box borders. Avoid large framed containers *plus* ornamental dividers *plus* decorative page-wide backgrounds on the same screen.
- Corner treatment: mostly 4–8px on functional surfaces; editorial CTA pills may be much rounder. No universal “rounded everything” rule.
- Preserve responsive resilience at desktop viewport sizes and browser zoom, including scrollbar behavior for overlong content; do not rely on poster-scale fixed-height image compositions.

### Functional vs expressive design budget

| Surface | Image / decoration budget | Priority |
|---|---|---|
| Home hero | High | Brand expression and obvious entry path |
| Home gateway cards | Medium | Rich crop + legible action + compact copy |
| Data selection introduction | Medium | Attractive welcome without hiding choices |
| Upload mapping/review | Very low | Data fields, editable mappings, error states |
| Visualize canvas | Near zero decoration *inside data plotting field* | Readable spatial and temporal evidence |
| Explore tables, filters, Inspector | Near zero | Dense research analysis |
| Tutorials/About | Medium–high | Legible narrative + authentic illustrations |
| Export output | Optional, user controlled | No imposed branding |

---

## 6. Authentic imagery and licensing policy — required for production

**Use real historical maps and licensed stock design accents, not AI-generated production artwork.** This is a deliberate design decision, not simply a preference for higher-resolution images.

### Asset classes

1. **Archival maps:** genuine historical scans/reproductions. Record holding institution, creator (if known), title, date/approximate date, stable source URL/identifier, rights/reuse statement, modifications/crop, and desired credit.
2. **Archival documents and engravings:** same provenance checklist. Select details that suit the page's content; do not rely exclusively on early modern Europe throughout the app.
3. **Licensed stock accents:** paper textures, botanical imagery, compass marks, cut-paper masks, decorative graphic elements and possibly photographs. Keep provider, license tier, allowed web distribution/use, attribution requirements, receipt/license reference, and any restrictions on modification/redistribution.
4. **Original design elements:** CSS/SVG rules, route-like decorations, node diagrams and icons built for Peridot; visually distinguish decorative motifs from factual visualizations.
5. **Actual data imagery:** use **real Peridot screenshots or genuine user-permitted dataset artifacts**, never invented screenshot/table/graph content presented as real functionality.

### Rights and ethical review

- Verify **digital reproduction rights and applicable terms** for each historical image; age alone does not prove that the specific image file is unrestricted.
- Confirm licensing permits **public web hosting in a GitHub Pages application**, including any attribution requirements and restrictions on sublicensing or bundling assets in a public repository.
- Keep a project **asset register**. Recommended fields: `asset_id`, `type`, `filename`, `source_title`, `creator`, `date`, `institution_or_vendor`, `source_url`, `license_or_rights`, `proof_or_receipt`, `required_credit`, `transformations`, `placement`, `approval_status`.
- Avoid using cartographic graphics as decorative “evidence” or implying an ornamental route corresponds to a real analytical result.
- Use meaningful alt text for informative images; mark purely decorative images as decorative. Ensure content remains intelligible if backgrounds fail to load.
- Optimize image sizes, preserve crop focal points, and check asset readability/performance on target desktop viewports.

**Asset status now:** production maps, stock accents and credits are **not yet selected**. The generated mockup scenery is excluded from the production asset inventory.

---

## 7. Component system — intended translation

| Component | Direction |
|---|---|
| Persistent header | Light paper surface; restrained oxblood serif wordmark; compact, readable navigation; clear active indication; visible current-dataset context as existing UX requires |
| Primary CTA | Distinct high-contrast filled action; oxblood acceptable in editorial entry context; forest acceptable as contrasting functional CTA |
| Secondary CTA | Fine dark-red outline or restrained unfilled control, readable focus indicator |
| Dataset selection | Compact, clearly legible, no decorative texture behind selections |
| Tabs / view toggles | Slim, functional, clear selected state through more than color |
| Search / selects / forms | Clean near-flat surfaces, useful hit areas, visible states, robust labels |
| Information cards | Editorial image crop is allowed on navigation/gateway cards; not on data-heavy cards |
| Data tables | Quiet background, discernible columns, aligned numbers, stable selection/hover/focus |
| Inspector | Compact and factual; omit decorative frame |
| Network/map/timeline canvases | Data dominates; no vintage wallpaper under meaningful analytic marks unless explicitly tested for contrast and interpretation |
| Feedback/errors | Visibly accessible and unambiguous; not expressed only by aesthetic accent color |

**Do not import fictional mockup elements as requirements**—for instance, an all-site search field, arbitrary sample-image cards, or a new upload-step structure. Use the live implementation as the source of truth for capabilities.

---

## 8. Two-page case study: translation from current screenshots

### A. Home — the expressive benchmark

**Current functional facts shown in provided screenshot:** persistent top navigation; centered Peridot emblem; product statement; prominent **Use Sample Data** and **Upload Your Data** actions; secondary disabled Tutorial action. The existing design is dark forest green with gold lettering and mirrored ornament.

**Exploratory target:** replace the full dark field with a lighter editorial hero: very large oxblood `PERIDOT`, paper-grounded introduction, real map imagery as an offset collage, small geographic motifs, and a strong two-action invitation. A lower gateway region may introduce Manage/Visualize/Explore **only if it harmonizes with actual app behavior and the project's existing Home plan**.

**Keep:** working sample/upload routes, distinct priority of these choices, appropriate disabled state for Tutorial until functional, persistent navigation, active-dataset behavior, accessible focus and scannable copy. Do not silently replace the present actions with a generic `Get Started` button.

**Mockup-specific elements that are optional:** panorama scale, fake route network, Florence vignette, three gateway photo cards, global search. These may inspire design but are not committed features.

**Success test:** at a realistic desktop resolution, the page feels like a beautiful editorial cover **and** a new visitor immediately knows how to start with a sample or upload a file.

### B. Data landing/selection — a coordinated but quieter page

**Current functional facts shown in provided screenshot:** title **Choose what data to use.**, explanatory copy covering CSV/TSV/XLS/XLSX, three distinct actions **Start with a Template**, **Start with Sample Data**, **Upload Your Data**, plus visible current source and **Edit sample mapping** context. Existing background is dark green with diagonal line texture and large ornate dividers.

**Exploratory target:** retain the informational and decision architecture, but shift it to ivory/oxblood editorial typography with a cropped authentic map or document fragment to one side; a short introduction area that visually connects to the Home hero; three prominent actions on clean, high-contrast controls; contextual dataset line beneath. Fine archival ornament may frame the section but should not compete with the actions.

**Keep:** the three choices **separate** and correctly named, underlying actions and current-source/mapping access, readable file-format guidance, scrollbars when needed and maximum useful viewport height. This landing page is a decision surface; it is not the full upload/mapping workspace.

**Mockup caution:** the case-study rendering's giant intro box, compass centerpiece and long map panel could consume too much vertical space at normal desktop dimensions. Reduce/remove them before sacrificing actions or scrolling clarity. Do not turn the full mapping workflow into a decorated brochure.

**Success test:** the page feels directly related to the Home cover, but the user can compare the three entry paths at a glance and act immediately.

### Explicit translation difference

The earlier *v0.1* Manage concept referred to a **full upload wizard with step rail and sample cards**. The supplied Data screenshot and the new Data case-study image instead refer to the **Data landing/choice page**. Treat these as **different UI states**. Later mockups for mapping steps should be based on their own actual screenshots/current source, not invented from this landing screen.

---

## 9. Other workspace rules (not yet visually validated)

- **Manage / mapping and Review:** preserve dataset profiles, Records/Entities distinction, role and identity rules, related sheets, data editing, preview, and review/accept. Light, data-first styling with minimal illustrative texture.
- **Visualize / Map, Network, Timeline:** retain map/network/timeline distinctions and all supported interaction, temporal semantics, directionality, relationship semantics, chosen location anchors, viewport and playback behavior. Make the visualization canvas dominant.
- **Explore / Browse, Advanced Query, Refine:** preserve query behavior, browse ledgers and facets. Use compact controls and purposeful typographic hierarchy; no display type in evidence tables.
- **Export:** retain no mandatory Peridot branding in exported images; any editorial framing remains optional.
- **How To / Tutorials, About:** can use a higher expressive budget, but examples must depict genuine features, and instructions remain easy to scan.

---

## 10. Accessibility and interaction requirements

- Target WCAG 2.2 AA where applicable and verify actual rendered combinations, not palette swatches in isolation.
- Maintain visible keyboard focus, active states, adequate hit targets and cues beyond color alone.
- Reduced-motion support; animation must not be necessary to identify current state.
- Keep interactive text on stable, sufficiently opaque surfaces over archival images.
- Respect browser zoom and accessible font scaling; never clip critical decision actions.
- Avoid importing large textures into performance-sensitive visualization layers.
- Protect user data semantics and existing state persistence during visual-only redesign.

---

## 11. Governance: what is approved, provisional and unresolved

### Accepted direction
- **Cartographic Editorial** as the aesthetic direction for exploration.
- Two-register model (expressive editorial entry views; functional research workspaces).
- Strong historical materiality, bold serif display typography, oxblood/ivory/forest relationship.
- Production imagery from licensed stock and real archival maps rather than generated visual assets.
- The real screenshots are functional ground truth; generated mockups are visual references.

### Provisional, requiring explicit review
- All hex colors, type families, exact font weights and scale values.
- Hero layout, right/left collage crop, decorative motif selection, CTA color assignment.
- Whether Home gets additional Manage/Visualize/Explore gateway cards.
- How much map imagery appears on the Data landing page.
- Detailed component appearance, responsive layout and CSS token architecture.

### Not authorized by this document
- New app capabilities inferred from images; workflow or routing changes; code edits; changes to dataset/visualization semantics; use of generated historical artwork in production; reuse of stock material without verified license; universal decoration on workspace controls.

---

## 12. Handoff and implementation protocol

1. Keep the four visual reference groups available: **three flyer concepts**, **current Home screenshot**, **current Data landing screenshot**, **two generated case-study mockups**; store a production-safe local design reference bundle when selected.
2. For each page, create a side-by-side *as-is vs proposed* visual/spec check showing unchanged behavior and changed presentation.
3. Select authentic map/stock assets and document rights in an asset register before integration.
4. Test font candidates and accessible palette variations in-browser at actual application sizes.
5. Inspect the **entire exact current source file(s)** before coding; do not reconstruct from older snapshots or mockups.
6. Apply changes in small, reversible passes with uniquely versioned replacement files and complete Windows PowerShell handoff commands, as required by Peridot's existing development protocol.
7. Verify page navigation, scroll behavior, dataset persistence, sample selection, upload/mapping, visualization interactions, exports, and accessibility after each pass.

**Suggested rollout, not yet authorized:** approve Home + Data landing case study → finalize tokens and authentic asset selections → establish shared header and tokens → Home → Data landing → functional mapping states → Explore → Visualize → other pages → regression/accessibility audit.

---

## 13. Revision record

**v0.2 (14 Oct 2026):** Reconciled v0.1 with the three original flyer aesthetics, two generated Home/Data case-study mockups, and the supplied current Home/Data screenshots. Elevated the editorial composition and typography from general aspiration to explicit style signatures. Clarified that Data landing is not the full upload wizard. Added binding production-asset direction (licensed stock + authentic historical maps), provenance/rights inventory, mockup-versus-functional-truth distinctions, per-page preservation rules, governance statuses, and implementation handoff guardrails. Retained v0.1's working palette/font candidates as **provisional**.

**v0.1 (14 Oct 2026):** Initial exploratory style system.
