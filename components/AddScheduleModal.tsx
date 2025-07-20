'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Loader2, Calendar, Clock, User, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'
import { apiClient } from '@/lib/api'
import { Activity as ActivityType, User as UserType } from '@/types'
import toast from 'react-hot-toast'

interface AddScheduleModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  selectedDate?: string
}

interface FormData {
  activity: string
  user: string
  date: string
  scheduled_time: string
  notes: string
}

export default function AddScheduleModal({ isOpen, onClose, onSuccess, selectedDate }: AddScheduleModalProps) {
  const [formData, setFormData] = useState<FormData>({
    activity: '',
    user: '',
    date: selectedDate || '',
    scheduled_time: '',
    notes: ''
  })

  const [activities, setActivities] = useState<ActivityType[]>([])
  const [users, setUsers] = useState<UserType[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load activities and users when modal opens
  useEffect(() => {
    if (isOpen) {
      loadData()
    }
  }, [isOpen])

  // Update date when selectedDate prop changes
  useEffect(() => {
    if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        date: selectedDate
      }))
    }
  }, [selectedDate])

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

    // Note: Removed past date restriction to allow full calendar functionality
    // Users can now schedule activities for any date (makeup activities, corrections, etc.)
    // The calendar view makes it clear which dates are in the past

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        activity: formData.activity,
        assigned_user: formData.user,
        scheduled_date: formData.date,
        scheduled_time: formData.scheduled_time,
        notes: formData.notes || undefined
      }

      await apiClient.createSchedule(payload)
      toast.success('Activity scheduled successfully!')
      onSuccess()
      handleClose()
    } catch (error: any) {
      console.error('Error scheduling activity:', error)
      toast.error(error.message || 'Failed to schedule activity')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        activity: '',
        user: '',
        date: selectedDate || '',
        scheduled_time: '',
        notes: ''
      })
      setErrors({})
      onClose()
    }
  }

  // Removed date restrictions to allow full calendar functionality

  const selectedActivity = activities.find(a => a.id === formData.activity)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[20px] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#4ECDC4] rounded-lg flex items-center justify-center">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#000000]">Schedule Activity</h2>
              <p className="text-sm text-[#6D6D6D]">Add a new activity to the schedule</p>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Activity Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#000000]">Activity Details</h3>
            
            <div>
              <label className="block text-sm font-medium text-[#000000] mb-2">
                <Activity className="w-4 h-4 inline mr-1" />
                Activity *
              </label>
              <select
                value={formData.activity}
                onChange={(e) => handleInputChange('activity', e.target.value)}
                className={cn(
                  "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4]",
                  errors.activity ? "border-[#FF6B6B]" : "border-[#D3D3D3]"
                )}
                disabled={isSubmitting || isLoadingData}
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

            {/* Activity Info Display */}
            {selectedActivity && (
              <div className="bg-[#EEF8F7] rounded-lg p-4 border border-[#4ECDC4]/20">
                <h4 className="font-medium text-[#000000] mb-2">{selectedActivity.name}</h4>
                <p className="text-sm text-[#6D6D6D] mb-2">{selectedActivity.description}</p>
                <div className="flex items-center gap-4 text-sm text-[#6D6D6D]">
                  <span className="px-2 py-1 bg-white rounded-md">
                    {selectedActivity.category.replace('_', ' ')}
                  </span>
                  <span className="px-2 py-1 bg-white rounded-md">
                    {selectedActivity.difficulty}
                  </span>
                  {selectedActivity.estimated_duration && (
                    <span className="px-2 py-1 bg-white rounded-md">
                      ~{selectedActivity.estimated_duration} min
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Assignment */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#000000]">Assignment</h3>
            
            <div>
              <label className="block text-sm font-medium text-[#000000] mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Assigned User/Carer *
              </label>
              <select
                value={formData.user}
                onChange={(e) => handleInputChange('user', e.target.value)}
                className={cn(
                  "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4]",
                  errors.user ? "border-[#FF6B6B]" : "border-[#D3D3D3]"
                )}
                disabled={isSubmitting || isLoadingData}
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

          {/* Scheduling Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#000000]">Scheduling</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#000000] mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className={cn(
                    "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4]",
                    errors.date ? "border-[#FF6B6B]" : "border-[#D3D3D3]"
                  )}
                  disabled={isSubmitting}
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-[#FF6B6B]">{errors.date}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#000000] mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Scheduled Time *
                </label>
                <input
                  type="time"
                  value={formData.scheduled_time}
                  onChange={(e) => handleInputChange('scheduled_time', e.target.value)}
                  className={cn(
                    "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4]",
                    errors.scheduled_time ? "border-[#FF6B6B]" : "border-[#D3D3D3]"
                  )}
                  disabled={isSubmitting}
                />
                {errors.scheduled_time && (
                  <p className="mt-1 text-sm text-[#FF6B6B]">{errors.scheduled_time}</p>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#000000]">Additional Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-[#000000] mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="w-full px-3 py-2 border border-[#D3D3D3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4] resize-none"
                placeholder="Any special notes or instructions for this activity"
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
              disabled={isSubmitting || isLoadingData}
              className="px-6 py-2 bg-[#4ECDC4] text-white rounded-lg hover:bg-[#3DB9B2] transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Scheduling...</span>
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4" />
                  <span>Schedule Activity</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 