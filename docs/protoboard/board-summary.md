# Maker Chip PCB - V3 — Board Summary

- **Board ID:** `Qy7JVPyQZbhWuvUfJOMx8`
- **URL:** https://alpha.protoboard.xyz/board/pCOh7ogceIT44E7xwzadPOtLD8I3/Qy7JVPyQZbhWuvUfJOMx8
- **Parts:** 20 (17 functional + 2 magnets + 1 NFC tag, 14 unique templates)
- **Harnesses:** 20
- **DRC:** PASS

## Description

A poker-chip-sized PCB device with 3 stacked layers (2× 0.8 mm + 1× 2 mm middle). Features 4 white LEDs for internal glow effect, powered via pogo-pin interface. Middle layer contains 15 mm magnets and component cutouts.

## Stack Structure

- **Top PCB (0.8 mm):** Silkscreen design on top, LEDs/resistors on bottom
- **Middle PCB (2 mm):** Cutouts for LEDs, resistors, ATtiny85, and magnets; two 15×2 mm magnets with opposite polarities
- **Bottom PCB (0.8 mm):** 8× 3 mm copper pads for pogo pins on bottom; traces and optional components on top

## 8-Pad Standard Interface

| Pad | Signal           | ATtiny85 Pin    |
|-----|------------------|-----------------|
| 1   | VCC (5V)         | Pin 8           |
| 2   | GND              | Pin 4           |
| 3   | DATA (MOSI/SDA)  | Pin 5 (PB0)     |
| 4   | CLK (SCK/SCL)    | Pin 7 (PB2)     |
| 5   | CS/RST           | Pin 1 (RESET)   |
| 6   | MISO/GPIO        | Pin 6 (PB1)     |
| 7   | GPIO/PWM         | Pin 3 (PB4)     |
| 8   | ANALOG           | Pin 2 (PB3/ADC3)|

## Electrical

- Supply: 5 V DC via pogo pins
- LEDs: 4× white in parallel, each with 120 Ω series resistor
- Total LED current: ~60 mA (4 × 15 mA)
- ATtiny85 drives PWM pulse effects on PB4

## Parts (with positions)

| Name                        | Template ID                              | Position (x, y) |
|-----------------------------|-------------------------------------------|-----------------|
| White LED 1                 | basic-mpjDjlaA2KYMB05qyPX1R               | (-40, 640)      |
| White LED 2                 | basic-mpjDjlaA2KYMB05qyPX1R               | (210, 640)      |
| White LED 3                 | basic-mpjDjlaA2KYMB05qyPX1R               | (680, 620)      |
| White LED 4                 | basic-mpjDjlaA2KYMB05qyPX1R               | (930, 620)      |
| 120Ω Resistor 1             | basic-fFVpV0slY_0ycHSXpgPcp               | (-40, 840)      |
| 120Ω Resistor 2             | basic-fFVpV0slY_0ycHSXpgPcp               | (210, 840)      |
| 120Ω Resistor 3             | basic-fFVpV0slY_0ycHSXpgPcp               | (680, 820)      |
| 120Ω Resistor 4             | basic-fFVpV0slY_0ycHSXpgPcp               | (930, 820)      |
| Pad 1 - VCC (5V)            | basic-NLkZFikHo6YDudwjzZbog               | (400, 0)        |
| Pad 2 - GND                 | basic-848t6FXjZg-gFcYJHxtV4               | (400, 1060)     |
| Pad 3 - DATA                | basic-VYPSKHr3RS2GLnCUEqvgd               | (-40, 60)       |
| Pad 4 - CLK                 | basic-IFiLhx3i8ZHFZPVNEg8n0               | (-40, 210)      |
| Pad 5 - CS/RST              | basic-rVRacUFPbQDq3LhNcpwAH               | (-40, 360)      |
| Pad 6 - MISO/GPIO           | basic-_xR1FA-npyLAzmcU1FuL4               | (820, 60)       |
| Pad 7 - GPIO/PWM            | basic-uaMJdW7PbbgWcAmpVx_dB               | (820, 220)      |
| Pad 8 - ANALOG              | basic-bNdPFE75fJqbc11ZdhxV5               | (820, 380)      |
| ATtiny85 MCU                | basic-1AGk7mINFuKOXGWMz54X8               | (400, 300)      |
| Magnet 1 (N-up, 15×2 mm)    | basic-YyWx7p_6bcMBmPNF_7r77               | (1180, 300)     |
| Magnet 2 (S-up, 15×2 mm)    | basic-YyWx7p_6bcMBmPNF_7r77 (2nd inst.)   | (1180, 500)     |
| NFC Tag (NTAG215, 25×25 mm) | basic-Rlhr-s9wEdMSbvUFO1J4g               | (1180, 700)     |

## Topology

- ATtiny85 (center) connects to all 8 pads + 4 LED chains
- Each LED → 120 Ω resistor → GND pad
- VCC pad → ATtiny85
- 20 harnesses total, all DRC-clean

## Layout Notes (info-level)

6 suboptimal handle orientations (cosmetic only, no DRC errors):
- R1, R3, R4 handles face bottom but neighbor is to side
- GND pad handle faces top but neighbor (R3) is right
- ATtiny85 ↔ White LED 1 handle pair faces wrong direction
