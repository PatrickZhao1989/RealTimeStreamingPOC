<template>
	<div class="container-fluid">
		<div class="control-panel py-3 px-2 border-bottom">
			<div class="row no-gutters">
				<div class="col-lg-5">
					<div class="row no-gutters">
						<div class="col-3 col-sm-2 d-flex justify-content-center">
							<i class="fas fa-volume-up device-icon" v-if="Number(state.rtc.audioVolumn) >= 300"></i>
							<i
								class="fas fa-volume-down device-icon"
								v-if="Number(state.rtc.audioVolumn) > 0 && Number(state.rtc.audioVolumn) < 300"
							></i>
							<i class="fas fa-volume-mute device-icon" v-if="Number(state.rtc.audioVolumn) == 0"></i>
						</div>
						<div class="col-3 col-sm-2 d-flex justify-content-center align-items-center">
							<input
								type="range"
								name="volumn"
								min="0"
								max="1000"
								step="1"
								@change="adjustAudioVolumn()"
								v-model="state.rtc.audioVolumn"
							/>
							{{ Number(state.rtc.audioVolumn) }}
						</div>
					</div>
				</div>
				<div class="col-lg-7 ">
					Number of Broadcasters: Audio - {{ Object.keys(state.rtc.remoteUserDicAudio).length }} Video -
					{{ Object.keys(state.rtc.remoteUserDicVideo).length }}
					<button
						class="btn float-right m-0 mt-3 mt-lg-0"
						:class="state.rtc.connectToggle"
						type="button"
						@click="toggleConnect()"
					>
						{{ state.rtc.isConnected ? "Disconnect" : "Connect" }}
					</button>
				</div>
			</div>
		</div>
		<div class="video-grid flex-grow" id="video-player-container"></div>
	</div>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue"
import AgoraRTC, { IAgoraRTCRemoteUser, NetworkQuality, RemoteStreamType, UID } from "agora-rtc-sdk-ng"
import { useRoute } from "vue-router"

interface RemoteUserDic {
	[key: string]: IAgoraRTCRemoteUser
}

export default defineComponent({
	name: "Subscriber",
	setup() {
		const globalClient = AgoraRTC.createClient({
			mode: "rtc",
			codec: "h264",
		})

		const state = reactive({
			rtc: {
				isConnected: false,
				connectToggle: "btn-success",
				audioVolumn: 100,
				remoteUserDicAudio: {} as RemoteUserDic,
				remoteUserDicVideo: {} as RemoteUserDic,
			},
			option: {
				channel: "",
				token: "",
			},
		})

		const route = useRoute()
		state.option = {
			channel: route.query.channel as string,
			token: route.query.token as string,
		}

		const connect = async () => {
			globalClient.on("user-unpublished", (remoteUser: IAgoraRTCRemoteUser, mediaType) => {
				if (mediaType == "audio") {
					remoteUser.audioTrack?.stop()
					delete state.rtc.remoteUserDicAudio[remoteUser.uid]
				}

				if (mediaType == "video") {
					remoteUser.videoTrack?.stop()
					const mediaPlayer = document.getElementById(`player-${remoteUser.uid}`)
					if (mediaPlayer) mediaPlayer.remove()
					delete state.rtc.remoteUserDicVideo[remoteUser.uid]
				}
			})

			globalClient.on("user-published", async (remoteUser, mediaType) => {
				await globalClient.subscribe(remoteUser, mediaType)

				// Initiate the subscription
				const uid = remoteUser.uid

				if (mediaType === "audio") {
					state.rtc.remoteUserDicAudio[uid] = remoteUser
					remoteUser.audioTrack?.play()
				}

				if (mediaType === "video") {
					const playerContainerElement = document.getElementById("video-player-container")
					const mediaPlayer = document.createElement("div")
					mediaPlayer.setAttribute("id", `player-${uid}`)
					mediaPlayer.setAttribute("style", "height:100%")
					playerContainerElement?.appendChild(mediaPlayer)
					remoteUser.videoTrack?.play(`player-${uid}`)
					state.rtc.remoteUserDicVideo[uid] = remoteUser
				}
			})

			globalClient.on("stream-fallback", (uid: UID, isFallbackOrRecover) => {
				console.log(`stream-fallback ${uid}, ${isFallbackOrRecover}`)
			})

			globalClient.on("stream-type-changed", (uid: UID, streamType: RemoteStreamType) => {
				console.log(`stream-fallback ${uid}, ${streamType}`)
			})

			globalClient.on("network-quality", (stats: NetworkQuality) => {
				console.log(`net work quality ${JSON.stringify(stats)}`)
			})
			await globalClient.join("", state.option.channel, state.option.token)

			state.rtc = { ...state.rtc, isConnected: true, audioVolumn: 100 }
		}
		const disconnect = async () => {
			// Leave the channel
			await globalClient.leave()
			const playerContainerElement = document.getElementById("video-player-container")
			if (playerContainerElement) playerContainerElement.innerHTML = ""

			state.rtc = { ...state.rtc, isConnected: false, remoteUserDicAudio: {}, remoteUserDicVideo: {} }
		}

		const toggleConnect = async () => {
			if (!state.rtc.isConnected) {
				await connect()
				state.rtc.connectToggle = "btn-danger"
			} else {
				await disconnect()
				state.rtc.connectToggle = "btn-success"
			}
		}

		const adjustAudioVolumn = () => {
			for (const remoteUserUid in state.rtc.remoteUserDicAudio) {
				;(state.rtc.remoteUserDicAudio[remoteUserUid] as IAgoraRTCRemoteUser).audioTrack?.setVolume(Number(state.rtc.audioVolumn))
			}
		}
		return {
			state,
			toggleConnect,
			adjustAudioVolumn,
		}
	},
})
</script>

<style lang="scss" scoped>
.container-fluid {
	position: relative;
	padding: 0;
	height: 100vh;
	display: flex;
	flex-direction: column;

	.control-panel {
		//position: absolute;
		left: 0;
		top: 0;
		z-index: 10;
		background-color: white;
		width: 100%;
	}
}
.video-grid {
	position: relative;
	flex-basis: 0;
	flex-grow: 1;
	width: 100%;

	.recording-button {
		position: absolute;
		right: 1rem;
		top: 1rem;
		font-size: 2rem;
		z-index: 20;
	}
}
.main-panel {
	margin-top: 15px;
}
.heading {
	text-align: center;
}
.btn {
	margin-right: 10px;

	&.btn-with-icon {
		height: 3.5rem;
		width: 3.5rem;
	}
}
.device-icon {
	font-size: 30px;
}
.device-selection {
	width: 100%;
}
.volume-slider {
	span {
		width: 6.25rem;
		text-align: left;
	}
	input.form-control-range {
		flex: 1;
	}
}
</style>
