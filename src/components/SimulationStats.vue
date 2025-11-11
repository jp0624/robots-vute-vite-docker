<script setup lang="ts">
	import { defineProps } from "vue";

	interface RobotPosition {
		id: number;
		name: string;
		position: string;
	}

	const props = defineProps<{
		simulationMessage: string;
		simulationStatus: string;
		totalPresents: number;
		uniqueHousesWithOnePresent: number;
		robotPositions: RobotPosition[];
	}>();
</script>

<template>
	<div class="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
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

		<h3 class="text-lg font-semibold text-gray-800 mt-4 mb-2">
			Robot Positions
		</h3>
		<ul class="space-y-1">
			<li
				v-for="robot in robotPositions"
				:key="robot.id"
				class="flex justify-between items-center text-sm p-1 rounded-md bg-gray-50"
			>
				<span class="font-mono text-gray-700"
					>{{ robot.name }} (ID: {{ robot.id }})</span
				>
				<span class="font-bold text-indigo-500">{{ robot.position }}</span>
			</li>
		</ul>
	</div>
</template>
