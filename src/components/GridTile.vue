<template>
	<div
		class="tile relative flex justify-center items-center border transition-colors duration-200 ease-out"
		:class="tileClasses"
	>
		<span
			v-if="presents > 0"
			class="present-count text-yellow-800 bg-yellow-200 rounded-full h-4 w-4 flex items-center justify-center font-bold"
		>
			{{ presents }}
		</span>
	</div>
</template>

<script setup lang="ts">
	import { computed } from "vue";

	const props = defineProps<{
		x: number;
		y: number;
		presents: number;
		hasCollision: boolean;
	}>();

	const isEvenSum = computed(() => (props.x + props.y) % 2 === 0);

	const tileClasses = computed(() => {
		const classes: string[] = [];

		const isOrigin = props.x === 0 && props.y === 0;

		if (props.hasCollision) {
			classes.push("bg-red-400", "animate-pulse", "border-red-600");
		} else if (isOrigin) {
			classes.push("bg-blue-100", "border-2", "border-blue-500");
		} else if (props.presents > 0) {
			classes.push("bg-yellow-100", "border-yellow-300");
		} else {
			classes.push("border-gray-200");
			classes.push(isEvenSum.value ? "bg-white" : "bg-gray-100");
		}

		return classes;
	});
</script>

<style scoped>
	.tile {
		width: 3rem;
		height: 3rem;
		min-width: 3rem;
		min-height: 3rem;
	}

	.present-count {
		position: absolute;
		top: 0.25rem;
		right: 0.25rem;
		font-size: 0.65rem;
		line-height: 1;
		z-index: 20;
	}
</style>
