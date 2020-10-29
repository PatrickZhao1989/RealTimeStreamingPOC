## Read me for information about A/V Streaming Happy Path - using Agora

---
## DevOps

- Publisher
```powershell
cd ./Publisher
npm run build
cd dist
```
**Upload the artifact in this folder to your hosting environment**


- Subscriber
```powershell
cd ./Subscriber
npm run build
cd dist
```
**Upload the artifact in this folder to your hosting environment**

<br/>

For example, if the hosting environment is Azure Storage Account Static Site
Run command below

```powershell
az storage remove -c '$web' --account-name {Storage-Account-Name} --recursive 
az storage blob upload-batch --account-name {Storage-Account-Name} --source . --destination '$web'
```
