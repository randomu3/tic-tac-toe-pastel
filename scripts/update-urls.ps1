# Script to update tuna URLs everywhere
param(
    [Parameter(Mandatory=$true)]
    [string]$FrontendUrl,
    
    [Parameter(Mandatory=$true)]
    [string]$BackendUrl
)

$BotToken = $env:BOT_TOKEN
if (-not $BotToken) {
    Write-Host "Error: BOT_TOKEN environment variable is not set" -ForegroundColor Red
    exit 1
}

Write-Host "Updating URLs..." -ForegroundColor Cyan
Write-Host "Frontend: $FrontendUrl"
Write-Host "Backend: $BackendUrl"

# Update telegramService.ts
$telegramService = Get-Content "services/telegramService.ts" -Raw
$telegramService = $telegramService -replace "const API_URL = '[^']+';", "const API_URL = '$BackendUrl';"
Set-Content "services/telegramService.ts" $telegramService
Write-Host "Updated services/telegramService.ts" -ForegroundColor Green

# Update server config
$serverConfig = Get-Content "server/src/config.ts" -Raw
$serverConfig = $serverConfig -replace "webappUrl: process\.env\.WEBAPP_URL \|\| '[^']+',", "webappUrl: process.env.WEBAPP_URL || '$FrontendUrl',"
$serverConfig = $serverConfig -replace "backendUrl: process\.env\.BACKEND_URL \|\| '[^']+',", "backendUrl: process.env.BACKEND_URL || '$BackendUrl',"
Set-Content "server/src/config.ts" $serverConfig
Write-Host "Updated server/src/config.ts" -ForegroundColor Green

# Update Telegram webhook
Write-Host "Setting Telegram webhook..." -ForegroundColor Cyan
$webhookBody = @{url="$BackendUrl/webhook"} | ConvertTo-Json
Invoke-RestMethod -Uri "https://api.telegram.org/bot$BotToken/setWebhook" -Method Post -ContentType "application/json" -Body $webhookBody | Out-Null
Write-Host "Webhook set to $BackendUrl/webhook" -ForegroundColor Green

# Update Mini App menu button
Write-Host "Setting Mini App URL..." -ForegroundColor Cyan
$menuBody = @{menu_button=@{type="web_app";text="Play Game";web_app=@{url=$FrontendUrl}}} | ConvertTo-Json -Depth 3
Invoke-RestMethod -Uri "https://api.telegram.org/bot$BotToken/setChatMenuButton" -Method Post -ContentType "application/json" -Body $menuBody | Out-Null
Write-Host "Mini App URL set to $FrontendUrl" -ForegroundColor Green

Write-Host "`nAll URLs updated!" -ForegroundColor Green
