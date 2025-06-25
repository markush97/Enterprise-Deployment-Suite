$basePath = Split-Path -Parent $PSScriptRoot
$localConfigFolder = "C:\ProgramData\CWI"

# Import all util Modules
Write-Host "Importing utility modules..."
Get-ChildItem -Path $PSScriptRoot\utils -Filter *.psm1 | ForEach-Object {
    Write-Host "Importing module: $($_.Name)"
    Import-Module $_.FullName -Force
}
Write-Host "Utility modules imported successfully `n"

# Loading Job-Configuration
$eds = Read-Config -Path $(Join-Path $PSScriptRoot "job.json")

$installerParams =  Get-InstallerParams

$assetTag = $installerParams.AssetTag | Select-Object -First 1
$installedBy = $installerParams.InstalledBy | Select-Object -First 1
$deviceToken = $installerParams.DeviceToken | Select-Object -First 1

# Setup Logging Context
Set-JobLogContext -JobId $eds.jobId -LocalLogPath $eds.localLogPath -ApiUrl $eds.apiUrl -DeviceToken $deviceToken -TaskId $null
$apiUrl = $eds.apiUrl

Write-EDSLog -Level info -Message "Config loaded successfully. Starting Automated enrollment..."

$localDeviceConfig = @{
    assetTag = $assetTag
    installedBy = $installedBy
    jobId = $eds.jobId
    deviceId = $eds.deviceId
    apiUrl = $eds.apiUrl
}

Set-DeviceConfig -DeviceConfig $eds -ConfigFolder $localConfigFolder
Set-DeviceToken -DeviceToken $deviceToken -ConfigFolder $localConfigFolder

Write-EDSLog -Level info -Message "Starting automated enrollment with jobId: ${$eds.jobId}"

# Execute tasks
Get-ChildItem -Path $basePath -Recurse -Filter 'install.ps1' | ForEach-Object {
    $taskConfig = Read-Config -Path $(Join-Path $_.Directory.FullName "task.json")
    $taskId = $taskConfig.taskId
    $taskName = $taskConfig.taskName
    Write-EDSLog -Level info -Message "Preparing to execute install script for task: '$taskName' (ID: $taskId)"

    Set-JobLogContext -TaskId $taskId

    Write-EDSLog -Level info -Message "Executing ''$taskName''"
    try {
        $installFile = Join-Path $_.Directory.FullName "install.ps1"
        $verifyFile = Join-Path $_.Directory.FullName "verify.ps1"

        try {
            cd $_.Directory
        } catch {
            Write-EDSLog -Level error -Message "Failed to change directory to $($_.Directory): $_"
            throw
        }
        try {
            . $installFile
            Write-EDSLog -Level info -Message "Successfully executed $installFile"
        } catch {
            Write-EDSLog -Level error -Message "Error executing $installFile"
            throw
        }
        Start-Sleep -Seconds 1
        try {
            . $verifyFile
            Write-EDSLog -Level info -Message "Successfully executed $verifyFile"
        } catch {
            Write-EDSLog -Level error -Message "Error executing $verifyFile"
            throw
        }
        try {
            cd $basePath
        } catch {
            Write-EDSLog -Level error -Message "Failed to change directory back to ${basePath}: $_"
        }
    } catch {
        Write-Host "Error executing '$taskName': $_"
    }
}

Set-JobLogContext -TaskId $null
Write-EDSLog -Level info -Message "All tasks executed successfully."
Write-EDSLog -Level info -Message "Uploading System information..."

# Collect system info
$sysInfo = Get-SystemInformation -ConfigFolder $localConfigFolder | ConvertTo-Json -Depth 5
$headers = @{
    "Content-Type"    = "application/json"
    "X-Device-Token"  = $deviceToken
}

# Upload JSON data to API
try {
    Invoke-RestMethod -Uri "$apiUrl/devices/info" -Method PUT -Headers $headers -Body $sysInfo
    Write-EDSLog -Level info -Message "System info successfully uploaded."
    Invoke-RestMethod -Uri "$apiUrl/jobs/notify/$jobId`?jobStatus=done" -Method POST -Headers $headers

    New-CleanupScript -TargetPath "C:\CWI\setup-cleanup.ps1"

    # Final reboot to apply changes
    Write-EDSLog -Level info -Message "System setup completed. Restarting computer to apply changes..."
    # Restart-Computer -Force
}
catch {
    Write-EDSLog -Level error -Message "Failed to upload system information: $_"
}
