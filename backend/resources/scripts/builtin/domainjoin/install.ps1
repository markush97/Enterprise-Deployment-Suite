$DomainName = $eds.domainName

try {
    Write-EDSLog -Level info -Message "Preparing to join domain: $DomainName"
    $secpasswd = ConvertTo-SecureString $eds.domainjoin.password -AsPlainText -Force
    $creds = New-Object System.Management.Automation.PSCredential ($eds.domainjoin.username, $secpasswd)

    $params = @{
        'DomainName' = $DomainName
        'Credential' = $creds
        'Force' = $true
    }
    if ($eds.domainjoin.ou) { $params['OUPath'] = $eds.domainjoin.ou }
    if ($eds.domainController) { $params['Server'] = $eds.domainController }

    Write-EDSLog -Level info -Message "Invoking Add-Computer with parameters."
    Add-Computer @params
    if ($LASTEXITCODE -eq 0) {
        Write-EDSLog -Level info -Message "Successfully joined domain."

    } else {
        Write-EDSLog -Level error -Message "Add-Computer failed with exit code $LASTEXITCODE"
        exit 1
    }
} catch {
    WWrite-EDSLog -Level error -Message "Exception occurred: $_"
    exit 2
}
