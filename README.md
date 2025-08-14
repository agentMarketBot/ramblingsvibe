# Ramblings App

A team chat application frontend featuring personal "Ramblings" channels where team members can share thoughts, ideas, and discoveries in a minimalist, non-intrusive way.

## Features

- **Personal Ramblings Channels**: Each team member has their own personal channel for sharing thoughts
- **Thread-Based Conversations**: Team members can reply to ramblings in threaded conversations
- **Content Type Support**: Share various content types including:
  - 💬 Text updates and thoughts
  - 💡 Project ideas and suggestions
  - 🔗 Links and resources
  - 📸 Photos and visual content
- **Muted by Default**: Non-owner channels are muted to reduce interruptions
- **Clean Design**: Minimalist interface focused on reducing noise while maintaining team connection
- **Responsive**: Works well on desktop and mobile devices for remote teams of 2-10 people

## Channel Permissions

- **Own Channel**: Users can post new top-level ramblings and reply to any message
- **Others' Channels**: Users can only reply to existing ramblings, cannot create new top-level posts

## Getting Started

### Prerequisites

- Node.js (v20+ recommended for optimal compatibility)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to the local development URL (typically `http://localhost:5173`)

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Code Quality

Run the linter to check code quality:
```bash
npm run lint
```

## Project Structure

```
src/
├── components/
│   ├── Sidebar.jsx          # Team member channel navigation
│   ├── ChatInterface.jsx    # Main chat area
│   ├── MessageThread.jsx    # Individual message with replies
│   └── MessageComposer.jsx  # New message creation
├── App.jsx                  # Main application component
└── App.css                  # Global styles
```

## Design Principles

- **Minimal Interruptions**: Channels are muted by default except for your own
- **Personal Expression**: Each person has their own space to share freely
- **Team Connection**: Others can engage through replies while respecting the personal nature
- **Content Flexibility**: Support for different types of content sharing
- **Clean Interface**: Focus on content over chrome, reducing visual noise

## Technology Stack

- **React 19**: Modern React with hooks
- **Vite**: Fast build tool and development server
- **CSS3**: Custom styling with responsive design
- **ESLint**: Code quality and consistency

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linting: `npm run lint`
5. Build the project: `npm run build`
6. Submit a pull request

## License

This project is private and intended for internal team use.