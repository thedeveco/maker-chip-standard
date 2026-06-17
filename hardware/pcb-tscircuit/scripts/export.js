// Export Maker Chip boards to ~/Downloads/Maker Chip/ in one or more
// formats.
//
// Usage from project root:
//   node scripts/export.js                       # all boards, kicad_zip
//   node scripts/export.js top                   # one board, kicad_zip
//   node scripts/export.js top kicad_zip,gerbers # one board, multiple formats
//   node scripts/export.js all kicad_zip,specctra-dsn,glb,step
//
// Supported formats (passed straight through to `tsci export -f <fmt>`):
//   kicad_zip, kicad_sch, kicad_pcb, kicad-library,
//   specctra-dsn, gerbers, srj,
//   glb, gltf, step,
//   pcb-svg, schematic-svg, assembly-svg,
//   circuit-json, readable-netlist
//
// Files land in `~/Downloads/Maker Chip/<board>.<ext>` (or `.<format>.zip`
// for kicad_zip + gerbers which produce archives).

const { execSync } = require("child_process")
const path = require("path")
const fs = require("fs")
const os = require("os")

const VALID_BOARDS = ["top", "middle", "bottom"]
// Format → output file extension. If a format isn't listed it falls
// through to using the format name as the extension.
const EXTENSIONS = {
  kicad_zip: "kicad.zip",
  kicad_sch: "kicad_sch",
  kicad_pcb: "kicad_pcb",
  "kicad-library": "pretty.zip",
  "specctra-dsn": "dsn",
  gerbers: "gerbers.zip",
  srj: "srj",
  glb: "glb",
  gltf: "gltf",
  step: "step",
  "pcb-svg": "pcb.svg",
  "schematic-svg": "schematic.svg",
  "assembly-svg": "assembly.svg",
  "circuit-json": "json",
  "readable-netlist": "netlist.txt",
}

const boardArg = (process.argv[2] || "all").toLowerCase()
const formatsArg = process.argv[3] || "kicad_zip"
const boards =
  boardArg === "all"
    ? VALID_BOARDS
    : VALID_BOARDS.includes(boardArg)
      ? [boardArg]
      : null
const formats = formatsArg.split(",").map((s) => s.trim()).filter(Boolean)

if (!boards) {
  console.error(
    `usage: node scripts/export.js [top|middle|bottom|all] [format1,format2,...]\n` +
      `  defaults: all, kicad_zip`,
  )
  process.exit(1)
}

const root = path.resolve(__dirname, "..")
const outDir = path.join(os.homedir(), "Downloads", "Maker Chip")
fs.mkdirSync(outDir, { recursive: true })

console.log(`Exporting to: ${outDir}\n`)

for (const board of boards) {
  for (const format of formats) {
    const ext = EXTENSIONS[format] || format
    const out = path.join(outDir, `${board}.${ext}`)
    console.log(`[${board}] → ${format} → ${out}`)
    try {
      execSync(
        `npx tsci export ${board}.circuit.tsx -f ${format} -o "${out}"`,
        { cwd: root, stdio: ["ignore", "inherit", "inherit"] },
      )
    } catch (err) {
      console.error(`  FAILED: ${err.message.split("\n")[0]}`)
    }
  }
}

console.log(`\nDone. Files in ${outDir}.`)
