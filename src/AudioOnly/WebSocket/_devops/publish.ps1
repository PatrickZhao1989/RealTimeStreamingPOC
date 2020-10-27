$rootDir=$PSScriptRoot
Set-Location $rootDir\..

docker push clementchristopher.azurecr.io/aplus-audiostreaming-wss-server
