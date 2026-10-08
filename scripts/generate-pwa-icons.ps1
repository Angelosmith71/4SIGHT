$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$srcPath = Join-Path $root 'public\icons\app-icon-source.png'
$outDir = Join-Path $root 'public\icons'
if (-not (Test-Path $srcPath)) { throw "Missing $srcPath" }

$loaded = [System.Drawing.Image]::FromFile($srcPath)
$bmp = New-Object System.Drawing.Bitmap $loaded
$loaded.Dispose()
$width = $bmp.Width
$height = $bmp.Height
$rect = New-Object System.Drawing.Rectangle 0, 0, $width, $height
$data = $bmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadWrite, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$stride = $data.Stride
$bytes = New-Object byte[] ($stride * $height)
[System.Runtime.InteropServices.Marshal]::Copy($data.Scan0, $bytes, 0, $bytes.Length)

$limit = 36 * 36
$seen = New-Object bool[] ($width * $height)
$stack = New-Object System.Collections.Generic.Stack[int]

function Consider([int]$x, [int]$y) {
  if ($x -lt 0 -or $y -lt 0 -or $x -ge $width -or $y -ge $height) { return }
  $i = $y * $width + $x
  if ($seen[$i]) { return }
  $o = $y * $stride + $x * 4
  $dr = [int]$bytes[$o + 2] - 1
  $dg = [int]$bytes[$o + 1] - 15
  $db = [int]$bytes[$o] - 42
  if ((($dr * $dr) + ($dg * $dg) + ($db * $db)) -ge $limit) { return }
  $seen[$i] = $true
  $stack.Push($i)
}

for ($x = 0; $x -lt $width; $x++) { Consider $x 0; Consider $x ($height - 1) }
for ($y = 0; $y -lt $height; $y++) { Consider 0 $y; Consider ($width - 1) $y }

while ($stack.Count -gt 0) {
  $i = $stack.Pop()
  $x = $i % $width
  $y = [int][Math]::Floor($i / $width)
  $o = $y * $stride + $x * 4
  $bytes[$o + 3] = 0
  Consider ($x - 1) $y
  Consider ($x + 1) $y
  Consider $x ($y - 1)
  Consider $x ($y + 1)
}

for ($pass = 0; $pass -lt 3; $pass++) {
  $drop = New-Object System.Collections.Generic.List[int]
  for ($y = 1; $y -lt ($height - 1); $y++) {
    for ($x = 1; $x -lt ($width - 1); $x++) {
      $o = $y * $stride + $x * 4
      if ($bytes[$o + 3] -eq 0) { continue }
      $left = $bytes[$o - 1]
      $right = $bytes[($y * $stride + ($x + 1) * 4) + 3]
      $up = $bytes[(($y - 1) * $stride + $x * 4) + 3]
      $down = $bytes[(($y + 1) * $stride + $x * 4) + 3]
      if ($left -ne 0 -and $right -ne 0 -and $up -ne 0 -and $down -ne 0) { continue }
      $lum = (0.299 * $bytes[$o + 2]) + (0.587 * $bytes[$o + 1]) + (0.114 * $bytes[$o])
      if ($lum -lt 62) { $drop.Add($o) }
    }
  }
  foreach ($o in $drop) { $bytes[$o + 3] = 0 }
}

[System.Runtime.InteropServices.Marshal]::Copy($bytes, 0, $data.Scan0, $bytes.Length)
$bmp.UnlockBits($data)

$minX = $width; $minY = $height; $maxX = 0; $maxY = 0; $kept = 0
for ($y = 0; $y -lt $height; $y++) {
  for ($x = 0; $x -lt $width; $x++) {
    if ($bytes[$y * $stride + $x * 4 + 3] -lt 16) { continue }
    $kept++
    if ($x -lt $minX) { $minX = $x }
    if ($y -lt $minY) { $minY = $y }
    if ($x -gt $maxX) { $maxX = $x }
    if ($y -gt $maxY) { $maxY = $y }
  }
}
if ($kept -eq 0) { throw 'Logo bounds were empty after removing the background' }

$cropW = $maxX - $minX + 1
$cropH = $maxY - $minY + 1
$crop = $bmp.Clone((New-Object System.Drawing.Rectangle $minX, $minY, $cropW, $cropH), [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$bmp.Dispose()

$tx0 = $crop.Width; $ty0 = $crop.Height; $tx1 = 0; $ty1 = 0
for ($y = 0; $y -lt $crop.Height; $y++) {
  for ($x = 0; $x -lt $crop.Width; $x++) {
    $p = $crop.GetPixel($x, $y)
    if ($p.A -lt 16) { continue }
    if ($p.R -lt 28 -and $p.G -lt 28 -and $p.B -lt 28) { continue }
    if ($x -lt $tx0) { $tx0 = $x }
    if ($y -lt $ty0) { $ty0 = $y }
    if ($x -gt $tx1) { $tx1 = $x }
    if ($y -gt $ty1) { $ty1 = $y }
  }
}
if ($tx1 -gt $tx0 -and $ty1 -gt $ty0) {
  $tight = $crop.Clone((New-Object System.Drawing.Rectangle $tx0, $ty0, ($tx1 - $tx0 + 1), ($ty1 - $ty0 + 1)), [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $crop.Dispose()
  $crop = $tight
}

foreach ($pair in @(@(512, 'icon-512.png'), @(192, 'icon-192.png'), @(180, 'apple-touch-icon.png'))) {
  $size = [int]$pair[0]
  $canvas = New-Object System.Drawing.Bitmap $size, $size
  $g = [System.Drawing.Graphics]::FromImage($canvas)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.Clear([System.Drawing.Color]::Transparent)
  $scale = [Math]::Max($size / $crop.Width, $size / $crop.Height)
  $dw = [Math]::Max(1, [int]($crop.Width * $scale))
  $dh = [Math]::Max(1, [int]($crop.Height * $scale))
  $dx = [int](($size - $dw) / 2)
  $dy = [int](($size - $dh) / 2)
  $g.DrawImage($crop, (New-Object System.Drawing.Rectangle $dx, $dy, $dw, $dh))
  $g.Dispose()
  $bits = $canvas.LockBits((New-Object System.Drawing.Rectangle 0, 0, $size, $size), [System.Drawing.Imaging.ImageLockMode]::ReadWrite, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $rowBytes = $bits.Stride
  $pixels = New-Object byte[] ($rowBytes * $size)
  [System.Runtime.InteropServices.Marshal]::Copy($bits.Scan0, $pixels, 0, $pixels.Length)
  $visited = New-Object bool[] ($size * $size)
  $stack = New-Object System.Collections.Generic.Stack[int]
  for ($sx = 0; $sx -lt $size; $sx++) { $stack.Push($sx); $stack.Push(($size - 1) * $size + $sx) }
  for ($sy = 0; $sy -lt $size; $sy++) { $stack.Push($sy * $size); $stack.Push($sy * $size + $size - 1) }
  while ($stack.Count -gt 0) {
    $i = $stack.Pop()
    if ($visited[$i]) { continue }
    $visited[$i] = $true
    $sx = $i % $size
    $sy = [int][Math]::Floor($i / $size)
    $so = $sy * $rowBytes + $sx * 4
    $maxc = [Math]::Max($pixels[$so + 2], [Math]::Max($pixels[$so + 1], $pixels[$so]))
    if ($pixels[$so + 3] -gt 16 -and $maxc -ge 42) { continue }
    $pixels[$so + 3] = 0
    if ($sx -gt 0) { $stack.Push($i - 1) }
    if ($sx -lt ($size - 1)) { $stack.Push($i + 1) }
    if ($sy -gt 0) { $stack.Push($i - $size) }
    if ($sy -lt ($size - 1)) { $stack.Push($i + $size) }
  }
  $center = ($size - 1) / 2.0
  $radius = $size / 2.0
  for ($py = 0; $py -lt $size; $py++) {
    for ($px = 0; $px -lt $size; $px++) {
      $dist = [Math]::Sqrt((($px - $center) * ($px - $center)) + (($py - $center) * ($py - $center)))
      $offset = $py * $rowBytes + $px * 4
      if ($dist -ge $radius) { $pixels[$offset + 3] = 0; continue }
      $edge = $radius - $dist
      if ($edge -lt 1.25) { $pixels[$offset + 3] = [byte]([Math]::Max(0, [Math]::Min(255, ($edge / 1.25) * 255))) }
    }
  }
  [System.Runtime.InteropServices.Marshal]::Copy($pixels, 0, $bits.Scan0, $pixels.Length)
  $canvas.UnlockBits($bits)
  $canvas.Save((Join-Path $outDir $pair[1]), [System.Drawing.Imaging.ImageFormat]::Png)
  $corner = $canvas.GetPixel(0, 0)
  $canvas.Dispose()
  Write-Output "$($pair[1]) corner alpha=$($corner.A)"
}

$crop.Dispose()
Write-Output "Logo crop ${cropW}x${cropH}, kept $kept pixels."
