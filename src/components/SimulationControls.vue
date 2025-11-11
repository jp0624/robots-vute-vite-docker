<script setup lang="ts">
	import { defineProps, defineEmits } from "vue";

	const props = defineProps<{
		numRobotsInput: number;
		moveSequenceInput: string;
		isRunning: boolean;
		isSimulationComplete: boolean;
	}>();

	const emit = defineEmits([
		"update:numRobotsInput",
		"update:moveSequenceInput",
		"runFull",
		"startViz",
		"stopViz",
		"step",
		"reset",
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
	<div class="bg-white p-6 rounded-xl shadow-lg mb-8 border border-gray-200">
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
				<label
					for="moveSequence"
					class="block text-sm font-medium text-gray-700"
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
	</div>
</template>
