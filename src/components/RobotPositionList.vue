<script setup lang="ts">
	import { defineProps } from "vue";

	interface RobotPosition {
		id: number;
		name: string;
		position: string;
	}

	const props = defineProps<{
		robotPositions: RobotPosition[];
	}>();
</script>

<template>
	<h3 class="text-lg font-semibold text-gray-800 mt-4 mb-2">Robot Positions</h3>
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
</template>
