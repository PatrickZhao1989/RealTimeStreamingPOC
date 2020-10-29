using System;
using System.Data;
using System.Diagnostics;
using AgoraIO.Media;
using TokenGenerator.Models;

namespace TokenGenerator
{
	public class Core
	{
		
		private readonly Config _config;

		public Core(Config config)
		{
			_config = config;
		}

		public string GenerateTokenForChannel(string channelName, uint ts, Role role, string uId = "")
		{
			var token = new AccessToken(_config.AppId, _config.AppCertificate, channelName, uId);
			token.Message.ts = ts;
			token.Message.salt = 1;

			if (role == Role.Publisher) this.SetPrivilegeForPublisher(token, ts);
			if (role == Role.Subscriber) this.SetPrivilegeForSubscriber(token, ts);
			if (role == Role.Admin) this.SetPrivilegeForAdmin(token, ts);


			return token.build();
		}

		// Followed this example in Php to map the Privileges enum
		// https://github.com/JaderH/Agora-Token-Generator/blob/master/src/AgoraTokenGenerator.php
		private void SetPrivilegeForPublisher(AccessToken accessToken, uint ts)
		{
			accessToken.setPrivilege(Privileges.kPublishAudioStream, ts);
			accessToken.setPrivilege(Privileges.kPublishVideoStream, ts);
			accessToken.setPrivilege(Privileges.kPublishDataStream, ts);
			accessToken.setPrivilege(Privileges.kPublishAudiocdn, ts);
			accessToken.setPrivilege(Privileges.kPublishVideoCdn, ts);
			accessToken.setPrivilege(Privileges.kInvitePublishAudioStream, ts);
			accessToken.setPrivilege(Privileges.kInvitePublishVideoStream, ts);
			accessToken.setPrivilege(Privileges.kInvitePublishDataStream, ts);

			this.SetUniversalPrivilege(accessToken, ts);
		}

		private void SetPrivilegeForSubscriber(AccessToken accessToken, uint ts)
		{
			accessToken.setPrivilege(Privileges.kRequestPublishAudioStream, ts);
			accessToken.setPrivilege(Privileges.kRequestPublishVideoStream, ts);
			accessToken.setPrivilege(Privileges.kRequestPublishDataStream, ts);

			this.SetUniversalPrivilege(accessToken, ts);
		}

		private void SetPrivilegeForAdmin(AccessToken accessToken, uint ts)
		{
			accessToken.setPrivilege(Privileges.kPublishAudioStream, ts);
			accessToken.setPrivilege(Privileges.kPublishVideoStream, ts);
			accessToken.setPrivilege(Privileges.kPublishDataStream, ts);
			accessToken.setPrivilege(Privileges.kAdministrateChannel, ts);
			
			this.SetUniversalPrivilege(accessToken, ts);
		}

		private void SetUniversalPrivilege(AccessToken accessToken, uint ts)
		{
			// Set universal privileges
			accessToken.setPrivilege(Privileges.kJoinChannel, ts);
		}
	}
}
