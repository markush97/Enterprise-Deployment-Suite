<#
.SYNOPSIS
    Logging utilities for deployment PowerShell scripts.
.DESCRIPTION
    Provides functions to log messages to a local file and to a remote backend API endpoint, with rich metadata.
#>

function Set-JobLogContext {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$false)]
        [string]$JobId,
        [Parameter(Mandatory=$false)]
        [string]$TaskId,
        [Parameter(Mandatory=$false)]
        [string]$LocalLogPath,
        [Parameter(Mandatory=$false)]
        [string]$apiUrl,
        [Parameter(Mandatory=$false)]
        [string]$DeviceToken
    )
    if (-not $Global:eds) {
        $Global:eds = [PSCustomObject]@{}
    }

    if ($PSBoundParameters.ContainsKey('JobId')) {
        if (-not ($Global:eds.PSObject.Properties.Match('jobId'))) {
            $Global:eds | Add-Member -MemberType NoteProperty -Name jobId -Value $JobId
        } else {
            # Remove and re-add to avoid SetValueInvocationException
            $Global:eds.PSObject.Properties.Remove('jobId')
            $Global:eds | Add-Member -MemberType NoteProperty -Name jobId -Value $JobId
        }
    }
    if ($PSBoundParameters.ContainsKey('TaskId')) {
        if (-not ($Global:eds.PSObject.Properties.Match('taskId'))) {
            $Global:eds | Add-Member -MemberType NoteProperty -Name taskId -Value $TaskId
        } else {
            $Global:eds.PSObject.Properties.Remove('taskId')
            $Global:eds | Add-Member -MemberType NoteProperty -Name taskId -Value $TaskId
        }
    }
    if ($PSBoundParameters.ContainsKey('LocalLogPath')) {
        if (-not ($Global:eds.PSObject.Properties.Match('localLogPath'))) {
            $Global:eds | Add-Member -MemberType NoteProperty -Name localLogPath -Value $LocalLogPath
        } else {
            $Global:eds.PSObject.Properties.Remove('localLogPath')
            $Global:eds | Add-Member -MemberType NoteProperty -Name localLogPath -Value $LocalLogPath
        }
    }
    if ($PSBoundParameters.ContainsKey('apiUrl')) {
        if (-not ($Global:eds.PSObject.Properties.Match('apiUrl'))) {
            $Global:eds | Add-Member -MemberType NoteProperty -Name apiUrl -Value $apiUrl
        } else {
            $Global:eds.PSObject.Properties.Remove('apiUrl')
            $Global:eds | Add-Member -MemberType NoteProperty -Name apiUrl -Value $apiUrl
        }
    }
    if ($PSBoundParameters.ContainsKey('DeviceToken')) {
        if (-not ($Global:eds.PSObject.Properties.Match('deviceToken'))) {
            $Global:eds | Add-Member -MemberType NoteProperty -Name deviceToken -Value $DeviceToken
        } else {
            $Global:eds.PSObject.Properties.Remove('deviceToken')
            $Global:eds | Add-Member -MemberType NoteProperty -Name deviceToken -Value $DeviceToken
        }
    }

    if ($PSBoundParameters.ContainsKey('LocalLogPath') -and $LocalLogPath) {
        $logDir = Split-Path $LocalLogPath -Parent
        if (-not (Test-Path $logDir)) {
            New-Item -Path $logDir -ItemType Directory -Force | Out-Null
        }
    }
}

function Write-EDSLog {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$false)]
        [string]$JobId = $Global:eds.jobId,
        [Parameter(Mandatory=$false)]
        [string]$TaskId = $Global:eds.taskId,
        [Parameter(Mandatory=$false)]
        [string]$LocalLogPath = $Global:eds.localLogPath,
        [Parameter(Mandatory=$false)]
        [string]$ApiUrl = $Global:eds.apiUrl,
        [Parameter(Mandatory)]
        [string]$Message,
        [Parameter(Mandatory=$false)]
        [ValidateSet('info','warn','error','success','debug')]
        [string]$Level = 'info',
        [Parameter(Mandatory=$false)]
        [hashtable]$Meta,
        [Parameter(Mandatory=$false)]
        [string]$DeviceToken = $Global:eds.deviceToken
    )

    if (-not $JobId -or -not $LocalLogPath -or -not $ApiUrl -or -not $deviceToken) {
        throw "Write-JobLog: JobId, TaskId, LocalLogPath, deviceToken and ApiUrl must be set (either as parameters or via Set-JobLogContext)."
    }

    $timestamp = (Get-Date).ToString('yyyy-MM-ddTHH:mm:ss.fffK')
    $timestampShort = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss')
    $logEntry = [PSCustomObject]@{
        timestamp = $timestamp
        level     = $Level
        message   = $Message
        meta      = $Meta
    }
    if ($TaskId -and $TaskId -ne '' -and $TaskId -ne $null) {
        $logEntry | Add-Member -MemberType NoteProperty -Name taskId -Value $TaskId
        # Write to local log file
        Add-Content -Path $LocalLogPath -Value "[$timestampShort]: [$Level@$TaskId] $message"
    } else {
        # Write to local log file
        Add-Content -Path $LocalLogPath -Value "[$timestampShort]: [$Level@==================main==============] $message"
    }

    $logLine = $logEntry | ConvertTo-Json -Compress

    Write-Host $Message

    # Send to backend (fire-and-forget, but log error if fails)
    try {
        $body = $logEntry | ConvertTo-Json -Compress
        $headers = @{ 
            'Content-Type' = 'application/json'
            'X-Device-Token'  = $deviceToken
        }
        Invoke-RestMethod -Uri "$apiUrl/jobs/$JobId/logs" -Method Post -Body $body -Headers $headers -TimeoutSec 5 | Out-Null
    } catch {
        $errMsg = "[LOGGING ERROR] Failed to send log to backend: $_"
        Add-Content -Path $LocalLogPath -Value $errMsg
        Write-Error -Message $errMsg
    }
}

Export-ModuleMember -Function *