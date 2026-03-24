# get stuff done! (GSD!)
**A dead-simple daily checklist. No account. No cloud. No nonsense.**
---
Most productivity apps fail at the one thing they promise: making you productive. They bury you in features, demand accounts, sync to servers you don't control, and turn a simple checklist into a project management system you never asked for.
GSD! does one thing. It gives you a checklist that resets every midnight. That is it.
You open it. You add your tasks. You check them off. Tomorrow, the slate is clean but your tasks remain, ready to be checked off again. No decisions. No configuration. No cognitive overhead.
---
## Why This Exists
There is a specific kind of productivity that no app seems to respect: the daily routine. The things you do every single day that don't need a due date, a priority level, a label, a project folder, or a Gantt chart. They just need a checkbox.
- Did I exercise?
- Did I read for 30 minutes?
- Did I review my finances?
- Did I take my medication?
These are not tasks you manage. They are tasks you do. GSD! is built for exactly this.
---
## Privacy
GSD! makes zero network requests after the initial page load. None. Your tasks never leave your device.
Here is the complete list of places your data is sent:
1. Nowhere.
That is the entire list.
There is no analytics. No tracking pixels. No Google anything. No cookies. No telemetry. No server-side storage. No database. No API calls. No WebSocket connections. Not even an error reporting service.
Your data lives in your browser's `localStorage` — a small storage area on your device that only you and your browser can access. If you clear your browser data, your tasks are gone forever because nobody else ever had a copy.
The service worker exists solely to cache the app's static files (HTML, CSS, JavaScript) so it works when you have no internet connection. It never touches your task data.
You can verify all of this yourself. The entire application is open source, and the codebase is small enough to read in one sitting.
---
## Features
### Core
- **Add tasks** — Type a task and press Enter or tap the add button. That is all it takes.
- **Check tasks off** — Tap the checkbox or the task text itself. A completed task gets a strikethrough.
- **Delete tasks** — Each task has a delete button. On desktop it appears on hover; on mobile it is always subtly visible.
- **Clear completed** — One button to remove all checked-off tasks at once.
### Daily Reset
- **Automatic midnight reset** — When a new day begins, all your checkmarks clear but your task list stays intact. Your routine tasks carry over; only the completion state resets.
- **Active detection** — The app checks for a new day every 30 seconds, so if you leave it open overnight, it resets itself without needing a refresh.
- **Load-time detection** — If you open the app the next morning, it detects the date change immediately on load and presents a clean slate.
### Persistence
- **Survives refresh** — Your tasks and their completion state are saved to `localStorage` on every single change. Reload the page and everything is exactly as you left it.
- **Survives browser restart** — Close the browser entirely, reopen it days later, and your tasks are still there (with checkmarks reset if the date has changed).
- **Resilient to corruption** — If `localStorage` data is somehow corrupted, the app gracefully falls back to an empty state instead of crashing. You lose your list but the app keeps working.
- **Cross-tab sync** — If you have GSD! open in multiple tabs, adding or completing a task in one tab is reflected in the others via the browser's `storage` event.
### Offline Support
- **Works without internet** — A service worker caches all app assets on the first visit. After that, you can use GSD! on an airplane, in a subway, in a cabin with no signal. If the page has loaded once, it works forever.
- **Network-first strategy** — When you are online, the service worker fetches the latest version and updates the cache. When you are offline, it serves from cache. You always get the most recent version available.
### Interface
- **Progress tracking** — A progress card at the top shows how many tasks you have completed out of your total, with a percentage and a visual progress bar.
- **Completion celebration** — When all tasks are done, the progress card turns green with a gentle animation. You earned it.
- **Staggered animations** — Tasks animate in with a subtle staggered fade, giving the list a polished feel without being distracting.
- **Bounce feedback** — Checking a task triggers a small bounce animation on the checkbox, providing satisfying tactile feedback.
- **Responsive design** — Works on any screen size. The layout is optimized for mobile-first use but looks great on desktop.
- **Touch-friendly** — All interactive elements meet minimum tap target sizes. No frustrating tiny buttons.
- **Keyboard accessible** — Full keyboard navigation support with visible focus indicators.
---
## Technical Details
- Built with React, Vite, and Tailwind CSS
- Single-page application with no routing needed
- No external runtime dependencies beyond React
- No build-time code splitting — the entire app is one small bundle
- Service worker registered on load for offline capability
- All state management through React hooks — no state library needed
- `localStorage` as the only persistence layer
---
## Getting Started
### Use It Now
Deploy to Vercel, Netlify, or any static hosting service. It is a static site — there is no server to configure, no database to provision, no environment variables to set.
### Self-Host
```bash
git clone https://github.com/your-username/get-stuff-done.git
cd get-stuff-done
npm install
npm run build
```
The `dist` folder contains everything. Serve it with any static file server.
### Develop
```bash
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.
---
## Deploy to Vercel
1. Push this repository to GitHub
2. Go to vercel.com and import the repository
3. Framework preset: Vite
4. Click Deploy
That is it. No environment variables. No build configuration. No serverless functions. It is a static site.
---
## What This App Will Never Have
- User accounts
- Cloud sync
- Analytics
- Ads
- A premium tier
- Social features
- AI anything
- Notifications that guilt you
- A settings page with 40 options
The feature set is complete. There is nothing to add because there is nothing missing.
---
## Philosophy
The best tool is the one you actually use. The one you actually use is the one that gets out of your way. GSD! gets out of your way.
You will not spend time organizing your tasks into categories. You will not spend time choosing between priority levels. You will not spend time deciding which project a task belongs to. You will not spend time learning the app.
You will spend time doing the things on your list. That is the point.
---
## License
Do whatever you want with it.