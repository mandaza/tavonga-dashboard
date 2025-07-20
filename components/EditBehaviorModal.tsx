'use client'

import { useState, useEffect } from 'react'
import { X, Edit, Loader2, AlertTriangle, Camera, Video, MapPin, Clock, Activity, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { apiClient } from '@/lib/api'
import { User as UserType, Behavior } from '@/types'
import toast from 'react-hot-toast'

interface EditBehaviorModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  behavior: Behavior | null
}

interface FormData {
  user: string
  date: string
  time: string
  location: 'home' | 'school' | 'community' | 'therapy' | 'transport' | 'other'
  specific_location: string
  activity_before: string
  behavior_type: 'aggression' | 'self_injury' | 'property_damage' | 'elopement' | 'non_compliance' | 'disruption' | 'other'
  behaviors: string[]
  warning_signs: string[]
  duration_minutes: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  harm_to_self: boolean
  harm_to_others: boolean
  property_damage: boolean
  damage_description: string
  intervention_used: string
  intervention_effective: boolean
  intervention_notes: string
  follow_up_required: boolean
  follow_up_notes: string
  notes: string
  triggers_identified: string[]
}

const locationOptions = [
  { value: 'home', label: 'Home' },
  { value: 'school', label: 'School' },
  { value: 'community', label: 'Community' },
  { value: 'therapy', label: 'Therapy' },
  { value: 'transport', label: 'Transport' },
  { value: 'other', label: 'Other' }
]

const behaviorTypeOptions = [
  { value: 'aggression', label: 'Aggression' },
  { value: 'self_injury', label: 'Self Injury' },
  { value: 'property_damage', label: 'Property Damage' },
  { value: 'elopement', label: 'Elopement' },
  { value: 'non_compliance', label: 'Non Compliance' },
  { value: 'disruption', label: 'Disruption' },
  { value: 'other', label: 'Other' }
]

const severityOptions = [
  { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800' }
]

const commonBehaviors = [
  'Hitting', 'Kicking', 'Biting', 'Scratching', 'Throwing objects', 'Spitting',
  'Verbal aggression', 'Screaming', 'Crying', 'Self-hitting', 'Head banging',
  'Scratching self', 'Running away', 'Hiding', 'Refusing instructions',
  'Destroying property', 'Making noise', 'Interrupting'
]

const commonTriggers = [
  'Loud noises', 'Change in routine', 'Denied request', 'Frustration',
  'Overstimulation', 'Fatigue', 'Hunger', 'Social pressure', 'Confusion',
  'Physical discomfort', 'Transition between activities', 'Crowded spaces'
]

const commonWarnings = [
  'Increased agitation', 'Restlessness', 'Verbal complaints', 'Fidgeting',
  'Facial expressions changes', 'Repetitive movements', 'Withdrawal',
  'Increased volume', 'Clenched fists', 'Pacing', 'Difficulty following instructions'
]

export default function EditBehaviorModal({ isOpen, onClose, onSuccess, behavior }: EditBehaviorModalProps) {
  const [formData, setFormData] = useState<FormData>({
    user: '',
    date: '',
    time: '',
    location: 'home',
    specific_location: '',
    activity_before: '',
    behavior_type: 'aggression',
    behaviors: [],
    warning_signs: [],
    duration_minutes: '',
    severity: 'medium',
    harm_to_self: false,
    harm_to_others: false,
    property_damage: false,
    damage_description: '',
    intervention_used: '',
    intervention_effective: false,
    intervention_notes: '',
    follow_up_required: false,
    follow_up_notes: '',
    notes: '',
    triggers_identified: []
  })

  const [users, setUsers] = useState<UserType[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [newBehavior, setNewBehavior] = useState('')
  const [newTrigger, setNewTrigger] = useState('')
  const [newWarning, setNewWarning] = useState('')

  // Load behavior data when modal opens
  useEffect(() => {
    if (isOpen && behavior) {
      loadUsers()
      setFormData({
        user: behavior.user?.id || '',
        date: behavior.date || '',
        time: behavior.time || '',
        location: behavior.location || 'home',
        specific_location: behavior.specific_location || '',
        activity_before: behavior.activity_before || '',
        behavior_type: behavior.behavior_type || 'aggression',
        behaviors: behavior.behaviors || [],
        warning_signs: behavior.warning_signs || [],
        duration_minutes: behavior.duration_minutes ? String(behavior.duration_minutes) : '',
        severity: behavior.severity || 'medium',
        harm_to_self: behavior.harm_to_self || false,
        harm_to_others: behavior.harm_to_others || false,
        property_damage: behavior.property_damage || false,
        damage_description: behavior.damage_description || '',
        intervention_used: behavior.intervention_used || '',
        intervention_effective: behavior.intervention_effective || false,
        intervention_notes: behavior.intervention_notes || '',
        follow_up_required: behavior.follow_up_required || false,
        follow_up_notes: behavior.follow_up_notes || '',
        notes: behavior.notes || '',
        triggers_identified: behavior.triggers_identified || []
      })
    }
  }, [isOpen, behavior])

  const loadUsers = async () => {
    setIsLoadingUsers(true)
    try {
      const response = await apiClient.getUsers()
      setUsers(response.results || [])
    } catch (error) {
      console.error('Error loading users:', error)
      toast.error('Failed to load users')
    } finally {
      setIsLoadingUsers(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string | string[] | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleArrayToggle = (field: 'behaviors' | 'warning_signs' | 'triggers_identified', item: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter(i => i !== item)
        : [...prev[field], item]
    }))
  }

  const addCustomItem = (field: 'behaviors' | 'warning_signs' | 'triggers_identified', item: string) => {
    if (item.trim() && !formData[field].includes(item.trim())) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], item.trim()]
      }))
    }
  }

  const removeItem = (field: 'behaviors' | 'warning_signs' | 'triggers_identified', item: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter(i => i !== item)
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.user) {
      newErrors.user = 'User is required'
    }

    if (!formData.date) {
      newErrors.date = 'Date is required'
    }

    if (!formData.time) {
      newErrors.time = 'Time is required'
    }

    if (formData.behaviors.length === 0) {
      newErrors.behaviors = 'At least one behavior must be selected'
    }

    if (!formData.intervention_used.trim()) {
      newErrors.intervention_used = 'Intervention used is required'
    }

    if (formData.duration_minutes && isNaN(Number(formData.duration_minutes))) {
      newErrors.duration_minutes = 'Duration must be a valid number'
    }

    if (formData.property_damage && !formData.damage_description.trim()) {
      newErrors.damage_description = 'Damage description is required when property damage occurred'
    }

    if (formData.follow_up_required && !formData.follow_up_notes.trim()) {
      newErrors.follow_up_notes = 'Follow-up notes are required when follow-up is needed'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm() || !behavior) {
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        user: formData.user,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        specific_location: formData.specific_location || undefined,
        activity_before: formData.activity_before || undefined,
        behavior_type: formData.behavior_type,
        behaviors: formData.behaviors,
        warning_signs: formData.warning_signs,
        duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : undefined,
        severity: formData.severity,
        harm_to_self: formData.harm_to_self,
        harm_to_others: formData.harm_to_others,
        property_damage: formData.property_damage,
        damage_description: formData.damage_description || undefined,
        intervention_used: formData.intervention_used,
        intervention_effective: formData.intervention_effective,
        intervention_notes: formData.intervention_notes || undefined,
        follow_up_required: formData.follow_up_required,
        follow_up_notes: formData.follow_up_notes || undefined,
        notes: formData.notes || undefined,
        triggers_identified: formData.triggers_identified,
        is_critical: formData.severity === 'critical',
        requires_immediate_attention: formData.severity === 'critical' || formData.follow_up_required
      }

      await apiClient.updateBehavior(behavior.id, payload)
      toast.success('Behavior log updated successfully!')
      onSuccess()
      handleClose()
    } catch (error: any) {
      console.error('Error updating behavior:', error)
      toast.error(error.message || 'Failed to update behavior log')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setErrors({})
      setNewBehavior('')
      setNewTrigger('')
      setNewWarning('')
      onClose()
    }
  }

  if (!isOpen || !behavior) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[20px] w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#4ECDC4] rounded-lg flex items-center justify-center">
              <Edit className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#000000]">Edit Behavior Log</h2>
              <p className="text-sm text-[#6D6D6D]">Update behavior incident details</p>
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
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#000000]">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#000000] mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  User *
                </label>
                <select
                  value={formData.user}
                  onChange={(e) => handleInputChange('user', e.target.value)}
                  className={cn(
                    "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4]",
                    errors.user ? "border-[#FF6B6B]" : "border-[#D3D3D3]"
                  )}
                  disabled={isSubmitting || isLoadingUsers}
                >
                  <option value="">Select user</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.full_name || `${user.first_name} ${user.last_name}`}
                    </option>
                  ))}
                </select>
                {errors.user && (
                  <p className="mt-1 text-sm text-[#FF6B6B]">{errors.user}</p>
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
                  Time *
                </label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                  className={cn(
                    "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4]",
                    errors.time ? "border-[#FF6B6B]" : "border-[#D3D3D3]"
                  )}
                  disabled={isSubmitting}
                />
                {errors.time && (
                  <p className="mt-1 text-sm text-[#FF6B6B]">{errors.time}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#000000] mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Location *
                </label>
                <select
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-[#D3D3D3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4]"
                  disabled={isSubmitting}
                >
                  {locationOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#000000] mb-2">
                  Specific Location
                </label>
                <input
                  type="text"
                  value={formData.specific_location}
                  onChange={(e) => handleInputChange('specific_location', e.target.value)}
                  className="w-full px-3 py-2 border border-[#D3D3D3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4]"
                  placeholder="e.g., Living room, Classroom 2A"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#000000] mb-2">
                <Activity className="w-4 h-4 inline mr-1" />
                Activity Before
              </label>
              <input
                type="text"
                value={formData.activity_before}
                onChange={(e) => handleInputChange('activity_before', e.target.value)}
                className="w-full px-3 py-2 border border-[#D3D3D3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4]"
                placeholder="What was happening before the behavior?"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Behavior Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#000000]">Behavior Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#000000] mb-2">
                  Behavior Type *
                </label>
                <select
                  value={formData.behavior_type}
                  onChange={(e) => handleInputChange('behavior_type', e.target.value)}
                  className="w-full px-3 py-2 border border-[#D3D3D3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4]"
                  disabled={isSubmitting}
                >
                  {behaviorTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#000000] mb-2">
                  Severity *
                </label>
                <select
                  value={formData.severity}
                  onChange={(e) => handleInputChange('severity', e.target.value)}
                  className="w-full px-3 py-2 border border-[#D3D3D3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4]"
                  disabled={isSubmitting}
                >
                  {severityOptions.map(option => (
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
                  value={formData.duration_minutes}
                  onChange={(e) => handleInputChange('duration_minutes', e.target.value)}
                  className={cn(
                    "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4]",
                    errors.duration_minutes ? "border-[#FF6B6B]" : "border-[#D3D3D3]"
                  )}
                  placeholder="5"
                  min="1"
                  disabled={isSubmitting}
                />
                {errors.duration_minutes && (
                  <p className="mt-1 text-sm text-[#FF6B6B]">{errors.duration_minutes}</p>
                )}
              </div>
            </div>

            {/* Specific Behaviors */}
            <div>
              <label className="block text-sm font-medium text-[#000000] mb-2">
                Specific Behaviors *
              </label>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {commonBehaviors.map(behavior => (
                    <button
                      key={behavior}
                      type="button"
                      onClick={() => handleArrayToggle('behaviors', behavior)}
                      className={cn(
                        "px-3 py-1 text-sm rounded-full border transition-colors",
                        formData.behaviors.includes(behavior)
                          ? "bg-[#4ECDC4] text-white border-[#4ECDC4]"
                          : "bg-white text-[#6D6D6D] border-[#D3D3D3] hover:border-[#4ECDC4]"
                      )}
                      disabled={isSubmitting}
                    >
                      {behavior}
                    </button>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newBehavior}
                    onChange={(e) => setNewBehavior(e.target.value)}
                    placeholder="Add custom behavior"
                    className="flex-1 px-3 py-2 border border-[#D3D3D3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4]"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      addCustomItem('behaviors', newBehavior)
                      setNewBehavior('')
                    }}
                    className="px-4 py-2 bg-[#4ECDC4] text-white rounded-lg hover:bg-[#3DB9B2] transition-colors"
                    disabled={isSubmitting || !newBehavior.trim()}
                  >
                    Add
                  </button>
                </div>

                {formData.behaviors.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {formData.behaviors.map(behavior => (
                      <span key={behavior} className="inline-flex items-center gap-1 px-2 py-1 bg-[#4ECDC4] text-white text-sm rounded-full">
                        {behavior}
                        <button
                          type="button"
                          onClick={() => removeItem('behaviors', behavior)}
                          className="text-white hover:text-red-200 ml-1"
                          disabled={isSubmitting}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                
                {errors.behaviors && (
                  <p className="mt-1 text-sm text-[#FF6B6B]">{errors.behaviors}</p>
                )}
              </div>
            </div>

            {/* Warning Signs */}
            <div>
              <label className="block text-sm font-medium text-[#000000] mb-2">
                Warning Signs
              </label>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {commonWarnings.map(warning => (
                    <button
                      key={warning}
                      type="button"
                      onClick={() => handleArrayToggle('warning_signs', warning)}
                      className={cn(
                        "px-3 py-1 text-sm rounded-full border transition-colors",
                        formData.warning_signs.includes(warning)
                          ? "bg-[#4ECDC4] text-white border-[#4ECDC4]"
                          : "bg-white text-[#6D6D6D] border-[#D3D3D3] hover:border-[#4ECDC4]"
                      )}
                      disabled={isSubmitting}
                    >
                      {warning}
                    </button>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newWarning}
                    onChange={(e) => setNewWarning(e.target.value)}
                    placeholder="Add custom warning sign"
                    className="flex-1 px-3 py-2 border border-[#D3D3D3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4]"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      addCustomItem('warning_signs', newWarning)
                      setNewWarning('')
                    }}
                    className="px-4 py-2 bg-[#4ECDC4] text-white rounded-lg hover:bg-[#3DB9B2] transition-colors"
                    disabled={isSubmitting || !newWarning.trim()}
                  >
                    Add
                  </button>
                </div>

                {formData.warning_signs.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {formData.warning_signs.map(warning => (
                      <span key={warning} className="inline-flex items-center gap-1 px-2 py-1 bg-[#4ECDC4] text-white text-sm rounded-full">
                        {warning}
                        <button
                          type="button"
                          onClick={() => removeItem('warning_signs', warning)}
                          className="text-white hover:text-red-200 ml-1"
                          disabled={isSubmitting}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Triggers */}
            <div>
              <label className="block text-sm font-medium text-[#000000] mb-2">
                Triggers Identified
              </label>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {commonTriggers.map(trigger => (
                    <button
                      key={trigger}
                      type="button"
                      onClick={() => handleArrayToggle('triggers_identified', trigger)}
                      className={cn(
                        "px-3 py-1 text-sm rounded-full border transition-colors",
                        formData.triggers_identified.includes(trigger)
                          ? "bg-[#4ECDC4] text-white border-[#4ECDC4]"
                          : "bg-white text-[#6D6D6D] border-[#D3D3D3] hover:border-[#4ECDC4]"
                      )}
                      disabled={isSubmitting}
                    >
                      {trigger}
                    </button>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTrigger}
                    onChange={(e) => setNewTrigger(e.target.value)}
                    placeholder="Add custom trigger"
                    className="flex-1 px-3 py-2 border border-[#D3D3D3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4]"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      addCustomItem('triggers_identified', newTrigger)
                      setNewTrigger('')
                    }}
                    className="px-4 py-2 bg-[#4ECDC4] text-white rounded-lg hover:bg-[#3DB9B2] transition-colors"
                    disabled={isSubmitting || !newTrigger.trim()}
                  >
                    Add
                  </button>
                </div>

                {formData.triggers_identified.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {formData.triggers_identified.map(trigger => (
                      <span key={trigger} className="inline-flex items-center gap-1 px-2 py-1 bg-[#4ECDC4] text-white text-sm rounded-full">
                        {trigger}
                        <button
                          type="button"
                          onClick={() => removeItem('triggers_identified', trigger)}
                          className="text-white hover:text-red-200 ml-1"
                          disabled={isSubmitting}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Risk Assessment */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#000000]">Risk Assessment</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="harm_to_self"
                  checked={formData.harm_to_self}
                  onChange={(e) => handleInputChange('harm_to_self', e.target.checked)}
                  className="w-4 h-4 text-[#4ECDC4] rounded focus:ring-[#4ECDC4]"
                  disabled={isSubmitting}
                />
                <label htmlFor="harm_to_self" className="text-sm text-[#000000]">
                  Harm to Self
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="harm_to_others"
                  checked={formData.harm_to_others}
                  onChange={(e) => handleInputChange('harm_to_others', e.target.checked)}
                  className="w-4 h-4 text-[#4ECDC4] rounded focus:ring-[#4ECDC4]"
                  disabled={isSubmitting}
                />
                <label htmlFor="harm_to_others" className="text-sm text-[#000000]">
                  Harm to Others
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="property_damage"
                  checked={formData.property_damage}
                  onChange={(e) => handleInputChange('property_damage', e.target.checked)}
                  className="w-4 h-4 text-[#4ECDC4] rounded focus:ring-[#4ECDC4]"
                  disabled={isSubmitting}
                />
                <label htmlFor="property_damage" className="text-sm text-[#000000]">
                  Property Damage
                </label>
              </div>
            </div>

            {formData.property_damage && (
              <div>
                <label className="block text-sm font-medium text-[#000000] mb-2">
                  Damage Description *
                </label>
                <textarea
                  value={formData.damage_description}
                  onChange={(e) => handleInputChange('damage_description', e.target.value)}
                  className={cn(
                    "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4] resize-none",
                    errors.damage_description ? "border-[#FF6B6B]" : "border-[#D3D3D3]"
                  )}
                  placeholder="Describe the property damage"
                  rows={2}
                  disabled={isSubmitting}
                />
                {errors.damage_description && (
                  <p className="mt-1 text-sm text-[#FF6B6B]">{errors.damage_description}</p>
                )}
              </div>
            )}
          </div>

          {/* Intervention */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#000000]">Intervention</h3>
            
            <div>
              <label className="block text-sm font-medium text-[#000000] mb-2">
                Intervention Used *
              </label>
              <textarea
                value={formData.intervention_used}
                onChange={(e) => handleInputChange('intervention_used', e.target.value)}
                className={cn(
                  "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4] resize-none",
                  errors.intervention_used ? "border-[#FF6B6B]" : "border-[#D3D3D3]"
                )}
                placeholder="Describe the intervention that was used"
                rows={3}
                disabled={isSubmitting}
              />
              {errors.intervention_used && (
                <p className="mt-1 text-sm text-[#FF6B6B]">{errors.intervention_used}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="intervention_effective"
                  checked={formData.intervention_effective}
                  onChange={(e) => handleInputChange('intervention_effective', e.target.checked)}
                  className="w-4 h-4 text-[#4ECDC4] rounded focus:ring-[#4ECDC4]"
                  disabled={isSubmitting}
                />
                <label htmlFor="intervention_effective" className="text-sm text-[#000000]">
                  Intervention was effective
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="follow_up_required"
                  checked={formData.follow_up_required}
                  onChange={(e) => handleInputChange('follow_up_required', e.target.checked)}
                  className="w-4 h-4 text-[#4ECDC4] rounded focus:ring-[#4ECDC4]"
                  disabled={isSubmitting}
                />
                <label htmlFor="follow_up_required" className="text-sm text-[#000000]">
                  Follow-up required
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#000000] mb-2">
                Intervention Notes
              </label>
              <textarea
                value={formData.intervention_notes}
                onChange={(e) => handleInputChange('intervention_notes', e.target.value)}
                className="w-full px-3 py-2 border border-[#D3D3D3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4] resize-none"
                placeholder="Additional notes about the intervention"
                rows={2}
                disabled={isSubmitting}
              />
            </div>

            {formData.follow_up_required && (
              <div>
                <label className="block text-sm font-medium text-[#000000] mb-2">
                  Follow-up Notes *
                </label>
                <textarea
                  value={formData.follow_up_notes}
                  onChange={(e) => handleInputChange('follow_up_notes', e.target.value)}
                  className={cn(
                    "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4] resize-none",
                    errors.follow_up_notes ? "border-[#FF6B6B]" : "border-[#D3D3D3]"
                  )}
                  placeholder="Describe the follow-up actions required"
                  rows={2}
                  disabled={isSubmitting}
                />
                {errors.follow_up_notes && (
                  <p className="mt-1 text-sm text-[#FF6B6B]">{errors.follow_up_notes}</p>
                )}
              </div>
            )}
          </div>

          {/* Additional Notes */}
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
                placeholder="Any additional notes or observations"
                rows={3}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 border border-[#D3D3D3] text-[#6D6D6D] rounded-lg hover:bg-[#F9F5F4] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-[#4ECDC4] text-white rounded-lg hover:bg-[#3DB9B2] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4" />
                  Update Behavior Log
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 