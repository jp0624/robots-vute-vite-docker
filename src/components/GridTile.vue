<template>
	<div
		class="tile relative flex flex-col justify-center items-center text-xs p-1 transition duration-100 ease-out border"
		:class="tileClasses"
	>
		<!-- Present Count -->
		<span
			v-if="presents > 0"
			class="present-count text-yellow-800 bg-yellow-200 rounded-full h-4 w-4 flex items-center justify-center font-bold"
		>
			{{ presents }}
		</span>

		<!-- Robot Icons -->
		<div
			class="robot-icons absolute bottom-0 left-0 right-0 top-0 flex flex-wrap p-1 justify-center items-center"
		>
			<div
				v-for="(robot, index) in robotsPresent"
				:key="robot.id"
				class="robot-icon w-3 h-3 rounded-full shadow-lg border border-white"
				:class="[robot.colorClass]"
				:style="{
					zIndex: 10 + index,
					// Offset slightly to show multiple robots on the same tile
					transform: `translate(${
						index * 10 - (robotsPresent.length - 1) * 5
					}%, ${index * 10 - (robotsPresent.length - 1) * 5}%)`,
				}"
			></div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { computed } from "vue";
	import type { RobotPresence } from "../types";

	const props = defineProps<{
		x: number;
		y: number;
		presents: number;
		robotsPresent: RobotPresence[];
	}>();

	// Determine if the sum of coordinates (for checkerboard pattern) is even
	const isEvenSum = computed(() => (props.x + props.y) % 2 === 0);

	// Dynamic class binding logic
	const tileClasses = computed(() => {
		const classes = [];
		const isOrigin = props.x === 0 && props.y === 0;

		if (isOrigin) {
			// Priority 1: Origin (Blue)
			classes.push("bg-blue-100", "border-2", "border-blue-500");
		} else if (props.presents > 0) {
			// Priority 2: Visited (Yellow)
			classes.push("bg-yellow-100", "border-yellow-300");
		} else {
			// Priority 3: Unvisited - Apply Checkerboard (Light Gray / White)
			classes.push("border-gray-200"); // Default border for checkerboard tiles
			if (isEvenSum.value) {
				// White tile
				classes.push("bg-white");
			} else {
				// Light gray tile
				classes.push("bg-gray-100");
			}
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
		/* Note: border is applied via class binding */
	}

	.present-count {
		position: absolute;
		top: 0.25rem;
		right: 0.25rem;
		font-size: 0.65rem;
		line-height: 1;
		z-index: 20;
	}

	.robot-icon {
		position: absolute;
	}
</style>
