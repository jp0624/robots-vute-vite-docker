<template>
	<div class="w-full flex items-center justify-center">
		<div
			ref="gridContainer"
			class="p-4 border w-auto max-w-full inline-block border-gray-300 rounded-lg shadow-inner bg-gray-50 max-h-[75vh] overflow-auto relative"
		>
			<!-- Tiles -->
			<div
				v-for="row in houseGrid.rows"
				:key="`y-${row[0]?.y}`"
				class="flex flex-nowrap"
			>
				<GridTile
					v-for="tile in row"
					:key="tile.key"
					:x="tile.x"
					:y="tile.y"
					:presents="tile.presents"
					:hasCollision="tile.robotsPresent.some((r) => r.collision)"
				/>
			</div>

			<!-- Robot overlay -->
			<div class="absolute top-0 left-0 w-full h-full pointer-events-none">
				<div
					v-for="robot in robots"
					:key="robot.id"
					class="robot rounded-full border border-white shadow-lg absolute"
					:class="robot.colorClass"
					:style="robotStyle(robot)"
				></div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { ref } from "vue";
	import GridTile from "./GridTile.vue";
	import type { HouseGrid, Robot } from "../types";

	const props = defineProps<{
		houseGrid: HouseGrid;
		robots: Robot[];
		tileSize?: number;
	}>();

	const gridContainer = ref<HTMLElement | null>(null);
	const tileSize = props.tileSize || 48;

	const robotStyle = (robot: Robot) => {
		// Compute pixel positions relative to the grid
		const left = (robot.x - props.houseGrid.minX) * tileSize + tileSize / 2 - 6; // robot 12px
		const top = (props.houseGrid.maxY - robot.y) * tileSize + tileSize / 2 - 6;
		return {
			width: "12px",
			height: "12px",
			top: "1em",
			left: "1em",
			transform: `translate(${left}px, ${top}px)`,
			transition: "transform 0.3s ease",
			zIndex: 50,
		};
	};
</script>

<style scoped>
	.robot {
		position: absolute;
	}
</style>
