Add-Type -AssemblyName System.Drawing

$sourceDir = "E:\IELTS\EXE201\MONARI"
$targetBase = "E:\IELTS\EXE201\FE\public\assets\monari"
$decorDir = Join-Path $targetBase "decor"
$menuDir = Join-Path $targetBase "menu"
$tablesDir = Join-Path $targetBase "tables"

New-Item -ItemType Directory -Force -Path $decorDir | Out-Null
New-Item -ItemType Directory -Force -Path $menuDir | Out-Null
New-Item -ItemType Directory -Force -Path $tablesDir | Out-Null

function Compress-FileItem {
    param(
        [System.IO.FileInfo]$fileItem,
        [string]$destPath,
        [int]$maxWidth = 1200,
        [int]$maxHeight = 1200,
        [long]$quality = 82
    )

    try {
        $fs = [System.IO.File]::OpenRead($fileItem.FullName)
        $sourceImg = [System.Drawing.Image]::FromStream($fs)
        
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
        $fs.Dispose()

        $size = (Get-Item $destPath).Length / 1KB
        Write-Host "Processed $($fileItem.Name) -> $([System.IO.Path]::GetFileName($destPath)) ($([Math]::Round($size, 1)) KB)"
    }
    catch {
        Write-Error "Error processing $($fileItem.FullName) : $($_.Exception.Message)"
    }
}

$items = Get-ChildItem -LiteralPath $sourceDir

foreach ($item in $items) {
    $name = $item.Name.ToLower()

    # Menu items
    if ($name -like "*trung thu*") {
        if ($name -like "*(1)*") {
            Compress-FileItem $item "$menuDir\set_banh_trung_thu_1.jpg" 800 800 85
        } elseif ($name -like "*(2)*") {
            Compress-FileItem $item "$menuDir\set_banh_trung_thu_2.jpg" 800 800 85
        } else {
            Compress-FileItem $item "$menuDir\set_banh_trung_thu.jpg" 800 800 85
        }
    }
    elseif ($name -like "*coco matcha*") {
        Compress-FileItem $item "$menuDir\coco_matcha.jpg" 800 800 85
    }
    elseif ($name -like "*quế hoa*" -or $name -like "*que hoa*") {
        Compress-FileItem $item "$menuDir\nuoc_dua_que_hoa.jpg" 800 800 85
    }
    elseif ($name -like "*lựu đỏ*" -or $name -like "*luu do*") {
        Compress-FileItem $item "$menuDir\tra_luu_do.jpg" 800 800 85
    }
    elseif ($name -like "*ổi hồng*" -or $name -like "*oi hong*") {
        Compress-FileItem $item "$menuDir\tra_oi_hong.jpg" 800 800 85
    }
    elseif ($name.StartsWith("nước_") -or $name.StartsWith("nuoc_")) {
        Compress-FileItem $item "$menuDir\tra_trai_cay.jpg" 800 800 85
    }
    # Tables
    elseif ($name -like "*bàn 2 người*" -or $name -like "*ban 2 nguoi*") {
        if ($name -like "*(1)*") {
            Compress-FileItem $item "$tablesDir\ban_2_nguoi_1.jpg" 800 600 85
        } elseif ($name -like "*(2)*") {
            Compress-FileItem $item "$tablesDir\ban_2_nguoi_2.jpg" 800 600 85
        } elseif ($name -like "*(3)*") {
            Compress-FileItem $item "$tablesDir\ban_2_nguoi_3.jpg" 800 600 85
        } else {
            Compress-FileItem $item "$tablesDir\ban_2_nguoi.jpg" 800 600 85
        }
    }
    elseif ($name -like "*bàn 4 người*" -or $name -like "*ban 4 nguoi*") {
        if ($name -like "*(1)*") {
            Compress-FileItem $item "$tablesDir\ban_4_nguoi_1.jpg" 800 600 85
        } elseif ($name -like "*.png*") {
            Compress-FileItem $item "$tablesDir\ban_4_nguoi_2.jpg" 800 600 85
        } else {
            Compress-FileItem $item "$tablesDir\ban_4_nguoi.jpg" 800 600 85
        }
    }
    elseif ($name -like "*bàn 8 người*" -or $name -like "*ban 8 nguoi*") {
        Compress-FileItem $item "$tablesDir\ban_8_nguoi.jpg" 800 600 85
    }
    # Decor / Space
    elseif ($name -like "*không gian quán*" -or $name -like "*khong gian quan*") {
        if ($name -like "*(1)*") {
            Compress-FileItem $item "$decorDir\decor_1.jpg" 1000 750 82
        } elseif ($name -like "*(2)*") {
            Compress-FileItem $item "$decorDir\decor_2.jpg" 1000 750 82
        } elseif ($name -like "*(3)*") {
            Compress-FileItem $item "$decorDir\decor_3.jpg" 1000 750 82
        } else {
            Compress-FileItem $item "$decorDir\hero_bg.jpg" 1920 1080 82
            Compress-FileItem $item "$decorDir\space_main.jpg" 1000 750 82
        }
    }
    elseif ($name -like "*không gian*" -or $name -like "*khong gian*") {
        Compress-FileItem $item "$decorDir\decor_4.jpg" 1000 750 82
    }
}

Write-Host "Stream compression finished."
