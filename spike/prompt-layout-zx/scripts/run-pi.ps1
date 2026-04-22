param(
  [string]$TaskPromptBase64,
  [string]$SystemPromptBase64,
  [string]$Model,
  [string]$Thinking,
  [int]$TimeoutSeconds = 20
)

$TaskPrompt = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($TaskPromptBase64))
$SystemPrompt = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($SystemPromptBase64))
$RepoRoot = Split-Path (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent) -Parent

$job = Start-Job -ScriptBlock {
  param($TaskPrompt, $SystemPrompt, $Model, $Thinking, $RepoRoot)
  Set-Location $RepoRoot
  pi -p $TaskPrompt --model $Model --thinking $Thinking --system-prompt $SystemPrompt --no-session --tools read
} -ArgumentList $TaskPrompt, $SystemPrompt, $Model, $Thinking, $RepoRoot

if (-not (Wait-Job $job -Timeout $TimeoutSeconds)) {
  Stop-Job $job | Out-Null
  Remove-Job $job | Out-Null
  Write-Error "Timed out after $TimeoutSeconds seconds."
  exit 124
}

$output = Receive-Job $job 2>&1
$state = $job.State
Remove-Job $job | Out-Null

if ($state -ne "Completed") {
  if ($output) {
    $output | Out-String | Write-Error
  } else {
    Write-Error "Pi job failed."
  }
  exit 1
}

$output | Out-String
