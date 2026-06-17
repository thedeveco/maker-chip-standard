// Convert scripts/assets/magnet-warning.svg to vector polylines and
// write magnet-warn.ts. Run from project root:
//   node scripts/build-magnet-warn-from-svg.js
//
// Assumes the SOURCE SVG IS ALREADY A CENTERLINE DRAWING — every visible
// line is a single <path> with `fill:none;stroke:<color>;stroke-width:N`.
// (For layer2.svg this is 10 paths: 1 triangle, 1 magnet U+caps outline,
// 8 attraction dashes.) No outer/inner pair detection or PCA-based fill
// reconstruction is needed; each path translates 1:1 to a silkscreen
// stroked polyline.
//
// Earlier source files used filled paths and required pair/centerline
// logic — see git history of this script for that version.
const fs = require("fs")
const svgpath = require("svgpath")

const INPUT = "scripts/assets/magnet-warning.svg"
const OUT = "magnet-warn.ts"
const SEG = 32

const svg = fs.readFileSync(INPUT, "utf8")
const paths = []
const pathRe = /<path\b[^>]*\sd\s*=\s*"([^"]+)"/g
let m
while ((m = pathRe.exec(svg)) !== null) paths.push(m[1])
if (!paths.length) {
  console.error("no <path> found")
  process.exit(1)
}

function flatten(d) {
  const contours = []
  let cur = null
  let x = 0,
    y = 0,
    sx = 0,
    sy = 0
  function push(px, py) {
    cur.push({ x: px, y: py })
    x = px
    y = py
  }
  function cubic(x1, y1, x2, y2, ex, ey) {
    for (let i = 1; i <= SEG; i++) {
      const t = i / SEG
      const it = 1 - t
      push(
        it * it * it * x +
          3 * it * it * t * x1 +
          3 * it * t * t * x2 +
          t * t * t * ex,
        it * it * it * y +
          3 * it * it * t * y1 +
          3 * it * t * t * y2 +
          t * t * t * ey,
      )
    }
  }
  function quad(x1, y1, ex, ey) {
    for (let i = 1; i <= SEG; i++) {
      const t = i / SEG
      const it = 1 - t
      push(
        it * it * x + 2 * it * t * x1 + t * t * ex,
        it * it * y + 2 * it * t * y1 + t * t * ey,
      )
    }
  }
  svgpath(d)
    .unarc()
    .abs()
    .unshort()
    .iterate((seg) => {
      const cmd = seg[0]
      if (cmd === "M") {
        if (cur) contours.push(cur)
        cur = []
        x = seg[1]
        y = seg[2]
        sx = x
        sy = y
        cur.push({ x, y })
      } else if (cmd === "L") push(seg[1], seg[2])
      else if (cmd === "H") push(seg[1], y)
      else if (cmd === "V") push(x, seg[1])
      else if (cmd === "C") cubic(seg[1], seg[2], seg[3], seg[4], seg[5], seg[6])
      else if (cmd === "Q") quad(seg[1], seg[2], seg[3], seg[4])
      else if (cmd === "Z" || cmd === "z") {
        push(sx, sy)
        contours.push(cur)
        cur = null
      }
    })
  if (cur) contours.push(cur)
  return contours
}

const all = []
for (const d of paths)
  for (const c of flatten(d)) if (c.length > 1) all.push(c)
console.log("polylines:", all.length)

// Normalize to ±0.5 unit frame, Y up (flip SVG Y).
let minX = Infinity,
  minY = Infinity,
  maxX = -Infinity,
  maxY = -Infinity
for (const c of all)
  for (const p of c) {
    if (p.x < minX) minX = p.x
    if (p.x > maxX) maxX = p.x
    if (p.y < minY) minY = p.y
    if (p.y > maxY) maxY = p.y
  }
const s = 1 / Math.max(maxX - minX, maxY - minY)
const cx = (minX + maxX) / 2
const cy = (minY + maxY) / 2
const norm = all.map((c) =>
  c.map((p) => ({
    x: +((p.x - cx) * s).toFixed(4),
    y: +(-(p.y - cy) * s).toFixed(4),
  })),
)

const body = `/** Magnet warning glyph for the bottom-PCB external face.
 *  Source: C:\\\\Users\\\\Kev\\\\Downloads\\\\layer2.svg
 *  Each SVG <path> in the source is a single stroked centerline
 *  (fill:none, stroke-width:3 in 113.6mm source units), so the build
 *  script flattens each one 1:1 to a polyline — no pair-detection or
 *  centerline averaging needed. ${norm.length} polylines, normalized to
 *  a ±0.5 unit frame (Y up). Render with
 *  renderContours(MAGNET_WARN, cx, cy, scale, ...) using a stroke width
 *  of ~0.16mm at icon scale 5mm (= source stroke × icon-scale ÷ source
 *  width, rounded up to a fab-safe minimum). */
export const MAGNET_WARN: { x: number; y: number }[][] = ${JSON.stringify(norm)}
`
fs.writeFileSync(OUT, body)
console.log(
  "wrote",
  OUT,
  "polylines:",
  norm.length,
  "points:",
  norm.reduce((s, c) => s + c.length, 0),
)
