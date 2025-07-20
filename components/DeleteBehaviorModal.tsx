'use client'

import { useState } from 'react'
import { X, Trash2, Loader2, AlertTriangle } from 'lucide-react'
import { apiClient } from '@/lib/api'
import { Behavior } from '@/types'
import { formatDate, formatTime } from '@/lib/utils'
import toast from 'react-hot-toast'

interface DeleteBehaviorModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  behavior: Behavior | null
}

export default function DeleteBehaviorModal({ isOpen, onClose, onSuccess, behavior }: DeleteBehaviorModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!behavior) return

    setIsDeleting(true)
    try {
      await apiClient.deleteBehavior(behavior.id)
      toast.success('Behavior log deleted successfully!')
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Error deleting behavior:', error)
      toast.error(error.message || 'Failed to delete behavior log')
    } finally {
      setIsDeleting(false)
    }
  }

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

  if (!isOpen || !behavior) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[20px] w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FF6B6B] rounded-lg flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#000000]">Delete Behavior Log</h2>
              <p className="text-sm text-[#6D6D6D]">This action cannot be undone</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="p-2 hover:bg-[#F9F5F4] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[#6D6D6D]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 p-4 bg-[#FFF5F5] rounded-lg border border-[#FF6B6B] border-opacity-20">
            <AlertTriangle className="w-5 h-5 text-[#FF6B6B]" />
            <div>
              <p className="text-sm font-medium text-[#000000]">
                Are you sure you want to delete this behavior log?
              </p>
              <p className="text-sm text-[#6D6D6D] mt-1">
                This will permanently remove all data associated with this incident.
              </p>
            </div>
          </div>

          {/* Behavior Summary */}
          <div className="bg-[#F9F5F4] rounded-lg p-4 space-y-3">
            <h3 className="text-sm font-semibold text-[#000000]">Behavior Summary</h3>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-[#6D6D6D]">User:</span>
                <div className="text-[#000000] font-medium">
                  {behavior.user?.full_name || `${behavior.user?.first_name} ${behavior.user?.last_name}`}
                </div>
              </div>
              
              <div>
                <span className="text-[#6D6D6D]">Date & Time:</span>
                <div className="text-[#000000] font-medium">
                  {formatDate(behavior.date)} at {formatTime(behavior.time)}
                </div>
              </div>
              
              <div>
                <span className="text-[#6D6D6D]">Location:</span>
                <div className="text-[#000000] font-medium capitalize">
                  {behavior.location.replace('_', ' ')}
                </div>
              </div>
              
              <div>
                <span className="text-[#6D6D6D]">Severity:</span>
                <div>
                  <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(behavior.severity)}`}>
                    {behavior.severity.charAt(0).toUpperCase() + behavior.severity.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <span className="text-[#6D6D6D] text-sm">Behavior Type:</span>
              <div className="text-[#000000] font-medium capitalize">
                {behavior.behavior_type.replace('_', ' ')}
              </div>
            </div>

            {behavior.behaviors && behavior.behaviors.length > 0 && (
              <div>
                <span className="text-[#6D6D6D] text-sm">Behaviors:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {behavior.behaviors.slice(0, 3).map((b, index) => (
                    <span key={index} className="px-2 py-1 bg-[#4ECDC4] text-white text-xs rounded-full">
                      {b}
                    </span>
                  ))}
                  {behavior.behaviors.length > 3 && (
                    <span className="px-2 py-1 bg-[#D3D3D3] text-[#6D6D6D] text-xs rounded-full">
                      +{behavior.behaviors.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {behavior.follow_up_required && (
              <div className="flex items-center gap-2 text-sm">
                <AlertTriangle className="w-4 h-4 text-[#FF6B6B]" />
                <span className="text-[#FF6B6B] font-medium">Follow-up required</span>
              </div>
            )}
          </div>

          {/* Warning Message */}
          <div className="bg-[#FFF5F5] border border-[#FF6B6B] border-opacity-20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-[#FF6B6B] mt-0.5" />
              <div>
                <p className="text-sm font-medium text-[#000000]">
                  This action is irreversible
                </p>
                <p className="text-sm text-[#6D6D6D] mt-1">
                  Once deleted, this behavior log and all associated data will be permanently removed 
                  from the system. This includes any photos, videos, notes, and intervention records.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 border border-[#D3D3D3] text-[#6D6D6D] rounded-lg hover:bg-[#F9F5F4] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 bg-[#FF6B6B] text-white rounded-lg hover:bg-[#FF5252] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Delete Behavior Log
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
} 