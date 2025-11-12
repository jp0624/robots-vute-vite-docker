<template>
	<div class="space-y-6">
		<!-- Status Summary -->
		<StatSummary
			:simulation-message="simulationMessage"
			:simulation-status="simulationStatus"
			:total-presents="totalPresents"
			:unique-houses-with-one-present="uniqueHousesWithOnePresent"
		/>

		<!-- Robot Positions (Includes unique colors from Option 2) -->
		<RobotPositionList :robot-positions="robotPositions" />

		<!-- Grid Legend (Option 5) -->
		<GridLegend />
	</div>
</template>

<script setup lang="ts">
	import StatSummary from "./StatSummary.vue";
	import RobotPositionList from "./RobotPositionList.vue";
	import GridLegend from "./GridLegend.vue";

	interface RobotPosition {
		id: number;
		name: string;
		position: string;
		colorClass: string;
	}

	defineProps<{
		simulationMessage: string;
		simulationStatus: string;
		totalPresents: number;
		uniqueHousesWithOnePresent: number;
		robotPositions: RobotPosition[];
	}>();
</script>
