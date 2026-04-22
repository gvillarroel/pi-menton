$preferred = @(".\README.md", ".\AGENTS.md") | Where-Object { Test-Path $_ }

if ($preferred.Count -gt 0) {
  $preferred | Select-Object -First 2
  exit 0
}

Get-ChildItem -Recurse -File |
  Where-Object {
    $_.FullName -notmatch '[\\/]\.git[\\/]' -and
    $_.FullName -notmatch '[\\/]node_modules[\\/]' -and
    $_.FullName -notmatch '[\\/]dist[\\/]' -and
    $_.FullName -notmatch '[\\/]build[\\/]' -and
    $_.FullName -notmatch '[\\/]coverage[\\/]'
  } |
  Select-Object -First 2 -ExpandProperty FullName
