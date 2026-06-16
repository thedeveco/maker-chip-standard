# Docks

Back to [standard overview](README.md).

A **Dock** is the inverse of a chip: the interface a MakerChip+ plugs into. Docks are how chips do anything beyond sitting in a pocket. The standard defines the chip; docks are built to spec so any compliant chip can interface with any compliant dock at the same tier or below.

> [!NOTE]
> **Dock = inverse of chip.** If the chip exposes magnets at fixed polarity and pads at fixed positions, the dock provides the matching mating magnets (opposite polarity for snap-in alignment) and pogo pins (or copper pads) at the same coordinates. The polarized magnet pair guarantees the chip can only seat one way, so pads always line up correctly.

A reference `2.0` dock (the inverse of the magnetic chip) is provided as CAD in [`hardware/makerchip-2.0/dock.step`](../hardware/makerchip-2.0/dock.step).

## What docks deliver

Depending on chip tier:

- **Mechanical hold** (>= 2.0) - magnetic snap-in. The chip stays put on a hat, badge, lanyard, wall, etc.
- **Power** (>= 2.2 / >= 3.0) - VCC/GND through pads. Docks supply 5V to drive LEDs, MCUs, displays.
- **Data** (>= 3.0) - DATA/CLK/CS lines for read/write. Reprogram a chip, transfer game data, register an ID.
- **Identification** (>= 3.0 or >= 1.1) - read NFC/RFID or pad-based ID to authenticate the chip and trigger a system response (door unlock, profile load, score increment).

## Example docks

| Dock type | Description | Chip tier needed |
|---|---|---|
| **Hat clip / lanyard / pin** | Single magnet pocket; chip snaps in, no electronics | >= 2.0 |
| **Multi-slot badge** | Wearable badge with several flush cutouts; swap chips in/out for display, ID, art | >= 2.0 (display variants >= 3.x) |
| **Charging dock** | Pogo-pin base supplies 5V; LEDs/MCU on chip light up | >= 3.0 |
| **Reader / scanner** | Reads NFC tag or pad-based ID; reports to host system | >= 1.1 (NFC) or >= 3.0 (pads) |
| **Door unlock dock** | Magnetic seat + pogo pins, reads chip ID, triggers actuator/access system | >= 3.0 |
| **Game console / cartridge slot** | Pogo pins + storage protocol; chip acts as removable cartridge or save token | >= 3.5 |
| **Display kiosk** | Multi-chip array; each chip drives a tile of a larger display | >= 3.4 (RGB) |

## Why docks matter at higher tiers

Low-tier (1.x) chips work passively; a sticker is enough. Higher tiers depend on the dock to be useful. A `3.2` chip with an MCU is a paperweight without a dock supplying power. A `3.5` storage cartridge is just plastic without a system that knows how to read it.

Designing a tier without designing the matching dock is half the work. **Mainline tier specs SHOULD ship with at least one reference dock design.**

> [!NOTE]
> **VIP access dock (Fallout-style "Platinum Chip").** At an event, attendees receive a `1.1` or `3.x` Platinum Chip: a limited-run, serialized MakerChip+. To enter the VIP area, the attendee places the chip onto a wall-mounted **access dock**. The polarized magnets snap the chip into the only correct orientation, the dock reads the chip's NFC or pad-based ID, validates it against an authorized list, and unlocks the door. The same hardware pattern works for badge unlocks, hidden booths, scavenger hunts, or backstage access.

## Dock conformance

Docks SHOULD declare the **maximum tier** they support (`Dock 3.0` handles >= 3.0 chips and ignores higher-tier features on `4.x`/`5.x` chips placed in it). A `Dock 5.x` is the inverse: it must handle every tier below it gracefully.
