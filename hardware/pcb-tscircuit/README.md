# PCB (tscircuit source)

The MakerChip+ 3-layer PCB defined as code with [tscircuit](https://tscircuit.com). This is the editable source behind the `3.x` PCB tier - the same board that is mirrored and validated on [Protoboard](../../docs/protoboard/).

## Layers

| File | Layer |
|---|---|
| [`top.circuit.tsx`](top.circuit.tsx) | Top PCB - silkscreen art and LEDs |
| [`middle.circuit.tsx`](middle.circuit.tsx) | Middle PCB - cutouts for components and the magnet pair |
| [`bottom.circuit.tsx`](bottom.circuit.tsx) | Bottom PCB - the 8-pad pogo interface |
| [`shared.tsx`](shared.tsx) | Shared dimensions and helpers |

Rendered previews of every layer (PCB + schematic) are in [`__snapshots__/`](__snapshots__/). Branding/glyph helpers (`omega-glyph.ts`, `lucide-magnet.ts`, `oshw-logo.ts`, `branding-paths.ts`) and build/export scripts live in [`scripts/`](scripts/).

## Build

Requires [bun](https://bun.sh) and the tscircuit CLI (`tsci`).

```
bun install
tsci dev      # live preview in the browser
```

> [!NOTE]
> `node_modules/`, `dist/`, and tscircuit caches are gitignored. Third-party datasheets referenced during design (for example a micro-battery PDF) are not redistributed here.
