
using Microsoft.Extensions.Configuration;
using Xunit;
using Xunit.Abstractions;
using TokenGenerator.Models;

namespace Tests
{
	public class UnitTest1
	{
		private readonly ITestOutputHelper _output;
		private readonly IConfiguration _config;

		public UnitTest1(ITestOutputHelper output)
		{
			this._output = output;
			_config = new ConfigurationBuilder()
				.AddJsonFile("localsettings.json", optional: false, reloadOnChange: false)
				.Build();

		}

		[Fact]
		public void Test1()
		{
			// Arrange
			var tokenConfig = new Config
			{
				AppId = _config.GetValue<string>("AppId"),
				AppCertificate = _config.GetValue<string>("AppCert")
			};

			var newCoreLib = new TokenGenerator.Core(tokenConfig);

			// Act
			var result = newCoreLib.GenerateTokenForChannel("PatrickTestChannel", 0, Role.Subscriber);

			// Assert
			Assert.NotNull(result);



			// Additional: Dump token to output so we can manually test it in the Agora client app
			_output.WriteLine($"Token is {result}");
		}
	}
}
