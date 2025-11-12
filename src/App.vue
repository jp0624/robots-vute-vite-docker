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
				<WorldGrid :house-grid="houseGrid" />
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
	import type { Robot, SimulationState, RobotPosition } from "./types";

	// --- State Management ---

	// Inputs
	const numRobotsInput = ref(3);
	const moveSequenceInput = ref(
		"^>^^>v<>vVV<^^^>v<>v<>vVV<v^^^>v<^>v<>vVV<>v<^>v<^>v<VVV<^>v<"
	);
	const stepsPerSecond = ref(5);

	// Simulation State
	const robots = ref<Robot[]>([]);
	// Key: "x,y", Value: count of presents
	const houses = ref(new Map<string, number>());
	const moveIndex = ref(0);
	const isRunning = ref(false);
	const visualizationInterval = ref<number | null>(null);

	// History for Step Back
	const history = [] as SimulationState[];
	const MAX_HISTORY = 100;

	// --- History & State Persistence ---

	const saveHistory = () => {
		// Only keep a limited history for performance
		if (history.length >= MAX_HISTORY) {
			history.shift();
		}
		history.push({
			houses: Array.from(houses.value.entries()),
			robots: robots.value.map((r: Robot) => ({ ...r })), // Deep copy robots
			moveIndex: moveIndex.value,
		});
	};

	const canStepBack = computed(() => moveIndex.value > 0 || history.length > 1);

	// --- Helper Functions ---

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
		// always returns a string (never undefined)
		return colors[(robotId - 1) % colors.length];
	};

	const resetSimulation = () => {
		// Stop any running visualization
		stopVisualization();

		// Reset state
		houses.value = new Map<string, number>();
		houses.value.set("0,0", 1); // Start with one present at (0,0)
		moveIndex.value = 0;
		isRunning.value = false;
		history.length = 0;

		// Generate robots
		robots.value = Array.from({ length: numRobotsInput.value }, (_, i) => ({
			id: i + 1,
			name: `Robot ${i + 1}`,
			x: 0,
			y: 0,
			colorClass: getRobotColorClass(i + 1) || "",
		}));

		// Save initial state
		saveHistory();
	};

	// --- Simulation Logic ---

	const stepForward = () => {
		if (moveIndex.value >= moveSequenceInput.value.length) return;

		// Guarantee we have a string here (no undefined)
		const moveChar = moveSequenceInput.value[moveIndex.value] ?? "";
		const robotIndex = moveIndex.value % numRobotsInput.value;
		const robot = robots.value[robotIndex];

		// Safeguard if robot missing
		if (!robot) return;

		let newX = robot.x;
		let newY = robot.y;

		switch (moveChar.toUpperCase()) {
			case "^":
				newY += 1; // North (Up)
				break;
			case "V":
				newY -= 1; // South (Down)
				break;
			case ">":
				newX += 1; // East (Right)
				break;
			case "<":
				newX -= 1; // West (Left)
				break;
			default:
				// Ignore invalid characters
				break;
		}

		const newKey = `${newX},${newY}`;
		const currentCount = houses.value.get(newKey) || 0;

		// Check for collision with another robot at the new position
		const collision = robots.value.some(
			(r: Robot) => r.id !== robot.id && r.x === newX && r.y === newY
		);

		if (!collision) {
			// Update the robot's position
			robot.x = newX;
			robot.y = newY;

			// Deliver a present to the new house
			houses.value.set(newKey, currentCount + 1);
		} else {
			// Collision detected: robot stays in its current position
			// A present is delivered to the current house (before the attempted move)
			const currentKey = `${robot.x},${robot.y}`;
			const currentHouseCount = houses.value.get(currentKey) || 0;
			houses.value.set(currentKey, currentHouseCount + 1);
		}

		moveIndex.value++;
		saveHistory();

		if (moveIndex.value >= moveSequenceInput.value.length) {
			stopVisualization();
		}
	};

	const stepBack = () => {
		if (moveIndex.value > 0) {
			// Remove the current state (which corresponds to the state *after* moveIndex - 1)
			history.pop();
			moveIndex.value--;

			const previousState = history[history.length - 1];
			if (previousState) {
				houses.value = new Map(previousState.houses);
				robots.value = previousState.robots.map((r: Robot) => ({ ...r }));
			}
		} else {
			// This is the initial state, where moveIndex is 0
			// Restore to the very initial state
			houses.value = new Map<string, number>();
			houses.value.set("0,0", 1);
			moveIndex.value = 0;
			// Regenerate robots with default position (0,0) from the first history entry
			const initialHistory = history[0];
			robots.value = Array.from({ length: numRobotsInput.value }, (_, i) => {
				const robotData = initialHistory?.robots.find(
					(r: Robot) => r.id === i + 1
				);
				return {
					id: i + 1,
					name: `Robot ${i + 1}`,
					x: robotData?.x ?? 0,
					y: robotData?.y ?? 0,
					colorClass:
						robotData?.colorClass ?? (getRobotColorClass(i + 1) || ""), // ✅ ensure string
				};
			});
		}
	};

	const runFullSimulation = () => {
		stopVisualization();
		isRunning.value = false;

		// Run all remaining moves at full speed
		const totalMoves = moveSequenceInput.value.length;
		while (moveIndex.value < totalMoves) {
			stepForward();
		}
	};

	// --- Visualization Control ---

	const runVizStep = () => {
		if (moveIndex.value < moveSequenceInput.value.length) {
			stepForward();
		} else {
			stopVisualization();
		}
	};

	const startVisualization = () => {
		if (moveIndex.value < moveSequenceInput.value.length && !isRunning.value) {
			isRunning.value = true;
			const delay = 1000 / stepsPerSecond.value;
			// cast to number for TS - setInterval returns number in browser runtime
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

	// Watch for changes in speed input and update the interval if running
	watch(stepsPerSecond, () => {
		if (isRunning.value) {
			stopVisualization();
			startVisualization();
		}
	});

	// Watch for changes in numRobots or moveSequence and reset
	watch([numRobotsInput, moveSequenceInput], () => {
		// Only reset if the simulation is not running to prevent an infinite loop
		// or confusing behavior during visualization.
		if (!isRunning.value) {
			resetSimulation();
		}
	});

	// --- Computed State for Display ---

	const totalPresents = computed(() => {
		let total = 0;
		for (const count of houses.value.values()) {
			total += count;
		}
		return total;
	});

	const uniqueHousesWithOnePresent = computed(() => {
		return houses.value.size;
	});

	const robotPositions = computed<RobotPosition[]>(() => {
		return robots.value.map((r: Robot) => ({
			id: r.id,
			name: r.name,
			position: `(${r.x}, ${r.y})`,
			colorClass: r.colorClass,
		}));
	});

	const simulationMessage = computed(() => {
		const totalMoves = moveSequenceInput.value.length;
		const currentMoveIndex = moveIndex.value;
		const numRobots = numRobotsInput.value;

		if (totalMoves === 0) return "Simulation inputs empty.";

		if (currentMoveIndex >= totalMoves) {
			return "All moves executed.";
		}

		if (isRunning.value) {
			return `Visualizing at ${stepsPerSecond.value} steps/sec...`;
		}

		const robotIndex = currentMoveIndex % numRobots;
		const currentRobot = robots.value[robotIndex];
		const moveChar = moveSequenceInput.value[currentMoveIndex] ?? "";

		if (currentRobot) {
			return `Next: ${currentRobot.name} (ID: ${currentRobot.id}) moves '${moveChar}'`;
		}
		return "Ready for next step.";
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

		return `Turn ${currentTurn} of ${totalTurns}: Move ${
			currentMoveIndex + 1
		} of ${totalMoves}. Robot ${currentRobot?.id} to move.`;
	});

	// Calculate the grid to display
	const houseGrid = computed(() => {
		// Determine the bounds of the grid based on houses and robots
		let minX = -5,
			minY = -5,
			maxX = 5,
			maxY = 5;

		const positions = [
			...Array.from(houses.value.keys()).map((key) => {
				const [x, y] = key.split(",").map(Number);
				return { x, y };
			}),
			...robots.value.map((r: Robot) => ({ x: r.x, y: r.y })),
		];

		if (positions.length === 0) {
			return { rows: [], minX, minY, maxX, maxY };
		}
		positions.forEach(({ x, y }) => {
			minX = Math.min(minX ?? 0, x ?? 0);
			minY = Math.min(minY ?? 0, y ?? 0);
			maxX = Math.max(maxX ?? 0, x ?? 0);
			maxY = Math.max(maxY ?? 0, y ?? 0);
		});

		// Add a one-unit padding around the furthest positions
		minX -= 1;
		minY -= 1;
		maxX += 1;
		maxY += 1;

		const rows = [];
		// Iterate from max Y (Top) to min Y (Bottom) for rendering
		for (let y = maxY; y >= minY; y--) {
			const row = [];
			// Iterate from min X (Left) to max X (Right).
			for (let x = minX; x <= maxX; x++) {
				const key = `${x},${y}`;
				const presents = houses.value.get(key) || 0;

				const robotsPresent = robots.value
					.filter((r: Robot) => r.x === x && r.y === y)
					.map((r: Robot) => ({
						id: r.id,
						colorClass: r.colorClass,
					}));

				row.push({ x, y, key, presents, robotsPresent });
			}
			rows.push(row);
		}

		return { rows, minX, minY, maxX, maxY };
	});

	// --- Lifecycle Hooks ---

	onMounted(() => {
		// Initialize simulation on mount
		resetSimulation();
	});

	onUnmounted(() => {
		stopVisualization();
	});
</script>
