'use client'

import { useState } from 'react'
import { X, Trash2, AlertTriangle, Loader2, Clock, Calendar, MapPin, User, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate, formatTime } from '@/lib/utils'
import { apiClient } from '@/lib/api'
import { Shift as ShiftType } from '@/types'
import toast from 'react-hot-toast'

interface DeleteShiftModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  shift: ShiftType | null
}

export default function DeleteShiftModal({ isOpen, onClose, onSuccess, shift }: DeleteShiftModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmationStep, setConfirmationStep] = useState(0)

  const handleDelete = async () => {
    if (!shift) return
    
    setIsDeleting(true)
    try {
      await apiClient.deleteShift(shift.id)
      toast.success('Shift deleted successfully!')
      onSuccess()
      handleClose()
    } catch (error: any) {
      console.error('Error deleting shift:', error)
      toast.error(error.message || 'Failed to delete shift')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleClose = () => {
    if (!isDeleting) {
      setConfirmationStep(0)
      onClose()
    }
  }

  const proceedToConfirmation = () => {
    setConfirmationStep(1)
  }

  const goBack = () => {
    setConfirmationStep(0)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-[#4ECDC4]/10 text-[#4ECDC4]'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'scheduled': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-[#FF6B6B]/10 text-[#FF6B6B]'
      case 'no_show': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getShiftTypeColor = (shiftType: string) => {
    switch (shiftType) {
      case 'morning': return 'bg-yellow-100 text-yellow-800'
      case 'afternoon': return 'bg-orange-100 text-orange-800'
      case 'evening': return 'bg-purple-100 text-purple-800'
      case 'night': return 'bg-blue-100 text-blue-800'
      case 'full_day': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getWarningMessage = () => {
    if (!shift) return ''
    
    if (shift.status === 'in_progress') {
      return 'This shift is currently in progress. Deleting it will affect clock-in/out records.'
    }
    
    if (shift.status === 'completed') {
      return 'This shift has been completed with recorded clock-in/out times. Deleting it will permanently remove this data.'
    }
    
    if (shift.clock_in || shift.clock_out) {
      return 'This shift has clock-in/out records. Deleting it will permanently remove this attendance data.'
    }
    
    return 'This shift will be permanently deleted from the system.'
  }

  if (!isOpen || !shift) return null

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
              <h2 className="text-xl font-semibold text-[#000000]">Delete Shift</h2>
              <p className="text-sm text-[#6D6D6D]">
                {confirmationStep === 0 ? 'Review shift details before deletion' : 'Final confirmation required'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isDeleting}
            className="p-2 hover:bg-[#F9F5F4] rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-[#6D6D6D]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {confirmationStep === 0 ? (
            // Step 1: Shift Details & Warning
            <div className="space-y-6">
              {/* Warning Message */}
              <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-orange-800 mb-1">Warning</h4>
                  <p className="text-sm text-orange-700">{getWarningMessage()}</p>
                </div>
              </div>

              {/* Shift Details */}
              <div className="bg-[#F9F5F4] rounded-lg p-4">
                <h3 className="text-lg font-semibold text-[#000000] mb-4">Shift Details</h3>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#4ECDC4] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-[#000000]">{shift.carer.full_name}</h4>
                      <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getStatusColor(shift.status))}>
                        {shift.status.replace('_', ' ')}
                      </span>
                      <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getShiftTypeColor(shift.shift_type))}>
                        {shift.shift_type.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-[#6D6D6D]">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(shift.date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{formatTime(shift.start_time)} - {formatTime(shift.end_time)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{shift.location}</span>
                      </div>
                      {shift.client_name && (
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>{shift.client_name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Clock-in/out Records */}
              {(shift.clock_in || shift.clock_out) && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">Attendance Records</h4>
                  <div className="space-y-2">
                    {shift.clock_in && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-blue-700">
                          Clock In: {formatTime(shift.clock_in)}
                          {shift.clock_in_location && ` at ${shift.clock_in_location}`}
                        </span>
                      </div>
                    )}
                    {shift.clock_out && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-blue-700">
                          Clock Out: {formatTime(shift.clock_out)}
                          {shift.clock_out_location && ` at ${shift.clock_out_location}`}
                        </span>
                      </div>
                    )}
                    {shift.duration_hours && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span className="text-blue-700">Total Duration: {shift.duration_hours} hours</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              {(shift.notes || shift.special_instructions) && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-[#000000] mb-2">Notes & Instructions</h4>
                  {shift.special_instructions && (
                    <div className="mb-2">
                      <p className="text-sm font-medium text-[#6D6D6D]">Special Instructions:</p>
                      <p className="text-sm text-[#000000]">{shift.special_instructions}</p>
                    </div>
                  )}
                  {shift.notes && (
                    <div>
                      <p className="text-sm font-medium text-[#6D6D6D]">Notes:</p>
                      <p className="text-sm text-[#000000]">{shift.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            // Step 2: Final Confirmation
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#FF6B6B] rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-[#000000] mb-2">
                  Are you absolutely sure?
                </h3>
                <p className="text-[#6D6D6D] mb-4">
                  This action cannot be undone. The shift for <strong>{shift.carer.full_name}</strong> on{' '}
                  <strong>{formatDate(shift.date)}</strong> will be permanently deleted.
                </p>
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <p className="text-sm text-red-700 font-medium">
                    This will permanently remove:
                  </p>
                  <ul className="text-sm text-red-700 mt-2 space-y-1">
                    <li>• Shift schedule information</li>
                    {(shift.clock_in || shift.clock_out) && <li>• Clock-in/out records</li>}
                    {shift.duration_hours && <li>• Attendance duration data</li>}
                    {(shift.notes || shift.special_instructions) && <li>• Notes and instructions</li>}
                    <li>• All associated shift data</li>
                  </ul>
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="flex justify-center">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-[#4ECDC4] rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div className="w-8 h-1 bg-[#4ECDC4] rounded-full"></div>
                  <div className="w-8 h-8 bg-[#FF6B6B] rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">2</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-4 p-6 border-t border-gray-200">
          {confirmationStep === 0 ? (
            // Step 1 Actions
            <>
              <button
                onClick={handleClose}
                disabled={isDeleting}
                className="px-6 py-2 border border-[#E0E0E0] rounded-lg text-[#000000] hover:bg-[#F0F0F0] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={proceedToConfirmation}
                disabled={isDeleting}
                className="px-6 py-2 bg-[#FF6B6B] text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Proceed to Delete</span>
              </button>
            </>
          ) : (
            // Step 2 Actions
            <>
              <button
                onClick={goBack}
                disabled={isDeleting}
                className="px-6 py-2 border border-[#E0E0E0] rounded-lg text-[#000000] hover:bg-[#F0F0F0] transition-colors disabled:opacity-50"
              >
                Go Back
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-6 py-2 bg-[#FF6B6B] text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Permanently</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
} 