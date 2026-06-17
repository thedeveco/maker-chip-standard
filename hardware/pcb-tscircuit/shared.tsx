/**
 * Shared geometry + helpers for the Maker Chip 3-PCB stack.
 * Imported by top.circuit.tsx, middle.circuit.tsx, bottom.circuit.tsx.
 */

/** Board diameter in mm. */
export const BOARD_DIAMETER = 40
/** Board radius in mm. */
export const BOARD_RADIUS = BOARD_DIAMETER / 2

/** Pogo-pad circle: 8 pads on a 16.3mm-diameter circle (radius 8.15mm). */
export const POGO_RADIUS = 8.15

/** LED triangle: equilateral, 25mm sides, centered on the board.
 *  Circumradius = side / sqrt(3). */
export const LED_TRI_RADIUS = 25 / Math.sqrt(3)

/** Magnet pocket: 15mm dia, centered above each of the 2 power pogo pads. */
export const MAGNET_DIAMETER = 15
export const MAGNET_RADIUS = MAGNET_DIAMETER / 2

/** ADA-6141 filament (single-ended, 2200K warm-white):
 *    length 25mm, diameter 1.7mm. The two solder leads exit one end of the
 *    filament (the LED component XY = vertex of the equilateral triangle).
 *    The body extends from the lead end inward toward the board center
 *    (so the 3 LEDs form a Δ logo with their bodies converging).
 *  Datasheet:
 *    https://cdn-shop.adafruit.com/product-files/6141/Datasheet+LED+Filament+Single+Ended.pdf
 */
export const FILAMENT_LENGTH = 25
export const FILAMENT_DIAMETER = 1.7
/** Slot is shorter than the filament so the lead pads at each vertex stay
 *  on solid PCB material. Gap per vertex = (FILAMENT_LENGTH − FILAMENT_SLOT_LENGTH)/2. */
export const FILAMENT_SLOT_LENGTH = 20
export const FILAMENT_SLOT_WIDTH = 2.5
/** Clearance from each vertex pad to the nearest slot edge (mm). Implied
 *  by the slot vs. filament length difference. */
export const LEAD_GAP = (FILAMENT_LENGTH - FILAMENT_SLOT_LENGTH) / 2

/** Outward perpendicular shift of each filament slot (mm). Pushes the
 *  slots away from the triangle's center axis so adjacent slot corners
 *  don't meet at the vertices — leaves a small bridge of PCB material
 *  at each corner holding the center of the board together. */
export const FILAMENT_SLOT_OUTWARD_OFFSET = 1

/** Next vertex angle going counter-clockwise around the equilateral
 *  triangle (each vertex is 120° apart). */
export function nextVertexAngle(vertexAngle: number) {
  return (((vertexAngle + 120) % 360) + 360) % 360
}

/** Direction (deg) the filament body extends from its lead pads.
 *  Each LED traces ONE side of the equilateral triangle, going from
 *  its own vertex to the next vertex CCW. The direction from a vertex
 *  at angle V to the vertex at V+120° is V+150° (derived from
 *  trig identities). The 3 filaments together form the 3 sides of
 *  the Δ logo. */
export function filamentBodyAngle(vertexAngle: number) {
  return (((vertexAngle + 150) % 360) + 360) % 360
}

/** Center XY of a filament body cutout slot. Starts at the midpoint of
 *  the triangle side that this LED's body traces, then shifts outward
 *  perpendicular to that side by FILAMENT_SLOT_OUTWARD_OFFSET so the
 *  slot corners at each vertex don't meet — leaves a small material
 *  bridge at every corner. */
export function filamentSlotCenter(vertexAngle: number) {
  const v1 = ledXY(vertexAngle)
  const v2 = ledXY(nextVertexAngle(vertexAngle))
  const mx = (v1.x + v2.x) / 2
  const my = (v1.y + v2.y) / 2
  const r = Math.hypot(mx, my)
  return {
    x: mx + (FILAMENT_SLOT_OUTWARD_OFFSET * mx) / r,
    y: my + (FILAMENT_SLOT_OUTWARD_OFFSET * my) / r,
  }
}

/** Edge-plated rim pad geometry. */
export const EDGE_PAD_RADIAL = 2.5
export const EDGE_PAD_TANGENTIAL = 4
/** Edge pads extend SLIGHTLY past the board outline (toward the exterior)
 *  so the visible copper continues all the way to the rim. The fab's
 *  outline-cut step trims off the excess at manufacture. */
export const EDGE_PAD_OVERHANG = 0.5

/** Inner and outer radial edges of each rim pad. */
export const EDGE_PAD_INNER_R = BOARD_RADIUS - EDGE_PAD_RADIAL
export const EDGE_PAD_OUTER_R = BOARD_RADIUS + EDGE_PAD_OVERHANG

/** Pad center is the midpoint of the inner and outer radial edges. */
export const EDGE_PAD_CENTER_R = (EDGE_PAD_INNER_R + EDGE_PAD_OUTER_R) / 2

/** U1 (ATtiny85 QFN-20) center: midway between PAD1 (pogo, bottom face,
 *  at (0, POGO_RADIUS)) and EDGE5 (rim pad, at (0, EDGE_PAD_CENTER_R)).
 *  Both sit on the +Y axis (vertex angle 90°), so the midpoint is on the
 *  same axis. Placing the MCU here makes the U1.PB0 → PAD1 → EDGE5 net
 *  a clean north-axis radial run. */
export const U1_CENTER = { x: 0, y: (POGO_RADIUS + EDGE_PAD_CENTER_R) / 2 }

/** Approximate the circular board outline as an N-gon. Default segment
 *  count picked high enough that the polygon visually reads as a
 *  smooth circle at typical render zooms. */
export function circleOutline(radius: number, segments = 256) {
  const pts: { x: number; y: number }[] = []
  for (let i = 0; i < segments; i++) {
    const a = (i / segments) * Math.PI * 2
    pts.push({ x: radius * Math.cos(a), y: radius * Math.sin(a) })
  }
  return pts
}

/** Pogo-pad center at angle θ (deg) on the POGO_RADIUS circle. */
export function pogoXY(angleDeg: number) {
  const a = (angleDeg * Math.PI) / 180
  return { x: POGO_RADIUS * Math.cos(a), y: POGO_RADIUS * Math.sin(a) }
}

/** Edge-pad center at angle θ (deg) on the rim. */
export function edgePadXY(angleDeg: number) {
  const a = (angleDeg * Math.PI) / 180
  return { x: EDGE_PAD_CENTER_R * Math.cos(a), y: EDGE_PAD_CENTER_R * Math.sin(a) }
}

/** LED vertex center at angle θ (deg) on the 25mm-side equilateral triangle. */
export function ledXY(angleDeg: number) {
  const a = (angleDeg * Math.PI) / 180
  return { x: LED_TRI_RADIUS * Math.cos(a), y: LED_TRI_RADIUS * Math.sin(a) }
}

/** Radial distance (mm) from the board center to each resistor center.
 *  The 3 resistors sit at the triangle corner peaks — radially outward
 *  from each LED's "own" vertex (where its slot's cathode end is).
 *  Pattern is 3-fold rotationally symmetric; all 3 clear of both magnet
 *  keep-away zones and rim edge pads. */
export const RESISTOR_RADIAL_DISTANCE = 16

/** Resistor center for the LED at vertex angle V. Sits at the V corner
 *  peak — on the radial line from board center through that vertex, at
 *  RESISTOR_RADIAL_DISTANCE from the origin (just past the LED triangle
 *  vertex at LED_TRI_RADIUS ≈ 14.43mm). */
export function resistorXY(vertexAngle: number) {
  const a = (vertexAngle * Math.PI) / 180
  return {
    x: RESISTOR_RADIAL_DISTANCE * Math.cos(a),
    y: RESISTOR_RADIAL_DISTANCE * Math.sin(a),
  }
}

/** 16 edge-plated rim pads. Outer edge of each pad sits on the board
 *  outline. Same layout on every PCB in the stack so the fab's side-
 *  metallization step bridges all three boards into one column.
 *  8 are wired to existing pogo-pad nets (one per pogo angle); 8 are
 *  unwired structural spares. */
export type EdgePad = {
  name: string
  angle: number
  net?: string
  role: string
  /** Primary user-facing label (function) on silkscreen. */
  label: string
  /** Optional genuinely-useful extra info (e.g. rail voltage). Rendered on
   *  the opposite tapered side of the pad. Omitted for pads whose only
   *  "extra" would be a redundant pin name (PBx) or self-evident value. */
  special?: string
}

export const edgePads: EdgePad[] = [
  { name: "EDGE1",  angle:    0, net: "net.GND",     role: "GND (matches PAD3)",                label: "GND" },
  { name: "EDGE2",  angle:  22.5,                    role: "spare",                             label: "EXTRA" },
  { name: "EDGE3",  angle:   45, net: "net.SIG_PB4", role: "PWM/PB4 + LED3 (matches PAD2)",     label: "PWM" },
  { name: "EDGE4",  angle:  67.5,                    role: "spare",                             label: "EXTRA" },
  { name: "EDGE5",  angle:   90, net: "net.SIG_PB0", role: "DATA/PB0 + LED1 (matches PAD1)",    label: "DATA" },
  { name: "EDGE6",  angle: 112.5,                    role: "spare",                             label: "EXTRA" },
  { name: "EDGE7",  angle:  135, net: "net.SIG_PB3", role: "ANALOG/PB3 (matches PAD8)",         label: "ADC" },
  { name: "EDGE8",  angle: 157.5,                    role: "spare",                             label: "EXTRA" },
  { name: "EDGE9",  angle:  180, net: "net.VCC",     role: "VCC (matches PAD7)",                label: "VCC",  special: "5V" },
  { name: "EDGE10", angle: 202.5,                    role: "spare",                             label: "EXTRA" },
  { name: "EDGE11", angle:  225, net: "net.SIG_PB1", role: "MISO/PB1 + LED2 (matches PAD6)",    label: "MISO" },
  { name: "EDGE12", angle: 247.5,                    role: "spare",                             label: "EXTRA" },
  { name: "EDGE13", angle:  270, net: "net.SIG_PB5", role: "CS/RST/PB5 (matches PAD5)",         label: "RST" },
  { name: "EDGE14", angle: 292.5,                    role: "spare",                             label: "EXTRA" },
  { name: "EDGE15", angle:  315, net: "net.SIG_PB2", role: "CLK/PB2 (matches PAD4)",            label: "SCK" },
  { name: "EDGE16", angle: 337.5,                    role: "spare",                             label: "EXTRA" },
]

/** Polygon vertices for a rotated rectangular slot (used as a board
 *  cutout for the LED filament body). Centered at (cx, cy), length × width,
 *  rotated by `angleDeg` around its center. */
export function rotatedRectPolygon(
  cx: number,
  cy: number,
  length: number,
  width: number,
  angleDeg: number,
) {
  const a = (angleDeg * Math.PI) / 180
  const c = Math.cos(a)
  const s = Math.sin(a)
  const hl = length / 2
  const hw = width / 2
  const local: [number, number][] = [
    [+hl, +hw],
    [-hl, +hw],
    [-hl, -hw],
    [+hl, -hw],
  ]
  return local.map(([lx, ly]) => ({
    x: cx + lx * c - ly * s,
    y: cy + lx * s + ly * c,
  }))
}

/** Minimum internal cutout corner radius set by JLCPCB's default 1.0mm
 *  routing bit (= 0.5mm radius). Going below this triggers a small-bit
 *  surcharge. Using exactly 0.5mm keeps cutouts within free routing. */
export const CUTOUT_CORNER_RADIUS = 0.5

/** Polygon vertices for a rotated rectangular slot with rounded corners.
 *  Returns N×4+4 points approximating each corner as an arc. Centered at
 *  (cx, cy), with length along the rotated +X axis and width along the
 *  rotated +Y axis. Corner radius is clamped to half-length / half-width. */
export function roundedRectPolygon(
  cx: number,
  cy: number,
  length: number,
  width: number,
  angleDeg: number,
  cornerRadius = CUTOUT_CORNER_RADIUS,
  cornerSegments = 6,
) {
  const hl = length / 2
  const hw = width / 2
  const r = Math.min(cornerRadius, hl, hw)
  const corners = [
    { cx:  hl - r, cy:  hw - r, startAngle: 0 },                  // top-right
    { cx: -(hl - r), cy:  hw - r, startAngle: Math.PI / 2 },      // top-left
    { cx: -(hl - r), cy: -(hw - r), startAngle: Math.PI },        // bottom-left
    { cx:  hl - r, cy: -(hw - r), startAngle: 3 * Math.PI / 2 },  // bottom-right
  ]
  const local: [number, number][] = []
  for (const corner of corners) {
    for (let i = 0; i <= cornerSegments; i++) {
      const a = corner.startAngle + (i / cornerSegments) * (Math.PI / 2)
      local.push([corner.cx + r * Math.cos(a), corner.cy + r * Math.sin(a)])
    }
  }
  const a = (angleDeg * Math.PI) / 180
  const c = Math.cos(a)
  const s = Math.sin(a)
  return local.map(([lx, ly]) => ({
    x: cx + lx * c - ly * s,
    y: cy + lx * s + ly * c,
  }))
}

/** Parallel silkscreen lines hatching a circular area (visual indicator
 *  of a keep-away / mounting feature). Lines run at `hatchAngleDeg` and
 *  are spaced `spacing` mm apart, each clipped to the circle. */
export function renderHatchedCircle(
  cx: number,
  cy: number,
  r: number,
  layer: "top" | "bottom",
  hatchAngleDeg = 45,
  spacing = 1,
  keyPrefix = "hatch",
  strokeWidth = 0.15,
) {
  const lines: any[] = []
  const a = (hatchAngleDeg * Math.PI) / 180
  const cos = Math.cos(a)
  const sin = Math.sin(a)
  // Perpendicular to the hatch direction; we step along this axis.
  const px = -sin
  const py = cos
  let i = 0
  for (let d = -r + spacing / 2; d < r; d += spacing) {
    const half = Math.sqrt(Math.max(0, r * r - d * d))
    if (half < 0.05) {
      i++
      continue
    }
    lines.push(
      <silkscreenpath
        key={`${keyPrefix}-${i}`}
        strokeWidth={`${strokeWidth}mm`}
        layer={layer}
        route={[
          { x: cx + d * px - half * cos, y: cy + d * py - half * sin },
          { x: cx + d * px + half * cos, y: cy + d * py + half * sin },
        ]}
      />,
    )
    i++
  }
  return <>{lines}</>
}

/** Render a flattened polyline (e.g. a logo outline) as a single
 *  silkscreen path. Points are in mm relative to their own centroid;
 *  this applies a uniform scale, rotation, and translation to place the
 *  shape at (cx, cy). */
export function renderSilkscreenPolyline(
  points: { x: number; y: number }[],
  cx: number,
  cy: number,
  scale: number,
  rotationDeg: number,
  layer: "top" | "bottom",
  strokeWidth = 0.12,
  keyName = "poly",
) {
  const a = (rotationDeg * Math.PI) / 180
  const cos = Math.cos(a)
  const sin = Math.sin(a)
  const route = points.map((p) => {
    const sx = p.x * scale
    const sy = p.y * scale
    return { x: cx + sx * cos - sy * sin, y: cy + sx * sin + sy * cos }
  })
  return (
    <silkscreenpath key={keyName} strokeWidth={`${strokeWidth}mm`} layer={layer} route={route} />
  )
}

/** Render a set of polyline contours (e.g. flattened font glyphs) as
 *  silkscreen paths sharing one position/scale/rotation. Each contour
 *  becomes its own stroked path (so glyph holes render as separate
 *  outlines). */
export function renderContours(
  contours: { x: number; y: number }[][],
  cx: number,
  cy: number,
  scale: number,
  rotationDeg: number,
  layer: "top" | "bottom",
  strokeWidth = 0.1,
  keyPrefix = "ct",
) {
  return contours.map((pts, i) =>
    renderSilkscreenPolyline(pts, cx, cy, scale, rotationDeg, layer, strokeWidth, `${keyPrefix}-${i}`),
  )
}

/** Render text characters distributed along an arc. Each character is
 *  rotated so its baseline is tangent to the arc (reads naturally as the
 *  eye follows the arc). */
export function renderCurvedText(
  text: string,
  cx: number,
  cy: number,
  radius: number,
  centerAngleDeg: number,
  arcSpanDeg: number,
  layer: "top" | "bottom",
  fontSize = 1,
  keyPrefix = "curved",
) {
  const chars = [...text]
  const n = chars.length
  if (n === 0) return null
  const startDeg = centerAngleDeg - arcSpanDeg / 2
  // Characters read left-to-right as the eye travels CW (decreasing angle)
  // around the arc, with each glyph upright (top pointing radially outward).
  // For BOTTOM-layer text the X axis is mirrored when viewed from the back,
  // so the placement order is flipped to keep it readable from that side.
  return chars.map((char, i) => {
    const t = n === 1 ? 0.5 : i / (n - 1)
    const frac = layer === "bottom" ? t : 1 - t
    const angle = startDeg + frac * arcSpanDeg
    const a = (angle * Math.PI) / 180
    return (
      <silkscreentext
        key={`${keyPrefix}-${i}`}
        text={char}
        pcbX={cx + radius * Math.cos(a)}
        pcbY={cy + radius * Math.sin(a)}
        pcbRotation={angle - 90}
        fontSize={`${fontSize}mm`}
        layer={layer}
        anchorAlignment="center"
      />
    )
  })
}

/** Silkscreen labels for each edge pad — pad function/role rendered just
 *  inside the inner (shorter) edge of each trapezoidal pad. The labels
 *  rotate tangent to the rim so they orbit the board.
 *
 *    layer: which face the silkscreen goes on
 *    radial: distance from board center for the text baseline (default
 *            EDGE_PAD_INNER_R − 1.5mm to clear the pad inner edge)
 *    fontSize: silkscreen text size (mm). 0.8mm fits "ANALOG" within the
 *            inter-pad arc gap. */
export function renderEdgePadLabels(
  layer: "top" | "bottom",
  fontSize = 0.4,
) {
  // One label per pad — the function name — sitting in the gap beside the
  // pad's CCW ("top") tapered side, angled to match that radial side and
  // reading left-to-right. Size matches the R1 designator (0.4mm).
  //
  // When a pad carries genuinely-useful extra info (`special`, e.g. the
  // rail voltage), it goes on the CW ("bottom") tapered side — the other
  // side of the pad — so the two never crowd each other.
  const halfAngleDeg =
    (Math.asin(EDGE_PAD_TANGENTIAL / 2 / EDGE_PAD_OUTER_R) * 180) / Math.PI
  const rMid = (EDGE_PAD_INNER_R + EDGE_PAD_OUTER_R) / 2
  const offset = 0.8 // tangential nudge off the tapered side into the gap
  // sideSign: +1 = CCW/"top" tapered side, −1 = CW/"bottom" tapered side.
  const placeOnSide = (
    ep: EdgePad,
    text: string,
    sideSign: 1 | -1,
    size: number,
    keySuffix: string,
  ) => {
    const sideDeg = ep.angle + sideSign * halfAngleDeg
    const sa = (sideDeg * Math.PI) / 180
    const ta = ((sideDeg + sideSign * 90) * Math.PI) / 180
    return (
      <silkscreentext
        key={`${ep.name}-${keySuffix}-${layer}`}
        text={text}
        pcbX={rMid * Math.cos(sa) + offset * Math.cos(ta)}
        pcbY={rMid * Math.sin(sa) + offset * Math.sin(ta)}
        pcbRotation={sideDeg}
        fontSize={`${size}mm`}
        layer={layer}
        anchorAlignment="center"
      />
    )
  }
  return (
    <>
      {edgePads.flatMap((ep) => {
        const els = [placeOnSide(ep, ep.label, 1, fontSize, "fn")]
        if (ep.special) {
          els.push(placeOnSide(ep, ep.special, -1, fontSize * 0.85, "special"))
        }
        return els
      })}
    </>
  )
}

/** Render the 16 rim edge-plated pads. Identical layout on every board
 *  in the stack so the fab's side-metallization step bridges them all.
 *
 *  Each pad is a TRAPEZOID rather than a rectangle:
 *    - The two sides run along radial lines from the board center
 *      through the outer corners.
 *    - The outer corners sit on the 20mm board outline (so the wider
 *      edge faces the rim).
 *    - The inner corners sit at the same angular positions but at
 *      EDGE_PAD_CENTER_R − EDGE_PAD_RADIAL/2 radial distance (= 17.5mm).
 *
 *  This gives the outer edge tangential length = EDGE_PAD_TANGENTIAL
 *  (= 4mm) and a slightly shorter inner edge (≈3.5mm), with the side
 *  taper aimed at the board center. */
export function renderEdgePads() {
  const rOuter = EDGE_PAD_OUTER_R
  const rInner = EDGE_PAD_INNER_R
  const halfAngle = Math.asin(EDGE_PAD_TANGENTIAL / 2 / rOuter)
  const cos = Math.cos(halfAngle)
  const sin = Math.sin(halfAngle)
  // Pad-local frame: +X = radial outward (after pcbRotation = ep.angle),
  // +Y = tangential CCW. Pad center is at radial EDGE_PAD_CENTER_R.
  const points = [
    { x: rOuter * cos - EDGE_PAD_CENTER_R, y:  rOuter * sin },
    { x: rOuter * cos - EDGE_PAD_CENTER_R, y: -rOuter * sin },
    { x: rInner * cos - EDGE_PAD_CENTER_R, y: -rInner * sin },
    { x: rInner * cos - EDGE_PAD_CENTER_R, y:  rInner * sin },
  ]
  return (
    <>
      {edgePads.map((ep) => (
        <chip
          key={ep.name}
          name={ep.name}
          pinLabels={{ pin1: "PAD" }}
          footprint={
            <footprint>
              {/* Pads on BOTH faces at the same XY. The fab's edge-plating
                  step connects them through the side metallization. */}
              <smtpad portHints={["pin1"]} shape="polygon" points={points} layer="top" />
              <smtpad portHints={["pin1"]} shape="polygon" points={points} layer="bottom" />
            </footprint>
          }
          pcbX={edgePadXY(ep.angle).x}
          pcbY={edgePadXY(ep.angle).y}
          pcbRotation={ep.angle}
        />
      ))}
    </>
  )
}
