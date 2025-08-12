import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useUser } from './UserContext'

const TeamContext = createContext()

export function TeamProvider({ children }) {
  const user = useUser()
  const [teams, setTeams] = useState([])
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [teamMembers, setTeamMembers] = useState([])
  const [channels, setChannels] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchUserTeams()
    }
  }, [user])

  useEffect(() => {
    if (selectedTeam) {
      fetchTeamMembers()
      fetchTeamChannels()
    }
  }, [selectedTeam])

  async function fetchUserTeams() {
    try {
      const { data: teamMemberships } = await supabase
        .from('team_members')
        .select(`
          team_id,
          role,
          teams (
            id,
            name,
            description,
            created_at
          )
        `)
        .eq('user_id', user.id)

      const userTeams = teamMemberships?.map(tm => ({
        ...tm.teams,
        userRole: tm.role
      })) || []

      setTeams(userTeams)
      
      if (userTeams.length > 0 && !selectedTeam) {
        setSelectedTeam(userTeams[0])
      }
    } catch (error) {
      console.error('Error fetching teams:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchTeamMembers() {
    if (!selectedTeam) return

    try {
      const { data: members } = await supabase
        .from('team_members')
        .select(`
          user_id,
          role,
          joined_at,
          profiles (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('team_id', selectedTeam.id)

      setTeamMembers(members || [])
    } catch (error) {
      console.error('Error fetching team members:', error)
    }
  }

  async function fetchTeamChannels() {
    if (!selectedTeam) return

    try {
      const { data: teamChannels } = await supabase
        .from('channels')
        .select(`
          *,
          profiles!channels_owner_id_fkey (
            username,
            full_name
          )
        `)
        .eq('team_id', selectedTeam.id)
        .order('type', { ascending: true })
        .order('created_at', { ascending: true })

      setChannels(teamChannels || [])
    } catch (error) {
      console.error('Error fetching channels:', error)
    }
  }

  async function createRamblingsChannels() {
    if (!selectedTeam || !teamMembers.length) return

    try {
      const channelsToCreate = teamMembers
        .filter(member => !channels.find(ch => ch.owner_id === member.user_id && ch.type === 'ramblings'))
        .map(member => ({
          team_id: selectedTeam.id,
          name: `${member.profiles.username}'s Ramblings`,
          type: 'ramblings',
          owner_id: member.user_id,
          is_muted_by_default: true
        }))

      if (channelsToCreate.length > 0) {
        await supabase
          .from('channels')
          .insert(channelsToCreate)

        await fetchTeamChannels()
      }
    } catch (error) {
      console.error('Error creating ramblings channels:', error)
    }
  }

  useEffect(() => {
    if (selectedTeam && teamMembers.length > 0) {
      createRamblingsChannels()
    }
  }, [selectedTeam, teamMembers])

  const value = {
    teams,
    selectedTeam,
    setSelectedTeam,
    teamMembers,
    channels,
    loading,
    refreshTeams: fetchUserTeams,
    refreshChannels: fetchTeamChannels
  }

  return (
    <TeamContext.Provider value={value}>
      {children}
    </TeamContext.Provider>
  )
}

export function useTeam() {
  const context = useContext(TeamContext)
  if (!context) {
    throw new Error('useTeam must be used within a TeamProvider')
  }
  return context
}