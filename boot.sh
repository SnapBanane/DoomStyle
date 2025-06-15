#!/bin/bash
echo "==========================================="
echo "  Welcome to the DoomStyle App  "
echo "==========================================="
echo "Developers: SnapBanane, GamekniteC7, PlutoEdiMedi"

# Get latest commit
if git rev-parse --git-dir > /dev/null 2>&1; then
    commit=$(git log -1 --pretty=format:"%h %s")
    echo "Latest Commit: $commit"
else
    echo "Latest Commit: (git not found or not a repo)"
fi

# Count files and lines
file_count=$(find . -type f \( -name "*.js" -o -name "*.html" \) | wc -l)
lines=$(find . -type f \( -name "*.js" -o -name "*.html" \) -exec cat {} + | wc -l)

echo ".js/.html Files: $file_count"
echo "Total Lines (.js + .html): $lines"
echo "==========================================="

# Start server
echo "Starting Node.js server..."
node server.js &
server_pid=$!

sleep 2

# Open browser
if command -v xdg-open > /dev/null; then
    xdg-open http://localhost:3000
elif command -v open > /dev/null; then
    open http://localhost:3000
else
    echo "Could not detect browser opener."
fi

wait $server_pid