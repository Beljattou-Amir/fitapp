# FitApp Premium End-to-End Integration Test Scenarios

This document outlines the detailed, multi-step end-to-end integration test scenarios for FitApp Premium. These scenarios verify the interactions between the database, state engine, UI, haptics, and synchronization systems across both Electron desktop and mobile PWA environments.

---

## 📋 Integration Flow Index
1. [Flow 1: Exercise Entity Lifecycle](#flow-1-exercise-entity-lifecycle)
2. [Flow 2: Kanban Planner & Routine Flow](#flow-2-kanban-planner--routine-flow)
3. [Flow 3: Active Workout & Resilience Journey](#flow-3-active-workout--resilience-journey)
4. [Flow 4: Analytics & Log Correction Loop](#flow-4-analytics--log-correction-loop)
5. [Flow 5: Cross-Environment Synchronization](#flow-5-cross-environment-synchronization)

---

## Flow 1: Exercise Entity Lifecycle

Verifies exercise definition creation, editing, dynamic mid-workout logging, cascading deletes, and database integrity.

### 🔍 Under-the-Hood Functions Verified
* `db.exercises.add()`, `db.exercises.put()`, `db.exercises.delete()`
* `openExerciseModal()`, `saveExerciseDefinition()`, `deleteExerciseDefinition()`
* `startAdhocWorkout()`, `triggerAddExerciseToActiveWorkout()`, `finishActiveWorkoutSession()`
* `db.workoutLogs.add()`, `db.workoutLogs.toArray()`

### 🛠️ Step-by-Step Test Procedure

| Step | Action Description | Expected Result |
| :--- | :--- | :--- |
| **Step 1** | Go to the **Builder** tab -> **Exercise Library** sub-tab. Click **Create Exercise**. Define a custom exercise (e.g. *Front Lever*), toggle the **Bodyweight** flag (turns on bodyweight exclusion), set default rest to `120s`, and click **Save**. | Definition is created in IndexedDB. Weight input is visually disabled. The default rest timer duration is bound to the exercise. |
| **Step 2** | Click **Edit** on the newly created exercise. Change the logging format from **Reps-based** to **Time-based (duration/seconds)**, update the setup instructions text, and click **Save**. | Exercise record updatedAt timestamp is refreshed. Logging format switches from rep count to time seconds. Notes are successfully updated. |
| **Step 3** | Go to **Today** tab, tap **Ad-hoc Session**. Click **Add Custom Exercise Block**, search and select the newly created exercise. Enter `30` in the time input (actual duration), complete the set, and click **Finish Workout**. | Stopwatch initiates. Weight input remains disabled; reps input holds time units. Clicking checkmark saves it. Post-workout celebration shows completed log. |
| **Step 4** | Return to the **Builder** tab -> **Exercise Library**. Locate the exercise and click **Delete**. Confirm the prompt warning about deletion consequences. | The exercise definition is flagged/deleted from the exercises table in IndexedDB. |
| **Step 5** | Go to the **Calendar** tab. Tap today's date containing the logged ad-hoc session and review the completed workout log summary. Open the exercise selector in the **Today** tab or **Builder** tab. | The completed workout log remains fully intact with all logged sets (Bench Press/Squats unaffected). The deleted exercise is no longer selectable for future plans. |

---

## Flow 2: Kanban Planner & Routine Flow

Verifies template planning, superset grouping/splitting, weekly strategy boards, inline editing, and deletion cascades.

### 🔍 Under-the-Hood Functions Verified
* `SortableJS` drag-and-drop event dispatcher (`onEnd` callback)
* `handleExerciseDragDrop()`, `updateKanbanSets()`, `updateKanbanReps()`
* `getRoutineColorTheme()`, `getCurrentWeekDates()`
* `unscheduleRoutineFromKanban()`, `deleteRoutineFromKanban()`

### 🛠️ Step-by-Step Test Procedure

| Step | Action Description | Expected Result |
| :--- | :--- | :--- |
| **Step 1** | Go to **Builder** -> **Routines**. Click **Create Routine**. Input name containing keyword "Push" (e.g., *Push Power Day*). Add two exercises, select **Join Exercise** to form a **Superset**, and click **Save**. | Template card registers. Card displays a purple linked "Superset Connection" card wrapper in Builder view. |
| **Step 2** | Open the **Planner** tab. Locate a weekday column and click **Schedule Routine**. Select *Push Power Day* from the list. | Routine card populates the column. Applies the visual **Push Training** color theme (indigo bg/border, indigo text) automatically based on routine name. |
| **Step 3** | Use the drag handle (`grip-vertical` icon) to drag one exercise out of the superset card and drop it below or inside another block. | Card repositioning executes. The superset container with only 1 exercise splits automatically back into single blocks. Routine blocks update in IndexedDB. |
| **Step 4** | Edit the **Sets** target input box and the **Reps** target text box directly inside the cards on the Kanban strategy board. | Target values change. IndexedDB routine blocks array updates immediately without modal popup overlays. |
| **Step 5** | Click the **Unschedule (calendar-x)** button on the routine card. Then, click **Delete (trash)** to permanently delete the template from library. | Card is removed from column. Deletion cascade runs, purging the template from Builder, Planner, and Today lists entirely. |

---

## Flow 3: Active Workout & Resilience Journey

Verifies active sessions tracking, stopwatch accuracy, timer manipulation, application reload recovery, and workout volume statistics.

### 🔍 Under-the-Hood Functions Verified
* Dexie metadata active session serialization (`saveActiveSessionCache()`, `clearActiveSessionCache()`)
* Rest timer interval thread (`triggerRestTimer()`, `adjustRestTimer()`)
* Stopwatch interval thread (`startStopwatchDisplay()`)
* Set completion haptic hooks (`navigator.vibrate`)
* Celebration stats computation (`finishActiveWorkoutSession()`)

### 🛠️ Step-by-Step Test Procedure

| Step | Action Description | Expected Result |
| :--- | :--- | :--- |
| **Step 1** | Go to the **Today** tab dashboard. Select a pre-scheduled routine from the lists and click **Start Workout**. | Tracker starts. Stopwatch begins counting up in mono fonts. Targets pre-fill into weight/reps fields. |
| **Step 2** | Set type to **Normal (N)** and click checkmark. When the rest timer slides up, immediately tap **+15s** on the rest timer banner. | 40ms haptic feedback buzz fires. Rest timer banner appears, and the countdown time increments by 15 seconds. |
| **Step 3** | While the stopwatch is running at ~1 minute and the rest timer is actively counting down, force reload the browser window (Ctrl+R / F5). | Window reloads, state variables are wiped. |
| **Step 4** | When the app reopens, verify the state of the active workout tracker. | The app detects the active session cache in Dexie. Renders today's active screen, restoring logged sets, running stopwatch, and state. |
| **Step 5** | Add Set 2 and Set 3. Set one to **Warm-up (W)** (weight 50kg, 10 reps) and another to **Dropset (D)** (weight 80kg, 5 reps). Complete them, click **Finish Workout**, and check recap stats. | Overlay displays completed stats. The volume calculation equals the dropset (80kg × 5 = 400kg), excluding the warm-up volume. |

---

## Flow 4: Analytics & Log Correction Loop

Verifies chart plotting algorithms, log deletions, calendar callbacks, database cascades, and silent synchronization flags.

### 🔍 Under-the-Hood Functions Verified
* `extractHistory()`, `calculateOneRm()` (Brzycki formula), `calculateWeeklyVolume()`
* `Chart.js` canvas instances updates (`oneRmChart.destroy()`)
* `deleteWorkoutLog()`, `refreshStateData()`
* `syncWithGoogleDriveSilent()`

### 🛠️ Step-by-Step Test Procedure

| Step | Action Description | Expected Result |
| :--- | :--- | :--- |
| **Step 1** | Complete a workout logging multiple sets of a reps-based exercise (e.g. *Bench Press*: 100kg × 5 reps normal set). Save the workout. | Log is saved in `db.workoutLogs`. |
| **Step 2** | Navigate to the **Analytics** tab. Select *Bench Press* from the exercise dropdown menu and observe the charts. | Line chart plots Estimated 1RM (Brzycki: 112.5kg). Volume bar chart details weekly aggregated volume (500kg). Warm-up sets are excluded. |
| **Step 3** | Go to the **Calendar** tab. Tap today's date, locate the completed log card, and click the **Delete (trash)** button. Confirm deletion. | Log is marked deleted or deleted from IndexedDB. Calendar resets today's date block back to "No workouts tracked. Rest Day". |
| **Step 4** | Return immediately to the **Analytics** tab and inspect the graphs for *Bench Press*. | Chart.js canvases clear and replot. Graphs visually revert to their pre-workout state (new volume and 1RM calculations removed). |
| **Step 5** | Inspect browser network requests (or background logs) after confirming the workout log deletion. | Deletion triggers `syncWithGoogleDriveSilent()`. Silent background patch request uploads database payload to user's Google Drive. |

---

## Flow 5: Cross-Environment Synchronization

Verifies Electron native token storage, loopback OAuth, offline caching, and conflict resolution merging.

### 🔍 Under-the-Hood Functions Verified
* Electron Main-Process secure storage bindings (`safeStorage.encryptString()`)
* Node loopback HTTP OAuth callback server (`localhost:8085`)
* Google Identity Services (GIS) auth code redirection flow
* Dexie collections merger (`mergeLocalAndRemoteDatabases()`, `mergeCollections()`)

### 🛠️ Step-by-Step Test Procedure

| Step | Action Description | Expected Result |
| :--- | :--- | :--- |
| **Step 1** | Open the application in the **Electron Desktop App**. Open settings, input credentials, and click **Save & Connect**. Perform a strategy scheduling. | Electron launches browser OAuth, captures code via port 8085, exchanges token, encrypts refresh token in `secure_store.json`, and uploads schedule. |
| **Step 2** | Open the application as a **mobile PWA**. Disable WiFi/Cellular data (offline). Complete a workout session and save it. | The app records the session log in local IndexedDB. Log record updatedAt timestamp is recorded. App behaves normally. |
| **Step 3** | Reconnect WiFi/Cellular data on the mobile PWA device and click **Sync** (or trigger a dashboard database action). | Connection returns. PWA initiates Google Identity Services OAuth connection and triggers database sync request. |
| **Step 4** | Verify the sync results on both mobile and desktop app environments. | Sync executes `mergeLocalAndRemoteDatabases()`. Local offline mobile logs merge with desktop schedule entries based on `updatedAt` keys, showing all data. |