// Inject pcb_cutout entries AND solder-mask color into a
// tscircuit-generated .kicad_pcb / .kicad_zip.
//
// Workarounds for two upstream bugs:
//   - tscircuit/tscircuit#3302: the KiCad exporter doesn't iterate
//     pcb_cutout elements from circuit-json, so boards with cutouts
//     come back to KiCad as solid disks.
//   - tscircuit/tscircuit#3277: solderMaskColor is silently ignored,
//     so all boards render with the default green mask in KiCad's 3D
//     viewer regardless of the source prop.
//
// This script pulls cutouts straight from the circuit-json export and
// emits Edge.Cuts geometry into the .kicad_pcb manually:
//   - shape: "circle"  → (gr_circle ...)
//   - shape: "polygon" → (gr_poly  ...)
//   - shape: "rect"    → (gr_poly  ...) with 4 vertices
//
// Coord transform mirrors tscircuit's KICAD_PCB_CENTER (100, 100) with
// Y flipped, derived by reading the source converter and verified
// against the existing gr_line outline entries in the .kicad_pcb.
//
// Usage from project root:
//   node scripts/patch-kicad-cutouts.js {top|middle|bottom}
//
// Output: rewrites ~/Downloads/Maker Chip/<board>.kicad.zip with the
// patched .kicad_pcb inside.

const { execSync } = require("child_process")
const path = require("path")
const fs = require("fs")
const os = require("os")
const { execFileSync } = require("child_process")

const board = process.argv[2]
if (!["top", "middle", "bottom"].includes(board)) {
  console.error("usage: node scripts/patch-kicad-cutouts.js {top|middle|bottom}")
  process.exit(1)
}

const root = path.resolve(__dirname, "..")
const dl = path.join(os.homedir(), "Downloads", "Maker Chip")
const zipPath = path.join(dl, `${board}.kicad.zip`)
const jsonPath = path.join(dl, `${board}.json`)

// Make sure the output directory exists, then refresh exports.
fs.mkdirSync(dl, { recursive: true })
console.log(`Refreshing exports for ${board} ...`)
execSync(
  `npx tsci export ${board}.circuit.tsx -f kicad_zip -o "${zipPath}"`,
  { cwd: root, stdio: ["ignore", "ignore", "inherit"] },
)
execSync(
  `npx tsci export ${board}.circuit.tsx -f circuit-json -o "${jsonPath}"`,
  { cwd: root, stdio: ["ignore", "ignore", "inherit"] },
)

const circuitJson = JSON.parse(fs.readFileSync(jsonPath, "utf8"))
const cutouts = circuitJson.filter((e) => e.type === "pcb_cutout")
console.log(`Found ${cutouts.length} cutout(s).`)

// Coord transform — tscircuit (0,0) → KiCad (100, 100), Y flipped.
const KICAD_OFFSET_X = 100
const KICAD_OFFSET_Y = 100
const tx = (x) => KICAD_OFFSET_X + x
const ty = (y) => KICAD_OFFSET_Y - y
const fmt = (n) => Number(n.toFixed(6)).toString()

function emitCircle(c) {
  const cx = tx(c.center.x)
  const cy = ty(c.center.y)
  // KiCad gr_circle: end point sits on the circumference.
  const ex = cx + c.radius
  const ey = cy
  return `  (gr_circle
    (center ${fmt(cx)} ${fmt(cy)})
    (end ${fmt(ex)} ${fmt(ey)})
    (width 0.1)
    (layer Edge.Cuts)
  )`
}

function emitPolygon(points) {
  const pts = points.map((p) => `      (xy ${fmt(tx(p.x))} ${fmt(ty(p.y))})`).join("\n")
  return `  (gr_poly
    (pts
${pts}
    )
    (width 0.1)
    (layer Edge.Cuts)
    (fill none)
  )`
}

function emitRect(c) {
  // c has center.x, center.y, width, height, possibly rotation
  const hw = c.width / 2
  const hh = c.height / 2
  const corners = [
    { x: -hw, y: -hh },
    { x: hw, y: -hh },
    { x: hw, y: hh },
    { x: -hw, y: hh },
    { x: -hw, y: -hh }, // close
  ]
  const rot = ((c.rotation ?? 0) * Math.PI) / 180
  const cos = Math.cos(rot)
  const sin = Math.sin(rot)
  const points = corners.map(({ x, y }) => ({
    x: c.center.x + x * cos - y * sin,
    y: c.center.y + x * sin + y * cos,
  }))
  return emitPolygon(points)
}

const cutoutBlocks = cutouts
  .map((c) => {
    if (c.shape === "circle") return emitCircle(c)
    if (c.shape === "polygon") return emitPolygon(c.points)
    if (c.shape === "rect") return emitRect(c)
    console.warn(`  skipping cutout: unknown shape "${c.shape}"`)
    return null
  })
  .filter(Boolean)
  .join("\n")

// ---------- Solder-mask color injection ----------
// Read solderMaskColor + board thickness from the source .tsx so the
// stackup we inject matches the design intent. Source prop sets the
// value but the tscircuit exporter drops it (#3277), so we restore it
// here.
const sourceTsx = fs.readFileSync(
  path.join(root, `${board}.circuit.tsx`),
  "utf8",
)
const maskColorMatch = sourceTsx.match(/solderMaskColor="([^"]+)"/)
const maskColor = maskColorMatch ? maskColorMatch[1] : "black"
const thicknessMatch = sourceTsx.match(/thickness="([\d.]+)mm"/)
const boardThicknessMm = thicknessMatch ? parseFloat(thicknessMatch[1]) : 1.6

// KiCad expects color strings like "Black", "Green", "Red", etc.
const kicadColor = maskColor.charAt(0).toUpperCase() + maskColor.slice(1).toLowerCase()

// Dielectric thickness = total - 2 × copper (0.035mm) - 2 × mask (0.01mm)
const dielectricThickness = (boardThicknessMm - 0.035 * 2 - 0.01 * 2).toFixed(3)

const stackup = `    (stackup
      (layer "F.SilkS" (type "Top Silk Screen") (color "White"))
      (layer "F.Paste" (type "Top Solder Paste"))
      (layer "F.Mask" (type "Top Solder Mask") (color "${kicadColor}") (thickness 0.01))
      (layer "F.Cu" (type "copper") (thickness 0.035))
      (layer "dielectric 1" (type "core") (thickness ${dielectricThickness}) (material "FR4") (epsilon_r 4.5) (loss_tangent 0.02))
      (layer "B.Cu" (type "copper") (thickness 0.035))
      (layer "B.Mask" (type "Bottom Solder Mask") (color "${kicadColor}") (thickness 0.01))
      (layer "B.SilkS" (type "Bottom Silk Screen") (color "White"))
      (copper_finish "HASL lead-free")
      (dielectric_constraints no)
    )`

// Extract tsci's kicad_zip straight into a per-board project folder
// (e.g. ~/Downloads/Maker Chip/top_kicad_project/), patch the
// .kicad_pcb in place, and ALSO produce a Windows-compatible zip
// next to it for upload/sharing.
//
// Earlier versions of this script repacked the patched output with
// `tar.exe -acf …zip`, which produces a zip variant that Windows
// Explorer's built-in extractor refuses to open. Switching to
// PowerShell's Compress-Archive produces a standard PKZIP that
// Explorer handles natively.
const projectDir = path.join(dl, `${board}_kicad_project`)
fs.rmSync(projectDir, { recursive: true, force: true })
fs.mkdirSync(projectDir, { recursive: true })
execFileSync(
  process.platform === "win32" ? "tar.exe" : "tar",
  ["-xf", zipPath, "-C", projectDir],
)

// The kicad_pcb file inside is named after the board's .circuit.tsx
// (e.g. top.circuit.kicad_pcb).
const pcbFile = fs
  .readdirSync(projectDir)
  .find((f) => f.endsWith(".kicad_pcb"))
if (!pcbFile) {
  console.error(`no .kicad_pcb found in ${zipPath}`)
  process.exit(1)
}
const pcbPath = path.join(projectDir, pcbFile)
let pcb = fs.readFileSync(pcbPath, "utf8")

// Insert cutouts before the final closing `)` of the top-level
// (kicad_pcb ... )
const lastParen = pcb.lastIndexOf(")")
if (lastParen === -1) {
  console.error("malformed .kicad_pcb: no closing paren")
  process.exit(1)
}
pcb = pcb.slice(0, lastParen) + cutoutBlocks + "\n" + pcb.slice(lastParen)

// Inject the stackup block inside the existing (setup ...) section.
// tscircuit's exporter emits a minimal setup with just
// `pad_to_mask_clearance`; we add the stackup right after that line so
// KiCad's 3D viewer picks up the soldermask color and board thickness.
if (!/\(stackup\b/.test(pcb)) {
  pcb = pcb.replace(
    /(\(setup\s*\n\s*\(pad_to_mask_clearance\s+\d+\)\s*)\n/,
    `$1\n${stackup}\n`,
  )
}

// Also update board thickness in (general (thickness …)). tscircuit's
// exporter hardcodes 1.6 regardless of board.thickness; use the value
// from the .tsx source.
pcb = pcb.replace(
  /(\(general\s*\n\s*\(thickness\s+)[\d.]+(\))/,
  `$1${boardThicknessMm}$2`,
)

fs.writeFileSync(pcbPath, pcb)

// Repack as a Windows-compatible zip via PowerShell. Use -Force to
// overwrite any prior zip. The `$ProgressPreference = 'SilentlyContinue'`
// dramatically speeds up Compress-Archive on Windows by suppressing the
// progress bar rendering.
if (process.platform === "win32") {
  fs.rmSync(zipPath, { force: true })
  const cmd = `$ProgressPreference='SilentlyContinue'; Compress-Archive -Path '${projectDir.replace(/'/g, "''")}\\*' -DestinationPath '${zipPath.replace(/'/g, "''")}' -Force`
  execFileSync("powershell.exe", ["-NoProfile", "-Command", cmd])
}

console.log(
  `Patched ${cutouts.length} cutout(s) into:\n  folder: ${projectDir}\n  zip:    ${zipPath}`,
)
