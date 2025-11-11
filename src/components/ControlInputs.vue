<script setup lang="ts">
	import { defineProps, defineEmits } from "vue";

	const props = defineProps<{
		numRobotsInput: number;
		moveSequenceInput: string;
		isRunning: boolean;
	}>();

	const emit = defineEmits([
		"update:numRobotsInput",
		"update:moveSequenceInput",
	]);

	// Handlers for v-model updates
	const updateNumRobots = (event: Event) => {
		emit(
			"update:numRobotsInput",
			parseInt((event.target as HTMLInputElement).value) || 1
		);
	};

	const updateMoveSequence = (event: Event) => {
		emit("update:moveSequenceInput", (event.target as HTMLInputElement).value);
	};
</script>

<template>
	<div class="grid md:grid-cols-3 gap-6 mb-6">
		<div>
			<label for="numRobots" class="block text-sm font-medium text-gray-700"
				>Number of Robots (N)</label
			>
			<input
				type="number"
				id="numRobots"
				:value="props.numRobotsInput"
				@input="updateNumRobots"
				:disabled="isRunning"
				min="1"
				class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500"
			/>
		</div>
		<div class="md:col-span-2">
			<label for="moveSequence" class="block text-sm font-medium text-gray-700"
				>Movement Sequence (^V&lt;>)</label
			>
			<input
				type="text"
				id="moveSequence"
				:value="props.moveSequenceInput"
				@input="updateMoveSequence"
				:disabled="isRunning"
				class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border font-mono uppercase tracking-widest focus:ring-blue-500 focus:border-blue-500"
			/>
		</div>
	</div>
</template>
