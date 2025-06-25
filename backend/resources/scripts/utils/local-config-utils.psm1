function Set-DeviceToken {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$DeviceToken,
        [Parameter(Mandatory=$false)]
        [string]$ConfigFolder = "C:\ProgramData\eds",
        [Parameter(Mandatory=$false)]
        [string]$AdminGroup = "VORDEFINIERT\Administratoren"
    )

    New-Item $ConfigFolder -Force -ItemType Directory | Out-Null
    $tokenPath = Join-Path $ConfigFolder "device.token"

    Remove-Item -Path $tokenPath -ErrorAction SilentlyContinue -Force

    # Save the token
    $deviceToken | Set-Content -Path $tokenPath -Encoding UTF8

    # Secure the token file (Administrators only)
	$acl = Get-ACL $tokenPath

	# Break inheritence and delete inherited rules
	$acl.SetAccessRuleProtection($true, $false)

	# Create the access rule
	$rule = New-Object System.Security.AccessControl.FileSystemAccessRule($AdminGroup, "Write", "Allow")
	$acl.SetAccessRule($rule)

	Set-Acl -Path $tokenPath -AclObject $acl

}

function Set-DeviceConfig {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$DeviceConfig,
        [Parameter(Mandatory=$false)]
        [string]$ConfigFolder = "C:\ProgramData\eds"
    )

    New-Item $ConfigFolder -Force -ItemType Directory | Out-Null
    $configPath = Join-Path $ConfigFolder "device.json"

    Remove-Item -Path $configPath -ErrorAction SilentlyContinue -Force

    # Save the device config
    $DeviceConfig | ConvertTo-Json -Depth 5 | Set-Content -Path $configPath -Encoding UTF8
}

function Get-DeviceToken {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$false)]
        [string]$ConfigFolder = "C:\ProgramData\eds"
    )

    $tokenPath = Join-Path $ConfigFolder "device.token"

    if (-Not (Test-Path $tokenPath)) {
        throw "Device token file not found: $tokenPath"
    }

    try {
        $deviceToken = Get-Content -Path $tokenPath -Raw
        return $deviceToken
    } catch {
        throw "Failed to read device token file: $_"
    }
}

function Get-DeviceConfig {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$false)]
        [string]$ConfigFolder = "C:\ProgramData\eds"
    )

    $configPath = Join-Path $ConfigFolder "device.json"

    if (-Not (Test-Path $configPath)) {
        throw "Device config file not found: $configPath"
    }

    try {
        $configContent = Get-Content -Path $configPath -Raw | ConvertFrom-Json
        return $configContent
    } catch {
        throw "Failed to read or parse device config file: $_"
    }
}

Export-ModuleMember -Function *