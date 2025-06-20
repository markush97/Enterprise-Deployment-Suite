function Read-Config {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Path
    )

    if (-Not (Test-Path $Path)) {
        throw "Config file not found: $Path"
    }

    try {
        $json = Get-Content $Path -Raw | ConvertFrom-Json
        return $json
    } catch {
        throw "Failed to parse config file: $_"
    }
}

function Get-InstallerParams {
 # Load the XML file

    $xmlPath = "C:\Windows\Panther\unattend.xml"
    [xml]$xmlDoc = Get-Content $xmlPath

    # Set up namespaces
    $nsMgr = New-Object System.Xml.XmlNamespaceManager($xmlDoc.NameTable)
    $nsMgr.AddNamespace("u", "urn:schemas-microsoft-com:unattend")
    $nsMgr.AddNamespace("e", "https://eds.cwi.at")

    # Navigate to the <UserInput> block
    $userInputBlock = $xmlDoc.SelectSingleNode("//e:EDS/e:UserInput", $nsMgr)

    # Create a hashtable to store the key-value pairs
    $userInputData = @{}

    # Only proceed if the block exists
    if ($userInputBlock) {
        foreach ($child in $userInputBlock.ChildNodes) {
            $userInputData[$child.Name] = $child.InnerText
        }
    }

    # Output the result
    $userInputData
    [xml]$xmlDoc = Get-Content $xmlPath

    # Set up namespaces
    $nsMgr = New-Object System.Xml.XmlNamespaceManager($xmlDoc.NameTable)
    $nsMgr.AddNamespace("u", "urn:schemas-microsoft-com:unattend")
    $nsMgr.AddNamespace("e", "https://eds.cwi.at")

    # Navigate to the <UserInput> block
    $userInputBlock = $xmlDoc.SelectSingleNode("//e:EDS/e:UserInput", $nsMgr)

    # Create a hashtable to store the key-value pairs
    $userInputData = @{}

    # Only proceed if the block exists
    if ($userInputBlock) {
        foreach ($child in $userInputBlock.ChildNodes) {
            $userInputData[$child.Name] = $child.InnerText
        }
    }

    return $userInputData
}

Export-ModuleMember -Function *