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

interface Publisher {
	username: string
	password: string
	lowerCaseUserName: string
}
interface RTC {
	client: string
	joined: false
	published: false
	localStream: null
}
export default defineComponent({
	name: "Publisher",
	props: {
		message: String
	},
	setup(props, { emit }) {
		const state: Publisher = reactive({
			username: "",
			password: "",
			lowerCaseUserName: computed(() => state.username.toLowerCase())
		})

		onMounted(() => {
			console.log("message is " + props.message)
		})

		const login = () => {
			emit("login", {
				username: state.username,
				password: state.password
			})

			console.log(JSON.stringify(state))
		}

		return {
			login,
			state
		}
	}
})
</script>
