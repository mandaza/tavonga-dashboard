'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import { 
  User, 
  Calendar,
  MapPin,
  Phone,
  Mail,
  Save,
  X,
  Camera,
  Award,
  Shield,
  Settings,
  Activity,
  Users,
  FileText,
  Star,
  BadgeCheck,
  Briefcase,
  UserCheck,
  Heart,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'
import toast from 'react-hot-toast'

// TypeScript interfaces
interface FormData {
  first_name: string
  last_name: string
  email: string
  phone: string
  address: string
  emergency_contact: string
  emergency_phone: string
  date_of_birth: string
}

interface PasswordData {
  current_password: string
  new_password: string
  confirm_password: string
}

interface ShowPasswords {
  current: boolean
  new: boolean
  confirm: boolean
}

export default function EditUserProfilePage() {
  const { user, loading, updateProfile } = useAuth()
  const router = useRouter()
  
  const [formData, setFormData] = useState<FormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    emergency_contact: '',
    emergency_phone: '',
    date_of_birth: ''
  })

  const [activeTab, setActiveTab] = useState('basic')
  const [showPasswordSection, setShowPasswordSection] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const [passwordData, setPasswordData] = useState<PasswordData>({
    current_password: '',
    new_password: '',
    confirm_password: ''
  })
  
  const [showPasswords, setShowPasswords] = useState<ShowPasswords>({
    current: false,
    new: false,
    confirm: false
  })

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        emergency_contact: user.emergency_contact || '',
        emergency_phone: user.emergency_phone || '',
        date_of_birth: user.date_of_birth || ''
      })
    }
  }, [user])

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
    
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required'
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSaveProfile = async () => {
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      await updateProfile(formData)
      toast.success('Profile updated successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile')
    } finally {
      setIsSubmitting(false)
    }
  }

  const validatePassword = () => {
    const newErrors: Record<string, string> = {}
    
    if (!passwordData.current_password) {
      newErrors.current_password = 'Current password is required'
    }
    if (!passwordData.new_password) {
      newErrors.new_password = 'New password is required'
    } else if (passwordData.new_password.length < 8) {
      newErrors.new_password = 'Password must be at least 8 characters'
    }
    if (passwordData.new_password !== passwordData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChangePassword = async () => {
    if (!validatePassword()) {
      return
    }

    setIsSubmitting(true)
    try {
      await apiClient.changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      })
      
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' })
      setShowPasswordSection(false)
      toast.success('Password updated successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password')
    } finally {
      setIsSubmitting(false)
    }
  }

  const togglePasswordVisibility = (field: keyof ShowPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const handleCancel = () => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        emergency_contact: user.emergency_contact || '',
        emergency_phone: user.emergency_phone || '',
        date_of_birth: user.date_of_birth || ''
      })
      setErrors({})
    }
    router.push('/profile')
  }

  const tabs = [
    { id: 'basic', label: 'Basic Information', icon: User },
    { id: 'contact', label: 'Contact Details', icon: Phone },
    { id: 'security', label: 'Security', icon: Shield }
  ]

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-btn-primary" />
        </div>
      </DashboardLayout>
    )
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-text-danger mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-text-primary mb-2">Access Denied</h2>
            <p className="text-card-subtext">Please log in to edit your profile.</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Breadcrumbs */}
        <Breadcrumbs items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'My Profile', href: '/profile' },
          { label: 'Edit Profile' }
        ]} />

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              Edit My Profile
            </h1>
            <p className="text-text-secondary">
              Update your personal and contact information
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleCancel}
              disabled={isSubmitting}
              className="btn-secondary flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button 
              onClick={handleSaveProfile}
              disabled={isSubmitting}
              className="btn-primary flex items-center gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
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
              <div>
                <h3 className="text-lg font-semibold text-card-title mb-4">Basic Information</h3>
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
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={cn(
                        "input-field",
                        errors.email && "border-red-500"
                      )}
                      placeholder="Enter email address"
                      disabled={isSubmitting}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                      className="input-field"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* Account Information (Read-only) */}
                <div className="mt-6 p-4 bg-bg-highlight rounded-lg">
                  <h4 className="font-medium text-card-title mb-3">Account Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-card-subtext">Username</label>
                      <p className="text-card-title font-medium">{user.username}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-card-subtext">User ID</label>
                      <p className="text-card-title font-medium">{user.id}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-card-subtext">Role</label>
                      <p className="text-card-title font-medium">
                        {user.is_admin ? 'Administrator' : user.is_active_carer ? 'Carer' : 'User'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm text-card-subtext">Status</label>
                      <span className={cn(
                        "inline-block px-2 py-1 rounded-full text-xs font-medium",
                        user.approved ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      )}>
                        {user.approved ? 'Approved' : 'Pending Approval'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Contact Information Tab */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-card-title mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Emergency Contact
                    </label>
                    <input
                      type="text"
                      value={formData.emergency_contact}
                      onChange={(e) => handleInputChange('emergency_contact', e.target.value)}
                      className="input-field"
                      placeholder="Enter emergency contact name"
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Emergency Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.emergency_phone}
                      onChange={(e) => handleInputChange('emergency_phone', e.target.value)}
                      className="input-field"
                      placeholder="Enter emergency phone"
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div className="md:col-span-2">
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
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-card-title mb-4">Security Settings</h3>
                
                <div className="mb-6">
                  <button
                    onClick={() => setShowPasswordSection(!showPasswordSection)}
                    className="flex items-center gap-2 text-btn-primary hover:text-btn-primary/80"
                    disabled={isSubmitting}
                  >
                    <Shield className="w-4 h-4" />
                    Change Password
                  </button>
                </div>

                {showPasswordSection && (
                  <div className="space-y-4 p-4 bg-bg-highlight rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Current Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.current ? 'text' : 'password'}
                          value={passwordData.current_password}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, current_password: e.target.value }))}
                          className={cn(
                            "input-field pr-10",
                            errors.current_password && "border-red-500"
                          )}
                          placeholder="Enter current password"
                          disabled={isSubmitting}
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('current')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-primary"
                          disabled={isSubmitting}
                        >
                          {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors.current_password && (
                        <p className="mt-1 text-sm text-red-500">{errors.current_password}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        New Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.new ? 'text' : 'password'}
                          value={passwordData.new_password}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
                          className={cn(
                            "input-field pr-10",
                            errors.new_password && "border-red-500"
                          )}
                          placeholder="Enter new password"
                          disabled={isSubmitting}
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('new')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-primary"
                          disabled={isSubmitting}
                        >
                          {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors.new_password && (
                        <p className="mt-1 text-sm text-red-500">{errors.new_password}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Confirm New Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.confirm ? 'text' : 'password'}
                          value={passwordData.confirm_password}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, confirm_password: e.target.value }))}
                          className={cn(
                            "input-field pr-10",
                            errors.confirm_password && "border-red-500"
                          )}
                          placeholder="Confirm new password"
                          disabled={isSubmitting}
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('confirm')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-primary"
                          disabled={isSubmitting}
                        >
                          {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors.confirm_password && (
                        <p className="mt-1 text-sm text-red-500">{errors.confirm_password}</p>
                      )}
                    </div>

                    <div className="flex justify-end pt-4">
                      <button
                        onClick={handleChangePassword}
                        disabled={isSubmitting}
                        className="btn-primary flex items-center gap-2"
                      >
                        {isSubmitting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Shield className="w-4 h-4" />
                        )}
                        Update Password
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
} 