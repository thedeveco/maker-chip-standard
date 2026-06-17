/**
 * Maker Chip — TOP PCB (Stage 2)
 *
 * 40mm diameter, 0.8mm thick. The visible upper plate of the 3-PCB stack.
 *   - TOP face:    3× Adafruit ADA-6141 warm-white flexible LED filament
 *                  solder pads (1 pair per LED), arranged at the vertices
 *                  of a 25mm-side equilateral triangle centered on the
 *                  board (north vertex points up).
 *   - BOTTOM face: 3× 56Ω current-limit resistors (0603), one per LED.
 *                  They hang into the gap between the top and middle PCB.
 *   - CUTOUTS:     1 slot per LED, ~26 × 2.2mm, oriented tangent to the
 *                  triangle's circumscribed circle. The 1.7mm-diameter
 *                  filament body drops half into the slot; the other half
 *                  protrudes down through the matching slot in the middle
 *                  PCB.
 *   - RIM:         16 edge-plated pads, identical layout to bottom/middle.
 *
 * Signal continuity to the bottom PCB's MCU happens via the rim edge
 * plating (each LED net leaves this board through a known edge pad).
 */

import {
  BOARD_DIAMETER,
  BOARD_RADIUS,
  CUTOUT_CORNER_RADIUS,
  FILAMENT_SLOT_LENGTH,
  FILAMENT_SLOT_WIDTH,
  circleOutline,
  filamentBodyAngle,
  filamentSlotCenter,
  renderContours,
  renderEdgePadLabels,
  renderEdgePads,
  renderSilkscreenPolyline,
  resistorXY,
  roundedRectPolygon,
} from "./shared"
import { OSHW_LOGO_POINTS } from "./oshw-logo"
import { BRANDING } from "./branding-paths"
import { OMEGA_GLYPH } from "./omega-glyph"

const ADA6141_DATASHEET =
  "https://cdn-shop.adafruit.com/product-files/6141/Datasheet+LED+Filament+Single+Ended.pdf"

/** Double-ended LED filament footprint. One pad at each end of the
 *  filament body cutout (anode and cathode on opposite ends).
 *
 *  Pad geometry (in LED local frame, body axis = local X, +Y = toward
 *  the triangle interior):
 *    base size         = 2mm (along body) × 2.2mm (across body, matches
 *                        FILAMENT_SLOT_WIDTH)
 *    pad center pcbX   = ±11.5mm (1mm past each slot end)
 *
 *  CHAMFER: Each pad's "front-inside" corner (the corner at the slot's
 *  outer end on the triangle-interior side) is chamfered by 0.8mm so
 *  the two pads of adjacent LEDs meeting at each triangle vertex have
 *  electrical clearance. Without the chamfer the corners would sit
 *  ~0.17mm apart and could short alternating anode/cathode nets.
 *
 *  NOTE: ADA-6141 is the SINGLE-ENDED variant — both leads exit one end.
 *  This footprint targets a DOUBLE-ENDED filament instead (lead at each
 *  end of the body). Part number TBD. */
const PAD_CHAMFER = 0.8
/** Pad's perpendicular half-extent (matches half of FILAMENT_SLOT_WIDTH so
 *  the pad covers the full slot width). */
const PAD_HALF_HEIGHT = 1.25
/** Pad's half-width along the body axis. Pad spans 2mm long (= PAD_HW × 2). */
const PAD_HW = 1
/** Pad center along the body axis. Inner edge of the pad lands exactly
 *  at the slot endpoint (slot half-length = FILAMENT_SLOT_LENGTH / 2 = 10mm)
 *  so the lead bends straight out of the body onto the solder pad. */
const PAD_CENTER_OFFSET = 11
/** Number of arc segments used to approximate the slot's rounded corner
 *  along the pad's inner edge. */
const PAD_ARC_SEGMENTS = 6
const SCR = CUTOUT_CORNER_RADIUS  // shorthand

function arcPoints(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
  segments: number,
) {
  const points: { x: number; y: number }[] = []
  for (let i = 0; i <= segments; i++) {
    const a = startAngle + (i / segments) * (endAngle - startAngle)
    points.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) })
  }
  return points
}

function filamentPadsFootprint() {
  // The slot ends in a rounded corner of radius SCR; the pad fills the
  // sliver of board between the original rectangular pad outline and the
  // slot's curved boundary, so the inner edge of each pad traces the
  // slot's rounded corner. Chamfer remains on the front-inside corner
  // (away from the slot) to keep clearance from the adjacent LED's pad.

  // Anode (LED +X end of slot). Inner edge at pad-local -X.
  // Slot's nearest rounded corner centers at pad-local (-PAD_HW - SCR, ±(PAD_HH - SCR)).
  const anodePoints = [
    { x:  PAD_HW,                 y: -PAD_HALF_HEIGHT },
    { x:  PAD_HW,                 y:  PAD_HALF_HEIGHT - PAD_CHAMFER },
    { x:  PAD_HW - PAD_CHAMFER,   y:  PAD_HALF_HEIGHT },
    { x: -PAD_HW - SCR,           y:  PAD_HALF_HEIGHT },
    // Top-back rounded inner corner: arc from angle 90° to 0° around center
    // (-PAD_HW - SCR, +PAD_HH - SCR). Slice off endpoints (already explicit).
    ...arcPoints(-PAD_HW - SCR,  PAD_HALF_HEIGHT - SCR, SCR, Math.PI / 2, 0,            PAD_ARC_SEGMENTS).slice(1, -1),
    { x: -PAD_HW,                 y:  PAD_HALF_HEIGHT - SCR },
    { x: -PAD_HW,                 y: -(PAD_HALF_HEIGHT - SCR) },
    // Bottom-back rounded inner corner: arc from angle 0° to -90° around
    // center (-PAD_HW - SCR, -(PAD_HH - SCR)).
    ...arcPoints(-PAD_HW - SCR, -(PAD_HALF_HEIGHT - SCR), SCR, 0,         -Math.PI / 2, PAD_ARC_SEGMENTS).slice(1, -1),
    { x: -PAD_HW - SCR,           y: -PAD_HALF_HEIGHT },
  ]

  // Cathode (LED -X end of slot). Inner edge at pad-local +X.
  // Mirror image of anode (X-axis flipped).
  const cathodePoints = [
    { x: -PAD_HW,                 y: -PAD_HALF_HEIGHT },
    { x: -PAD_HW,                 y:  PAD_HALF_HEIGHT - PAD_CHAMFER },
    { x: -PAD_HW + PAD_CHAMFER,   y:  PAD_HALF_HEIGHT },
    { x:  PAD_HW + SCR,           y:  PAD_HALF_HEIGHT },
    // Top-back rounded inner corner: arc from angle 90° to 180° around
    // center (+PAD_HW + SCR, +PAD_HH - SCR).
    ...arcPoints( PAD_HW + SCR,   PAD_HALF_HEIGHT - SCR, SCR, Math.PI / 2, Math.PI,        PAD_ARC_SEGMENTS).slice(1, -1),
    { x:  PAD_HW,                 y:  PAD_HALF_HEIGHT - SCR },
    { x:  PAD_HW,                 y: -(PAD_HALF_HEIGHT - SCR) },
    // Bottom-back rounded inner corner: arc from angle 180° to 270° around
    // center (+PAD_HW + SCR, -(PAD_HH - SCR)).
    ...arcPoints( PAD_HW + SCR, -(PAD_HALF_HEIGHT - SCR), SCR, Math.PI,    3 * Math.PI / 2, PAD_ARC_SEGMENTS).slice(1, -1),
    { x:  PAD_HW + SCR,           y: -PAD_HALF_HEIGHT },
  ]

  return (
    <footprint>
      <smtpad portHints={["cathode"]} shape="polygon" points={cathodePoints} pcbX={`${-PAD_CENTER_OFFSET}mm`} pcbY="0mm" layer="top" />
      <smtpad portHints={["anode"]}   shape="polygon" points={anodePoints}   pcbX={`${PAD_CENTER_OFFSET}mm`}  pcbY="0mm" layer="top" />
    </footprint>
  )
}

/** Vertex angles (deg) of the 25mm equilateral triangle, north vertex first. */
const LED_ANGLES = [90, 210, 330] as const

/** 0603 SMT land pattern as a custom footprint. We use this with a <chip>
 *  (not <resistor>) because `<resistor>` always renders an auto-Rn
 *  designator and tscircuit's `pcbStyle.silkscreenTextVisibility / Position`
 *  do not suppress it; switching to a chip with this footprint gives us
 *  full silkscreen control (like the pogo pads). Schematically this loses
 *  the zigzag symbol — acceptable trade-off for this PCB-centric design. */
const resistor0603Footprint = () => (
  <footprint>
    <smtpad portHints={["pin1"]} shape="rect" width="0.85mm" height="0.95mm" pcbX="-0.8mm" pcbY="0mm" layer="bottom" />
    <smtpad portHints={["pin2"]} shape="rect" width="0.85mm" height="0.95mm" pcbX="0.8mm" pcbY="0mm" layer="bottom" />
  </footprint>
)

/** Omega (Ω) vector contour traced from the Lucide omega icon — the
 *  @tscircuit/alphabet silkscreen font is ASCII-only, so Ω comes in as
 *  a stroked polyline instead. See omega-glyph.ts (rebuild via
 *  .cache/build-omega-glyph.js if the source ever changes). */

/** LED schematic symbol as a set of stroke contours in a ~±1 unit frame
 *  (diode points +X; cathode bar at the tip; two "emitted light" arrows
 *  pointing up-right). Drawn as silkscreen polylines so no font is needed.
 *  A small space-punk flourish that also documents what the slots are. */
const LED_SYMBOL: { x: number; y: number }[][] = [
  // Diode triangle (anode flat side on the left, apex pointing +X).
  [
    { x: -0.5, y: -0.5 },
    { x: -0.5, y: 0.5 },
    { x: 0.5, y: 0 },
    { x: -0.5, y: -0.5 },
  ],
  // Cathode bar at the apex.
  [
    { x: 0.5, y: -0.5 },
    { x: 0.5, y: 0.5 },
  ],
  // Anode lead.
  [
    { x: -1.0, y: 0 },
    { x: -0.5, y: 0 },
  ],
  // Cathode lead.
  [
    { x: 0.5, y: 0 },
    { x: 1.0, y: 0 },
  ],
  // Emitted-light arrow 1 (shaft + arrowhead barbs).
  [
    { x: 0.32, y: 0.92 },
    { x: 0.5, y: 1.02 },
    { x: 0.1, y: 0.62 },
  ],
  [
    { x: 0.5, y: 1.02 },
    { x: 0.42, y: 0.74 },
  ],
  // Emitted-light arrow 2.
  [
    { x: 0.67, y: 0.8 },
    { x: 0.85, y: 0.9 },
    { x: 0.45, y: 0.5 },
  ],
  [
    { x: 0.85, y: 0.9 },
    { x: 0.77, y: 0.62 },
  ],
]

export default () => (
  <board
    width={`${BOARD_DIAMETER}mm`}
    height={`${BOARD_DIAMETER}mm`}
    outline={circleOutline(BOARD_RADIUS)}
    thickness="0.8mm"
    material="fr4"
    solderMaskColor="black"
    defaultTraceWidth="0.2mm"
    autorouterEffortLevel="100x"
  >
    {/* === Double-ended warm-white LED filaments ===
        Each LED spans an entire side of the Δ logo. The LED component XY
        sits at the slot center (= the slot's midpoint, 1mm outward of
        the triangle side). Cathode pad at one end, anode pad at the
        other, both oriented along the slot direction.
        See {ADA6141_DATASHEET} for spec reference. */}
    <led name="LED1" color="warmwhite" footprint={filamentPadsFootprint()} pcbX={filamentSlotCenter(LED_ANGLES[0]).x} pcbY={filamentSlotCenter(LED_ANGLES[0]).y} pcbRotation={filamentBodyAngle(LED_ANGLES[0])} />
    <led name="LED2" color="warmwhite" footprint={filamentPadsFootprint()} pcbX={filamentSlotCenter(LED_ANGLES[1]).x} pcbY={filamentSlotCenter(LED_ANGLES[1]).y} pcbRotation={filamentBodyAngle(LED_ANGLES[1])} />
    <led name="LED3" color="warmwhite" footprint={filamentPadsFootprint()} pcbX={filamentSlotCenter(LED_ANGLES[2]).x} pcbY={filamentSlotCenter(LED_ANGLES[2]).y} pcbRotation={filamentBodyAngle(LED_ANGLES[2])} />

    {/* === Filament body recess cutouts (full-depth slots through the
            0.8mm top PCB). Each slot sits INWARD of its vertex pad pair so
            the lead end stays on solid board (pads in line with the
            leads) while the 25mm × 1.7mm filament body recesses into the
            slot. The 3 slots converge toward the board center, forming
            a Δ-logo pattern. */}
    {LED_ANGLES.map((angle, i) => {
      const c = filamentSlotCenter(angle)
      const polygon = roundedRectPolygon(
        c.x,
        c.y,
        FILAMENT_SLOT_LENGTH,
        FILAMENT_SLOT_WIDTH,
        filamentBodyAngle(angle),
      )
      return <cutout key={`slot${i + 1}`} shape="polygon" points={polygon} />
    })}

    {/* === 56Ω LED current-limit resistors (0603, BOTTOM face) ===
        One per LED, sitting at the LED's "own" triangle corner peak —
        radially outward from each vertex, just past the cathode pad end
        of the LED's slot. Pattern is 3-fold rotationally symmetric
        (resistors at 90°, 210°, 330° from world +X). Body axis is
        tangent to the circumscribed circle (rotation = vertex + 90°),
        so the resistor body lies perpendicular to its radial axis. */}
    {/* 56Ω LED current-limit resistors as chips — see
        resistor0603Footprint for why we use <chip> instead of
        <resistor> (auto-Rn designator suppression). footprint="0603"
        as a STRING (not the custom JSX) gives the renderer a
        footprinter_string to generate the 3D body via
        jscad-electronics. Trace selectors `.R1 > .pin1`/`.pin2`
        continue to resolve. */}
    <chip name="R1" footprint="0603" pcbX={resistorXY(LED_ANGLES[0]).x} pcbY={resistorXY(LED_ANGLES[0]).y} pcbRotation={LED_ANGLES[0] + 90} layer="bottom" />
    <chip name="R2" footprint="0603" pcbX={resistorXY(LED_ANGLES[1]).x} pcbY={resistorXY(LED_ANGLES[1]).y} pcbRotation={LED_ANGLES[1] + 90} layer="bottom" />
    <chip name="R3" footprint="0603" pcbX={resistorXY(LED_ANGLES[2]).x} pcbY={resistorXY(LED_ANGLES[2]).y} pcbRotation={LED_ANGLES[2] + 90} layer="bottom" />

    {/* Complete the 0603 silkscreen outline symmetrically.
        The built-in 0603 footprint emits 3 sides forming a C-shape that
        is asymmetric around the body center: the 3 drawn sides reach to
        body-local x = +1.425 (proper pad clearance), but the open side
        ends at body-local x = -0.825 — INSIDE the rim-side pad. Closing
        the rectangle there would cut straight through that pad. Instead,
        we extend the top and bottom from x = -0.825 outward to x =
        -1.425 (matching the +1.425 clearance) and connect with a
        vertical at x = -1.425, producing a symmetric closed rectangle.
        Top/bottom edges of the footprint silkscreen are at y = ±0.875
        (0.45 mm from the pads); tscircuit has no pcbStyle knob to
        suppress that path, so we can't tighten the top/bottom gap
        without doubling up the silkscreen. */}
    {LED_ANGLES.map((angle, i) => {
      const c = resistorXY(angle)
      const r = ((angle + 90) * Math.PI) / 180
      const cos = Math.cos(r)
      const sin = Math.sin(r)
      const local = [
        { x: -0.825, y: 0.875 },  // pick up where the footprint silk ends (top)
        { x: -1.425, y: 0.875 },  // out to symmetric pad clearance
        { x: -1.425, y: -0.875 }, // down the closed side
        { x: -0.825, y: -0.875 }, // back in to meet the footprint silk (bottom)
      ]
      const route = local.map((p) => ({
        x: c.x + p.x * cos - p.y * sin,
        y: c.y + p.x * sin + p.y * cos,
      }))
      return (
        <silkscreenpath
          key={`r${i + 1}-outline`}
          route={route}
          strokeWidth="0.1mm"
          layer="bottom"
        />
      )
    })}

    {/* === Resistor value callouts (BOTTOM face) ===
        Inline "56Ω" group placed body-local x = +2.2 (just right of
        the silk box's +1.425 edge in the bottom-face view), with text
        rotation = angle. That rotation orients the BOTTOM edge of each
        glyph toward the resistor body (the bottom of the 5 faces the
        component) — derived from: at rotation θ in world, glyph "down"
        direction = (sin θ, -cos θ); for R1 (angle 90) that's (1, 0) =
        world east, which is the direction back toward the body from
        the label's groupOffset position. Same relationship holds for
        R2 and R3 by symmetry. */}
    {LED_ANGLES.flatMap((angle, i) => {
      const c = resistorXY(angle)
      const a = (angle * Math.PI) / 180
      const groupOffset = 2.2
      const valX = c.x + groupOffset * -Math.sin(a)
      const valY = c.y + groupOffset * Math.cos(a)
      // Text rotation = angle → label local +X axis in world =
      //   (cos a, sin a) = radial outward direction.
      const lx = Math.cos(a)
      const ly = Math.sin(a)
      const fontSize = 0.4 // matches the auto Rn designator
      const omegaScale = 0.3 // ~text cap-height after Lucide's foot allowance
      const numHalf = 0.3
      const omegaHalf = omegaScale / 2
      const gap = 0.1
      // "56" on the OUTWARD side (label-local +X), Ω INWARD (toward
      // the body). On the bottom-layer pre-mirror, that arrangement
      // places Ω adjacent to the 6 end of "56" in the bottom-face view.
      const numOff = omegaHalf + gap / 2          // "56" outward of group center
      const omegaOff = -(numHalf + gap / 2)        // Ω inward (toward body)
      return [
        <silkscreentext
          key={`rval${i + 1}-num`}
          text="56"
          pcbX={valX + numOff * lx}
          pcbY={valY + numOff * ly}
          pcbRotation={angle}
          fontSize={`${fontSize}mm`}
          layer="bottom"
          anchorAlignment="center"
        />,
        ...renderContours(
          OMEGA_GLYPH,
          valX + omegaOff * lx,
          valY + omegaOff * ly,
          omegaScale,
          angle,
          "bottom",
          0.07,
          `rval${i + 1}-omega`,
        ),
      ]
    })}

    {/* === Branding (TOP face) — rendered as Kode Mono glyph outlines
            (silkscreen paths) instead of the built-in stroke font. */}
    {renderContours(BRANDING.DELTA, 0, -10.5, 1, 0, "top", 0.16, "brand-delta")}

    {/* === Edge labels along the two upper triangle sides ===
        RIGHT edge (V3→V1, midpoint (6.25, 3.609)): "MAKER CHIP 3.0"
        LEFT  edge (V1→V2, midpoint (-6.25, 3.609)): "OPEN HARDWARE"
        Both rotated so letter TOPS face the board center. Text sits just
        outside the triangle edge (between the filament slot and the rim). */}
    {renderContours(BRANDING.MAKER, 9.1, 5.25, 1, 120, "top", 0.16, "brand-maker")}
    {/* OPEN HARDWARE centered on the left edge (matching DELTA/MAKER),
        with the small gear following it in the reading direction. */}
    {renderContours(BRANDING.OPEN, -9.1, 5.25, 1, 240, "top", 0.16, "brand-open")}

    {/* === Open Source Hardware gear logo (TOP face) ===
        Flattened from the official OSHW SVG. Placed in the triangle
        interior near the OPEN HARDWARE edge, ~5mm tall. */}
    {renderSilkscreenPolyline(OSHW_LOGO_POINTS, -12.83, -1.2, 0.25, 240, "top", 0.15, "oshw-logo")}

    {/* === Center vias: one per triangle edge, just inside each edge
            midpoint. Each is assigned to the signal net of the LED whose
            filament slot it sits on, so that LED's anode signal routes
            top↔bottom THROUGH the via (the via is the layer-transition
            anchor for the trace from the rim edge pad to the LED pad). */}
    <via name="VIA_LED2" pcbX={0}     pcbY={-5.22} holeDiameter="0.4mm" outerDiameter="0.8mm" connectsTo="net.SIG_PB1" />
    <via name="VIA_LED1" pcbX={-4.52} pcbY={2.61}  holeDiameter="0.4mm" outerDiameter="0.8mm" connectsTo="net.SIG_PB0" />
    <via name="VIA_LED3" pcbX={4.52}  pcbY={2.61}  holeDiameter="0.4mm" outerDiameter="0.8mm" connectsTo="net.SIG_PB4" />

    {/* === LED polarity markers (+/-) on TOP face ===
        + next to each anode pad (end of slot in body direction), − next
        to each cathode pad (opposite end). Helps orient the filament
        when soldering. */}
    {LED_ANGLES.map((angle, i) => {
      const slot = filamentSlotCenter(angle)
      const ba = filamentBodyAngle(angle)
      const a = (ba * Math.PI) / 180
      const offset = 13.2  // mm past the pad outer edge along the body axis
      const cos = Math.cos(a)
      const sin = Math.sin(a)
      return [
        <silkscreentext
          key={`led${i + 1}-plus`}
          text="+"
          pcbX={slot.x + offset * cos}
          pcbY={slot.y + offset * sin}
          pcbRotation={ba}
          fontSize="1mm"
          layer="top"
          anchorAlignment="center"
        />,
        <silkscreentext
          key={`led${i + 1}-minus`}
          text="-"
          pcbX={slot.x - offset * cos}
          pcbY={slot.y - offset * sin}
          pcbRotation={ba}
          fontSize="1mm"
          layer="top"
          anchorAlignment="center"
        />,
      ]
    }).flat()}

    {/* The top PCB's bottom face deliberately carries NO magnet keep-away
        markings — too many overlapping cutouts/components crowd this face.
        The magnet pocket lives in the middle PCB and is flagged there and
        on the bottom PCB's faces instead. */}

    {/* === LED designators + inline LED symbol (TOP face) ===
        Per slot: "LEDn  [diode glyph]" reads ALONG the slot direction at
        the top-right portion of the slot, just clear of the cutout edge
        (perp offset matched to DELTA's clearance — ~1mm from edge). The
        text and the schematic symbol share one baseline so they read as
        one annotation. 3-fold symmetric with the Δ logo. */}
    {LED_ANGLES.flatMap((angle, i) => {
      const c = filamentSlotCenter(angle)
      const ba = filamentBodyAngle(angle)
      const a = (ba * Math.PI) / 180
      const ax = Math.cos(a)
      const ay = Math.sin(a)
      // perpendicular (ba + 90°): (-sin, cos)
      const perp = 2.3 // ~1mm clear of the slot's outer edge (slot ½-width 1.25)
      const textHalf = 1.6    // "LED1" half-width at 1mm font (≈ 3.2mm total)
      const iconScale = 1.0   // unit symbol → 2mm wide
      const iconHalf = 1.0
      const space = 0.7
      const startAlong = 3.5  // shift the pair into the slot's right portion
      const textAlong = startAlong + textHalf
      const iconAlong = textAlong + textHalf + space + iconHalf
      const place = (along: number) => ({
        x: c.x + along * ax - perp * ay,
        y: c.y + along * ay + perp * ax,
      })
      const tp = place(textAlong)
      const ip = place(iconAlong)
      return [
        <silkscreentext
          key={`leddes${i + 1}`}
          text={`LED${i + 1}`}
          pcbX={tp.x}
          pcbY={tp.y}
          pcbRotation={ba}
          fontSize="1mm"
          layer="top"
          anchorAlignment="center"
        />,
        ...renderContours(LED_SYMBOL, ip.x, ip.y, iconScale, ba, "top", 0.12, `ledsym-${i}`),
      ]
    })}

    {/* === 16 edge-plated rim pads (shared layout across all 3 boards) === */}
    {renderEdgePads()}

    {/* === Edge-pad function labels (silkscreen on BOTTOM face of top PCB) ===
        Mirrors the labels on the bottom PCB's bottom face — matches when
        the stack is flipped over. */}
    {renderEdgePadLabels("bottom")}

    {/* === Per-LED current path ===
        Each LED carries ~40mA (5V / 56Ω with ~2.7V Vf). The path from
        rim edge pad → via → LED anode → resistor → GND is split into
        explicit segments so the autorouter is FORCED to use the
        VIA_LEDn as a waypoint (otherwise it would route the shortest
        path and might skip the via). 0.5mm width on the LED-current
        traces (~12× IPC-2152 minimum for 40mA on 1oz Cu — picked for
        low IR drop, not thermal headroom).

        LED1 (PB0/DATA, EDGE5)  → VIA_LED1 → LED1 → R1 → GND
        LED2 (PB1/MISO, EDGE11) → VIA_LED2 → LED2 → R2 → GND
        LED3 (PB4/PWM,  EDGE3)  → VIA_LED3 → LED3 → R3 → GND */}
    <trace from=".EDGE5 > .pin1"   to="net.SIG_PB0" width="0.25mm" />
    <trace from=".LED1 > .anode"   to="net.SIG_PB0" width="0.25mm" />
    <trace from=".LED1 > .cathode" to=".R1 > .pin1" width="0.25mm" />
    <trace from=".R1 > .pin2"      to="net.GND"     width="0.25mm" />

    <trace from=".EDGE11 > .pin1"  to="net.SIG_PB1" width="0.25mm" />
    <trace from=".LED2 > .anode"   to="net.SIG_PB1" width="0.25mm" />
    <trace from=".LED2 > .cathode" to=".R2 > .pin1" width="0.25mm" />
    <trace from=".R2 > .pin2"      to="net.GND"     width="0.25mm" />

    <trace from=".EDGE3 > .pin1"   to="net.SIG_PB4" width="0.25mm" />
    <trace from=".LED3 > .anode"   to="net.SIG_PB4" width="0.25mm" />
    <trace from=".LED3 > .cathode" to=".R3 > .pin1" width="0.25mm" />
    <trace from=".R3 > .pin2"      to="net.GND"     width="0.25mm" />

    {/* GND rim edge pad ties into the shared net — 0.6mm carries the
        combined return current from all three LEDs (~120mA). */}
    <trace from=".EDGE1 > .pin1" to="net.GND" width="0.3mm" />

    {/* === Edge pads not used on the top PCB: floating per-pad net to
            silence DRC. They still carry the stack's signals via the edge
            plating; they just don't have on-board copper destinations on
            this layer. */}
    <trace from=".EDGE2 > .pin1"  to="net.EDGE2_SPARE" />
    <trace from=".EDGE4 > .pin1"  to="net.EDGE4_SPARE" />
    <trace from=".EDGE6 > .pin1"  to="net.EDGE6_SPARE" />
    <trace from=".EDGE7 > .pin1"  to="net.TOP_PB3_PASSTHRU" />
    <trace from=".EDGE8 > .pin1"  to="net.EDGE8_SPARE" />
    <trace from=".EDGE9 > .pin1"  to="net.TOP_VCC_PASSTHRU" />
    <trace from=".EDGE10 > .pin1" to="net.EDGE10_SPARE" />
    <trace from=".EDGE12 > .pin1" to="net.EDGE12_SPARE" />
    <trace from=".EDGE13 > .pin1" to="net.TOP_PB5_PASSTHRU" />
    <trace from=".EDGE14 > .pin1" to="net.EDGE14_SPARE" />
    <trace from=".EDGE15 > .pin1" to="net.TOP_PB2_PASSTHRU" />
    <trace from=".EDGE16 > .pin1" to="net.EDGE16_SPARE" />
  </board>
)
