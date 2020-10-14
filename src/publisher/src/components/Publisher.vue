<template>
	<div>Component {{ message }}</div>
	<div>
		<input type="text" v-model="state.username" />
		<button @click="login">OK</button>
	</div>
	<div>Hello {{ state.username }}</div>
</template>
<script lang="ts">
import { reactive, onMounted, computed, defineComponent } from "vue"
// eslint-disable-next-line @typescript-eslint/no-var-requires
const AgoraRTC = require("agora-rtc-sdk")
//import { AgoraRTC } from "agora-rtc-sdk"


interface Subscriber {
	username: string
	rtc: RTC
	option: AgoraOption
}
class RTC {}
interface AgoraOption {
	appID: string
	channel: string
	uid: string
	token: string
}
export default defineComponent({
	name: "Publisher",
	props: {
		message: String,
		appId: String
	},
	setup(props, { emit }) {
		const state = reactive<Subscriber>({
			username: "",
			rtc: {
				client: null,
				joined: false,
				published: false,
				localStream: null,
				remoteStreams: [],
				params: {}
			},
			option: {
				appID: props.appId === undefined ? "" : props.appId,
				channel: "",
				uid: "",
				token: ""
			}
		})

		onMounted(() => {
			console.log("message is " + props.message)

			// Create a client
			const client = AgoraRTC.createClient({
				mode: "live",
				codec: "h264"
			})

			// Initialize the client
			client.init(
				state.option.appID,
				function() {
					console.log("init success")
				},
				(err: any) => {
					console.error(err)
				}
			)

			client.
		})

		const login = () => {
			emit("login", {
				username: state.username
			})

			console.log(JSON.stringify(state))
		}

		const watch = () => {
			console.info(JSON.stringify(state))
		}

		return {
			login,
			state,
			watch
		}
	}
})
</script>
