<style>
	.tile {
		width: 3rem;
		height: 3rem;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		border: 1px solid #e5e7eb;
		position: relative;
		transition: all 0.2s ease-out;
	}
	.robot-icon {
		width: 1.5rem;
		height: 1.5rem;
		position: absolute;
		bottom: 0.5rem;
		left: 0.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.25rem;
		line-height: 1;
		transition: transform 0.2s;
	}
	.present-count {
		position: absolute;
		top: 0.25rem;
		right: 0.25rem;
		font-size: 0.75rem;
		font-weight: 600;
		line-height: 1;
	}
</style>

<script setup lang="ts">
	import { defineProps } from "vue";

	interface TileData {
		x: number;
		y: number;
		key: string;
		presents: number;
		robotIds: number[];
	}

	const props = defineProps<{
		tileData: TileData;
	}>();
</script>

<template>
	<div
		class="tile"
		:class="{
			'bg-yellow-100': tileData.presents > 0,
			'bg-blue-100 ring-2 ring-blue-500': tileData.x === 0 && tileData.y === 0,
		}"
	>
		<!-- Presents Count -->
		<span v-if="tileData.presents > 0" class="present-count text-yellow-800">{{
			tileData.presents
		}}</span>

		<!-- Coordinates -->
		<span class="text-xs text-gray-400 absolute top-0 left-0 p-0.5"
			>{{ tileData.x }},{{ tileData.y }}</span
		>

		<!-- Robot Icons -->
		<div
			v-for="robotId in tileData.robotIds"
			:key="robotId"
			class="robot-icon bg-indigo-500 text-white rounded-full shadow-lg"
			:style="{ transform: `translate(${robotId * 2}px, 0)` }"
		>
			<!-- Icon SVG -->
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-4 w-4"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<circle cx="12" cy="12" r="10"></circle>
				<path d="M16 12H8"></path>
				<path d="M12 8V16"></path>
			</svg>
		</div>
	</div>
</template>
