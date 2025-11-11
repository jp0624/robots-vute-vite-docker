<script setup lang="ts">
	import { defineProps } from "vue";

	const props = defineProps<{
		simulationMessage: string;
		simulationStatus: string;
		totalPresents: number;
		uniqueHousesWithOnePresent: number;
	}>();
</script>

<template>
	<div>
		<h2 class="text-xl font-bold text-gray-800 mb-3 border-b pb-2">
			Simulation Status
		</h2>
		<p class="mb-2 text-sm text-gray-600">{{ simulationMessage }}</p>
		<p class="text-lg font-semibold mb-3">{{ simulationStatus }}</p>

		<div class="space-y-2">
			<div class="flex justify-between border-t pt-2">
				<span class="text-gray-600 font-medium">Total Presents Delivered:</span>
				<span class="font-extrabold text-indigo-600 text-xl">{{
					totalPresents
				}}</span>
			</div>
			<div class="flex justify-between">
				<span class="text-gray-600 font-medium"
					>Houses with $\ge 1$ Present:</span
				>
				<span class="font-extrabold text-green-600 text-xl">{{
					uniqueHousesWithOnePresent
				}}</span>
			</div>
		</div>
	</div>
</template>
