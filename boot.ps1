# quickstart.ps1
$ErrorActionPreference = "Continue"

Write-Host "==========================================="
Write-Host "  Welcome to the Informatik_DoomStyle App  "
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

# Start server
Write-Host "Starting Node.js server..."
Start-Process -NoNewWindow -FilePath "node" -ArgumentList "server.js"

Start-Sleep -Seconds 2

# Open browser
try {
    Start-Process "http://localhost:3000"
    Write-Host "Opened http://localhost:3000 in your browser."
} catch {
    Write-Host "Could not open browser: $_"
}