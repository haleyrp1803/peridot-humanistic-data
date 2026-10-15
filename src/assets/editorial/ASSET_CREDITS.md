# Editorial image provenance — Home H2a

These archival works are used as decorative visual references on the Home page, not as user-data visualizations. The images have been resized/re-encoded to WebP without modifying the underlying imagery.

## Florence panorama (`rosselli-florence.webp`)
- **Title:** *Pianta della Catena* (Chain Map), view of Florence.
- **Attribution:** Attributed to Francesco di Lorenzo Rosselli; Commons file title describes the image as “1470.”
- **Reproduction qualification:** Wikimedia Commons describes the depicted item as an **1887 facsimile** and notes a lost earlier original (its catalog text also references an original made in 1490). Do not describe this digital image categorically as a photograph of an extant 1470 original.
- **Holding/source credit as stated on Wikimedia Commons:** Museo di Firenze com’era / Palazzo Vecchio; source/photographer field lists Gemäldegalerie, Berlin.
- **Source:** https://commons.wikimedia.org/wiki/File:Francesco_Rosselli_(attribution)._Pianta_della_Catena,_1470.jpg
- **Rights statement on Commons:** Public domain (Public Domain Mark 1.0; faithful photographic reproduction of a public-domain two-dimensional work). Review jurisdiction-specific reuse if appropriate.
- **Local upload supplied by project owner:** `Rosselli_Map_of_Florence.jpg` (2000 × 865).

## Portolan chart detail (`benincasa-portolan-detail.webp`)
- **Creator:** Grazioso Benincasa (circa 1400–1482).
- **Work:** *Portolan chart of the Black Sea, Sea of Marmara and Eastern Mediterranean* (1466).
- **Holding/digital source:** Bibliothèque nationale de France, Gallica, identifier **btv1b59011091**.
- **Source:** https://commons.wikimedia.org/wiki/File:1466_Portolan_chart_of_the_Black_Sea,_Sea_of_Marmara_and_the_Eastern_Mediterrenean_by_Grazioso_Benincasa.jpg
- **Rights statement on Commons:** Public domain (Public Domain Mark 1.0).
- **Local image supplied by project owner:** `1466 Benincasa Map detail.jpg` (2048 × 1024), a crop/detail; do not represent it as a full chart reproduction.

## Implementation / scope
- The images are locally bundled within `src/assets/editorial`, not loaded from third-party servers at runtime.
- Florence hero image is decorative (`alt=""`, within an `aria-hidden` wrapper); the live textual UI retains semantic headings and actual React button handlers.
- The portolan chart appears as a **lightly obscured secondary background** under the feature strip to keep explanatory text legible.
- H2a intentionally retains the H1 geometric torn edge. Organic torn-paper art/masks belong to H2b.
- Before public release, consider adding a visible or easily accessible image-credit link (such as an About credits section), in addition to this repository record.
