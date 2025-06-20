function Get-OperatingSystemNotes {
    $os = Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion"
    $version = $os.DisplayVersion
    $build = "$($os.CurrentBuild).$($os.UBR)"
    return "$version Build: $build"
}

function Get-SystemInformation {
    [CmdletBinding()]
    param()

    $bitlockerInfo = Get-Bitlockerinfo

    try {
        # Create system info object
        $systemInfo = [PSCustomObject]@{
            name = Get-HostName
            model = Get-DeviceModel
            manufacturer = Get-Manufacturer
            networkInterfaces = Get-NetworkInterfaces
            operatingSystem = Get-OperatingSystem
            operatingSystemNotes = Get-OperatingSystemNotes
            assetTag = Get-AssetTag
            installedBy = Get-InstalledBy;
            bitlockerId = $bitlockerInfo.KeyProtectorId | Select-Object -First 1
            bitlockerKey = $bitlockerInfo.RecoveryPassword | Select-Object -First 1
	    deviceType = "PC"
        }

        return $systemInfo
    }
    catch {
        Write-Error "Error collecting system information: $_"
        throw
    }
}

function Get-Bitlockerinfo {
	[CmdletBinding()]
	param()

	try {
	  $bitlockerVolume = Get-BitLockerVolume -MountPoint "C:"
	  $bitlockerInfo = $bitlockerVolume.KeyProtector | Where-Object { $_.KeyProtectorType -eq "RecoveryPassword" } | Select-Object @{Name='KeyProtectorId';Expression={ $_.KeyProtectorId -replace '[{}]' }},RecoveryPassword

          return $bitlockerInfo
    } catch {
       	Write-Warning "Error retrieving BitlockerInfo: $_"
       	return "Unknown"
    }
}

function Get-HostName {
    [CmdletBinding()]
    param()

    try {
        return [System.Net.Dns]::GetHostName()
    }
    catch {
        Write-Warning "Error retrieving hostname: $_"
        return "Unknown"
    }
}

function Get-DeviceType {
    [CmdletBinding()]
    param()

    try {
        $chassisType = Get-CimInstance -ClassName Win32_SystemEnclosure | Select-Object -ExpandProperty ChassisTypes

        # Reference: https://docs.microsoft.com/en-us/windows/win32/cimwin32prov/win32-systemenclosure
        switch ($chassisType[0]) {
            # Laptops/Notebooks
            {$_ -in 8..14 -or $_ -eq 30 -or $_ -eq 31 -or $_ -eq 32} { return "Laptop" }

            # Servers
            {$_ -in 17..24 -or $_ -eq 4} { return "Server" }

            # Desktops
            {$_ -in 3, 5, 6, 7, 15, 16} { return "PC" }

            # Default
            default {
                # Additional check for server OS
                if ((Get-CimInstance -ClassName Win32_OperatingSystem).ProductType -ne 1) {
                    return "Server"
                }
                return "PC"
            }
        }
    }
    catch {
        Write-Warning "Error determining device type: $_"
        return "Unknown"
    }
}

function Get-SerialNumber {
    [CmdletBinding()]
    param()

    try {
        $serial = Get-CimInstance -ClassName Win32_BIOS | Select-Object -ExpandProperty SerialNumber
        return $serial.Trim()
    }
    catch {
        Write-Warning "Error retrieving serial number: $_"
        return "Unknown"
    }
}

function Get-DeviceModel {
    [CmdletBinding()]
    param()

    try {
        $model = Get-CimInstance -ClassName Win32_ComputerSystem | Select-Object -ExpandProperty Model
        return $model.Trim()
    }
    catch {
        Write-Warning "Error retrieving device model: $_"
        return "Unknown"
    }
}

function Get-Manufacturer {
    [CmdletBinding()]
    param()

    try {
        $manufacturer = Get-CimInstance -ClassName Win32_ComputerSystem | Select-Object -ExpandProperty Manufacturer
	$manufacturer = $manufacturer.Substring(0,1).ToUpper() + $manufacturer.Substring(1).ToLower()
        return $manufacturer.Trim()
    }
    catch {
        Write-Warning "Error retrieving manufacturer: $_"
        return "Unknown"
    }
}

function Get-NetworkInterfaces {
    [CmdletBinding()]
    param()

    try {
        $interfaces = @()

        $networkAdapters = Get-CimInstance -ClassName Win32_NetworkAdapter |
                           Where-Object { $_.PhysicalAdapter -eq $true -and $_.MACAddress -ne $null }

        foreach ($adapter in $networkAdapters) {
            $interfaceInfo = [PSCustomObject]@{
                Name = $adapter.Name
                MacAddress = $adapter.MACAddress
                AdapterType = $adapter.AdapterType
                Status = $adapter.NetConnectionStatus
            }

            $interfaces += $interfaceInfo
        }

        return $interfaces
    }
    catch {
        Write-Warning "Error retrieving network interfaces: $_"
        return @()
    }
}

function Get-OperatingSystem {
    [CmdletBinding()]
    param()

    try {
        $caption = (Get-CimInstance Win32_OperatingSystem).Caption
        $cleanCaption = $caption -replace '^Microsoft ', ''
	return $cleanCaption
    }
    catch {
        Write-Warning "Error retrieving operating system: $_"
        return "Unknown"
    }
}

function Get-PlatformArchitecture {
    [CmdletBinding()]
    param()

    try {
        $arch = (Get-CimInstance -ClassName Win32_Processor)[0].Architecture

        switch ($arch) {
            0 { $archName = "x86" }
            5 { $archName = "ARM" }
            9 { $archName = "x64" }
            12 { $archName = "ARM64" }
            default { $archName = "Unknown" }
        }

        # Additional check for AMD vs Intel
        $processorManufacturer = (Get-CimInstance -ClassName Win32_Processor)[0].Manufacturer

        if ($processorManufacturer -like "*AMD*") {
            return "AMD $archName"
        }
        elseif ($processorManufacturer -like "*Intel*") {
            return "Intel $archName"
        }
        else {
            return $archName
        }
    }
    catch {
        Write-Warning "Error retrieving platform architecture: $_"
        return "Unknown"
    }
}

Export-ModuleMember -Function *