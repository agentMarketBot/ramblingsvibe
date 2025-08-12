# Ramblings App

A minimalist team chat application focused on thoughtful communication and reducing interruptions while maintaining team connection.

## Features

### Core Features
- **Personal Ramblings Channels**: Individual channels for each team member where only they can post top-level messages
- **Thread-based Conversations**: Team members can reply to any post in threaded conversations
- **Muted by Default**: Ramblings channels start muted to reduce noise
- **Content Types**: Support for text updates, links, project ideas, and "what if" suggestions
- **Clean Design**: Minimalist interface focused on content over distractions

### Team Collaboration
- **Channel Sidebar**: Organized view with regular channels and Ramblings section
- **Owner-only Posting**: Only channel owners can create new posts in their Ramblings
- **Visual Indicators**: Clear muted/unmuted status and ownership badges
- **Responsive Design**: Works seamlessly for remote teams of 2-10 people

## Setup

### Prerequisites
- Node.js 18+ (though the app works with Node 18.20.8)
- A Supabase account and project

### Environment Setup

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd ramblingsvibe
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Set up the database:**
   
   Run the migration file in your Supabase SQL editor:
   ```sql
   -- Copy and paste the contents of supabase/migrations/001_initial_schema.sql
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

### Database Schema

The app uses the following main tables:
- `profiles` - User profiles extending Supabase auth
- `teams` - Team organizations  
- `team_members` - Team membership relationships
- `channels` - Both regular and Ramblings channels
- `posts` - Top-level messages
- `replies` - Threaded responses to posts
- `user_channel_preferences` - User-specific channel settings

### Key Features Implementation

#### Ramblings Channels
- Automatically created when users join teams
- Only the owner can create top-level posts
- All team members can reply in threads
- Muted by default with visual indicators

#### Security
- Row Level Security (RLS) policies ensure users only see their team's data
- Owner-only posting enforced at the database level
- Secure authentication via Supabase Auth

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Architecture
- **Frontend**: React + Vite
- **Styling**: Custom CSS with clean, minimalist design
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Icons**: Lucide React
- **Real-time**: Supabase Realtime subscriptions

### Design Philosophy
The app emphasizes:
- **Thoughtful Communication**: Encouraging quality over quantity
- **Reduced Interruptions**: Muted by default, purposeful notifications
- **Personal Expression**: Individual spaces for sharing ideas
- **Team Connection**: Maintaining bonds through threaded discussions

## Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy the `dist` folder to your hosting provider

3. Ensure environment variables are set in your production environment

## Contributing

This project follows a clean, minimalist approach. When contributing:
- Maintain the simple, focused design
- Ensure new features align with the "thoughtful communication" philosophy
- Test with small teams (2-10 people) in mind
- Keep the interface distraction-free
