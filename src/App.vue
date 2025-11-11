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

	// --- Reactive State ---

	const numRobotsInput = ref(3);
	const moveSequenceInput = ref("^^VV<>");

	const robots = ref<Robot[]>([]);
	const houses = ref<Houses>(new Map());
	const moveIndex = ref(0);
	const totalPresentsDelivered = ref(0);

	const isRunning = ref(false);
	const simulationMessage = ref("");
	const stepsPerSecond = ref(10);

	let simulationInterval: number | null = null;

	// --- Core Logic ---

	/**
	 * Initializes the simulation state based on user input.
	 */
	function initializeSimulation() {
		const num = numRobotsInput.value > 0 ? numRobotsInput.value : 1;

		if (num > INITIAL_ROBOT_NAMES.length) {
			simulationMessage.value = `Warning: Cannot name ${num} robots. Using IDs for extra robots.`;
		} else {
			simulationMessage.value = "Simulation initialized.";
		}

		robots.value = Array.from({ length: num }, (_, i) => ({
			id: i,
			name: INITIAL_ROBOT_NAMES[i] || `Robot ${i}`,
			x: 0,
			y: 0,
		}));
		houses.value = new Map();
		moveIndex.value = 0;
		totalPresentsDelivered.value = 0;
		isRunning.value = false;
		stopSimulationInterval();
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
		const robot = robots.value[robotIndex];
		const command = moveSequenceInput.value[moveIndex.value];
		const move = MOVE_MAP[command];

		if (!move) {
			console.warn(`Unknown move command: ${command}`);
			moveIndex.value++;
			return;
		}

		// 1. Calculate new position
		const newX = robot.x + move[0];
		const newY = robot.y + move[1];

		// 2. Update robot's position (move complete)
		robot.x = newX;
		robot.y = newY;

		// 3. Delivery Check: A present is delivered if, and only if,
		//    no *other* robots are on the space (newX, newY).
		let collision = false;
		for (let i = 0; i < num; i++) {
			if (i !== robotIndex) {
				const other = robots.value[i];
				if (other.x === newX && other.y === newY) {
					collision = true;
					break;
				}
			}
		}

		// 4. Deliver present if no collision
		if (!collision) {
			const key = `${newX},${newY}`;
			// Use a temporary map to trigger Vue reactivity correctly on map update
			const newHouses = new Map(houses.value);
			newHouses.set(key, (newHouses.get(key) || 0) + 1);
			houses.value = newHouses;
			totalPresentsDelivered.value++;
		}

		// 5. Increment turn
		moveIndex.value++;
	}

	/**
	 * Runs the entire simulation sequence immediately.
	 */
	function runFullSimulation() {
		stopSimulationInterval();
		initializeSimulation();
		isRunning.value = true;
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
		simulationInterval = setInterval(() => {
			step();
			if (moveIndex.value >= moveSequenceInput.value.length) {
				stopSimulationInterval();
			}
		}, 1000 / stepsPerSecond.value);
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

	// Watch inputs and reset simulation when they change
	watch([numRobotsInput, moveSequenceInput], () => {
		initializeSimulation();
	});

	// Initialize on load
	initializeSimulation();

	// --- Computed Properties (Data for Components) ---

	/** Query 1: Current position of the robots */
	const robotPositions = computed(() => {
		return robots.value.map((r) => ({
			id: r.id,
			name: r.name,
			position: `(${r.x}, ${r.y})`,
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

	const simulationStatus = computed(() => {
		const totalMoves = moveSequenceInput.value.length;
		const numRobots = numRobotsInput.value > 0 ? numRobotsInput.value : 1;

		if (moveIndex.value >= totalMoves) {
			return `Simulation Ended: ${Math.ceil(
				totalMoves / numRobots
			)} Turns Complete.`;
		}

		const currentTurn = Math.floor(moveIndex.value / numRobots) + 1;
		const currentRobot = robots.value[moveIndex.value % numRobots];
		const totalTurns = Math.ceil(totalMoves / numRobots);

		if (!currentRobot) return "Ready to start.";

		return `Turn ${currentTurn} of ${totalTurns} (Move ${
			moveIndex.value + 1
		}/${totalMoves}): ${currentRobot.name} moves '${
			moveSequenceInput.value[moveIndex.value]
		}'`;
	});

	/** Grid Data for Visualization Component */
	const houseGrid = computed(() => {
		if (houses.value.size === 0)
			return {
				rows: [] as {
					x: number;
					y: number;
					key: string;
					presents: number;
					robotIds: number[];
				}[],
				minX: 0,
				minY: 0,
				maxX: 0,
				maxY: 0,
			};

		let minX = 0,
			minY = 0,
			maxX = 0,
			maxY = 0;

		// Determine bounds from visited houses
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

		// Extend bounds slightly for padding
		minX -= 2;
		minY -= 2;
		maxX += 2;
		maxY += 2;

		const rows = [];

		// Render Y from Max (Top) to Min (Bottom) for Cartesian display
		for (let y = maxY; y >= minY; y--) {
			const row = [];
			// Render X from Min (Left) to Max (Right)
			for (let x = minX; x <= maxX; x++) {
				const key = `${x},${y}`;
				const presents = houses.value.get(key) || 0;
				const robotIds = robots.value
					.filter((r) => r.x === x && r.y === y)
					.map((r) => r.id);

				row.push({ x, y, key, presents, robotIds });
			}
			rows.push(row);
		}

		return { rows, minX, minY, maxX, maxY };
	});
</script>

<template>
	<div class="p-6 bg-gray-50 min-h-screen font-sans">
		<h1 class="text-3xl font-extrabold text-blue-800 mb-4">
			Robbie's Present Delivery Simulator
		</h1>
		<p class="text-gray-600 mb-6">
			Simulate {{ numRobotsInput }} robots delivering presents based on movement
			rules and collision checks.
		</p>

		<!-- Controls Component -->
		<SimulationControls
			v-model:numRobotsInput="numRobotsInput"
			v-model:moveSequenceInput="moveSequenceInput"
			:isRunning="isRunning"
			:isSimulationComplete="moveIndex >= moveSequenceInput.length"
			@runFull="runFullSimulation"
			@startViz="startVisualization"
			@stopViz="stopSimulationInterval"
			@step="step"
			@reset="initializeSimulation"
		/>

		<!-- Status and Results -->
		<div class="grid md:grid-cols-2 gap-8">
			<!-- Stats Component -->
			<SimulationStats
				:simulationMessage="simulationMessage"
				:simulationStatus="simulationStatus"
				:totalPresents="totalPresents"
				:uniqueHousesWithOnePresent="uniqueHousesWithOnePresent"
				:robotPositions="robotPositions"
			/>

			<!-- Visualization Component -->
			<WorldGrid :houseGrid="houseGrid" />
		</div>
	</div>
</template>
