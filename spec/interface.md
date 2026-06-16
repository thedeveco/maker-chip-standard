# The 8-Pad Standard Interface (>= 3.0)

Back to [standard overview](README.md).

> [!WARNING]
> **Still in development.** The 8-pad map below is the **current working draft** for the `3.x` electrical contract. Pad count, positions, and signal assignments may change or expand (more pads, alternate maps for specialized variants) before being frozen. Treat as provisional until marked stable in this repo.

Defined on the bottom face. 3 mm exposed copper, fixed positions.

| Pad | Signal | Notes |
|---|---|---|
| 1 | VCC (5V) | Power in |
| 2 | GND | Ground |
| 3 | DATA | MOSI / SDA / generic |
| 4 | CLK | SCK / SCL |
| 5 | CS / RST | Chip select / reset |
| 6 | MISO / GPIO | Bidir |
| 7 | GPIO / PWM | Bidir |
| 8 | ANALOG | ADC-capable |

> [!NOTE]
> **Why this map.** It covers SPI, I2C, UART (with pin reuse), and analog/PWM in 8 pads. Every common MCU footprint maps cleanly. Pads 1-2 are always power; 3-8 are programmable.

## Reference pinout (ATtiny85)

The `3.1` reference design maps the 8 pads to an ATtiny85 as follows:

| Pad | Signal | ATtiny85 Pin |
|-----|------------------|-----------------|
| 1   | VCC (5V)         | Pin 8           |
| 2   | GND              | Pin 4           |
| 3   | DATA (MOSI/SDA)  | Pin 5 (PB0)     |
| 4   | CLK (SCK/SCL)    | Pin 7 (PB2)     |
| 5   | CS/RST           | Pin 1 (RESET)   |
| 6   | MISO/GPIO        | Pin 6 (PB1)     |
| 7   | GPIO/PWM         | Pin 3 (PB4)     |
| 8   | ANALOG           | Pin 2 (PB3/ADC3)|

Pad positions and the full board breakdown live in the reference snapshot: see [`docs/protoboard/bom.md`](../docs/protoboard/bom.md) and [`docs/protoboard/board-summary.md`](../docs/protoboard/board-summary.md).
