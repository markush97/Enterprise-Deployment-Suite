# Import all util Modules
Get-ChildItem -Path $PSScriptRoot\utils -Filter *.psm1 | ForEach-Object {
    Import-Module $_.FullName -Force
}

# Loading Job-Configuration
$eds = Read-Config -Path "$PSScriptRoot\job.json"

# Setup Logging Contet
Set-JobLogContext -JobId $eds.jobId -LocalLogPath $eds.localLogPath -BackendUrl $eds.backendUrl

Write-EDSLog -Level info -Message "Config loaded successfully. Starting Automated enrollment..."

$installerParams =  Get-InstallerParams

$assetTag = $installerParams.AssetTag | Select-Object -First 1
$installedBy = $installerParams.InstalledBy | Select-Object -First 1



# Execute tasks
Get-ChildItem -Path . -Recurse -Filter 'install.ps1' | ForEach-Object {
    if ($_.FullName -eq "C:\CWI\Windows\install.ps1") {
        return
    }

    $taskFolder = Split-Path $_.Directory -Leaf
    Write-EDSLog -Level info -Message "Preparing to execute install script for task: $taskFolder"
    try {
        Set-JobLogContext -JobId $eds.jobId -LocalLogPath $eds.localLogPath -BackendUrl $eds.backendUrl -TaskId $taskFolder
        Write-EDSLog -Level info -Message "Set log context for task: $taskFolder"
    } catch {
        Write-EDSLog -Level error -Message "Failed to set log context for task ${taskFolder}: $_"
    }

    Write-Host "Executing: $($_.FullName)"
    try {
        try {
            cd $_.Directory
        } catch {
            Write-EDSLog -Level error -Message "Failed to change directory to $($_.Directory): $_"
            throw
        }
        try {
            . $_.FullName
            Write-EDSLog -Level info -Message "Successfully executed $($_.FullName)"
        } catch {
            Write-EDSLog -Level error -Message "Error executing $($_.FullName): $_"
            throw
        }
        try {
            cd "C:\CWI\Windows"
        } catch {
            Write-EDSLog -Level error -Message "Failed to change directory back to C:\CWI\Windows: $_"
        }
    } catch {
        Write-Host "Error executing $($_.FullName): $_"
    }
}

Write-EDSLog -Level info -Message "Uploading System information..."

# Collect system info
$sysInfo = Get-SystemInformation | ConvertTo-Json -Depth 5
$headers = @{
    "Content-Type"    = "application/json"
    "X-Device-Token"  = $deviceToken
}

# Upload JSON data to API
try {
    Invoke-RestMethod -Uri "$uri/devices/info" -Method PUT -Headers $headers -Body $sysInfo
    Write-EDSLog -Level info -Message "System info successfully uploaded."
    Invoke-RestMethod -Uri "$uri/jobs/notify/$jobId`?jobStatus=done" -Method POST -Headers $headers

    #Remove-Item -Path "C:\Windows\Panther" -Recurse -Force -ErrorAction SilentlyContinue
    #Remove-Item -Path "C:\Windows\Setup" -Recurse -Force -ErrorAction SilentlyContinue	

    # Final reboot to apply changes
    #Restart-Computer -Force
}
catch {
    Write-EDSLog -Level error -Message "Failed to upload system information: $_"
}
