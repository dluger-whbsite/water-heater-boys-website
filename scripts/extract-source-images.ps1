$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$destination = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../migration/source-images-indexed'))
if (Test-Path -LiteralPath $destination) { throw 'Image destination already exists; refusing to overwrite.' }
$archives = @{
 'gas-tank'='Gas Tank Water Heaters (1).zip'
 'heat-pump'='Hybrid Heat Pump Water Heaters (1).zip'
 'tankless'='Tankless Water Heaters.zip'
 'job-pics'='Job pics.zip'
 'site-files'='Site Files.zip'
}
$inventory = @()
foreach ($category in $archives.Keys) {
 $zip = [System.IO.Compression.ZipFile]::OpenRead((Join-Path 'C:/Users/dust2/Downloads' $archives[$category]))
 try {
  $index=0
  foreach ($entry in $zip.Entries) {
   $index++
   if (!$entry.Name) { continue }
   # Separate entry folders preserve duplicate ZIP names without overwriting.
   $folder = Join-Path $destination ($category + '/' + $index.ToString('D3'))
   $target = [System.IO.Path]::GetFullPath((Join-Path $folder ('source'+[System.IO.Path]::GetExtension($entry.Name))))
   if (!$target.StartsWith($destination + [System.IO.Path]::DirectorySeparatorChar)) { throw 'Unsafe ZIP path' }
   New-Item -ItemType Directory -Path $folder -Force | Out-Null
   [System.IO.Compression.ZipFileExtensions]::ExtractToFile($entry,$target,$false)
   $inventory += [pscustomobject]@{category=$category;archive=$archives[$category];entry=$entry.FullName;index=$index;path=$target.Substring($destination.Length+1);bytes=$entry.Length;sha256=(Get-FileHash -LiteralPath $target -Algorithm SHA256).Hash}
  }
 } finally { $zip.Dispose() }
}
$inventory | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath (Join-Path $destination 'inventory.json') -Encoding UTF8
Write-Output "Extracted $($inventory.Count) files without overwriting duplicate entries."
