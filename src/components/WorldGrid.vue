<script setup lang="ts">
	import { defineProps } from "vue";
	import GridTile from "./GridTile.vue";

	interface TileData {
		x: number;
		y: number;
		key: string;
		presents: number;
		robotIds: number[];
	}

	interface HouseGridData {
		rows: TileData[][];
	}

	const props = defineProps<{
		houseGrid: HouseGridData;
	}>();
</script>

<template>
	<div
		class="bg-white p-6 rounded-xl shadow-lg border border-gray-200 overflow-x-auto"
	>
		<h2 class="text-xl font-bold text-gray-800 mb-3 border-b pb-2">
			World Grid View
		</h2>
		<div class="inline-block">
			<div v-for="row in houseGrid.rows" :key="`y-${row[0].y}`" class="flex">
				<GridTile v-for="tile in row" :key="tile.key" :tileData="tile" />
			</div>
		</div>
		<p class="mt-4 text-sm text-gray-500">
			Grid shows visited tiles and current robot locations. Blue tile is the
			(0,0) origin. **Positive Y is up, Negative Y is down.**
		</p>
	</div>
</template>
