<#
=============================================================================
REGEX PATTERN TEST LAB - SELF-JOURNALING MULTI-PATTERN
=============================================================================
This file processes multiple patterns in sequence, tracking completion status.
Each run processes the next pending pattern.

Run: .\replace.ps1

Features:
- Reads test.html for input
- Outputs to test-{pattern-slug}.html
- Self-journals which patterns are completed
- Automatically picks next pending pattern
=============================================================================
#>

# ========== PATTERN QUEUE ==========
# Status: PENDING | RUNNING | COMPLETED | FAILED
# Add new patterns here - they will be processed in order

$PatternQueue = @(
    @{
        ID = 1
        Status = "PENDING"
        Description = "Remove SVG elements"
        Pattern = '<svg[^>]*>.*?</svg>'
        TestCases = @(
            @{
                Name = "Single SVG removal"
                Expected = "SVG should be completely removed"
            },
            @{
                Name = "Multiple SVG elements"
                Expected = "All SVG elements should be removed"
            }
        )
    },
    @{
        ID = 2
        Status = "PENDING"
        Description = "Remove H1 elements"
        Pattern = '<h1[^>]*>.*?</h1>'
        TestCases = @(
            @{
                Name = "H1 removal"
                Expected = "H1 should be completely removed"
            }
        )
    },
    @{
        ID = 3
        Status = "PENDING"
        Description = "Remove nav-item-title divs"
        Pattern = '<div[^>]*class="[^"]*nav-item-title[^"]*"[^>]*>.*?</div>'
        TestCases = @(
            @{
                Name = "Nav item title removal"
                Expected = "Div with nav-item-title class should be removed"
            }
        )
    }
)

# ========== CONFIGURATION ==========
$InputFile = "test.html"
$OutputFolder = "."
$JournalFile = "replacement-journal.txt"

# ========== HELPER FUNCTIONS ==========

function Get-Slug {
    param([string]$Text)
    
    # Extract key words from pattern for slug
    $slug = $Text -replace '<|>|/|\[|\]|\^|\*|\?|\(|\)|"', ''
    $slug = $slug -replace '\s+', '-'
    $slug = $slug.ToLower()
    $slug = $slug -replace '[^a-z0-9-]', ''
    $slug = $slug -replace '-+', '-'
    $slug = $slug.Trim('-')
    
    # Limit length
    if ($slug.Length -gt 30) {
        $slug = $slug.Substring(0, 30).TrimEnd('-')
    }
    
    return $slug
}

function Get-NextPendingPattern {
    $script:PatternQueue | Where-Object { $_.Status -eq "PENDING" } | Select-Object -First 1
}

function Update-PatternStatus {
    param(
        [int]$PatternID,
        [string]$NewStatus
    )
    
    for ($i = 0; $i -lt $script:PatternQueue.Count; $i++) {
        if ($script:PatternQueue[$i].ID -eq $PatternID) {
            $script:PatternQueue[$i].Status = $NewStatus
            break
        }
    }
}

function Write-Journal {
    param(
        [int]$PatternID,
        [string]$Status,
        [string]$Message
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $journalEntry = "$timestamp | Pattern $PatternID | $Status | $Message"
    
    Add-Content -Path $JournalFile -Value $journalEntry
}

function Save-PatternQueueState {
    # Read current script
    $scriptLines = Get-Content $PSCommandPath
    
    # Find where PatternQueue starts and ends
    $startLine = -1
    $endLine = -1
    $braceCount = 0
    $inQueue = $false
    
    for ($i = 0; $i -lt $scriptLines.Count; $i++) {
        if ($scriptLines[$i] -match '^\$PatternQueue = @\(') {
            $startLine = $i
            $inQueue = $true
            $braceCount = 1
        } elseif ($inQueue) {
            $braceCount += ([regex]::Matches($scriptLines[$i], '@\{')).Count
            $braceCount -= ([regex]::Matches($scriptLines[$i], '\}')).Count
            
            if ($scriptLines[$i] -match '^\)' -and $braceCount -eq 0) {
                $endLine = $i
                break
            }
        }
    }
    
    if ($startLine -eq -1 -or $endLine -eq -1) {
        Write-Host "Warning: Could not find PatternQueue section to update" -ForegroundColor Yellow
        return
    }
    
    # Build new PatternQueue section
    $newLines = @()
    $newLines += '$PatternQueue = @('
    
    for ($i = 0; $i -lt $script:PatternQueue.Count; $i++) {
        $pattern = $script:PatternQueue[$i]
        
        $newLines += '    @{'
        $newLines += "        ID = $($pattern.ID)"
        $newLines += "        Status = `"$($pattern.Status)`""
        $newLines += "        Description = `"$($pattern.Description)`""
        $newLines += "        Pattern = '$($pattern.Pattern)'"
        $newLines += '        TestCases = @('
        
        for ($j = 0; $j -lt $pattern.TestCases.Count; $j++) {
            $tc = $pattern.TestCases[$j]
            $newLines += '            @{'
            $newLines += "                Name = `"$($tc.Name)`""
            $newLines += "                Expected = `"$($tc.Expected)`""
            
            if ($j -lt $pattern.TestCases.Count - 1) {
                $newLines += '            },'
            } else {
                $newLines += '            }'
            }
        }
        
        $newLines += '        )'
        
        if ($i -lt $script:PatternQueue.Count - 1) {
            $newLines += '    },'
        } else {
            $newLines += '    }'
        }
    }
    
    $newLines += ')'
    
    # Replace old section with new
    $newScript = @()
    $newScript += $scriptLines[0..($startLine - 1)]
    $newScript += $newLines
    $newScript += $scriptLines[($endLine + 1)..($scriptLines.Count - 1)]
    
    # Write back
    Set-Content -Path $PSCommandPath -Value $newScript
}

# ========== MAIN EXECUTION ==========

Write-Host ("=" * 80) -ForegroundColor Cyan
Write-Host "SELF-JOURNALING PATTERN PROCESSOR" -ForegroundColor Cyan
Write-Host ("=" * 80) -ForegroundColor Cyan
Write-Host ""

# Check if input file exists
if (-not (Test-Path $InputFile)) {
    Write-Host "ERROR: Input file not found: $InputFile" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please create a test.html file with your test HTML content." -ForegroundColor Yellow
    exit 1
}

# Show pattern queue status
Write-Host "PATTERN QUEUE STATUS:" -ForegroundColor Yellow
Write-Host ""
foreach ($pattern in $PatternQueue) {
    $statusColor = switch ($pattern.Status) {
        "PENDING" { "White" }
        "RUNNING" { "Yellow" }
        "COMPLETED" { "Green" }
        "FAILED" { "Red" }
    }
    $statusDisplay = "Pattern $($pattern.ID): [$($pattern.Status)]"
    Write-Host "  $statusDisplay" -ForegroundColor $statusColor -NoNewline
    Write-Host " - $($pattern.Description)" -ForegroundColor Gray
}
Write-Host ""

# Get next pending pattern
$currentPattern = Get-NextPendingPattern

if (-not $currentPattern) {
    Write-Host "INFO: All patterns completed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Pattern Summary:" -ForegroundColor Cyan
    $completed = ($PatternQueue | Where-Object { $_.Status -eq "COMPLETED" }).Count
    $failed = ($PatternQueue | Where-Object { $_.Status -eq "FAILED" }).Count
    Write-Host "  Completed: $completed" -ForegroundColor Green
    Write-Host "  Failed: $failed" -ForegroundColor Red
    Write-Host ""
    Write-Host "To reset and start over, manually change all statuses to 'PENDING' in the script." -ForegroundColor Yellow
    exit 0
}

# Mark pattern as running
Update-PatternStatus -PatternID $currentPattern.ID -NewStatus "RUNNING"
Save-PatternQueueState

Write-Host ("=" * 80) -ForegroundColor Cyan
Write-Host "PROCESSING PATTERN $($currentPattern.ID)" -ForegroundColor Cyan
Write-Host ("=" * 80) -ForegroundColor Cyan
Write-Host ""
Write-Host "Description: $($currentPattern.Description)" -ForegroundColor Yellow
Write-Host "Pattern: $($currentPattern.Pattern)" -ForegroundColor Gray
Write-Host ""

# Read input file
$inputContent = Get-Content $InputFile -Raw
Write-Host "[1/3] Read input file: $InputFile" -ForegroundColor Green
$inputSize = $inputContent.Length
Write-Host "      Input size: $inputSize characters" -ForegroundColor Gray
Write-Host ""

# Apply pattern
Write-Host "[2/3] Applying regex pattern..." -ForegroundColor Yellow
$outputContent = [regex]::Replace($inputContent, $currentPattern.Pattern, '', [System.Text.RegularExpressions.RegexOptions]::Singleline)
Write-Host "      Replacement complete" -ForegroundColor Green
$outputSize = $outputContent.Length
Write-Host "      Output size: $outputSize characters" -ForegroundColor Gray
$diff = $inputSize - $outputSize
Write-Host "      Removed: $diff characters" -ForegroundColor Gray
Write-Host ""

# Generate output filename
$slug = Get-Slug -Text $currentPattern.Description
$outputFile = Join-Path $OutputFolder "test-$slug.html"

# Save output
Set-Content $outputFile -Value $outputContent -NoNewline
Write-Host "[3/3] Saved output file: $outputFile" -ForegroundColor Green
Write-Host ""

# Show comparison
Write-Host ("=" * 80) -ForegroundColor Cyan
Write-Host "COMPARISON" -ForegroundColor Cyan
Write-Host ("=" * 80) -ForegroundColor Cyan
Write-Host ""
Write-Host "Input file:  $InputFile" -ForegroundColor White
Write-Host "             Size: $inputSize characters" -ForegroundColor Gray
Write-Host "Output file: $outputFile" -ForegroundColor White
Write-Host "             Size: $outputSize characters" -ForegroundColor Gray
Write-Host "Difference:  $diff characters removed" -ForegroundColor $(if ($diff -gt 0) { "Green" } else { "Yellow" })
Write-Host ""

# Ask user to verify
Write-Host ("=" * 80) -ForegroundColor Magenta
Write-Host "VERIFICATION REQUIRED" -ForegroundColor Magenta
Write-Host ("=" * 80) -ForegroundColor Magenta
Write-Host ""
Write-Host "Please review the output file: $outputFile" -ForegroundColor Yellow
Write-Host ""
Write-Host "Does the output look correct?" -ForegroundColor Yellow
Write-Host "  [Y] Yes - Mark as completed and continue to next pattern" -ForegroundColor Green
Write-Host "  [N] No - Mark as failed" -ForegroundColor Red
Write-Host "  [S] Skip - Keep as pending for later" -ForegroundColor Gray
Write-Host ""

$response = Read-Host "Your choice (Y/N/S)"

switch ($response.ToUpper()) {
    "Y" {
        Update-PatternStatus -PatternID $currentPattern.ID -NewStatus "COMPLETED"
        Write-Journal -PatternID $currentPattern.ID -Status "COMPLETED" -Message "Output verified and accepted"
        Write-Host ""
        Write-Host "SUCCESS: Pattern $($currentPattern.ID) marked as COMPLETED" -ForegroundColor Green
    }
    "N" {
        Update-PatternStatus -PatternID $currentPattern.ID -NewStatus "FAILED"
        Write-Journal -PatternID $currentPattern.ID -Status "FAILED" -Message "Output verification failed"
        Write-Host ""
        Write-Host "FAILED: Pattern $($currentPattern.ID) marked as FAILED" -ForegroundColor Red
    }
    "S" {
        Update-PatternStatus -PatternID $currentPattern.ID -NewStatus "PENDING"
        Write-Journal -PatternID $currentPattern.ID -Status "SKIPPED" -Message "Skipped for later review"
        Write-Host ""
        Write-Host "SKIPPED: Pattern $($currentPattern.ID) kept as PENDING" -ForegroundColor Yellow
    }
    default {
        Update-PatternStatus -PatternID $currentPattern.ID -NewStatus "PENDING"
        Write-Host ""
        Write-Host "INFO: No valid response. Pattern kept as PENDING" -ForegroundColor Gray
    }
}

Save-PatternQueueState

Write-Host ""
Write-Host ("=" * 80) -ForegroundColor Cyan
Write-Host "NEXT STEPS" -ForegroundColor Cyan
Write-Host ("=" * 80) -ForegroundColor Cyan
Write-Host ""

$remaining = ($PatternQueue | Where-Object { $_.Status -eq "PENDING" }).Count
if ($remaining -gt 0) {
    Write-Host "Run .\replace.ps1 again to process the next pattern" -ForegroundColor Yellow
    Write-Host "Remaining patterns: $remaining" -ForegroundColor White
} else {
    Write-Host "All patterns processed!" -ForegroundColor Green
}
Write-Host ""