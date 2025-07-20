'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import { 
  User, 
  Calendar,
  MapPin,
  Phone,
  Mail,
  Edit,
  Camera,
  Clock,
  Award,
  Shield,
  Settings,
  Activity,
  Users,
  FileText,
  Star,
  BadgeCheck,
  Briefcase,
  UserCheck,
  Heart,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils'
import { useAuth } from '@/lib/auth'
import { useMyActivities, useMyShifts, useMyBehaviors } from '@/lib/hooks'
import { useRouter } from 'next/navigation'

const ProfileHeader = ({ user, isLoading }: { user: any, isLoading: boolean }) => {
  const router = useRouter()
  
  if (isLoading) {
    return (
      <div className="card p-6">
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-8 h-8 animate-spin text-btn-primary" />
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="card p-6">
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-text-danger mx-auto mb-2" />
            <p className="text-text-danger">Unable to load profile</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card p-6">
      <div className="flex items-start gap-6">
        <div className="relative">
          <div className="w-24 h-24 bg-btn-primary/20 rounded-full flex items-center justify-center">
            {user.profile_image ? (
              <img 
                src={user.profile_image} 
                alt={user.full_name}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <User className="w-12 h-12 text-btn-primary" />
            )}
          </div>
          <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-btn-primary rounded-full flex items-center justify-center">
            <Camera className="w-4 h-4 text-white" />
          </button>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-3xl font-bold text-text-primary">{user.full_name}</h1>
            <span className={cn(
              "px-3 py-1 rounded-full text-sm font-medium",
              user.approved ? "bg-text-positive/10 text-text-positive" : "bg-yellow-100 text-yellow-800"
            )}>
              {user.approved ? 'Active' : 'Pending Approval'}
            </span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-nav-icon" />
              <span className="text-sm text-card-subtext">
                {user.is_admin ? 'Administrator' : user.is_active_carer ? 'Carer' : 'User'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-nav-icon" />
              <span className="text-sm text-card-subtext">{user.username}</span>
            </div>
            <div className="flex items-center gap-2">
              <BadgeCheck className="w-4 h-4 text-nav-icon" />
              <span className="text-sm text-card-subtext">ID: {user.id}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-nav-icon" />
              <span className="text-sm text-card-subtext">Since {formatDate(user.created_at)}</span>
            </div>
          </div>
          
          <p className="text-card-subtext leading-relaxed">
            {user.is_admin 
              ? "System administrator with full access to all features and settings." 
              : user.is_active_carer 
              ? `Active carer providing support services. Passionate about helping clients achieve their goals.`
              : "Team member contributing to quality care and support services."
            }
          </p>
        </div>
        
        <button 
          onClick={() => router.push('/profile/edit')}
          className="btn-primary flex items-center gap-2"
        >
          <Edit className="w-4 h-4" />
          Edit Profile
        </button>
      </div>
    </div>
  )
}

const ContactInfo = ({ user, isLoading }: { user: any, isLoading: boolean }) => {
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

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-card-title mb-4">Contact Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-btn-primary/10 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-btn-primary" />
            </div>
            <div>
              <p className="font-medium text-card-title">{user?.email || 'Not provided'}</p>
              <p className="text-sm text-card-subtext">Email Address</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-btn-primary/10 rounded-lg flex items-center justify-center">
              <Phone className="w-5 h-5 text-btn-primary" />
            </div>
            <div>
              <p className="font-medium text-card-title">{user?.phone || 'Not provided'}</p>
              <p className="text-sm text-card-subtext">Phone Number</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-btn-primary/10 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-btn-primary" />
            </div>
            <div>
              <p className="font-medium text-card-title">{user?.address || 'Not provided'}</p>
              <p className="text-sm text-card-subtext">Address</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-btn-primary/10 rounded-lg flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-btn-primary" />
            </div>
            <div>
              <p className="font-medium text-card-title">{user?.emergency_contact || 'Not provided'}</p>
              <p className="text-sm text-card-subtext">Emergency Contact</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-btn-primary/10 rounded-lg flex items-center justify-center">
              <Phone className="w-5 h-5 text-btn-primary" />
            </div>
            <div>
              <p className="font-medium text-card-title">{user?.emergency_phone || 'Not provided'}</p>
              <p className="text-sm text-card-subtext">Emergency Phone</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-btn-primary/10 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-btn-primary" />
            </div>
            <div>
              <p className="font-medium text-card-title">
                {user?.is_active_carer ? 'Active Carer' : user?.is_admin ? 'Administrator' : 'Team Member'}
              </p>
              <p className="text-sm text-card-subtext">Role Status</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const ProfessionalInfo = ({ user, stats, isLoading }: { user: any, stats: any, isLoading: boolean }) => {
  if (isLoading) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-card-title mb-4">Professional Information</h3>
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-6 h-6 animate-spin text-btn-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-card-title mb-4">Professional Information</h3>
      
      <div className="space-y-6">
        <div>
          <h4 className="font-medium text-card-title mb-3">Role & Responsibilities</h4>
          <div className="flex flex-wrap gap-2">
            {user?.is_admin && (
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">Administrator</span>
            )}
            {user?.is_active_carer && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Active Carer</span>
            )}
            {user?.approved && (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Approved</span>
            )}
          </div>
        </div>

        <div>
          <h4 className="font-medium text-card-title mb-3">Experience & Certifications</h4>
          <div className="space-y-2">
            <p className="text-sm text-card-subtext">
              <span className="font-medium">Member Since:</span> {formatDate(user?.created_at)}
            </p>
            <p className="text-sm text-card-subtext">
              <span className="font-medium">Account Status:</span> {user?.approved ? 'Approved & Active' : 'Pending Approval'}
            </p>
            <p className="text-sm text-card-subtext">
              <span className="font-medium">User Type:</span> {user?.is_admin ? 'System Administrator' : user?.is_active_carer ? 'Professional Carer' : 'Team Member'}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-bg-highlight rounded-lg">
            <div className="text-2xl font-bold text-btn-primary">{stats.totalShifts}</div>
            <div className="text-sm text-card-subtext">Total Shifts</div>
          </div>
          <div className="text-center p-4 bg-bg-highlight rounded-lg">
            <div className="text-2xl font-bold text-btn-primary">{stats.totalActivities}</div>
            <div className="text-sm text-card-subtext">Activities Completed</div>
          </div>
          <div className="text-center p-4 bg-bg-highlight rounded-lg">
            <div className="text-2xl font-bold text-btn-primary">{stats.totalBehaviors}</div>
            <div className="text-sm text-card-subtext">Behavior Logs</div>
          </div>
        </div>
      </div>
    </div>
  )
}

const StatisticsCards = ({ stats, isLoading }: { stats: any, isLoading: boolean }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="card p-4 text-center">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-btn-primary" />
            <div className="h-6 bg-gray-200 rounded mb-1"></div>
            <div className="h-4 bg-gray-100 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <div className="card p-4 text-center">
        <Clock className="w-6 h-6 text-btn-primary mx-auto mb-2" />
        <div className="text-xl font-bold text-card-title">{stats.totalShifts}</div>
        <div className="text-xs text-card-subtext">Total Shifts</div>
      </div>
      
      <div className="card p-4 text-center">
        <Activity className="w-6 h-6 text-btn-primary mx-auto mb-2" />
        <div className="text-xl font-bold text-card-title">{stats.totalActivities}</div>
        <div className="text-xs text-card-subtext">Activities</div>
      </div>
      
      <div className="card p-4 text-center">
        <Users className="w-6 h-6 text-btn-primary mx-auto mb-2" />
        <div className="text-xl font-bold text-card-title">{stats.thisMonthActivities}</div>
        <div className="text-xs text-card-subtext">This Month</div>
      </div>
      
      <div className="card p-4 text-center">
        <Star className="w-6 h-6 text-btn-primary mx-auto mb-2" />
        <div className="text-xl font-bold text-card-title">{stats.completedActivities}</div>
        <div className="text-xs text-card-subtext">Completed</div>
      </div>
      
      <div className="card p-4 text-center">
        <Heart className="w-6 h-6 text-btn-primary mx-auto mb-2" />
        <div className="text-xl font-bold text-card-title">{stats.recentShifts}</div>
        <div className="text-xs text-card-subtext">Recent Shifts</div>
      </div>
      
      <div className="card p-4 text-center">
        <FileText className="w-6 h-6 text-btn-primary mx-auto mb-2" />
        <div className="text-xl font-bold text-card-title">{stats.totalBehaviors}</div>
        <div className="text-xs text-card-subtext">Behavior Logs</div>
      </div>
    </div>
  )
}

const RecentActivity = ({ activities, shifts, behaviors, isLoading }: { activities: any[], shifts: any[], behaviors: any[], isLoading: boolean }) => {
  if (isLoading) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-card-title mb-4">Recent Activity</h3>
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-6 h-6 animate-spin text-btn-primary" />
        </div>
      </div>
    )
  }

  // Combine and sort all activities
  const allActivities = [
    ...activities.slice(0, 3).map(item => ({
      id: item.id,
      type: 'activity',
      description: `Completed activity: ${item.activity_name || item.name}`,
      date: item.scheduled_datetime || item.created_at,
      status: item.status
    })),
    ...shifts.slice(0, 2).map(item => ({
      id: item.id,
      type: 'shift',
      description: `Shift: ${item.shift_type} shift`,
      date: item.date,
      status: item.status
    })),
    ...behaviors.slice(0, 2).map(item => ({
      id: item.id,
      type: 'behavior',
      description: `Behavior log: ${item.behavior_type}`,
      date: item.date,
      status: 'logged'
    }))
  ]
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  .slice(0, 5)

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'activity': return Activity
      case 'shift': return Clock
      case 'behavior': return FileText
      default: return Activity
    }
  }

  const getActivityColor = (type: string, status: string) => {
    if (type === 'activity') {
      return status === 'completed' ? 'text-green-600' : 'text-blue-600'
    }
    if (type === 'shift') {
      return status === 'completed' ? 'text-green-600' : 'text-orange-600'
    }
    return 'text-red-600'
  }

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-card-title mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {allActivities.length > 0 ? (
          allActivities.map((activity) => {
            const IconComponent = getActivityIcon(activity.type)
            return (
              <div key={`${activity.type}-${activity.id}`} className="flex items-start gap-3 p-3 bg-bg-highlight rounded-lg">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  activity.type === 'activity' ? "bg-blue-100" : 
                  activity.type === 'shift' ? "bg-green-100" : "bg-red-100"
                )}>
                  <IconComponent className={cn(
                    "w-4 h-4",
                    getActivityColor(activity.type, activity.status)
                  )} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-card-title">{activity.description}</p>
                  <div className="flex items-center gap-4 mt-1">
                    <p className="text-sm text-card-subtext">{formatDate(activity.date)}</p>
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      activity.status === 'completed' ? "bg-green-100 text-green-800" :
                      activity.status === 'in_progress' ? "bg-blue-100 text-blue-800" :
                      activity.status === 'scheduled' ? "bg-yellow-100 text-yellow-800" :
                      "bg-gray-100 text-gray-800"
                    )}>
                      {activity.status || 'logged'}
                    </span>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <p className="text-center text-card-subtext py-8">No recent activity to display</p>
        )}
      </div>
    </div>
  )
}

const WorkPreferences = ({ user }: { user: any }) => (
  <div className="card p-6">
    <h3 className="text-lg font-semibold text-card-title mb-4">Account Information</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h4 className="font-medium text-card-title mb-3">Account Details</h4>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-card-subtext">Username:</span>
            <span className="text-card-title font-medium">{user?.username}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-card-subtext">User ID:</span>
            <span className="text-card-title font-medium">{user?.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-card-subtext">Account Type:</span>
            <span className="text-card-title font-medium">
              {user?.is_admin ? 'Administrator' : user?.is_active_carer ? 'Carer' : 'User'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-card-subtext">Status:</span>
            <span className={cn(
              "font-medium",
              user?.approved ? "text-green-600" : "text-yellow-600"
            )}>
              {user?.approved ? 'Approved' : 'Pending'}
            </span>
          </div>
        </div>
      </div>
      
      <div>
        <h4 className="font-medium text-card-title mb-3">Permissions</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-card-subtext">Admin Access</span>
            <span className={cn(
              "px-2 py-1 rounded-full text-xs font-medium",
              user?.is_admin ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
            )}>
              {user?.is_admin ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-card-subtext">Carer Status</span>
            <span className={cn(
              "px-2 py-1 rounded-full text-xs font-medium",
              user?.is_active_carer ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-600"
            )}>
              {user?.is_active_carer ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-card-subtext">Account Approved</span>
            <span className={cn(
              "px-2 py-1 rounded-full text-xs font-medium",
              user?.approved ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
            )}>
              {user?.approved ? 'Yes' : 'Pending'}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
)

const Achievements = ({ stats }: { stats: any }) => (
  <div className="card p-6">
    <h3 className="text-lg font-semibold text-card-title mb-4">Achievements & Milestones</h3>
    <div className="space-y-4">
      {stats.totalActivities >= 100 && (
        <div className="flex items-start gap-3 p-4 bg-bg-highlight rounded-lg">
          <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
            <Award className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <h4 className="font-medium text-card-title">Activity Champion</h4>
            <p className="text-sm text-card-subtext">Completed 100+ activities</p>
          </div>
        </div>
      )}
      
      {stats.totalShifts >= 50 && (
        <div className="flex items-start gap-3 p-4 bg-bg-highlight rounded-lg">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-medium text-card-title">Reliable Carer</h4>
            <p className="text-sm text-card-subtext">Completed 50+ shifts</p>
          </div>
        </div>
      )}
      
      {stats.totalBehaviors >= 20 && (
        <div className="flex items-start gap-3 p-4 bg-bg-highlight rounded-lg">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h4 className="font-medium text-card-title">Detail Oriented</h4>
            <p className="text-sm text-card-subtext">Logged 20+ behavior observations</p>
          </div>
        </div>
      )}

      {stats.totalActivities < 10 && stats.totalShifts < 10 && stats.totalBehaviors < 5 && (
        <div className="text-center py-8">
          <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-card-subtext">Complete more activities to unlock achievements!</p>
        </div>
      )}
    </div>
  </div>
)

export default function UserProfilePage() {
  const { user, loading } = useAuth()
  const { activities, isLoading: activitiesLoading } = useMyActivities()
  const { shifts, isLoading: shiftsLoading } = useMyShifts()
  const { behaviors, isLoading: behaviorsLoading } = useMyBehaviors()

  // Calculate statistics from real data
  const stats = {
    totalShifts: shifts?.length || 0,
    totalActivities: activities?.length || 0,
    totalBehaviors: behaviors?.length || 0,
    completedActivities: activities?.filter((a: any) => a.status === 'completed').length || 0,
    thisMonthActivities: activities?.filter((a: any) => {
      const activityDate = new Date(a.scheduled_datetime || a.created_at)
      const now = new Date()
      return activityDate.getMonth() === now.getMonth() && activityDate.getFullYear() === now.getFullYear()
    }).length || 0,
    recentShifts: shifts?.filter((s: any) => {
      const shiftDate = new Date(s.date)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return shiftDate >= weekAgo
    }).length || 0
  }

  const isDataLoading = loading || activitiesLoading || shiftsLoading || behaviorsLoading

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-btn-primary" />
        </div>
      </DashboardLayout>
    )
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-text-danger mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-text-primary mb-2">Access Denied</h2>
            <p className="text-card-subtext">Please log in to view your profile.</p>
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
          { label: 'My Profile' }
        ]} />

        {/* Profile Header */}
        <ProfileHeader user={user} isLoading={loading} />

        {/* Statistics */}
        <StatisticsCards stats={stats} isLoading={isDataLoading} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ContactInfo user={user} isLoading={loading} />
          <ProfessionalInfo user={user} stats={stats} isLoading={isDataLoading} />
        </div>

        <WorkPreferences user={user} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentActivity 
            activities={activities || []} 
            shifts={shifts || []} 
            behaviors={behaviors || []} 
            isLoading={isDataLoading} 
          />
          <Achievements stats={stats} />
        </div>
      </div>
    </DashboardLayout>
  )
} 