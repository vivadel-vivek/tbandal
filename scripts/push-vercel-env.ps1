# Push Supabase env vars into the linked Vercel project.
#
# Authentication: pass a token via $env:VERCEL_TOKEN before running.
# Tokens come from Vercel > Account > Tokens. Alternatively the script
# falls back to whatever auth `vercel` already has (stored from a prior
# `vercel login`).
#
# This script is idempotent: every var is removed (silently no-ops if
# absent) then re-added, so re-running rotates values without prompts.

$ErrorActionPreference = "Stop"
Set-Location "$PSScriptRoot\.."

if (-not $env:VERCEL_TOKEN) {
    Write-Host "VERCEL_TOKEN not set in env -- falling back to interactive auth." -ForegroundColor Yellow
}
$tokenArg = if ($env:VERCEL_TOKEN) { "--token=$env:VERCEL_TOKEN" } else { "" }
$scopeArg = "--scope=vivadelviveks-projects"

# Hosted Supabase values (project ref dnfejeqvolirzepkuncv).
$SUPABASE_URL = "https://dnfejeqvolirzepkuncv.supabase.co"
$SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuZmVqZXF2b2xpcnplcGt1bmN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwOTMwMTIsImV4cCI6MjA5MzY2OTAxMn0.TJowta3fYNO0cP8DtBGdUSrr-IC9v7IBzdtoskQbHJ4"
$SUPABASE_SERVICE = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuZmVqZXF2b2xpcnplcGt1bmN2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODA5MzAxMiwiZXhwIjoyMDkzNjY5MDEyfQ.16tsPPGbdX61H0kjVXsmx71i_SAFoVXzMk6m87stnkg"
$SITE_URL = "https://two-buds-and-a-leaf.vercel.app"
$STAGING_SWITCHER = "1"

Write-Host "Linking repo to Vercel project..." -ForegroundColor Cyan
& npx --yes vercel link --yes --project two-buds-and-a-leaf $scopeArg $tokenArg 2>&1 | Out-String | Write-Host

function Push-EnvVar {
    param([string]$Name, [string]$Value, [string]$Environment)
    Write-Host "  pushing $Name to $Environment" -ForegroundColor Gray
    # Remove any prior value (no-op if absent), then add via stdin.
    # Both calls are non-interactive when VERCEL_TOKEN is in env.
    $tok = if ($env:VERCEL_TOKEN) { "--token=$env:VERCEL_TOKEN" } else { "" }
    & cmd /c "npx --yes vercel env rm $Name $Environment --yes $tok 2>nul"
    $Value | & cmd /c "npx --yes vercel env add $Name $Environment $tok"
}

Write-Host "Pushing Production..." -ForegroundColor Cyan
Push-EnvVar -Name "NEXT_PUBLIC_SUPABASE_URL"           -Value $SUPABASE_URL      -Environment "production"
Push-EnvVar -Name "NEXT_PUBLIC_SUPABASE_ANON_KEY"      -Value $SUPABASE_ANON     -Environment "production"
Push-EnvVar -Name "SUPABASE_SERVICE_ROLE_KEY"          -Value $SUPABASE_SERVICE  -Environment "production"
Push-EnvVar -Name "NEXT_PUBLIC_SITE_URL"               -Value $SITE_URL          -Environment "production"
# DELIBERATELY not pushing NEXT_PUBLIC_STAGING_ROLE_SWITCHER to
# production. The switcher exposes test-user sign-in via the admin
# SDK; it must never ship in real prod. Add it manually via the
# Vercel dashboard if a specific production deploy needs it for QA,
# and remove before the next promotion.

Write-Host "Pushing Preview..." -ForegroundColor Cyan
Push-EnvVar -Name "NEXT_PUBLIC_SUPABASE_URL"           -Value $SUPABASE_URL      -Environment "preview"
Push-EnvVar -Name "NEXT_PUBLIC_SUPABASE_ANON_KEY"      -Value $SUPABASE_ANON     -Environment "preview"
Push-EnvVar -Name "SUPABASE_SERVICE_ROLE_KEY"          -Value $SUPABASE_SERVICE  -Environment "preview"
Push-EnvVar -Name "NEXT_PUBLIC_SITE_URL"               -Value $SITE_URL          -Environment "preview"
# Preview deploys ARE staging: switcher enabled.
Push-EnvVar -Name "NEXT_PUBLIC_STAGING_ROLE_SWITCHER"  -Value $STAGING_SWITCHER  -Environment "preview"

Write-Host "Done. Trigger a redeploy:" -ForegroundColor Green
Write-Host "  npx vercel --prod"
Write-Host "Or just push a commit; the next deploy reads the new vars."
