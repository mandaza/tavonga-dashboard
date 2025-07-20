'use client'

import { useState } from 'react'
import { 
  X, 
  User, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  Stethoscope, 
  Heart, 
  Brain, 
  Users,
  Save,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { apiClient } from '@/lib/api'
import toast from 'react-hot-toast'

interface AddClientModalProps {
  isOpen: boolean
  onClose: () => void
  onClientAdded: (client: any) => void
}

interface ClientFormData {
  first_name: string
  middle_name: string
  last_name: string
  preferred_name: string
  date_of_birth: string
  gender: string
  address: string
  phone: string
  email: string
  diagnosis: string
  secondary_diagnoses: string
  allergies: string
  medications: string
  medical_notes: string
  care_level: string
  interests: string
  likes: string
  dislikes: string
  communication_preferences: string
  behavioral_triggers: string
  calming_strategies: string
  notes: string
  client_id: string
}

export default function AddClientModal({ isOpen, onClose, onClientAdded }: AddClientModalProps) {
  const [activeTab, setActiveTab] = useState('basic')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const [formData, setFormData] = useState<ClientFormData>({
    first_name: '',
    middle_name: '',
    last_name: '',
    preferred_name: '',
    date_of_birth: '',
    gender: 'prefer_not_to_say',
    address: '',
    phone: '',
    email: '',
    diagnosis: '',
    secondary_diagnoses: '',
    allergies: '',
    medications: '',
    medical_notes: '',
    care_level: 'medium',
    interests: '',
    likes: '',
    dislikes: '',
    communication_preferences: '',
    behavioral_triggers: '',
    calming_strategies: '',
    notes: '',
    client_id: ''
  })

  const handleInputChange = (field: keyof ClientFormData, value: string) => {
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
    
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required'
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required'
    }
    if (!formData.date_of_birth) {
      newErrors.date_of_birth = 'Date of birth is required'
    }
    if (!formData.diagnosis.trim()) {
      newErrors.diagnosis = 'Primary diagnosis is required'
    }
    if (!formData.client_id.trim()) {
      newErrors.client_id = 'Client ID is required'
    }

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
      // Convert string arrays to actual arrays
      const clientData = {
        ...formData,
        behavioral_triggers: formData.behavioral_triggers ? 
          formData.behavioral_triggers.split(',').map(s => s.trim()).filter(s => s) : [],
        calming_strategies: formData.calming_strategies ? 
          formData.calming_strategies.split(',').map(s => s.trim()).filter(s => s) : []
      }
      
      const newClient = await apiClient.createClient(clientData)
      onClientAdded(newClient)
      toast.success('Client created successfully!')
      handleClose()
    } catch (error: any) {
      toast.error(error.message || 'Failed to create client')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setFormData({
      first_name: '',
      middle_name: '',
      last_name: '',
      preferred_name: '',
      date_of_birth: '',
      gender: 'prefer_not_to_say',
      address: '',
      phone: '',
      email: '',
      diagnosis: '',
      secondary_diagnoses: '',
      allergies: '',
      medications: '',
      medical_notes: '',
      care_level: 'medium',
      interests: '',
      likes: '',
      dislikes: '',
      communication_preferences: '',
      behavioral_triggers: '',
      calming_strategies: '',
      notes: '',
      client_id: ''
    })
    setErrors({})
    setActiveTab('basic')
    onClose()
  }

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: User },
    { id: 'medical', label: 'Medical', icon: Stethoscope },
    { id: 'personal', label: 'Personal', icon: Heart },
    { id: 'behavioral', label: 'Behavioral', icon: Brain }
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="card max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <form onSubmit={handleSubmit} className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-card-border">
            <h2 className="text-xl font-bold text-card-title">Add New Client</h2>
            <button
              type="button"
              onClick={handleClose}
              className="p-2 hover:bg-bg-highlight rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1 bg-bg-highlight p-1 m-6 mb-0 rounded-lg">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors flex-1 justify-center",
                  activeTab === tab.id 
                    ? "bg-bg-primary text-text-primary shadow-sm" 
                    : "text-text-secondary hover:text-text-primary"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-auto p-6">
            {/* Basic Information Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                      className={cn(
                        "input-field",
                        errors.first_name && "border-red-500"
                      )}
                      placeholder="Enter first name"
                      disabled={isSubmitting}
                    />
                    {errors.first_name && (
                      <p className="mt-1 text-sm text-red-500">{errors.first_name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
                      className={cn(
                        "input-field",
                        errors.last_name && "border-red-500"
                      )}
                      placeholder="Enter last name"
                      disabled={isSubmitting}
                    />
                    {errors.last_name && (
                      <p className="mt-1 text-sm text-red-500">{errors.last_name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Middle Name
                    </label>
                    <input
                      type="text"
                      value={formData.middle_name}
                      onChange={(e) => handleInputChange('middle_name', e.target.value)}
                      className="input-field"
                      placeholder="Enter middle name (optional)"
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Preferred Name
                    </label>
                    <input
                      type="text"
                      value={formData.preferred_name}
                      onChange={(e) => handleInputChange('preferred_name', e.target.value)}
                      className="input-field"
                      placeholder="What they like to be called"
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Client ID *
                    </label>
                    <input
                      type="text"
                      value={formData.client_id}
                      onChange={(e) => handleInputChange('client_id', e.target.value)}
                      className={cn(
                        "input-field",
                        errors.client_id && "border-red-500"
                      )}
                      placeholder="e.g. CLI-TV-001"
                      disabled={isSubmitting}
                    />
                    {errors.client_id && (
                      <p className="mt-1 text-sm text-red-500">{errors.client_id}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                      className={cn(
                        "input-field",
                        errors.date_of_birth && "border-red-500"
                      )}
                      disabled={isSubmitting}
                    />
                    {errors.date_of_birth && (
                      <p className="mt-1 text-sm text-red-500">{errors.date_of_birth}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Gender
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      className="input-field"
                      disabled={isSubmitting}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Care Level
                    </label>
                    <select
                      value={formData.care_level}
                      onChange={(e) => handleInputChange('care_level', e.target.value)}
                      className="input-field"
                      disabled={isSubmitting}
                    >
                      <option value="low">Low Support</option>
                      <option value="medium">Medium Support</option>
                      <option value="high">High Support</option>
                      <option value="critical">Critical Support</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="input-field"
                    placeholder="Enter phone number"
                    disabled={isSubmitting}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="input-field"
                    placeholder="Enter email address"
                    disabled={isSubmitting}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Address
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="input-field"
                    rows={3}
                    placeholder="Enter address"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            )}

            {/* Medical Information Tab */}
            {activeTab === 'medical' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Primary Diagnosis *
                  </label>
                  <textarea
                    value={formData.diagnosis}
                    onChange={(e) => handleInputChange('diagnosis', e.target.value)}
                    className={cn(
                      "input-field",
                      errors.diagnosis && "border-red-500"
                    )}
                    rows={3}
                    placeholder="Enter primary diagnosis and conditions"
                    disabled={isSubmitting}
                  />
                  {errors.diagnosis && (
                    <p className="mt-1 text-sm text-red-500">{errors.diagnosis}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Secondary Diagnoses
                  </label>
                  <textarea
                    value={formData.secondary_diagnoses}
                    onChange={(e) => handleInputChange('secondary_diagnoses', e.target.value)}
                    className="input-field"
                    rows={3}
                    placeholder="Additional diagnoses or conditions"
                    disabled={isSubmitting}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Allergies
                  </label>
                  <textarea
                    value={formData.allergies}
                    onChange={(e) => handleInputChange('allergies', e.target.value)}
                    className="input-field"
                    rows={3}
                    placeholder="Known allergies and reactions"
                    disabled={isSubmitting}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Current Medications
                  </label>
                  <textarea
                    value={formData.medications}
                    onChange={(e) => handleInputChange('medications', e.target.value)}
                    className="input-field"
                    rows={3}
                    placeholder="Current medications and dosages"
                    disabled={isSubmitting}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Medical Notes
                  </label>
                  <textarea
                    value={formData.medical_notes}
                    onChange={(e) => handleInputChange('medical_notes', e.target.value)}
                    className="input-field"
                    rows={3}
                    placeholder="Additional medical information"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            )}

            {/* Personal Information Tab */}
            {activeTab === 'personal' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Interests & Hobbies
                  </label>
                  <textarea
                    value={formData.interests}
                    onChange={(e) => handleInputChange('interests', e.target.value)}
                    className="input-field"
                    rows={3}
                    placeholder="Client's interests and hobbies"
                    disabled={isSubmitting}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Likes
                  </label>
                  <textarea
                    value={formData.likes}
                    onChange={(e) => handleInputChange('likes', e.target.value)}
                    className="input-field"
                    rows={3}
                    placeholder="Things the client enjoys"
                    disabled={isSubmitting}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Dislikes
                  </label>
                  <textarea
                    value={formData.dislikes}
                    onChange={(e) => handleInputChange('dislikes', e.target.value)}
                    className="input-field"
                    rows={3}
                    placeholder="Things the client dislikes or finds distressing"
                    disabled={isSubmitting}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Communication Preferences
                  </label>
                  <textarea
                    value={formData.communication_preferences}
                    onChange={(e) => handleInputChange('communication_preferences', e.target.value)}
                    className="input-field"
                    rows={3}
                    placeholder="How the client prefers to communicate"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            )}

            {/* Behavioral Information Tab */}
            {activeTab === 'behavioral' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Behavioral Triggers
                  </label>
                  <textarea
                    value={formData.behavioral_triggers}
                    onChange={(e) => handleInputChange('behavioral_triggers', e.target.value)}
                    className="input-field"
                    rows={3}
                    placeholder="Enter triggers separated by commas"
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-text-muted mt-1">
                    Separate multiple triggers with commas (e.g. loud noises, crowds, bright lights)
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Calming Strategies
                  </label>
                  <textarea
                    value={formData.calming_strategies}
                    onChange={(e) => handleInputChange('calming_strategies', e.target.value)}
                    className="input-field"
                    rows={3}
                    placeholder="Enter strategies separated by commas"
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-text-muted mt-1">
                    Separate multiple strategies with commas (e.g. deep breathing, music, quiet space)
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    General Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    className="input-field"
                    rows={4}
                    placeholder="Any additional notes about the client"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-card-border">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary flex items-center gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Create Client
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 