# Peridot Classic Itch palette audit

## Scope

This pass adds a built-in palette preset that reconstructs the older itch.io build color atmosphere without reverting the current theme system.

## Source

The palette was derived from `correspondence-visualizer-itch.zip`, especially the repeated colors in:

- `assets/index-DiARgvKy.js`
- `assets/index-Dv0WMtu2.css`

The most repeated older colors included dark greens, cream surfaces, sage/olive map tones, and warm gold accents.

## Added preset

```js
peridotClassicItch: {
  label: 'Peridot Classic Itch',
  dark: ['#02110B', '#04160F', '#082719', '#173120'],
  mid: ['#33412F', '#52624D', '#6E8475', '#8AA36D'],
  light: ['#DFE9C8', '#F5ECD2', '#FBF7EA', '#FFF8E8'],
  highlight: ['#B58B42', '#D6A36A', '#B99B63'],
}
```

## Expected behavior

The preset should appear with the other site-wide palette choices in Themes and Accessibility. Selecting it should restore a closer version of the older dark-green/cream/gold Peridot atmosphere while preserving current role-based editing and image-import behavior.

## Files changed

- `src/peridotTheme.js`
- `PERIDOT_THEME_PALETTE_GUIDE.md`

## Acceptance test

1. Run `npm.cmd run build`.
2. Run `npm.cmd run dev`.
3. Open Themes and Accessibility.
4. Select `Peridot Classic Itch`.
5. Confirm the app reloads.
6. Check Route Map, Chart Visualizations, Explore, and Manage Data.
7. Confirm the app resembles the older itch.io screenshots more closely than the newer experimental presets.
