$rootDir=$PSScriptRoot
Set-Location $rootDir\..
. "$rootDir\variable.ps1"

$versionTag="${version}${tagPostfix}"
$latestTag="latest-${tagPostfix}"
docker push "${imageName}:${versionTag}"

docker tag "${imageName}:${versionTag}" "${imageName}:${latestTag}"
docker push "${imageName}:${latestTag}"
