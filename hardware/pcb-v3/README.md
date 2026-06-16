# PCB v3 - MakerChip+ Reference Design (3.1-class)

KiCad project for the `3.x` PCB-stack tier of the [MakerChip+ standard](../../spec/README.md). This is the electronic MakerChip+: a 40 mm 3-layer PCB stack powered through the 8-pad pogo-pin interface.

> [!NOTE]
> These KiCad files are an early scaffold. The validated design currently lives as the live Protoboard project "Maker Chip PCB - V3"; see the [snapshot](../../docs/protoboard/README.md) for the parts list, BOM, and electrical specs.

## Specifications

- 40 mm diameter, 3.0 to 3.6 mm thick (0.8 + 2.0 + 0.8 mm stack)
- Powered via a base-station / dock motherboard through the [8-pad interface](../../spec/interface.md)
- `3.1`-class: 4 white LEDs for an internal glow effect, ATtiny85 MCU, two 15 x 2 mm magnets, NFC tag

## Files

| File | Purpose |
|---|---|
| `emakerchip.kicad_pro` | KiCad project |
| `emakerchip.kicad_sch` | Schematic |
| `emakerchip.kicad_pcb` | PCB layout |
