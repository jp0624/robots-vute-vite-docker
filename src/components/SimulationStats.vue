<template>
	<div class="space-y-6">
		<!-- Status Summary -->
		<StatSummary
			:simulation-message="simulationMessage"
			:simulation-status="simulationStatus"
			:total-presents="totalPresents"
			:unique-houses-with-one-present="uniqueHousesWithOnePresent"
		/>

		<!-- Robot Positions -->
		<RobotPositionList :robot-positions="robotPositions" />

		<!-- Grid Legend -->
		<GridLegend />
	</div>
</template>

<script setup lang="ts">
	import type { RobotPosition } from "../types";
	import StatSummary from "./StatSummary.vue";
	import RobotPositionList from "./RobotPositionList.vue";
	import GridLegend from "./GridLegend.vue";

	defineProps<{
		simulationMessage: string;
		simulationStatus: string;
		totalPresents: number;
		uniqueHousesWithOnePresent: number;
		robotPositions: RobotPosition[];
	}>();
</script>
