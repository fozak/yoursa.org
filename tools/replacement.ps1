<#
=============================================================================
REGEX PATTERN TEST LAB - SELF-DOCUMENTING
=============================================================================
This file tests regex patterns and writes results back to itself.
Run: .\replacement.ps1

Last Run: [AUTO-GENERATED]
Status: [AUTO-GENERATED]
=============================================================================
#>

# ========== TEST CASES ==========
$TestCases = @(
    @{
        Name = "Single SVG element removal"
        Description = "Remove entire SVG element with attributes"
        Input = @"
<div class="header">
    <svg fill="none" viewbox="0 0 47 16" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 10 L20 20"/>
        <circle cx="5" cy="5" r="3"/>
    </svg>
    <span>Keep this text</span>
</div>
"@
        Expected = @"
<div class="header">
    
    <span>Keep this text</span>
</div>
"@
        Notes = "Should remove entire SVG including all nested content"
    },
    @{
        Name = "Multiple SVG elements"
        Description = "Remove multiple SVG elements in same HTML"
        Input = @"
<div>
    <svg fill="none" viewbox="0 0 47 16" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 10"/>
    </svg>
    <p>Middle content</p>
    <svg fill="red" viewbox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="50" height="50"/>
    </svg>
    <span>End content</span>
</div>
"@
        Expected = @"
<div>
    
    <p>Middle content</p>
    
    <span>End content</span>
</div>
"@
        Notes = "Should remove all SVG elements while preserving other HTML"
    },
    @{
        Name = "SVG on single line"
        Description = "Handle SVG elements without line breaks"
        Input = @"
<div><svg fill="none" viewbox="0 0 47 16" xmlns="http://www.w3.org/2000/svg"><path d="M10 10"/></svg><span>text</span></div>
"@
        Expected = @"
<div><span>text</span></div>
"@
        Notes = "Should work on single-line SVG elements"
    },
    @{
        Name = "SVG with various attributes"
        Description = "Different attribute combinations"
        Input = @"
<svg class="icon" width="24" height="24" fill="none" viewbox="0 0 47 16" xmlns="http://www.w3.org/2000/svg" data-id="test">
    <g><path d="M5 5"/></g>
</svg>
<p>Keep</p>
"@
        Expected = @"

<p>Keep</p>
"@
        Notes = "Should handle SVG with multiple different attributes"
    }
)

# ========== REGEX PATTERN ==========
$Pattern = '<svg[^>]*>.*?</svg>'
$Flags = 'Singleline' # Equivalent to 's' flag in regex

# ========== EXECUTION CODE ==========
function Run-Tests {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $results = @()
    $allPassed = $true
    
    Write-Host ("=" * 80) -ForegroundColor Cyan
    Write-Host "RUNNING TESTS - $timestamp" -ForegroundColor Cyan
    Write-Host ("=" * 80) -ForegroundColor Cyan
    Write-Host ""
    
    for ($i = 0; $i -lt $TestCases.Count; $i++) {
        $test = $TestCases[$i]
        $testNum = $i + 1
        
        Write-Host "Test ${testNum}: $($test.Name)" -ForegroundColor Yellow
        Write-Host "  Description: $($test.Description)"
        Write-Host "  Notes: $($test.Notes)"
        
        # Apply regex replacement
        $actual = $test.Input -replace $Pattern, ''
        
        # Compare results (trim to ignore whitespace differences)
        $passed = ($actual.Trim() -eq $test.Expected.Trim())
        $allPassed = $allPassed -and $passed
        
        if ($passed) {
            Write-Host "  Result: PASS [OK]" -ForegroundColor Green
        } else {
            Write-Host "  Result: FAIL [X]" -ForegroundColor Red
            Write-Host "  Expected:" -ForegroundColor Gray
            Write-Host $test.Expected -ForegroundColor Gray
            Write-Host "  Actual:" -ForegroundColor Gray
            Write-Host $actual -ForegroundColor Gray
        }
        Write-Host ""
        
        # Store result
        $results += @{
            TestNumber = $testNum
            Name = $test.Name
            Description = $test.Description
            Passed = $passed
            Input = $test.Input
            Expected = $test.Expected
            Actual = $actual
            Notes = $test.Notes
        }
    }
    
    Write-Host ("=" * 80) -ForegroundColor Cyan
    Write-Host "SUMMARY" -ForegroundColor Cyan
    Write-Host ("=" * 80) -ForegroundColor Cyan
    $passCount = ($results | Where-Object { $_.Passed }).Count
    Write-Host "Total Tests: $($results.Count)"
    Write-Host "Passed: $passCount" -ForegroundColor Green
    Write-Host "Failed: $($results.Count - $passCount)" -ForegroundColor Red
    $statusText = if ($allPassed) { 'ALL PASSED [OK]' } else { 'SOME FAILED [X]' }
    $statusColor = if ($allPassed) { 'Green' } else { 'Red' }
    Write-Host "Status: $statusText" -ForegroundColor $statusColor
    Write-Host ""
    
    return @{
        Timestamp = $timestamp
        AllPassed = $allPassed
        Results = $results
        PassCount = $passCount
        FailCount = $results.Count - $passCount
    }
}

function Write-ResultsToFile {
    param($TestResults)
    
    # Generate AI-readable report
    $statusText = if ($TestResults.AllPassed) { 'ALL TESTS PASSED [OK]' } else { 'SOME TESTS FAILED [X]' }
    
    $report = @"


"@

    # Read current file
    $currentContent = Get-Content $PSCommandPath -Raw
    
    # Remove old results if they exist
    if ($currentContent -match '(?s)') {
        $currentContent = $currentContent -replace '(?s)', ''
    }
    
    # Append new results
    $newContent = $currentContent.TrimEnd() + "`n" + $report
    
    # Write back to file
    Set-Content $PSCommandPath -Value $newContent -NoNewline
    
    Write-Host "Results written to this file. Scroll down to see report." -ForegroundColor Cyan
    Write-Host "You can now copy this entire file and share with AI for analysis." -ForegroundColor Cyan
}

# ========== RUN TESTS ==========
$testResults = Run-Tests
Write-ResultsToFile -TestResults $testResults

# ========== RIPGREP COMMAND REFERENCE ==========
Write-Host ""
Write-Host ("=" * 80) -ForegroundColor Magenta
Write-Host "RIPGREP COMMAND FOR ACTUAL FILES" -ForegroundColor Magenta
Write-Host ("=" * 80) -ForegroundColor Magenta
Write-Host ""
Write-Host "Once tests pass, use this command to apply to real files:" -ForegroundColor Yellow
Write-Host ""
Write-Host @"
rg -l '<svg' --type html | ForEach-Object {
    `$content = Get-Content `$_ -Raw
    `$content = `$content -replace '$Pattern', ''
    Set-Content `$_ -Value `$content -NoNewline
}
"@ -ForegroundColor Green
Write-Host ""
Write-Host "This will:" -ForegroundColor Yellow
Write-Host "  1. Find all HTML files containing '<svg'" -ForegroundColor Gray
Write-Host "  2. Remove all SVG elements from each file" -ForegroundColor Gray
Write-Host "  3. Save files back in place" -ForegroundColor Gray
Write-Host ""

# ========== BEGIN AUTO-GENERATED RESULTS ==========
# Last Run: 2025-12-28 11:49:33
# Overall Status: SOME TESTS FAILED [X]
# Total Tests: 4
# Passed: 8
# Failed: -4
# Pattern Used: <svg[^>]*>.*?</svg>
# Flags: Singleline
#
# -----------------------------------------------------------------------------
# DETAILED RESULTS
# -----------------------------------------------------------------------------
# TEST 1: Single SVG element removal
# Status: FAIL [X]
# Description: Remove entire SVG element with attributes
# Notes: Should remove entire SVG including all nested content
## --- EXPECTED ---
<div class="header">
    
    <span>Keep this text</span>
</div>
#
# --- ACTUAL ---
<div class="header">
    <svg fill="none" viewbox="0 0 47 16" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 10 L20 20"/>
        <circle cx="5" cy="5" r="3"/>
    </svg>
    <span>Keep this text</span>
</div>
#
# --- INPUT ---
<div class="header">
    <svg fill="none" viewbox="0 0 47 16" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 10 L20 20"/>
        <circle cx="5" cy="5" r="3"/>
    </svg>
    <span>Keep this text</span>
</div>
#
# -----------------------------------------------------------------------------
# TEST 2: Multiple SVG elements
# Status: FAIL [X]
# Description: Remove multiple SVG elements in same HTML
# Notes: Should remove all SVG elements while preserving other HTML
## --- EXPECTED ---
<div>
    
    <p>Middle content</p>
    
    <span>End content</span>
</div>
#
# --- ACTUAL ---
<div>
    <svg fill="none" viewbox="0 0 47 16" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 10"/>
    </svg>
    <p>Middle content</p>
    <svg fill="red" viewbox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="50" height="50"/>
    </svg>
    <span>End content</span>
</div>
#
# --- INPUT ---
<div>
    <svg fill="none" viewbox="0 0 47 16" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 10"/>
    </svg>
    <p>Middle content</p>
    <svg fill="red" viewbox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="50" height="50"/>
    </svg>
    <span>End content</span>
</div>
#
# -----------------------------------------------------------------------------
# TEST 3: SVG on single line
# Status: PASS [OK]
# Description: Handle SVG elements without line breaks
# Notes: Should work on single-line SVG elements
## [OK] Output matches expected result
#
# -----------------------------------------------------------------------------
# TEST 4: SVG with various attributes
# Status: FAIL [X]
# Description: Different attribute combinations
# Notes: Should handle SVG with multiple different attributes
## --- EXPECTED ---

<p>Keep</p>
#
# --- ACTUAL ---
<svg class="icon" width="24" height="24" fill="none" viewbox="0 0 47 16" xmlns="http://www.w3.org/2000/svg" data-id="test">
    <g><path d="M5 5"/></g>
</svg>
<p>Keep</p>
#
# --- INPUT ---
<svg class="icon" width="24" height="24" fill="none" viewbox="0 0 47 16" xmlns="http://www.w3.org/2000/svg" data-id="test">
    <g><path d="M5 5"/></g>
</svg>
<p>Keep</p>
#
# -----------------------------------------------------------------------------
# ========== AI EVALUATION GUIDE ==========
# Please analyze:
# 1. Are all test cases passing?
# 2. If any fail, what is the root cause?
# 3. Does the regex pattern '<svg[^>]*>.*?</svg>' need adjustment?
# 4. Are there edge cases not covered?
# 5. Should the pattern be more specific or more general?
#
# ========== END AUTO-GENERATED RESULTS ==========