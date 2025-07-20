'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import { 
  Users, 
  Calendar,
  Target,
  Activity,
  Heart,
  MapPin,
  Phone,
  Mail,
  Edit,
  Camera,
  TrendingUp,
  Clock,
  Award,
  FileText,
  BarChart3,
  Star,
  Music,
  Puzzle,
  TreePine,
  Palette,
  Waves,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils'
import { Bar } from 'react-chartjs-2'
import { chartOptions } from '@/lib/charts'
import { 
  usePrimaryClient, 
  useGoals, 
  useMyActivities, 
  useTodayActivities,
  useGoalAnalytics,
  useTavongaActivityAnalytics
} from '@/lib/hooks'

// Helper function to calculate age from date of birth
const calculateAge = (dateOfBirth: string) => {
  const today = new Date()
  const birthDate = new Date(dateOfBirth)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age
}

// Helper function to get communication style description
const getCommunicationStyleDescription = (client: any) => {
  if (client?.communication_preferences) {
    return client.communication_preferences
  }
  return 'Communication style being assessed'
}

// Static interests data (could be moved to API later)
const staticInterests = [
  { name: 'Music & Rhythm', icon: Music, description: 'Loves listening to music and playing with rhythm instruments' },
  { name: 'Puzzles', icon: Puzzle, description: 'Enjoys jigsaw puzzles and problem-solving activities' },
  { name: 'Nature Walks', icon: TreePine, description: 'Finds peace and joy in outdoor activities' },
  { name: 'Art & Drawing', icon: Palette, description: 'Expresses creativity through drawing and painting' },
  { name: 'Swimming', icon: Waves, description: 'Enjoys water activities and swimming lessons' }
]

// Support preferences helper
const getSupportPreferences = (client: any) => {
  const preferences = []
  
  if (client?.behavioral_triggers?.length > 0) {
    preferences.push('Benefits from trigger awareness and prevention')
  }
  
  if (client?.calming_strategies?.length > 0) {
    preferences.push('Responds well to established calming strategies')
  }
  
  if (client?.communication_preferences) {
    preferences.push('Requires specific communication approaches')
  }
  
  // Add some default preferences if none are specified
  if (preferences.length === 0) {
    preferences.push(
      'Prefers structured environments',
      'Responds well to visual cues',
      'Benefits from routine and predictability',
      'Works best with consistent carers'
    )
  }
  
  return preferences
}

const ProfileHeader = ({ client, contacts, isLoading }: any) => {
  if (isLoading) {
    return (
      <div className="card p-6">
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-8 h-8 animate-spin text-btn-primary" />
        </div>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="card p-6">
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-text-danger mx-auto mb-2" />
            <p className="text-text-danger">Unable to load client profile</p>
          </div>
        </div>
      </div>
    )
  }

  const age = calculateAge(client.date_of_birth)
  const primaryContact = contacts?.find((contact: any) => contact.is_primary_contact)

  return (
    <div className="card p-6">
      <div className="flex items-start gap-6">
        <div className="relative">
          <div className="w-24 h-24 bg-btn-primary/20 rounded-full flex items-center justify-center">
            {client.profile_picture ? (
              <img 
                src={client.profile_picture} 
                alt={client.preferred_name || client.first_name}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <Users className="w-12 h-12 text-btn-primary" />
            )}
          </div>
          <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-btn-primary rounded-full flex items-center justify-center">
            <Camera className="w-4 h-4 text-white" />
          </button>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-3xl font-bold text-text-primary">
              {client.preferred_name || client.first_name} {client.last_name}
            </h1>
            <span className={cn(
              "px-3 py-1 rounded-full text-sm font-medium",
              client.is_active ? "bg-text-positive/10 text-text-positive" : "bg-gray-100 text-gray-600"
            )}>
              {client.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-nav-icon" />
              <span className="text-sm text-card-subtext">Age: {age}</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-nav-icon" />
              <span className="text-sm text-card-subtext">{client.diagnosis}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-nav-icon" />
              <span className="text-sm text-card-subtext">Since {formatDate(client.created_at)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-nav-icon" />
              <span className="text-sm text-card-subtext">Care Level: {client.care_level}</span>
            </div>
          </div>
          
          <p className="text-card-subtext leading-relaxed">
            {client.notes || `${client.preferred_name || client.first_name} is receiving personalized care and support services. Care plan includes focus on ${client.diagnosis.toLowerCase()} support and individualized interventions.`}
          </p>
        </div>
        
        <button className="btn-primary flex items-center gap-2">
          <Edit className="w-4 h-4" />
          Edit Profile
        </button>
      </div>
    </div>
  )
}

const ContactInfo = ({ client, contacts, emergencyContacts, isLoading }: any) => {
  if (isLoading) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-card-title mb-4">Contact Information</h3>
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-6 h-6 animate-spin text-btn-primary" />
        </div>
      </div>
    )
  }

  const primaryContact = contacts?.find((contact: any) => contact.is_primary_contact)
  const primaryEmergencyContact = emergencyContacts?.find((contact: any) => contact.contact_type === 'emergency')

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-card-title mb-4">Contact Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          {client?.primary_support_worker && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-btn-primary/10 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-btn-primary" />
              </div>
              <div>
                <p className="font-medium text-card-title">{client.primary_support_worker.full_name}</p>
                <p className="text-sm text-card-subtext">Primary Support Worker</p>
              </div>
            </div>
          )}
          
          {primaryContact && (
            <>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-btn-primary/10 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-btn-primary" />
                </div>
                <div>
                  <p className="font-medium text-card-title">{primaryContact.first_name} {primaryContact.last_name}</p>
                  <p className="text-sm text-card-subtext">Primary Contact ({primaryContact.relationship})</p>
                </div>
              </div>
              
              {primaryContact.phone_primary && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-btn-primary/10 rounded-lg flex items-center justify-center">
                    <Phone className="w-5 h-5 text-btn-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-card-title">{primaryContact.phone_primary}</p>
                    <p className="text-sm text-card-subtext">Primary Phone</p>
                  </div>
                </div>
              )}
              
              {primaryContact.email && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-btn-primary/10 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-btn-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-card-title">{primaryContact.email}</p>
                    <p className="text-sm text-card-subtext">Email</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        
        <div className="space-y-4">
          {client?.address && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-btn-primary/10 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-btn-primary" />
              </div>
              <div>
                <p className="font-medium text-card-title">{client.address}</p>
                <p className="text-sm text-card-subtext">Address</p>
              </div>
            </div>
          )}
          
          {primaryEmergencyContact && (
            <>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-btn-primary/10 rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5 text-btn-primary" />
                </div>
                <div>
                  <p className="font-medium text-card-title">{primaryEmergencyContact.first_name} {primaryEmergencyContact.last_name}</p>
                  <p className="text-sm text-card-subtext">Emergency Contact</p>
                </div>
              </div>
              
              {primaryEmergencyContact.phone_primary && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-btn-primary/10 rounded-lg flex items-center justify-center">
                    <Phone className="w-5 h-5 text-btn-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-card-title">{primaryEmergencyContact.phone_primary}</p>
                    <p className="text-sm text-card-subtext">Emergency Phone</p>
                  </div>
                </div>
              )}
            </>
          )}
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-btn-primary/10 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-btn-primary" />
            </div>
            <div>
              <p className="font-medium text-card-title">Care Level: {client?.care_level}</p>
              <p className="text-sm text-card-subtext">Current assessment level</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const InterestsSection = ({ client }: any) => (
  <div className="card p-6">
    <h3 className="text-lg font-semibold text-card-title mb-4">Interests & Strengths</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {client?.interests ? (
        // If interests are stored in the API, display them
        client.interests.split(',').map((interest: string, index: number) => (
          <div key={index} className="p-4 bg-bg-highlight rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-btn-primary/10 rounded-lg flex items-center justify-center">
                <Heart className="w-4 h-4 text-btn-primary" />
              </div>
              <h4 className="font-medium text-card-title">{interest.trim()}</h4>
            </div>
          </div>
        ))
      ) : (
        // Display static interests if not available in API
        staticInterests.map((interest, index) => (
          <div key={index} className="p-4 bg-bg-highlight rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-btn-primary/10 rounded-lg flex items-center justify-center">
                <interest.icon className="w-4 h-4 text-btn-primary" />
              </div>
              <h4 className="font-medium text-card-title">{interest.name}</h4>
            </div>
            <p className="text-sm text-card-subtext">{interest.description}</p>
          </div>
        ))
      )}
    </div>
    
    {/* Support Preferences */}
    <div className="mt-6">
      <h4 className="font-medium text-card-title mb-3">Support Preferences</h4>
      <div className="space-y-2">
        {getSupportPreferences(client).map((preference, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-2 h-2 bg-btn-primary rounded-full"></div>
            <span className="text-sm text-card-subtext">{preference}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
)

const GoalsProgress = ({ isLoading }: any) => {
  const { goals, isLoading: goalsLoading } = useGoals()
  
  if (isLoading || goalsLoading) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-card-title mb-4">Goals & Progress</h3>
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-6 h-6 animate-spin text-btn-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-card-title mb-4">Goals & Progress</h3>
      <div className="space-y-4">
        {goals?.length > 0 ? (
          goals.slice(0, 4).map((goal: any) => (
            <div key={goal.id} className="p-4 bg-bg-highlight rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-card-title">{goal.name}</h4>
                <span className="text-sm font-medium text-card-title">{goal.progress_percentage || goal.calculated_progress || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    (goal.progress_percentage || goal.calculated_progress || 0) >= 80 ? "bg-text-positive" : 
                    (goal.progress_percentage || goal.calculated_progress || 0) >= 50 ? "bg-yellow-500" : "bg-text-danger"
                  )}
                  style={{ width: `${goal.progress_percentage || goal.calculated_progress || 0}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-xs text-card-subtext">
                <span>Target: {goal.target_date ? formatDate(goal.target_date) : 'Ongoing'}</span>
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  goal.status === 'active' && "bg-text-positive/10 text-text-positive",
                  goal.status === 'completed' && "bg-green-100 text-green-800",
                  goal.status === 'paused' && "bg-yellow-100 text-yellow-800"
                )}>
                  {goal.status}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-card-subtext">No goals currently set</p>
          </div>
        )}
      </div>
    </div>
  )
}

const ProgressChart = () => {
  const { goalAnalytics, isLoading } = useGoalAnalytics()
  
  if (isLoading) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-card-title mb-4">Progress Overview</h3>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 animate-spin text-btn-primary" />
        </div>
      </div>
    )
  }

  // Create chart data from goal analytics or use default
  const progressData = goalAnalytics?.progress_data || {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Goal Progress',
        data: [0, 0, 0, 0, 0, 0],
        backgroundColor: '#4ECDC4',
        borderColor: '#3DB9B2',
        borderWidth: 2,
        borderRadius: 4,
      }
    ]
  }

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-card-title mb-4">Progress Overview</h3>
      <div className="h-64">
        <Bar 
          data={progressData} 
          options={{
            ...chartOptions,
            plugins: {
              ...chartOptions.plugins,
              legend: {
                ...chartOptions.plugins.legend,
                position: 'top' as const,
                labels: {
                  ...chartOptions.plugins.legend.labels,
                  boxWidth: 12,
                  padding: 15,
                },
              },
            },
            scales: {
              x: {
                ...chartOptions.scales.x,
                grid: {
                  display: false,
                },
              },
              y: {
                ...chartOptions.scales.y,
                beginAtZero: true,
                max: 100,
                ticks: {
                  ...chartOptions.scales.y.ticks,
                  stepSize: 20,
                  callback: function(value) {
                    return value + '%';
                  },
                },
              },
            },
          }}
        />
      </div>
    </div>
  )
}

const RecentActivities = () => {
  const { activities, isLoading } = useMyActivities()
  const { activities: todayActivities } = useTodayActivities()
  
  if (isLoading) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-card-title mb-4">Recent Activities</h3>
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-6 h-6 animate-spin text-btn-primary" />
        </div>
      </div>
    )
  }

  // Combine and sort activities
  const allActivities = [...(activities || []), ...(todayActivities || [])]
    .sort((a, b) => new Date(b.created_at || b.scheduled_datetime).getTime() - new Date(a.created_at || a.scheduled_datetime).getTime())
    .slice(0, 4)

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-card-title mb-4">Recent Activities</h3>
      <div className="space-y-3">
        {allActivities.length > 0 ? (
          allActivities.map((activity: any) => (
            <div key={activity.id} className="flex items-center justify-between p-3 bg-bg-highlight rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-btn-primary/10 rounded-lg flex items-center justify-center">
                  <Activity className="w-4 h-4 text-btn-primary" />
                </div>
                <div>
                  <p className="font-medium text-card-title">
                    {activity.activity?.name || activity.name || 'Activity'}
                  </p>
                  <p className="text-sm text-card-subtext">
                    {activity.assigned_user?.full_name || activity.created_by?.full_name || 'Staff'} • 
                    {formatDate(activity.scheduled_date || activity.created_at)} • 
                    {activity.estimated_duration ? `${activity.estimated_duration} min` : 'Duration varies'}
                  </p>
                </div>
              </div>
              <span className={cn(
                "px-2 py-1 rounded-full text-xs font-medium",
                activity.status === 'completed' && "bg-text-positive/10 text-text-positive",
                activity.status === 'in_progress' && "bg-blue-100 text-blue-800",
                activity.status === 'scheduled' && "bg-gray-100 text-gray-800"
              )}>
                {activity.status}
              </span>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-card-subtext">No recent activities</p>
          </div>
        )}
      </div>
    </div>
  )
}

const Achievements = ({ client }: any) => (
  <div className="card p-6">
    <h3 className="text-lg font-semibold text-card-title mb-4">Client Information</h3>
    <div className="space-y-4">
      {/* Medical Information */}
      <div className="p-4 bg-bg-highlight rounded-lg">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <FileText className="w-4 h-4 text-blue-800" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-card-title">Medical Information</p>
            <div className="mt-2 space-y-1">
              <p className="text-sm text-card-subtext">
                <span className="font-medium">Primary Diagnosis:</span> {client?.diagnosis || 'Not specified'}
              </p>
              {client?.secondary_diagnoses && (
                <p className="text-sm text-card-subtext">
                  <span className="font-medium">Secondary:</span> {client.secondary_diagnoses}
                </p>
              )}
              {client?.allergies && (
                <p className="text-sm text-card-subtext">
                  <span className="font-medium">Allergies:</span> {client.allergies}
                </p>
              )}
              {client?.medications && (
                <p className="text-sm text-card-subtext">
                  <span className="font-medium">Medications:</span> {client.medications}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Communication Preferences */}
      <div className="p-4 bg-bg-highlight rounded-lg">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <Users className="w-4 h-4 text-green-800" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-card-title">Communication</p>
            <p className="text-sm text-card-subtext mt-1">
              {getCommunicationStyleDescription(client)}
            </p>
          </div>
        </div>
      </div>

      {/* Behavioral Information */}
      {(client?.behavioral_triggers?.length > 0 || client?.calming_strategies?.length > 0) && (
        <div className="p-4 bg-bg-highlight rounded-lg">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 text-yellow-800" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-card-title">Behavioral Support</p>
              <div className="mt-2 space-y-2">
                {client?.behavioral_triggers?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-card-title">Triggers:</p>
                    <p className="text-sm text-card-subtext">{client.behavioral_triggers.join(', ')}</p>
                  </div>
                )}
                {client?.calming_strategies?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-card-title">Calming Strategies:</p>
                    <p className="text-sm text-card-subtext">{client.calming_strategies.join(', ')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
)

export default function ClientProfilePage() {
  const { client, contacts, emergencyContacts, isLoading, isError } = usePrimaryClient()

  if (isError) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-text-danger mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-text-primary mb-2">Unable to Load Profile</h2>
            <p className="text-card-subtext">There was an error loading the client profile. Please try again later.</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Breadcrumbs */}
        <Breadcrumbs items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Client Profile' }
        ]} />

        {/* Profile Header */}
        <ProfileHeader client={client} contacts={contacts} isLoading={isLoading} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ContactInfo 
            client={client} 
            contacts={contacts} 
            emergencyContacts={emergencyContacts} 
            isLoading={isLoading} 
          />
          <InterestsSection client={client} />
        </div>

        <GoalsProgress isLoading={isLoading} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProgressChart />
          <RecentActivities />
        </div>

        <Achievements client={client} />
      </div>
    </DashboardLayout>
  )
} 