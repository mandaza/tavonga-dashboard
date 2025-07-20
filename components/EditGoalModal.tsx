'use client'

import { useState, useEffect } from 'react'
import { X, Target, Calendar, Flag, Users, Activity, Save } from 'lucide-react'
import { useUpdateGoal } from '@/lib/hooks'
import { useUsers } from '@/lib/hooks'
import { useActivities } from '@/lib/hooks'
import { Goal, User, Activity as ActivityType } from '@/types'
import toast from 'react-hot-toast'

interface EditGoalModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  goal: Goal | null
}

export default function EditGoalModal({ isOpen, onClose, onSuccess, goal }: EditGoalModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    target_date: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    notes: '',
    assigned_carers: [] as string[],
    primary_activities: [] as string[],
    related_activities: [] as string[],
    completion_threshold: 80
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateGoal = useUpdateGoal()
  const { users } = useUsers()
  const { activities } = useActivities()

  // Get only carers (users with carer role)
  const carers = users.filter((user: User) => user.is_carer || user.role === 'support_worker')

  // Initialize form data when goal prop changes
  useEffect(() => {
    if (goal) {
      setFormData({
        name: goal.name || '',
        description: goal.description || '',
        category: goal.category || '',
        target_date: goal.target_date || '',
        priority: goal.priority || 'medium',
        notes: goal.notes || '',
        assigned_carers: goal.assigned_carers?.map(carer => carer.id) || [],
        primary_activities: goal.primary_activities?.map(activity => activity.id) || [],
        related_activities: goal.related_activities?.map(activity => activity.id) || [],
        completion_threshold: goal.completion_threshold || 80
      })
    }
  }, [goal])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleMultiSelectChange = (field: 'assigned_carers' | 'primary_activities' | 'related_activities', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(id => id !== value)
        : [...prev[field], value]
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Goal name is required'
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }
    if (!formData.category.trim()) {
      newErrors.category = 'Category is required'
    }
    if (formData.completion_threshold < 1 || formData.completion_threshold > 100) {
      newErrors.completion_threshold = 'Completion threshold must be between 1 and 100'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm() || !goal) return

    setIsSubmitting(true)
    try {
      await updateGoal(goal.id, formData)
      toast.success('Goal updated successfully!')
      onSuccess()
      onClose()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update goal')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
    }
  }

  if (!isOpen || !goal) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[20px] w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#4ECDC4] rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#000000]">Edit Goal</h2>
              <p className="text-sm text-[#6D6D6D]">Update goal details and settings</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="w-8 h-8 bg-[#F0F0F0] rounded-lg flex items-center justify-center hover:bg-[#E5E5E5] transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4 text-[#000000]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Goal Status Info */}
          <div className="bg-[#EEF8F7] rounded-[20px] p-6">
            <h3 className="text-lg font-semibold text-[#000000] mb-4">Current Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-[#6D6D6D]">Status</p>
                <p className="font-medium text-[#000000] capitalize">{goal.status}</p>
              </div>
              <div>
                <p className="text-sm text-[#6D6D6D]">Progress</p>
                <p className="font-medium text-[#000000]">{goal.calculated_progress}%</p>
              </div>
              <div>
                <p className="text-sm text-[#6D6D6D]">Activities</p>
                <p className="font-medium text-[#000000]">{goal.total_activities_count}</p>
              </div>
              <div>
                <p className="text-sm text-[#6D6D6D]">Completed</p>
                <p className="font-medium text-[#000000]">{goal.completed_activities_count}</p>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-[#F9F5F4] rounded-[20px] p-6">
            <h3 className="text-lg font-semibold text-[#000000] mb-4">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#000000] mb-2">
                  Goal Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter goal name"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.name ? 'border-[#FF6B6B]' : 'border-[#D3D3D3]'
                  } focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4]`}
                />
                {errors.name && (
                  <p className="text-[#FF6B6B] text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#000000] mb-2">
                  Category *
                </label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="e.g., Independence, Communication, Social Skills"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.category ? 'border-[#FF6B6B]' : 'border-[#D3D3D3]'
                  } focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4]`}
                />
                {errors.category && (
                  <p className="text-[#FF6B6B] text-sm mt-1">{errors.category}</p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-[#000000] mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe the goal and what success looks like"
                rows={3}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.description ? 'border-[#FF6B6B]' : 'border-[#D3D3D3]'
                } focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4] resize-none`}
              />
              {errors.description && (
                <p className="text-[#FF6B6B] text-sm mt-1">{errors.description}</p>
              )}
            </div>
          </div>

          {/* Goal Settings */}
          <div className="bg-[#F9F5F4] rounded-[20px] p-6">
            <h3 className="text-lg font-semibold text-[#000000] mb-4">Goal Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#000000] mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Target Date
                  </div>
                </label>
                <input
                  type="date"
                  name="target_date"
                  value={formData.target_date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-[#D3D3D3] focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#000000] mb-2">
                  <div className="flex items-center gap-2">
                    <Flag className="w-4 h-4" />
                    Priority
                  </div>
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-[#D3D3D3] focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4]"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#000000] mb-2">
                  Completion Threshold (%)
                </label>
                <input
                  type="number"
                  name="completion_threshold"
                  value={formData.completion_threshold}
                  onChange={handleInputChange}
                  min="1"
                  max="100"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.completion_threshold ? 'border-[#FF6B6B]' : 'border-[#D3D3D3]'
                  } focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4]`}
                />
                {errors.completion_threshold && (
                  <p className="text-[#FF6B6B] text-sm mt-1">{errors.completion_threshold}</p>
                )}
              </div>
            </div>
          </div>

          {/* Assignments */}
          <div className="bg-[#F9F5F4] rounded-[20px] p-6">
            <h3 className="text-lg font-semibold text-[#000000] mb-4">Assignments</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Assigned Carers */}
              <div>
                <label className="block text-sm font-medium text-[#000000] mb-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Assigned Carers
                  </div>
                </label>
                <div className="max-h-40 overflow-y-auto border border-[#D3D3D3] rounded-lg p-3 bg-white">
                  {carers.length === 0 ? (
                    <p className="text-[#6D6D6D] text-sm">No carers available</p>
                  ) : (
                    carers.map((carer: User) => (
                      <label key={carer.id} className="flex items-center gap-2 py-2 hover:bg-[#EEF8F7] rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.assigned_carers.includes(carer.id)}
                          onChange={() => handleMultiSelectChange('assigned_carers', carer.id)}
                          className="w-4 h-4 text-[#4ECDC4] rounded focus:ring-[#4ECDC4] border-[#D3D3D3]"
                        />
                        <span className="text-sm text-[#000000]">{carer.full_name}</span>
                        <span className="text-xs text-[#6D6D6D]">({carer.role})</span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              {/* Related Activities */}
              <div>
                <label className="block text-sm font-medium text-[#000000] mb-2">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Related Activities
                  </div>
                </label>
                <div className="max-h-40 overflow-y-auto border border-[#D3D3D3] rounded-lg p-3 bg-white">
                  {activities.length === 0 ? (
                    <p className="text-[#6D6D6D] text-sm">No activities available</p>
                  ) : (
                    activities.map((activity: ActivityType) => (
                      <label key={activity.id} className="flex items-center gap-2 py-2 hover:bg-[#EEF8F7] rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.related_activities.includes(activity.id)}
                          onChange={() => handleMultiSelectChange('related_activities', activity.id)}
                          className="w-4 h-4 text-[#4ECDC4] rounded focus:ring-[#4ECDC4] border-[#D3D3D3]"
                        />
                        <span className="text-sm text-[#000000]">{activity.name}</span>
                        <span className="text-xs text-[#6D6D6D]">({activity.category})</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-[#F9F5F4] rounded-[20px] p-6">
            <h3 className="text-lg font-semibold text-[#000000] mb-4">Additional Notes</h3>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Any additional notes, special instructions, or considerations..."
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-[#D3D3D3] focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4] resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-[#E0E0E0]">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-6 py-3 bg-[#F0F0F0] text-[#000000] rounded-lg hover:bg-[#E5E5E5] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-[#4ECDC4] text-white rounded-lg hover:bg-[#3DB9B2] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Update Goal
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 