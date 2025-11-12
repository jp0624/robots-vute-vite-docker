export interface Robot {
	id: number;
	name: string;
	x: number;
	y: number;
	colorClass: string;
}
export interface SimulationState {
	houses: [string, number][]; // Array of [key: string, count: number]
	robots: Robot[];
	moveIndex: number;
}
export interface RobotPosition {
	id: number;
	name: string;
	position: string;
	colorClass?: string;
}

export interface Tile {
	x: number;
	y: number;
	key: string;
	presents: number;
	robotsPresent: RobotPresence[];
}

export interface RobotPresence {
	id: number;
	colorClass: string; // e.g., 'bg-red-500'
}

export interface HouseGrid {
	rows: Tile[][];
	minX: number;
	minY: number;
	maxX: number;
	maxY: number;
}
