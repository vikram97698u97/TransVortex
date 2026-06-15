# PowerShell script to fix diesel expense display in trip-expenses.html
# This makes the Diesel column show cost of fuel USED instead of purchased

$filePath = "c:\Users\Dell\OneDrive\Desktop\New folder\trip-expenses.html"
$backupPath = "c:\Users\Dell\OneDrive\Desktop\New folder\trip-expenses.backup.html"

# Create backup
Write-Host "Creating backup at $backupPath..."
Copy-Item $filePath $backupPath -Force

# Read file content
$content = Get-Content $filePath -Raw

# First replacement: Add dieselForCalc logic and use it in totalExpenses
$oldPattern1 = [regex]::Escape("    function processLRDataForExpenses() {`r`n      tripExpensesData = lrData.map(lr => {`r`n        // Calculate total expenses (main trip only)`r`n        const totalExpenses = `r`n          (parseFloat(lr.tyreExpenses) || 0) +`r`n          (parseFloat(lr.dieselExpenses) || 0) +")

$newText1 = @"
    function processLRDataForExpenses() {
      tripExpensesData = lrData.map(lr => {
        // Prefer cost of fuel USED from fuelTracking; fallback to purchase total
        const fuelUsedAmount = lr.fuelTracking && lr.fuelTracking.fuelUsedAmountINR
          ? parseFloat(lr.fuelTracking.fuelUsedAmountINR) : 0;
        const dieselPurchaseTotal = (lr.dieselPurchaseAmount !== undefined)
          ? (parseFloat(lr.dieselPurchaseAmount) || 0)
          : (parseFloat(lr.dieselExpenses) || 0);
        const dieselForCalc = fuelUsedAmount > 0 ? fuelUsedAmount : dieselPurchaseTotal;
        // Calculate total expenses (main trip only)
        const totalExpenses = 
          (parseFloat(lr.tyreExpenses) || 0) +
          dieselForCalc +
"@

$content = $content -replace $oldPattern1, $newText1

# Second replacement: Use dieselForCalc in returned object
$oldPattern2 = [regex]::Escape("          dieselExpenses: parseFloat(lr.dieselExpenses) || 0,")
$newText2 = "          dieselExpenses: dieselForCalc,"

$content = $content -replace $oldPattern2, $newText2

# Write back
Set-Content $filePath $content -NoNewline

Write-Host "✓ Successfully updated trip-expenses.html"
Write-Host "✓ Backup saved at $backupPath"
Write-Host ""
Write-Host "Changes applied:"
Write-Host "  - Diesel expenses now show cost of fuel USED (from fuelTracking.fuelUsedAmountINR)"
Write-Host "  - Falls back to purchase total for older LRs without fuel tracking"
