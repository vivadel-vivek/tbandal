# Push Supabase env vars into the linked Vercel project.
#
# One-time setup (you run this manually, browser auth flow):
#   npx vercel login
#
# Then run this script. It links the repo to the Vercel project (idempotent)
# and pushes the three Supabase keys into Production + Preview, overwriting
# any prior values.
#
# Why a script: `vercel env add` is interactive — reads the value from stdin
# and prompts on conflict. We pipe the values through and pass --force so
# the run is non-interactive end-to-end after the initial login.

$ErrorActionPreference = "Stop"
Set-Location "$PSScriptRoot\.."

# Hosted Supabase values (project ref dnfejeqvolirzepkuncv).
$SUPABASE_URL = "https://dnfejeqvolirzepkuncv.supabase.co"
$SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuZmVqZXF2b2xpcnplcGt1bmN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwOTMwMTIsImV4cCI6MjA5MzY2OTAxMn0.TJowta3fYNO0cP8DtBGdUSrr-IC9v7IBzdtoskQbHJ4"
$SUPABASE_SERVICE = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuZmVqZXF2b2xpcnplcGt1bmN2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODA5MzAxMiwiZXhwIjoyMDkzNjY5MDEyfQ.16tsPPGbdX61H0kjVXsmx71i_SAFoVXzMk6m87stnkg"
$SITE_URL = "https://two-buds-and-a-leaf.vercel.app"

Write-Host "Linking repo to Vercel project..." -ForegroundColor Cyan
npx --yes vercel link --yes 2>&1 | Out-String | Write-Host

function Push-EnvVar {
    param([string]$Name, [string]$Value, [string]$Environment)
    Write-Host "  pushing $Name → $Environment" -ForegroundColor Gray
    # Remove any prior value (no-op if absent), then add. The remove
    # uses `--yes` to skip the confirmation prompt.
    & cmd /c "npx --yes vercel env rm $Name $Environment --yes 2>nul"
    $Value | & cmd /c "npx --yes vercel env add $Name $Environment"
}

Write-Host "`nPushing Production..." -ForegroundColor Cyan
Push-EnvVar -Name "NEXT_PUBLIC_SUPABASE_URL"      -Value $SUPABASE_URL     -Environment "production"
Push-EnvVar -Name "NEXT_PUBLIC_SUPABASE_ANON_KEY" -Value $SUPABASE_ANON    -Environment "production"
Push-EnvVar -Name "SUPABASE_SERVICE_ROLE_KEY"     -Value $SUPABASE_SERVICE -Environment "production"
Push-EnvVar -Name "NEXT_PUBLIC_SITE_URL"          -Value $SITE_URL         -Environment "production"

Write-Host "`nPushing Preview..." -ForegroundColor Cyan
Push-EnvVar -Name "NEXT_PUBLIC_SUPABASE_URL"      -Value $SUPABASE_URL     -Environment "preview"
Push-EnvVar -Name "NEXT_PUBLIC_SUPABASE_ANON_KEY" -Value $SUPABASE_ANON    -Environment "preview"
Push-EnvVar -Name "SUPABASE_SERVICE_ROLE_KEY"     -Value $SUPABASE_SERVICE -Environment "preview"
Push-EnvVar -Name "NEXT_PUBLIC_SITE_URL"          -Value $SITE_URL         -Environment "preview"

Write-Host "`nDone. Trigger a redeploy:" -ForegroundColor Green
Write-Host "  npx vercel --prod"
Write-Host "Or just push a commit — the next deploy reads the new vars."
