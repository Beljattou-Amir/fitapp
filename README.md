# FitApp Premium Workout Tracker

FitApp Premium is a local-first, highly-polished, offline-capable workout tracking and planning companion. It is designed to work seamlessly as a native desktop application (via Electron) or as a Progressive Web App (PWA) on mobile devices, featuring a centralized multi-user Supabase backend for authentication and sync.

---

## 🌟 Functional Features

### 1. Today Dashboard & Active Workout Tracker
* **Flexible Workout Modes**: Start an ad-hoc session on the fly (fully customizable) or select a pre-scheduled routine guide from the dashboard list.
* **Stopwatch Display**: Dynamic workout duration stopwatch displaying elapsed time (`HH:MM:SS` format).
* **Multi-type Set Logging**: Set types can be set to **Normal (N)**, **Warm-up (W)**, or **Dropset (D)**.
* **Weight & Rep Target Pre-filling**: Workout inputs pre-fill actual weight and reps with routine target specifications, allowing athletes to log a completed set with a single tap.
* **Haptic Feedback**: High-polish user feedback triggering a 40ms vibration pulse when logging set completions on supported mobile devices.
* **Smart Rest Timer**: A floating, interactive count-down timer banner that slides up automatically upon set completion. Supports `+15s` adjustments, skipping, and triggers a triple haptic vibration buzz upon timer completion.
* **Active Session Persistence (Cache)**: Persists active workout sessions in Dexie IndexedDB cache. If the application is closed or reloaded, state is fully recovered.
* **Mid-Workout Customizations**: Dynamic options to add/delete sets, delete individual exercise blocks, or add new exercises from the global library mid-session.
* **Inline Notes & Details**: Review instruction details and add persistent trainer/form notes directly inside active workout tracks.
* **Celebration Recap Overlay**: Completion overlay displaying session duration (minutes), total completed sets, total volume lifted (excluding warm-up sets), and confetti animations.

### 2. Weekly Workout Strategy Board (Planner)
* **Interactive Kanban Board**: Visual weekly planner (Monday to Sunday) allowing drag-and-drop repositioning of exercises.
* **Drag-and-Drop Repositioning**: powered by `SortableJS`, allowing exercises to be re-ordered inside a routine or dragged to other routines.
* **Visual Theme Categorization**: Routine cards are dynamically styled (background, border, text colors) matching training categories (e.g. *Push*, *Pull*, *Legs*, *Core*, *Cardio*) or fallback hashes.
* **Inline Card Editing**: Update target sets and reps directly on the board cards without opening separate modals.
* **Strategic Scheduling Triggers**: Assign existing routines to any day, unschedule routines, create and assign new routines on the fly, or delete routine templates permanently from the library.

### 3. Routine Builder & Exercise Library
* **Custom Routine Templates**: Configure and edit customized templates (e.g. Push/Pull/Legs) with custom trainer descriptions and block orderings.
* **Supersets Connection**: Connect individual exercises into linked **Supersets** or split them back into single exercise blocks.
* **Exercise Definition Library**: Global library seeded with standard movements, expandable with custom definitions.
* **Logging Formats**: Configure exercise definitions as **Reps-based** or **Time-based (duration/seconds)**.
* **Bodyweight Flag Exclusion**: Mark exercises as bodyweight to automatically disable weight input fields throughout the app.
* **Default Rest Durations**: Define target rest intervals per exercise.
* **Persistent Directives**: Input global instruction details for each movement.

### 4. Training Calendar & Logs History
* **Timeline Calendar**: Vertical sliding calendar covering a 3-week window (-14 days to +7 days) for strategic log tracking and future planning.
* **Logs & Summaries**: Select past dates to review detailed, read-only recap summaries of completed workouts.
* **Data Corrections**: Delete past workout logs, immediately updating streaks, logs, and progress charts.

### 5. Performance Progress Analytics
* **Estimated 1RM (1-Rep Max) Progression**: Visual line charts tracking estimated 1RM over time using the standard **Brzycki formula** (or holds/duration for time exercises), automatically excluding warm-up sets.
* **Weekly Logged Volume**: Bar charts detailing total volume lifted per Monday-start week (excluding warm-up sets).
* **Interactive Dropdown Selector**: Dropdown selector to swap exercise graphs immediately. Powered by Chart.js.

### 6. Storage & Cloud Synchronization
* **IndexedDB Local Storage**: Local-first operational design. Client-side IndexedDB database wrapped with Dexie.js for offline usage.
* **Conflict-Free Merging**: Integrates timestamp-based synchronization (comparing `updatedAt` properties of records) to merge local and remote changes safely.
* **Silent Background Sync**: Synchronizes to Supabase automatically on user actions (finish workout, delete log, schedule, edit definitions).
* **Supabase Integration**: Secure PostgreSQL database backend managing multi-user data isolation via Row Level Security (RLS).
* **Centralized Authentication**: Invite-only authentication system. 
  * Self sign-up is disabled, users must be explicitly provisioned by an Admin via the in-app Admin Panel.
  * Secures data across the Desktop App (Electron) and Mobile PWA using JWT session persistence.
* **Local JSON Backups**: Manual exports and imports of full database JSON backups, supporting timestamp-based merge logic.

### 7. Modern UI/UX Design & Administration
* **Glassmorphism Aesthetic**: Uses deep dark modes, translucent glass panels, and vibrant gradient text for a premium feel.
* **Interactive Modals & Drawers**: Smoothly animated overlays (sliding up/down) for account settings, creating routines, adding exercises, and reviewing analytics.
* **Admin Dashboard**: In-app management panel available exclusively to admin users for user provisioning and oversight.
* **Toast Notifications**: Non-intrusive on-screen notifications for network state changes, sync successes, and error feedback.

---

## 🏗️ Technical Architecture

FitApp is architected as a **local-first application**. It runs completely client-side, using the browser's local databases for primary storage, and synchronizes with the cloud peer-to-peer without requiring a dedicated backend server database.

```mermaid
graph TD
    UI[HTML5 / Tailwind UI] --> State[JavaScript State Engine]
    State --> DB[(IndexedDB / Dexie.js)]
    State --> Sync[Supabase Sync Engine]
    
    subgraph Desktop (Electron Wrapper)
        Bridge[Preload Bridge] --> MainProc[Main Process]
    end
    
    subgraph Mobile / Web (PWA)
        SW[Service Worker] --> Cache[(Cache Storage)]
    end
    
    Sync --> |PostgREST| SupabaseDB[(Supabase PostgreSQL)]
    Sync --> |GoTrue Auth| SupabaseAuth[Supabase Auth]
```

### 1. Storage & State Management
* **Database**: Uses **IndexedDB** wrapped with [Dexie.js](https://dexie.org/) to handle complex database schemas (exercises, routines, schedules, and workout logs) with high performance.
* **State Engine**: Managed via a unified reactive state object. State modifications are written to IndexedDB first and then synced to the cloud.

### 2. Desktop Wrapper (Electron)
* **Preload Bridge**: [preload.js](file:///c:/Users/amirb/Desktop/fitapp/preload.js) exposes a secure IPC context bridge (`window.electronAPI`) keeping node-integration disabled in the renderer window for optimal security.

### 3. Progressive Web App (PWA) Offline Engine
* **Service Worker**: [sw.js](file:///c:/Users/amirb/Desktop/fitapp/sw.js) implements a **Stale-While-Revalidate** caching strategy. It pre-caches all CSS, Dexie, Charts, and Lucide CDNs, enabling the app to load and function fully offline on mobile devices.
* **Standalone UI**: Utilizes [manifest.json](file:///c:/Users/amirb/Desktop/fitapp/manifest.json) to launch without browser frames, supporting responsive layouts, tap-highlight overrides, and native-like viewports.

---

## 📁 Project Directory Structure

* 📄 [index.html](file:///c:/Users/amirb/Desktop/fitapp/index.html): The entire Single Page Application (SPA) UI, housing the HTML templates, Tailwind layouts, state manager UI views, and Google Drive GAPI/GIS sync script configurations.
* 📁 `src`:
  * 📄 [src/analytics.js](file:///c:/Users/amirb/Desktop/fitapp/src/analytics.js): Core calculation engine. Computes Brzycki 1RM projections, Monday-start weekly volumes, and filters log history entries.
  * 📄 [src/planner.js](file:///c:/Users/amirb/Desktop/fitapp/src/planner.js): Planner logic helpers, calendar week generator, and routine visual color theme hashes.
* 📁 `tests`:
  * 📄 [tests/analytics.test.js](file:///c:/Users/amirb/Desktop/fitapp/tests/analytics.test.js): Jest tests for 1RM, weekly volume, and log filters.
  * 📄 [tests/planner.test.js](file:///c:/Users/amirb/Desktop/fitapp/tests/planner.test.js): Jest tests for calendar date computations and routine themes.
* 📄 [main.js](file:///c:/Users/amirb/Desktop/fitapp/main.js): Electron backend setup, OS `safeStorage` token wrappers, and loopback OAuth redirect server.
* 📄 [preload.js](file:///c:/Users/amirb/Desktop/fitapp/preload.js): Secure context bridge mapping safe electron ipc main callbacks.
* 📄 [sw.js](file:///c:/Users/amirb/Desktop/fitapp/sw.js): PWA service worker caching CDN and local assets.
* 📄 [manifest.json](file:///c:/Users/amirb/Desktop/fitapp/manifest.json): Configuration file allowing the application to be installable on mobile.
* 📄 [package.json](file:///c:/Users/amirb/Desktop/fitapp/package.json): Electron dev dependencies, executable run scripts, and package descriptors.
* 🎨 `icon.svg`: App logo used for Electron packaging and PWA launchers.

---

## 🚀 Getting Started (Development)

### Desktop App (Electron)
1. Install development dependencies:
   ```bash
   npm install
   ```
2. Launch the app in developer mode:
   ```bash
   npm start
   ```
3. Compile the desktop executable (Windows):
   ```bash
   npm run dist
   ```

### Web/PWA Server (Local Mobile Testing)
To load the app on your phone locally over WiFi:
1. Start a local server:
   ```bash
   npx http-server -p 8080
   ```
2. Create an HTTPS tunnel (e.g., using `ngrok` or `localtunnel` for secure Web OAuth and PWA installation):
   ```bash
   npx localtunnel --port 8080
   ```
3. Open the secure `https://...` link on your mobile browser (Safari on iOS or Chrome on Android) and click **Add to Home Screen**.

---

## 🔒 Security & Supabase Architecture

FitApp Premium has been migrated to use **Supabase** for centralized data storage and authentication.

* **Authentication**: Self sign-ups are **disabled**. The application operates on an invite-only model where an admin (e.g., `emyrkhan@fitapp.local`) can provision new accounts from the in-app Admin panel.
* **Data Isolation**: All database tables (`exercises`, `routines`, `workout_logs`, `schedules`) are protected using Postgres **Row Level Security (RLS)**. Users can only query and mutate their own data (identified via `auth.uid()`).
* **Global Exercises**: The `exercises` table allows for global system exercises (where `user_id` is null) which are visible to everyone, as well as user-created exercises that remain private.
* **Web & Desktop Parity**: Both the Electron desktop application and the Mobile PWA use the exact same Supabase JS client and session management, providing a unified and secure syncing experience.

### Backend Deployment & Setup (Supabase)
To set up a fresh Supabase project for FitApp Premium, you must deploy the schema, seed the default exercises, and deploy the user provisioning edge function:

1. **Deploy Initial Schema**: Run the SQL script located at `supabase/migrations/001_initial_schema.sql` in your Supabase SQL Editor. This sets up the tables and Row Level Security (RLS) policies.
2. **Seed Default Exercises**: Run the SQL script located at `supabase/migrations/002_seed_default_exercises.sql` to populate the global exercise library.
3. **Deploy Edge Function**: Using the Supabase CLI, deploy the `provision-user` function to allow admins to create new users securely:
   ```bash
   supabase functions deploy provision-user
   ```
4. **Environment Configuration**: Update the `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `index.html` to point to your new Supabase project.
