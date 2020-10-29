<template>
	<Subscriber />
</template>

<script lang="ts">
import { defineComponent } from "vue"
import Subscriber from "@/components/Subscriber.vue"

export default defineComponent({
	name: "Home",
	components: {
		Subscriber,
	},
})
</script>
