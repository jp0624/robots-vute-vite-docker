<template>
	<div class="p-6 bg-gray-50 min-h-screen font-sans">
		<div
			class="bg-white py-0 px-6 rounded-xl shadow-lg mb-8 border border-gray-200 flex items-center mb-4"
		>
			<img
				src="/robot-delivery-logo.png"
				alt="Robbie's Present Delivery Logo"
				class="h-[10em] w-[10em] mr-3 object-contain"
			/>
			<hgroup class="flex flex-col mr-3">
				<h1 class="text-3xl font-bold text-teal-600">Robbie's Present</h1>
				<h2 class="text-2xl font-bold text-slate-600">Delivery Simulation</h2>
			</hgroup>
			<SimulationControls
				:num-robots-input="numRobotsInput"
				:move-sequence-input="moveSequenceInput"
				:is-running="isRunning"
				:move-index="moveIndex"
				:move-sequence-length="moveSequenceInput.length"
				:steps-per-second="stepsPerSecond"
				:can-step-back="canStepBack"
				@update:num-robots-input="numRobotsInput = $event"
				@update:move-sequence-input="moveSequenceInput = $event"
				@update:steps-per-second="stepsPerSecond = $event"
				@run-full="runFullSimulation"
				@start-viz="startVisualization"
				@stop-viz="stopVisualization"
				@step-forward="stepForward"
				@step-back="stepBack"
				@reset="resetSimulation"
			/>
		</div>

		<div class="grid lg:grid-cols-3 gap-6">
			<div class="lg:col-span-2">
				<WorldGrid :house-grid="houseGrid" :robots="robots" />
			</div>
			<SimulationStats
				:simulation-message="simulationMessage"
				:simulation-status="simulationStatus"
				:total-presents="totalPresents"
				:unique-houses-with-one-present="uniqueHousesWithOnePresent"
				:robot-positions="robotPositions"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { ref, computed, watch, onMounted, onUnmounted } from "vue";
	import WorldGrid from "./components/WorldGrid.vue";
	import SimulationStats from "./components/SimulationStats.vue";
	import SimulationControls from "./components/SimulationControls.vue";
	import type { Robot, SimulationState } from "../types";

	const numRobotsInput = ref(3);
	const moveSequenceInput = ref(
		"^>^^>v<>vVV<^^^>v<>v<>vVV<v^^^>v<^>v<>vVV<>v<^>v<^>v<VVV<^>v<"
	);
	const stepsPerSecond = ref(5);

	const robots = ref<Robot[]>([]);
	const houses = ref(new Map<string, number>());
	const moveIndex = ref(0);
	const isRunning = ref(false);
	const visualizationInterval = ref<number | null>(null);
	const history = [] as SimulationState[];
	const MAX_HISTORY = 100;

	const saveHistory = () => {
		if (history.length >= MAX_HISTORY) history.shift();
		history.push({
			houses: Array.from(houses.value.entries()),
			robots: robots.value.map((r) => ({ ...r })),
			moveIndex: moveIndex.value,
		});
	};

	const canStepBack = computed(() => moveIndex.value > 0 || history.length > 1);

	const getRobotColorClass = (robotId: number) => {
		const colors = [
			"bg-red-500",
			"bg-blue-500",
			"bg-green-500",
			"bg-purple-500",
			"bg-yellow-600",
			"bg-pink-500",
			"bg-indigo-500",
			"bg-teal-500",
		];
		return colors[(robotId - 1) % colors.length];
	};

	const resetSimulation = () => {
		stopVisualization();
		houses.value = new Map<string, number>();
		moveIndex.value = 0;
		isRunning.value = false;
		history.length = 0;

		robots.value = Array.from({ length: numRobotsInput.value }, (_, i) => ({
			id: i + 1,
			name: `Robot ${i + 1}`,
			x: 0,
			y: 0,
			colorClass: getRobotColorClass(i + 1),
			collision: false,
		}));

		saveHistory();
	};

	const stepForward = () => {
		if (moveIndex.value >= moveSequenceInput.value.length) return;

		robots.value.forEach((r) => (r.collision = false));

		const moveChar = moveSequenceInput.value[moveIndex.value] ?? "";
		const robotIndex = moveIndex.value % numRobotsInput.value;
		const robot = robots.value[robotIndex];
		if (!robot) return;

		let newX = robot.x;
		let newY = robot.y;

		switch (moveChar.toUpperCase()) {
			case "^":
				newY += 1;
				break;
			case "V":
				newY -= 1;
				break;
			case ">":
				newX += 1;
				break;
			case "<":
				newX -= 1;
				break;
		}

		const collision = robots.value.some(
			(r) => r.id !== robot.id && r.x === newX && r.y === newY
		);

		if (!collision) {
			robot.x = newX;
			robot.y = newY;
			// Origin never receives presents
			if (!(newX === 0 && newY === 0)) {
				const key = `${newX},${newY}`;
				houses.value.set(key, (houses.value.get(key) || 0) + 1);
			}
		} else {
			robot.collision = true;
		}

		moveIndex.value++;
		saveHistory();
		if (moveIndex.value >= moveSequenceInput.value.length) stopVisualization();
	};

	const stepBack = () => {
		if (moveIndex.value > 0) {
			history.pop();
			moveIndex.value--;
			const previousState = history[history.length - 1];
			if (previousState) {
				houses.value = new Map(previousState.houses);
				robots.value = previousState.robots.map((r) => ({ ...r }));
			}
		} else {
			resetSimulation();
		}
	};

	const runFullSimulation = () => {
		stopVisualization();
		isRunning.value = false;
		while (moveIndex.value < moveSequenceInput.value.length) stepForward();
	};

	const runVizStep = () => {
		if (moveIndex.value < moveSequenceInput.value.length) stepForward();
		else stopVisualization();
	};

	const startVisualization = () => {
		if (!isRunning.value) {
			isRunning.value = true;
			const delay = 1000 / stepsPerSecond.value;
			visualizationInterval.value = setInterval(
				runVizStep,
				delay
			) as unknown as number;
		}
	};

	const stopVisualization = () => {
		if (visualizationInterval.value !== null) {
			clearInterval(visualizationInterval.value);
			visualizationInterval.value = null;
			isRunning.value = false;
		}
	};

	watch(stepsPerSecond, () => {
		if (isRunning.value) {
			stopVisualization();
			startVisualization();
		}
	});

	watch([numRobotsInput, moveSequenceInput], () => {
		if (!isRunning.value) resetSimulation();
	});

	const totalPresents = computed(() =>
		Array.from(houses.value.values()).reduce((a, b) => a + b, 0)
	);
	const uniqueHousesWithOnePresent = computed(() => houses.value.size);
	const robotPositions = computed(() =>
		robots.value.map((r) => ({
			id: r.id,
			name: r.name,
			position: `(${r.x},${r.y})`,
			colorClass: r.colorClass,
			collision: r.collision,
		}))
	);

	const simulationMessage = computed(() => {
		const totalMoves = moveSequenceInput.value.length;
		if (totalMoves === 0) return "Simulation inputs empty.";
		if (moveIndex.value >= totalMoves) return "All moves executed.";
		if (isRunning.value)
			return `Visualizing at ${stepsPerSecond.value} steps/sec...`;

		const robot = robots.value[moveIndex.value % numRobotsInput.value];
		const moveChar = moveSequenceInput.value[moveIndex.value] ?? "";
		return robot
			? `Next: ${robot.name} moves '${moveChar}'`
			: "Ready for next step.";
	});

	const simulationStatus = computed(() => {
		const totalMoves = moveSequenceInput.value.length;
		const robotIndex = moveIndex.value % numRobotsInput.value;
		const currentRobot = robots.value[robotIndex];
		const currentTurn = Math.floor(moveIndex.value / numRobotsInput.value) + 1;
		const totalTurns = Math.ceil(totalMoves / numRobotsInput.value);

		if (moveIndex.value >= totalMoves)
			return `Simulation Ended: ${totalTurns} Turns Complete.`;
		return `Turn ${currentTurn} of ${totalTurns}: Move ${
			moveIndex.value + 1
		} of ${totalMoves}. Robot ${currentRobot?.id} to move.`;
	});

	const houseGrid = computed(() => {
		let minX = -5,
			minY = -5,
			maxX = 5,
			maxY = 5;
		const positions = [
			...Array.from(houses.value.keys()).map((k) => {
				const [x, y] = k.split(",").map(Number);
				return { x, y };
			}),
			...robots.value.map((r) => ({ x: r.x, y: r.y, collision: r.collision })),
		];
		positions.forEach(({ x, y }) => {
			minX = Math.min(minX, x);
			minY = Math.min(minY, y);
			maxX = Math.max(maxX, x);
			maxY = Math.max(maxY, y);
		});
		minX -= 1;
		minY -= 1;
		maxX += 1;
		maxY += 1;

		const rows = [];
		for (let y = maxY; y >= minY; y--) {
			const row = [];
			for (let x = minX; x <= maxX; x++) {
				const key = `${x},${y}`;
				const presents = houses.value.get(key) || 0;
				const robotsPresent = robots.value.filter(
					(r) => r.x === x && r.y === y
				);
				row.push({ x, y, key, presents, robotsPresent });
			}
			rows.push(row);
		}
		return { rows, minX, minY, maxX, maxY };
	});

	onMounted(resetSimulation);
	onUnmounted(stopVisualization);
</script>
