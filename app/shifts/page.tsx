'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import AddShiftModal from '@/components/AddShiftModal'
import EditShiftModal from '@/components/EditShiftModal'
import DeleteShiftModal from '@/components/DeleteShiftModal'
import { 
  Clock, 
  Plus, 
  Calendar,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MapPin,
  User,
  Download,
  Loader2,
  Play,
  Square,
  Edit,
  Trash2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate, formatTime } from '@/lib/utils'
import { useShifts } from '@/lib/hooks'
import { apiClient } from '@/lib/api'
import { Shift as ShiftType } from '@/types'
import toast from 'react-hot-toast'

const ShiftCard = ({ shift, onClockIn, onClockOut, onEdit, onDelete }: { 
  shift: ShiftType
  onClockIn: (shiftId: string) => void
  onClockOut: (shiftId: string) => void
  onEdit: (shift: ShiftType) => void
  onDelete: (shift: ShiftType) => void
}) => {
  const [isLoading, setIsLoading] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-text-positive/10 text-text-positive'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'scheduled':
        return 'bg-gray-100 text-gray-800'
      case 'cancelled':
        return 'bg-text-danger/10 text-text-danger'
      case 'no_show':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getShiftTypeColor = (shiftType: string) => {
    switch (shiftType) {
      case 'morning':
        return 'bg-yellow-100 text-yellow-800'
      case 'afternoon':
        return 'bg-orange-100 text-orange-800'
      case 'evening':
        return 'bg-purple-100 text-purple-800'
      case 'night':
        return 'bg-blue-100 text-blue-800'
      case 'full_day':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleClockIn = async () => {
    setIsLoading(true)
    try {
      await onClockIn(shift.id)
    } catch (error) {
      console.error('Error clocking in:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClockOut = async () => {
    setIsLoading(true)
    try {
      await onClockOut(shift.id)
    } catch (error) {
      console.error('Error clocking out:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-card-title">{shift.carer.full_name}</h3>
          <p className="text-sm text-card-subtext">{formatDate(shift.date)}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getStatusColor(shift.status))}>
            {shift.status.replace('_', ' ')}
          </span>
          <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getShiftTypeColor(shift.shift_type))}>
            {shift.shift_type.replace('_', ' ')}
          </span>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-nav-icon" />
          <span className="text-sm text-card-subtext">
            {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
          </span>
        </div>
        
        {shift.location && (
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-nav-icon" />
            <span className="text-sm text-card-subtext">{shift.location}</span>
          </div>
        )}

        {shift.client_name && (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-nav-icon" />
            <span className="text-sm text-card-subtext">{shift.client_name}</span>
          </div>
        )}
        
        {shift.clock_in && (
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-text-positive" />
            <span className="text-sm text-card-subtext">
              Clock in: {formatTime(shift.clock_in)}
              {shift.clock_in_location && ` (${shift.clock_in_location})`}
            </span>
          </div>
        )}
        
        {shift.clock_out && (
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-text-danger" />
            <span className="text-sm text-card-subtext">
              Clock out: {formatTime(shift.clock_out)}
              {shift.clock_out_location && ` (${shift.clock_out_location})`}
            </span>
          </div>
        )}

        {shift.duration_hours && (
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-nav-icon" />
            <span className="text-sm text-card-subtext">
              Duration: {shift.duration_hours} hours
            </span>
          </div>
        )}

        {shift.is_late && (
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            <span className="text-sm text-orange-600">Late arrival</span>
          </div>
        )}

        {shift.is_early_leave && (
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            <span className="text-sm text-orange-600">Left early</span>
          </div>
        )}

        {shift.is_overdue && (
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-600">Overdue</span>
          </div>
        )}
      </div>
      
      {shift.status === 'scheduled' && (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border-default">
          <button 
            onClick={handleClockIn}
            disabled={isLoading}
            className="btn-primary flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            Start Shift
          </button>
          <button className="btn-secondary flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            Cancel
          </button>
        </div>
      )}
      
      {shift.status === 'in_progress' && (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border-default">
          <button 
            onClick={handleClockOut}
            disabled={isLoading}
            className="btn-primary flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Square className="w-4 h-4" />
            )}
            End Shift
          </button>
        </div>
      )}

      {shift.notes && (
        <div className="mt-4 pt-4 border-t border-border-default">
          <p className="text-xs text-card-subtext mb-2">Notes:</p>
          <p className="text-sm text-card-subtext">{shift.notes}</p>
        </div>
      )}
      
      {/* Edit/Delete Actions */}
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border-default">
        <button
          onClick={() => onEdit(shift)}
          className="btn-secondary flex items-center gap-2"
          disabled={isLoading}
        >
          <Edit className="w-4 h-4" />
          Edit
        </button>
        <button
          onClick={() => onDelete(shift)}
          className="text-[#FF6B6B] hover:bg-[#FF6B6B]/10 px-3 py-1 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          disabled={isLoading}
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>
    </div>
  )
}

const ShiftTable = ({ shifts, onClockIn, onClockOut, onEdit, onDelete }: {
  shifts: ShiftType[]
  onClockIn: (shiftId: string) => void
  onClockOut: (shiftId: string) => void
  onEdit: (shift: ShiftType) => void
  onDelete: (shift: ShiftType) => void
}) => (
  <div className="card p-6">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-lg font-semibold text-card-title">All Shifts</h3>
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search shifts..."
            className="input-field pl-10 w-64"
          />
        </div>
        <select className="input-field w-32">
          <option value="all">All Status</option>
          <option value="scheduled">Scheduled</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="no_show">No Show</option>
        </select>
        <button className="btn-secondary flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>
    </div>
    
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border-default">
            <th className="text-left py-3 px-4 font-medium text-text-primary">Carer</th>
            <th className="text-left py-3 px-4 font-medium text-text-primary">Date</th>
            <th className="text-left py-3 px-4 font-medium text-text-primary">Time</th>
            <th className="text-left py-3 px-4 font-medium text-text-primary">Type</th>
            <th className="text-left py-3 px-4 font-medium text-text-primary">Location</th>
            <th className="text-left py-3 px-4 font-medium text-text-primary">Status</th>
            <th className="text-left py-3 px-4 font-medium text-text-primary">Clock In</th>
            <th className="text-left py-3 px-4 font-medium text-text-primary">Clock Out</th>
            <th className="text-left py-3 px-4 font-medium text-text-primary">Actions</th>
          </tr>
        </thead>
        <tbody>
          {shifts.map((shift) => (
            <tr key={shift.id} className="border-b border-border-default hover:bg-bg-highlight">
              <td className="py-3 px-4 text-text-primary">{shift.carer.full_name}</td>
              <td className="py-3 px-4 text-text-secondary">{formatDate(shift.date)}</td>
              <td className="py-3 px-4 text-text-secondary">
                {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
              </td>
              <td className="py-3 px-4 text-text-secondary capitalize">
                {shift.shift_type.replace('_', ' ')}
              </td>
              <td className="py-3 px-4 text-text-secondary">{shift.location || '-'}</td>
              <td className="py-3 px-4">
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  shift.status === 'completed' && "bg-text-positive/10 text-text-positive",
                  shift.status === 'in_progress' && "bg-blue-100 text-blue-800",
                  shift.status === 'scheduled' && "bg-gray-100 text-gray-800",
                  shift.status === 'cancelled' && "bg-text-danger/10 text-text-danger",
                  shift.status === 'no_show' && "bg-orange-100 text-orange-800"
                )}>
                  {shift.status.replace('_', ' ')}
                </span>
              </td>
              <td className="py-3 px-4 text-text-secondary">
                {shift.clock_in ? formatTime(shift.clock_in) : '-'}
              </td>
              <td className="py-3 px-4 text-text-secondary">
                {shift.clock_out ? formatTime(shift.clock_out) : '-'}
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  {shift.status === 'scheduled' && (
                    <button 
                      onClick={() => onClockIn(shift.id)}
                      className="p-1 text-text-positive hover:bg-text-positive/10 rounded"
                      title="Start Shift"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  )}
                  {shift.status === 'in_progress' && (
                    <button 
                      onClick={() => onClockOut(shift.id)}
                      className="p-1 text-text-danger hover:bg-text-danger/10 rounded"
                      title="End Shift"
                    >
                      <Square className="w-4 h-4" />
                    </button>
                  )}
                  <button 
                    onClick={() => onEdit(shift)}
                    className="p-1 text-blue-500 hover:bg-blue-50 rounded" 
                    title="Edit Shift"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => onDelete(shift)}
                    className="p-1 text-[#FF6B6B] hover:bg-red-50 rounded" 
                    title="Delete Shift"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)

export default function ShiftsPage() {
  const { shifts, isLoading, mutate } = useShifts()
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('')
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedShift, setSelectedShift] = useState<ShiftType | null>(null)

  // Filter shifts based on search and filters
  const filteredShifts = shifts.filter((shift: ShiftType) => {
    const matchesSearch = shift.carer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shift.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shift.location?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || shift.status === statusFilter
    
    const matchesDate = !dateFilter || shift.date === dateFilter
    
    return matchesSearch && matchesStatus && matchesDate
  })

  const handleClockIn = async (shiftId: string) => {
    try {
      await apiClient.clockIn(shiftId)
      toast.success('Shift started successfully')
      mutate() // Refresh the data
    } catch (error: any) {
      toast.error(error.message || 'Failed to start shift')
    }
  }

  const handleClockOut = async (shiftId: string) => {
    try {
      await apiClient.clockOut(shiftId)
      toast.success('Shift ended successfully')
      mutate() // Refresh the data
    } catch (error: any) {
      toast.error(error.message || 'Failed to end shift')
    }
  }

  const getStatusCount = (status: string) => {
    return shifts.filter((shift: ShiftType) => shift.status === status).length
  }

  const getShiftTypeCount = (shiftType: string) => {
    return shifts.filter((shift: ShiftType) => shift.shift_type === shiftType).length
  }

  // Modal handlers
  const handleAddShift = () => {
    setShowAddModal(true)
  }

  const handleEditShift = (shift: ShiftType) => {
    setSelectedShift(shift)
    setShowEditModal(true)
  }

  const handleDeleteShift = (shift: ShiftType) => {
    setSelectedShift(shift)
    setShowDeleteModal(true)
  }

  const handleModalClose = () => {
    setShowAddModal(false)
    setShowEditModal(false)
    setShowDeleteModal(false)
    setSelectedShift(null)
  }

  const handleModalSuccess = () => {
    mutate() // Refresh the data
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-btn-primary" />
            <p className="text-text-secondary">Loading shifts...</p>
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
          { label: 'Shifts' }
        ]} />

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              Shift Management
            </h1>
            <p className="text-text-secondary">
              Schedule, monitor, and manage carer shifts
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-bg-highlight rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "px-3 py-1 rounded-md text-sm font-medium transition-colors",
                  viewMode === 'grid' 
                    ? "bg-bg-primary text-text-primary shadow-sm" 
                    : "text-text-secondary hover:text-text-primary"
                )}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={cn(
                  "px-3 py-1 rounded-md text-sm font-medium transition-colors",
                  viewMode === 'table' 
                    ? "bg-bg-primary text-text-primary shadow-sm" 
                    : "text-text-secondary hover:text-text-primary"
                )}
              >
                Table
              </button>
            </div>
            <button 
              onClick={handleAddShift}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Schedule Shift
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-card-subtext">Total Shifts</p>
                <p className="text-2xl font-bold text-card-title">{shifts.length}</p>
              </div>
              <div className="w-12 h-12 bg-btn-primary rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-card-subtext">Scheduled</p>
                <p className="text-2xl font-bold text-card-title">{getStatusCount('scheduled')}</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-gray-800" />
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-card-subtext">In Progress</p>
                <p className="text-2xl font-bold text-card-title">{getStatusCount('in_progress')}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-800" />
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-card-subtext">Completed</p>
                <p className="text-2xl font-bold text-card-title">{getStatusCount('completed')}</p>
              </div>
              <div className="w-12 h-12 bg-text-positive/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-text-positive" />
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-card-subtext">Morning Shifts</p>
                <p className="text-2xl font-bold text-card-title">{getShiftTypeCount('morning')}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-800" />
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-card-subtext">Afternoon Shifts</p>
                <p className="text-2xl font-bold text-card-title">{getShiftTypeCount('afternoon')}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-800" />
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-card-subtext">Full Day Shifts</p>
                <p className="text-2xl font-bold text-card-title">{getShiftTypeCount('full_day')}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-green-800" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-card-title mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="btn-secondary flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              View Calendar
            </button>
            <button className="btn-secondary flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Schedule
            </button>
            <button className="btn-secondary flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              View Alerts
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search shifts by carer, client, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field w-40"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No Show</option>
            </select>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="input-field w-40"
            />
          </div>
        </div>

        {/* Shifts List */}
        {filteredShifts.length === 0 ? (
          <div className="card p-12 text-center">
            <Clock className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-card-title mb-2">No shifts found</h3>
            <p className="text-text-secondary">
              {searchTerm || statusFilter !== 'all' || dateFilter 
                ? 'Try adjusting your search or filters'
                : 'No shifts have been scheduled yet'
              }
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredShifts.map((shift: ShiftType) => (
              <ShiftCard 
                key={shift.id} 
                shift={shift}
                onClockIn={handleClockIn}
                onClockOut={handleClockOut}
                onEdit={handleEditShift}
                onDelete={handleDeleteShift}
              />
            ))}
          </div>
        ) : (
          <ShiftTable 
            shifts={filteredShifts}
            onClockIn={handleClockIn}
            onClockOut={handleClockOut}
            onEdit={handleEditShift}
            onDelete={handleDeleteShift}
          />
        )}
        
        {/* Modals */}
        <AddShiftModal
          isOpen={showAddModal}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
        
        <EditShiftModal
          isOpen={showEditModal}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
          shift={selectedShift}
        />
        
        <DeleteShiftModal
          isOpen={showDeleteModal}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
          shift={selectedShift}
        />
      </div>
    </DashboardLayout>
  )
} 