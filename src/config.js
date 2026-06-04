// Snap grid size in px. Everything (persons, unions, dragged lines) snaps to
// this grid. Connection dots stay grid-aligned because box width/height are
// kept to multiples of 2*GRID (so the centers of each side land on the grid).
export const GRID = 5

// Person box width. Must be a multiple of 2*GRID so the top/bottom handles
// (horizontal center) land on the grid.
export const BOX_WIDTH = 160

// Union circle diameter. A multiple of 2*GRID keeps its center on the grid.
export const UNION_SIZE = 10

// Canvas background (UsefulCharts beige).
export const BACKGROUND = '#EDE8D8'

// Official UsefulCharts color palette — offered as quick-pick swatches under
// every color picker. (Maroon border is intentionally excluded; it's reserved
// for official UsefulCharts. The brown #78501E border is the fan-made one.)
export const PALETTE = [
  { name: 'Blue', hex: '#80C3E1' },
  { name: 'Yellow', hex: '#EFC239' },
  { name: 'Red', hex: '#F26654' },
  { name: 'Green', hex: '#96BC96' },
  { name: 'Orange', hex: '#EF953A' },
  { name: 'Purple', hex: '#AD81AF' },
  { name: 'Pink', hex: '#EAACBD' },
  { name: 'Neutral', hex: '#D5D1C3' },
  { name: 'Border brown', hex: '#78501E' },
  { name: 'Background', hex: '#EDE8D8' },
]

// Line widths per the style guide: 5px solid, 3px dashed/dotted.
export const SOLID_WIDTH = 5
export const DASH_WIDTH = 3

// Font stack. The guide uses "Alte Haas Grotesk" — if you drop the font file in
// and @font-face it (see README), it'll be used; otherwise it falls back.
export const FONT_STACK =
  "'Alte Haas Grotesk', 'Helvetica Neue', Arial, sans-serif"
