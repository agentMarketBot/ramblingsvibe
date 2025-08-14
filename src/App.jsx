import { useState } from 'react'
import './App.css'
import Sidebar from './components/Sidebar'
import ChatInterface from './components/ChatInterface'

// Mock data for team members and their ramblings
const teamMembers = [
  { id: 1, name: 'John', avatar: '👨‍💻' },
  { id: 2, name: 'Sarah', avatar: '👩‍🎨' },
  { id: 3, name: 'Mike', avatar: '👨‍🚀' },
  { id: 4, name: 'Emma', avatar: '👩‍🔬' },
  { id: 5, name: 'Alex', avatar: '👨‍🎯' }
]

const mockRamblings = {
  1: [
    {
      id: 1,
      author: 'John',
      content: 'Just had an interesting thought about our user onboarding flow...',
      type: 'text',
      timestamp: new Date('2024-01-15T09:30:00'),
      replies: [
        {
          id: 11,
          author: 'Sarah',
          content: 'That could really improve conversion rates!',
          timestamp: new Date('2024-01-15T09:45:00')
        }
      ]
    },
    {
      id: 2,
      author: 'John',
      content: 'What if we added a progress indicator to the signup process?',
      type: 'idea',
      timestamp: new Date('2024-01-15T14:20:00'),
      replies: []
    }
  ],
  2: [
    {
      id: 3,
      author: 'Sarah',
      content: 'Check out this design inspiration I found',
      type: 'link',
      url: 'https://dribbble.com/shots/example',
      timestamp: new Date('2024-01-15T11:15:00'),
      replies: [
        {
          id: 31,
          author: 'Emma',
          content: 'Love the color palette!',
          timestamp: new Date('2024-01-15T11:30:00')
        }
      ]
    }
  ],
  3: [
    {
      id: 4,
      author: 'Mike',
      content: 'Working on the new API architecture. Thinking about microservices vs monolith...',
      type: 'text',
      timestamp: new Date('2024-01-15T16:45:00'),
      replies: []
    }
  ],
  4: [],
  5: []
}

function App() {
  const [selectedChannel, setSelectedChannel] = useState(1)
  const [currentUser] = useState({ id: 1, name: 'John' }) // Simulating logged-in user

  const selectedMember = teamMembers.find(member => member.id === selectedChannel)
  const channelRamblings = mockRamblings[selectedChannel] || []

  return (
    <div className="app">
      <Sidebar 
        teamMembers={teamMembers}
        selectedChannel={selectedChannel}
        onChannelSelect={setSelectedChannel}
        currentUser={currentUser}
      />
      <ChatInterface 
        selectedMember={selectedMember}
        ramblings={channelRamblings}
        currentUser={currentUser}
        isOwnChannel={selectedChannel === currentUser.id}
      />
    </div>
  )
}

export default App