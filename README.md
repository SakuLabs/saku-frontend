# Saku - Academic Task Management Dashboard

A modern, dark-themed academic task management dashboard built with Next.js, shadcn/ui, and Framer Motion. Designed for students and educators to manage tasks, schedules, and collaborate through study groups.

## Features

### Task Management

- Create, edit, and delete tasks with titles, descriptions, and due dates
- Organize tasks by academic subjects (Math, CS, Biology, Physics, Chemistry, History)
- Priority levels (Low, Medium, High) for task importance
- Task status tracking (Pending, In Progress, Completed)
- Task dependencies and blocker tracking
- Collaboration features to assign tasks to other users
- Real-time task statistics dashboard

### Scheduler & Calendar

- **Month/Week Calendar View**: Visual representation of upcoming deadlines
- **Daily Schedule View**: Hour-by-hour time slot management (7 AM - 7 PM)
- **Timeline View**: Gantt-style deadline visualization with progress tracking
- Drag-and-drop rescheduling support
- Exam schedule management
- Visual indicators for overdue tasks

### Study Groups & Chat

- Real-time group discussion within study groups
- Create and manage multiple study group chat rooms
- Message history and persistence
- Timestamp for all messages
- Clean, modern chat interface with animations

### Modern Design

- Dark theme optimized for extended study sessions
- Beautiful gradient primary color (Blue #3B82F6)
- Cyan accent color for highlights
- Smooth Framer Motion animations
- Fully responsive design (Mobile, Tablet, Desktop)
- Semantic design tokens for consistent theming

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **UI Components**: shadcn/ui
- **Animations**: Framer Motion
- **Database**: SQLite3 with better-sqlite3
- **Styling**: Tailwind CSS
- **Date Management**: date-fns
- **Form Handling**: React Hook Form

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm (or npm/yarn)

### Installation

1. **Install dependencies**

   ```bash
   pnpm install
   ```

2. **Initialize the database**

   ```bash
   pnpm run init-db
   ```

3. **Seed demo data (optional)**

   ```bash
   pnpm run seed-db
   ```

4. **Start the development server**

   ```bash
   pnpm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
├── app/
│   ├── api/                 # API routes for tasks, chat, schedule
│   │   ├── tasks/
│   │   ├── chat/
│   │   └── schedule/
│   ├── layout.tsx           # Root layout with dark theme
│   ├── page.tsx             # Main dashboard page
│   └── globals.css          # Global styles and theme tokens
├── components/
│   ├── task-list.tsx        # Task list display with filtering
│   ├── task-form.tsx        # Task creation/editing modal
│   ├── task-management.tsx   # Task management section
│   ├── calendar-view.tsx     # Calendar month view
│   ├── daily-schedule.tsx    # Daily time slot view
│   ├── timeline-view.tsx     # Gantt-style timeline
│   ├── scheduler.tsx         # Scheduler container
│   ├── chat-messages.tsx     # Message display
│   ├── chat-input.tsx        # Message input
│   ├── chat-system.tsx       # Chat system container
│   └── navigation.tsx        # Main navigation bar
├── hooks/
│   ├── use-tasks.ts         # Task management hook
│   ├── use-schedule.ts      # Schedule management hook
│   └── use-chat.ts          # Chat management hook
├── lib/
│   └── db.ts                # Database utilities
└── scripts/
    ├── init-db.js           # Database initialization
    └── seed-demo-data.js    # Demo data seeding
```

## API Endpoints

### Tasks

- `GET /api/tasks` - Get all tasks for a user
- `POST /api/tasks` - Create a new task
- `GET /api/tasks/[id]` - Get a specific task
- `PUT /api/tasks/[id]` - Update a task
- `DELETE /api/tasks/[id]` - Delete a task

### Chat

- `GET /api/chat` - Get user's chat rooms
- `POST /api/chat` - Create a new chat room
- `GET /api/chat/messages` - Get messages from a room
- `POST /api/chat/messages` - Send a message

### Schedule

- `GET /api/schedule` - Get schedule slots for a date
- `POST /api/schedule` - Create a schedule slot

## Usage

### Creating a Task

1. Navigate to the "Tasks" section
2. Click "New Task" button
3. Fill in task details (title, subject, due date, priority)
4. Click "Create Task"

### Managing Schedule

1. Go to "Scheduler" section
2. Switch between Calendar, Daily View, or Timeline
3. Select a date to view/create schedule slots
4. Use drag-and-drop to reschedule items

### Starting Study Groups

1. Navigate to "Study Groups"
2. Click "New Group" to create a chat room
3. Invite classmates by sharing the room
4. Start collaborating in real-time

## Database Schema

The application uses SQLite3 with the following main tables:

- **users**: User profiles and authentication
- **tasks**: Task information with relationships
- **task_collaborators**: Track task assignments
- **exams**: Exam schedule management
- **chat_rooms**: Study group channels
- **messages**: Chat messages with timestamps
- **schedule_slots**: Daily time slot scheduling

## Design System

### Color Palette

- **Primary**: #3B82F6 (Blue)
- **Accent**: #06B6D4 (Cyan)
- **Background**: #0F1419 (Very Dark Blue)
- **Card**: #1A202C (Dark Gray)
- **Border**: #2D3748 (Gray)
- **Text**: #F8FAFC (Off White)

### Typography

- **Headings**: Geist Sans (Bold, 600-700 weight)
- **Body**: Geist Sans (Regular, 400-500 weight)
- **Monospace**: Geist Mono (Code snippets)

## Performance Optimizations

- Client-side caching with React hooks
- Optimistic UI updates
- Smooth animations with Framer Motion
- Responsive images and lazy loading
- Efficient database queries with indexes

## Future Enhancements

- User authentication and multi-user support
- WebSocket for real-time updates
- Push notifications
- Export functionality (PDF, Calendar)
- Integration with Google Calendar
- AI-powered task suggestions
- Dark/Light theme toggle
- Advanced filtering and search

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues, questions, or suggestions, please open an issue in the repository.

---

Built with passion for academic excellence. Maximize your productivity with Saku!
