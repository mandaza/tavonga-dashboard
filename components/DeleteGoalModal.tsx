'use client'

import { useState } from 'react'
import { X, AlertTriangle, Target, Calendar, Flag, Users, Activity, Trash2 } from 'lucide-react'
import { Goal } from '@/types'
import { formatDate } from '@/lib/utils'

interface DeleteGoalModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (goalId: string) => void
  goal: Goal | null
}

export default function DeleteGoalModal({ isOpen, onClose, onConfirm, goal }: DeleteGoalModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleConfirm = async () => {
    if (!goal) return
    
    setIsDeleting(true)
    try {
      await onConfirm(goal.id)
      onClose()
    } catch (error) {
      console.error('Error deleting goal:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleClose = () => {
    if (!isDeleting) {
      onClose()
    }
  }

  if (!isOpen || !goal) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-[#4ECDC4]/10 text-[#4ECDC4]'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-[#FF6B6B]/10 text-[#FF6B6B]'
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[20px] w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FF6B6B] rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#000000]">Delete Goal</h2>
              <p className="text-sm text-[#6D6D6D]">This action cannot be undone</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isDeleting}
            className="w-8 h-8 bg-[#F0F0F0] rounded-lg flex items-center justify-center hover:bg-[#E5E5E5] transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4 text-[#000000]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Warning Message */}
          <div className="bg-[#FF6B6B]/10 border border-[#FF6B6B]/20 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-[#FF6B6B] mt-0.5" />
              <div>
                <p className="text-sm font-medium text-[#000000] mb-1">
                  Are you sure you want to delete this goal?
                </p>
                <p className="text-sm text-[#6D6D6D]">
                  This will permanently remove the goal and all its associated data. This action cannot be undone.
                </p>
              </div>
            </div>
          </div>

          {/* Goal Preview */}
          <div className="bg-[#F9F5F4] rounded-[20px] p-6">
            <h3 className="text-lg font-semibold text-[#000000] mb-4">Goal to be deleted:</h3>
            
            {/* Goal Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-[#6D6D6D]" />
                  <h4 className="font-semibold text-[#000000]">{goal.name}</h4>
                </div>
                <p className="text-sm text-[#6D6D6D] mb-3">{goal.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(goal.status)}`}>
                  {goal.status}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(goal.priority)}`}>
                  {goal.priority}
                </span>
              </div>
            </div>

            {/* Goal Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-[#6D6D6D]" />
                  <span className="text-sm font-medium text-[#000000]">Target Date</span>
                </div>
                <p className="text-sm text-[#6D6D6D] pl-6">
                  {goal.target_date ? formatDate(goal.target_date) : 'No target date'}
                </p>
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="w-4 h-4 text-[#6D6D6D]" />
                  <span className="text-sm font-medium text-[#000000]">Activities</span>
                </div>
                <p className="text-sm text-[#6D6D6D] pl-6">
                  {goal.total_activities_count} linked
                </p>
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-[#6D6D6D]" />
                  <span className="text-sm font-medium text-[#000000]">Assigned Carers</span>
                </div>
                <p className="text-sm text-[#6D6D6D] pl-6">
                  {goal.assigned_carers.length} assigned
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[#000000]">Progress</span>
                <span className="text-sm text-[#6D6D6D]">{goal.calculated_progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-[#4ECDC4] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${goal.calculated_progress}%` }}
                />
              </div>
            </div>

            {/* Category */}
            {goal.category && (
              <div className="mt-4 pt-4 border-t border-[#E0E0E0]">
                <span className="text-sm font-medium text-[#000000]">Category: </span>
                <span className="text-sm text-[#6D6D6D]">{goal.category}</span>
              </div>
            )}
          </div>

          {/* Additional Warning */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-[#6D6D6D] text-center">
              <strong>Note:</strong> Deleting this goal will also remove all progress tracking and associated data. 
              Linked activities will remain but will no longer be connected to this goal.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 p-6 border-t border-[#E0E0E0]">
          <button
            onClick={handleClose}
            disabled={isDeleting}
            className="px-6 py-3 bg-[#F0F0F0] text-[#000000] rounded-lg hover:bg-[#E5E5E5] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isDeleting}
            className="px-6 py-3 bg-[#FF6B6B] text-white rounded-lg hover:bg-[#FF5252] transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Delete Goal
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
} 