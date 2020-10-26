<template>
	<div class="container-fluid">
		<h3>{{ msg }}</h3>
		<div class="row">
			<div class="col-lg-4">
				<form @submit.prevent="connect()">
					<div class="form-group">
						<label for="channel">Channel</label>
						<input
							type="text"
							name="channel"
							v-model="state.option.channel"
							class="form-control"
						/>
						<small
							id="channelNameHelp"
							class="form-text text-muted"
							>Type in your Channel Name</small
						>
					</div>

					<div class="form-group">
						<label for="token">Token</label>
						<input
							type="text"
							name="token"
							v-model="state.option.token"
							class="form-control"
						/>
						<small
							id="tokenHelp"
							class="form-text text-muted"
							>Type in your Token</small
						>
					</div>

					<div class="form-group">
						<label for="role">Role</label>
						<select
							v-model="state.role"
							class="form-control"
						>
							<option value="host">Host</option>
							<option value="audience"
								>Audience</option
							>
						</select>
					</div>

					<button class="btn btn-primary">Connect</button>
				</form>
				<div>
					<button class="btn btn-primary" @click="close()">
						Disconnect
					</button>
				</div>
			</div>

			<div class="col-lg-2">
				<h4>Configuration Info</h4>
				<ul class="list-group">
					<li
						class="list-group-item"
						data-toggle="tooltip"
						data-placement="top"
						v-bind:title="state.option.appID"
					>
						App Id:
						{{
							state.option.appID.substring(0, 10) +
								"..."
						}}
					</li>
					<li class="list-group-item">
						Channel: {{ state.option.channel }}
					</li>
					<li
						class="list-group-item"
						data-toggle="tooltip"
						data-placement="top"
						v-bind:title="state.option.token"
					>
						Token:
						{{
							state.option.token.substring(0, 10) +
								"..."
						}}
					</li>
					<li class="list-group-item">
						Role: {{ state.role }}
					</li>
				</ul>
			</div>
			<div class="col-lg-4">
				<h3>Streaming {{ state.role }}</h3>
				<div class="video-grid" id="video">
					<div class="video-view">
						<div
							id="local_stream"
							class="video-placeholder"
						></div>
						<div
							id="local_video_info"
							class="video-profile hide"
						></div>
						<div
							id="video_autoplay_local"
							class="autoplay-fallback hide"
						></div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue"
import * as AgoraRTC from "agora-rtc-sdk"

export default defineComponent({
	name: "Audience",
	props: {
		msg: String,
		defaultRole: String,
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
			role: "host",
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
					alert("log in failed" + err)
				}
			)

			state.rtc.client.setClientRole(state.role)
			// Join a channel
			state.rtc.client.join(
				state.option.token ? state.option.token : null,
				state.option.channel,
				state.option.uid ? +state.option.uid : null,
				function(uid) {
					console.log(
						`joined c ${state.option.channel} - uid: ${uid}`
					)
					state.rtc.params.uid = uid

					if (state.role === "host") {
						state.rtc.localStream = AgoraRTC.createStream(
							{
								streamID: state.rtc.params.uid,
								audio: true,
								video: true,
								screen: false,
							}
						)

						// Initialize the local stream
						state.rtc.localStream.init(
							function() {
								console.log(
									"init local stream success"
								)
								// play stream with html element id "local_stream"
								state.rtc.localStream.play(
									"local_stream"
								)
								state.rtc.client.publish(
									state.rtc.localStream,
									function(err) {
										console.log(
											"publish failed"
										)
										console.error(err)
									}
								)
							},
							function(err) {
								console.error(
									"init local stream failed ",
									err
								)
							}
						)
					}
				},
				function(err: any) {
					console.error("client join failed", err)
					alert("client join failed" + err)
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

			state.rtc.client.on("stream-subscribed", function(evt: any) {
				const remoteStream = evt.stream
				const id = remoteStream.getId()

				addView(id)
				// Play the remote stream.
				remoteStream.play("remote_video_" + id)
				console.log("stream-subscribed remote-uid: ", id)

				const videoMainFrame = document.getElementById(
					"video" + id
				)
				videoMainFrame.setAttribute(
					"style",
					videoMainFrame.style + "left: 0; top: 0; "
				)
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

		const close = () => {
			// Leave the channel
			state.rtc.client.leave(
				function() {
					// Stop playing the local stream
					state.rtc.localStream.stop()
					// Close the local stream
					state.rtc.localStream.close()
					// Stop playing the remote streams and remove the views
					while (state.rtc.remoteStreams.length > 0) {
						var stream = state.rtc.remoteStreams.shift()
						var id = stream.getId()
						stream.stop()
						this.removeView(id)
					}
					console.log("client leaves channel success")
				},
				function(err) {
					console.log("channel leave failed")
					console.error(err)
				}
			)
		}

		const removeView = (id: any) => {
			const videoDiv = document.getElementById(
				"remote_video_panel_" + id
			)
			if (videoDiv) {
				videoDiv.remove()
			}
		}

		const addView = (id: any) => {
			const videoDiv = document.getElementById("video")
			const remoteVideoPanelDiv = document.createElement("div")
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
			remoteVideoInfo.setAttribute("id", "remote_video_info_" + id)
			remoteVideoInfo.setAttribute("class", "video-profile show")
			remoteVideoPanelDiv.appendChild(remoteVideoInfo)

			const remoteVideoAutoPlay = document.createElement("div")
			remoteVideoAutoPlay.setAttribute("id", "video_autoplay_" + id)
			remoteVideoAutoPlay.setAttribute(
				"class",
				"autoplay-fallback hide"
			)
			remoteVideoPanelDiv.appendChild(remoteVideoAutoPlay)
		}
		return {
			connect,
			state,
			close,
		}
	},
})
</script>

<style lang="scss" scoped>
#local_stream {
	height: 800px;
}
</style>
