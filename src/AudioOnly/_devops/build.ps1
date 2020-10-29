$rootDir=$PSScriptRoot
Set-Location $rootDir\..
. "$rootDir\variable.ps1"

docker build -t "${imageName}:${version}${tagPostfix}" .
# docker build -t {ContainerRegistry}/{ImageName} .
# docker run --rm -p 8080:8080 {ContainerRegistry}/{ImageName} ls
