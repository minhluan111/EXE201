Add-Type -AssemblyName System.Drawing

$baseDir = "E:\IELTS\EXE201\FE\public\assets\monari"

function Optimize-ImageInPlace {
    param(
        [string]$filePath,
        [int]$maxW = 1000,
        [int]$maxH = 1000,
        [long]$quality = 82
    )

    if (-not (Test-Path $filePath)) { return }

    try {
        $tempPath = $filePath + ".tmp.jpg"
        $fs = [System.IO.File]::OpenRead($filePath)
        $img = [System.Drawing.Image]::FromStream($fs)

        $w = $img.Width
        $h = $img.Height

        $ratioX = [double]$maxW / $w
        $ratioY = [double]$maxH / $h
        $ratio = [Math]::Min($ratioX, $ratioY)
        if ($ratio -gt 1.0) { $ratio = 1.0 }

        $newW = [int]($w * $ratio)
        $newH = [int]($h * $ratio)

        $bitmap = New-Object System.Drawing.Bitmap($newW, $newH)
        $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

        $rect = New-Object System.Drawing.Rectangle(0, 0, $newW, $newH)
        $graphics.DrawImage($img, $rect)

        $jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.FormatDescription -eq "JPEG" }
        $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
        $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, $quality)

        $bitmap.Save($tempPath, $jpegCodec, $encoderParams)

        $graphics.Dispose()
        $bitmap.Dispose()
        $img.Dispose()
        $fs.Dispose()

        Move-Item -Force $tempPath $filePath
        $kb = [Math]::Round(((Get-Item $filePath).Length / 1KB), 1)
        Write-Host "Optimized: $([System.IO.Path]::GetFileName($filePath)) -> ${kb} KB ($newW x $newH)"
    }
    catch {
        Write-Error "Error optimizing $filePath : $($_.Exception.Message)"
    }
}

# Wait for node convert to finish
Start-Sleep -Seconds 3

Write-Host "=== Optimizing All Monari Assets ==="

# Menu
Get-ChildItem -Path "$baseDir\menu" | ForEach-Object {
    Optimize-ImageInPlace $_.FullName 800 800 82
}

# Tables
Get-ChildItem -Path "$baseDir\tables" | ForEach-Object {
    Optimize-ImageInPlace $_.FullName 800 600 82
}

# Decor / Space
Get-ChildItem -Path "$baseDir\decor" | ForEach-Object {
    if ($_.Name -eq "hero_bg.jpg") {
        Optimize-ImageInPlace $_.FullName 1920 1080 82
    } elseif ($_.Name -eq "logo.jpg" -or $_.Name -eq "logo.png") {
        Optimize-ImageInPlace $_.FullName 400 400 90
    } else {
        Optimize-ImageInPlace $_.FullName 1000 750 80
    }
}

$totalBytes = (Get-ChildItem -Recurse $baseDir | Measure-Object -Property Length -Sum).Sum
$totalMB = [Math]::Round(($totalBytes / 1MB), 2)
Write-Host "`n=== Optimization Complete! Total Monari assets size: $totalMB MB ==="
