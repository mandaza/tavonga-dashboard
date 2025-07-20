'use client'

import { useState, useEffect } from 'react'
import { X, Edit, Loader2, Clock, Calendar, MapPin, User, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate, formatTime } from '@/lib/utils'
import { apiClient } from '@/lib/api'
import { Shift as ShiftType, User as UserType } from '@/types'
import toast from 'react-hot-toast'

interface EditShiftModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  shift: ShiftType | null
}

interface FormData {
  carer: string
  date: string
  shift_type: 'morning' | 'afternoon' | 'evening' | 'night' | 'full_day' | 'custom'
  start_time: string
  end_time: string
  break_duration: string
  location: string
  client_name: string
  client_address: string
  notes: string
  special_instructions: string
  emergency_contact: string
}

const shiftTypeOptions = [
  { value: 'morning', label: 'Morning (6AM - 2PM)' },
  { value: 'afternoon', label: 'Afternoon (2PM - 10PM)' },
  { value: 'evening', label: 'Evening (6PM - 12AM)' },
  { value: 'night', label: 'Night (10PM - 6AM)' },
  { value: 'full_day', label: 'Full Day (24 hours)' },
  { value: 'custom', label: 'Custom Hours' }
]

export default function EditShiftModal({ isOpen, onClose, onSuccess, shift }: EditShiftModalProps) {
  const [formData, setFormData] = useState<FormData>({
    carer: '',
    date: '',
    shift_type: 'morning',
    start_time: '',
    end_time: '',
    break_duration: '30',
    location: '',
    client_name: '',
    client_address: '',
    notes: '',
    special_instructions: '',
    emergency_contact: ''
  })

  const [carers, setCarers] = useState<UserType[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingCarers, setIsLoadingCarers] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load carers and populate form when modal opens
  useEffect(() => {
    if (isOpen) {
      loadCarers()
      if (shift) {
        populateForm(shift)
      }
    }
  }, [isOpen, shift])

  const loadCarers = async () => {
    setIsLoadingCarers(true)
    try {
      const response = await apiClient.getUsers({ role: 'carer' })
      setCarers(response.results || [])
    } catch (error) {
      console.error('Error loading carers:', error)
      toast.error('Failed to load carers')
    } finally {
      setIsLoadingCarers(false)
    }
  }

  const populateForm = (shift: ShiftType) => {
    setFormData({
      carer: shift.carer.id || '',
      date: shift.date || '',
      shift_type: shift.shift_type || 'morning',
      start_time: shift.start_time || '',
      end_time: shift.end_time || '',
      break_duration: shift.break_duration ? shift.break_duration.toString() : '30',
      location: shift.location || '',
      client_name: shift.client_name || '',
      client_address: shift.client_address || '',
      notes: shift.notes || '',
      special_instructions: shift.special_instructions || '',
      emergency_contact: shift.emergency_contact || ''
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

    if (!formData.carer) {
      newErrors.carer = 'Carer is required'
    }

    if (!formData.date) {
      newErrors.date = 'Date is required'
    }

    if (!formData.start_time) {
      newErrors.start_time = 'Start time is required'
    }

    if (!formData.end_time) {
      newErrors.end_time = 'End time is required'
    }

    if (formData.start_time && formData.end_time) {
      const start = new Date(`2000-01-01T${formData.start_time}`)
      const end = new Date(`2000-01-01T${formData.end_time}`)
      
      // Handle overnight shifts
      if (formData.shift_type === 'night' || formData.shift_type === 'evening') {
        if (end < start) {
          end.setDate(end.getDate() + 1)
        }
      }
      
      if (end <= start && formData.shift_type !== 'night' && formData.shift_type !== 'evening') {
        newErrors.end_time = 'End time must be after start time'
      }
    }

    if (formData.break_duration && isNaN(Number(formData.break_duration))) {
      newErrors.break_duration = 'Break duration must be a valid number'
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!shift || !validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        carer: formData.carer,
        date: formData.date,
        shift_type: formData.shift_type,
        start_time: formData.start_time,
        end_time: formData.end_time,
        break_duration: formData.break_duration ? parseInt(formData.break_duration) : 0,
        location: formData.location,
        client_name: formData.client_name || undefined,
        client_address: formData.client_address || undefined,
        notes: formData.notes || undefined,
        special_instructions: formData.special_instructions || undefined,
        emergency_contact: formData.emergency_contact || undefined
      }

      await apiClient.updateShift(shift.id, payload)
      toast.success('Shift updated successfully!')
      onSuccess()
      handleClose()
    } catch (error: any) {
      console.error('Error updating shift:', error)
      toast.error(error.message || 'Failed to update shift')
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

  const canEdit = shift && (shift.status === 'scheduled' || shift.status === 'cancelled')

  if (!isOpen || !shift) return null

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
              <h2 className="text-xl font-semibold text-[#000000]">Edit Shift</h2>
              <p className="text-sm text-[#6D6D6D]">Update shift information and assignments</p>
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

        {/* Shift Overview */}
        <div className="p-6 bg-[#F9F5F4] border-b border-gray-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-[#4ECDC4] rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-[#000000]">{shift.carer.full_name}</h3>
                <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getStatusColor(shift.status))}>
                  {shift.status.replace('_', ' ')}
                </span>
                <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getShiftTypeColor(shift.shift_type))}>
                  {shift.shift_type.replace('_', ' ')}
                </span>
              </div>
              <p className="text-sm text-[#6D6D6D] mb-3">{formatDate(shift.date)}</p>
              <div className="flex items-center gap-4 text-sm text-[#6D6D6D]">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatTime(shift.start_time)} - {formatTime(shift.end_time)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{shift.location}</span>
                </div>
                {shift.duration_hours && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{shift.duration_hours}h</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Warning for non-editable shifts */}
        {!canEdit && (
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
              <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
              <div>
                <h4 className="font-semibold text-orange-800 mb-1">Limited Editing</h4>
                <p className="text-sm text-orange-700">
                  This shift is {shift.status}. Only certain fields can be modified for {shift.status} shifts.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#000000]">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#000000] mb-2">
                  Assigned Carer *
                </label>
                <select
                  value={formData.carer}
                  onChange={(e) => handleInputChange('carer', e.target.value)}
                  className={cn(
                    "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4]",
                    errors.carer ? "border-[#FF6B6B]" : "border-[#D3D3D3]",
                    !canEdit && "bg-gray-100"
                  )}
                  disabled={!canEdit || isSubmitting || isLoadingCarers}
                >
                  <option value="">Select a carer</option>
                  {carers.map(carer => (
                    <option key={carer.id} value={carer.id}>
                      {carer.full_name} ({carer.email})
                    </option>
                  ))}
                </select>
                {errors.carer && (
                  <p className="mt-1 text-sm text-[#FF6B6B]">{errors.carer}</p>
                )}
              </div>

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
            </div>

            <div>
              <label className="block text-sm font-medium text-[#000000] mb-2">
                Shift Type *
              </label>
              <select
                value={formData.shift_type}
                onChange={(e) => handleInputChange('shift_type', e.target.value)}
                className={cn(
                  "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4]",
                  "border-[#D3D3D3]",
                  !canEdit && "bg-gray-100"
                )}
                disabled={!canEdit || isSubmitting}
              >
                {shiftTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Time Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#000000]">Time Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#000000] mb-2">
                  Start Time *
                </label>
                <input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => handleInputChange('start_time', e.target.value)}
                  className={cn(
                    "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4]",
                    errors.start_time ? "border-[#FF6B6B]" : "border-[#D3D3D3]",
                    !canEdit && "bg-gray-100"
                  )}
                  disabled={!canEdit || isSubmitting}
                />
                {errors.start_time && (
                  <p className="mt-1 text-sm text-[#FF6B6B]">{errors.start_time}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#000000] mb-2">
                  End Time *
                </label>
                <input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => handleInputChange('end_time', e.target.value)}
                  className={cn(
                    "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4]",
                    errors.end_time ? "border-[#FF6B6B]" : "border-[#D3D3D3]",
                    !canEdit && "bg-gray-100"
                  )}
                  disabled={!canEdit || isSubmitting}
                />
                {errors.end_time && (
                  <p className="mt-1 text-sm text-[#FF6B6B]">{errors.end_time}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#000000] mb-2">
                  Break Duration (minutes)
                </label>
                <input
                  type="number"
                  value={formData.break_duration}
                  onChange={(e) => handleInputChange('break_duration', e.target.value)}
                  className={cn(
                    "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4]",
                    errors.break_duration ? "border-[#FF6B6B]" : "border-[#D3D3D3]"
                  )}
                  placeholder="30"
                  min="0"
                  max="480"
                  disabled={isSubmitting}
                />
                {errors.break_duration && (
                  <p className="mt-1 text-sm text-[#FF6B6B]">{errors.break_duration}</p>
                )}
              </div>
            </div>
          </div>

          {/* Location & Client Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#000000]">Location & Client Details</h3>
            
            <div>
              <label className="block text-sm font-medium text-[#000000] mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Location *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className={cn(
                  "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4]",
                  errors.location ? "border-[#FF6B6B]" : "border-[#D3D3D3]"
                )}
                placeholder="e.g., Main Facility, Client Home, Community Center"
                disabled={isSubmitting}
              />
              {errors.location && (
                <p className="mt-1 text-sm text-[#FF6B6B]">{errors.location}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#000000] mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  Client Name
                </label>
                <input
                  type="text"
                  value={formData.client_name}
                  onChange={(e) => handleInputChange('client_name', e.target.value)}
                  className="w-full px-3 py-2 border border-[#D3D3D3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4]"
                  placeholder="Client name (if applicable)"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#000000] mb-2">
                  Client Address
                </label>
                <input
                  type="text"
                  value={formData.client_address}
                  onChange={(e) => handleInputChange('client_address', e.target.value)}
                  className="w-full px-3 py-2 border border-[#D3D3D3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4]"
                  placeholder="Client address (if applicable)"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#000000] mb-2">
                Emergency Contact
              </label>
              <input
                type="text"
                value={formData.emergency_contact}
                onChange={(e) => handleInputChange('emergency_contact', e.target.value)}
                className="w-full px-3 py-2 border border-[#D3D3D3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4]"
                placeholder="Emergency contact information"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Notes & Instructions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#000000]">Notes & Instructions</h3>
            
            <div>
              <label className="block text-sm font-medium text-[#000000] mb-2">
                Special Instructions
              </label>
              <textarea
                value={formData.special_instructions}
                onChange={(e) => handleInputChange('special_instructions', e.target.value)}
                className="w-full px-3 py-2 border border-[#D3D3D3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4] resize-none"
                placeholder="Any special instructions for this shift"
                rows={3}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#000000] mb-2">
                General Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="w-full px-3 py-2 border border-[#D3D3D3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4] resize-none"
                placeholder="Additional notes about this shift"
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
                  <span>Update Shift</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 