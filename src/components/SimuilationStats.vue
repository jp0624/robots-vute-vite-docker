<script setup lang="ts">
	import { defineProps } from "vue";
	import StatSummary from "./StatSummary.vue";
	import RobotPositionList from "./RobotPositionList.vue";

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
		<StatSummary
			:simulationMessage="props.simulationMessage"
			:simulationStatus="props.simulationStatus"
			:totalPresents="props.totalPresents"
			:uniqueHousesWithOnePresent="props.uniqueHousesWithOnePresent"
		/>
		<RobotPositionList :robotPositions="props.robotPositions" />
	</div>
</template>
