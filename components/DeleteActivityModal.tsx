'use client'

import { useState } from 'react'
import { X, Trash2, AlertTriangle, Loader2, Activity, Clock, Target, MapPin, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { apiClient } from '@/lib/api'
import { Activity as ActivityType } from '@/types'
import toast from 'react-hot-toast'

interface DeleteActivityModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  activity: ActivityType | null
}

export default function DeleteActivityModal({ isOpen, onClose, onSuccess, activity }: DeleteActivityModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmationStep, setConfirmationStep] = useState(1)

  const handleDelete = async () => {
    if (!activity) return

    setIsDeleting(true)
    try {
      await apiClient.deleteActivity(activity.id)
      toast.success('Activity deleted successfully!')
      onSuccess()
      handleClose()
    } catch (error: any) {
      console.error('Error deleting activity:', error)
      toast.error(error.message || 'Failed to delete activity')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleClose = () => {
    if (!isDeleting) {
      setConfirmationStep(1)
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
      <div className="bg-white rounded-[20px] w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FF6B6B] rounded-lg flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#000000]">Delete Activity</h2>
              <p className="text-sm text-[#6D6D6D]">
                {confirmationStep === 1 ? 'Review activity details' : 'Confirm deletion'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isDeleting}
            className="p-2 hover:bg-[#F9F5F4] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[#6D6D6D]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {confirmationStep === 1 ? (
            <div className="space-y-6">
              {/* Warning */}
              <div className="flex items-start gap-3 p-4 bg-[#FF6B6B]/10 rounded-lg border border-[#FF6B6B]/20">
                <AlertTriangle className="w-5 h-5 text-[#FF6B6B] mt-0.5" />
                <div>
                  <h3 className="font-semibold text-[#FF6B6B] mb-1">Warning</h3>
                  <p className="text-sm text-[#6D6D6D]">
                    You are about to permanently delete this activity. This action cannot be undone.
                  </p>
                </div>
              </div>

              {/* Activity Preview */}
              <div className="bg-[#F9F5F4] rounded-lg p-4">
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

              {/* Impact Assessment */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#000000]">Impact Assessment</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white border border-[#E0E0E0] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-[#000000]">Linked Goals</span>
                      <Target className="w-4 h-4 text-[#4ECDC4]" />
                    </div>
                    <div className="text-2xl font-bold text-[#000000]">{activity.all_goals?.length || 0}</div>
                    <p className="text-xs text-[#6D6D6D]">Goals will be unlinked</p>
                  </div>
                  
                  <div className="bg-white border border-[#E0E0E0] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-[#000000]">Completion Rate</span>
                      <Activity className="w-4 h-4 text-[#4ECDC4]" />
                    </div>
                    <div className="text-2xl font-bold text-[#000000]">{activity.completion_rate?.toFixed(1) || 0}%</div>
                    <p className="text-xs text-[#6D6D6D]">Historical data lost</p>
                  </div>
                  
                  <div className="bg-white border border-[#E0E0E0] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-[#000000]">Status</span>
                      <BookOpen className="w-4 h-4 text-[#4ECDC4]" />
                    </div>
                    <div className="text-2xl font-bold text-[#000000]">
                      {activity.is_active ? 'Active' : 'Inactive'}
                    </div>
                    <p className="text-xs text-[#6D6D6D]">Currently {activity.is_active ? 'in use' : 'disabled'}</p>
                  </div>
                </div>
              </div>

              {/* Linked Goals */}
              {activity.all_goals && activity.all_goals.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-[#000000]">Linked Goals ({activity.all_goals.length})</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {activity.all_goals.map((goal) => (
                      <div key={goal.id} className="flex items-center gap-2 p-2 bg-white border border-[#E0E0E0] rounded-lg">
                        <div className="w-6 h-6 bg-[#4ECDC4]/10 rounded-full flex items-center justify-center">
                          <Target className="w-3 h-3 text-[#4ECDC4]" />
                        </div>
                        <span className="text-sm text-[#000000] font-medium">{goal.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Final Confirmation */}
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-[#FF6B6B]/10 rounded-full flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-8 h-8 text-[#FF6B6B]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#000000] mb-2">Are you absolutely sure?</h3>
                  <p className="text-[#6D6D6D]">
                    This will permanently delete the activity "<strong>{activity.name}</strong>" and all associated data.
                  </p>
                </div>
              </div>

              {/* Final Warning */}
              <div className="bg-[#FF6B6B]/10 border border-[#FF6B6B]/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-[#FF6B6B] mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-[#FF6B6B] mb-1">This action is irreversible</h4>
                    <ul className="text-sm text-[#6D6D6D] space-y-1">
                      <li>• Activity will be permanently deleted</li>
                      <li>• All completion history will be lost</li>
                      <li>• Goal associations will be removed</li>
                      <li>• This cannot be undone</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#6D6D6D]">
              Step {confirmationStep} of 2
            </span>
            <div className="flex gap-1">
              <div className={cn("w-2 h-2 rounded-full", confirmationStep >= 1 ? "bg-[#4ECDC4]" : "bg-gray-300")} />
              <div className={cn("w-2 h-2 rounded-full", confirmationStep >= 2 ? "bg-[#FF6B6B]" : "bg-gray-300")} />
            </div>
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={handleClose}
              disabled={isDeleting}
              className="px-6 py-2 border border-[#E0E0E0] rounded-lg text-[#000000] hover:bg-[#F0F0F0] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            {confirmationStep === 1 ? (
              <button
                onClick={() => setConfirmationStep(2)}
                className="px-6 py-2 bg-[#FF6B6B] text-white rounded-lg hover:bg-[#FF5252] transition-colors"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-6 py-2 bg-[#FF6B6B] text-white rounded-lg hover:bg-[#FF5252] transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Forever</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 