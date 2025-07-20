'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import { 
  AlertTriangle, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  Activity,
  MoreVertical,
  Eye,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Users,
  Shield,
  Zap
} from 'lucide-react'
import { Bar, Line } from 'react-chartjs-2'
import { cn } from '@/lib/utils'
import { formatDate, formatTime } from '@/lib/utils'
import { chartOptions } from '@/lib/charts'
import { useBehaviors } from '@/lib/hooks'
import { apiClient } from '@/lib/api'
import { Behavior as BehaviorType } from '@/types'
import AddBehaviorModal from '@/components/AddBehaviorModal'
import EditBehaviorModal from '@/components/EditBehaviorModal'
import DeleteBehaviorModal from '@/components/DeleteBehaviorModal'
import toast from 'react-hot-toast'

const BehaviorChart = ({ behaviors }: { behaviors: BehaviorType[] }) => {
  // Group behaviors by date for the last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - i)
    return date.toISOString().split('T')[0]
  }).reverse()

  const behaviorCounts = last7Days.map(date => 
    behaviors.filter(behavior => behavior.date === date).length
  )

  const severityData = {
    labels: last7Days.map(date => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Behaviors',
        data: behaviorCounts,
        backgroundColor: '#FF6B6B',
        borderColor: '#FF5252',
        borderWidth: 2,
        tension: 0.4,
      },
    ],
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-card-title">Behavior Trends (Last 7 Days)</h3>
        <BarChart3 className="w-5 h-5 text-nav-icon" />
      </div>
      <div className="h-64">
        <Line 
          data={severityData} 
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

const SeverityChart = ({ behaviors }: { behaviors: BehaviorType[] }) => {
  const severityCounts = {
    low: behaviors.filter(b => b.severity === 'low').length,
    medium: behaviors.filter(b => b.severity === 'medium').length,
    high: behaviors.filter(b => b.severity === 'high').length,
    critical: behaviors.filter(b => b.severity === 'critical').length,
  }

  const severityData = {
    labels: ['Low', 'Medium', 'High', 'Critical'],
    datasets: [
      {
        label: 'Behaviors by Severity',
        data: [severityCounts.low, severityCounts.medium, severityCounts.high, severityCounts.critical],
        backgroundColor: ['#4ECDC4', '#FFA726', '#FF6B6B', '#D32F2F'],
        borderColor: ['#3DB9B2', '#FF9800', '#FF5252', '#C62828'],
        borderWidth: 2,
        borderRadius: 4,
      },
    ],
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-card-title">Behaviors by Severity</h3>
        <BarChart3 className="w-5 h-5 text-nav-icon" />
      </div>
      <div className="h-64">
        <Bar 
          data={severityData} 
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

const BehaviorCard = ({ behavior, onEdit, onDelete }: { 
  behavior: BehaviorType
  onEdit: (behavior: BehaviorType) => void
  onDelete: (behaviorId: string) => void
}) => {
  const [showActions, setShowActions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
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

  const getBehaviorTypeColor = (type: string) => {
    switch (type) {
      case 'aggression':
        return 'bg-red-50 text-red-700 border-red-200'
      case 'self_injury':
        return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'property_damage':
        return 'bg-orange-50 text-orange-700 border-orange-200'
      case 'elopement':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'non_compliance':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'disruption':
        return 'bg-pink-50 text-pink-700 border-pink-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const getLocationColor = (location: string) => {
    switch (location) {
      case 'home':
        return 'bg-blue-100 text-blue-800'
      case 'school':
        return 'bg-green-100 text-green-800'
      case 'community':
        return 'bg-purple-100 text-purple-800'
      case 'therapy':
        return 'bg-indigo-100 text-indigo-800'
      case 'transport':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      await onDelete(behavior.id)
      setShowActions(false)
    } catch (error) {
      console.error('Error deleting behavior:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-card-title">
              {behavior.user.full_name}
            </h3>
            {behavior.is_critical && (
              <AlertCircle className="w-4 h-4 text-red-500" />
            )}
            {behavior.requires_immediate_attention && (
              <Zap className="w-4 h-4 text-orange-500" />
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-nav-icon" />
              <span className="text-sm text-card-subtext">
                {formatDate(behavior.date)} at {formatTime(behavior.time)}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-nav-icon" />
              <span className="text-sm text-card-subtext">
                {behavior.location}
                {behavior.specific_location && ` - ${behavior.specific_location}`}
              </span>
            </div>

            {behavior.duration_minutes && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-nav-icon" />
                <span className="text-sm text-card-subtext">
                  Duration: {behavior.duration_minutes} minutes
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getSeverityColor(behavior.severity))}>
            {behavior.severity}
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
                    onClick={() => onEdit(behavior)}
                    className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-bg-highlight transition-colors"
                  >
                    <Eye className="w-4 h-4 text-nav-icon" />
                    <span className="text-sm text-text-primary">View Details</span>
                  </button>
                  <button 
                    onClick={() => onEdit(behavior)}
                    className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-bg-highlight transition-colors"
                  >
                    <Edit className="w-4 h-4 text-nav-icon" />
                    <span className="text-sm text-text-primary">Edit</span>
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
      
      {/* Behavior Type */}
      <div className="mb-4">
        <span className={cn(
          "px-3 py-1 rounded-full text-xs font-medium border",
          getBehaviorTypeColor(behavior.behavior_type)
        )}>
          {behavior.behavior_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </span>
      </div>
      
      {/* Behaviors List */}
      {behavior.behaviors && behavior.behaviors.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-card-subtext mb-2">Behaviors Observed:</p>
          <div className="flex flex-wrap gap-1">
            {behavior.behaviors.map((behaviorItem, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-btn-primary/10 text-btn-primary rounded-full text-xs"
              >
                {behaviorItem}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Impact Indicators */}
      {(behavior.harm_to_self || behavior.harm_to_others || behavior.property_damage) && (
        <div className="mb-4">
          <p className="text-xs text-card-subtext mb-2">Impact:</p>
          <div className="flex flex-wrap gap-2">
            {behavior.harm_to_self && (
              <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Harm to Self
              </span>
            )}
            {behavior.harm_to_others && (
              <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Harm to Others
              </span>
            )}
            {behavior.property_damage && (
              <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs flex items-center gap-1">
                <Activity className="w-3 h-3" />
                Property Damage
              </span>
            )}
          </div>
        </div>
      )}

      {/* Intervention */}
      <div className="mb-4">
        <p className="text-xs text-card-subtext mb-2">Intervention:</p>
        <p className="text-sm text-card-subtext">{behavior.intervention_used || 'No intervention specified'}</p>
        {behavior.intervention_effective !== undefined && (
          <div className="flex items-center gap-2 mt-1">
            {behavior.intervention_effective ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <XCircle className="w-4 h-4 text-red-500" />
            )}
            <span className="text-xs text-card-subtext">
              {behavior.intervention_effective ? 'Effective' : 'Ineffective'}
            </span>
          </div>
        )}
      </div>

      {/* Follow-up Required */}
      {behavior.follow_up_required && (
        <div className="mt-4 pt-4 border-t border-border-default">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium text-orange-700">Follow-up Required</span>
          </div>
          {behavior.follow_up_notes && (
            <p className="text-sm text-card-subtext mt-1">{behavior.follow_up_notes}</p>
          )}
        </div>
      )}

      {/* Notes */}
      {behavior.notes && (
        <div className="mt-4 pt-4 border-t border-border-default">
          <p className="text-xs text-card-subtext mb-2">Notes:</p>
          <p className="text-sm text-card-subtext">{behavior.notes}</p>
        </div>
      )}
    </div>
  )
}

const BehaviorTable = ({ behaviors, onEdit, onDelete }: {
  behaviors: BehaviorType[]
  onEdit: (behavior: BehaviorType) => void
  onDelete: (behaviorId: string) => void
}) => (
  <div className="card p-6">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-lg font-semibold text-card-title">All Behaviors</h3>
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search behaviors..."
            className="input-field pl-10 w-64"
          />
        </div>
        <select className="input-field w-32">
          <option value="all">All Severity</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>
    </div>
    
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border-default">
            <th className="text-left py-3 px-4 font-medium text-text-primary">Client</th>
            <th className="text-left py-3 px-4 font-medium text-text-primary">Date & Time</th>
            <th className="text-left py-3 px-4 font-medium text-text-primary">Type</th>
            <th className="text-left py-3 px-4 font-medium text-text-primary">Severity</th>
            <th className="text-left py-3 px-4 font-medium text-text-primary">Location</th>
            <th className="text-left py-3 px-4 font-medium text-text-primary">Duration</th>
            <th className="text-left py-3 px-4 font-medium text-text-primary">Impact</th>
            <th className="text-left py-3 px-4 font-medium text-text-primary">Intervention</th>
            <th className="text-left py-3 px-4 font-medium text-text-primary">Actions</th>
          </tr>
        </thead>
        <tbody>
          {behaviors.map((behavior) => (
            <tr key={behavior.id} className="border-b border-border-default hover:bg-bg-highlight">
              <td className="py-3 px-4">
                <div>
                  <p className="text-text-primary font-medium">{behavior.user.full_name}</p>
                  <p className="text-sm text-text-secondary">{behavior.user.email}</p>
                </div>
              </td>
              <td className="py-3 px-4">
                <div>
                  <p className="text-text-primary">{formatDate(behavior.date)}</p>
                  <p className="text-sm text-text-secondary">{formatTime(behavior.time)}</p>
                </div>
              </td>
              <td className="py-3 px-4">
                <span className="px-2 py-1 bg-btn-primary/10 text-btn-primary rounded-full text-xs">
                  {behavior.behavior_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              </td>
              <td className="py-3 px-4">
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  behavior.severity === 'critical' && "bg-red-100 text-red-800",
                  behavior.severity === 'high' && "bg-orange-100 text-orange-800",
                  behavior.severity === 'medium' && "bg-yellow-100 text-yellow-800",
                  behavior.severity === 'low' && "bg-green-100 text-green-800"
                )}>
                  {behavior.severity}
                </span>
              </td>
              <td className="py-3 px-4">
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                  {behavior.location}
                </span>
              </td>
              <td className="py-3 px-4 text-text-secondary">
                {behavior.duration_minutes ? `${behavior.duration_minutes}m` : '-'}
              </td>
              <td className="py-3 px-4">
                <div className="flex flex-wrap gap-1">
                  {behavior.harm_to_self && (
                    <span className="px-1 py-0.5 bg-red-100 text-red-800 rounded text-xs">Self</span>
                  )}
                  {behavior.harm_to_others && (
                    <span className="px-1 py-0.5 bg-red-100 text-red-800 rounded text-xs">Others</span>
                  )}
                  {behavior.property_damage && (
                    <span className="px-1 py-0.5 bg-orange-100 text-orange-800 rounded text-xs">Property</span>
                  )}
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-1">
                  {behavior.intervention_effective !== undefined && (
                    behavior.intervention_effective ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )
                  )}
                  <span className="text-sm text-card-subtext">
                    {behavior.intervention_used ? behavior.intervention_used.substring(0, 30) + '...' : 'No intervention specified'}
                  </span>
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => onEdit(behavior)}
                    className="p-1 text-nav-icon hover:bg-bg-highlight rounded"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => onEdit(behavior)}
                    className="p-1 text-nav-icon hover:bg-bg-highlight rounded"
                    title="Edit Behavior"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => onDelete(behavior.id)}
                    className="p-1 text-text-danger hover:bg-text-danger/10 rounded"
                    title="Delete Behavior"
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

export default function BehaviorsPage() {
  const { behaviors, isLoading, mutate } = useBehaviors()
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [locationFilter, setLocationFilter] = useState('all')
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedBehavior, setSelectedBehavior] = useState<BehaviorType | null>(null)

  // Filter behaviors based on search and filters
  const filteredBehaviors = behaviors.filter((behavior: BehaviorType) => {
    const matchesSearch = behavior.user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (behavior.behaviors && behavior.behaviors.some(b => b.toLowerCase().includes(searchTerm.toLowerCase()))) ||
                         behavior.intervention_used?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         behavior.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesSeverity = severityFilter === 'all' || behavior.severity === severityFilter
    
    const matchesType = typeFilter === 'all' || behavior.behavior_type === typeFilter
    
    const matchesLocation = locationFilter === 'all' || behavior.location === locationFilter
    
    return matchesSearch && matchesSeverity && matchesType && matchesLocation
  })

  const handleEditBehavior = (behavior: BehaviorType) => {
    setSelectedBehavior(behavior)
    setShowEditModal(true)
  }

  const handleDeleteBehavior = (behaviorId: string) => {
    const behavior = behaviors.find((b: BehaviorType) => b.id === behaviorId)
    if (behavior) {
      setSelectedBehavior(behavior)
      setShowDeleteModal(true)
    }
  }

  const handleModalSuccess = () => {
    mutate() // Refresh the data
  }

  const getSeverityCount = (severity: string) => {
    return behaviors.filter((behavior: BehaviorType) => behavior.severity === severity).length
  }

  const getTypeCount = (type: string) => {
    return behaviors.filter((behavior: BehaviorType) => behavior.behavior_type === type).length
  }

  const getCriticalBehaviorsCount = () => {
    return behaviors.filter((behavior: BehaviorType) => behavior.is_critical).length
  }

  const getFollowUpRequiredCount = () => {
    return behaviors.filter((behavior: BehaviorType) => behavior.follow_up_required).length
  }

  const getAverageInterventionEffectiveness = () => {
    const effectiveInterventions = behaviors.filter((behavior: BehaviorType) => behavior.intervention_effective === true).length
    const totalWithEffectiveness = behaviors.filter((behavior: BehaviorType) => behavior.intervention_effective !== undefined).length
    
    if (totalWithEffectiveness === 0) return 0
    return Math.round((effectiveInterventions / totalWithEffectiveness) * 100)
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-btn-primary" />
            <p className="text-text-secondary">Loading behaviors...</p>
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
          { label: 'Behaviors' }
        ]} />

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              Behavior Management
            </h1>
            <p className="text-text-secondary">
              Track, analyze, and manage client behaviors and interventions
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
              onClick={() => setShowAddModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Log Behavior
            </button>
          </div>
        </div>

        {/* Stats Cards */}
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
                <p className="text-sm text-card-subtext">Critical Behaviors</p>
                <p className="text-2xl font-bold text-card-title">{getCriticalBehaviorsCount()}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-800" />
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-card-subtext">Follow-up Required</p>
                <p className="text-2xl font-bold text-card-title">{getFollowUpRequiredCount()}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-800" />
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-card-subtext">Intervention Success</p>
                <p className="text-2xl font-bold text-card-title">{getAverageInterventionEffectiveness()}%</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-800" />
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-card-subtext">High Severity</p>
                <p className="text-2xl font-bold text-card-title">{getSeverityCount('high') + getSeverityCount('critical')}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-800" />
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-card-subtext">Aggression</p>
                <p className="text-2xl font-bold text-card-title">{getTypeCount('aggression')}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-red-800" />
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-card-subtext">Self-Injury</p>
                <p className="text-2xl font-bold text-card-title">{getTypeCount('self_injury')}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-purple-800" />
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-card-subtext">This Week</p>
                <p className="text-2xl font-bold text-card-title">
                  {behaviors.filter((behavior: BehaviorType) => {
                    const behaviorDate = new Date(behavior.date)
                    const weekAgo = new Date()
                    weekAgo.setDate(weekAgo.getDate() - 7)
                    return behaviorDate >= weekAgo
                  }).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-800" />
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
                placeholder="Search by client name, behaviors, intervention, or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <select 
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="input-field w-40"
            >
              <option value="all">All Severity</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select 
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="input-field w-40"
            >
              <option value="all">All Types</option>
              <option value="aggression">Aggression</option>
              <option value="self_injury">Self-Injury</option>
              <option value="property_damage">Property Damage</option>
              <option value="elopement">Elopement</option>
              <option value="non_compliance">Non-Compliance</option>
              <option value="disruption">Disruption</option>
              <option value="other">Other</option>
            </select>
            <select 
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="input-field w-32"
            >
              <option value="all">All Locations</option>
              <option value="home">Home</option>
              <option value="school">School</option>
              <option value="community">Community</option>
              <option value="therapy">Therapy</option>
              <option value="transport">Transport</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Behaviors List */}
        {filteredBehaviors.length === 0 ? (
          <div className="card p-12 text-center">
            <AlertTriangle className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-card-title mb-2">No behaviors found</h3>
            <p className="text-text-secondary">
              {searchTerm || severityFilter !== 'all' || typeFilter !== 'all' || locationFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'No behaviors have been logged yet'
              }
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBehaviors.map((behavior: BehaviorType) => (
              <BehaviorCard 
                key={behavior.id} 
                behavior={behavior}
                onEdit={handleEditBehavior}
                onDelete={handleDeleteBehavior}
              />
            ))}
          </div>
        ) : (
          <BehaviorTable 
            behaviors={filteredBehaviors}
            onEdit={handleEditBehavior}
            onDelete={handleDeleteBehavior}
          />
        )}

        {/* Charts */}
        {behaviors.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BehaviorChart behaviors={behaviors} />
            <SeverityChart behaviors={behaviors} />
          </div>
        )}
      </div>

      {/* Modals */}
      <AddBehaviorModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleModalSuccess}
      />
      
      <EditBehaviorModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={handleModalSuccess}
        behavior={selectedBehavior}
      />
      
      <DeleteBehaviorModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onSuccess={handleModalSuccess}
        behavior={selectedBehavior}
      />
    </DashboardLayout>
  )
} 