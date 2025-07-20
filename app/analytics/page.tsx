'use client'

import { useState, useMemo } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import { 
  BarChart3, 
  Download, 
  Calendar,
  Filter,
  TrendingUp,
  AlertTriangle,
  Users,
  Clock,
  Target,
  Activity,
  Brain,
  Calendar as CalendarIcon,
  CheckCircle,
  XCircle,
  AlertCircle,
  Zap,
  UserCheck,
  Shield,
  Trophy,
  Lightbulb
} from 'lucide-react'
import { Bar, Doughnut, Line, Scatter } from 'react-chartjs-2'
import { cn } from '@/lib/utils'
import { chartOptions } from '@/lib/charts'
import { 
  useTavongaBehaviorAnalytics, 
  useTriggerAnalysis, 
  useInterventionAnalysis, 
  useWorkerAnalysis, 
  usePredictiveIndicators,
  useGoalAnalytics,
  useGoalProgressTrends,
  useTavongaActivityAnalytics,
  useMasteryTracking
} from '@/lib/hooks'

// Enhanced Stats Card for behavioral analytics
const BehaviorStatsCard = ({ title, value, icon: Icon, trend, severity, color = 'blue' }: {
  title: string
  value: string | number
  icon: any
  trend?: string
  severity?: 'low' | 'medium' | 'high' | 'critical'
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'orange'
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600'
  }

  const severityColors = {
    low: 'text-green-600',
    medium: 'text-yellow-600',
    high: 'text-orange-600',
    critical: 'text-red-600'
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-text-secondary mb-1">{title}</p>
          <p className="text-2xl font-semibold text-text-primary">{value}</p>
          {trend && (
            <p className="text-sm mt-1 text-text-secondary">{trend}</p>
          )}
          {severity && (
            <p className={cn("text-xs mt-1 font-medium", severityColors[severity])}>
              {severity.toUpperCase()} SEVERITY
            </p>
          )}
        </div>
        <div className={cn("p-3 rounded-full", colorClasses[color])}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
}

// Hourly Heatmap Component
const HourlyBehaviorHeatmap = ({ temporalData }: { temporalData: any }) => {
  if (!temporalData?.temporal_patterns?.hourly) return <div>Loading...</div>

  const hourlyData = temporalData.temporal_patterns.hourly
  const maxCount = Math.max(...hourlyData.map((h: any) => h.count))

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-card-title">Hourly Behavior Patterns</h3>
        <Clock className="w-5 h-5 text-nav-icon" />
      </div>
      <div className="grid grid-cols-12 gap-1">
        {hourlyData.map((hour: any) => {
          const intensity = maxCount > 0 ? hour.count / maxCount : 0
          const opacityClass = intensity > 0.8 ? 'opacity-100' : 
                              intensity > 0.6 ? 'opacity-80' :
                              intensity > 0.4 ? 'opacity-60' :
                              intensity > 0.2 ? 'opacity-40' : 'opacity-20'
          
          return (
            <div
              key={hour.hour}
              className={cn(
                "aspect-square rounded-sm flex items-center justify-center text-xs font-medium text-white bg-red-500",
                opacityClass
              )}
              title={`${hour.hour}:00 - ${hour.count} behaviors (${hour.percentage}%)`}
            >
              {hour.hour}
            </div>
          )
        })}
      </div>
      <div className="flex justify-between items-center mt-4 text-xs text-text-secondary">
        <span>12 AM</span>
        <span>Peak behavior times highlighted</span>
        <span>11 PM</span>
      </div>
    </div>
  )
}

// Weekly Patterns Chart
const WeeklyPatternsChart = ({ temporalData }: { temporalData: any }) => {
  if (!temporalData?.temporal_patterns?.daily) return <div>Loading...</div>

  const dailyData = temporalData.temporal_patterns.daily
  
  const chartData = {
    labels: dailyData.map((d: any) => d.day_name),
    datasets: [{
      label: 'Behavior Count',
      data: dailyData.map((d: any) => d.count),
      backgroundColor: dailyData.map((d: any) => {
        if (d.count > 5) return '#EF4444' // High
        if (d.count > 2) return '#F59E0B' // Medium  
        return '#10B981' // Low
      }),
      borderWidth: 0,
      borderRadius: 4,
    }]
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-card-title">Weekly Behavior Patterns</h3>
        <CalendarIcon className="w-5 h-5 text-nav-icon" />
      </div>
      <div className="h-64">
        <Bar data={chartData} options={{
          ...chartOptions,
          plugins: {
            ...chartOptions.plugins,
            legend: { display: false }
          }
        }} />
      </div>
    </div>
  )
}

// Trigger Analysis Component
const TriggerAnalysisSection = ({ triggerData }: { triggerData: any }) => {
  if (!triggerData) return <div>Loading trigger analysis...</div>

  // Activity triggers chart
  const activityTriggersData = {
    labels: triggerData.activity_triggers?.slice(0, 8).map((t: any) => t.related_activity__name) || [],
    datasets: [{
      label: 'Incidents',
      data: triggerData.activity_triggers?.slice(0, 8).map((t: any) => t.count) || [],
      backgroundColor: '#FF6B6B',
      borderColor: '#E53E3E',
      borderWidth: 2,
    }]
  }

  // Location triggers
  const locationData = {
    labels: triggerData.location_triggers?.map((l: any) => l.location) || [],
    datasets: [{
      data: triggerData.location_triggers?.map((l: any) => l.count) || [],
      backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'],
      borderWidth: 0,
    }]
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-card-title">Activity Triggers</h3>
            <Activity className="w-5 h-5 text-nav-icon" />
          </div>
          <div className="h-64">
            <Bar data={activityTriggersData} options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                legend: { display: false }
              },
              indexAxis: 'y' as const,
            }} />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-card-title">Location Patterns</h3>
            <Target className="w-5 h-5 text-nav-icon" />
          </div>
          <div className="h-64">
            <Doughnut data={locationData} options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                legend: {
                  ...chartOptions.plugins.legend,
                  position: 'bottom' as const,
                }
              },
              cutout: '60%'
            }} />
          </div>
        </div>
      </div>

      {/* Identified Triggers List */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-card-title">Most Common Triggers</h3>
          <Zap className="w-5 h-5 text-nav-icon" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {triggerData.identified_triggers?.slice(0, 9).map(([trigger, count]: [string, number], index: number) => (
            <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-red-800">{trigger}</span>
                <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                  {count}x
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Intervention Effectiveness Component
const InterventionEffectivenessSection = ({ interventionData }: { interventionData: any }) => {
  if (!interventionData) return <div>Loading intervention analysis...</div>

  const interventionTypesData = {
    labels: interventionData.intervention_types?.map((i: any) => i.intervention_used) || [],
    datasets: [{
      label: 'Success Rate (%)',
      data: interventionData.intervention_types?.map((i: any) => (i.success_rate * 100).toFixed(1)) || [],
      backgroundColor: interventionData.intervention_types?.map((i: any) => 
        i.success_rate > 0.8 ? '#10B981' : 
        i.success_rate > 0.6 ? '#F59E0B' : '#EF4444'
      ) || [],
      borderWidth: 0,
      borderRadius: 4,
    }]
  }

  const workerSuccessData = {
    labels: interventionData.worker_success_rates?.map((w: any) => 
      `${w.user__first_name} ${w.user__last_name}`
    ) || [],
    datasets: [{
      label: 'Success Rate (%)',
      data: interventionData.worker_success_rates?.map((w: any) => (w.success_rate * 100).toFixed(1)) || [],
      backgroundColor: '#4ECDC4',
      borderColor: '#3DB9B2',
      borderWidth: 2,
      borderRadius: 4,
    }]
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-card-title">Intervention Success Rates</h3>
            <Shield className="w-5 h-5 text-nav-icon" />
          </div>
          <div className="h-64">
            <Bar data={interventionTypesData} options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                legend: { display: false }
              },
              scales: {
                ...chartOptions.scales,
                y: {
                  ...chartOptions.scales.y,
                  beginAtZero: true,
                  max: 100,
                  ticks: {
                    ...chartOptions.scales.y.ticks,
                    callback: function(value) {
                      return value + '%'
                    }
                  }
                }
              }
            }} />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-card-title">Worker Effectiveness</h3>
            <UserCheck className="w-5 h-5 text-nav-icon" />
          </div>
          <div className="h-64">
            <Bar data={workerSuccessData} options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                legend: { display: false }
              },
              scales: {
                ...chartOptions.scales,
                y: {
                  ...chartOptions.scales.y,
                  beginAtZero: true,
                  max: 100,
                  ticks: {
                    ...chartOptions.scales.y.ticks,
                    callback: function(value) {
                      return value + '%'
                    }
                  }
                }
              }
            }} />
          </div>
        </div>
      </div>

      {/* Best Practices */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-card-title">Best Practices</h3>
          <Lightbulb className="w-5 h-5 text-nav-icon" />
        </div>
        <div className="space-y-3">
          {interventionData.best_practices?.slice(0, 5).map((practice: any, index: number) => (
            <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-800">{practice.intervention_used}</h4>
                  <p className="text-sm text-green-700 mt-1">{practice.intervention_notes}</p>
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full mt-2 inline-block">
                    Used {practice.usage_count} times successfully
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Goals & Activities Performance Component
const GoalsActivitiesSection = ({ goalData, activityData, masteryData }: { 
  goalData: any, 
  activityData: any, 
  masteryData: any 
}) => {
  if (!goalData || !activityData) return <div>Loading goals & activities analysis...</div>

  const goalProgressData = {
    labels: goalData.successful_goals?.map((g: any) => g.name) || [],
    datasets: [{
      label: 'Progress %',
      data: goalData.successful_goals?.map((g: any) => g.progress_percentage) || [],
      backgroundColor: '#10B981',
      borderColor: '#059669',
      borderWidth: 2,
      borderRadius: 4,
    }]
  }

  const categoryPerformanceData = {
    labels: activityData.category_performance?.map((c: any) => c.activity__category) || [],
    datasets: [{
      label: 'Completion Rate %',
      data: activityData.category_performance?.map((c: any) => (c.completion_rate * 100).toFixed(1)) || [],
      backgroundColor: '#4F46E5',
      borderColor: '#4338CA',
      borderWidth: 2,
      borderRadius: 4,
    }]
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-card-title">Goal Progress</h3>
            <Target className="w-5 h-5 text-nav-icon" />
          </div>
          <div className="h-64">
            <Bar data={goalProgressData} options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                legend: { display: false }
              },
              scales: {
                ...chartOptions.scales,
                y: {
                  ...chartOptions.scales.y,
                  beginAtZero: true,
                  max: 100,
                  ticks: {
                    ...chartOptions.scales.y.ticks,
                    callback: function(value) {
                      return value + '%'
                    }
                  }
                }
              }
            }} />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-card-title">Activity Category Performance</h3>
            <Activity className="w-5 h-5 text-nav-icon" />
          </div>
          <div className="h-64">
            <Bar data={categoryPerformanceData} options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                legend: { display: false }
              },
              scales: {
                ...chartOptions.scales,
                y: {
                  ...chartOptions.scales.y,
                  beginAtZero: true,
                  max: 100,
                  ticks: {
                    ...chartOptions.scales.y.ticks,
                    callback: function(value) {
                      return value + '%'
                    }
                  }
                }
              }
            }} />
          </div>
        </div>
      </div>

      {/* Mastery Tracking */}
      {masteryData && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-card-title">Skill Mastery Progress</h3>
            <Trophy className="w-5 h-5 text-nav-icon" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {masteryData.mastery_analysis?.slice(0, 6).map((skill: any, index: number) => (
              <div key={index} className={cn(
                "border rounded-lg p-4",
                skill.mastery_level === 'advanced' 
                  ? "bg-green-50 border-green-200" 
                  : "bg-blue-50 border-blue-200"
              )}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">{skill.activity_name}</h4>
                  <span className={cn(
                    "text-xs px-2 py-1 rounded-full font-medium",
                    skill.mastery_level === 'advanced'
                      ? "bg-green-100 text-green-700"
                      : "bg-blue-100 text-blue-700"
                  )}>
                    {skill.mastery_level}
                  </span>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>Completions: {skill.total_completions}</div>
                  {skill.difficulty_improvement > 0 && (
                    <div className="text-green-600">
                      Difficulty ↓ {skill.difficulty_improvement.toFixed(1)}
                    </div>
                  )}
                  {skill.satisfaction_improvement > 0 && (
                    <div className="text-blue-600">
                      Satisfaction ↑ {skill.satisfaction_improvement.toFixed(1)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Main Analytics Page
export default function TavongaAnalyticsPage() {
  const [dateRange, setDateRange] = useState('30')
  const [selectedWorker, setSelectedWorker] = useState('all')
  const [activeTab, setActiveTab] = useState('overview')

  // Data hooks
  const { temporalPatterns, isLoading: temporalLoading } = useTavongaBehaviorAnalytics({
    days: dateRange,
    worker: selectedWorker === 'all' ? undefined : selectedWorker
  })
  
  const { triggerAnalysis, isLoading: triggerLoading } = useTriggerAnalysis({
    days: dateRange,
    worker: selectedWorker === 'all' ? undefined : selectedWorker
  })
  
  const { interventionAnalysis, isLoading: interventionLoading } = useInterventionAnalysis({
    days: dateRange,
    worker: selectedWorker === 'all' ? undefined : selectedWorker
  })
  
  const { workerAnalysis, isLoading: workerLoading } = useWorkerAnalysis({
    days: dateRange
  })
  
  const { predictiveIndicators, isLoading: predictiveLoading } = usePredictiveIndicators({
    days: dateRange
  })
  
  const { goalAnalytics, isLoading: goalLoading } = useGoalAnalytics()
  const { activityAnalytics, isLoading: activityLoading } = useTavongaActivityAnalytics()
  const { masteryTracking, isLoading: masteryLoading } = useMasteryTracking()

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'temporal', label: 'Time Patterns', icon: Clock },
    { id: 'triggers', label: 'Triggers', icon: Zap },
    { id: 'interventions', label: 'Interventions', icon: Shield },
    { id: 'workers', label: 'Support Workers', icon: Users },
    { id: 'goals', label: 'Goals & Activities', icon: Target },
    { id: 'predictive', label: 'Insights', icon: Lightbulb },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Breadcrumbs */}
        <Breadcrumbs items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Tavonga Analytics' }
        ]} />

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              Tavonga's Behavioral Analytics
            </h1>
            <p className="text-text-secondary">
              Comprehensive insights into behavior patterns, triggers, and interventions
            </p>
          </div>
          <div className="flex items-center gap-4">
            <select 
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="input-field w-32"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
            <select 
              value={selectedWorker}
              onChange={(e) => setSelectedWorker(e.target.value)}
              className="input-field w-40"
            >
              <option value="all">All Workers</option>
              <option value="1">Sarah Johnson</option>
              <option value="2">Michael Chen</option>
              <option value="3">Emma Davis</option>
            </select>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-border-default">
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap",
                  activeTab === tab.id
                    ? "border-brand-primary text-brand-primary"
                    : "border-transparent text-text-secondary hover:text-text-primary hover:border-border-default"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <BehaviorStatsCard
                title="Total Behaviors"
                value={temporalPatterns?.duration_stats?.total_behaviors || 0}
                icon={Brain}
                trend="Last 30 days"
                color="red"
              />
              <BehaviorStatsCard
                title="Avg Duration"
                value={`${temporalPatterns?.duration_stats?.avg_duration?.toFixed(1) || 0} min`}
                icon={Clock}
                trend="Per incident"
                color="orange"
              />
              <BehaviorStatsCard
                title="Success Rate"
                value={`${interventionAnalysis?.overall_success_rate || 0}%`}
                icon={Shield}
                trend="Interventions"
                color="green"
              />
              <BehaviorStatsCard
                title="Goal Progress"
                value={`${goalAnalytics?.completion_rate || 0}%`}
                icon={Target}
                trend="Overall completion"
                color="blue"
              />
            </div>

            {/* Quick Insights Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <HourlyBehaviorHeatmap temporalData={temporalPatterns} />
              <WeeklyPatternsChart temporalData={temporalPatterns} />
            </div>
          </div>
        )}

        {/* Temporal Patterns Tab */}
        {activeTab === 'temporal' && (
          <div className="space-y-6">
            <HourlyBehaviorHeatmap temporalData={temporalPatterns} />
            <WeeklyPatternsChart temporalData={temporalPatterns} />
          </div>
        )}

        {/* Triggers Tab */}
        {activeTab === 'triggers' && (
          <TriggerAnalysisSection triggerData={triggerAnalysis} />
        )}

        {/* Interventions Tab */}
        {activeTab === 'interventions' && (
          <InterventionEffectivenessSection interventionData={interventionAnalysis} />
        )}

        {/* Workers Tab */}
        {activeTab === 'workers' && (
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-card-title">Support Worker Analysis</h3>
              <Users className="w-5 h-5 text-nav-icon" />
            </div>
            {workerLoading ? (
              <p className="text-text-secondary">Loading worker analysis...</p>
            ) : (
              <div className="space-y-4">
                {workerAnalysis?.worker_performance?.map((worker: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">
                        {worker.user__first_name} {worker.user__last_name}
                      </h4>
                      <div className="flex gap-4 text-sm">
                        <span>Incidents: {worker.total_incidents}</span>
                        <span>Success Rate: {(worker.intervention_success_rate * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Goals & Activities Tab */}
        {activeTab === 'goals' && (
          <GoalsActivitiesSection 
            goalData={goalAnalytics} 
            activityData={activityAnalytics} 
            masteryData={masteryTracking}
          />
        )}

        {/* Predictive Insights Tab */}
        {activeTab === 'predictive' && (
          <div className="space-y-6">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-card-title">Early Warning Signs</h3>
                <AlertTriangle className="w-5 h-5 text-nav-icon" />
              </div>
              {predictiveLoading ? (
                <p className="text-text-secondary">Loading predictive analysis...</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {predictiveIndicators?.warning_signs?.slice(0, 8).map(([sign, data]: [string, any], index: number) => (
                    <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-yellow-800">{sign}</span>
                        <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full">
                          {data.escalation_rate.toFixed(1)}% escalation
                        </span>
                      </div>
                      <div className="text-sm text-yellow-700">
                        {data.total_occurrences} occurrences, {data.escalated_occurrences} escalated
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
} 