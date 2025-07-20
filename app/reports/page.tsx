'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import { 
  FileText, 
  Download, 
  Filter,
  Search,
  Calendar,
  Users,
  Activity,
  AlertTriangle,
  Clock,
  BarChart3,
  TrendingUp,
  FileSpreadsheet,
  Loader2,
  CheckCircle,
  XCircle,
  Target
} from 'lucide-react'
import { Bar } from 'react-chartjs-2'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils'
import { chartOptions } from '@/lib/charts'
import { useBehaviors, useActivities, useShifts, useGoals, useUsers } from '@/lib/hooks'
import { apiClient } from '@/lib/api'
import toast from 'react-hot-toast'

// Monthly report generation data
const MonthlyReportChart = ({ behaviors, activities, shifts }: { 
  behaviors: any[]
  activities: any[]
  shifts: any[]
}) => {
  // Group data by month for the last 6 months
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    return date.toISOString().slice(0, 7) // YYYY-MM format
  }).reverse()

  const behaviorCounts = last6Months.map(month => 
    behaviors.filter(behavior => behavior.date?.startsWith(month)).length
  )

  const activityCounts = last6Months.map(month => 
    activities.filter(activity => activity.date?.startsWith(month)).length
  )

  const shiftCounts = last6Months.map(month => 
    shifts.filter(shift => shift.date?.startsWith(month)).length
  )

  const monthlyReportData = {
    labels: last6Months.map(month => new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })),
    datasets: [
      {
        label: 'Behavior Reports',
        data: behaviorCounts,
        backgroundColor: '#FF6B6B',
        borderColor: '#FF5252',
        borderWidth: 2,
        borderRadius: 4,
      },
      {
        label: 'Activity Reports',
        data: activityCounts,
        backgroundColor: '#4ECDC4',
        borderColor: '#3DB9B2',
        borderWidth: 2,
        borderRadius: 4,
      },
      {
        label: 'Shift Reports',
        data: shiftCounts,
        backgroundColor: '#45B7D1',
        borderColor: '#3A9BC7',
        borderWidth: 2,
        borderRadius: 4,
      },
    ],
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-card-title">Monthly Report Generation</h3>
        <BarChart3 className="w-5 h-5 text-nav-icon" />
      </div>
      <div className="h-64">
        <Bar 
          data={monthlyReportData} 
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

const ReportCard = ({ 
  title, 
  description, 
  icon: Icon, 
  count, 
  trend, 
  onGenerate,
  isLoading = false
}: {
  title: string
  description: string
  icon: any
  count: number
  trend?: string
  onGenerate: () => void
  isLoading?: boolean
}) => (
  <div className="card p-6">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-btn-primary rounded-lg flex items-center justify-center">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-card-title">{title}</h3>
          <p className="text-sm text-card-subtext">{description}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-2xl font-bold text-card-title">{count}</p>
        {trend && (
          <p className="text-sm text-text-positive">{trend}</p>
        )}
      </div>
    </div>
    
    <div className="flex items-center gap-2">
      <button 
        onClick={onGenerate}
        disabled={isLoading}
        className="btn-primary flex items-center gap-2 flex-1"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FileSpreadsheet className="w-4 h-4" />
        )}
        {isLoading ? 'Generating...' : 'Export CSV'}
      </button>
      <button 
        onClick={onGenerate}
        disabled={isLoading}
        className="btn-secondary flex items-center gap-2"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FileText className="w-4 h-4" />
        )}
        PDF
      </button>
    </div>
  </div>
)

const FilterPanel = ({ 
  dateRange, 
  setDateRange, 
  selectedCarer, 
  setSelectedCarer, 
  selectedType, 
  setSelectedType,
  users
}: {
  dateRange: string
  setDateRange: (value: string) => void
  selectedCarer: string
  setSelectedCarer: (value: string) => void
  selectedType: string
  setSelectedType: (value: string) => void
  users: any[]
}) => {
  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-card-title mb-4">Report Filters</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Date Range
          </label>
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="input-field"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="custom">Custom range</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Carer
          </label>
          <select 
            value={selectedCarer}
            onChange={(e) => setSelectedCarer(e.target.value)}
            className="input-field"
          >
            <option value="all">All Carers</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>{user.full_name}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Report Type
          </label>
          <select 
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="input-field"
          >
            <option value="all">All Types</option>
            <option value="behavior">Behavior Reports</option>
            <option value="activity">Activity Reports</option>
            <option value="shift">Shift Reports</option>
            <option value="goal">Goal Reports</option>
          </select>
        </div>
      </div>
      
      <div className="flex items-center gap-4 mt-6">
        <button className="btn-primary flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Apply Filters
        </button>
        <button className="btn-secondary">
          Reset
        </button>
      </div>
    </div>
  )
}

const RecentReports = () => (
  <div className="card p-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-card-title">Recent Reports</h3>
      <button className="btn-secondary flex items-center gap-2">
        <Download className="w-4 h-4" />
        Download All
      </button>
    </div>
    
    <div className="space-y-3">
      {[
        { name: 'Behavior Report - Jan 2024', type: 'CSV', date: '2024-01-20', size: '2.3 MB' },
        { name: 'Activity Completion Report', type: 'PDF', date: '2024-01-19', size: '1.8 MB' },
        { name: 'Shift Attendance Report', type: 'CSV', date: '2024-01-18', size: '3.1 MB' },
        { name: 'Goal Progress Report', type: 'PDF', date: '2024-01-17', size: '2.7 MB' }
      ].map((report, index) => (
        <div key={index} className="flex items-center justify-between p-3 bg-bg-highlight rounded-lg">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              report.type === 'CSV' ? "bg-green-100" : "bg-red-100"
            )}>
              {report.type === 'CSV' ? (
                <FileSpreadsheet className="w-4 h-4 text-green-800" />
              ) : (
                <FileText className="w-4 h-4 text-red-800" />
              )}
            </div>
            <div>
              <p className="font-medium text-card-title">{report.name}</p>
              <p className="text-sm text-card-subtext">
                {formatDate(report.date)} • {report.size}
              </p>
            </div>
          </div>
          <button className="p-2 text-nav-icon hover:bg-bg-primary rounded-lg transition-colors">
            <Download className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  </div>
)

const QuickStats = ({ behaviors, activities, shifts, goals }: {
  behaviors: any[]
  activities: any[]
  shifts: any[]
  goals: any[]
}) => {
  const getThisMonthCount = (data: any[]) => {
    const now = new Date()
    const thisMonth = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0')
    return data.filter(item => item.date?.startsWith(thisMonth) || item.created_at?.startsWith(thisMonth)).length
  }

  const getCompletedActivities = () => {
    return activities.filter(activity => activity.completed).length
  }

  const getCompletedShifts = () => {
    return shifts.filter(shift => shift.status === 'completed').length
  }

  const getActiveGoals = () => {
    return goals.filter(goal => goal.status === 'active').length
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-card-subtext">Total Behaviors</p>
            <p className="text-2xl font-bold text-card-title">{behaviors.length}</p>
          </div>
          <div className="w-12 h-12 bg-btn-primary rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
      
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-card-subtext">Completed Activities</p>
            <p className="text-2xl font-bold text-card-title">{getCompletedActivities()}</p>
          </div>
          <div className="w-12 h-12 bg-text-positive/10 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-text-positive" />
          </div>
        </div>
      </div>
      
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-card-subtext">Completed Shifts</p>
            <p className="text-2xl font-bold text-card-title">{getCompletedShifts()}</p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <Clock className="w-6 h-6 text-green-800" />
          </div>
        </div>
      </div>
      
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-card-subtext">Active Goals</p>
            <p className="text-2xl font-bold text-card-title">{getActiveGoals()}</p>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Target className="w-6 h-6 text-blue-800" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ReportsPage() {
  const { behaviors } = useBehaviors()
  const { activities } = useActivities()
  const { shifts } = useShifts()
  const { goals } = useGoals()
  const { users } = useUsers()

  const [dateRange, setDateRange] = useState('7d')
  const [selectedCarer, setSelectedCarer] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [isGenerating, setIsGenerating] = useState<string | null>(null)

  const handleGenerateReport = async (type: string, format: 'csv' | 'pdf' = 'csv') => {
    setIsGenerating(`${type}-${format}`)
    
    try {
      // Build parameters based on filters
      const params: Record<string, any> = {
        format: format
      }

      // Add date range
      if (dateRange !== 'all') {
        const now = new Date()
        let startDate = new Date()
        
        switch (dateRange) {
          case '7d':
            startDate.setDate(now.getDate() - 7)
            break
          case '30d':
            startDate.setDate(now.getDate() - 30)
            break
          case '90d':
            startDate.setDate(now.getDate() - 90)
            break
        }
        
        params.start = startDate.toISOString().split('T')[0]
        params.end = now.toISOString().split('T')[0]
      }

      // Add carer filter
      if (selectedCarer !== 'all') {
        params.user = selectedCarer
        params.carer = selectedCarer
      }

      let blob: Blob
      let filename: string

      switch (type) {
        case 'behavior':
          blob = await apiClient.generateBehaviorReport(params)
          filename = `behavior_report_${new Date().toISOString().split('T')[0]}.${format}`
          break
        case 'activity':
          blob = await apiClient.generateActivityReport(params)
          filename = `activity_report_${new Date().toISOString().split('T')[0]}.${format}`
          break
        case 'shift':
          blob = await apiClient.generateShiftReport(params)
          filename = `shift_report_${new Date().toISOString().split('T')[0]}.${format}`
          break
        case 'goal':
          blob = await apiClient.generateGoalReport(params)
          filename = `goal_report_${new Date().toISOString().split('T')[0]}.${format}`
          break
        case 'carer':
        case 'comprehensive':
          // These report types are not yet implemented in the backend
          toast.error(`${type.charAt(0).toUpperCase() + type.slice(1)} reports are coming soon!`)
          return
        default:
          throw new Error('Invalid report type')
      }

      // Download the file
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} report downloaded successfully!`)
    } catch (error: any) {
      console.error('Error generating report:', error)
      toast.error(error.message || 'Failed to generate report')
    } finally {
      setIsGenerating(null)
    }
  }

  const getReportCount = (type: string) => {
    switch (type) {
      case 'behavior':
        return behaviors.length
      case 'activity':
        return activities.length
      case 'shift':
        return shifts.length
      case 'goal':
        return goals.length
      default:
        return 0
    }
  }

  const getTrend = (type: string) => {
    const now = new Date()
    const weekAgo = new Date()
    weekAgo.setDate(now.getDate() - 7)
    
    let recentCount = 0
    let totalCount = 0
    
    switch (type) {
      case 'behavior':
        recentCount = behaviors.filter((b: any) => new Date(b.date) >= weekAgo).length
        totalCount = behaviors.length
        break
      case 'activity':
        recentCount = activities.filter((a: any) => new Date(a.date) >= weekAgo).length
        totalCount = activities.length
        break
      case 'shift':
        recentCount = shifts.filter((s: any) => new Date(s.date) >= weekAgo).length
        totalCount = shifts.length
        break
      case 'goal':
        recentCount = goals.filter((g: any) => new Date(g.created_at) >= weekAgo).length
        totalCount = goals.length
        break
    }
    
    if (totalCount === 0) return undefined
    const percentage = Math.round((recentCount / totalCount) * 100)
    return `+${recentCount} this week (${percentage}%)`
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Breadcrumbs */}
        <Breadcrumbs items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Reports' }
        ]} />

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              Reports & Analytics
            </h1>
            <p className="text-text-secondary">
              Generate and export comprehensive reports for care management
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button className="btn-secondary flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              View Analytics
            </button>
            <button className="btn-primary flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Generate Report
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <QuickStats behaviors={behaviors} activities={activities} shifts={shifts} goals={goals} />

        {/* Filter Panel */}
        <FilterPanel 
          dateRange={dateRange}
          setDateRange={setDateRange}
          selectedCarer={selectedCarer}
          setSelectedCarer={setSelectedCarer}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          users={users}
        />

        {/* Report Types */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ReportCard
            title="Behavior Reports"
            description="Track behavior patterns and interventions"
            icon={AlertTriangle}
            count={getReportCount('behavior')}
            trend={getTrend('behavior')}
            onGenerate={() => handleGenerateReport('behavior')}
            isLoading={isGenerating === 'behavior-csv'}
          />
          
          <ReportCard
            title="Activity Reports"
            description="Monitor activity completion and progress"
            icon={Activity}
            count={getReportCount('activity')}
            trend={getTrend('activity')}
            onGenerate={() => handleGenerateReport('activity')}
            isLoading={isGenerating === 'activity-csv'}
          />
          
          <ReportCard
            title="Shift Reports"
            description="Track carer attendance and performance"
            icon={Clock}
            count={getReportCount('shift')}
            trend={getTrend('shift')}
            onGenerate={() => handleGenerateReport('shift')}
            isLoading={isGenerating === 'shift-csv'}
          />
          
          <ReportCard
            title="Goal Reports"
            description="Track goal achievement and milestones"
            icon={Target}
            count={getReportCount('goal')}
            trend={getTrend('goal')}
            onGenerate={() => handleGenerateReport('goal')}
            isLoading={isGenerating === 'goal-csv'}
          />
          
          <ReportCard
            title="Carer Reports"
            description="Evaluate carer performance and engagement"
            icon={Users}
            count={users.length}
            trend={`${users.filter((u: any) => u.is_active_carer).length} active`}
            onGenerate={() => handleGenerateReport('carer')}
            isLoading={isGenerating === 'carer-csv'}
          />
          
          <ReportCard
            title="Comprehensive Report"
            description="Complete overview of all metrics"
            icon={BarChart3}
            count={1}
            onGenerate={() => handleGenerateReport('comprehensive')}
            isLoading={isGenerating === 'comprehensive-csv'}
          />
        </div>

        {/* Recent Reports */}
        <RecentReports />

        {/* Monthly Report Chart */}
        <MonthlyReportChart behaviors={behaviors} activities={activities} shifts={shifts} />
      </div>
    </DashboardLayout>
  )
} 