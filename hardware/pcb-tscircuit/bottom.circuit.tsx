/**
 * Maker Chip — BOTTOM PCB (Stage 2)
 *
 * 40mm diameter, 0.8mm thick. The lowest plate of the 3-PCB poker-chip stack.
 *   - BOTTOM face: 8 pogo-pin contact pads (3mm dia circles, 16.3mm dia array)
 *   - TOP face:    ATtiny85 (QFN-20, 4×4mm × 0.85mm tall)
 *   - RIM:         16 edge-plated pads, identical layout across all 3 boards
 *
 * The middle PCB sits directly on this board's top face. The QFN-20 chip
 * (0.85mm tall) drops into a clearance cutout in the middle PCB (which is
 * 2mm thick, so the chip fits with ~1.15mm headroom).
 */

import {
  BOARD_DIAMETER,
  BOARD_RADIUS,
  EDGE_PAD_INNER_R,
  MAGNET_RADIUS,
  U1_CENTER,
  circleOutline,
  pogoXY,
  renderContours,
  renderCurvedText,
  renderEdgePadLabels,
  renderEdgePads,
  renderHatchedCircle,
} from "./shared"
import { MAGNET_WARN } from "./magnet-warn"

/** Pogo pads: angle around the 16.3mm-dia ring, designator, and function.
 *  PAD7 = VCC (180°) and PAD3 = GND (0°) are diametrically opposite. */
const POGO = [
  { angle:   90, name: "PAD1", fn: "DATA"   },
  { angle:   45, name: "PAD2", fn: "PWM"    },
  { angle:    0, name: "PAD3", fn: "GND"    },
  { angle:  -45, name: "PAD4", fn: "CLK"    },
  { angle:  -90, name: "PAD5", fn: "RST"    },
  { angle: -135, name: "PAD6", fn: "MISO"   },
  { angle:  180, name: "PAD7", fn: "VCC"    },
  { angle:  135, name: "PAD8", fn: "ANALOG" },
] as const

export default () => (
  <board
    width={`${BOARD_DIAMETER}mm`}
    height={`${BOARD_DIAMETER}mm`}
    outline={circleOutline(BOARD_RADIUS)}
    thickness="0.8mm"
    material="fr4"
    solderMaskColor="black"
    defaultTraceWidth="0.25mm"
  >
    {/* === ATtiny85 MCU (QFN-20 / MLF-20, ATTINY85-20MU) ===
        On the TOP face of the bottom PCB. 12 of the 20 pads are NC
        (artifact of shared QFN-20 package tooling with ATtiny261/461/861).
        Forward-compatible upgrade path: drop in an ATtiny261/461/861 later
        to get 16 GPIO without a PCB redesign. */}
    {/* cadModel={null} skips the auto QFN-20 footprinter 3D body. The
        jscad-electronics qfn model emits an object-form center that the
        gltf renderer rejects ("center must be an array"); the chip is
        sealed inside the stack and invisible in the assembled 3D view
        anyway, so no body is fine. */}
    <chip
      name="ATTINY85"
      footprint="qfn20_w4_h4_p0.5"
      cadModel={null}
      pcbX={U1_CENTER.x} pcbY={U1_CENTER.y}
      pinLabels={{
        pin5:  ["PB5", "RESET"],
        pin6:  ["PB3", "ADC3"],
        pin9:  ["PB4", "PWM_PAD", "LED3_DRIVE"],
        pin10: "GND",
        pin13: ["PB0", "DATA", "LED1_DRIVE"],
        pin14: ["PB1", "MISO", "LED2_DRIVE"],
        pin15: ["PB2", "CLK"],
        pin18: "VCC",
      }}
      noConnect={[
        "pin1", "pin2", "pin3", "pin4",
        "pin7", "pin8",
        "pin11", "pin12",
        "pin16", "pin17",
        "pin19", "pin20",
      ]}
      pinAttributes={{
        VCC:   { requiresPower: true },
        GND:   { requiresGround: true },
        RESET: { mustBeConnected: true },
      }}
    />

    {/* === MCU callout subtitle ===
        The chip is named "ATTINY85" so its auto designator IS the useful
        part label; this adds a space-punk / cyber-brutalist role tag. */}
    <silkscreentext text="// CTRL CORE" pcbX={U1_CENTER.x} pcbY={U1_CENTER.y - 3.0} fontSize="0.6mm" layer="top" anchorAlignment="center" />

    {/* === 8 pogo-pin contact pads (BOTTOM face, 3.0mm dia circles) ===
        16.3mm-diameter array, 45° angular spacing, sequential clockwise
        from 12 o'clock. PAD7 = VCC (180°), PAD3 = GND (0°) — diametrically
        opposite for balanced spring force from the pogo-pin contacts. */}
    {/* Pogo pads are chips (circle SMD pad on the bottom face) rather than
        testpoints, so no auto designator is generated — the radial PADn +
        function labels below are the only silkscreen. */}
    {POGO.flatMap((p, i) => {
      const a = (p.angle * Math.PI) / 180
      const rOut = 10.4 // outer: PADn designator
      const rIn = 5.8   // inner: function label
      const rot = p.angle - 90 // stack points at board center
      return [
        <chip
          key={`pad-${p.name}`}
          name={p.name}
          pinLabels={{ pin1: "PAD" }}
          footprint={
            <footprint>
              <smtpad portHints={["pin1"]} shape="circle" radius="1.5mm" layer="bottom" />
            </footprint>
          }
          pcbX={pogoXY(p.angle).x}
          pcbY={pogoXY(p.angle).y}
        />,
        <silkscreentext
          key={`pogo-name-${i}`}
          text={p.name}
          pcbX={rOut * Math.cos(a)}
          pcbY={rOut * Math.sin(a)}
          pcbRotation={rot}
          fontSize="0.4mm"
          layer="bottom"
          anchorAlignment="center"
        />,
        <silkscreentext
          key={`pogo-fn-${i}`}
          text={p.fn}
          pcbX={rIn * Math.cos(a)}
          pcbY={rIn * Math.sin(a)}
          pcbRotation={rot}
          fontSize="0.4mm"
          layer="bottom"
          anchorAlignment="center"
        />,
      ]
    })}

    {/* === Magnet keep-away markers (TOP / INTERNAL face) ===
        This face mates against the middle PCB's magnet pocket, so the
        marking here is an assembly aid (it's sealed inside the stack):
          - silkscreen circle outlining the 15mm-dia magnet pocket
          - hatched fill = "do not place components here"
          - N / S polarity at center so the magnet drops in pole-correct
          - "KEEP AREA CLEAR" curved text arcing around the outside */}
    {/* PAD7 = VCC (left magnet, North pole). KEEP CLEAR arcs across the
        TOP of the magnet circle (centerAngle 90°). */}
    <silkscreencircle pcbX={pogoXY(180).x} pcbY={pogoXY(180).y} radius={`${MAGNET_RADIUS}mm`} layer="top" />
    {renderHatchedCircle(pogoXY(180).x, pogoXY(180).y, MAGNET_RADIUS - 0.3, "top", 45, 1.2, "hatch-l")}
    <silkscreentext text="N" pcbX={pogoXY(180).x} pcbY={pogoXY(180).y} fontSize="2mm" layer="top" anchorAlignment="center" />
    {renderCurvedText("KEEP AREA CLEAR", pogoXY(180).x, pogoXY(180).y, MAGNET_RADIUS + 1.3, 90, 130, "top", 0.8, "kc-n")}

    {/* PAD3 = GND (right magnet, South pole). Circle + hatch + S only —
        the KEEP CLEAR banner lives only on the north magnet now. */}
    <silkscreencircle pcbX={pogoXY(0).x}   pcbY={pogoXY(0).y}   radius={`${MAGNET_RADIUS}mm`} layer="top" />
    {renderHatchedCircle(pogoXY(0).x, pogoXY(0).y, MAGNET_RADIUS - 0.3, "top", 45, 1.2, "hatch-r")}
    <silkscreentext text="S" pcbX={pogoXY(0).x}   pcbY={pogoXY(0).y} fontSize="2mm" layer="top" anchorAlignment="center" />

    {/* === Center magnet glyph (BOTTOM / EXTERNAL face) ===
        Traced from layer2.svg — every visible line in the source is a
        single stroked path (fill:none, stroke-width:3 in 113.6mm source
        units), so each one maps 1:1 to a silkscreen polyline here.
        Icon ~3.5mm wide; stroke 0.13mm = proportional weight at this
        scale (still above the fab-safe minimum). */}
    {renderContours(MAGNET_WARN, 0, 0, 3.5, 0, "bottom", 0.13, "mag-warn")}

    {/* === "DO NOT EAT" hazard ring (BOTTOM / EXTERNAL face) ===
        Curved along the rim under the edge pads in the top-right corner
        of the user's view (i.e., world NW — bottom-layer text is read with
        the board flipped, which horizontally mirrors the view). */}
    {renderCurvedText("DO NOT EAT", 0, 0, EDGE_PAD_INNER_R - 1.2, 135, 55, "bottom", 1.0, "dne")}

    {/* === Magnet pocket keep-out zones ===
        The autorouter would happily run copper straight through the
        magnet pockets if we don't tell it not to — a magnet sitting on
        the trace would be a bad day. Keep-out circles at each magnet
        location (MAGNET_RADIUS + 0.5mm guard) force routing around them
        on both layers. */}
    <keepout shape="circle" pcbX={pogoXY(180).x} pcbY={pogoXY(180).y} radius={`${MAGNET_RADIUS + 0.5}mm`} />
    <keepout shape="circle" pcbX={pogoXY(0).x}   pcbY={pogoXY(0).y}   radius={`${MAGNET_RADIUS + 0.5}mm`} />

    {/* === 16 edge-plated rim pads (shared layout across all 3 boards) === */}
    {renderEdgePads()}

    {/* === Edge-pad function labels (silkscreen on BOTTOM face of bottom PCB) ===
        Each label sits just inside the inner edge of its trapezoidal
        pad, oriented tangent to the rim. Pads not bound to a signal
        are labeled EXTRA. */}
    {renderEdgePadLabels("bottom")}

    {/* === Power rails (pogo pads -> MCU; LED/signal nets continue
            to the top PCB via the edge plating) ===
        VCC and GND each carry up to ~130mA (3 LEDs × ~40mA + MCU)
        when all three filaments are full-on. 0.6mm width = ~4× IPC
        minimum at 1oz Cu, picked for low IR drop. */}
    <trace from=".PAD7 > .pin1"      to="net.VCC" width="0.4mm" />
    <trace from=".ATTINY85 > .VCC"   to="net.VCC" width="0.4mm" />
    <trace from=".EDGE9 > .pin1"     to="net.VCC" width="0.4mm" />

    <trace from=".PAD3 > .pin1"      to="net.GND" width="0.4mm" />
    <trace from=".ATTINY85 > .GND"   to="net.GND" width="0.4mm" />
    <trace from=".EDGE1 > .pin1"     to="net.GND" width="0.4mm" />

    {/* === Signal pogo pads -> ATtiny85 pins, fanned out to rim edge pads ===
        Each MCU GPIO that doubles as an LED drive (PB0/PB1/PB4) routes to
        its rim edge pad — that's how the LED current returns from the top
        PCB's LED/resistor pair back into the bottom PCB's MCU. These
        carry the per-LED ~40mA current, so 0.5mm width. */}
    <trace from=".PAD1 > .pin1"      to="net.SIG_PB0" width="0.35mm" />
    <trace from=".ATTINY85 > .PB0"   to="net.SIG_PB0" width="0.35mm" />
    <trace from=".EDGE5 > .pin1"     to="net.SIG_PB0" width="0.35mm" />

    <trace from=".PAD2 > .pin1"      to="net.SIG_PB4" width="0.35mm" />
    <trace from=".ATTINY85 > .PB4"   to="net.SIG_PB4" width="0.35mm" />
    <trace from=".EDGE3 > .pin1"     to="net.SIG_PB4" width="0.35mm" />

    <trace from=".PAD6 > .pin1"      to="net.SIG_PB1" width="0.35mm" />
    <trace from=".ATTINY85 > .PB1"   to="net.SIG_PB1" width="0.35mm" />
    <trace from=".EDGE11 > .pin1"    to="net.SIG_PB1" width="0.35mm" />

    <trace from=".PAD4 > .pin1"   to="net.SIG_PB2" />
    <trace from=".ATTINY85 > .PB2"      to="net.SIG_PB2" />
    <trace from=".EDGE15 > .pin1" to="net.SIG_PB2" />

    <trace from=".PAD5 > .pin1"   to="net.SIG_PB5" />
    <trace from=".ATTINY85 > .PB5"      to="net.SIG_PB5" />
    <trace from=".EDGE13 > .pin1" to="net.SIG_PB5" />

    <trace from=".PAD8 > .pin1"   to="net.SIG_PB3" />
    <trace from=".ATTINY85 > .PB3"      to="net.SIG_PB3" />
    <trace from=".EDGE7 > .pin1"  to="net.SIG_PB3" />

    {/* === Spare edge pads (per-pad floating net to silence DRC) === */}
    <trace from=".EDGE2 > .pin1"  to="net.EDGE2_SPARE" />
    <trace from=".EDGE4 > .pin1"  to="net.EDGE4_SPARE" />
    <trace from=".EDGE6 > .pin1"  to="net.EDGE6_SPARE" />
    <trace from=".EDGE8 > .pin1"  to="net.EDGE8_SPARE" />
    <trace from=".EDGE10 > .pin1" to="net.EDGE10_SPARE" />
    <trace from=".EDGE12 > .pin1" to="net.EDGE12_SPARE" />
    <trace from=".EDGE14 > .pin1" to="net.EDGE14_SPARE" />
    <trace from=".EDGE16 > .pin1" to="net.EDGE16_SPARE" />
  </board>
)
