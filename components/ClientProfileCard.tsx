'use client'

import { useState } from 'react'
import { 
  User, 
  MapPin, 
  Phone, 
  Heart, 
  X, 
  Pill, 
  ThumbsUp, 
  ThumbsDown, 
  AlertTriangle,
  Calendar,
  Edit,
  ChevronDown,
  ChevronUp,
  Mail,
  Home,
  Activity,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePrimaryClient } from '@/lib/hooks'
import { Contact } from '@/types'

interface ClientProfileCardProps {
  className?: string
  compact?: boolean
}

export default function ClientProfileCard({ className, compact = false }: ClientProfileCardProps) {
  const [isExpanded, setIsExpanded] = useState(!compact)
  const { client, contacts, emergencyContacts, isLoading, isError } = usePrimaryClient()

  if (isLoading) {
    return (
      <div className={cn("card p-6", className)}>
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-btn-primary" />
            <p className="text-sm text-text-secondary">Loading client profile...</p>
          </div>
        </div>
      </div>
    )
  }

  if (isError || !client) {
    return (
      <div className={cn("card p-6", className)}>
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-red-500" />
            <p className="text-sm text-text-secondary">Unable to load client profile</p>
          </div>
        </div>
      </div>
    )
  }

  const primaryEmergencyContact: Contact | undefined = emergencyContacts.find((contact: Contact) => contact.is_primary_contact) || emergencyContacts[0]
  
  const formatAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const formatList = (text: string) => {
    if (!text) return 'None specified'
    return text.split(',').map(item => item.trim()).join(', ')
  }

  return (
    <div className={cn("card p-6", className)}>
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        {/* Profile Picture */}
        <div className="flex-shrink-0">
          {client.profile_picture ? (
            <img 
              src={client.profile_picture} 
              alt={`${client.first_name} ${client.last_name}`}
              className="w-16 h-16 rounded-full object-cover border-2 border-border"
            />
          ) : (
            <div className="w-16 h-16 bg-btn-primary/20 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-btn-primary" />
            </div>
          )}
        </div>

        {/* Basic Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-semibold text-card-title truncate">
              {client.preferred_name || `${client.first_name} ${client.last_name}`}
            </h3>
            {compact && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 hover:bg-hover rounded-lg transition-colors"
              >
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-nav-icon" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-nav-icon" />
                )}
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-4 text-sm text-text-secondary mb-2">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Age {formatAge(client.date_of_birth)}
            </span>
            <span className="flex items-center gap-1">
              <Activity className="w-3 h-3" />
              {client.care_level?.replace('_', ' ')} support
            </span>
          </div>

          {/* Diagnosis */}
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-1">
              <Heart className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium text-card-title">Diagnosis</span>
            </div>
            <p className="text-sm text-text-secondary pl-6">{client.diagnosis}</p>
          </div>
        </div>
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="space-y-4 pt-4 border-t border-border">
          {/* Address */}
          {client.address && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-card-title">Address</span>
              </div>
              <p className="text-sm text-text-secondary pl-6">{client.address}</p>
            </div>
          )}

          {/* Medications */}
          {client.medications && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Pill className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium text-card-title">Medications</span>
              </div>
              <p className="text-sm text-text-secondary pl-6">{client.medications}</p>
            </div>
          )}

          {/* Interests */}
          {client.interests && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ThumbsUp className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-card-title">Interests</span>
              </div>
              <p className="text-sm text-text-secondary pl-6">{formatList(client.interests)}</p>
            </div>
          )}

          {/* Dislikes */}
          {client.dislikes && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ThumbsDown className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium text-card-title">Dislikes</span>
              </div>
              <p className="text-sm text-text-secondary pl-6">{formatList(client.dislikes)}</p>
            </div>
          )}

          {/* Emergency Contact */}
          {primaryEmergencyContact && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-sm font-medium text-card-title">Emergency Contact</span>
              </div>
              <div className="pl-6 space-y-1">
                <p className="text-sm font-medium text-card-title">
                  {primaryEmergencyContact.first_name} {primaryEmergencyContact.last_name}
                </p>
                {primaryEmergencyContact.relationship && (
                  <p className="text-xs text-text-secondary">
                    {primaryEmergencyContact.relationship.replace('_', ' ')}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm text-text-secondary">
                  {primaryEmergencyContact.phone_primary && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {primaryEmergencyContact.phone_primary}
                    </span>
                  )}
                  {primaryEmergencyContact.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {primaryEmergencyContact.email}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Additional Info */}
          {(client.allergies || client.medical_notes) && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium text-card-title">Important Notes</span>
              </div>
              <div className="pl-6 space-y-1">
                {client.allergies && (
                  <div>
                    <span className="text-xs font-medium text-red-600">Allergies: </span>
                    <span className="text-xs text-text-secondary">{client.allergies}</span>
                  </div>
                )}
                {client.medical_notes && (
                  <div>
                    <span className="text-xs font-medium text-card-title">Medical Notes: </span>
                    <span className="text-xs text-text-secondary">{client.medical_notes}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="text-xs text-text-secondary">
              ID: {client.client_id}
            </div>
            <a 
              href="/client-profile/edit"
              className="flex items-center gap-1 text-xs text-btn-primary hover:text-btn-primary/80 transition-colors"
            >
              <Edit className="w-3 h-3" />
              Edit Profile
            </a>
          </div>
        </div>
      )}
    </div>
  )
} 