# **🤖 Robbie's Present Delivery Simulator**

This application, built using **Vue 3 and TypeScript**, simulates a multi-robot delivery system on an infinite Cartesian grid. The primary engineering challenge is managing global state (robot positions and house deliveries) under specific, turn-based movement and collision rules.

## **Core Logic & Rules**

The simulation strictly adheres to the following rules:

1. **Turn-Based Movement:** Robots take turns sequentially based on the order of the Move Sequence (e.g., Robot 0, Robot 1, Robot 2, Robot 0, ...).
2. **Start Position:** All robots start at the origin (0, 0).
3. **Delivery Condition:** A present is delivered to a house only if the current robot is the _only_ robot on that space at the end of its turn. Collisions with other robots on the final tile prevent delivery.

## **Modular Architecture Breakdown**

The application is structured using a highly modular Vue 3 component pattern to separate concerns and maximize maintainability. All core logic and state management are contained within src/App.vue.

| File                                  | Role                        | Description                                                                                                                                                        |
| :------------------------------------ | :-------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| src/App.vue                           | **Container/State Manager** | **The single source of truth.** Holds all reactive state (robots, houses, moveIndex) and contains all core simulation logic (initialize, step, runFullSimulation). |
| src/components/SimulationControls.vue | Wrapper                     | Groups the input forms and action buttons.                                                                                                                         |
| src/components/ControlInputs.vue      | Component                   | Handles input fields for **Number of Robots** and the **Move Sequence**.                                                                                           |
| src/components/ActionButtons.vue      | Component                   | Contains all buttons: **Run**, **Step**, **Start Viz**, **Stop**, and **Reset**.                                                                                   |
| src/components/SimulationStats.vue    | Wrapper                     | Groups the key statistics and robot position list.                                                                                                                 |
| src/components/StatSummary.vue        | Component                   | Displays the overall status, **Total Presents Delivered**, and **Unique Houses Visited**.                                                                          |
| src/components/RobotPositionList.vue  | Component                   | Displays the name, ID, and current (x, y) coordinates of every robot.                                                                                              |
| src/components/WorldGrid.vue          | Wrapper                     | Manages the visualization grid bounds and iterates through the rows, passing data to individual tiles.                                                             |
| src/components/GridTile.vue           | Component                   | Renders a single cell, including coordinates, present count, and robot icons.                                                                                      |

## **Supported Operations (Queries)**

The simulation supports the following essential operations:

- **Initialization:** Set up the grid and robots based on N and the movement string.
- **Step/Run:** Execute single turns (step) or the full movement sequence (runFullSimulation).
- **Query Robot Positions:** Track and display the current coordinates of all robots.
- **Query Total Presents:** Get the overall count of gifts delivered (totalPresents).
- **Query Unique Houses:** Get the count of houses that received at least one present (uniqueHousesWithOnePresent).

## **Setup and Running**

This is a standard Vue CLI or Vite project.

1. **Install dependencies:**  
   npm install

2. **Run the development server:**  
   npm run dev  
   \# or npm start

3. Open the application in your browser.
