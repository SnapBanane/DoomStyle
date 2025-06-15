# stats.ps1
$jsFiles   = Get-ChildItem -Recurse -Include *.js   -File
$htmlFiles = Get-ChildItem -Recurse -Include *.html -File
$allFiles  = Get-ChildItem -Recurse -File

$jsLines   = $jsFiles   | Get-Content | Measure-Object -Line
$htmlLines = $htmlFiles | Get-Content | Measure-Object -Line
$totalSize = ($allFiles | Measure-Object -Property Length -Sum).Sum / 1MB

Write-Host "## Project Statistics"
Write-Host ""
Write-Host "Total files: $($allFiles.Count)"
Write-Host "JavaScript files: $($jsFiles.Count)"
Write-Host "HTML files: $($htmlFiles.Count)"
Write-Host "Lines of JavaScript: $($jsLines.Lines)"
Write-Host "Lines of HTML: $($htmlLines.Lines)"
Write-Host "Total lines (JS + HTML): $($jsLines.Lines + $htmlLines.Lines)"
Write-Host ("Total project size: {0:N2} MB" -f $totalSize)