# Mass Login Verification Script
# Tests all 2500 students and 50 staff accounts

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  MASS ACCOUNT VERIFICATION (2550 accounts)" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000"
$successCount = 0
$failCount = 0
$failedAccounts = @()

# Function to test login
function Test-Login {
    param (
        [string]$email,
        [string]$password,
        [string]$accountType
    )
    
    try {
        $body = @{
            email    = $email
            password = $password
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $body -ContentType 'application/json' -ErrorAction Stop
        
        if ($response.access_token) {
            return @{ Success = $true; Message = "OK" }
        }
        else {
            return @{ Success = $false; Message = "No token in response" }
        }
    }
    catch {
        return @{ Success = $false; Message = $_.Exception.Message }
    }
}

# Test all 50 staff accounts
Write-Host "[1/2] Testing 50 Staff Accounts..." -ForegroundColor Yellow
Write-Host "Progress: " -NoNewline

for ($i = 0; $i -lt 50; $i++) {
    $email = "staff_$i@university.edu"
    $result = Test-Login -email $email -password "password" -accountType "Staff"
    
    if ($result.Success) {
        $successCount++
        Write-Host "." -NoNewline -ForegroundColor Green
    }
    else {
        $failCount++
        $failedAccounts += @{
            Email = $email
            Type  = "Staff"
            Error = $result.Message
        }
        Write-Host "X" -NoNewline -ForegroundColor Red
    }
    
    # Progress indicator every 10 accounts
    if (($i + 1) % 10 -eq 0) {
        Write-Host " [$($i + 1)/50]" -NoNewline -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "Staff accounts tested: $successCount succeeded, $failCount failed" -ForegroundColor $(if ($failCount -eq 0) { "Green" } else { "Yellow" })
Write-Host ""

# Test all 2500 student accounts
Write-Host "[2/2] Testing 2500 Student Accounts (this will take a few minutes)..." -ForegroundColor Yellow
Write-Host "Progress: " -NoNewline

$batchSize = 100
for ($i = 0; $i -lt 2500; $i++) {
    $email = "std_$i@university.edu"
    $result = Test-Login -email $email -password "password" -accountType "Student"
    
    if ($result.Success) {
        $successCount++
        if ($i % $batchSize -eq 0) {
            Write-Host "." -NoNewline -ForegroundColor Green
        }
    }
    else {
        $failCount++
        $failedAccounts += @{
            Email = $email
            Type  = "Student"
            Error = $result.Message
        }
        Write-Host "X" -NoNewline -ForegroundColor Red
    }
    
    # Progress indicator every 500 accounts
    if (($i + 1) % 500 -eq 0) {
        Write-Host " [$($i + 1)/2500]" -NoNewline -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host ""

# Final Report
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  VERIFICATION COMPLETE" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Total Accounts Tested: 2550" -ForegroundColor White
Write-Host "Successful Logins:     $successCount" -ForegroundColor Green
Write-Host "Failed Logins:         $failCount" -ForegroundColor $(if ($failCount -eq 0) { "Green" } else { "Red" })
Write-Host ""

if ($failCount -eq 0) {
    Write-Host "✅ ALL ACCOUNTS WORKING PERFECTLY!" -ForegroundColor Green
    Write-Host "   - All 50 staff accounts can login" -ForegroundColor Green
    Write-Host "   - All 2500 student accounts can login" -ForegroundColor Green
}
else {
    Write-Host "⚠️ SOME ACCOUNTS FAILED" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Failed Accounts:" -ForegroundColor Red
    foreach ($failed in $failedAccounts) {
        Write-Host "  - $($failed.Email) ($($failed.Type)): $($failed.Error)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Success Rate: $([math]::Round(($successCount / 2550) * 100, 2))%" -ForegroundColor White
Write-Host "=============================================" -ForegroundColor Cyan
