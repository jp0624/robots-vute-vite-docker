<template>
	<div class="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
		<h3 class="text-xl font-bold text-gray-800 mb-3 border-b pb-2">
			Robot Positions
		</h3>

		<div class="space-y-2 max-h-60 overflow-y-auto">
			<div
				v-for="robot in robotPositions"
				:key="robot.id"
				class="flex justify-between items-center text-sm p-3 rounded-lg border transition duration-100 ease-in-out hover:bg-gray-50"
			>
				<div class="flex items-center space-x-3">
					<div :class="['w-4 h-4 rounded-full shadow', robot.colorClass]"></div>
					<span class="font-semibold text-gray-800">{{ robot.name }}</span>
					<span class="text-xs text-gray-500">(ID: {{ robot.id }})</span>
				</div>
				<span class="font-bold text-indigo-600 text-lg font-mono">{{
					robot.position
				}}</span>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import type { RobotPosition } from "../types";

	defineProps<{
		robotPositions: RobotPosition[];
	}>();
</script>
