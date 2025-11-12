<template>
	<div class="grid md:grid-cols-3 gap-6">
		<div>
			<label for="numRobots" class="block text-sm font-medium text-gray-700"
				>Number of Robots (N)</label
			>
			<input
				type="number"
				id="numRobots"
				:value="numRobotsInput"
				@input="$emit('update:num-robots-input', parseInt($event.target.value))"
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
				:value="moveSequenceInput"
				@input="
					$emit('update:move-sequence-input', $event.target.value.toUpperCase())
				"
				:disabled="isRunning"
				class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border font-mono uppercase tracking-widest focus:ring-blue-500 focus:border-blue-500"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
	defineProps<{
		numRobotsInput: number;
		moveSequenceInput: string;
		stepsPerSecond: number;
		isRunning: boolean;
	}>();

	defineEmits(["update:num-robots-input", "update:move-sequence-input"]);
</script>
