<template>
	<div class="flex flex-wrap gap-4 pt-4 border-t border-gray-100">
		<button
			@click="
				isRunning
					? $emit('stop-viz')
					: moveIndex === 0
					? $emit('start-viz')
					: $emit('run-full')
			"
			:disabled="moveIndex >= moveSequenceLength && !isRunning"
			:class="[
				'px-4 py-2 font-semibold rounded-lg shadow-md transition duration-150 ease-in-out',
				isRunning
					? 'bg-red-500 text-white hover:bg-red-600'
					: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400',
			]"
		>
			{{
				isRunning ? "Stop Viz" : moveIndex === 0 ? "Start Viz" : "Run Remainder"
			}}
		</button>

		<button
			@click="$emit('step-forward')"
			:disabled="isRunning || moveIndex >= moveSequenceLength"
			class="px-4 py-2 bg-teal-500 text-white font-semibold rounded-lg shadow-md hover:bg-teal-600 transition duration-150 ease-in-out disabled:bg-gray-400"
		>
			Step Forward
		</button>

		<button
			@click="$emit('step-back')"
			:disabled="!canStepBack"
			class="px-4 py-2 bg-yellow-500 text-white font-semibold rounded-lg shadow-md hover:bg-yellow-600 transition duration-150 ease-in-out disabled:bg-gray-400"
		>
			Step Back
		</button>

		<button
			@click="$emit('reset')"
			class="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-300 transition duration-150 ease-in-out"
		>
			Reset
		</button>

		<div
			class="flex items-center ml-auto px-4 py-2 text-sm font-medium rounded-lg bg-gray-50 text-gray-600"
		>
			Move: <span class="font-bold text-gray-800 ml-1">{{ moveIndex }}</span> /
			{{ moveSequenceLength }}
		</div>
	</div>
</template>

<script setup lang="ts">
	defineProps<{
		isRunning: boolean;
		moveIndex: number;
		moveSequenceLength: number;
		canStepBack: boolean;
	}>();

	defineEmits([
		"run-full",
		"start-viz",
		"stop-viz",
		"step-forward",
		"step-back",
		"reset",
	]);
</script>
