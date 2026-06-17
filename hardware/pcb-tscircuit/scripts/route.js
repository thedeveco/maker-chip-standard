// Hand a board to Freerouting for autorouting.
//
// Usage from project root:
//   node scripts/route.js {top|middle|bottom}
//
// What it does:
//   1. Exports the chosen board to Specctra DSN via `tsci export -f specctra-dsn`
//   2. Launches the Freerouting GUI with the DSN pre-loaded and the
//      output .ses path pre-configured
//
// In the GUI, click "Auto-route" (or Tools → Auto-Route). When routing
// finishes, File → Save Session writes the .ses file at the path
// printed below. Import that .ses back into KiCad via File → Import →
// Specctra Session, or feed it into whatever toolchain consumes
// session files.
//
// Requires:
//   - Freerouting installed (Windows MSI from
//     https://github.com/freerouting/freerouting/releases — installs to
//     %LOCALAPPDATA%\freerouting\freerouting.exe with a bundled JRE so
//     no separate Java install is needed)
//   - tscircuit CLI available as `npx tsci`

const { execSync, spawn } = require("child_process")
const path = require("path")
const fs = require("fs")
const os = require("os")

const board = process.argv[2]
if (!["top", "middle", "bottom"].includes(board)) {
  console.error("usage: node scripts/route.js {top|middle|bottom}")
  process.exit(1)
}

const root = path.resolve(__dirname, "..")
const outDir = path.join(os.homedir(), "Downloads", "Maker Chip")
const dsn = path.join(outDir, `${board}.dsn`)
const ses = path.join(outDir, `${board}.ses`)

const fr =
  process.platform === "win32"
    ? path.join(process.env.LOCALAPPDATA, "freerouting", "freerouting.exe")
    : "freerouting"

if (!fs.existsSync(fr)) {
  console.error(
    `Freerouting not found at:\n  ${fr}\n\nInstall from https://github.com/freerouting/freerouting/releases (Windows MSI bundles a JRE).`,
  )
  process.exit(1)
}

fs.mkdirSync(outDir, { recursive: true })

console.log(`Exporting ${board}.circuit.tsx → ${dsn}`)
execSync(
  `npx tsci export ${board}.circuit.tsx -f specctra-dsn -o "${dsn}"`,
  { cwd: root, stdio: "inherit" },
)

console.log(`\nLaunching Freerouting ...`)
const child = spawn(fr, ["-de", dsn, "-do", ses], {
  detached: true,
  stdio: "ignore",
})
child.unref()

console.log(`\nGUI launched with ${board}.dsn loaded.

In the Freerouting window:
  1. Click the "Autoroute" button (or menu Tools → Autoroute)
  2. Wait for the auto-router to finish all passes
  3. File → Save Session  →  ${ses}

The session file can then be imported into KiCad
(File → Import → Specctra Session), or read by any other tool that
consumes Specctra .ses output.`)
