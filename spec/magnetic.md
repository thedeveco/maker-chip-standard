# The Magnetic Standard (>= 2.0)

Back to [standard overview](README.md).

The defining innovation. Two **15 x 2 mm N52 disc magnets** embedded in the middle layer at fixed positions, with **opposite polarities** facing the same direction.

> [!TIP]
> **Why polarized.** Two flipped magnets means the chip can only seat in **one rotational orientation** when placed against any mating surface with a matching magnet pattern. This eliminates the "user flips chip upside-down" failure mode for electrical pads, NFC antennas, and so on. Future tiers (PCB pads, displays, antennas) inherit this orientation lock for free.

## Magnet placement spec

*(Exact center-to-center distance, tolerance, and reference axis to be locked in the v2.0 spec - currently 16 mm CtC. Placement diagram pending; see [roadmap.md](roadmap.md).)*

The reference chip and mating dock CAD live in [`hardware/makerchip-2.0/`](../hardware/makerchip-2.0/) (`chip.step`, `dock.step`), modeled in the [public Onshape project](https://cad.onshape.com/documents/66dffec1c63767f9fad75111/w/110fc95ea174063827d47415/e/8618be80ab8abbf698550313).

## Optional shielding (2.x minor)

A thin steel shim or mu-metal layer on the **non-interface side** can null the magnetic field on that face, useful when the back of the chip is meant to sit against a credit card, hard drive, or another magnet-sensitive surface.

## MagLev variant (`2.x-maglev`)

A floating-magnet implementation using a commercial maglev base plus an embedded ferromagnetic disc. This is a branch variant; it does not deprecate the `2.x` mainline. See the [Hackaday MagLev tag](https://hackaday.com/tag/maglev/) for prior art.
