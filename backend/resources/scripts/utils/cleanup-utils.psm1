function New-CleanupScript {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [string]$TargetPath = "C:\Temp\setup-cleanup.ps1"
    )

    # Ensure the target directory exists
    $targetDir = Split-Path $TargetPath -Parent
    if (-not (Test-Path $targetDir)) {
        New-Item -Path $targetDir -ItemType Directory -Force | Out-Null
    }

    # Define the cleanup script content
    $cleanupScript = @'
# Cleanup script for cwi-imaging user and related folders

# Remove Panther and Setup folders
Remove-Item -Path "C:\Windows\Panther" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "C:\Windows\Setup" -Recurse -Force -ErrorAction SilentlyContinue

# Remove the cwi-imaging user account
try {
    Remove-LocalUser -Name "cwi-imaging" -ErrorAction SilentlyContinue
} catch {
    Write-Host "User account 'cwi-imaging' could not be removed or does not exist."
}

# Remove the cwi-imaging user profile
Get-CimInstance -ClassName Win32_UserProfile | Where-Object { $_.LocalPath -like "C:\Users\cwi-imaging" } | Remove-CimInstance -Confirm:$false -ErrorAction SilentlyContinue

# Remove the home directory if it still exists
$homeDir = "C:\Users\cwi-imaging"
if (Test-Path $homeDir) {
    Remove-Item -Path $homeDir -Recurse -Force -ErrorAction SilentlyContinue
}

# Self-delete this script after execution
$myPath = $MyInvocation.MyCommand.Path
Start-Sleep -Seconds 1
Start-Process cmd.exe "/c timeout 2 & del `"$myPath`"" -WindowStyle Hidden

'@

    # Write the script to the target location
    Set-Content -Path $TargetPath -Value $cleanupScript -Encoding UTF8

    Write-Host "Cleanup script created at $TargetPath"
}

Export-ModuleMember -Function New-CleanupScript