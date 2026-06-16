# MakerChip+ Standard

The reference standard for **MakerChip+**: a 40 mm x 3.6 mm poker-chip-sized open-hardware artifact. This document defines the **form-factor invariants**, the **versioning system** (major capability tiers, minor augmentations), and the **compatibility rules** that keep the ecosystem interoperable across creators, sponsors, and forks.

This directory is the standard. The repository root [README](../README.md) is the front door.

- [Magnetic standard (>= 2.0)](magnetic.md)
- [Major version tiers (1.x - 5.x) and variants](tiers.md)
- [8-pad standard interface (>= 3.0)](interface.md)
- [Docks](docks.md)
- [Roadmap and open questions](roadmap.md)

---

## 0. Origin

MakerChip+ standardizes a magnetic and electronic mounting system for the MakerChip, originally devised by [K2_Kevin](https://makerworld.com/en/models/415825-makerchip-maker-chip-the-new-makercoin), itself an evolution of the community [Maker Coin](https://www.makersmuse.com/maker-s-muse-maker-coin) created by Angus Deveson (Maker's Muse).

This standard is independent of any original model files. It reuses only the interoperability concept and the 40 mm form factor (specifications are not copyrightable) and defines its own clean-room designs and license. See the root README for full credit and prior art.

### Concept

![Layered concept diagram of the chip showing bottom, middle, and top stack](../docs/assets/maker-chip-concept.excalidraw.png)

### Prototype

- [Onshape CAD file](https://cad.onshape.com/documents/66dffec1c63767f9fad75111/w/110fc95ea174063827d47415/e/8618be80ab8abbf698550313)

---

## 1. Core invariants

These never change. Anything that breaks them is a **branch**, not a version.

| Property         | Spec                         | Rationale                                                        |
| ---------------- | ---------------------------- | ---------------------------------------------------------------- |
| Diameter         | **40 mm**                    | Standard poker-chip footprint; tactile recognition               |
| Thickness        | **3.6 mm** (0.8 + 2.0 + 0.8) | Fits standard poker-chip racks/storage; allows 3-layer PCB stack |
| Stack convention | bottom / middle / top        | Layered architecture even for 3D-printed chips                   |
| Orientation      | **Polarized** (see [magnetic.md](magnetic.md)) | Forward-compatibility with all electrical/mechanical interfaces  |
| License          | **CC BY-SA 4.0**             | Share, remix, and sell with attribution and same-license terms   |

> [!WARNING]
> **Form factor is the contract.** All major versions MUST preserve diameter, thickness, and orientation polarity. A "MakerChip+" that is 50 mm or 5 mm thick is a different product. Call those branches/variants explicitly (for example `MakerCoin`, `MakerSlab`).

---

## 2. Versioning system

### 2.1 Semantics

`MAJOR.MINOR[-VARIANT]`

- **MAJOR** - capability tier. Each tier unlocks a new class of functionality (passive form -> magnetic interface -> electronics -> power -> motion). Higher tier = strict superset of lower-tier capabilities (or compatible substitution).
- **MINOR** - additive augmentation within a tier. Does not break compat with same-major peers. Can be combined freely.
- **VARIANT** - named branch for non-conforming or experimental designs (for example `2.x-maglev`, `3.x-mini`). Variants do not promote to mainline.

### 2.2 Examples

| Version | Meaning |
|---|---|
| `1.0` | Plain 3D-printed disc |
| `1.1` | 3D print + embedded NFC sticker |
| `1.2+1.3` | 3D print + NFC + multicolor surface |
| `2.0` | Magnetic interface added |
| `3.1` | PCB stack with LEDs |
| `4.2-eink` | Self-powered chip with e-ink, branch variant |
| `5.0-experimental` | Motion-capable prototype |

### 2.3 Compatibility rules

> [!NOTE]
> **Forward/backward compat.** A chip at version `N.x` MUST physically interoperate with any accessory/dock built for version `M.x` where `M <= N`, provided the accessory only relies on capabilities present in version `M`. Higher-tier features are simply not used.

This works because:
- Form factor is identical
- Magnet positions/polarity (>= 2.0) never move
- Pad positions (>= 2.2) never move
- 8-pad signal map (>= 3.0) is fixed (see [interface.md](interface.md))

---

## 8. Compatibility matrix

| Capability | 1.x | 2.x | 3.x | 4.x | 5.x |
|---|---|---|---|---|---|
| 40mm x 3.6mm form factor | Yes | Yes | Yes | Yes | Yes |
| NFC tag (sticker or chip) | 1.1+ | Yes | 3.3+ | Yes | Yes |
| Magnet alignment | No | Yes | Yes | Yes | Yes |
| Bottom contact pads | No | 2.2+ | Yes | Yes | Yes |
| 8-pad standard signals | No | No | Yes | Yes | Yes |
| Onboard MCU | No | No | 3.2+ | Yes | Yes |
| Self-powered operation | No | No | No | Yes | Yes |
| Active motion | No | No | No | No | Yes |
