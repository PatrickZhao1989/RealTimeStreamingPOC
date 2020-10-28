$rootDir=$PSScriptRoot
Set-Location $rootDir\..
. "$rootDir\variable.ps1"

docker build -t "${imageName}:${version}" .
#docker build -t clementchristopher.azurecr.io/aplus-audiostreaming-wss-server .

# docker run --rm -p 8080:8080 clementchristopher.azurecr.io/aplus-audiostreaming-wss-server ls
