
# Personal OS

> A calm, local-first personal operating system.

**Personal OS** is a Progressive Web App (PWA) designed to bring clarity and focus to your daily life. It operates entirely in the browser using **IndexedDB** for privacy and offline capability, with optional AI features powered by **Google Gemini**.

## Modes

The application is divided into three distinct modes, each serving a specific mental state:

### 1. Do (Focus)
- **Task Management**: Prioritize tasks by energy level and urgency.
- **Focus Mode**: A distraction-free "Zen" timer for deep work.
- **Session Logging**: Automatically tracks time spent on tasks.

### 2. Live (Balance)
- **Daily Intention**: Set a single guiding intention for the day.
- **Daily Plan**: Limit your primary focus to 5 highlights per day.
- **Habit Tracking**: Track daily rhythms (Morning, Evening, Anytime).
- **AI Assistant**: Get daily advice based on your current workload and mood.

### 3. Think (Knowledge)
- **Zettelkasten Notes**: Create atomic notes.
- **Bi-directional Linking**: Connect ideas using `[[Wiki Links]]`.
- **Daily Notes**: Automatic journaling entry for every day.
- **Markdown Support**: Clean, distraction-free writing environment.

## Tech Stack

- **Framework**: Angular v18+ (Standalone Components, Signals, Zoneless)
- **Styling**: Tailwind CSS
- **Database**: IndexedDB (Native Browser Storage)
- **AI**: Google GenAI SDK (Gemini 2.5 Flash)
- **Routing**: Hash-based routing for static hosting compatibility.

## Setup

This project uses a lightweight, zoneless Angular setup with ESM modules via `importmap`.

1. Clone the repository.
2. Install dependencies (optional, for type checking): `npm install`
3. Run the development server: `npm start` (or serve the directory with any static server).
4. Navigate to `http://localhost:8080/`.

**Note on API Keys**:
To use the AI features, you must provide a Google Gemini API Key.
The application expects `process.env.API_KEY` to be available. In a production build, replace this with your actual key or use a build tool like Vite/Webpack to inject it.

## Privacy

This application follows a **Local-First** philosophy. All your data (tasks, notes, habits) is stored exclusively in your browser's `IndexedDB`. Data is only sent to the cloud if you explicitly use the AI Assistant features, and only the relevant context is sent to the Gemini API.
