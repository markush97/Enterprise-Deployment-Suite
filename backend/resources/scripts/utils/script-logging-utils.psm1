<#
.SYNOPSIS
    Logging utilities for deployment PowerShell scripts.
.DESCRIPTION
    Provides functions to log messages to a local file and to a remote backend API endpoint, with rich metadata.
#>

function Set-JobLogContext {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [string]$JobId,
        [Parameter(Mandatory)]
        [string]$TaskId,
        [Parameter(Mandatory)]
        [string]$LocalLogPath,
        [Parameter(Mandatory)]
        [string]$BackendUrl
    )
    $Global:eds = [PSCustomObject]@{
        jobId        = $JobId
        taskId       = $TaskId
        localLogPath = $LocalLogPath
        backendUrl   = $BackendUrl
    }
}

function Write-JobLog {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$false)]
        [string]$JobId = $Global:eds.jobId,
        [Parameter(Mandatory=$false)]
        [string]$TaskId = $Global:eds.taskId,
        [Parameter(Mandatory=$false)]
        [string]$LocalLogPath = $Global:eds.localLogPath,
        [Parameter(Mandatory=$false)]
        [string]$BackendUrl = $Global:eds.backendUrl,
        [Parameter(Mandatory)]
        [string]$Message,
        [Parameter(Mandatory=$false)]
        [ValidateSet('info','warn','error','success','debug')]
        [string]$Level = 'info',
        [Parameter()]
        [hashtable]$Meta
    )

    if (-not $JobId -or -not $TaskId -or -not $LocalLogPath -or -not $BackendUrl) {
        throw "Write-JobLog: JobId, TaskId, LocalLogPath, and BackendUrl must be set (either as parameters or via Set-JobLogContext)."
    }

    $timestamp = (Get-Date).ToString('yyyy-MM-ddTHH:mm:ss.fffK')
    $logEntry = [PSCustomObject]@{
        timestamp = $timestamp
        jobId     = $JobId
        taskId    = $TaskId
        level     = $Level
        message   = $Message
        meta      = $Meta
    }
    $logLine = $logEntry | ConvertTo-Json -Compress

    # Write to local log file
    Add-Content -Path $LocalLogPath -Value $logLine

    # Send to backend (fire-and-forget, but log error if fails)
    try {
        $body = $logEntry | ConvertTo-Json -Compress
        $headers = @{ 'Content-Type' = 'application/json' }
        Invoke-RestMethod -Uri "$BackendUrl/jobs/$JobId/logs" -Method Post -Body $body -Headers $headers -TimeoutSec 5 | Out-Null
    } catch {
        $errMsg = "[LOGGING ERROR] Failed to send log to backend: $_"
        Add-Content -Path $LocalLogPath -Value $errMsg
    }
}

Export-ModuleMember -Function Write-JobLog,Set-JobLogContext