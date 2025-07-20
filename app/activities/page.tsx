'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import AddActivityModal from '@/components/AddActivityModal'
import EditActivityModal from '@/components/EditActivityModal'
import DeleteActivityModal from '@/components/DeleteActivityModal'
import { 
  Activity, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  MapPin,
  Clock,
  Target,
  BookOpen,
  MoreVertical,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils'
import { useActivities } from '@/lib/hooks'
import { apiClient } from '@/lib/api'
import { Activity as ActivityType } from '@/types'
import toast from 'react-hot-toast'

const ActivityCard = ({ activity, onEdit, onDelete }: { 
  activity: ActivityType
  onEdit: (activity: ActivityType) => void
  onDelete: (activityId: string) => void
}) => {
  const [showActions, setShowActions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'daily_living':
        return 'bg-green-100 text-green-800'
      case 'social':
        return 'bg-blue-100 text-blue-800'
      case 'educational':
        return 'bg-purple-100 text-purple-800'
      case 'recreational':
        return 'bg-orange-100 text-orange-800'
      case 'therapeutic':
        return 'bg-pink-100 text-pink-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-text-positive/10 text-text-positive'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'hard':
        return 'bg-text-danger/10 text-text-danger'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      await onDelete(activity.id)
      setShowActions(false)
    } catch (error) {
      console.error('Error deleting activity:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-card-title">{activity.name}</h3>
            {!activity.is_active && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                Inactive
              </span>
            )}
          </div>
          <p className="text-sm text-card-subtext mb-3">{activity.description}</p>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-nav-icon" />
              <span className="text-sm text-card-subtext capitalize">
                {activity.category.replace('_', ' ')}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-nav-icon" />
              <span className="text-sm text-card-subtext">
                {activity.estimated_duration || 'Variable'} minutes
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-nav-icon" />
              <span className="text-sm text-card-subtext">
                {activity.all_goals.length} goal{activity.all_goals.length !== 1 ? 's' : ''} linked
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getDifficultyColor(activity.difficulty))}>
                {activity.difficulty}
              </span>
              <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getCategoryColor(activity.category))}>
                {activity.category.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
        
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
                  onClick={() => onEdit(activity)}
                  className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-bg-highlight transition-colors"
                >
                  <Edit className="w-4 h-4 text-nav-icon" />
                  <span className="text-sm text-text-primary">Edit Activity</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-bg-highlight transition-colors">
                  <BookOpen className="w-4 h-4 text-nav-icon" />
                  <span className="text-sm text-text-primary">View Details</span>
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
      
      {activity.all_goals.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border-default">
          <p className="text-xs text-card-subtext mb-2">Linked Goals:</p>
          <div className="flex flex-wrap gap-1">
            {activity.all_goals.map((goal) => (
              <span
                key={goal.id}
                className="px-2 py-1 bg-btn-primary/10 text-btn-primary rounded-full text-xs"
              >
                {goal.name}
              </span>
            ))}
          </div>
        </div>
      )}
      
      <div className="mt-4 pt-4 border-t border-border-default">
        <p className="text-xs text-card-subtext mb-2">Instructions:</p>
        <p className="text-sm text-card-subtext line-clamp-2">{activity.instructions}</p>
      </div>

      {activity.completion_rate > 0 && (
        <div className="mt-4 pt-4 border-t border-border-default">
          <p className="text-xs text-card-subtext mb-2">Completion Rate:</p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-btn-primary h-2 rounded-full" 
              style={{ width: `${activity.completion_rate}%` }}
            ></div>
          </div>
          <p className="text-xs text-card-subtext mt-1">{activity.completion_rate.toFixed(1)}%</p>
        </div>
      )}
    </div>
  )
}

const ActivityTable = ({ activities, onEdit, onDelete }: {
  activities: ActivityType[]
  onEdit: (activity: ActivityType) => void
  onDelete: (activityId: string) => void
}) => (
  <div className="card p-6">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-lg font-semibold text-card-title">All Activities</h3>
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search activities..."
            className="input-field pl-10 w-64"
          />
        </div>
        <select className="input-field w-32">
          <option value="all">All Categories</option>
          <option value="daily_living">Daily Living</option>
          <option value="social">Social</option>
          <option value="educational">Educational</option>
          <option value="recreational">Recreational</option>
          <option value="therapeutic">Therapeutic</option>
          <option value="other">Other</option>
        </select>
      </div>
    </div>
    
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border-default">
            <th className="text-left py-3 px-4 font-medium text-text-primary">Activity</th>
            <th className="text-left py-3 px-4 font-medium text-text-primary">Category</th>
            <th className="text-left py-3 px-4 font-medium text-text-primary">Difficulty</th>
            <th className="text-left py-3 px-4 font-medium text-text-primary">Duration</th>
            <th className="text-left py-3 px-4 font-medium text-text-primary">Goals</th>
            <th className="text-left py-3 px-4 font-medium text-text-primary">Status</th>
            <th className="text-left py-3 px-4 font-medium text-text-primary">Created</th>
            <th className="text-left py-3 px-4 font-medium text-text-primary">Actions</th>
          </tr>
        </thead>
        <tbody>
          {activities.map((activity) => (
            <tr key={activity.id} className="border-b border-border-default hover:bg-bg-highlight">
              <td className="py-3 px-4">
                <div>
                  <p className="text-text-primary font-medium">{activity.name}</p>
                  <p className="text-sm text-text-secondary">{activity.description}</p>
                </div>
              </td>
              <td className="py-3 px-4 text-text-secondary capitalize">
                {activity.category.replace('_', ' ')}
              </td>
              <td className="py-3 px-4">
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  activity.difficulty === 'easy' && "bg-text-positive/10 text-text-positive",
                  activity.difficulty === 'medium' && "bg-yellow-100 text-yellow-800",
                  activity.difficulty === 'hard' && "bg-text-danger/10 text-text-danger"
                )}>
                  {activity.difficulty}
                </span>
              </td>
              <td className="py-3 px-4 text-text-secondary">
                {activity.estimated_duration || 'Variable'} min
              </td>
              <td className="py-3 px-4">
                <div className="flex flex-wrap gap-1">
                  {activity.all_goals.slice(0, 2).map((goal) => (
                    <span
                      key={goal.id}
                      className="px-2 py-1 bg-btn-primary/10 text-btn-primary rounded-full text-xs"
                    >
                      {goal.name}
                    </span>
                  ))}
                  {activity.all_goals.length > 2 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                      +{activity.all_goals.length - 2}
                    </span>
                  )}
                </div>
              </td>
              <td className="py-3 px-4">
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  activity.is_active ? "bg-text-positive/10 text-text-positive" : "bg-gray-100 text-gray-600"
                )}>
                  {activity.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="py-3 px-4 text-text-secondary">{formatDate(activity.created_at)}</td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => onEdit(activity)}
                    className="p-1 text-nav-icon hover:bg-bg-highlight rounded"
                    title="Edit Activity"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-1 text-nav-icon hover:bg-bg-highlight rounded" title="View Details">
                    <BookOpen className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => onDelete(activity.id)}
                    className="p-1 text-text-danger hover:bg-text-danger/10 rounded"
                    title="Delete Activity"
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

export default function ActivitiesPage() {
  const { activities, isLoading, mutate } = useActivities()
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [difficultyFilter, setDifficultyFilter] = useState('all')
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(null)

  // Filter activities based on search and filters
  const filteredActivities = activities.filter((activity: ActivityType) => {
    const matchesSearch = activity.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = categoryFilter === 'all' || activity.category === categoryFilter
    
    const matchesDifficulty = difficultyFilter === 'all' || activity.difficulty === difficultyFilter
    
    return matchesSearch && matchesCategory && matchesDifficulty
  })

  const handleAddActivity = () => {
    setShowAddModal(true)
  }

  const handleEditActivity = (activity: ActivityType) => {
    setSelectedActivity(activity)
    setShowEditModal(true)
  }

  const handleDeleteActivity = (activityId: string) => {
    const activity = activities.find((act: ActivityType) => act.id === activityId)
    if (activity) {
      setSelectedActivity(activity)
      setShowDeleteModal(true)
    }
  }

  const handleModalClose = () => {
    setShowAddModal(false)
    setShowEditModal(false)
    setShowDeleteModal(false)
    setSelectedActivity(null)
  }

  const handleModalSuccess = () => {
    mutate() // Refresh the data
    handleModalClose()
  }

  const getCategoryCount = (category: string) => {
    return activities.filter((activity: ActivityType) => activity.category === category).length
  }

  const getDifficultyCount = (difficulty: string) => {
    return activities.filter((activity: ActivityType) => activity.difficulty === difficulty).length
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-btn-primary" />
            <p className="text-text-secondary">Loading activities...</p>
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
          { label: 'Activities' }
        ]} />

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              Activity Management
            </h1>
            <p className="text-text-secondary">
              Create, edit, and manage activities for care programs
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
              onClick={handleAddActivity}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Activity
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-card-subtext">Total Activities</p>
                <p className="text-2xl font-bold text-card-title">{activities.length}</p>
              </div>
              <div className="w-12 h-12 bg-btn-primary rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-card-subtext">Daily Living</p>
                <p className="text-2xl font-bold text-card-title">
                  {getCategoryCount('daily_living')}
                </p>
              </div>
              <div className="w-12 h-12 bg-text-positive/10 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-text-positive" />
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-card-subtext">Therapeutic</p>
                <p className="text-2xl font-bold text-card-title">
                  {getCategoryCount('therapeutic')}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-800" />
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-card-subtext">Social</p>
                <p className="text-2xl font-bold text-card-title">
                  {getCategoryCount('social')}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-yellow-800" />
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-card-subtext">Easy Activities</p>
                <p className="text-2xl font-bold text-card-title">{getDifficultyCount('easy')}</p>
              </div>
              <div className="w-12 h-12 bg-text-positive/10 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-text-positive" />
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-card-subtext">Medium Activities</p>
                <p className="text-2xl font-bold text-card-title">{getDifficultyCount('medium')}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-yellow-800" />
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-card-subtext">Hard Activities</p>
                <p className="text-2xl font-bold text-card-title">{getDifficultyCount('hard')}</p>
              </div>
              <div className="w-12 h-12 bg-text-danger/10 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-text-danger" />
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
                placeholder="Search activities by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input-field w-40"
            >
              <option value="all">All Categories</option>
              <option value="daily_living">Daily Living</option>
              <option value="social">Social</option>
              <option value="educational">Educational</option>
              <option value="recreational">Recreational</option>
              <option value="therapeutic">Therapeutic</option>
              <option value="other">Other</option>
            </select>
            <select 
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="input-field w-32"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        {/* Activities List */}
        {filteredActivities.length === 0 ? (
          <div className="card p-12 text-center">
            <Activity className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-card-title mb-2">No activities found</h3>
            <p className="text-text-secondary">
              {searchTerm || categoryFilter !== 'all' || difficultyFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'No activities have been created yet'
              }
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredActivities.map((activity: ActivityType) => (
              <ActivityCard 
                key={activity.id} 
                activity={activity}
                onEdit={handleEditActivity}
                onDelete={handleDeleteActivity}
              />
            ))}
          </div>
        ) : (
          <ActivityTable 
            activities={filteredActivities}
            onEdit={handleEditActivity}
            onDelete={handleDeleteActivity}
          />
        )}
      </div>

      {/* Modals */}
      <AddActivityModal
        isOpen={showAddModal}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
      />
      
      <EditActivityModal
        isOpen={showEditModal}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        activity={selectedActivity}
      />
      
      <DeleteActivityModal
        isOpen={showDeleteModal}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        activity={selectedActivity}
      />
    </DashboardLayout>
  )
} 