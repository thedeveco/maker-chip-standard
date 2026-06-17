/**
 * Maker Chip — MIDDLE PCB (Stage 2)
 *
 * 40mm diameter, 2.0mm thick (the spacer plate of the 3-PCB stack).
 *   - No electrical components; copper is only on the rim edge pads.
 *   - CUTOUTS:
 *       * 2× magnet pockets (15mm dia each, at the PAD7/PAD3 angles)
 *       * 1× MCU clearance pocket (above U1 on the bottom PCB —
 *         QFN-20 4×4mm plus margin)
 *       * 3× resistor clearance pockets (under R1/R2/R3 on the top
 *         PCB's bottom face)
 *   - RIM: 16 edge-plated pads, identical layout across all 3 boards.
 *
 * NOTE: The LED filament slot cutouts live ONLY on the top PCB. The
 * middle PCB provides clear space above the filament (the magnet
 * pockets + the MCU pocket cover most of the central region anyway).
 *
 * The magnets are sandwiched between the bottom PCB's top face and the
 * top PCB's bottom face (2mm tall = full middle-PCB thickness).
 */

import {
  BOARD_DIAMETER,
  BOARD_RADIUS,
  EDGE_PAD_INNER_R,
  MAGNET_DIAMETER,
  U1_CENTER,
  circleOutline,
  ledXY,
  pogoXY,
  renderCurvedText,
  renderEdgePadLabels,
  renderEdgePads,
  resistorXY,
  roundedRectPolygon,
} from "./shared"

/** Magnet pocket center angles (matches PAD7 = VCC and PAD3 = GND). */
const MAGNET_ANGLES = [180, 0] as const

/** LED triangle vertex angles, matching the top PCB. */
const LED_ANGLES = [90, 210, 330] as const

/** MCU clearance pocket: 5.6 × 5.6mm above U1 (4×4mm QFN-20 body + 0.8mm
 *  margin per side for assembly tolerance). U1 position is sourced from
 *  shared.tsx so both PCBs stay in sync. */
const MCU_POCKET = { cx: U1_CENTER.x, cy: U1_CENTER.y, w: 5.6, h: 5.6 }

/** Resistor clearance pockets: 0603 body 1.6 × 0.8mm + 0.9mm margin in
 *  the long axis and 0.9mm margin perpendicular = 3.4 × 2.6mm. The body
 *  protrudes downward from the top PCB's bottom face; the larger margin
 *  absorbs placement tolerance during reflow. */
const RESISTOR_POCKET_W = 3.4
const RESISTOR_POCKET_H = 2.6

export default () => (
  <board
    width={`${BOARD_DIAMETER}mm`}
    height={`${BOARD_DIAMETER}mm`}
    outline={circleOutline(BOARD_RADIUS)}
    thickness="2.0mm"
    material="fr4"
    solderMaskColor="black"
    routingDisabled
  >
    {/* === Magnet pockets (15mm dia, full 2mm depth) ===
        Round through-cutouts at the VCC/GND pogo-pad angles. */}
    {MAGNET_ANGLES.map((angle, i) => {
      const c = pogoXY(angle)
      return (
        <cutout
          key={`magnet${i + 1}`}
          shape="circle"
          radius={`${MAGNET_DIAMETER / 2}mm`}
          pcbX={c.x}
          pcbY={c.y}
        />
      )
    })}

    {/* === MCU clearance pocket (above U1 on the bottom PCB) ===
        QFN-20 is 0.85mm tall; this 2mm cutout gives ~1.15mm vertical
        headroom. Polygon cutout with 0.5mm rounded corners (JLC's
        default 1.0mm router bit radius). */}
    <cutout
      shape="polygon"
      points={roundedRectPolygon(MCU_POCKET.cx, MCU_POCKET.cy, MCU_POCKET.w, MCU_POCKET.h, 0)}
    />

    {/* === Resistor clearance pockets (under top-PCB R1/R2/R3) ===
        0603 body protrudes down into the middle layer from the top PCB's
        bottom face. Polygon cutouts rotated to match each resistor's
        orientation (tangent to the circumcircle). Position tracked from
        `resistorXY()` in shared.tsx — 3-fold rotationally symmetric at
        each triangle corner peak. */}
    {LED_ANGLES.map((angle, i) => {
      const c = resistorXY(angle)
      const polygon = roundedRectPolygon(c.x, c.y, RESISTOR_POCKET_W, RESISTOR_POCKET_H, angle + 90)
      return <cutout key={`rpkt${i + 1}`} shape="polygon" points={polygon} />
    })}

    {/* === 16 edge-plated rim pads (shared layout across all 3 boards) ===
        On the middle PCB they're purely pass-through — no on-board copper
        destinations beyond the rim. The fab's edge plating bridges them
        to the top and bottom PCB pads at the same angular positions. */}
    {renderEdgePads()}

    {/* === Edge-pad function labels on BOTH faces of the middle PCB ===
        Used for visual alignment when stacking the 3 boards — every face
        shows the same label at the same angular position so the stack
        registers correctly. */}
    {renderEdgePadLabels("top")}
    {renderEdgePadLabels("bottom")}

    {/* === Orientation labels: TOP / BOTTOM on each face ===
        Tucked into the upper-left rim right under the edge pads (radius
        just inside EDGE_PAD_INNER_R), curving along the board edge arc.
        Sitting near the rim keeps them radially OUTSIDE the magnet-pocket
        KEEP-CLEAR banner (which lives at the smaller pocket radius), so
        the two don't collide on the same face. */}
    {renderCurvedText("TOP",    0, 0, EDGE_PAD_INNER_R - 1.2, 130, 20, "top",    1.2, "orient-top")}
    {renderCurvedText("BOTTOM", 0, 0, EDGE_PAD_INNER_R - 1.2, 130, 38, "bottom", 1.2, "orient-bot")}

    {/* Each edge pad goes to its own floating net so the middle PCB has
        no DRC complaints about unconnected pins. */}
    <trace from=".EDGE1 > .pin1"  to="net.M_EDGE1" />
    <trace from=".EDGE2 > .pin1"  to="net.M_EDGE2" />
    <trace from=".EDGE3 > .pin1"  to="net.M_EDGE3" />
    <trace from=".EDGE4 > .pin1"  to="net.M_EDGE4" />
    <trace from=".EDGE5 > .pin1"  to="net.M_EDGE5" />
    <trace from=".EDGE6 > .pin1"  to="net.M_EDGE6" />
    <trace from=".EDGE7 > .pin1"  to="net.M_EDGE7" />
    <trace from=".EDGE8 > .pin1"  to="net.M_EDGE8" />
    <trace from=".EDGE9 > .pin1"  to="net.M_EDGE9" />
    <trace from=".EDGE10 > .pin1" to="net.M_EDGE10" />
    <trace from=".EDGE11 > .pin1" to="net.M_EDGE11" />
    <trace from=".EDGE12 > .pin1" to="net.M_EDGE12" />
    <trace from=".EDGE13 > .pin1" to="net.M_EDGE13" />
    <trace from=".EDGE14 > .pin1" to="net.M_EDGE14" />
    <trace from=".EDGE15 > .pin1" to="net.M_EDGE15" />
    <trace from=".EDGE16 > .pin1" to="net.M_EDGE16" />
  </board>
)
