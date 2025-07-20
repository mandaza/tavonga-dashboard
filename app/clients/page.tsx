'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import { 
  UserCheck, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Heart,
  Users,
  Calendar,
  MapPin,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  Activity,
  Brain,
  Stethoscope,
  Shield,
  FileText,
  ChevronDown,
  X,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import toast from 'react-hot-toast'
import AddClientModal from '@/components/AddClientModal'

interface Client {
  id: string
  first_name: string
  middle_name?: string
  last_name: string
  preferred_name?: string
  date_of_birth: string
  gender: string
  address?: string
  phone?: string
  email?: string
  diagnosis: string
  secondary_diagnoses?: string
  allergies?: string
  medications?: string
  medical_notes?: string
  care_level: string
  interests?: string
  likes?: string
  dislikes?: string
  communication_preferences?: string
  behavioral_triggers: string[]
  calming_strategies: string[]
  profile_picture?: string
  client_id: string
  is_active: boolean
  notes?: string
  primary_support_worker?: any
  support_team: any[]
  case_manager?: any
  created_at: string
  updated_at: string
}

interface FilterState {
  search: string
  care_level: string
  is_active: string
  primary_support_worker: string
}

export default function ClientsPage() {
  const { user } = useAuth()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    care_level: '',
    is_active: 'true',
    primary_support_worker: ''
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchClients()
  }, [currentPage, filters])

  const fetchClients = async () => {
    try {
      setLoading(true)
      const params: Record<string, any> = {
        page: currentPage,
        page_size: 12
      }
      
      if (filters.search) params.search = filters.search
      if (filters.care_level) params.care_level = filters.care_level
      if (filters.is_active) params.is_active = filters.is_active
      if (filters.primary_support_worker) params.primary_support_worker = filters.primary_support_worker
      
      const response = await apiClient.getClients(params)
      setClients(response.results || [])
      setTotalPages(Math.ceil((response.count || 0) / 12))
      setTotalCount(response.count || 0)
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch clients')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setFilters(prev => ({ ...prev, search: value }))
    setCurrentPage(1)
  }

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      care_level: '',
      is_active: 'true',
      primary_support_worker: ''
    })
    setSearchTerm('')
    setCurrentPage(1)
  }

  const handleViewClient = (client: Client) => {
    setSelectedClient(client)
    setShowViewModal(true)
  }

  const handleEditClient = (client: Client) => {
    setSelectedClient(client)
    // In a real app, this would navigate to an edit page
    toast('Edit functionality would open here')
  }

  const handleDeleteClient = (client: Client) => {
    setSelectedClient(client)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!selectedClient) return
    
    setIsSubmitting(true)
    try {
      await apiClient.deleteClient(selectedClient.id)
      setClients(prev => prev.filter(c => c.id !== selectedClient.id))
      setShowDeleteModal(false)
      setSelectedClient(null)
      toast.success('Client deleted successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete client')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getCareLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  if (loading && clients.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-btn-primary" />
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
          { label: 'Clients' }
        ]} />

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              Client Management
            </h1>
            <p className="text-text-secondary">
              Manage and view all clients in the system ({totalCount} total)
            </p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New Client
          </button>
        </div>

        {/* Search and Filters */}
        <div className="card p-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search clients by name, ID, or diagnosis..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors",
                showFilters 
                  ? "bg-btn-primary text-white border-btn-primary" 
                  : "bg-white text-text-primary border-card-border hover:bg-bg-highlight"
              )}
            >
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown className={cn("w-4 h-4 transition-transform", showFilters && "rotate-180")} />
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="border-t border-card-border pt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Care Level</label>
                <select
                  value={filters.care_level}
                  onChange={(e) => handleFilterChange('care_level', e.target.value)}
                  className="input-field"
                >
                  <option value="">All Levels</option>
                  <option value="low">Low Support</option>
                  <option value="medium">Medium Support</option>
                  <option value="high">High Support</option>
                  <option value="critical">Critical Support</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Status</label>
                <select
                  value={filters.is_active}
                  onChange={(e) => handleFilterChange('is_active', e.target.value)}
                  className="input-field"
                >
                  <option value="">All Clients</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              
              <div className="md:col-span-2 flex items-end gap-2">
                <button
                  onClick={clearFilters}
                  className="btn-secondary flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Clients Grid */}
        {clients.length === 0 ? (
          <div className="card p-12 text-center">
            <UserCheck className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              No Clients Found
            </h3>
            <p className="text-text-secondary mb-6">
              {filters.search || filters.care_level ? 
                'No clients match your current filters.' :
                'Get started by adding your first client.'
              }
            </p>
            {(!filters.search && !filters.care_level) && (
              <button 
                onClick={() => setShowAddModal(true)}
                className="btn-primary"
              >
                Add First Client
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {clients.map((client) => (
              <div key={client.id} className="card p-6 hover:shadow-lg transition-shadow">
                {/* Client Avatar */}
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-icon-profile-container rounded-full flex items-center justify-center mr-3">
                    {client.profile_picture ? (
                      <img 
                        src={client.profile_picture} 
                        alt={client.first_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-6 h-6 text-icon-profile" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-card-title text-sm">
                      {client.preferred_name || `${client.first_name} ${client.last_name}`}
                    </h3>
                    <p className="text-xs text-card-subtext">ID: {client.client_id}</p>
                  </div>
                  <div className={cn(
                    "w-3 h-3 rounded-full",
                    client.is_active ? "bg-text-positive" : "bg-text-muted"
                  )} />
                </div>

                {/* Client Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs text-card-subtext">
                    <Calendar className="w-3 h-3" />
                    Age {getAge(client.date_of_birth)}
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-card-subtext">
                    <Stethoscope className="w-3 h-3" />
                    {client.diagnosis.length > 30 ? 
                      `${client.diagnosis.substring(0, 30)}...` : 
                      client.diagnosis
                    }
                  </div>
                  
                  {client.phone && (
                    <div className="flex items-center gap-2 text-xs text-card-subtext">
                      <Phone className="w-3 h-3" />
                      {client.phone}
                    </div>
                  )}
                </div>

                {/* Care Level Badge */}
                <div className="mb-4">
                  <span className={cn(
                    "inline-block px-2 py-1 rounded-full text-xs font-medium",
                    getCareLevelColor(client.care_level)
                  )}>
                    {client.care_level.charAt(0).toUpperCase() + client.care_level.slice(1)} Support
                  </span>
                </div>

                {/* Support Worker */}
                {client.primary_support_worker && (
                  <div className="mb-4 p-2 bg-bg-highlight rounded-lg">
                    <div className="flex items-center gap-2 text-xs">
                      <Users className="w-3 h-3 text-text-positive" />
                      <span className="text-card-subtext">Primary Support:</span>
                    </div>
                    <p className="text-xs font-medium text-card-title mt-1">
                      {client.primary_support_worker.first_name} {client.primary_support_worker.last_name}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleViewClient(client)}
                    className="flex-1 btn-secondary text-xs py-2 flex items-center justify-center gap-1"
                  >
                    <Eye className="w-3 h-3" />
                    View
                  </button>
                  <button
                    onClick={() => handleEditClient(client)}
                    className="flex-1 btn-primary text-xs py-2 flex items-center justify-center gap-1"
                  >
                    <Edit className="w-3 h-3" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClient(client)}
                    className="px-3 py-2 text-text-danger hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-text-secondary">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}

        {/* View Client Modal */}
        {showViewModal && selectedClient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="card max-w-4xl w-full max-h-[90vh] overflow-auto p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-card-title">Client Details</h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-2 hover:bg-bg-highlight rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Basic Information */}
                <div className="lg:col-span-1">
                  <div className="text-center mb-6">
                    <div className="w-24 h-24 bg-icon-profile-container rounded-full flex items-center justify-center mx-auto mb-4">
                      {selectedClient.profile_picture ? (
                        <img 
                          src={selectedClient.profile_picture} 
                          alt={selectedClient.first_name}
                          className="w-24 h-24 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-12 h-12 text-icon-profile" />
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-card-title mb-1">
                      {selectedClient.preferred_name || `${selectedClient.first_name} ${selectedClient.last_name}`}
                    </h3>
                    <p className="text-card-subtext mb-2">ID: {selectedClient.client_id}</p>
                    <span className={cn(
                      "inline-block px-3 py-1 rounded-full text-sm font-medium",
                      getCareLevelColor(selectedClient.care_level)
                    )}>
                      {selectedClient.care_level.charAt(0).toUpperCase() + selectedClient.care_level.slice(1)} Support
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-card-title mb-1">Age</label>
                      <p className="text-card-subtext">{getAge(selectedClient.date_of_birth)} years old</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-card-title mb-1">Gender</label>
                      <p className="text-card-subtext capitalize">{selectedClient.gender.replace('_', ' ')}</p>
                    </div>
                    
                    {selectedClient.phone && (
                      <div>
                        <label className="block text-sm font-medium text-card-title mb-1">Phone</label>
                        <p className="text-card-subtext">{selectedClient.phone}</p>
                      </div>
                    )}
                    
                    {selectedClient.email && (
                      <div>
                        <label className="block text-sm font-medium text-card-title mb-1">Email</label>
                        <p className="text-card-subtext">{selectedClient.email}</p>
                      </div>
                    )}
                    
                    {selectedClient.address && (
                      <div>
                        <label className="block text-sm font-medium text-card-title mb-1">Address</label>
                        <p className="text-card-subtext">{selectedClient.address}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Medical Information */}
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-card-title mb-4 flex items-center gap-2">
                      <Stethoscope className="w-5 h-5" />
                      Medical Information
                    </h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-card-title mb-1">Primary Diagnosis</label>
                        <p className="text-card-subtext">{selectedClient.diagnosis}</p>
                      </div>
                      
                      {selectedClient.secondary_diagnoses && (
                        <div>
                          <label className="block text-sm font-medium text-card-title mb-1">Secondary Diagnoses</label>
                          <p className="text-card-subtext">{selectedClient.secondary_diagnoses}</p>
                        </div>
                      )}
                      
                      {selectedClient.allergies && (
                        <div>
                          <label className="block text-sm font-medium text-card-title mb-1">Allergies</label>
                          <p className="text-card-subtext">{selectedClient.allergies}</p>
                        </div>
                      )}
                      
                      {selectedClient.medications && (
                        <div>
                          <label className="block text-sm font-medium text-card-title mb-1">Medications</label>
                          <p className="text-card-subtext">{selectedClient.medications}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Personal Preferences */}
                  <div>
                    <h4 className="text-lg font-semibold text-card-title mb-4 flex items-center gap-2">
                      <Heart className="w-5 h-5" />
                      Personal Information
                    </h4>
                    
                    <div className="space-y-4">
                      {selectedClient.interests && (
                        <div>
                          <label className="block text-sm font-medium text-card-title mb-1">Interests</label>
                          <p className="text-card-subtext">{selectedClient.interests}</p>
                        </div>
                      )}
                      
                      {selectedClient.likes && (
                        <div>
                          <label className="block text-sm font-medium text-card-title mb-1">Likes</label>
                          <p className="text-card-subtext">{selectedClient.likes}</p>
                        </div>
                      )}
                      
                      {selectedClient.dislikes && (
                        <div>
                          <label className="block text-sm font-medium text-card-title mb-1">Dislikes</label>
                          <p className="text-card-subtext">{selectedClient.dislikes}</p>
                        </div>
                      )}
                      
                      {selectedClient.communication_preferences && (
                        <div>
                          <label className="block text-sm font-medium text-card-title mb-1">Communication Preferences</label>
                          <p className="text-card-subtext">{selectedClient.communication_preferences}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Behavioral Information */}
                  {(selectedClient.behavioral_triggers.length > 0 || selectedClient.calming_strategies.length > 0) && (
                    <div>
                      <h4 className="text-lg font-semibold text-card-title mb-4 flex items-center gap-2">
                        <Brain className="w-5 h-5" />
                        Behavioral Information
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedClient.behavioral_triggers.length > 0 && (
                          <div>
                            <label className="block text-sm font-medium text-card-title mb-2">Behavioral Triggers</label>
                            <div className="space-y-1">
                              {selectedClient.behavioral_triggers.map((trigger, index) => (
                                <span key={index} className="inline-block bg-red-100 text-red-800 px-2 py-1 rounded-lg text-xs mr-1 mb-1">
                                  {trigger}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {selectedClient.calming_strategies.length > 0 && (
                          <div>
                            <label className="block text-sm font-medium text-card-title mb-2">Calming Strategies</label>
                            <div className="space-y-1">
                              {selectedClient.calming_strategies.map((strategy, index) => (
                                <span key={index} className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded-lg text-xs mr-1 mb-1">
                                  {strategy}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Support Team */}
                  {(selectedClient.primary_support_worker || selectedClient.case_manager || selectedClient.support_team.length > 0) && (
                    <div>
                      <h4 className="text-lg font-semibold text-card-title mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Support Team
                      </h4>
                      
                      <div className="space-y-4">
                        {selectedClient.primary_support_worker && (
                          <div>
                            <label className="block text-sm font-medium text-card-title mb-1">Primary Support Worker</label>
                            <p className="text-card-subtext">
                              {selectedClient.primary_support_worker.first_name} {selectedClient.primary_support_worker.last_name}
                            </p>
                          </div>
                        )}
                        
                        {selectedClient.case_manager && (
                          <div>
                            <label className="block text-sm font-medium text-card-title mb-1">Case Manager</label>
                            <p className="text-card-subtext">
                              {selectedClient.case_manager.first_name} {selectedClient.case_manager.last_name}
                            </p>
                          </div>
                        )}
                        
                        {selectedClient.support_team.length > 0 && (
                          <div>
                            <label className="block text-sm font-medium text-card-title mb-2">Support Team Members</label>
                            <div className="space-y-1">
                              {selectedClient.support_team.map((member, index) => (
                                <span key={index} className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-lg text-xs mr-1 mb-1">
                                  {member.first_name} {member.last_name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedClient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="card max-w-md w-full p-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-card-title mb-2">Delete Client</h3>
                <p className="text-card-subtext mb-6">
                  Are you sure you want to delete {selectedClient.preferred_name || `${selectedClient.first_name} ${selectedClient.last_name}`}? 
                  This action cannot be undone.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    disabled={isSubmitting}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={isSubmitting}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Client Modal */}
        <AddClientModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onClientAdded={(newClient) => {
            setClients(prev => [newClient, ...prev])
            setTotalCount(prev => prev + 1)
          }}
        />
      </div>
    </DashboardLayout>
  )
} 