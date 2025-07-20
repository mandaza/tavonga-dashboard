'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import { 
  Target, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  Calendar,
  TrendingUp,
  Activity,
  MoreVertical,
  CheckCircle,
  Clock,
  AlertCircle,
  BarChart3,
  Loader2,
  Users,
  Flag
} from 'lucide-react'
import { Bar } from 'react-chartjs-2'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils'
import { chartOptions } from '@/lib/charts'
import { useGoals } from '@/lib/hooks'
import { apiClient } from '@/lib/api'
import { Goal as GoalType } from '@/types'
import toast from 'react-hot-toast'
import AddGoalModal from '@/components/AddGoalModal'
import EditGoalModal from '@/components/EditGoalModal'
import DeleteGoalModal from '@/components/DeleteGoalModal'

const GoalProgressChart = ({ goals }: { goals: GoalType[] }) => {
  const goalProgressData = {
    labels: goals.map(goal => goal.name.substring(0, 15) + '...'),
    datasets: [
      {
        label: 'Progress (%)',
        data: goals.map(goal => goal.calculated_progress),
        backgroundColor: goals.map(goal => 
          goal.calculated_progress >= 80 ? '#4ECDC4' : 
          goal.calculated_progress >= 50 ? '#FFA726' : '#FF6B6B'
        ),
        borderColor: goals.map(goal => 
          goal.calculated_progress >= 80 ? '#3DB9B2' : 
          goal.calculated_progress >= 50 ? '#FF9800' : '#FF5252'
        ),
        borderWidth: 2,
        borderRadius: 4,
      },
    ],
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-card-title">Goal Progress Overview</h3>
        <BarChart3 className="w-5 h-5 text-nav-icon" />
      </div>
      <div className="h-64">
        <Bar 
          data={goalProgressData} 
          options={{
            ...chartOptions,
            plugins: {
              ...chartOptions.plugins,
              legend: {
                display: false,
              },
            },
            scales: {
              x: {
                ...chartOptions.scales.x,
                grid: {
                  display: false,
                },
                ticks: {
                  ...chartOptions.scales.x.ticks,
                  maxRotation: 45,
                  minRotation: 45,
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

const GoalCard = ({ goal, onEdit, onDelete }: { 
  goal: GoalType
  onEdit: (goal: GoalType) => void
  onDelete: (goalId: string) => void
}) => {
  const [showActions, setShowActions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-text-positive/10 text-text-positive'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-text-danger/10 text-text-danger'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-text-positive'
    if (progress >= 50) return 'bg-yellow-500'
    return 'bg-text-danger'
  }

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      await onDelete(goal.id)
      setShowActions(false)
    } catch (error) {
      console.error('Error deleting goal:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-card-title">{goal.name}</h3>
            {goal.is_overdue && (
              <AlertCircle className="w-4 h-4 text-red-500" />
            )}
          </div>
          <p className="text-sm text-card-subtext mb-3">{goal.description}</p>
          
          <div className="space-y-2">
            {goal.category && (
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-nav-icon" />
                <span className="text-sm text-card-subtext">{goal.category}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-nav-icon" />
              <span className="text-sm text-card-subtext">
                Target: {goal.target_date ? formatDate(goal.target_date) : 'No target date'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-nav-icon" />
              <span className="text-sm text-card-subtext">
                {goal.total_activities_count} activity{goal.total_activities_count !== 1 ? 's' : ''} linked
                {goal.completed_activities_count > 0 && (
                  <span className="text-text-positive"> ({goal.completed_activities_count} completed)</span>
                )}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-nav-icon" />
              <span className="text-sm text-card-subtext">
                {goal.assigned_carers.length} carer{goal.assigned_carers.length !== 1 ? 's' : ''} assigned
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getStatusColor(goal.status))}>
            {goal.status}
          </span>
          <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getPriorityColor(goal.priority))}>
            {goal.priority}
          </span>
          
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 rounded-lg hover:bg-bg-highlight transition-colors"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <MoreVertical className="w-4 h-4 text-nav-icon" />
              )}
            </button>
            
            {showActions && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-bg-primary border border-border-default rounded-lg shadow-card z-50">
                <div className="py-2">
                  <button 
                    onClick={() => onEdit(goal)}
                    className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-bg-highlight transition-colors"
                  >
                    <Edit className="w-4 h-4 text-nav-icon" />
                    <span className="text-sm text-text-primary">Edit Goal</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-bg-highlight transition-colors">
                    <Activity className="w-4 h-4 text-nav-icon" />
                    <span className="text-sm text-text-primary">Link Activities</span>
                  </button>
                  <button 
                    onClick={handleDelete}
                    disabled={isLoading}
                    className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-bg-highlight transition-colors text-text-danger"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    <span className="text-sm">Delete</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-card-subtext">Progress</span>
          <span className="text-sm font-medium text-card-title">{goal.calculated_progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={cn("h-2 rounded-full transition-all duration-300", getProgressColor(goal.calculated_progress))}
            style={{ width: `${goal.calculated_progress}%` }}
          ></div>
        </div>
        {goal.progress_percentage !== goal.calculated_progress && (
          <p className="text-xs text-card-subtext mt-1">
            Manual progress: {goal.progress_percentage}% | Calculated: {goal.calculated_progress}%
          </p>
        )}
      </div>
      
      {goal.all_activities.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border-default">
          <p className="text-xs text-card-subtext mb-2">Linked Activities:</p>
          <div className="flex flex-wrap gap-1">
            {goal.all_activities.slice(0, 3).map((activity) => (
              <span
                key={activity.id}
                className="px-2 py-1 bg-btn-primary/10 text-btn-primary rounded-full text-xs"
              >
                {activity.name}
              </span>
            ))}
            {goal.all_activities.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                +{goal.all_activities.length - 3}
              </span>
            )}
          </div>
        </div>
      )}

      {goal.notes && (
        <div className="mt-4 pt-4 border-t border-border-default">
          <p className="text-xs text-card-subtext mb-2">Notes:</p>
          <p className="text-sm text-card-subtext">{goal.notes}</p>
        </div>
      )}
    </div>
  )
}

const GoalTable = ({ goals, onEdit, onDelete }: {
  goals: GoalType[]
  onEdit: (goal: GoalType) => void
  onDelete: (goalId: string) => void
}) => (
  <div className="card p-6">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-lg font-semibold text-card-title">All Goals</h3>
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search goals..."
            className="input-field pl-10 w-64"
          />
        </div>
        <select className="input-field w-32">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="paused">Paused</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
    </div>
    
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border-default">
            <th className="text-left py-3 px-4 font-medium text-text-primary">Goal</th>
            <th className="text-left py-3 px-4 font-medium text-text-primary">Status</th>
            <th className="text-left py-3 px-4 font-medium text-text-primary">Priority</th>
            <th className="text-left py-3 px-4 font-medium text-text-primary">Progress</th>
            <th className="text-left py-3 px-4 font-medium text-text-primary">Target Date</th>
            <th className="text-left py-3 px-4 font-medium text-text-primary">Activities</th>
            <th className="text-left py-3 px-4 font-medium text-text-primary">Carers</th>
            <th className="text-left py-3 px-4 font-medium text-text-primary">Created</th>
            <th className="text-left py-3 px-4 font-medium text-text-primary">Actions</th>
          </tr>
        </thead>
        <tbody>
          {goals.map((goal) => (
            <tr key={goal.id} className="border-b border-border-default hover:bg-bg-highlight">
              <td className="py-3 px-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-text-primary font-medium">{goal.name}</p>
                    {goal.is_overdue && (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <p className="text-sm text-text-secondary">{goal.description}</p>
                  {goal.category && (
                    <p className="text-xs text-text-muted">{goal.category}</p>
                  )}
                </div>
              </td>
              <td className="py-3 px-4">
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  goal.status === 'active' && "bg-text-positive/10 text-text-positive",
                  goal.status === 'completed' && "bg-green-100 text-green-800",
                  goal.status === 'paused' && "bg-yellow-100 text-yellow-800",
                  goal.status === 'cancelled' && "bg-text-danger/10 text-text-danger"
                )}>
                  {goal.status}
                </span>
              </td>
              <td className="py-3 px-4">
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  goal.priority === 'urgent' && "bg-red-100 text-red-800",
                  goal.priority === 'high' && "bg-orange-100 text-orange-800",
                  goal.priority === 'medium' && "bg-yellow-100 text-yellow-800",
                  goal.priority === 'low' && "bg-green-100 text-green-800"
                )}>
                  {goal.priority}
                </span>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className={cn(
                        "h-2 rounded-full",
                        goal.calculated_progress >= 80 ? "bg-text-positive" : 
                        goal.calculated_progress >= 50 ? "bg-yellow-500" : "bg-text-danger"
                      )}
                      style={{ width: `${goal.calculated_progress}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-card-subtext">{goal.calculated_progress}%</span>
                </div>
              </td>
              <td className="py-3 px-4 text-text-secondary">
                {goal.target_date ? formatDate(goal.target_date) : '-'}
              </td>
              <td className="py-3 px-4">
                <div className="flex flex-wrap gap-1">
                  <span className="px-2 py-1 bg-btn-primary/10 text-btn-primary rounded-full text-xs">
                    {goal.total_activities_count}
                  </span>
                  {goal.completed_activities_count > 0 && (
                    <span className="px-2 py-1 bg-text-positive/10 text-text-positive rounded-full text-xs">
                      {goal.completed_activities_count} ✓
                    </span>
                  )}
                </div>
              </td>
              <td className="py-3 px-4">
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                  {goal.assigned_carers.length}
                </span>
              </td>
              <td className="py-3 px-4 text-text-secondary">{formatDate(goal.created_at)}</td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => onEdit(goal)}
                    className="p-1 text-nav-icon hover:bg-bg-highlight rounded"
                    title="Edit Goal"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-1 text-nav-icon hover:bg-bg-highlight rounded" title="Link Activities">
                    <Activity className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => onDelete(goal.id)}
                    className="p-1 text-text-danger hover:bg-text-danger/10 rounded"
                    title="Delete Goal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)

export default function GoalsPage() {
  const { goals, isLoading, mutate } = useGoals()
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<GoalType | null>(null)

  // Filter goals based on search and filters
  const filteredGoals = goals.filter((goal: GoalType) => {
    const matchesSearch = goal.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         goal.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         goal.category?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || goal.status === statusFilter
    
    const matchesPriority = priorityFilter === 'all' || goal.priority === priorityFilter
    
    return matchesSearch && matchesStatus && matchesPriority
  })

  const handleEditGoal = (goal: GoalType) => {
    setSelectedGoal(goal)
    setIsEditModalOpen(true)
  }

  const handleDeleteGoal = (goalId: string) => {
    const goal = goals.find((g: GoalType) => g.id === goalId)
    if (goal) {
      setSelectedGoal(goal)
      setIsDeleteModalOpen(true)
    }
  }

  const handleDeleteConfirm = async (goalId: string) => {
    try {
      await apiClient.deleteGoal(goalId)
      toast.success('Goal deleted successfully')
      mutate() // Refresh the data
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete goal')
    }
  }

  const handleModalSuccess = () => {
    mutate() // Refresh the data
  }

  const handleModalClose = () => {
    setSelectedGoal(null)
    setIsAddModalOpen(false)
    setIsEditModalOpen(false)
    setIsDeleteModalOpen(false)
  }

  const getStatusCount = (status: string) => {
    return goals.filter((goal: GoalType) => goal.status === status).length
  }

  const getPriorityCount = (priority: string) => {
    return goals.filter((goal: GoalType) => goal.priority === priority).length
  }

  const getAverageProgress = () => {
    if (goals.length === 0) return 0
    const total = goals.reduce((sum: number, goal: GoalType) => sum + goal.calculated_progress, 0)
    return Math.round(total / goals.length)
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-btn-primary" />
            <p className="text-text-secondary">Loading goals...</p>
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
          { label: 'Goals' }
        ]} />

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              Goal Management
            </h1>
            <p className="text-text-secondary">
              Create, track, and manage care goals and progress
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-bg-highlight rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "px-3 py-1 rounded-md text-sm font-medium transition-colors",
                  viewMode === 'grid' 
                    ? "bg-bg-primary text-text-primary shadow-sm" 
                    : "text-text-secondary hover:text-text-primary"
                )}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={cn(
                  "px-3 py-1 rounded-md text-sm font-medium transition-colors",
                  viewMode === 'table' 
                    ? "bg-bg-primary text-text-primary shadow-sm" 
                    : "text-text-secondary hover:text-text-primary"
                )}
              >
                Table
              </button>
            </div>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Goal
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-card-subtext">Total Goals</p>
                <p className="text-2xl font-bold text-card-title">{goals.length}</p>
              </div>
              <div className="w-12 h-12 bg-btn-primary rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-card-subtext">Active Goals</p>
                <p className="text-2xl font-bold text-card-title">{getStatusCount('active')}</p>
              </div>
              <div className="w-12 h-12 bg-text-positive/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-text-positive" />
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-card-subtext">Completed</p>
                <p className="text-2xl font-bold text-card-title">{getStatusCount('completed')}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-800" />
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-card-subtext">Avg Progress</p>
                <p className="text-2xl font-bold text-card-title">{getAverageProgress()}%</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-800" />
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-card-subtext">High Priority</p>
                <p className="text-2xl font-bold text-card-title">{getPriorityCount('high') + getPriorityCount('urgent')}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Flag className="w-6 h-6 text-orange-800" />
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-card-subtext">Paused</p>
                <p className="text-2xl font-bold text-card-title">{getStatusCount('paused')}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-800" />
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-card-subtext">Overdue</p>
                <p className="text-2xl font-bold text-card-title">
                  {goals.filter((goal: GoalType) => goal.is_overdue).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-800" />
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-card-subtext">Total Activities</p>
                <p className="text-2xl font-bold text-card-title">
                  {goals.reduce((sum: number, goal: GoalType) => sum + goal.total_activities_count, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-purple-800" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search goals by name, description, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field w-40"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="paused">Paused</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select 
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="input-field w-32"
            >
              <option value="all">All Priority</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Goals List */}
        {filteredGoals.length === 0 ? (
          <div className="card p-12 text-center">
            <Target className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-card-title mb-2">No goals found</h3>
            <p className="text-text-secondary">
              {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'No goals have been created yet'
              }
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGoals.map((goal: GoalType) => (
              <GoalCard 
                key={goal.id} 
                goal={goal}
                onEdit={handleEditGoal}
                onDelete={handleDeleteGoal}
              />
            ))}
          </div>
        ) : (
          <GoalTable 
            goals={filteredGoals}
            onEdit={handleEditGoal}
            onDelete={handleDeleteGoal}
          />
        )}

        {goals.length > 0 && <GoalProgressChart goals={goals} />}
      </div>

      {/* Modals */}
      <AddGoalModal
        isOpen={isAddModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
      />
      
      <EditGoalModal
        isOpen={isEditModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        goal={selectedGoal}
      />
      
      <DeleteGoalModal
        isOpen={isDeleteModalOpen}
        onClose={handleModalClose}
        onConfirm={handleDeleteConfirm}
        goal={selectedGoal}
      />
    </DashboardLayout>
  )
} 