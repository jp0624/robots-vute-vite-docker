<script setup lang="ts">
	import { defineProps, defineEmits } from "vue";
	import ControlInputs from "./ControlInputs.vue";
	import ActionButtons from "./ActionButtons.vue";

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
</script>

<template>
	<div class="bg-white p-6 rounded-xl shadow-lg mb-8 border border-gray-200">
		<ControlInputs
			:numRobotsInput="props.numRobotsInput"
			:moveSequenceInput="props.moveSequenceInput"
			:isRunning="props.isRunning"
			@update:numRobotsInput="emit('update:numRobotsInput', $event)"
			@update:moveSequenceInput="emit('update:moveSequenceInput', $event)"
		/>

		<ActionButtons
			:isRunning="props.isRunning"
			:isSimulationComplete="props.isSimulationComplete"
			@runFull="emit('runFull')"
			@startViz="emit('startViz')"
			@stopViz="emit('stopViz')"
			@step="emit('step')"
			@reset="emit('reset')"
		/>
	</div>
</template>
