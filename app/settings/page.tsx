'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Database,
  Palette,
  Globe,
  Save,
  Eye,
  EyeOff,
  Download,
  Upload,
  RefreshCw,
  Building,
  Mail,
  Phone,
  Loader2,
  Check,
  X,
  AlertTriangle,
  Moon,
  Sun,
  Monitor,
  Smartphone,
  Lock,
  Unlock,
  Key,
  Users,
  Clock,
  FileText,
  BarChart3
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { apiClient } from '@/lib/api'
import toast from 'react-hot-toast'

interface UserSettings {
  profile: {
    first_name: string
    last_name: string
    email: string
    phone: string
    timezone: string
    language: string
    date_format: string
  }
  notifications: {
    email_enabled: boolean
    push_enabled: boolean
    behavior_alerts: boolean
    shift_updates: boolean
    activity_reminders: boolean
    report_notifications: boolean
    daily_digest: boolean
    emergency_alerts: boolean
  }
  appearance: {
    theme: 'light' | 'dark' | 'system'
    sidebar_collapsed: boolean
    page_size: number
    show_avatars: boolean
    compact_mode: boolean
  }
  security: {
    two_factor_enabled: boolean
    session_timeout: number
    auto_logout: boolean
    login_notifications: boolean
  }
}

const defaultSettings: UserSettings = {
  profile: {
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    timezone: 'UTC',
    language: 'en',
    date_format: 'MM/DD/YYYY'
  },
  notifications: {
    email_enabled: true,
    push_enabled: false,
    behavior_alerts: true,
    shift_updates: true,
    activity_reminders: false,
    report_notifications: true,
    daily_digest: true,
    emergency_alerts: true
  },
  appearance: {
    theme: 'light',
    sidebar_collapsed: false,
    page_size: 20,
    show_avatars: true,
    compact_mode: false
  },
  security: {
    two_factor_enabled: false,
    session_timeout: 30,
    auto_logout: true,
    login_notifications: true
  }
}

const SettingsSection = ({ 
  title, 
  description, 
  icon: Icon, 
  children,
  isLoading = false
}: {
  title: string
  description: string
  icon: any
  children: React.ReactNode
  isLoading?: boolean
}) => (
  <div className="card p-6 relative">
    {isLoading && (
      <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-lg z-10">
        <Loader2 className="w-6 h-6 animate-spin text-btn-primary" />
      </div>
    )}
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 bg-btn-primary rounded-lg flex items-center justify-center">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-card-title">{title}</h3>
        <p className="text-sm text-card-subtext">{description}</p>
      </div>
    </div>
    {children}
  </div>
)

const ToggleSwitch = ({ 
  enabled, 
  onToggle, 
  disabled = false 
}: { 
  enabled: boolean
  onToggle: () => void
  disabled?: boolean
}) => (
  <button
    onClick={onToggle}
    disabled={disabled}
    className={cn(
      "w-12 h-6 rounded-full transition-colors relative",
      enabled ? "bg-btn-primary" : "bg-gray-300",
      disabled && "opacity-50 cursor-not-allowed"
    )}
  >
    <div className={cn(
      "w-4 h-4 bg-white rounded-full transition-transform absolute top-1",
      enabled ? "translate-x-7" : "translate-x-1"
    )}></div>
  </button>
)

const ProfileSettings = ({ 
  settings, 
  onUpdate, 
  isLoading 
}: { 
  settings: UserSettings
  onUpdate: (section: string, data: any) => Promise<void>
  isLoading: boolean
}) => {
  const [formData, setFormData] = useState(settings.profile)
  const [showPassword, setShowPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
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
    if (!validateForm()) return
    
    try {
      await onUpdate('profile', formData)
      toast.success('Profile updated successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile')
    }
  }

  const handleChangePassword = async () => {
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
    if (Object.keys(newErrors).length > 0) return

    try {
      // TODO: Add updatePassword method to API client
      // await apiClient.updatePassword(passwordData)
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' })
      toast.success('Password updated successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password')
    }
  }

  return (
    <SettingsSection
      title="Profile Settings"
      description="Update your personal information and account details"
      icon={User}
      isLoading={isLoading}
    >
      <div className="space-y-6">
        {/* Personal Information */}
        <div>
          <h4 className="font-medium text-card-title mb-4">Personal Information</h4>
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
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
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
          </div>
        </div>

        {/* Regional Settings */}
        <div>
          <h4 className="font-medium text-card-title mb-4">Regional Settings</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Time Zone
              </label>
              <select
                value={formData.timezone}
                onChange={(e) => handleInputChange('timezone', e.target.value)}
                className="input-field"
              >
                <option value="UTC">UTC (Coordinated Universal Time)</option>
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="Europe/London">GMT (Greenwich Mean Time)</option>
                <option value="Europe/Paris">CET (Central European Time)</option>
                <option value="Asia/Tokyo">JST (Japan Standard Time)</option>
                <option value="Australia/Sydney">AEST (Australian Eastern Standard Time)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Language
              </label>
              <select
                value={formData.language}
                onChange={(e) => handleInputChange('language', e.target.value)}
                className="input-field"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="it">Italian</option>
                <option value="pt">Portuguese</option>
                <option value="zh">Chinese</option>
                <option value="ja">Japanese</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Date Format
              </label>
              <select
                value={formData.date_format}
                onChange={(e) => handleInputChange('date_format', e.target.value)}
                className="input-field"
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY (US)</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY (UK)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
                <option value="DD.MM.YYYY">DD.MM.YYYY (European)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Password Change */}
        <div>
          <h4 className="font-medium text-card-title mb-4">Change Password</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordData.current_password}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, current_password: e.target.value }))}
                  className={cn(
                    "input-field pr-10",
                    errors.current_password && "border-red-500"
                  )}
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-primary"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.current_password && (
                <p className="mt-1 text-sm text-red-500">{errors.current_password}</p>
              )}
            </div>
            
            <div></div>
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                New Password
              </label>
              <input
                type="password"
                value={passwordData.new_password}
                onChange={(e) => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
                className={cn(
                  "input-field",
                  errors.new_password && "border-red-500"
                )}
                placeholder="Enter new password"
              />
              {errors.new_password && (
                <p className="mt-1 text-sm text-red-500">{errors.new_password}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={passwordData.confirm_password}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirm_password: e.target.value }))}
                className={cn(
                  "input-field",
                  errors.confirm_password && "border-red-500"
                )}
                placeholder="Confirm new password"
              />
              {errors.confirm_password && (
                <p className="mt-1 text-sm text-red-500">{errors.confirm_password}</p>
              )}
            </div>
          </div>
          
          <button
            onClick={handleChangePassword}
            className="btn-secondary mt-4 flex items-center gap-2"
            disabled={isLoading}
          >
            <Key className="w-4 h-4" />
            Change Password
          </button>
        </div>

        <div className="flex items-center gap-4 pt-4 border-t">
          <button
            onClick={handleSaveProfile}
            disabled={isLoading}
            className="btn-primary flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Changes
          </button>
          <button
            onClick={() => setFormData(settings.profile)}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </div>
    </SettingsSection>
  )
}

const NotificationSettings = ({ 
  settings, 
  onUpdate, 
  isLoading 
}: { 
  settings: UserSettings
  onUpdate: (section: string, data: any) => Promise<void>
  isLoading: boolean
}) => {
  const [notifications, setNotifications] = useState(settings.notifications)

  const toggleNotification = async (key: keyof typeof notifications) => {
    const newValue = !notifications[key]
    setNotifications(prev => ({ ...prev, [key]: newValue }))
    
    try {
      await onUpdate('notifications', { ...notifications, [key]: newValue })
      toast.success('Notification preference updated!')
    } catch (error: any) {
      // Revert on error
      setNotifications(prev => ({ ...prev, [key]: !newValue }))
      toast.error(error.message || 'Failed to update notification preference')
    }
  }

  return (
    <SettingsSection
      title="Notification Preferences"
      description="Configure how you receive notifications and alerts"
      icon={Bell}
      isLoading={isLoading}
    >
      <div className="space-y-6">
        {/* Main Notification Types */}
        <div>
          <h4 className="font-medium text-card-title mb-4">Notification Channels</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-bg-highlight rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-text-muted" />
                <div>
                  <h5 className="font-medium text-card-title">Email Notifications</h5>
                  <p className="text-sm text-card-subtext">Receive notifications via email</p>
                </div>
              </div>
              <ToggleSwitch
                enabled={notifications.email_enabled}
                onToggle={() => toggleNotification('email_enabled')}
                disabled={isLoading}
              />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-bg-highlight rounded-lg">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-text-muted" />
                <div>
                  <h5 className="font-medium text-card-title">Push Notifications</h5>
                  <p className="text-sm text-card-subtext">Receive real-time push notifications in browser</p>
                </div>
              </div>
              <ToggleSwitch
                enabled={notifications.push_enabled}
                onToggle={() => toggleNotification('push_enabled')}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        {/* Specific Notification Types */}
        <div>
          <h4 className="font-medium text-card-title mb-4">Notification Types</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-bg-highlight rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                <span className="text-sm text-card-title">Behavior Alerts</span>
              </div>
              <ToggleSwitch
                enabled={notifications.behavior_alerts}
                onToggle={() => toggleNotification('behavior_alerts')}
                disabled={isLoading}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-bg-highlight rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-card-title">Shift Updates</span>
              </div>
              <ToggleSwitch
                enabled={notifications.shift_updates}
                onToggle={() => toggleNotification('shift_updates')}
                disabled={isLoading}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-bg-highlight rounded-lg">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-sm text-card-title">Activity Reminders</span>
              </div>
              <ToggleSwitch
                enabled={notifications.activity_reminders}
                onToggle={() => toggleNotification('activity_reminders')}
                disabled={isLoading}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-bg-highlight rounded-lg">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-500" />
                <span className="text-sm text-card-title">Report Notifications</span>
              </div>
              <ToggleSwitch
                enabled={notifications.report_notifications}
                onToggle={() => toggleNotification('report_notifications')}
                disabled={isLoading}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-bg-highlight rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-500" />
                <span className="text-sm text-card-title">Daily Digest</span>
              </div>
              <ToggleSwitch
                enabled={notifications.daily_digest}
                onToggle={() => toggleNotification('daily_digest')}
                disabled={isLoading}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-bg-highlight rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-card-title">Emergency Alerts</span>
              </div>
              <ToggleSwitch
                enabled={notifications.emergency_alerts}
                onToggle={() => toggleNotification('emergency_alerts')}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        {/* Notification Schedule */}
        <div>
          <h4 className="font-medium text-card-title mb-4">Notification Schedule</h4>
          <div className="p-4 bg-bg-highlight rounded-lg">
            <p className="text-sm text-card-subtext mb-3">
              Configure quiet hours when non-urgent notifications will be silenced
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Quiet Hours Start
                </label>
                <input
                  type="time"
                  defaultValue="22:00"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Quiet Hours End
                </label>
                <input
                  type="time"
                  defaultValue="08:00"
                  className="input-field"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </SettingsSection>
  )
}

const SecuritySettings = ({ 
  settings, 
  onUpdate, 
  isLoading 
}: { 
  settings: UserSettings
  onUpdate: (section: string, data: any) => Promise<void>
  isLoading: boolean
}) => {
  const [security, setSecurity] = useState(settings.security)

  const handleSecurityUpdate = async (field: keyof typeof security, value: any) => {
    setSecurity(prev => ({ ...prev, [field]: value }))
    
    try {
      await onUpdate('security', { ...security, [field]: value })
      toast.success('Security setting updated!')
    } catch (error: any) {
      // Revert on error
      setSecurity(prev => ({ ...prev, [field]: settings.security[field] }))
      toast.error(error.message || 'Failed to update security setting')
    }
  }

  return (
    <SettingsSection
      title="Security & Privacy"
      description="Manage security settings and data privacy preferences"
      icon={Shield}
      isLoading={isLoading}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-bg-highlight rounded-lg">
          <div>
            <h4 className="font-medium text-card-title">Two-Factor Authentication</h4>
            <p className="text-sm text-card-subtext">Add an extra layer of security to your account</p>
          </div>
          <div className="flex items-center gap-3">
            <ToggleSwitch
              enabled={security.two_factor_enabled}
              onToggle={() => handleSecurityUpdate('two_factor_enabled', !security.two_factor_enabled)}
              disabled={isLoading}
            />
            <button className="btn-secondary text-sm">
              Configure
            </button>
          </div>
        </div>
        
        <div className="flex items-center justify-between p-4 bg-bg-highlight rounded-lg">
          <div>
            <h4 className="font-medium text-card-title">Auto Logout</h4>
            <p className="text-sm text-card-subtext">Automatically log out after period of inactivity</p>
          </div>
          <ToggleSwitch
            enabled={security.auto_logout}
            onToggle={() => handleSecurityUpdate('auto_logout', !security.auto_logout)}
            disabled={isLoading}
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-bg-highlight rounded-lg">
          <div>
            <h4 className="font-medium text-card-title">Login Notifications</h4>
            <p className="text-sm text-card-subtext">Get notified when someone logs into your account</p>
          </div>
          <ToggleSwitch
            enabled={security.login_notifications}
            onToggle={() => handleSecurityUpdate('login_notifications', !security.login_notifications)}
            disabled={isLoading}
          />
        </div>

        <div className="p-4 bg-bg-highlight rounded-lg">
          <h4 className="font-medium text-card-title mb-3">Session Timeout</h4>
          <p className="text-sm text-card-subtext mb-3">
            Set how long you can be inactive before being automatically logged out
          </p>
          <select
            value={security.session_timeout}
            onChange={(e) => handleSecurityUpdate('session_timeout', parseInt(e.target.value))}
            className="input-field"
          >
            <option value={15}>15 minutes</option>
            <option value={30}>30 minutes</option>
            <option value={60}>1 hour</option>
            <option value={120}>2 hours</option>
            <option value={480}>8 hours</option>
            <option value={0}>Never</option>
          </select>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-bg-highlight rounded-lg">
            <div>
              <h5 className="font-medium text-card-title">Session Management</h5>
              <p className="text-sm text-card-subtext">View and manage active sessions</p>
            </div>
            <button className="btn-secondary">
              View Sessions
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-bg-highlight rounded-lg">
            <div>
              <h5 className="font-medium text-card-title">Data Export</h5>
              <p className="text-sm text-card-subtext">Download your personal data</p>
            </div>
            <button className="btn-secondary flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Data
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
            <div>
              <h4 className="font-medium text-red-800">Account Deletion</h4>
              <p className="text-sm text-red-600">Permanently delete your account and data</p>
            </div>
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </SettingsSection>
  )
}

const AppearanceSettings = ({ 
  settings, 
  onUpdate, 
  isLoading 
}: { 
  settings: UserSettings
  onUpdate: (section: string, data: any) => Promise<void>
  isLoading: boolean
}) => {
  const [appearance, setAppearance] = useState(settings.appearance)

  const handleAppearanceUpdate = async (field: keyof typeof appearance, value: any) => {
    setAppearance(prev => ({ ...prev, [field]: value }))
    
    try {
      await onUpdate('appearance', { ...appearance, [field]: value })
      toast.success('Appearance setting updated!')
    } catch (error: any) {
      // Revert on error
      setAppearance(prev => ({ ...prev, [field]: settings.appearance[field] }))
      toast.error(error.message || 'Failed to update appearance setting')
    }
  }

  return (
    <SettingsSection
      title="Appearance & Theme"
      description="Customize the look and feel of your interface"
      icon={Palette}
      isLoading={isLoading}
    >
      <div className="space-y-6">
        <div>
          <h4 className="font-medium text-card-title mb-4">Theme</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div 
              className={cn(
                "p-4 border rounded-lg cursor-pointer transition-colors",
                appearance.theme === 'light' ? "border-btn-primary bg-bg-highlight" : "border-gray-200"
              )}
              onClick={() => handleAppearanceUpdate('theme', 'light')}
            >
              <div className="flex items-center gap-3">
                <Sun className="w-5 h-5 text-yellow-500" />
                <div>
                  <h5 className="font-medium">Light</h5>
                  <p className="text-sm text-text-muted">Clean and bright interface</p>
                </div>
              </div>
            </div>
            
            <div 
              className={cn(
                "p-4 border rounded-lg cursor-pointer transition-colors",
                appearance.theme === 'dark' ? "border-btn-primary bg-bg-highlight" : "border-gray-200"
              )}
              onClick={() => handleAppearanceUpdate('theme', 'dark')}
            >
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-indigo-500" />
                <div>
                  <h5 className="font-medium">Dark</h5>
                  <p className="text-sm text-text-muted">Easy on the eyes</p>
                </div>
              </div>
            </div>
            
            <div 
              className={cn(
                "p-4 border rounded-lg cursor-pointer transition-colors",
                appearance.theme === 'system' ? "border-btn-primary bg-bg-highlight" : "border-gray-200"
              )}
              onClick={() => handleAppearanceUpdate('theme', 'system')}
            >
              <div className="flex items-center gap-3">
                <Monitor className="w-5 h-5 text-gray-500" />
                <div>
                  <h5 className="font-medium">System</h5>
                  <p className="text-sm text-text-muted">Match system preference</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-card-title mb-4">Interface Options</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-bg-highlight rounded-lg">
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-card-title">Compact Mode</span>
              </div>
              <ToggleSwitch
                enabled={appearance.compact_mode}
                onToggle={() => handleAppearanceUpdate('compact_mode', !appearance.compact_mode)}
                disabled={isLoading}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-bg-highlight rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-card-title">Show Avatars</span>
              </div>
              <ToggleSwitch
                enabled={appearance.show_avatars}
                onToggle={() => handleAppearanceUpdate('show_avatars', !appearance.show_avatars)}
                disabled={isLoading}
              />
            </div>

            <div className="p-3 bg-bg-highlight rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-card-title">Items per page</span>
                <span className="text-sm text-text-muted">{appearance.page_size} items</span>
              </div>
              <select
                value={appearance.page_size}
                onChange={(e) => handleAppearanceUpdate('page_size', parseInt(e.target.value))}
                className="input-field"
              >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </SettingsSection>
  )
}

const SystemSettings = ({ 
  settings, 
  onUpdate, 
  isLoading 
}: { 
  settings: UserSettings
  onUpdate: (section: string, data: any) => Promise<void>
  isLoading: boolean
}) => {
  const [systemSettings, setSystemSettings] = useState({
    auto_save_interval: 30,
    backup_frequency: 'daily',
    data_retention_days: 365
  })

  const handleSystemUpdate = async (field: string, value: any) => {
    setSystemSettings(prev => ({ ...prev, [field]: value }))
    
    try {
      // TODO: Add system settings API endpoint
      toast.success('System setting updated!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update system setting')
    }
  }

  return (
    <SettingsSection
      title="System Configuration"
      description="Configure system-wide settings and preferences"
      icon={Database}
      isLoading={isLoading}
    >
      <div className="space-y-6">
        <div>
          <h4 className="font-medium text-card-title mb-4">Data Management</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Auto-save Interval
              </label>
              <select
                value={systemSettings.auto_save_interval}
                onChange={(e) => handleSystemUpdate('auto_save_interval', parseInt(e.target.value))}
                className="input-field"
              >
                <option value={30}>30 seconds</option>
                <option value={60}>1 minute</option>
                <option value={300}>5 minutes</option>
                <option value={600}>10 minutes</option>
                <option value={0}>Manual only</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Backup Frequency
              </label>
              <select
                value={systemSettings.backup_frequency}
                onChange={(e) => handleSystemUpdate('backup_frequency', e.target.value)}
                className="input-field"
              >
                <option value="realtime">Real-time</option>
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-card-title mb-4">Data Retention</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Keep data for
              </label>
              <select
                value={systemSettings.data_retention_days}
                onChange={(e) => handleSystemUpdate('data_retention_days', parseInt(e.target.value))}
                className="input-field"
              >
                <option value={30}>30 days</option>
                <option value={90}>90 days</option>
                <option value={365}>1 year</option>
                <option value={730}>2 years</option>
                <option value={1095}>3 years</option>
                <option value={1825}>5 years</option>
                <option value={-1}>Forever</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-card-title mb-4">Maintenance</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-bg-highlight rounded-lg">
              <div>
                <h5 className="font-medium text-card-title">Backup & Restore</h5>
                <p className="text-sm text-card-subtext">Create backup or restore from backup</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="btn-secondary flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Backup
                </button>
                <button className="btn-secondary flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Restore
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-bg-highlight rounded-lg">
              <div>
                <h5 className="font-medium text-card-title">System Health Check</h5>
                <p className="text-sm text-card-subtext">Run diagnostics and performance check</p>
              </div>
              <button className="btn-secondary flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Run Check
              </button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-bg-highlight rounded-lg">
              <div>
                <h5 className="font-medium text-card-title">Clear Cache</h5>
                <p className="text-sm text-card-subtext">Clear application cache and temporary files</p>
              </div>
              <button className="btn-secondary">
                Clear Cache
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 pt-4 border-t">
          <button className="btn-primary flex items-center gap-2">
            <Save className="w-4 h-4" />
            Save Configuration
          </button>
          <button className="btn-secondary">
            Reset to Defaults
          </button>
        </div>
      </div>
    </SettingsSection>
  )
}

export default function SettingsPage() {
  const [userSettings, setUserSettings] = useState<UserSettings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setIsLoading(true)
    try {
      // TODO: Load user settings from API
      // const settings = await apiClient.getUserSettings()
      // setUserSettings(settings)
      
      // TODO: Load current user data
      // const user = await apiClient.getCurrentUser()
      // setCurrentUser(user)
    } catch (error: any) {
      toast.error('Failed to load settings')
    } finally {
      setIsLoading(false)
    }
  }

  const updateSettings = async (section: string, data: any) => {
    setIsLoading(true)
    try {
      // TODO: Update settings via API
      // await apiClient.updateUserSettings(section, data)
      
      setUserSettings(prev => ({
        ...prev,
        [section]: data
      }))
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update settings')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Breadcrumbs */}
        <Breadcrumbs items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Settings' }
        ]} />

        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Settings
          </h1>
          <p className="text-text-secondary">
            Manage your account settings, preferences, and system configuration
          </p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          <ProfileSettings
            settings={userSettings}
            onUpdate={updateSettings}
            isLoading={isLoading}
          />
          
          <NotificationSettings
            settings={userSettings}
            onUpdate={updateSettings}
            isLoading={isLoading}
          />
          
          <SecuritySettings
            settings={userSettings}
            onUpdate={updateSettings}
            isLoading={isLoading}
          />
          
          <AppearanceSettings
            settings={userSettings}
            onUpdate={updateSettings}
            isLoading={isLoading}
          />
          
          <SystemSettings
            settings={userSettings}
            onUpdate={updateSettings}
            isLoading={isLoading}
          />
        </div>
      </div>
    </DashboardLayout>
  )
} 