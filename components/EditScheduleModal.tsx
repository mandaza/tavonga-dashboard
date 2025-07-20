'use client'

import { useState, useEffect } from 'react'
import { X, Edit, Loader2, Calendar, Clock, User, Activity, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate, formatTime } from '@/lib/utils'
import { apiClient } from '@/lib/api'
import { Schedule, Activity as ActivityType, User as UserType } from '@/types'
import toast from 'react-hot-toast'

interface EditScheduleModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  activityLog: Schedule | null
}

interface FormData {
  activity: string
  user: string
  date: string
  scheduled_time: string
  status: string
  notes: string
  completion_notes: string
  difficulty_rating: string
  satisfaction_rating: string
}

const statusOptions = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'skipped', label: 'Skipped' }
]

export default function EditScheduleModal({ isOpen, onClose, onSuccess, activityLog }: EditScheduleModalProps) {
  const [formData, setFormData] = useState<FormData>({
    activity: '',
    user: '',
    date: '',
    scheduled_time: '',
    status: 'scheduled',
    notes: '',
    completion_notes: '',
    difficulty_rating: '',
    satisfaction_rating: ''
  })

  const [activities, setActivities] = useState<ActivityType[]>([])
  const [users, setUsers] = useState<UserType[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load data and populate form when modal opens
  useEffect(() => {
    if (isOpen) {
      loadData()
      if (activityLog) {
        populateForm(activityLog)
      }
    }
  }, [isOpen, activityLog])

  const loadData = async () => {
    setIsLoadingData(true)
    try {
      const [activitiesResponse, usersResponse] = await Promise.all([
        apiClient.getActivities({ is_active: true }),
        apiClient.getUsers({ role: 'carer' })
      ])
      
      setActivities(activitiesResponse.results || [])
      setUsers(usersResponse.results || [])
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load activities and users')
    } finally {
      setIsLoadingData(false)
    }
  }

  const populateForm = (log: Schedule) => {
    setFormData({
      activity: log.activity.id,
      user: log.assigned_user.id,
      date: log.scheduled_date,
      scheduled_time: log.scheduled_time,
      status: log.status,
      notes: log.notes || '',
      completion_notes: log.completion_notes || '',
      difficulty_rating: log.difficulty_rating ? log.difficulty_rating.toString() : '',
      satisfaction_rating: log.satisfaction_rating ? log.satisfaction_rating.toString() : ''
    })
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.activity) {
      newErrors.activity = 'Activity is required'
    }

    if (!formData.user) {
      newErrors.user = 'User/Carer is required'
    }

    if (!formData.date) {
      newErrors.date = 'Date is required'
    }

    if (!formData.scheduled_time) {
      newErrors.scheduled_time = 'Scheduled time is required'
    }

    if (formData.difficulty_rating && (isNaN(Number(formData.difficulty_rating)) || Number(formData.difficulty_rating) < 1 || Number(formData.difficulty_rating) > 5)) {
      newErrors.difficulty_rating = 'Difficulty rating must be between 1 and 5'
    }

    if (formData.satisfaction_rating && (isNaN(Number(formData.satisfaction_rating)) || Number(formData.satisfaction_rating) < 1 || Number(formData.satisfaction_rating) > 5)) {
      newErrors.satisfaction_rating = 'Satisfaction rating must be between 1 and 5'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!activityLog || !validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        activity: formData.activity,
        assigned_user: formData.user,
        scheduled_date: formData.date,
        scheduled_time: formData.scheduled_time,
        status: formData.status,
        completed: formData.status === 'completed',
        notes: formData.notes || undefined,
        completion_notes: formData.completion_notes || undefined,
        difficulty_rating: formData.difficulty_rating ? parseInt(formData.difficulty_rating) : undefined,
        satisfaction_rating: formData.satisfaction_rating ? parseInt(formData.satisfaction_rating) : undefined
      }

      await apiClient.updateSchedule(activityLog.id, payload)
      toast.success('Activity schedule updated successfully!')
      onSuccess()
      handleClose()
    } catch (error: any) {
      console.error('Error updating activity schedule:', error)
      toast.error(error.message || 'Failed to update activity schedule')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setErrors({})
      onClose()
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-[#4ECDC4]/10 text-[#4ECDC4]'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'scheduled': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-[#FF6B6B]/10 text-[#FF6B6B]'
      case 'skipped': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const canEdit = activityLog && (activityLog.status === 'scheduled' || activityLog.status === 'cancelled')
  const showCompletionFields = formData.status === 'completed' || formData.status === 'in_progress'

  if (!isOpen || !activityLog) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[20px] w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#4ECDC4] rounded-lg flex items-center justify-center">
              <Edit className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#000000]">Edit Scheduled Activity</h2>
              <p className="text-sm text-[#6D6D6D]">Update activity schedule and status</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-[#F9F5F4] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[#6D6D6D]" />
          </button>
        </div>

        {/* Activity Overview */}
        <div className="p-6 bg-[#F9F5F4] border-b border-gray-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-[#4ECDC4] rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-[#000000]">{activityLog.activity.name}</h3>
                <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getStatusColor(activityLog.status))}>
                  {activityLog.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-sm text-[#6D6D6D] mb-3">{activityLog.activity.description}</p>
              <div className="flex items-center gap-4 text-sm text-[#6D6D6D]">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(activityLog.scheduled_date)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatTime(activityLog.scheduled_time)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>{activityLog.assigned_user.full_name}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Warning for non-editable activities */}
        {!canEdit && (
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
              <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
              <div>
                <h4 className="font-semibold text-orange-800 mb-1">Limited Editing</h4>
                <p className="text-sm text-orange-700">
                  This activity is {activityLog.status}. Only certain fields can be modified for {activityLog.status} activities.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Activity and User Assignment */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#000000]">Activity & Assignment</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#000000] mb-2">
                  Activity *
                </label>
                <select
                  value={formData.activity}
                  onChange={(e) => handleInputChange('activity', e.target.value)}
                  className={cn(
                    "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4]",
                    errors.activity ? "border-[#FF6B6B]" : "border-[#D3D3D3]",
                    !canEdit && "bg-gray-100"
                  )}
                  disabled={!canEdit || isSubmitting || isLoadingData}
                >
                  <option value="">Select an activity</option>
                  {activities.map(activity => (
                    <option key={activity.id} value={activity.id}>
                      {activity.name} ({activity.category.replace('_', ' ')})
                    </option>
                  ))}
                </select>
                {errors.activity && (
                  <p className="mt-1 text-sm text-[#FF6B6B]">{errors.activity}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#000000] mb-2">
                  Assigned User/Carer *
                </label>
                <select
                  value={formData.user}
                  onChange={(e) => handleInputChange('user', e.target.value)}
                  className={cn(
                    "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4]",
                    errors.user ? "border-[#FF6B6B]" : "border-[#D3D3D3]",
                    !canEdit && "bg-gray-100"
                  )}
                  disabled={!canEdit || isSubmitting || isLoadingData}
                >
                  <option value="">Select a user/carer</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.full_name} ({user.email})
                    </option>
                  ))}
                </select>
                {errors.user && (
                  <p className="mt-1 text-sm text-[#FF6B6B]">{errors.user}</p>
                )}
              </div>
            </div>
          </div>

          {/* Schedule & Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#000000]">Schedule & Status</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#000000] mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className={cn(
                    "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4]",
                    errors.date ? "border-[#FF6B6B]" : "border-[#D3D3D3]",
                    !canEdit && "bg-gray-100"
                  )}
                  disabled={!canEdit || isSubmitting}
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-[#FF6B6B]">{errors.date}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#000000] mb-2">
                  Scheduled Time *
                </label>
                <input
                  type="time"
                  value={formData.scheduled_time}
                  onChange={(e) => handleInputChange('scheduled_time', e.target.value)}
                  className={cn(
                    "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4]",
                    errors.scheduled_time ? "border-[#FF6B6B]" : "border-[#D3D3D3]",
                    !canEdit && "bg-gray-100"
                  )}
                  disabled={!canEdit || isSubmitting}
                />
                {errors.scheduled_time && (
                  <p className="mt-1 text-sm text-[#FF6B6B]">{errors.scheduled_time}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#000000] mb-2">
                  Status *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-[#D3D3D3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4]"
                  disabled={isSubmitting}
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Completion Details */}
          {showCompletionFields && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#000000]">Completion Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#000000] mb-2">
                    Difficulty Rating (1-5)
                  </label>
                  <select
                    value={formData.difficulty_rating}
                    onChange={(e) => handleInputChange('difficulty_rating', e.target.value)}
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4]",
                      errors.difficulty_rating ? "border-[#FF6B6B]" : "border-[#D3D3D3]"
                    )}
                    disabled={isSubmitting}
                  >
                    <option value="">Select rating</option>
                    <option value="1">1 - Very Easy</option>
                    <option value="2">2 - Easy</option>
                    <option value="3">3 - Moderate</option>
                    <option value="4">4 - Difficult</option>
                    <option value="5">5 - Very Difficult</option>
                  </select>
                  {errors.difficulty_rating && (
                    <p className="mt-1 text-sm text-[#FF6B6B]">{errors.difficulty_rating}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#000000] mb-2">
                    Satisfaction Rating (1-5)
                  </label>
                  <select
                    value={formData.satisfaction_rating}
                    onChange={(e) => handleInputChange('satisfaction_rating', e.target.value)}
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4]",
                      errors.satisfaction_rating ? "border-[#FF6B6B]" : "border-[#D3D3D3]"
                    )}
                    disabled={isSubmitting}
                  >
                    <option value="">Select rating</option>
                    <option value="1">1 - Very Unsatisfied</option>
                    <option value="2">2 - Unsatisfied</option>
                    <option value="3">3 - Neutral</option>
                    <option value="4">4 - Satisfied</option>
                    <option value="5">5 - Very Satisfied</option>
                  </select>
                  {errors.satisfaction_rating && (
                    <p className="mt-1 text-sm text-[#FF6B6B]">{errors.satisfaction_rating}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#000000] mb-2">
                  Completion Notes
                </label>
                <textarea
                  value={formData.completion_notes}
                  onChange={(e) => handleInputChange('completion_notes', e.target.value)}
                  className="w-full px-3 py-2 border border-[#D3D3D3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4] resize-none"
                  placeholder="Notes about the completion of this activity"
                  rows={3}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#000000]">Notes</h3>
            
            <div>
              <label className="block text-sm font-medium text-[#000000] mb-2">
                General Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="w-full px-3 py-2 border border-[#D3D3D3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4] resize-none"
                placeholder="Any additional notes about this activity"
                rows={3}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-6 py-2 border border-[#E0E0E0] rounded-lg text-[#000000] hover:bg-[#F0F0F0] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-[#4ECDC4] text-white rounded-lg hover:bg-[#3DB9B2] transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4" />
                  <span>Update Schedule</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 