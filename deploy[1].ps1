# Deploy Museum site to GitHub Pages
# Run after: gh auth login

$ErrorActionPreference = "Stop"
$repoName = "frankincense-museum"

Write-Host "Checking GitHub login..." -ForegroundColor Cyan
gh auth status
if ($LASTEXITCODE -ne 0) {
    Write-Host "Please run first: gh auth login" -ForegroundColor Yellow
    exit 1
}

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

Write-Host "Creating public repo: $repoName ..." -ForegroundColor Cyan
gh repo create $repoName --public --source=. --remote=origin --push --description "Museum of the Land of Frankincense - Salalah, Oman"

Write-Host "Enabling GitHub Pages..." -ForegroundColor Cyan
gh api repos/{owner}/$repoName/pages -X POST -f "build_type=workflow" 2>$null
gh workflow run "Deploy static content to Pages" 2>$null

$owner = (gh api user -q .login)
$url = "https://$owner.github.io/$repoName/"
Write-Host ""
Write-Host "Done! Site will be live in 1-3 minutes at:" -ForegroundColor Green
Write-Host $url
Write-Host "Repository: https://github.com/$owner/$repoName" -ForegroundColor Green
