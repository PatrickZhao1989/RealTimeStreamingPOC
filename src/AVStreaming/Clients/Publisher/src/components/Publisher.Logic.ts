import { reactive } from "vue"
import AgoraRTC, { ICameraVideoTrack, ILocalAudioTrack, ILocalTrack, IMicrophoneAudioTrack, UID } from "agora-rtc-sdk-ng"

type presetAudioConfigType =
	| "music_standard"
	| "speech_low_quality"
	| "speech_standard"
	| "standard_stereo"
	| "high_quality"
	| "high_quality_stereo"
	| undefined
type presetVideoConfigType = "120p" | "180p" | "240p" | "360p" | "480p" | "720p" | "1080p" | "1440p" | undefined
type optimizationMode = "motion" | "detail" | undefined

const state = reactive({
	rtc: {
		client: AgoraRTC.createClient({
			mode: "live",
			codec: "vp8",
		}),
		uid: {} as UID,
		broadcastingToggle: "btn-success",
		showConfig: false,
		isBroadcasting: false,
		audioVolume: 100,
		audioConfig: {
			encoderConfig: "music_standard" as presetAudioConfigType,
		},
		videoConfig: {
			encoderConfig: "480p" as presetVideoConfigType,
			optimizationMode: undefined as optimizationMode,
		},
		videoIsOn: true,
		localAudioTrack: (null as unknown) as ILocalTrack,
		localVideoTrack: (null as unknown) as ILocalTrack,
		currentAudioDevice: (null as unknown) as MediaDeviceInfo,
		currentVideoDevice: (null as unknown) as MediaDeviceInfo,
	},
	devices: {
		audioDevices: [] as MediaDeviceInfo[],
		videoDevices: [] as MediaDeviceInfo[],
	},
	option: {
		channel: "",
		token: "",
	},
})

async function connect() {
	try {
		const uid = await state.rtc.client.join("", state.option.channel, state.option.token)
		await state.rtc.client.setStreamFallbackOption(uid, 2)
		console.info(`Joined channel - UID - ${uid}`)
		await state.rtc.client.setClientRole("host")

		state.rtc.localAudioTrack?.stop()
		state.rtc.localVideoTrack?.stop()

		state.rtc.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack({
			encoderConfig: state.rtc.audioConfig.encoderConfig,
			microphoneId: state.rtc.currentAudioDevice.deviceId,
		})
		state.rtc.localVideoTrack = await AgoraRTC.createCameraVideoTrack({
			encoderConfig: state.rtc.videoConfig.encoderConfig,
			optimizationMode: state.rtc.videoConfig.optimizationMode,
			cameraId: state.rtc.currentVideoDevice.deviceId,
		})

		if (state.rtc.localAudioTrack && state.rtc.localVideoTrack) {
			state.rtc.localVideoTrack?.play("video-container")

			// Enable Dual stream
			await state.rtc.client.publish([state.rtc.localAudioTrack as ILocalTrack, state.rtc.localVideoTrack as ILocalTrack])
		} else {
			throw Error("Unable to start audio or video track, please check your device")
		}

		state.rtc = { ...state.rtc, audioVolume: 100, isBroadcasting: true, broadcastingToggle: "btn-danger" }
	} catch (error) {
		throw error
	}
}

function disconnect() {
	// Leave the channel
	state.rtc.localAudioTrack?.stop()
	state.rtc.localVideoTrack?.stop()
	return state.rtc.client.leave()
}

const toggleBroadcast = async () => {
	if (state.rtc.isBroadcasting) {
		await disconnect()
		state.rtc = { ...state.rtc, isBroadcasting: false, broadcastingToggle: "btn-success" }
	} else {
		await connect()
	}
}

const adjustAudioVolume = (volume: any) => {
	if (state.rtc.localAudioTrack) (state.rtc.localAudioTrack as ILocalAudioTrack).setVolume(parseInt(volume))
}

const toggleAudioOnOff = async () => {
	if (Number(state.rtc.audioVolume) === 0) {
		state.rtc.audioVolume = 100
		state.rtc.localAudioTrack.stop()
		state.rtc.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack({
			encoderConfig: state.rtc.audioConfig.encoderConfig,
		})
		await state.rtc.client.publish(state.rtc.localAudioTrack as ILocalTrack)
	} else {
		await state.rtc.client.unpublish(state.rtc.localAudioTrack as ILocalTrack)
		if (state.rtc.localAudioTrack) state.rtc.localAudioTrack.stop()
		state.rtc.audioVolume = 0
	}
	adjustAudioVolume(state.rtc.audioVolume)
}

const toggleVideoOnOff = async () => {
	if (state.rtc.videoIsOn) {
		await state.rtc.client.unpublish(state.rtc.localVideoTrack as ILocalTrack)
		if (state.rtc.localVideoTrack) state.rtc.localVideoTrack.stop()
		state.rtc.videoIsOn = false
	} else {
		state.rtc.localVideoTrack = await AgoraRTC.createCameraVideoTrack({
			encoderConfig: state.rtc.videoConfig.encoderConfig,
		})
		await state.rtc.client.publish(state.rtc.localVideoTrack as ILocalTrack)
		state.rtc.localVideoTrack.play("video-container")
		state.rtc.videoIsOn = true
	}
	adjustAudioVolume(state.rtc.audioVolume)
}

const switchAudioDevice = () => (state.rtc.localAudioTrack as IMicrophoneAudioTrack).setDevice(state.rtc.currentAudioDevice.deviceId)
const switchVideoDevice = () => (state.rtc.localVideoTrack as ICameraVideoTrack).setDevice(state.rtc.currentVideoDevice.deviceId)

const toggleConfigPanel = () => (state.rtc.showConfig = !state.rtc.showConfig)

export { state, toggleBroadcast, toggleAudioOnOff, toggleVideoOnOff, adjustAudioVolume, switchAudioDevice, switchVideoDevice, toggleConfigPanel }
