<template>
	<div class="flex-1 pl-10 py-5">
		<h2 class="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
			Simulation Controls
		</h2>

		<ControlInputs
			:num-robots-input="numRobotsInput"
			:move-sequence-input="moveSequenceInput"
			:steps-per-second="stepsPerSecond"
			:is-running="isRunning"
			@update:num-robots-input="$emit('update:num-robots-input', $event)"
			@update:move-sequence-input="$emit('update:move-sequence-input', $event)"
		/>

		<div class="mb-6 mt-4">
			<label
				for="stepsPerSecond"
				class="block text-sm font-medium text-gray-700"
			>
				Visualization Speed:
				<span class="font-bold text-blue-600">{{ stepsPerSecond }}</span>
				steps/sec
			</label>
			<input
				type="range"
				id="stepsPerSecond"
				:value="stepsPerSecond"
				@input="$emit('update:steps-per-second', parseInt($event.target.value))"
				min="1"
				max="20"
				step="1"
				:disabled="isRunning"
				class="mt-2 w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer range-lg"
			/>
		</div>

		<ActionButtons
			:is-running="isRunning"
			:move-index="moveIndex"
			:move-sequence-length="moveSequenceLength"
			:can-step-back="canStepBack"
			@run-full="$emit('run-full')"
			@start-viz="$emit('start-viz')"
			@stop-viz="$emit('stop-viz')"
			@step-forward="$emit('step-forward')"
			@step-back="$emit('step-back')"
			@reset="$emit('reset')"
		/>
	</div>
</template>

<script setup lang="ts">
	import ControlInputs from "./ControlInputs.vue";
	import ActionButtons from "./ActionButtons.vue";

	defineProps<{
		numRobotsInput: number;
		moveSequenceInput: string;
		stepsPerSecond: number;
		isRunning: boolean;
		moveIndex: number;
		moveSequenceLength: number;
		canStepBack: boolean;
	}>();

	defineEmits([
		"update:num-robots-input",
		"update:move-sequence-input",
		"update:steps-per-second",
		"run-full",
		"start-viz",
		"stop-viz",
		"step-forward",
		"step-back",
		"reset",
	]);
</script>
