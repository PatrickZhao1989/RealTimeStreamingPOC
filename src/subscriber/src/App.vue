<template>
	<Audience msg="Streaming subscriber" />
</template>

<script lang="ts">
import { defineComponent } from "vue"
import Audience from "./components/Audience.vue"

export default defineComponent({
	name: "App",
	components: {
		Audience,
	},
})
</script>

