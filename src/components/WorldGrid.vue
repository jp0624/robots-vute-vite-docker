<template>
	<div class="w-full flex items-center justify-center">
		<div
			class="p-4 border w-auto max-w-full inline-block border-gray-300 rounded-lg shadow-inner bg-gray-50 max-h-[80vh] overflow-auto"
		>
			<div
				v-for="row in houseGrid?.rows || []"
				:key="`y-${row?.[0]?.y ?? Math.random()}`"
				class="flex flex-nowrap"
			>
				<GridTile
					v-for="tile in row || []"
					:key="tile?.key ?? Math.random()"
					:x="tile?.x ?? 0"
					:y="tile?.y ?? 0"
					:presents="tile?.presents ?? 0"
					:robots-present="tile?.robotsPresent ?? []"
				/>
			</div>
		</div>
	</div>
	<p class="mt-4 text-sm text-gray-500">
		Grid shows visited tiles and current robot locations. **Positive Y is up,
		Negative Y is down.** The grid dynamically expands to show all visited
		houses and robot positions, maintaining a center around (0,0).
	</p>
</template>

<script setup lang="ts">
	import GridTile from "./GridTile.vue";
	import type { HouseGrid } from "../types";

	defineProps<{
		houseGrid: HouseGrid;
	}>();
</script>
