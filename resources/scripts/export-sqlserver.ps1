param([string]$ConnectionString = 'Server=.\SQLEXPRESS;Database=Pixode;Integrated Security=True;Encrypt=False;TrustServerCertificate=True;Connect Timeout=15')
$ErrorActionPreference = 'Stop'
$connection = New-Object System.Data.SqlClient.SqlConnection($ConnectionString)
$connection.Open()
try {
 $export = @{}
 foreach ($table in @('Site','Content','Users','Inquiries')) {
  $command = $connection.CreateCommand()
  $command.CommandText = 'SELECT * FROM [' + $table + ']'
  $reader = $command.ExecuteReader()
  $rows = @()
  while ($reader.Read()) {
   $record = @{}
   for ($column = 0; $column -lt $reader.FieldCount; $column++) {
    $value = $reader.GetValue($column)
    $record[$reader.GetName($column)] = if ($value -is [DBNull]) { $null } else { $value }
   }
   $rows += $record
  }
  $reader.Close()
  $export[$table] = @($rows)
 }
 $target = Join-Path $PSScriptRoot '..\..\storage\app\private\sqlserver-migration.json'
 [System.IO.Directory]::CreateDirectory([System.IO.Path]::GetDirectoryName($target)) | Out-Null
 [System.IO.File]::WriteAllText($target, ($export | ConvertTo-Json -Depth 50), (New-Object System.Text.UTF8Encoding($false)))
 Write-Output 'SQL Server snapshot exported to private Laravel storage. No source data changed.'
} finally { $connection.Close() }
