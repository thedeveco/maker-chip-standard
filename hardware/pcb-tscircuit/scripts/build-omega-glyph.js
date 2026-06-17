// Flatten the Lucide omega SVG (scripts/assets/lucide-omega.svg) to a
// single polyline contour and write omega-glyph.ts. Source is a single
// stroked path with stroke-width:2 in a 24×24 viewBox. Run from project
// root:
//   node scripts/build-omega-glyph.js
const fs = require("fs")
const svgpath = require("svgpath")

const INPUT = "scripts/assets/lucide-omega.svg"
const OUT = "omega-glyph.ts"
const SEG = 32

const svg = fs.readFileSync(INPUT, "utf8")
const paths = []
const pathRe = /<path\b[^>]*\sd\s*=\s*"([^"]+)"/g
let m
while ((m = pathRe.exec(svg)) !== null) paths.push(m[1])

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

// Normalize to a ±0.5 unit frame, Y up.
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
const scale = 1 / Math.max(maxX - minX, maxY - minY)
const cx = (minX + maxX) / 2
const cy = (minY + maxY) / 2
const norm = all.map((c) =>
  c.map((p) => ({
    x: +((p.x - cx) * scale).toFixed(4),
    y: +(-(p.y - cy) * scale).toFixed(4),
  })),
)

const body = `/** Omega (Ω) glyph traced from the Lucide omega icon
 *  (https://lucide.dev/icons/omega — MIT licensed). Source is a single
 *  stroked path with stroke-width:2 in a 24×24 viewBox, flattened by
 *  .cache/build-omega-glyph.js. Normalized to a ±0.5 unit frame (Y up).
 *  ${norm.length} polyline(s). Replaces the earlier hand-drawn glyph
 *  whose proportions read as off. */
export const OMEGA_GLYPH: { x: number; y: number }[][] = ${JSON.stringify(norm)}
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
