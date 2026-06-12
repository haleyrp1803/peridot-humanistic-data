# Peridot Upload Guide palette preset audit

## Scope

This pass adds one built-in palette preset to `src/peridotTheme.js`:

- `peridotUploadGuide`
- Display label: `Peridot Upload Guide`

No component layout, palette-import detection logic, role metadata, or Theme workspace behavior was changed.

## Source intent

The preset is based on the Peridot Palette Upload Guide image. It follows the guide's intended functional slots:

1. lightest paper/background
2. light land / light surface
3. mid-light selected land
4. mid tone / muted panel
5. darkest contrast
6. ocean / map background
7. nodes / edges
8. selected node / highlight
9. buttons / warm accent
10. chart accent set

## Preset values

```js
peridotUploadGuide: {
  label: 'Peridot Upload Guide',
  dark: ['#06200f', '#093f0a', '#14351d', '#4f5b3f'],
  mid: ['#46533b', '#8fa955', '#3f8738', '#9aaf60'],
  light: ['#cbd9c4', '#e9e2c9', '#f5ecd2', '#fff8e8'],
  highlight: ['#e3aa43', '#d6a36a'],
}
```

## Expected behavior

Because the Theme workspace derives preset buttons from `PERIDOT_SOURCE_PALETTES`, the new preset should appear automatically in the Site-wide palette selector.

When selected, it should produce:

- dark green shell/chrome
- cream and paper UI surfaces
- pale sage map/ocean surfaces
- distinct light land
- dark/bold node and edge colors
- warm gold buttons and active states
- olive/sage chart accents

## Acceptance test

```powershell
npm.cmd run build
npm.cmd run dev
```

Then open Themes and Accessibility, select **Peridot Upload Guide**, and verify Route Map, Chart Visualizations, Explore/Inspector, Manage Data, and Timeline render without layout changes.
