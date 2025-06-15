# boot.ps1
$ErrorActionPreference = "Continue"

Write-Host "==========================================="
Write-Host "  Welcome to the DoomStyle App  "
Write-Host "==========================================="
Write-Host "Developers: SnapBanane, GamekniteC7, PlutoEdiMedi"

# Get latest commit
$commit = git log -1 --pretty=format:"%h %s" 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "Latest Commit: $commit"
} else {
    Write-Host "Latest Commit: (git not found or not a repo)"
}

# Count files and lines
$jsFiles   = Get-ChildItem -Recurse -Include *.js   -File
$htmlFiles = Get-ChildItem -Recurse -Include *.html -File
$fileCount = ($jsFiles + $htmlFiles).Count
$lines     = ($jsFiles + $htmlFiles | Get-Content | Measure-Object -Line).Lines

Write-Host ".js/.html Files: $fileCount"
Write-Host "Total Lines (.js + .html): $lines"
Write-Host "==========================================="

Write-Host -NoNewline "Starting Node.js server... (Press Ctrl+C to stop) "

# Run node in the foreground so Ctrl+C works
try {
    node server.js
} catch {
    Write-Host "`nError running server: $_"
}