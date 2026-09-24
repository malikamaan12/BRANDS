$chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
$destDir = "C:\Users\pceve\.gemini\antigravity-ide\brain\787a8036-5c2d-4eba-80ef-655a28f8c9e1"

# 1. Cards View Screenshot
$u1 = [System.IO.Path]::Combine($env:TEMP, "chrome_" + [System.Guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Force -Path $u1 | Out-Null
$cardsTemp = [System.IO.Path]::Combine($env:TEMP, "screen_cards.png")
if (Test-Path $cardsTemp) { Remove-Item $cardsTemp -Force }

& $chrome --headless=new "--user-data-dir=$u1" --disable-gpu "--screenshot=$cardsTemp" --virtual-time-budget=3000 --window-size=1600,1200 "http://localhost:3000/?view=cards"

if (Test-Path $cardsTemp) {
    Copy-Item $cardsTemp (Join-Path $destDir "screen_cards.png") -Force
    Write-Output "CARDS_OK"
} else {
    Write-Output "CARDS_FAILED"
}
Remove-Item $u1 -Recurse -Force -ErrorAction SilentlyContinue

# 2. 3D Deck View Screenshot
$u2 = [System.IO.Path]::Combine($env:TEMP, "chrome_" + [System.Guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Force -Path $u2 | Out-Null
$deckTemp = [System.IO.Path]::Combine($env:TEMP, "screen_deck.png")
if (Test-Path $deckTemp) { Remove-Item $deckTemp -Force }

& $chrome --headless=new "--user-data-dir=$u2" --disable-gpu "--screenshot=$deckTemp" --virtual-time-budget=3000 --window-size=1600,1200 "http://localhost:3000/?view=deck3d"

if (Test-Path $deckTemp) {
    Copy-Item $deckTemp (Join-Path $destDir "screen_deck.png") -Force
    Write-Output "DECK_OK"
} else {
    Write-Output "DECK_FAILED"
}
Remove-Item $u2 -Recurse -Force -ErrorAction SilentlyContinue
