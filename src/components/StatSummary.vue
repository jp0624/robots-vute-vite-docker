<template>
	<div class="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
		<h2 class="text-xl font-bold text-gray-800 mb-3 border-b pb-2">
			Simulation Summary
		</h2>

		<div class="p-3 mb-4 rounded-lg" :class="statusClass">
			<p class="font-medium text-sm">{{ simulationMessage }}</p>
			<p class="text-lg font-bold">{{ simulationStatus }}</p>
		</div>

		<div class="space-y-1 flex border-t text-sm">
			<div class="flex items-center pt-2 flex-1">
				<span class="text-gray-600 font-medium">Total Presents Delivered:</span>
				<span class="px-2.5 font-extrabold text-indigo-600 text-xl">{{
					totalPresents
				}}</span>
			</div>
			<div class="flex items-center flex-1">
				<span class="text-gray-600 font-medium">Unique Houses Visited:</span>
				<span class="px-2.5 font-extrabold text-green-600 text-xl">{{
					uniqueHousesWithOnePresent
				}}</span>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { computed } from "vue";

	const props = defineProps<{
		simulationMessage: string;
		simulationStatus: string;
		totalPresents: number;
		uniqueHousesWithOnePresent: number;
	}>();

	const statusClass = computed(() => {
		if (props.simulationStatus.includes("Simulation Ended")) {
			return "bg-green-100 text-green-800 border border-green-300";
		}
		if (props.simulationStatus.includes("Ready to start")) {
			return "bg-blue-100 text-blue-800 border border-blue-300";
		}
		return "bg-gray-100 text-gray-800 border border-gray-300";
	});
</script>
