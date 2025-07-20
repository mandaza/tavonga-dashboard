'use client'

import { useState } from 'react'
import { X, Trash2, Loader2, AlertTriangle, Calendar, Clock, User, Activity, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate, formatTime } from '@/lib/utils'
import { apiClient } from '@/lib/api'
import { Schedule } from '@/types'
import toast from 'react-hot-toast'

interface DeleteScheduleModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  activityLog: Schedule | null
}

const progressSteps = [
  { id: 1, label: 'Review Activity', description: 'Verify activity details' },
  { id: 2, label: 'Confirm Deletion', description: 'Final confirmation' }
]

export default function DeleteScheduleModal({ isOpen, onClose, onSuccess, activityLog }: DeleteScheduleModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmText, setConfirmText] = useState('')

  const handleClose = () => {
    if (!isDeleting) {
      setCurrentStep(1)
      setConfirmText('')
      onClose()
    }
  }

  const handleNextStep = () => {
    if (currentStep < progressSteps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleDelete = async () => {
    if (!activityLog) return

    setIsDeleting(true)
    try {
      await apiClient.deleteSchedule(activityLog.id)
      toast.success('Activity schedule deleted successfully!')
      onSuccess()
      handleClose()
    } catch (error: any) {
      console.error('Error deleting activity schedule:', error)
      toast.error(error.message || 'Failed to delete activity schedule')
    } finally {
      setIsDeleting(false)
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

  const getWarningMessage = (status: string) => {
    switch (status) {
      case 'completed':
        return 'This activity has been completed. Deleting it will remove all completion data and ratings.'
      case 'in_progress':
        return 'This activity is currently in progress. Deleting it will interrupt the current session.'
      case 'scheduled':
        return 'This activity is scheduled for the future. Deleting it will remove it from the schedule.'
      case 'cancelled':
        return 'This activity was cancelled. Deleting it will permanently remove it from records.'
      case 'skipped':
        return 'This activity was skipped. Deleting it will permanently remove it from records.'
      default:
        return 'This will permanently delete the activity schedule.'
    }
  }

  const getDangerLevel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'high'
      case 'in_progress':
        return 'high'
      case 'scheduled':
        return 'medium'
      default:
        return 'low'
    }
  }

  const canDelete = confirmText.toLowerCase() === 'delete'

  if (!isOpen || !activityLog) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[20px] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FF6B6B] rounded-lg flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#000000]">Delete Scheduled Activity</h2>
              <p className="text-sm text-[#6D6D6D]">This action cannot be undone</p>
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

        {/* Progress Steps */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            {progressSteps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex items-center">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                    currentStep >= step.id 
                      ? "bg-[#FF6B6B] text-white" 
                      : "bg-gray-200 text-gray-600"
                  )}>
                    {step.id}
                  </div>
                  <div className="ml-3">
                    <p className={cn(
                      "text-sm font-medium",
                      currentStep >= step.id ? "text-[#000000]" : "text-[#6D6D6D]"
                    )}>
                      {step.label}
                    </p>
                    <p className="text-xs text-[#6D6D6D]">{step.description}</p>
                  </div>
                </div>
                {index < progressSteps.length - 1 && (
                  <ChevronRight className="w-5 h-5 text-[#6D6D6D] mx-4" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Activity Details */}
              <div className="bg-[#F9F5F4] rounded-lg p-6">
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
                    
                    {/* Activity Details Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-[#6D6D6D] mb-1">Scheduled Date</p>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[#4ECDC4]" />
                          <span className="text-sm font-medium text-[#000000]">{formatDate(activityLog.scheduled_date)}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-[#6D6D6D] mb-1">Scheduled Time</p>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-[#4ECDC4]" />
                          <span className="text-sm font-medium text-[#000000]">{formatTime(activityLog.scheduled_time)}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-[#6D6D6D] mb-1">Assigned User</p>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-[#4ECDC4]" />
                          <span className="text-sm font-medium text-[#000000]">{activityLog.assigned_user.full_name}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-[#6D6D6D] mb-1">Category</p>
                        <span className="text-sm font-medium text-[#000000]">
                          {activityLog.activity.category.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Completion Details */}
                    {activityLog.completed && (
                      <div className="bg-[#EEF8F7] rounded-lg p-4 border border-[#4ECDC4]/20">
                        <h4 className="font-semibold text-[#000000] mb-2">Completion Data</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {activityLog.difficulty_rating && (
                            <div>
                              <span className="text-[#6D6D6D]">Difficulty Rating:</span>
                              <span className="text-[#000000] font-medium ml-2">{activityLog.difficulty_rating}/5</span>
                            </div>
                          )}
                          {activityLog.satisfaction_rating && (
                            <div>
                              <span className="text-[#6D6D6D]">Satisfaction Rating:</span>
                              <span className="text-[#000000] font-medium ml-2">{activityLog.satisfaction_rating}/5</span>
                            </div>
                          )}
                        </div>
                        {activityLog.completion_notes && (
                          <div className="mt-3">
                            <p className="text-xs text-[#6D6D6D] mb-1">Completion Notes</p>
                            <p className="text-sm text-[#000000]">{activityLog.completion_notes}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Notes */}
                    {activityLog.notes && (
                      <div className="mt-4">
                        <p className="text-xs text-[#6D6D6D] mb-1">Notes</p>
                        <p className="text-sm text-[#000000] bg-white rounded-md p-2 border">{activityLog.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Warning Message */}
              <div className={cn(
                "flex items-start gap-3 p-4 rounded-lg border",
                getDangerLevel(activityLog.status) === 'high' && "bg-red-50 border-red-200",
                getDangerLevel(activityLog.status) === 'medium' && "bg-orange-50 border-orange-200",
                getDangerLevel(activityLog.status) === 'low' && "bg-yellow-50 border-yellow-200"
              )}>
                <AlertTriangle className={cn(
                  "w-5 h-5 mt-0.5",
                  getDangerLevel(activityLog.status) === 'high' && "text-red-500",
                  getDangerLevel(activityLog.status) === 'medium' && "text-orange-500",
                  getDangerLevel(activityLog.status) === 'low' && "text-yellow-500"
                )} />
                <div>
                  <h4 className={cn(
                    "font-semibold mb-1",
                    getDangerLevel(activityLog.status) === 'high' && "text-red-800",
                    getDangerLevel(activityLog.status) === 'medium' && "text-orange-800",
                    getDangerLevel(activityLog.status) === 'low' && "text-yellow-800"
                  )}>
                    {getDangerLevel(activityLog.status) === 'high' ? 'High Risk Deletion' : 
                     getDangerLevel(activityLog.status) === 'medium' ? 'Medium Risk Deletion' : 
                     'Deletion Warning'}
                  </h4>
                  <p className={cn(
                    "text-sm",
                    getDangerLevel(activityLog.status) === 'high' && "text-red-700",
                    getDangerLevel(activityLog.status) === 'medium' && "text-orange-700",
                    getDangerLevel(activityLog.status) === 'low' && "text-yellow-700"
                  )}>
                    {getWarningMessage(activityLog.status)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#FF6B6B] rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-[#000000] mb-2">Final Confirmation</h3>
                <p className="text-sm text-[#6D6D6D] mb-6">
                  Are you absolutely sure you want to delete this activity schedule? This action cannot be undone.
                </p>
              </div>

              <div className="bg-[#F9F5F4] rounded-lg p-4 border border-[#FF6B6B]/20">
                <div className="flex items-center gap-3 mb-3">
                  <Activity className="w-5 h-5 text-[#FF6B6B]" />
                  <span className="font-medium text-[#000000]">{activityLog.activity.name}</span>
                </div>
                <div className="text-sm text-[#6D6D6D]">
                  <p>User: {activityLog.assigned_user.full_name}</p>
                  <p>Date: {formatDate(activityLog.scheduled_date)} at {formatTime(activityLog.scheduled_time)}</p>
                  <p>Status: {activityLog.status.replace('_', ' ')}</p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-[#000000]">
                  Type "DELETE" to confirm deletion
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Type DELETE to confirm"
                  className="w-full px-3 py-2 border border-[#FF6B6B] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:border-[#FF6B6B]"
                  disabled={isDeleting}
                />
                <p className="text-xs text-[#6D6D6D]">
                  This will permanently delete the activity schedule and all associated data.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200">
          <div className="text-sm text-[#6D6D6D]">
            Step {currentStep} of {progressSteps.length}
          </div>
          
          <div className="flex space-x-4">
            {currentStep > 1 && (
              <button
                onClick={handlePreviousStep}
                disabled={isDeleting}
                className="px-4 py-2 border border-[#E0E0E0] rounded-lg text-[#000000] hover:bg-[#F0F0F0] transition-colors disabled:opacity-50"
              >
                Previous
              </button>
            )}
            
            <button
              onClick={handleClose}
              disabled={isDeleting}
              className="px-4 py-2 border border-[#E0E0E0] rounded-lg text-[#000000] hover:bg-[#F0F0F0] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            
            {currentStep < progressSteps.length ? (
              <button
                onClick={handleNextStep}
                disabled={isDeleting}
                className="px-4 py-2 bg-[#FF6B6B] text-white rounded-lg hover:bg-[#FF5252] transition-colors disabled:opacity-50"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleDelete}
                disabled={isDeleting || !canDelete}
                className="px-4 py-2 bg-[#FF6B6B] text-white rounded-lg hover:bg-[#FF5252] transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Activity</span>
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