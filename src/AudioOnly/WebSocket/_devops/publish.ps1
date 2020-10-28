$rootDir=$PSScriptRoot
Set-Location $rootDir\..
. "$rootDir\variable.ps1"

docker push "${imageName}:${version}"

docker tag "${imageName}:${version}" "${imageName}:latest"
docker push "${imageName}:latest"
