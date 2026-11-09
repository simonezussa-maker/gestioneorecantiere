$ErrorActionPreference = 'Stop'
$root = (Resolve-Path -LiteralPath $PSScriptRoot).Path.TrimEnd('\')
$port = 8766
$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $port)
$listener.Start()
Write-Host "PWA di prova: http://127.0.0.1:$port/"
Write-Host 'Chiudi questa finestra per fermare il server.'
if (-not $env:PWA_TEST_NO_AUTOOPEN) { Start-Process "http://127.0.0.1:$port/" }

try {
    while ($true) {
        $client = $listener.AcceptTcpClient()
        try {
            $stream = $client.GetStream()
            $reader = [System.IO.StreamReader]::new($stream, [System.Text.Encoding]::ASCII, $false, 1024, $true)
            $requestLine = $reader.ReadLine()
            while ($reader.ReadLine() -ne '') { }

            $status = '200 OK'
            $contentType = 'application/octet-stream'
            $body = [byte[]]@()
            if ($requestLine -match '^GET\s+(\S+)\s+HTTP/') {
                $relative = [Uri]::UnescapeDataString(($Matches[1] -split '\?')[0]).TrimStart('/')
                if ([string]::IsNullOrWhiteSpace($relative)) { $relative = 'index.html' }
                $file = [System.IO.Path]::GetFullPath((Join-Path $root $relative))
                if (-not $file.StartsWith($root + '\', [System.StringComparison]::OrdinalIgnoreCase)) {
                    $status = '403 Forbidden'
                    $body = [System.Text.Encoding]::UTF8.GetBytes('Forbidden')
                } elseif (-not (Test-Path -LiteralPath $file -PathType Leaf)) {
                    $status = '404 Not Found'
                    $body = [System.Text.Encoding]::UTF8.GetBytes('Not found')
                } else {
                    $extension = [System.IO.Path]::GetExtension($file).ToLowerInvariant()
                    $contentType = switch ($extension) {
                        '.html' { 'text/html; charset=utf-8' }
                        '.js'   { 'text/javascript; charset=utf-8' }
                        '.css'  { 'text/css; charset=utf-8' }
                        '.json' { 'application/json; charset=utf-8' }
                        '.svg'  { 'image/svg+xml' }
                        '.png'  { 'image/png' }
                        default { 'application/octet-stream' }
                    }
                    $body = [System.IO.File]::ReadAllBytes($file)
                }
            } else {
                $status = '400 Bad Request'
                $body = [System.Text.Encoding]::UTF8.GetBytes('Bad request')
            }

            $header = [System.Text.Encoding]::ASCII.GetBytes("HTTP/1.1 $status`r`nContent-Type: $contentType`r`nContent-Length: $($body.Length)`r`nCache-Control: no-cache`r`nConnection: close`r`n`r`n")
            $stream.Write($header, 0, $header.Length)
            if ($body.Length -gt 0) { $stream.Write($body, 0, $body.Length) }
            $stream.Flush()
        } catch {
            Write-Host $_.Exception.Message
        } finally {
            $client.Close()
        }
    }
} finally {
    $listener.Stop()
}
