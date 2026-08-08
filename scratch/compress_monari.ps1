# PowerShell script to compress and organize MONARI images
Add-Type -AssemblyName System.Drawing

$sourceDir = "E:\IELTS\EXE201\MONARI"
$targetBase = "E:\IELTS\EXE201\FE\public\assets\monari"
$decorDir = Join-Path $targetBase "decor"
$menuDir = Join-Path $targetBase "menu"
$tablesDir = Join-Path $targetBase "tables"

New-Item -ItemType Directory -Force -Path $decorDir | Out-Null
New-Item -ItemType Directory -Force -Path $menuDir | Out-Null
New-Item -ItemType Directory -Force -Path $tablesDir | Out-Null

function Compress-Image {
    param(
        [string]$sourcePath,
        [string]$destPath,
        [int]$maxWidth = 1200,
        [int]$maxHeight = 1200,
        [long]$quality = 82
    )

    if (-not (Test-Path $sourcePath)) {
        Write-Warning "File not found: $sourcePath"
        return
    }

    try {
        $sourceImg = [System.Drawing.Image]::FromFile($sourcePath)
        
        $w = $sourceImg.Width
        $h = $sourceImg.Height

        $ratioX = [double]$maxWidth / $w
        $ratioY = [double]$maxHeight / $h
        $ratio = [Math]::Min($ratioX, $ratioY)
        if ($ratio -gt 1.0) { $ratio = 1.0 }

        $newW = [int]($w * $ratio)
        $newH = [int]($h * $ratio)

        $destBitmap = New-Object System.Drawing.Bitmap($newW, $newH)
        $graphics = [System.Drawing.Graphics]::FromImage($destBitmap)
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

        $rect = New-Object System.Drawing.Rectangle(0, 0, $newW, $newH)
        $graphics.DrawImage($sourceImg, $rect)

        $jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.FormatDescription -eq "JPEG" }
        $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
        $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, $quality)

        $destBitmap.Save($destPath, $jpegCodec, $encoderParams)

        $graphics.Dispose()
        $destBitmap.Dispose()
        $sourceImg.Dispose()

        $size = (Get-Item $destPath).Length / 1KB
        Write-Host "Compressed $([System.IO.Path]::GetFileName($sourcePath)) -> $([System.IO.Path]::GetFileName($destPath)) ($([Math]::Round($size, 1)) KB)"
    }
    catch {
        Write-Error "Error processing $sourcePath : $($_.Exception.Message)"
    }
}

Write-Host "=== 1. Processing Menu Images ==="
# Menu items
Compress-Image "$sourceDir\(Menu) Set bánh trung thu 🥮 (Set bánh gồm 4 cái, 2 nhân ngọt, 2 nhân mạnh) - 552.000₫" "$menuDir\set_banh_trung_thu.jpg" 800 800 85
Compress-Image "$sourceDir\(Menu) Set bánh trung thu 🥮 (Set bánh gồm 4 cái, 2 nhân ngọt, 2 nhân mạnh) - 552(1).000₫" "$menuDir\set_banh_trung_thu_1.jpg" 800 800 85
Compress-Image "$sourceDir\(Menu) Set bánh trung thu 🥮 (Set bánh gồm 4 cái, 2 nhân ngọt, 2 nhân mạnh) - 552(2).000₫" "$menuDir\set_banh_trung_thu_2.jpg" 800 800 85
Compress-Image "$sourceDir\Coco matcha - 55.000₫ (Matcha + nước dừa tươi)" "$menuDir\coco_matcha.jpg" 800 800 85
Compress-Image "$sourceDir\Nước dừa quế hoa🥥 - 49.000₫_" "$menuDir\nuoc_dua_que_hoa.jpg" 800 800 85
Compress-Image "$sourceDir\Trà lựu đỏ - 48.000₫ (Trà lựu đỏ + hạt ngọc trai)" "$menuDir\tra_luu_do.jpg" 800 800 85
Compress-Image "$sourceDir\Trà ổi hồng - 48.000₫ (Trà ổi hồng + hạt ngọc trai)" "$menuDir\tra_oi_hong.jpg" 800 800 85
Compress-Image "$sourceDir\Nước_" "$menuDir\tra_trai_cay.jpg" 800 800 85

Write-Host "`n=== 2. Processing Table Images ==="
# Tables
Compress-Image "$sourceDir\Bàn 2 người" "$tablesDir\ban_2_nguoi.jpg" 800 600 85
Compress-Image "$sourceDir\Bàn 2 người(1)" "$tablesDir\ban_2_nguoi_1.jpg" 800 600 85
Compress-Image "$sourceDir\Bàn 2 người(2)" "$tablesDir\ban_2_nguoi_2.jpg" 800 600 85
Compress-Image "$sourceDir\Bàn 2 người(3)" "$tablesDir\ban_2_nguoi_3.jpg" 800 600 85
Compress-Image "$sourceDir\Bàn 4 người" "$tablesDir\ban_4_nguoi.jpg" 800 600 85
Compress-Image "$sourceDir\Bàn 4 người(1)" "$tablesDir\ban_4_nguoi_1.jpg" 800 600 85
Compress-Image "$sourceDir\Bàn 4 người.png" "$tablesDir\ban_4_nguoi_2.jpg" 800 600 85
Compress-Image "$sourceDir\Bàn 8 người.png" "$tablesDir\ban_8_nguoi.jpg" 800 600 85

Write-Host "`n=== 3. Processing Decor / Space / Hero Images ==="
# Hero background (high res but well-compressed, 1920x1080 max)
Compress-Image "$sourceDir\Không gian quán" "$decorDir\hero_bg.jpg" 1920 1080 82
Compress-Image "$sourceDir\Không gian quán(1)" "$decorDir\decor_1.jpg" 1000 750 82
Compress-Image "$sourceDir\Không gian quán(2)" "$decorDir\decor_2.jpg" 1000 750 82
Compress-Image "$sourceDir\Không gian quán(3)" "$decorDir\decor_3.jpg" 1000 750 82
Compress-Image "$sourceDir\Để trong không gian quán.png" "$decorDir\decor_4.jpg" 1000 750 82
Compress-Image "$sourceDir\IMG_4188.JPG" "$decorDir\space_4188.jpg" 1000 750 80
Compress-Image "$sourceDir\IMG_4189.JPG" "$decorDir\space_4189.jpg" 1000 750 80
Compress-Image "$sourceDir\IMG_4190.JPG" "$decorDir\space_4190.jpg" 1000 750 80
Compress-Image "$sourceDir\IMG_4191.JPG" "$decorDir\space_4191.jpg" 1000 750 80
Compress-Image "$sourceDir\IMG_4192.JPG" "$decorDir\space_4192.jpg" 1000 750 80
Compress-Image "$sourceDir\IMG_4193.JPG" "$decorDir\space_4193.jpg" 1000 750 80
Compress-Image "$sourceDir\IMG_4194.JPG" "$decorDir\space_4194.jpg" 1000 750 80
Compress-Image "$sourceDir\IMG_4195.JPG" "$decorDir\space_4195.jpg" 1000 750 80
Compress-Image "$sourceDir\IMG_4196.JPG" "$decorDir\space_4196.jpg" 1000 750 80
Compress-Image "$sourceDir\IMG_4197.JPG" "$decorDir\space_4197.jpg" 1000 750 80
Compress-Image "$sourceDir\IMG_4198.JPG" "$decorDir\space_4198.jpg" 1000 750 80

# Also create a logo icon for Monari
Compress-Image "$sourceDir\IMG_4190.JPG" "$decorDir\logo.jpg" 400 400 90

Write-Host "`nAll images compressed and saved successfully!"
