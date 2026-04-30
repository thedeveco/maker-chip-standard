# Protoboard Session Log — 2026-04-30

Maker Chip PCB - V3 (`Qy7JVPyQZbhWuvUfJOMx8`) on https://alpha.protoboard.xyz

## Audit (initial state)

- 17 parts, 20 harnesses
- DRC: PASS
- 6 info-level layout warnings (suboptimal handle directions; cosmetic)
- 8 requirements, 6 validated / 2 pending
- BOM: $0.00 — no supplier prices set

## Actions Taken

### Plan: closed pending requirements

Marked validated based on board state already satisfying both:

1. **8-Pad Standard Interface** (`f6f0c128-…`) — all 8 pads present and named correctly.
2. **ATtiny85 MCU connected to pads 3–8** (`a3b752f8-…`) — 11 harnesses confirm full pad-to-MCU coverage.

### BOM: added LCSC supplier records

| Template ID                            | Vendor | LCSC PN | Unit USD |
|----------------------------------------|--------|---------|----------|
| basic-mpjDjlaA2KYMB05qyPX1R (LED)      | LCSC   | C158100 | $0.012   |
| basic-fFVpV0slY_0ycHSXpgPcp (120Ω R)   | LCSC   | C114640 | $0.005   |
| basic-1AGk7mINFuKOXGWMz54X8 (ATtiny85) | LCSC   | C89852  | $1.20    |

### Added new parts

- **Magnet (15×2 mm N52)** — single template `basic-YyWx7p_6bcMBmPNF_7r77` placed twice (Magnet 1 N-up at 1180,300; Magnet 2 S-up at 1180,500). Sourced from AplysiaTech 40-pack on Amazon (B0FNX1XP21, $25.99/pack → $0.65 ea).
- **NFC Tag (NTAG215, 25×25 mm)** — template `basic-Rlhr-s9wEdMSbvUFO1J4g` at (1180, 700). InnoHHustle 50-pack on Amazon (B0F24L4GDM, $8.99/pack → $0.18 ea).

### Final cost estimate

- Project total: **$36.26** (one pack each)
- Per-board real consumption: **~$2.78**

## Tool Errors Encountered

- `upsert_bom_supplier_record` rejected initial `{name, partNumber, priceUSD, ...}` field shape. Correct schema uses `supplierVendorName`, `supplierPartNumber`, `supplierManufacturerPartNumber`, `supplierCurrentPriceUSD`, `supplierPackQuantity`, `supplierPurchaseUrl`.
- First Amazon RFID URL returned generic homepage via `summary` mode. `text` mode on the resolved Amazon `dp` URL succeeded and returned full product specs.

## Open Items / Suggestions

- Rotate handles on R1, R3, R4, ATtiny85, LED 1, GND pad to fix the 6 info warnings (cosmetic).
- Add NFC tag to requirements (currently absent from spec) and decide its layer placement.
- Magnet/NFC parts are blank placeholders with no interfaces — consider adding interface definitions if future DRC checks should validate placement.
