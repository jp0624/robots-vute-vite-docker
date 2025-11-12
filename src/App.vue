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
				@stop-viz="stopSimulationInterval"
				@step-forward="step"
				@step-back="stepBack"
				@reset="initializeSimulation"
			/>
		</div>

		<div class="grid lg:grid-cols-3 gap-8">
			<div
				class="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg border border-gray-200 overflow-x-auto"
			>
				<h2 class="text-xl font-bold text-gray-800 mb-3 border-b pb-2">
					World Grid View
				</h2>
				<WorldGrid :house-grid="houseGrid" :robots="robots" />
			</div>

			<div class="lg:col-span-1">
				<SimulationStats
					:simulation-message="simulationMessage"
					:simulation-status="simulationStatus"
					:total-presents="totalPresents"
					:unique-houses-with-one-present="uniqueHousesWithOnePresent"
					:robot-positions="robotPositions"
				/>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { ref, computed, watch } from "vue";
	import SimulationControls from "./components/SimulationControls.vue";
	import SimulationStats from "./components/SimulationStats.vue";
	import WorldGrid from "./components/WorldGrid.vue";

	// --- Types and Interfaces ---

	interface Robot {
		id: number;
		x: number;
		y: number;
		name: string;
		colorClass: string; // Tailwind class for color (e.g., 'bg-red-500')
	}

	// History tracks the state *before* a move is executed
	interface MoveRecord {
		robotIndex: number;
		prevX: number;
		prevY: number;
		housesSnapshot: Houses;
		presentsDeliveredBefore: number;
	}

	// Map for house state: Key is "x,y", Value is the number of presents delivered.
	type Houses = Map<string, number>;

	// --- Constants ---

	const MOVE_MAP: { [key: string]: [number, number] } = {
		"^": [0, 1], // North (Positive Y)
		V: [0, -1], // South (Negative Y)
		"<": [-1, 0], // West (Negative X)
		">": [1, 0], // East (Positive X)
	};

	const INITIAL_ROBOT_NAMES = [
		"Robbie",
		"Jane",
		"Bob",
		"Alice",
		"Charlie",
		"Delta",
		"Echo",
		"Foxtrot",
		"Gamma",
		"Henry",
	];

	const ROBOT_COLORS: string[] = [
		"bg-red-500",
		"bg-green-500",
		"bg-blue-500",
		"bg-yellow-500",
		"bg-purple-500",
		"bg-pink-500",
		"bg-indigo-500",
		"bg-teal-500",
		"bg-orange-500",
		"bg-cyan-500",
	];

	// --- Reactive State ---

	const numRobotsInput = ref(5);
	const moveSequenceInput = ref("^^VV<^^VV<>>^^V^^VV<>V<>^^VV<>^^V^^VV<>V<>");

	const robots = ref<Robot[]>([]);
	const houses = ref<Houses>(new Map());
	const moveIndex = ref(0);
	const totalPresentsDelivered = ref(0);
	const moveHistory = ref<MoveRecord[]>([]); // New state for tracking history

	const isRunning = ref(false);
	const simulationMessage = ref("");
	const stepsPerSecond = ref(10); // For the visualization speed

	let simulationInterval: number | null = null;

	// --- Computed Properties (Query Operations) ---

	/** Query 1: Current position of the robots */
	const robotPositions = computed(() => {
		return robots.value.map((r) => ({
			id: r.id,
			name: r.name,
			position: `(${r.x}, ${r.y})`,
			colorClass: r.colorClass, // Include color for list visualization
		}));
	});

	/** Query 2: Total number of presents delivered */
	const totalPresents = computed(() => totalPresentsDelivered.value);

	/** Query 3: Number of houses with at least N presents */
	const uniqueHousesQuery = computed(() => (minPresents: number) => {
		if (!houses.value) return 0;
		let count = 0;
		for (const presents of houses.value.values()) {
			if (presents >= minPresents) {
				count++;
			}
		}
		return count;
	});

	const uniqueHousesWithOnePresent = computed(() => uniqueHousesQuery.value(1));

	/** Determines if the step back button should be enabled */
	const canStepBack = computed(
		() => moveHistory.value.length > 0 && !isRunning.value
	);

	// --- Core Logic: History Management ---

	/**
	 * Reverts the simulation state by one move.
	 */
	function stepBack() {
		if (isRunning.value || moveHistory.value.length === 0) return;

		const lastMove = moveHistory.value.pop();
		if (!lastMove) return;

		const robot = robots.value[lastMove.robotIndex];

		// 1. Revert Robot Position
		if (robot) {
			robot.x = lastMove.prevX;
			robot.y = lastMove.prevY;
		}

		// 2. Revert House State
		houses.value = lastMove.housesSnapshot;

		// 3. Revert Total Presents
		totalPresentsDelivered.value = lastMove.presentsDeliveredBefore;

		// 4. Revert Move Index
		moveIndex.value = moveIndex.value - 1;

		simulationMessage.value = `Stepped back to move ${moveIndex.value}. Robot ${robot.name} position reverted.`;
	}

	// --- Core Logic: Simulation Control ---

	/**
	 * Initializes the simulation state based on user input.
	 */
	function initializeSimulation() {
		stopSimulationInterval();
		const num = numRobotsInput.value > 0 ? numRobotsInput.value : 1;

		if (num > ROBOT_COLORS.length) {
			simulationMessage.value = `Warning: More robots than colors available (${ROBOT_COLORS.length}). Colors will repeat.`;
		} else {
			simulationMessage.value = "Simulation initialized.";
		}

		robots.value = Array.from({ length: num }, (_, i) => ({
			id: i,
			name: INITIAL_ROBOT_NAMES[i] || `Robot ${i}`,
			x: 0,
			y: 0,
			colorClass: ROBOT_COLORS[i % ROBOT_COLORS.length], // Assign unique color
		}));

		// Start the simulation with an empty grid. Presents are only delivered on a move.
		const initialHouses = new Map<string, number>();
		// NOTE: Removed: initialHouses.set("0,0", 1);

		houses.value = initialHouses;
		moveIndex.value = 0;
		totalPresentsDelivered.value = 0; // CORRECTED: Starts at 0
		isRunning.value = false;
		moveHistory.value = []; // Reset history
	}

	/**
	 * Executes a single robot's turn based on the current move index.
	 */
	function step() {
		if (moveIndex.value >= moveSequenceInput.value.length) {
			stopSimulationInterval();
			simulationMessage.value = "Simulation complete.";
			return;
		}

		const num = robots.value.length;
		const robotIndex = moveIndex.value % num;
		const robot = robots.value[robotIndex] || null;
		const command = moveSequenceInput.value[moveIndex.value] || "";
		const move = MOVE_MAP[command];

		if (!move) {
			console.warn(`Unknown move command: ${command}`);
			moveIndex.value++;
			return;
		}

		// --- RECORD HISTORY BEFORE MOVE ---
		moveHistory.value.push({
			robotIndex: robotIndex || 0,
			prevX: robot.x,
			prevY: robot.y,
			housesSnapshot: new Map(houses.value), // Deep copy of the Houses map
			presentsDeliveredBefore: totalPresentsDelivered.value,
		});

		// 1. Calculate new position
		const newX = robot.x + move[0];
		const newY = robot.y + move[1];

		// 2. Update robot's position (move complete)
		robot.x = newX;
		robot.y = newY;

		// 3. Deliver present unconditionally (Collision check logic removed)
		const key = `${newX},${newY}`;
		// Use a temporary map to trigger Vue reactivity correctly on map update
		const newHouses = new Map(houses.value);
		newHouses.set(key, (newHouses.get(key) || 0) + 1);
		houses.value = newHouses;
		totalPresentsDelivered.value++;

		// 4. Increment turn
		moveIndex.value++;
	}

	/**
	 * Runs the entire simulation sequence immediately.
	 */
	function runFullSimulation() {
		stopSimulationInterval();
		initializeSimulation();
		isRunning.value = true;
		// Step through all moves instantly
		while (moveIndex.value < moveSequenceInput.value.length) {
			step();
		}
		isRunning.value = false;
	}

	/**
	 * Starts the interval for step-by-step visualization.
	 */
	function startVisualization() {
		stopSimulationInterval();
		initializeSimulation();
		isRunning.value = true;

		// Use stepsPerSecond to set the interval speed
		const intervalMs = 1000 / stepsPerSecond.value;

		simulationInterval = setInterval(() => {
			step();
			if (moveIndex.value >= moveSequenceInput.value.length) {
				stopSimulationInterval();
			}
		}, intervalMs);
	}

	/**
	 * Stops the visualization interval.
	 */
	function stopSimulationInterval() {
		if (simulationInterval !== null) {
			clearInterval(simulationInterval);
			simulationInterval = null;
			isRunning.value = false;
		}
	}

	// --- Watchers for Auto-Reset on Input Change ---

	// Automatically re-initialize when N changes
	watch(numRobotsInput, () => {
		initializeSimulation();
	});

	// Automatically re-initialize when the move sequence changes
	watch(moveSequenceInput, () => {
		initializeSimulation();
	});

	// Initialize on load
	initializeSimulation();

	// --- Helper for UI visualization ---

	/**
	 * Generates the house grid for visualization.
	 */
	const houseGrid = computed(() => {
		let minX = 0,
			minY = 0,
			maxX = 0,
			maxY = 0;

		// Include visited houses in bounds calculation
		for (const key of houses.value.keys()) {
			const [x, y] = key.split(",").map(Number);
			minX = Math.min(minX, x);
			minY = Math.min(minY, y);
			maxX = Math.max(maxX, x);
			maxY = Math.max(maxY, y);
		}

		// Include current robot positions in the bounds
		robots.value.forEach((r) => {
			minX = Math.min(minX, r.x);
			minY = Math.min(minY, r.y);
			maxX = Math.max(maxX, r.x);
			maxY = Math.max(maxY, r.y);
		});

		// Ensure a minimum 11x11 grid centered at (0,0)
		minX = Math.min(minX, -5);
		minY = Math.min(minY, -5);
		maxX = Math.max(maxX, 5);
		maxY = Math.max(maxY, 5);

		// Extend bounds slightly for padding
		minX -= 1;
		minY -= 1;
		maxX += 1;
		maxY += 1;

		const rows = [];

		// This iteration ensures the Cartesian Y-axis flip for display:
		// Starting at the max Y (Top) and decreasing to min Y (Bottom).
		for (let y = maxY; y >= minY; y--) {
			const row = [];
			// Iterating X from min (Left) to max (Right).
			for (let x = minX; x <= maxX; x++) {
				const key = `${x},${y}`;
				const presents = houses.value.get(key) || 0;

				const robotsPresent = robots.value
					.filter((r) => r.x === x && r.y === y)
					.map((r) => ({
						id: r.id,
						colorClass: r.colorClass,
					}));

				row.push({ x, y, key, presents, robotsPresent });
			}
			rows.push(row);
		}

		return { rows, minX, minY, maxX, maxY };
	});

	const simulationStatus = computed(() => {
		const totalMoves = moveSequenceInput.value.length;
		const numRobots = numRobotsInput.value;

		if (totalMoves === 0) return "Ready to start. Enter a move sequence.";

		const currentMoveIndex = moveIndex.value;

		if (currentMoveIndex >= totalMoves) {
			const totalTurns = Math.ceil(totalMoves / numRobots);
			return `Simulation Ended: ${totalTurns} Turns Complete.`;
		}

		const robotIndex = currentMoveIndex % numRobots;
		const currentRobot = robots.value[robotIndex];
		const currentTurn = Math.floor(currentMoveIndex / numRobots) + 1;
		const totalTurns = Math.ceil(totalMoves / numRobots);

		if (!currentRobot) return "Ready to start.";

		return `Turn ${currentTurn} of ${totalTurns} (Move ${
			currentMoveIndex + 1
		}/${totalMoves}): ${currentRobot.name} moves '${
			moveSequenceInput.value[currentMoveIndex]
		}'`;
	});
</script>

<style scoped>
	/* Standard styles moved to GridTile.vue for modularity, but basic layout remains here */
</style>
