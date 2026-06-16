# Major Version Tiers and Variants

Back to [standard overview](README.md).

## 4. Major version tiers

### `1.x` - 3D Printed (passive form)

The entry tier. Anyone with a 3D printer can produce a compliant chip.

| Minor | Augmentation | Notes |
|---|---|---|
| 1.0 | Plain mono filament print | Baseline; no inserts |
| 1.1 | Pause-print **NFC tag insert** | NTAG213/215 sticker dropped mid-print. See [Bambu NFC tag](https://us.store.bambulab.com/products/nfc-tag-with-adhesive?skr=yes&id=42872074240136&modelId=415825) |
| 1.2 | Multicolor / AMS print | Logos, identity art baked in |
| 1.3 | Laser-etched or engraved surface | Post-process detail |
| 1.4 | Multi-material (TPU rim, etc.) | Grip, durability |
| 1.5 | Resin / SLA finish | High-detail collectible runs |

> [!NOTE]
> **Reference build.** A `1.1+1.2` chip = multicolor 3D-printed disc with a hidden NFC tag. Looks like swag, scans like a key.

### `2.x` - Magnetic Interface

Adds the polarized magnet pair. **First tier where the chip becomes a system component**, not just a token. Full spec in [magnetic.md](magnetic.md).

| Minor | Augmentation |
|---|---|
| 2.0 | Dual 15 x 2 mm magnets, opposite polarity (mainline spec) |
| 2.1 | + Steel shim shielding (one-sided field) |
| 2.2 | + Bottom-side **passive contact pads** (no electronics, just brass/copper inserts for snap-in chargers, ID readers, etc.) |

> [!NOTE]
> **Why 2.x is a tier and not a 1.x minor.** Adding magnets fundamentally changes what the chip *is*. It becomes mountable, orientable, and modular. Every higher tier inherits this.

> [!NOTE]
> **Reference CAD.** The `2.0` chip and its mating dock are in [`hardware/makerchip-2.0/`](../hardware/makerchip-2.0/).

### `3.x` - PCB Stack (electronics, externally powered)

Three-layer PCB sandwich. The middle layer has cutouts for components and magnets. The bottom layer exposes the **8-pad standard interface** (see [interface.md](interface.md)) for power and data via pogo-pin docks. The top layer is the canvas (silkscreen, art, surface-mount LEDs).

| Minor | Augmentation |
|---|---|
| 3.0 | Bare 3-layer PCB stack with 8-pad interface |
| 3.1 | + Indicator LEDs (current `Maker Chip PCB - V3` reference design) |
| 3.2 | + MCU (ATtiny85 or equivalent) |
| 3.3 | + **On-PCB NFC antenna** + tag IC (NT3H2111, ST25DV): replaces sticker, MCU can read/write |
| 3.4 | + Addressable RGB LEDs (WS2812 / SK6812) |
| 3.5 | + Onboard storage / data-cartridge variant ("DOOM-on-a-chip" use case) |

> [!NOTE]
> **Reference design.** The current open-source PCB lives in this repo as a `3.1`-class design. See [`hardware/pcb-v3/`](../hardware/pcb-v3/) for the KiCad project and [`docs/protoboard/`](../docs/protoboard/) for a snapshot of the live Protoboard project.

**Prior art / references:**
- [Hackster: Light-up poker chip](https://www.hackster.io/AlexWulff/light-up-poker-chip-7fa67f) - LED chip ref (3.1)
- [Reddit: PCB poker set](https://www.reddit.com/r/electronics/comments/opowu0/pcb_poker_set/) - full set fabrication
- [PokerChipForum: RFID table experiment](https://www.pokerchipforum.com/threads/experimenting-with-a-diy-rfid-table-and-broadcast-overlay.88715/post-2141059) - application
- [Reddit: NFC antenna design advice](https://www.reddit.com/r/PrintedCircuitBoard/comments/1f5q0j3/need_advice_on_nfc_antenna_design_and_component/) - 3.3 antenna sizing
- [GitHub: PCB Business Card](https://github.com/Raziz1/PCB_Business_Card) - antenna trace example
- [Instructables: PCB Business Card with NFC](https://www.instructables.com/PCB-Business-Card-With-NFC-Make-Yours-With-NFC-QR-/) - build guide
- [PCBSync: NFC antenna PCB](https://pcbsync.com/nfc-antenna-pcb/) - antenna design reference

### `4.x` - Self-Powered

Onboard energy. The chip stops needing a dock to do anything.

| Minor | Augmentation |
|---|---|
| 4.0 | Wireless power harvesting (Qi pad, NFC field, RF) |
| 4.1 | + Internal battery (LiPo / LiSOCl2 coin) |
| 4.2 | + Power-management IC + deep-sleep modes |
| 4.3 | + E-ink / Memory LCD display |
| 4.4 | + Always-on indicator (low-current LED) |
| 4.5 | + BLE / sub-GHz radio (full wireless duplex) |

**References:**
- [Instructables: Wireless energy transmission via PCB](https://www.instructables.com/Wireless-Energy-Transmission-System-Only-Using-PCB/)
- [ABLIC wireless power ICs](https://www.ablic.com/en/semicon/products/rtc/wireless-power-ic/intro/)
- [MDPI: Electronics 13(2), 426](https://www.mdpi.com/2079-9292/13/2/426) - academic ref
- [Analog Devices AN-138FC](https://www.analog.com/en/resources/app-notes/an-138fc.html)
- [TI E2E: wireless power transfer](https://e2e.ti.com/support/power-management-group/power-management/f/power-management-forum/380718/wireless-power-transfer)

### `5.x` - Motion

Active mechanical capability. The chip moves, vibrates, or actuates something on its own.

| Minor | Augmentation |
|---|---|
| 5.0 | PCB coil motor (planar / axial-flux) |
| 5.1 | Haptic / vibration motor (LRA or coin) |
| 5.2 | Microactuator / piezo |
| 5.3 | Combined motion + display + power (full active chip) |

**References:**
- [Hackaday: PCB motor tag](https://hackaday.com/tag/pcb-motor/)
- [PCBWay: PCB motor design guidelines](https://www.pcbway.com/blog/Engineering_Technical/PCB_Motor_Design_Guidelines.html)

---

## 5. Branches and variants

Use a `-suffix` instead of bumping major when the design **deviates from the form factor or compat rules** but is still MakerChip+-adjacent.

| Variant | Description |
|---|---|
| `2.x-maglev` | Floating-magnet implementation using a commercial maglev base |
| `3.x-mini` | Reduced-diameter PCB chip (for example 25 mm): non-conforming, explicit |
| `3.x-thick` | >3.6 mm stack for high-component-count PCB |
| `*-collectible` | Limited-run sponsor/creator edition (for example a Fallout collab) |
| `*-cartridge` | Non-standard pad map for a proprietary dock (for example a game system) |

> [!WARNING]
> **Variants do not promote.** A variant never becomes the next mainline major. If a deviation proves valuable enough to absorb, mainline gets the upgrade with a new major number, NOT by adopting the variant's suffix.
