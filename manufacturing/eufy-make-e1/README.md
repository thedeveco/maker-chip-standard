# eufyMake E1 - Mini Bed Plate and MakerChip+ Adapter

Tooling to UV-print and decorate MakerChip+ chips in batches on the [eufyMake E1](https://www.eufymake.com/) UV printer.

> [!WARNING]
> In active development and testing. The bed plate, adapter, magnet positions, and grid alignment are not yet frozen.

## What this is

<video src="https://github.com/thedeveco/maker-chip-standard/raw/main/manufacturing/eufy-make-e1/renders/makerchip-assembly-hazard.mp4" controls muted></video>

[Watch the assembly render](renders/makerchip-assembly-hazard.mp4) if the player does not load.

A MakerChip+ adapter plate seating 14 chips on the mini bed, rendered in Delta's hazard cel-shade style.

### Mini bed plate (`mini-bed-plate.blend`)

A brand-new, **3D-printable** mini bed plate for the eufyMake E1. Print it yourself, then mount custom adapters (like the chip adapter below) on top to hold whatever you want to print on.

It is based on the open-source [eufyMake E1 low-profile reinforced mini bed](https://www.printables.com/model/1395018-eufymake-e1-uv-printer-low-profile-mini-bed) by the original author (the reference STL is included as [`og-eufy-mini-bed-low-profile-reinforced.stl`](og-eufy-mini-bed-low-profile-reinforced.stl)).

The plate carries the **same grid pattern as the Wham Bam ULTIM8 jig** so adapters and fixtures are cross-compatible across both systems. For full-plate alignment, eufyMake Studio's **Calibration > Zero Point Calibration** lets you input an offset instead of visually aligning to a snapshot; see the third-party reference in [`refs/`](refs/ultim8-jig-zero-point-calibration.pdf).

### Adapter plate (`adapter-plate.step`)

A drop-on adapter that holds **14 MakerChips** in a fixed array for batch UV printing. It carries the **same magnet pattern as the MakerChip+** itself, so each chip snaps into the only correct orientation for fast, repeatable alignment and placement (the same polarized-magnet trick the [magnetic standard](../../spec/magnetic.md) uses).

## Files

| File | What it is |
|---|---|
| `mini-bed-plate.blend` | The printable mini bed plate (Blender source, ULTIM8 grid) |
| `adapter-plate.step` | 14-chip adapter with the MakerChip+ magnet pattern |
| `og-eufy-mini-bed-low-profile-reinforced.stl` | Upstream reference bed this plate is based on |
| `renders/makerchip-assembly-hazard.mp4` | Assembly render (hazard cel-shade style) |
| `refs/ultim8-jig-zero-point-calibration.pdf` | Wham Bam ULTIM8 jig zero-point calibration reference (third-party) |

> [!NOTE]
> `refs/ultim8-jig-zero-point-calibration.pdf` is third-party reference material included for convenience and is **not** covered by this project's license.
