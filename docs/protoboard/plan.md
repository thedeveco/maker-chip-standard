# Maker Chip PCB - V3 — Plan

**Status as of 2026-04-30:** 8/8 requirements validated.

## Requirements

| # | Status     | Content |
|---|------------|---------|
| 1 | validated  | Supply 5V DC power through pogo pin interface to illuminate 4 white LEDs |
| 2 | validated  | Each LED must have a current-limiting resistor to prevent burnout |
| 3 | validated  | LEDs must fit within cutouts in middle PCB layer (0603 package: 1.6×0.8×0.55 mm) |
| 4 | validated  | Total PCB stack thickness: 3.6 mm (0.8 + 2.0 + 0.8 mm) |
| 5 | validated  | Bottom surface must be flat with only exposed copper pads for pogo pins |
| 6 | validated  | Top surface must be flat for silkscreen design application |
| 7 | validated  | 8-Pad Standard Interface: VCC, GND, DATA, CLK, CS/RST, MISO/GPIO, GPIO/PWM, ANALOG — all 3 mm exposed copper pads |
| 8 | validated  | ATtiny85 MCU connected to pads 3–8 for ISP programming and LED pulse control |

## Tasks

### Done
- Finalize LED and resistor component selection from LCSC (NCD0603W3, RC0603FR-07120RL)
- Design LED circuit schematic (4 parallel LED strings, each with series resistor)
- Define pogo pin pad layout on bottom PCB

### To Do
- Create middle layer cutout pattern (4 LEDs, 4 resistors, 2 magnets — verify fit)
- Route traces on bottom PCB (pogo pads → component positions via vias to top PCB)
- Design top PCB silkscreen artwork (logo + LED glow cutout)
- Generate Gerber files for fabrication (all 3 PCB layers)
- Order components from LCSC (4+ LEDs, 4+ resistors)

## Tags

LED, PCB, pogo-pin, wearable

## Open Considerations

- NFC (NTAG215 sticker) added but not yet captured in requirements/cutouts. Decide whether NFC tag mounts on top, embeds in middle, or is post-assembly applied.
- Magnet placement requirement currently mentions "two 15×2 mm magnets with opposite polarities" — confirm orientation in middle layer cutouts.
