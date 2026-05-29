Add-Type -AssemblyName System.Drawing

function New-AppIcon($size, $outPath) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = 'HighQuality'

    # 暖白背景
    $bgColor = [System.Drawing.Color]::FromArgb(248, 246, 243)
    $g.Clear($bgColor)

    # 颜色
    $blue = [System.Drawing.Color]::FromArgb(107, 159, 212)
    $darkBlue = [System.Drawing.Color]::FromArgb(74, 127, 181)
    $white = [System.Drawing.Color]::White

    # 尺寸计算
    $margin = [int]($size * 0.08)
    $circleSize = $size - ($margin * 2)
    $cx = [int]($size / 2)
    $cy = [int]($size / 2)
    $r = [int]($circleSize / 2)

    # 蓝色圆形背景
    $circleBrush = New-Object System.Drawing.SolidBrush($blue)
    $g.FillEllipse($circleBrush, $margin, $margin, $circleSize, $circleSize)

    # 白色杠铃横杆
    $barW = [float]($size * 0.055)
    $barPen = New-Object System.Drawing.Pen($white)
    $barPen.Width = $barW
    $barPen.StartCap = 'Round'
    $barPen.EndCap = 'Round'

    $barLeft = [int]($cx - ($r * 0.52))
    $barRight = [int]($cx + ($r * 0.52))
    $g.DrawLine($barPen, $barLeft, $cy, $barRight, $cy)

    # 杠铃片（短粗竖线）
    $plateW = [float]($size * 0.07)
    $platePen = New-Object System.Drawing.Pen($white)
    $platePen.Width = $plateW
    $platePen.StartCap = 'Round'
    $platePen.EndCap = 'Round'

    $plateOff = [int]($r * 0.44)
    $plateHalfH = [int]($r * 0.24)
    # 左片
    $g.DrawLine($platePen, $cx - $plateOff, $cy - $plateHalfH, $cx - $plateOff, $cy + $plateHalfH)
    # 右片
    $g.DrawLine($platePen, $cx + $plateOff, $cy - $plateHalfH, $cx + $plateOff, $cy + $plateHalfH)

    # 内圈装饰线（深蓝）
    $innerW = [float]($size * 0.012)
    $innerPen = New-Object System.Drawing.Pen($darkBlue)
    $innerPen.Width = $innerW

    $innerR = [int]($r * 0.78)
    $g.DrawEllipse($innerPen, $cx - $innerR, $cy - $innerR, $innerR * 2, $innerR * 2)

    # 清理
    $barPen.Dispose()
    $platePen.Dispose()
    $innerPen.Dispose()
    $circleBrush.Dispose()
    $g.Dispose()

    # 保存
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "OK: $outPath (${size}x${size})"
}

New-AppIcon 192 'c:\Users\m1817\Desktop\aaa\icons\icon-192.png'
New-AppIcon 512 'c:\Users\m1817\Desktop\aaa\icons\icon-512.png'
Write-Host 'All done!'
