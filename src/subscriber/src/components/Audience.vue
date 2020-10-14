<template>
	<div>{{ msg }}</div>
	<form @submit.prevent="connect()">
		<div>
			<label for="channel">Channel</label>
			<input
				type="text"
				name="channel"
				v-model="state.option.channel"
			/>
		</div>

		<div>
			<label for="token">Token</label>
			<input
				type="text"
				name="token"
				v-model="state.option.token"
			/>
		</div>

		<button>Connect</button>
	</form>
	<div>
		<h4>Configuration Info</h4>
		<ul>
			<li>App Id: {{ state.option.appID }}</li>
			<li>Channel: {{ state.option.channel }}</li>
			<li>Token: {{ state.option.token }}</li>
		</ul>
	</div>
	<div class="video-grid" id="video"></div>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue"
const AgoraRTC = require("agora-rtc-sdk")

export default defineComponent({
	name: "Audience",
	props: {
		msg: String,
	},
	setup() {
		const state = reactive({
			rtc: {
				client: null,
				joined: false,
				published: false,
				localStream: null,
				remoteStreams: [],
				params: {} as any,
			},
			option: {
				appID: "07584acf86384ab9b25b03c56f5299e3",
				channel: "",
				uid: null,
				token: "",
			},
		})
		const connect = () => {
			// Create a client
			state.rtc.client = AgoraRTC.createClient({
				mode: "live",
				codec: "h264",
			})

			// Initialize the client
			state.rtc.client.init(
				state.option.appID,
				function() {
					console.log("init success")
				},
				(err: any) => {
					console.error(err)
				}
			)

			state.rtc.client.setClientRole("audience")
			// Join a channel
			state.rtc.client.join(
				state.option.token ? state.option.token : null,
				state.option.channel,
				state.option.uid ? +state.option.uid : null,
				function(uid) {
					console.log(
						"join channel: " +
							state.option.channel +
							" success, uid: " +
							uid
					)
					state.rtc.params.uid = uid
				},
				function(err: any) {
					console.error("client join failed", err)
				}
			)

			state.rtc.client.on("stream-added", function(evt: any) {
				const remoteStream = evt.stream
				const id = remoteStream.getId()
				console.log("stream-added remote-uid: ", id)
				if (id !== state.rtc.params.uid) {
					state.rtc.client.subscribe(remoteStream, function(
						err: any
					) {
						console.log("stream subscribe failed", err)
					})
				}
			})

			const addView = (id: any) => {
				console.log("add view")
				const videoDiv = document.getElementById("video")
				const remoteVideoPanelDiv = document.createElement(
					"div"
				)
				remoteVideoPanelDiv.setAttribute(
					"id",
					"remote_video_panel_" + id
				)
				remoteVideoPanelDiv.setAttribute("class", "video-view")
				videoDiv.appendChild(remoteVideoPanelDiv)

				const remoteVideo = document.createElement("div")
				remoteVideo.setAttribute("id", "remote_video_" + id)
				remoteVideo.setAttribute("class", "video-placeholder")
				remoteVideoPanelDiv.appendChild(remoteVideo)

				const remoteVideoInfo = document.createElement("div")
				remoteVideoInfo.setAttribute(
					"id",
					"remote_video_info_" + id
				)
				remoteVideoInfo.setAttribute(
					"class",
					"video-profile show"
				)
				remoteVideoPanelDiv.appendChild(remoteVideoInfo)

				const remoteVideoAutoPlay = document.createElement(
					"div"
				)
				remoteVideoAutoPlay.setAttribute(
					"id",
					"video_autoplay_" + id
				)
				remoteVideoAutoPlay.setAttribute(
					"class",
					"autoplay-fallback hide"
				)
				remoteVideoPanelDiv.appendChild(remoteVideoAutoPlay)
			}

			const removeView = (id: any) => {
				console.log("remove view")
			}

			state.rtc.client.on("stream-subscribed", function(evt: any) {
				const remoteStream = evt.stream
				const id = remoteStream.getId()

				addView(id)
				// Play the remote stream.
				remoteStream.play("remote_video_" + id)
				console.log("stream-subscribed remote-uid: ", id)

				const videoMainFrame = document.getElementById("video"+ id);
				videoMainFrame.setAttribute("style", videoMainFrame.style + "left: 0; top: 0; ");
			})

			state.rtc.client.on("stream-removed", function(evt) {
				const remoteStream = evt.stream
				const id = remoteStream.getId()
				// Stop playing the remote stream.
				remoteStream.stop("remote_video_" + id)
				// Remove the view of the remote stream.
				removeView(id)
				console.log("stream-removed remote-uid: ", id)
			})
		}
		return {
			connect,
			state,
		}
	},
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
h3 {
	margin: 40px 0 0;
}
ul {
	list-style-type: none;
	padding: 0;
}
li {
	display: block;
	margin: 0 10px;
}
a {
	color: #42b983;
}
</style>
