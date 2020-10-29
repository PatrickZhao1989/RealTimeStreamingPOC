<template>
	<Publisher />
</template>

<script lang="ts">
import { defineComponent } from "vue"
import Publisher from "@/components/Publisher.vue"

export default defineComponent({
	name: "Home",
	components: {
		Publisher,
	},
})
</script>
