'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import Link from 'next/link'
import { 
  Users, 
  Clock, 
  Activity, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart3,
  Target,
  Mail,
  Phone,
  MapPin
} from 'lucide-react'
import { Line, Bar } from 'react-chartjs-2'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils'
import { 
  chartOptions, 
  behaviorTrendsData, 
  weeklyActivityData 
} from '@/lib/charts'
import { useRequireAuth } from '@/lib/auth'
import { 
  useDashboardStats, 
  useCriticalBehaviors, 
  useMyShifts,
  useTodayBehaviors,
  useTodayActivities,
  useOverdueActivities,
  useTavongaActivityAnalytics,
  useMasteryTracking,
  useCurrentBehaviorTrends
} from '@/lib/hooks'
import ClientProfileCard from '@/components/ClientProfileCard'

// Real Chart.js components - Updated to use real data
const BehaviorChart = () => {
  const { currentTrends, isLoading } = useCurrentBehaviorTrends({ days: 7 })
  
  if (isLoading || !currentTrends) {
    return (
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-card-title">Current Behavior Trends</h3>
          <BarChart3 className="w-5 h-5 text-nav-icon" />
        </div>
        <div className="h-48 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-btn-primary mx-auto mb-2"></div>
            <p className="text-text-secondary text-sm">Loading trends...</p>
          </div>
        </div>
      </div>
    )
  }

  const chartData = {
    labels: currentTrends.daily_breakdown?.map((day: any) => day.day_short) || [],
    datasets: [
      {
        label: 'Critical',
        data: currentTrends.daily_breakdown?.map((day: any) => day.critical) || [],
        borderColor: '#FF4444',
        backgroundColor: 'rgba(255, 68, 68, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'High',
        data: currentTrends.daily_breakdown?.map((day: any) => day.high) || [],
        borderColor: '#FF6B6B',
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Medium',
        data: currentTrends.daily_breakdown?.map((day: any) => day.medium) || [],
        borderColor: '#FFA500',
        backgroundColor: 'rgba(255, 165, 0, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Low',
        data: currentTrends.daily_breakdown?.map((day: any) => day.low) || [],
        borderColor: '#4ECDC4',
        backgroundColor: 'rgba(78, 205, 196, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-card-title">Current Behavior Trends</h3>
          <div className="flex items-center gap-4 mt-1">
            <span className="text-sm text-text-secondary">
              Today: {currentTrends.current_stats?.today_total || 0} behaviors
            </span>
            <span className={`text-sm flex items-center gap-1 ${
              currentTrends.current_stats?.week_trend_direction === 'up' ? 'text-red-600' :
              currentTrends.current_stats?.week_trend_direction === 'down' ? 'text-green-600' :
              'text-gray-600'
            }`}>
              {currentTrends.current_stats?.week_trend_direction === 'up' && <TrendingUp className="w-3 h-3" />}
              {currentTrends.current_stats?.week_trend_direction === 'down' && <TrendingDown className="w-3 h-3" />}
              {currentTrends.current_stats?.week_trend_percentage}% this week
            </span>
          </div>
        </div>
        <BarChart3 className="w-5 h-5 text-nav-icon" />
      </div>
      
      {/* Critical Alerts */}
      {currentTrends.critical_alerts && currentTrends.critical_alerts.length > 0 && (
        <div className="mb-4 space-y-2">
          {currentTrends.critical_alerts.map((alert: any, index: number) => (
            <div key={index} className={`p-2 rounded-md text-sm flex items-center gap-2 ${
              alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
              alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              <AlertTriangle className="w-4 h-4" />
              {alert.message}
            </div>
          ))}
        </div>
      )}
      
      <div className="h-48">
        <Line 
          data={chartData} 
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
                ticks: {
                  ...chartOptions.scales.y.ticks,
                  stepSize: 1,
                },
              },
            },
          }}
        />
      </div>
    </div>
  )
}

const WeeklyActivityChart = ({ analytics }: { analytics: any }) => {
  // Process analytics data for chart
  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Completed Activities',
        data: analytics?.completion_by_day?.map((item: any) => item.completion_count) || [0, 0, 0, 0, 0, 0, 0],
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 1,
      },
      {
        label: 'Total Activities',
        data: analytics?.daily_completion_trend?.slice(-7)?.map((item: any) => item.total_activities) || [0, 0, 0, 0, 0, 0, 0],
        backgroundColor: 'rgba(156, 163, 175, 0.5)',
        borderColor: 'rgb(156, 163, 175)',
        borderWidth: 1,
      },
    ],
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-card-title">Weekly Activities</h3>
        <Activity className="w-5 h-5 text-nav-icon" />
      </div>
      <div className="h-48">
        <Bar 
          data={chartData} 
          options={{
            ...chartOptions,
            plugins: {
              ...chartOptions.plugins,
              legend: {
                display: true,
                position: 'top' as const,
                labels: {
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
                ticks: {
                  ...chartOptions.scales.y.ticks,
                  stepSize: 5,
                },
              },
            },
          }}
        />
      </div>
    </div>
  )
}

const StatCard = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  trend = 'up' 
}: {
  title: string
  value: string | number
  change?: string
  icon: any
  trend?: 'up' | 'down'
}) => (
  <div className="card p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-card-subtext mb-1">{title}</p>
        <p className="text-2xl font-bold text-card-title">{value}</p>
        {change && (
          <div className="flex items-center mt-2">
            {trend === 'up' ? (
              <TrendingUp className="w-4 h-4 text-text-positive mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 text-text-danger mr-1" />
            )}
            <span className={cn(
              "text-sm",
              trend === 'up' ? "text-text-positive" : "text-text-danger"
            )}>
              {change}
            </span>
          </div>
        )}
      </div>
      <div className="w-12 h-12 bg-btn-primary rounded-lg flex items-center justify-center">
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
)

const TodayActivitiesCard = ({ activities }: { activities: any[] }) => (
  <div className="card p-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-card-title">Today's Activities</h3>
      <Activity className="w-5 h-5 text-nav-icon" />
    </div>
    <div className="space-y-4">
      {activities.slice(0, 3).map((activity) => (
        <div key={activity.id} className="flex items-center justify-between p-3 bg-bg-highlight rounded-lg">
          <div>
            <p className="font-medium text-card-title">{activity.activity?.name}</p>
            <p className="text-sm text-card-subtext">
              {activity.scheduled_time ? `Scheduled: ${activity.scheduled_time}` : formatDate(activity.date)}
            </p>
          </div>
          <span className={cn(
            "px-2 py-1 rounded-full text-xs font-medium",
            activity.completed && "bg-text-positive/10 text-text-positive",
            activity.status === 'in_progress' && "bg-blue-100 text-blue-800",
            activity.status === 'scheduled' && "bg-gray-100 text-gray-800",
            activity.status === 'cancelled' && "bg-text-danger/10 text-text-danger"
          )}>
            {activity.completed ? 'Completed' : activity.status}
          </span>
        </div>
      ))}
      {activities.length === 0 && (
        <div className="text-center py-4 text-card-subtext">
          No activities scheduled for today
        </div>
      )}
    </div>
  </div>
)

const OverdueActivitiesCard = ({ activities }: { activities: any[] }) => (
  <div className="card p-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-card-title">Overdue Activities</h3>
      <AlertTriangle className="w-5 h-5 text-text-danger" />
    </div>
    <div className="space-y-4">
      {activities.slice(0, 3).map((activity) => (
        <div key={activity.id} className="flex items-center justify-between p-3 bg-bg-highlight rounded-lg">
          <div>
            <p className="font-medium text-card-title">{activity.activity?.name}</p>
            <p className="text-sm text-card-subtext">
              Due: {formatDate(activity.date)} {activity.scheduled_time}
            </p>
          </div>
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-text-danger/10 text-text-danger">
            Overdue
          </span>
        </div>
      ))}
      {activities.length === 0 && (
        <div className="text-center py-4 text-text-positive">
          No overdue activities! 🎉
        </div>
      )}
    </div>
  </div>
)

const ActivityStatsCard = ({ analytics }: { analytics: any }) => (
  <div className="card p-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-card-title">Activity Progress</h3>
      <Target className="w-5 h-5 text-nav-icon" />
    </div>
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-card-subtext">Completion Rate</span>
        <span className="text-lg font-semibold text-card-title">
          {analytics?.overall_completion_rate || 0}%
        </span>
      </div>
      <div className="w-full bg-bg-highlight rounded-full h-2">
        <div 
          className="bg-btn-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${analytics?.overall_completion_rate || 0}%` }}
        />
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="text-center">
          <p className="font-medium text-card-title">
            {analytics?.completion_statistics?.completed_activities || 0}
          </p>
          <p className="text-card-subtext">Completed</p>
        </div>
        <div className="text-center">
          <p className="font-medium text-card-title">
            {analytics?.completion_statistics?.total_activities || 0}
          </p>
          <p className="text-card-subtext">Total</p>
        </div>
      </div>
    </div>
  </div>
)

const ShiftStatusCard = ({ shifts }: { shifts: any[] }) => (
  <div className="card p-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-card-title">Today's Shifts</h3>
      <Clock className="w-5 h-5 text-nav-icon" />
    </div>
    <div className="space-y-3">
      {shifts.slice(0, 3).map((shift) => (
        <div key={shift.id} className="flex items-center justify-between p-3 bg-bg-highlight rounded-lg">
          <div>
            <p className="font-medium text-card-title">{shift.carer?.full_name}</p>
            <p className="text-sm text-card-subtext">
              {shift.start_time} - {shift.end_time}
            </p>
          </div>
          <span className={cn(
            "px-2 py-1 rounded-full text-xs font-medium",
            shift.status === 'completed' && "bg-text-positive/10 text-text-positive",
            shift.status === 'in_progress' && "bg-blue-100 text-blue-800",
            shift.status === 'scheduled' && "bg-gray-100 text-gray-800",
            shift.status === 'cancelled' && "bg-text-danger/10 text-text-danger"
          )}>
            {shift.status}
          </span>
        </div>
      ))}
    </div>
  </div>
)

const TavongaProfileWidget = () => (
  <div className="card p-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-card-title">Client Profile</h3>
      <a 
        href="/client-profile"
        className="w-8 h-8 bg-btn-primary rounded-full flex items-center justify-center hover:bg-btn-primary/80 transition-colors"
      >
        <span className="text-white text-sm font-bold">T</span>
      </a>
    </div>
    
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-bg-highlight rounded-full flex items-center justify-center">
          <Users className="w-5 h-5 text-nav-icon" />
        </div>
        <div>
          <p className="font-medium text-card-title">Active Carers</p>
          <p className="text-sm text-card-subtext">Managing daily care</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-bg-highlight rounded-full flex items-center justify-center">
          <Target className="w-5 h-5 text-nav-icon" />
        </div>
        <div>
          <p className="font-medium text-card-title">Goal Progress</p>
          <p className="text-sm text-card-subtext">Tracking development</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-bg-highlight rounded-full flex items-center justify-center">
          <Activity className="w-5 h-5 text-nav-icon" />
        </div>
        <div>
          <p className="font-medium text-card-title">Daily Activities</p>
          <p className="text-sm text-card-subtext">Structured routines</p>
        </div>
      </div>
    </div>
    
    <div className="mt-6 pt-4 border-t border-border-default">
      <div className="flex items-center justify-between text-sm">
        <span className="text-card-subtext">Support Contact</span>
        <div className="flex items-center space-x-2">
          <Mail className="w-4 h-4 text-nav-icon" />
          <span className="text-card-title">support@tavonga.com</span>
        </div>
      </div>
      <div className="mt-3">
        <a 
          href="/client-profile" 
          className="text-sm text-btn-primary hover:text-btn-primary/80 transition-colors"
        >
          View Full Profile →
        </a>
      </div>
    </div>
  </div>
)

export default function DashboardPage() {
  const { user, loading: authLoading } = useRequireAuth()
  const { stats, isLoading: statsLoading } = useDashboardStats()
  const { behaviors: criticalBehaviors, isLoading: behaviorsLoading } = useCriticalBehaviors()
  const { shifts: myShifts, isLoading: shiftsLoading } = useMyShifts()
  const { behaviors: todayBehaviors } = useTodayBehaviors()
  const { activities: todayActivities } = useTodayActivities()
  const { activities: overdueActivities } = useOverdueActivities()
  const { activityAnalytics } = useTavongaActivityAnalytics()
  const { currentTrends } = useCurrentBehaviorTrends({ days: 7 })

  if (authLoading || statsLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-btn-primary mx-auto mb-4"></div>
            <p className="text-text-secondary">Loading dashboard...</p>
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
          { label: 'Dashboard' }
        ]} />

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              Dashboard
            </h1>
            <p className="text-text-secondary">
              Welcome back! Here's what's happening today.
            </p>
          </div>
          {/* Real-time indicators */}
          {currentTrends?.critical_alerts?.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-800 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">
                {currentTrends.critical_alerts.length} Alert{currentTrends.critical_alerts.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-card-subtext">Total Carers</p>
                <p className="text-2xl font-bold text-card-title">{stats?.total_carers || 0}</p>
                <p className="text-xs text-green-600">{stats?.active_carers || 0} active</p>
              </div>
              <div className="w-12 h-12 bg-btn-primary rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-card-subtext">Behaviors Today</p>
                <p className="text-2xl font-bold text-card-title">{currentTrends?.current_stats?.today_total || 0}</p>
                <div className="flex items-center gap-1">
                  {currentTrends?.current_stats?.week_trend_direction === 'up' && (
                    <>
                      <TrendingUp className="w-3 h-3 text-red-600" />
                      <span className="text-xs text-red-600">+{currentTrends?.current_stats?.week_trend_percentage}%</span>
                    </>
                  )}
                  {currentTrends?.current_stats?.week_trend_direction === 'down' && (
                    <>
                      <TrendingDown className="w-3 h-3 text-green-600" />
                      <span className="text-xs text-green-600">{currentTrends?.current_stats?.week_trend_percentage}%</span>
                    </>
                  )}
                  {currentTrends?.current_stats?.week_trend_direction === 'stable' && (
                    <span className="text-xs text-gray-600">Stable</span>
                  )}
                  <span className="text-xs text-card-subtext">this week</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-card-subtext">Activities Today</p>
                <p className="text-2xl font-bold text-card-title">{todayActivities?.length || 0}</p>
                <p className="text-xs text-card-subtext">{overdueActivities?.length || 0} overdue</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-card-subtext">Critical Behaviors</p>
                <p className="text-2xl font-bold text-card-title">{currentTrends?.current_stats?.today_critical || 0}</p>
                <p className="text-xs text-card-subtext">
                  {currentTrends?.current_stats?.intervention_success_rate || 0}% intervention success
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Cards Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Charts */}
          <div className="lg:col-span-2 space-y-6">
            <BehaviorChart />
            <WeeklyActivityChart analytics={activityAnalytics} />
          </div>

          {/* Side Cards */}
          <div className="space-y-6">
            <ClientProfileCard compact={true} />
            <ActivityStatsCard analytics={activityAnalytics} />
            <TodayActivitiesCard activities={todayActivities} />
            <OverdueActivitiesCard activities={overdueActivities} />
            <ShiftStatusCard shifts={myShifts} />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-card-title mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/activities" className="btn-primary text-center">
              Log Activity
            </Link>
            <Link href="/behaviors" className="btn-secondary text-center">
              Log Behavior
            </Link>
            <Link href="/shifts" className="btn-secondary text-center">
              Manage Shifts
            </Link>
            <Link href="/reports" className="btn-secondary text-center">
              Generate Reports
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 