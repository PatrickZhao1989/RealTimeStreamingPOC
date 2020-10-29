<template>
	<div class="container-fluid">
		<div class="control-panel py-3 px-2 border-bottom">
			<div class="row no-gutters">
				<div class="col-lg-5 mr-lg-2">
					<div class="row no-gutters">
						<div class="col-3 col-sm-2 d-flex justify-content-center">
							<button
								type="button"
								class="btn btn-default btn-with-icon d-flex align-items-center justify-content-center"
								@click="toggleAudioOnOff()"
								:disabled="!state.rtc.isBroadcasting"
							>
								<span>
									<i class="fas fa-microphone device-icon" v-if="Number(state.rtc.audioVolume) !== 0"></i>
									<i class="fas fa-microphone-slash device-icon" v-if="Number(state.rtc.audioVolume) == 0"></i>
								</span>
							</button>
						</div>
						<div class="col-9 col-sm-10 d-flex align-items-center">
							<select
								name="audioDevice"
								v-model="state.rtc.currentAudioDevice"
								@change="switchAudioDevice()"
								class="device-selection form-control"
							>
								<option
									v-for="(audioDevice, index) in state.devices.audioDevices"
									:key="index"
									:value="audioDevice"
									>{{ audioDevice.label }}</option
								>
							</select>
						</div>
					</div>
					<div>
						<div class="col-9 col-sm-10 ml-auto d-flex align-items-center w-100 volume-slider px-1">
							<span class="mr-2 p-0"> Volume: {{ state.rtc.audioVolume }} </span>
							<input
								type="range"
								name="volumn"
								min="0"
								max="1000"
								step="1"
								class="form-control-range volume-slider"
								@change="adjustAudioVolume(state.rtc.audioVolume)"
								v-model="state.rtc.audioVolume"
								:disabled="!state.rtc.localAudioTrack"
							/>
						</div>
					</div>
				</div>
				<div class="col-lg-5 mr-lg-auto mt-2 mt-lg-0">
					<div class="row no-gutters">
						<div class="col-3 col-sm-2 d-flex justify-content-center">
							<button
								type="button"
								class="btn btn-default btn-with-icon d-flex align-items-center justify-content-center"
								@click="toggleVideoOnOff()"
								:disabled="!state.rtc.isBroadcasting"
							>
								<span>
									<i class="fas fa-video device-icon" v-if="state.rtc.videoIsOn"></i>
									<i class="fas fa-video-slash device-icon" v-if="!state.rtc.videoIsOn"></i>
								</span>
							</button>
						</div>

						<div class="col-9 col-sm-10 d-flex align-items-center mt-2">
							<select
								name="videoDevice"
								v-model="state.rtc.currentVideoDevice"
								@change="switchVideoDevice()"
								class="device-selection form-control"
							>
								<option
									v-for="(videoDevice, index) in state.devices.videoDevices"
									v-bind:key="index"
									:value="videoDevice"
									>{{ videoDevice.label }}</option
								>
							</select>
						</div>
					</div>
				</div>
				<div class="col-lg-1">
					<button
						class="btn btn-primary float-right w-100 m-0 mt-3 mt-lg-0"
						type="button"
						@click="toggleConfigPanel()"
						:disabled="state.rtc.isBroadcasting"
					>
						Configuration
					</button>
					<button
						class="btn float-right btn-with-icon w-100 m-0 mt-3 mt-lg-0"
						:class="state.rtc.broadcastingToggle"
						type="button"
						@click="toggleBroadcast()"
					>
						{{ state.rtc.isBroadcasting ? "Stop" : "Start" }}
					</button>
				</div>
			</div>

			<div class="row" v-show="state.rtc.showConfig && !state.rtc.isBroadcasting">
				<form v-on:submit.prevent>
					<div class="form-group">
						<label for="audioEncoderConfig">Audio Encoder</label>
						<select class="form-control" name="audioEncoderConfig" v-model="state.rtc.audioConfig.encoderConfig">
							<option>speech_low_quality</option>
							<option>speech_standard</option>
							<option>music_standard</option>
							<option>standard_stereo</option>
							<option>high_quality</option>
							<option>high_quality_stereo</option>
						</select>
					</div>
					<div class="form-group">
						<label for="videoEncoderConfig">Video Encoder</label>
						<select class="form-control" name="videoEncoderConfig" v-model="state.rtc.videoConfig.encoderConfig">
							<option>120p</option>
							<option>180p</option>
							<option>240p</option>
							<option>360p</option>
							<option>480p</option>
							<option>720p</option>
							<option>1080p</option>
							<option>1440p</option>
							<option>4K</option>
						</select>
					</div>
					<div class="form-group">
						<label for="videoOptimizationMode">Video Optimization Mode</label>
						<select class="form-control" name="videoOptimizationMode" v-model="state.rtc.videoConfig.optimizationMode">
							<option value="detail">detail</option>
							<option value="motion">motion</option>
							<option value="undefined">default</option>
						</select>
					</div>
				</form>
			</div>
		</div>

		<div class="video-grid flex-grow" id="video-container">
			<span class="recording-button text-success" v-show="state.rtc.isBroadcasting"> <i class="fas fa-dot-circle"></i></span>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from "vue"
import { useRoute } from "vue-router"
import AgoraRTC from "agora-rtc-sdk-ng"

import {
	state,
	toggleBroadcast,
	toggleAudioOnOff,
	toggleVideoOnOff,
	adjustAudioVolume,
	switchAudioDevice,
	switchVideoDevice,
	toggleConfigPanel,
} from "./Publisher.Logic"
export default defineComponent({
	name: "Publisher",
	props: {
		msg: String,
		defaultRole: String,
	},
	setup() {
		const route = useRoute()
		state.option = {
			channel: route.query.channel as string,
			token: route.query.token as string,
		}
		console.log(`Connection information - ${JSON.stringify(state.option)}`)

		onMounted(async () => {
			const devices = await AgoraRTC.getDevices()
			state.devices.videoDevices = devices.filter(device => device.kind === "videoinput")
			state.devices.audioDevices = devices.filter(device => device.kind === "audioinput")

			if (state.devices.videoDevices.length === 0 && state.devices.audioDevices.length === 0) {
				alert("No audio video input device, please check your system setting")
				throw new Error("No video device")
			}

			// Set default device
			state.rtc.currentAudioDevice = state.devices?.audioDevices[0]
			state.rtc.currentVideoDevice = state.devices?.videoDevices[0]

			// Enable dual stream
			// As per https://agoraio-community.github.io/AgoraWebSDK-NG/docs/en/stream_fallback
			await state.rtc.client.enableDualStream()
		})

		return {
			state,
			toggleBroadcast,
			toggleAudioOnOff,
			toggleVideoOnOff,
			adjustAudioVolume,
			switchAudioDevice,
			switchVideoDevice,
			toggleConfigPanel,
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
