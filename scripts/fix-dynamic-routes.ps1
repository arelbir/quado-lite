# PowerShell script to find all dynamic routes that need fixing
# Next.js 14.2.3+ requires params as Promise

Write-Host "🔍 Searching for dynamic route pages..." -ForegroundColor Cyan
Write-Host ""

# Find all [id], [slug], etc folders
$dynamicRoutes = Get-ChildItem -Path "src\app\(main)" -Recurse -Directory | 
    Where-Object { $_.Name -match '^\[.*\]$' } |
    ForEach-Object {
        $pageFile = Join-Path $_.FullName "page.tsx"
        if (Test-Path $pageFile) {
            [PSCustomObject]@{
                Folder = $_.FullName
                File = $pageFile
                RelativePath = $pageFile -replace [regex]::Escape($PWD.Path + '\'), ''
            }
        }
    }

Write-Host "📋 Found $($dynamicRoutes.Count) dynamic route pages:" -ForegroundColor Yellow
Write-Host ""

$dynamicRoutes | ForEach-Object {
    Write-Host "  📄 $($_.RelativePath)" -ForegroundColor White
}

Write-Host ""
Write-Host "🔧 Files that need fixing:" -ForegroundColor Green
Write-Host ""
Write-Host "  1. src\app\(main)\admin\users\[id]\page.tsx ✅ FIXED"
Write-Host "  2. src\app\(main)\admin\organization\companies\[id]\page.tsx ✅ FIXED"
Write-Host ""

# Check remaining files
$remaining = $dynamicRoutes | Where-Object { 
    $_.RelativePath -notmatch 'users\\\[id\]' -and 
    $_.RelativePath -notmatch 'companies\\\[id\]' 
}

Write-Host "⏳ Remaining to fix: $($remaining.Count)" -ForegroundColor Yellow
Write-Host ""

$remaining | ForEach-Object {
    Write-Host "  ⏳ $($_.RelativePath)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎯 Fix pattern:" -ForegroundColor Cyan
Write-Host @"

// FIND:
export default async function PageName({ params }: { params: { id: string } }) {
  // ... uses params.id directly

// REPLACE WITH:
export default async function PageName({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  // ... use id variable

"@ -ForegroundColor White

Write-Host ""
Write-Host "✅ Run this to test after fixes:" -ForegroundColor Green
Write-Host "  pnpm dev" -ForegroundColor White
Write-Host ""
