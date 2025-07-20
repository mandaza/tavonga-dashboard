'use client'

import { useState, useEffect } from 'react'
import { X, Edit, Loader2, Upload, Link as LinkIcon, Target, Activity, Clock, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import { apiClient } from '@/lib/api'
import { Activity as ActivityType, Goal } from '@/types'
import toast from 'react-hot-toast'

interface EditActivityModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  activity: ActivityType | null
}

interface FormData {
  name: string
  description: string
  category: 'daily_living' | 'social' | 'educational' | 'recreational' | 'therapeutic' | 'other'
  difficulty: 'easy' | 'medium' | 'hard'
  instructions: string
  prerequisites: string
  estimated_duration: string
  primary_goal: string
  related_goals: string[]
  goal_contribution_weight: string
  image_url: string
  video_url: string
  is_active: boolean
}

const categoryOptions = [
  { value: 'daily_living', label: 'Daily Living' },
  { value: 'social', label: 'Social' },
  { value: 'educational', label: 'Educational' },
  { value: 'recreational', label: 'Recreational' },
  { value: 'therapeutic', label: 'Therapeutic' },
  { value: 'other', label: 'Other' }
]

const difficultyOptions = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' }
]

export default function EditActivityModal({ isOpen, onClose, onSuccess, activity }: EditActivityModalProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    category: 'daily_living',
    difficulty: 'easy',
    instructions: '',
    prerequisites: '',
    estimated_duration: '',
    primary_goal: '',
    related_goals: [],
    goal_contribution_weight: '1.0',
    image_url: '',
    video_url: '',
    is_active: true
  })

  const [goals, setGoals] = useState<Goal[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingGoals, setIsLoadingGoals] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load goals and populate form when modal opens
  useEffect(() => {
    if (isOpen) {
      loadGoals()
      if (activity) {
        populateForm(activity)
      }
    }
  }, [isOpen, activity])

  const loadGoals = async () => {
    setIsLoadingGoals(true)
    try {
      const response = await apiClient.getGoals()
      setGoals(response.results || [])
    } catch (error) {
      console.error('Error loading goals:', error)
      toast.error('Failed to load goals')
    } finally {
      setIsLoadingGoals(false)
    }
  }

  const populateForm = (activity: ActivityType) => {
    setFormData({
      name: activity.name || '',
      description: activity.description || '',
      category: activity.category || 'daily_living',
      difficulty: activity.difficulty || 'easy',
      instructions: activity.instructions || '',
      prerequisites: activity.prerequisites || '',
      estimated_duration: activity.estimated_duration ? activity.estimated_duration.toString() : '',
      primary_goal: activity.primary_goal?.id || '',
      related_goals: activity.related_goals?.map(goal => goal.id) || [],
      goal_contribution_weight: activity.goal_contribution_weight ? activity.goal_contribution_weight.toString() : '1.0',
      image_url: activity.image_url || '',
      video_url: activity.video_url || '',
      is_active: activity.is_active
    })
  }

  const handleInputChange = (field: keyof FormData, value: string | string[] | boolean) => {
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

  const handleGoalToggle = (goalId: string) => {
    setFormData(prev => ({
      ...prev,
      related_goals: prev.related_goals.includes(goalId)
        ? prev.related_goals.filter(id => id !== goalId)
        : [...prev.related_goals, goalId]
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Activity name is required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    if (!formData.instructions.trim()) {
      newErrors.instructions = 'Instructions are required'
    }

    if (formData.estimated_duration && isNaN(Number(formData.estimated_duration))) {
      newErrors.estimated_duration = 'Duration must be a valid number'
    }

    if (formData.goal_contribution_weight && isNaN(Number(formData.goal_contribution_weight))) {
      newErrors.goal_contribution_weight = 'Weight must be a valid number'
    }

    if (formData.image_url && !isValidUrl(formData.image_url)) {
      newErrors.image_url = 'Please enter a valid URL'
    }

    if (formData.video_url && !isValidUrl(formData.video_url)) {
      newErrors.video_url = 'Please enter a valid URL'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!activity || !validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        difficulty: formData.difficulty,
        instructions: formData.instructions,
        prerequisites: formData.prerequisites || undefined,
        estimated_duration: formData.estimated_duration ? parseInt(formData.estimated_duration) : undefined,
        primary_goal: formData.primary_goal || undefined,
        related_goals: formData.related_goals.length > 0 ? formData.related_goals : undefined,
        goal_contribution_weight: formData.goal_contribution_weight ? parseFloat(formData.goal_contribution_weight) : 1.0,
        image_url: formData.image_url || undefined,
        video_url: formData.video_url || undefined,
        is_active: formData.is_active
      }

      await apiClient.updateActivity(activity.id, payload)
      toast.success('Activity updated successfully!')
      onSuccess()
      handleClose()
    } catch (error: any) {
      console.error('Error updating activity:', error)
      toast.error(error.message || 'Failed to update activity')
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'daily_living': return 'bg-green-100 text-green-800'
      case 'social': return 'bg-blue-100 text-blue-800'
      case 'educational': return 'bg-purple-100 text-purple-800'
      case 'recreational': return 'bg-orange-100 text-orange-800'
      case 'therapeutic': return 'bg-pink-100 text-pink-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-[#4ECDC4]/10 text-[#4ECDC4]'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-[#FF6B6B]/10 text-[#FF6B6B]'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (!isOpen || !activity) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[20px] w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#4ECDC4] rounded-lg flex items-center justify-center">
              <Edit className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#000000]">Edit Activity</h2>
              <p className="text-sm text-[#6D6D6D]">Update activity information and settings</p>
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
                <h3 className="text-lg font-semibold text-[#000000]">{activity.name}</h3>
                <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getCategoryColor(activity.category))}>
                  {activity.category.replace('_', ' ')}
                </span>
                <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getDifficultyColor(activity.difficulty))}>
                  {activity.difficulty}
                </span>
              </div>
              <p className="text-sm text-[#6D6D6D] mb-3">{activity.description}</p>
              <div className="flex items-center gap-4 text-sm text-[#6D6D6D]">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{activity.estimated_duration || 'Variable'} mins</span>
                </div>
                <div className="flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  <span>{activity.all_goals?.length || 0} goals</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{activity.completion_rate?.toFixed(1) || 0}% completion</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#000000]">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#000000] mb-2">
                  Activity Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={cn(
                    "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4]",
                    errors.name ? "border-[#FF6B6B]" : "border-[#D3D3D3]"
                  )}
                  placeholder="Enter activity name"
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-[#FF6B6B]">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#000000] mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-[#D3D3D3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4]"
                  disabled={isSubmitting}
                >
                  {categoryOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#000000] mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className={cn(
                  "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4] resize-none",
                  errors.description ? "border-[#FF6B6B]" : "border-[#D3D3D3]"
                )}
                placeholder="Describe the activity"
                rows={3}
                disabled={isSubmitting}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-[#FF6B6B]">{errors.description}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#000000] mb-2">
                Instructions *
              </label>
              <textarea
                value={formData.instructions}
                onChange={(e) => handleInputChange('instructions', e.target.value)}
                className={cn(
                  "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4] resize-none",
                  errors.instructions ? "border-[#FF6B6B]" : "border-[#D3D3D3]"
                )}
                placeholder="Provide detailed instructions for the activity"
                rows={4}
                disabled={isSubmitting}
              />
              {errors.instructions && (
                <p className="mt-1 text-sm text-[#FF6B6B]">{errors.instructions}</p>
              )}
            </div>
          </div>

          {/* Activity Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#000000]">Activity Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#000000] mb-2">
                  Difficulty *
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => handleInputChange('difficulty', e.target.value)}
                  className="w-full px-3 py-2 border border-[#D3D3D3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4]"
                  disabled={isSubmitting}
                >
                  {difficultyOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#000000] mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={formData.estimated_duration}
                  onChange={(e) => handleInputChange('estimated_duration', e.target.value)}
                  className={cn(
                    "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4]",
                    errors.estimated_duration ? "border-[#FF6B6B]" : "border-[#D3D3D3]"
                  )}
                  placeholder="30"
                  min="1"
                  disabled={isSubmitting}
                />
                {errors.estimated_duration && (
                  <p className="mt-1 text-sm text-[#FF6B6B]">{errors.estimated_duration}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#000000] mb-2">
                  Goal Weight
                </label>
                <input
                  type="number"
                  value={formData.goal_contribution_weight}
                  onChange={(e) => handleInputChange('goal_contribution_weight', e.target.value)}
                  className={cn(
                    "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4]",
                    errors.goal_contribution_weight ? "border-[#FF6B6B]" : "border-[#D3D3D3]"
                  )}
                  placeholder="1.0"
                  step="0.1"
                  min="0"
                  max="10"
                  disabled={isSubmitting}
                />
                {errors.goal_contribution_weight && (
                  <p className="mt-1 text-sm text-[#FF6B6B]">{errors.goal_contribution_weight}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#000000] mb-2">
                Prerequisites
              </label>
              <textarea
                value={formData.prerequisites}
                onChange={(e) => handleInputChange('prerequisites', e.target.value)}
                className="w-full px-3 py-2 border border-[#D3D3D3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4] resize-none"
                placeholder="List any prerequisites or requirements"
                rows={2}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Goal Associations */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#000000]">Goal Associations</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#000000] mb-2">
                  Primary Goal
                </label>
                <select
                  value={formData.primary_goal}
                  onChange={(e) => handleInputChange('primary_goal', e.target.value)}
                  className="w-full px-3 py-2 border border-[#D3D3D3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4]"
                  disabled={isSubmitting || isLoadingGoals}
                >
                  <option value="">Select a primary goal</option>
                  {goals.map(goal => (
                    <option key={goal.id} value={goal.id}>
                      {goal.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#000000] mb-2">
                  Related Goals
                </label>
                <div className="border border-[#D3D3D3] rounded-lg p-3 max-h-32 overflow-y-auto">
                  {isLoadingGoals ? (
                    <div className="text-center text-[#6D6D6D]">Loading goals...</div>
                  ) : goals.length === 0 ? (
                    <div className="text-center text-[#6D6D6D]">No goals available</div>
                  ) : (
                    <div className="space-y-2">
                      {goals.map(goal => (
                        <label key={goal.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={formData.related_goals.includes(goal.id)}
                            onChange={() => handleGoalToggle(goal.id)}
                            disabled={isSubmitting}
                            className="w-4 h-4 text-[#4ECDC4] border-[#D3D3D3] rounded focus:ring-[#4ECDC4]"
                          />
                          <span className="text-sm text-[#000000]">{goal.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Media & Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#000000]">Media & Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#000000] mb-2">
                  <Upload className="w-4 h-4 inline mr-1" />
                  Image URL
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => handleInputChange('image_url', e.target.value)}
                  className={cn(
                    "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4]",
                    errors.image_url ? "border-[#FF6B6B]" : "border-[#D3D3D3]"
                  )}
                  placeholder="https://example.com/image.jpg"
                  disabled={isSubmitting}
                />
                {errors.image_url && (
                  <p className="mt-1 text-sm text-[#FF6B6B]">{errors.image_url}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#000000] mb-2">
                  <LinkIcon className="w-4 h-4 inline mr-1" />
                  Video URL
                </label>
                <input
                  type="url"
                  value={formData.video_url}
                  onChange={(e) => handleInputChange('video_url', e.target.value)}
                  className={cn(
                    "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4]",
                    errors.video_url ? "border-[#FF6B6B]" : "border-[#D3D3D3]"
                  )}
                  placeholder="https://example.com/video.mp4"
                  disabled={isSubmitting}
                />
                {errors.video_url && (
                  <p className="mt-1 text-sm text-[#FF6B6B]">{errors.video_url}</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => handleInputChange('is_active', e.target.checked)}
                disabled={isSubmitting}
                className="w-4 h-4 text-[#4ECDC4] border-[#D3D3D3] rounded focus:ring-[#4ECDC4]"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-[#000000]">
                Activity is active and available for use
              </label>
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
                  <span>Update Activity</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 