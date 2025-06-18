$DomainName = $eds.domainName

try {
    $computerSystem = Get-WmiObject Win32_ComputerSystem
    if ($computerSystem.PartOfDomain -and $computerSystem.Domain -ieq $DomainName) {
        Write-EDSLog -Level info -Message "Device is joined to domain: $DomainName"
        exit 0
    } else {
        Write-EDSLog -Level info -Message "Device is NOT joined to domain: $DomainName (Current: $($computerSystem.Domain))"
        exit 1
    }
} catch {
    Write-EDSLog -Level info -Message "Error verifying domain join: $_"
    exit 2
}
