## Refer to this doc for [token generation](https://docs.agora.io/en/Interactive%20Broadcast/token_server)

### Follow steps below to generate a token 

```powershell
cd ./Tests
```
Open `UniTest1.cs` in code editor of your preference
- Play with the parameters of the Core Lib method

```csharp
var result = newCoreLib.GenerateTokenForChannel("PatrickTestChannel", 0, Role.Subscriber);
```

- Create a `localsettings.json` file according to the example file `localsettings.sample.json`
- Run the test in the way of your preference (e.g. `dotnet cli` example below)
  
```powershell
dotnet test --logger trx
```
  
  - Open the `.trx` file in the `./TestResults` directory
  - Find the element 
  

```xml
<StdOut>Token is {{Your-Token-With-the-parameters}}</StdOut>
```



<br/>
<br/>
<br/>

## Make sure you have [Rest Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) installed in VS code
## Open [./AgoraCoreAPISample/Api.http](./AgoraCoreAPISample/Api.http) in VSCode for Agora Server Rest API



