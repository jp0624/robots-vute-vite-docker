<script setup lang="ts">
	import { defineProps, defineEmits } from "vue";

	const props = defineProps<{
		isRunning: boolean;
		isSimulationComplete: boolean;
	}>();

	const emit = defineEmits(["runFull", "startViz", "stopViz", "step", "reset"]);
</script>

<template>
	<div class="flex flex-wrap gap-4">
		<button
			@click="emit('runFull')"
			:disabled="isRunning"
			class="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-150 ease-in-out disabled:bg-gray-400"
		>
			Run Full Simulation
		</button>
		<button
			@click="emit('startViz')"
			:disabled="isRunning || isSimulationComplete"
			class="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-150 ease-in-out disabled:bg-gray-400"
		>
			Start Visualization
		</button>
		<button
			@click="emit('stopViz')"
			v-if="isRunning"
			class="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition duration-150 ease-in-out"
		>
			Stop
		</button>
		<button
			@click="emit('step')"
			:disabled="isRunning || isSimulationComplete"
			class="px-4 py-2 bg-teal-500 text-white font-semibold rounded-lg shadow-md hover:bg-teal-600 transition duration-150 ease-in-out disabled:bg-gray-400"
		>
			Step (1 Turn)
		</button>
		<button
			@click="emit('reset')"
			class="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-300 transition duration-150 ease-in-out"
		>
			Reset
		</button>
	</div>
</template>
