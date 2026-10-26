# Pennywise Day 1 + Day 2 -- run from the project root (folder with package.json)
# Usage:  powershell -ExecutionPolicy Bypass -File .\day1-cleanup.ps1

$junk = @('findstr', 'npm', 'setShowBalance(!showBalance)}', 'src.rar', 'src-tree.txt')
foreach ($f in $junk) {
  if (Test-Path -LiteralPath $f) {
    git rm -f --cached -- "$f" 2>$null
    Remove-Item -LiteralPath $f -Force
    Write-Host "removed $f"
  }
}
if (Test-Path -LiteralPath 'coverage') {
  git rm -r -f --cached -- coverage 2>$null
  Remove-Item -LiteralPath 'coverage' -Recurse -Force
  Write-Host "removed coverage/"
}

Copy-Item -Force "$PSScriptRoot\.gitignore"   .\.gitignore
Copy-Item -Force "$PSScriptRoot\.env.example" .\.env.example

git add -A
git commit -m "chore: remove junk files, fix .gitignore, add .env.example"

# Day 2: test fixes (pennywise-test-fixes.patch must be in the project root)
if (Test-Path .\pennywise-test-fixes.patch) {
  git apply .\pennywise-test-fixes.patch
  npm test -- --run
}
