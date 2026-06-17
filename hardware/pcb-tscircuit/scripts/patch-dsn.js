// Fix tscircuit's Specctra DSN export for polygon-shaped pads.
//
// Background: when `tsci export -f specctra-dsn` encounters a smtpad
// with shape="polygon", it can't compute the rect bounding box used in
// the DSN pin descriptor and writes literal `NaN` instead — both in the
// pad-name suffix (`RoundRect[T]Pad_NaNxNaN_um`) and in the pin
// position (`NaN NaN`). Downstream parsers (Freerouting, EasyEDA's
// KiCad converter, etc.) refuse to load the file. See tscircuit bug
// report linked in the comments on scripts/route.js.
//
// This patcher rewrites the broken entries:
//   - Pad-name dimensions are pulled from the image's `simple_chip:WxH_mm`
//     header (tscircuit DOES compute the package bbox correctly there).
//   - Pin positions are clamped to (0, 0) — i.e. centered on the chip
//     placement. For our 16 trapezoidal rim pads this is the right
//     answer because each EDGE pad chip's body anchor IS the polygon
//     center.
//
// Usage:
//   node scripts/patch-dsn.js <file.dsn> [<file2.dsn> ...]

const fs = require("fs")

const files = process.argv.slice(2)
if (!files.length) {
  console.error("usage: node scripts/patch-dsn.js <file.dsn> [...]")
  process.exit(1)
}

// To rebuild a padstack polygon we need the package size that
// references the NaN'd pad. The package size lives in the parent
// image's name (`simple_chip:WxH_mm`). Walk each image block, and if
// it contains a NaNxNaN pad reference, take ITS name's dimensions —
// earlier I tried to do this with one greedy regex and the `[\s\S]*?`
// chewed across multiple images, picking the wrong one.
function findPolygonPackageSize(text) {
  const imageRe = /\(image\s+"([^"]+)"\s*([\s\S]*?)\n\s*\)/g
  let m
  while ((m = imageRe.exec(text)) !== null) {
    if (!/NaNxNaN_um/.test(m[2])) continue
    const dims = m[1].match(/(\d+\.?\d*)x(\d+\.?\d*)_mm/)
    if (!dims) continue
    return {
      wUm: Math.round(parseFloat(dims[1]) * 1000),
      hUm: Math.round(parseFloat(dims[2]) * 1000),
    }
  }
  return null
}

for (const file of files) {
  let text = fs.readFileSync(file, "utf8")
  const before = (text.match(/NaN/g) || []).length
  const size = findPolygonPackageSize(text)

  // Walk each (image "name" ... ) block, take the WxH from the name,
  // substitute it into any NaNxNaN pad token, and zero any "NaN NaN"
  // pin coordinates.
  text = text.replace(
    /\(image\s+"([^"]+)"\s*([\s\S]*?)\n\s*\)/g,
    (block, name, body) => {
      const m = name.match(/(\d+\.?\d*)x(\d+\.?\d*)_mm/)
      if (!m) return block
      const wUm = Math.round(parseFloat(m[1]) * 1000)
      const hUm = Math.round(parseFloat(m[2]) * 1000)
      const patched = body
        .replace(/NaNxNaN_um/g, `${wUm}x${hUm}_um`)
        .replace(/(\(pin\s+\S+\s+\S+\s+)NaN\s+NaN(\))/g, "$10 0$2")
      return `(image "${name}"\n${patched}\n    )`
    },
  )

  // Walk each (padstack "NAME" (shape (polygon LAYER APERTURE NaN…NaN))) and
  // replace the polygon with a centered rectangle of the right size.
  if (size) {
    const { wUm, hUm } = size
    const halfW = Math.round(wUm / 2)
    const halfH = Math.round(hUm / 2)
    // 5-vertex closed rectangle (matches the 10-NaN pattern tscircuit emits)
    const rect = `${-halfW} ${-halfH} ${halfW} ${-halfH} ${halfW} ${halfH} ${-halfW} ${halfH} ${-halfW} ${-halfH}`
    text = text.replace(
      /(\(padstack\s+")([^"]*)NaNxNaN_um("[\s\S]*?\(polygon\s+\S+\s+\S+\s+)NaN\s+NaN\s+NaN\s+NaN\s+NaN\s+NaN\s+NaN\s+NaN\s+NaN\s+NaN(\))/g,
      (_, openName, prefix, mid, close) =>
        `${openName}${prefix}${wUm}x${hUm}_um${mid}${rect}${close}`,
    )
  }

  const after = (text.match(/NaN/g) || []).length
  if (before === 0) {
    console.log(`${file}: already clean`)
  } else {
    fs.writeFileSync(file, text)
    console.log(
      `${file}: ${before} NaN → ${after} NaN (patched ${before - after})`,
    )
  }
}
