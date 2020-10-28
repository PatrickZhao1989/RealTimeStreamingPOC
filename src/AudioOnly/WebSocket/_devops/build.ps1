$rootDir=$PSScriptRoot
Set-Location $rootDir\..

docker build -t apluslivestreamtest.azurecr.io/aplus-audiostreaming-wss-server .
#docker build -t clementchristopher.azurecr.io/aplus-audiostreaming-wss-server .

# docker run --rm -p 8080:8080 clementchristopher.azurecr.io/aplus-audiostreaming-wss-server ls
