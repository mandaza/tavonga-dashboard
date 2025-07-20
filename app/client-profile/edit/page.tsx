'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import { 
  Users, 
  Calendar,
  Target,
  Activity,
  Heart,
  MapPin,
  Phone,
  Mail,
  Save,
  X,
  Camera,
  Plus,
  Trash2,
  Music,
  Puzzle,
  TreePine,
  Palette,
  Waves,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Mock data for Tavonga's profile
const tavongaProfile = {
  id: 'tavonga_001',
  name: 'Tavonga',
  age: 12,
  dateOfBirth: '2012-03-15',
  gender: 'Male',
  diagnosis: 'Autism Spectrum Disorder',
  startDate: '2023-07-01',
  status: 'active',
  
  // Contact Information
  contact: {
    primaryCarer: 'Sarah Johnson',
    phone: '+1 (555) 123-4567',
    email: 'sarah.johnson@email.com',
    address: '123 Care Street, Melbourne, VIC 3000',
    emergencyContact: 'Michael Johnson',
    emergencyPhone: '+1 (555) 987-6543'
  },
  
  // Personal Information
  personal: {
    description: 'Tavonga is a bright and curious 12-year-old who loves music, puzzles, and spending time outdoors.',
    communicationStyle: 'Non-verbal with some verbal expressions',
    sensoryPreferences: 'Prefers quiet environments, enjoys tactile activities',
    dietaryRestrictions: 'Gluten-free diet',
    allergies: 'None known',
    medications: 'None currently prescribed'
  },
  
  // Interests and Strengths
  interests: [
    { id: 'int_1', name: 'Music & Rhythm', icon: Music, description: 'Loves listening to music and playing with rhythm instruments' },
    { id: 'int_2', name: 'Puzzles', icon: Puzzle, description: 'Enjoys jigsaw puzzles and problem-solving activities' },
    { id: 'int_3', name: 'Nature Walks', icon: TreePine, description: 'Finds peace and joy in outdoor activities' },
    { id: 'int_4', name: 'Art & Drawing', icon: Palette, description: 'Expresses creativity through drawing and painting' },
    { id: 'int_5', name: 'Swimming', icon: Waves, description: 'Enjoys water activities and swimming lessons' }
  ],
  
  // Support Preferences
  supportPreferences: [
    'Prefers quiet environments',
    'Responds well to visual cues',
    'Enjoys routine and structure',
    'Needs time to process information',
    'Benefits from positive reinforcement',
    'Works best in small groups or one-on-one'
  ]
}

export default function EditProfilePage() {
  const [formData, setFormData] = useState({
    // Basic Information
    name: tavongaProfile.name,
    age: tavongaProfile.age,
    dateOfBirth: tavongaProfile.dateOfBirth,
    gender: tavongaProfile.gender,
    diagnosis: tavongaProfile.diagnosis,
    status: tavongaProfile.status,
    
    // Contact Information
    primaryCarer: tavongaProfile.contact.primaryCarer,
    phone: tavongaProfile.contact.phone,
    email: tavongaProfile.contact.email,
    address: tavongaProfile.contact.address,
    emergencyContact: tavongaProfile.contact.emergencyContact,
    emergencyPhone: tavongaProfile.contact.emergencyPhone,
    
    // Personal Information
    description: tavongaProfile.personal.description,
    communicationStyle: tavongaProfile.personal.communicationStyle,
    sensoryPreferences: tavongaProfile.personal.sensoryPreferences,
    dietaryRestrictions: tavongaProfile.personal.dietaryRestrictions,
    allergies: tavongaProfile.personal.allergies,
    medications: tavongaProfile.personal.medications,
    
    // Interests
    interests: [...tavongaProfile.interests],
    
    // Support Preferences
    supportPreferences: [...tavongaProfile.supportPreferences]
  })

  const [newInterest, setNewInterest] = useState({ name: '', description: '' })
  const [newPreference, setNewPreference] = useState('')
  const [activeTab, setActiveTab] = useState('basic')

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleInterestChange = (id: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.map(interest => 
        interest.id === id ? { ...interest, [field]: value } : interest
      )
    }))
  }

  const addInterest = () => {
    if (newInterest.name && newInterest.description) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, {
          id: `int_${Date.now()}`,
          name: newInterest.name,
          description: newInterest.description,
          icon: Music
        }]
      }))
      setNewInterest({ name: '', description: '' })
    }
  }

  const removeInterest = (id: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(interest => interest.id !== id)
    }))
  }

  const addPreference = () => {
    if (newPreference) {
      setFormData(prev => ({
        ...prev,
        supportPreferences: [...prev.supportPreferences, newPreference]
      }))
      setNewPreference('')
    }
  }

  const removePreference = (index: number) => {
    setFormData(prev => ({
      ...prev,
      supportPreferences: prev.supportPreferences.filter((_, i) => i !== index)
    }))
  }

  const handleSave = () => {
    console.log('Saving profile:', formData)
  }

  const tabs = [
    { id: 'basic', label: 'Basic Information', icon: Users },
    { id: 'contact', label: 'Contact Details', icon: Phone },
    { id: 'personal', label: 'Personal Info', icon: Heart },
    { id: 'interests', label: 'Interests', icon: Activity },
    { id: 'support', label: 'Support Preferences', icon: Target }
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Breadcrumbs */}
        <Breadcrumbs items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Client Profile', href: '/client-profile' },
          { label: 'Edit Profile' }
        ]} />

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              Edit Profile
            </h1>
            <p className="text-text-secondary">
              Update Tavonga's information and preferences
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button className="btn-secondary flex items-center gap-2">
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="btn-primary flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 bg-bg-highlight rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
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
        <div className="card p-6">
          {/* Basic Information Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-card-title">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="input-field"
                    placeholder="Enter full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Age
                  </label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
                    className="input-field"
                    placeholder="Enter age"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    className="input-field"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className="input-field"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Diagnosis
                  </label>
                  <input
                    type="text"
                    value={formData.diagnosis}
                    onChange={(e) => handleInputChange('diagnosis', e.target.value)}
                    className="input-field"
                    placeholder="Enter diagnosis"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="input-field"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="paused">Paused</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Contact Information Tab */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-card-title">Contact Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Primary Carer
                  </label>
                  <input
                    type="text"
                    value={formData.primaryCarer}
                    onChange={(e) => handleInputChange('primaryCarer', e.target.value)}
                    className="input-field"
                    placeholder="Enter primary carer name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="input-field"
                    placeholder="Enter phone number"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="input-field"
                    placeholder="Enter email address"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="input-field"
                    placeholder="Enter address"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Emergency Contact
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyContact}
                    onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                    className="input-field"
                    placeholder="Enter emergency contact name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Emergency Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.emergencyPhone}
                    onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                    className="input-field"
                    placeholder="Enter emergency phone number"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Personal Information Tab */}
          {activeTab === 'personal' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-card-title">Personal Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Personal Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="input-field h-32"
                    placeholder="Describe Tavonga's personality, interests, and characteristics"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Communication Style
                    </label>
                    <input
                      type="text"
                      value={formData.communicationStyle}
                      onChange={(e) => handleInputChange('communicationStyle', e.target.value)}
                      className="input-field"
                      placeholder="e.g., Non-verbal with some verbal expressions"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Sensory Preferences
                    </label>
                    <input
                      type="text"
                      value={formData.sensoryPreferences}
                      onChange={(e) => handleInputChange('sensoryPreferences', e.target.value)}
                      className="input-field"
                      placeholder="e.g., Prefers quiet environments"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Dietary Restrictions
                    </label>
                    <input
                      type="text"
                      value={formData.dietaryRestrictions}
                      onChange={(e) => handleInputChange('dietaryRestrictions', e.target.value)}
                      className="input-field"
                      placeholder="e.g., Gluten-free diet"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Allergies
                    </label>
                    <input
                      type="text"
                      value={formData.allergies}
                      onChange={(e) => handleInputChange('allergies', e.target.value)}
                      className="input-field"
                      placeholder="e.g., None known"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Medications
                    </label>
                    <input
                      type="text"
                      value={formData.medications}
                      onChange={(e) => handleInputChange('medications', e.target.value)}
                      className="input-field"
                      placeholder="e.g., None currently prescribed"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Interests Tab */}
          {activeTab === 'interests' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-card-title">Interests & Strengths</h3>
              
              <div className="space-y-4">
                {formData.interests.map((interest) => (
                  <div key={interest.id} className="p-4 bg-bg-highlight rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">
                          Interest Name
                        </label>
                        <input
                          type="text"
                          value={interest.name}
                          onChange={(e) => handleInterestChange(interest.id, 'name', e.target.value)}
                          className="input-field"
                          placeholder="Enter interest name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">
                          Description
                        </label>
                        <input
                          type="text"
                          value={interest.description}
                          onChange={(e) => handleInterestChange(interest.id, 'description', e.target.value)}
                          className="input-field"
                          placeholder="Enter description"
                        />
                      </div>
                      
                      <div className="flex items-end">
                        <button
                          onClick={() => removeInterest(interest.id)}
                          className="btn-secondary flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="p-4 border-2 border-dashed border-border-default rounded-lg">
                  <h4 className="text-sm font-medium text-card-title mb-3">Add New Interest</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Interest Name
                      </label>
                      <input
                        type="text"
                        value={newInterest.name}
                        onChange={(e) => setNewInterest(prev => ({ ...prev, name: e.target.value }))}
                        className="input-field"
                        placeholder="Enter interest name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Description
                      </label>
                      <input
                        type="text"
                        value={newInterest.description}
                        onChange={(e) => setNewInterest(prev => ({ ...prev, description: e.target.value }))}
                        className="input-field"
                        placeholder="Enter description"
                      />
                    </div>
                  </div>
                  
                  <button
                    onClick={addInterest}
                    className="btn-primary flex items-center gap-2 mt-4"
                  >
                    <Plus className="w-4 h-4" />
                    Add Interest
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Support Preferences Tab */}
          {activeTab === 'support' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-card-title">Support Preferences</h3>
              
              <div className="space-y-4">
                {formData.supportPreferences.map((preference, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 bg-bg-highlight rounded-lg">
                    <input
                      type="text"
                      value={preference}
                      onChange={(e) => {
                        const newPreferences = [...formData.supportPreferences]
                        newPreferences[index] = e.target.value
                        setFormData(prev => ({ ...prev, supportPreferences: newPreferences }))
                      }}
                      className="input-field flex-1"
                      placeholder="Enter support preference"
                    />
                    <button
                      onClick={() => removePreference(index)}
                      className="btn-secondary flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </button>
                  </div>
                ))}
                
                <div className="flex items-center gap-4 p-3 border-2 border-dashed border-border-default rounded-lg">
                  <input
                    type="text"
                    value={newPreference}
                    onChange={(e) => setNewPreference(e.target.value)}
                    className="input-field flex-1"
                    placeholder="Enter new support preference"
                  />
                  <button
                    onClick={addPreference}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
} 