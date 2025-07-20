'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  CheckCircle,
  XCircle,
  MoreVertical,
  Mail,
  Phone,
  Calendar,
  UserCheck,
  UserX,
  Shield,
  Heart,
  Stethoscope,
  Eye,
  Edit,
  Trash2,
  Key,
  Lock,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils'
import { useRequireAdmin } from '@/lib/auth'
import { useUsers } from '@/lib/hooks'
import { apiClient } from '@/lib/api'
import toast from 'react-hot-toast'
import { User } from '@/types'
import AddUserModal from '@/components/AddUserModal'
import EditUserModal from '@/components/EditUserModal'
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog'

const UserCard = ({ user, onApprove, onDisable, onEnable, onEdit, onDelete }: { 
  user: User
  onApprove: (userId: string) => void
  onDisable: (userId: string) => void
  onEnable: (userId: string) => void
  onEdit: (user: User) => void
  onDelete: (user: User) => void
}) => {
  const [showActions, setShowActions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const getRoleIcon = (isAdmin: boolean) => {
    if (isAdmin) return <Shield className="w-4 h-4" />
    return <Users className="w-4 h-4" />
  }

  const getRoleColor = (isAdmin: boolean) => {
    if (isAdmin) return 'bg-purple-100 text-purple-800'
    return 'bg-blue-100 text-blue-800'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-text-positive/10 text-text-positive'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'inactive':
        return 'bg-text-danger/10 text-text-danger'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleApprove = async () => {
    setIsLoading(true)
    try {
      await onApprove(user.id)
      setShowActions(false)
    } catch (error) {
      console.error('Error approving user:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisable = async () => {
    setIsLoading(true)
    try {
      await onDisable(user.id)
      setShowActions(false)
    } catch (error) {
      console.error('Error disabling user:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEnable = async () => {
    setIsLoading(true)
    try {
      await onEnable(user.id)
      setShowActions(false)
    } catch (error) {
      console.error('Error enabling user:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-icon-profile-container rounded-full flex items-center justify-center">
            {user.profile_image ? (
              <img 
                src={user.profile_image} 
                alt={user.full_name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <Users className="w-6 h-6 text-icon-profile" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-card-title">{user.full_name}</h3>
            <p className="text-sm text-card-subtext">{user.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getRoleColor(user.is_admin))}>
                {getRoleIcon(user.is_admin)}
                <span className="ml-1">{user.is_admin ? 'Admin' : 'Carer'}</span>
              </span>
              <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getStatusColor(user.approved ? 'active' : 'pending'))}>
                {user.approved ? 'Active' : 'Pending'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 rounded-lg hover:bg-bg-highlight transition-colors"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <MoreVertical className="w-4 h-4 text-nav-icon" />
            )}
          </button>
          
          {showActions && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-bg-primary border border-border-default rounded-lg shadow-card z-50">
              <div className="py-2">
                <button className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-bg-highlight transition-colors">
                  <Eye className="w-4 h-4 text-nav-icon" />
                  <span className="text-sm text-text-primary">View Profile</span>
                </button>
                <button 
                  onClick={() => onEdit(user)}
                  className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-bg-highlight transition-colors"
                >
                  <Edit className="w-4 h-4 text-nav-icon" />
                  <span className="text-sm text-text-primary">Edit User</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-bg-highlight transition-colors">
                  <Key className="w-4 h-4 text-nav-icon" />
                  <span className="text-sm text-text-primary">Reset Password</span>
                </button>
                {!user.approved && (
                  <button 
                    onClick={handleApprove}
                    className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-bg-highlight transition-colors text-text-positive"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">Approve User</span>
                  </button>
                                 )}
                <div className="border-t border-border-default my-2"></div>
                <button 
                  onClick={() => onDelete(user)}
                  className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-bg-highlight transition-colors text-text-danger"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-sm">Delete User</span>
                </button>
                {user.approved && user.is_active_carer && (
                  <button 
                    onClick={handleDisable}
                    className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-bg-highlight transition-colors text-text-danger"
                  >
                    <UserX className="w-4 h-4" />
                    <span className="text-sm">Disable User</span>
                  </button>
                )}
                {!user.is_active_carer && (
                  <button 
                    onClick={handleEnable}
                    className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-bg-highlight transition-colors text-text-positive"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span className="text-sm">Enable User</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="space-y-3 mb-4">
        {user.phone && (
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-nav-icon" />
            <span className="text-sm text-card-subtext">{user.phone}</span>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-nav-icon" />
          <span className="text-sm text-card-subtext">
            Joined {formatDate(user.created_at)}
          </span>
        </div>
        
        
      </div>
      
      {!user.approved && (
        <div className="flex items-center gap-2 pt-4 border-t border-border-default">
          <button 
            onClick={handleApprove}
            disabled={isLoading}
            className="btn-primary flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            Approve
          </button>
          <button 
            onClick={handleDisable}
            disabled={isLoading}
            className="btn-secondary flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
            Reject
          </button>
        </div>
      )}
    </div>
  )
}

const UserTable = ({ users, onApprove, onDisable, onEnable, onEdit, onDelete }: {
  users: User[]
  onApprove: (userId: string) => void
  onDisable: (userId: string) => void
  onEnable: (userId: string) => void
  onEdit: (user: User) => void
  onDelete: (user: User) => void
}) => (
  <div className="card p-6">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-lg font-semibold text-card-title">All Users</h3>
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search users..."
            className="input-field pl-10 w-64"
          />
        </div>
        <select className="input-field w-32">
          <option value="all">All Types</option>
          <option value="admin">Admins</option>
          <option value="carer">Carers</option>
        </select>
        <select className="input-field w-32">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
    </div>
    
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border-default">
            <th className="text-left py-3 px-4 font-medium text-text-primary">User</th>
            <th className="text-left py-3 px-4 font-medium text-text-primary">Type</th>
            <th className="text-left py-3 px-4 font-medium text-text-primary">Status</th>
            <th className="text-left py-3 px-4 font-medium text-text-primary">Phone</th>
            <th className="text-left py-3 px-4 font-medium text-text-primary">Joined</th>
            <th className="text-left py-3 px-4 font-medium text-text-primary">Last Login</th>
            <th className="text-left py-3 px-4 font-medium text-text-primary">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b border-border-default hover:bg-bg-highlight">
              <td className="py-3 px-4">
                <div>
                  <p className="text-text-primary font-medium">{user.full_name}</p>
                  <p className="text-sm text-text-secondary">{user.email}</p>
                </div>
              </td>
              <td className="py-3 px-4">
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  user.is_admin ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                )}>
                  {user.is_admin ? 'Admin' : 'Carer'}
                </span>
              </td>
              <td className="py-3 px-4">
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  user.approved && user.is_active_carer && "bg-text-positive/10 text-text-positive",
                  !user.approved && "bg-yellow-100 text-yellow-800",
                  !user.is_active_carer && "bg-text-danger/10 text-text-danger"
                )}>
                  {user.approved ? (user.is_active_carer ? 'Active' : 'Inactive') : 'Pending'}
                </span>
              </td>
              <td className="py-3 px-4 text-text-secondary">{user.phone || '-'}</td>
              <td className="py-3 px-4 text-text-secondary">{formatDate(user.created_at)}</td>
              <td className="py-3 px-4 text-text-secondary">
                Never
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  {!user.approved && (
                    <button 
                      onClick={() => onApprove(user.id)}
                      className="p-1 text-text-positive hover:bg-text-positive/10 rounded"
                      title="Approve User"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                  {user.approved && user.is_active_carer && (
                    <button 
                      onClick={() => onDisable(user.id)}
                      className="p-1 text-text-danger hover:bg-text-danger/10 rounded"
                      title="Disable User"
                    >
                      <UserX className="w-4 h-4" />
                    </button>
                  )}
                  {!user.is_active_carer && (
                    <button 
                      onClick={() => onEnable(user.id)}
                      className="p-1 text-text-positive hover:bg-text-positive/10 rounded"
                      title="Enable User"
                    >
                      <UserCheck className="w-4 h-4" />
                    </button>
                  )}
                  <button className="p-1 text-nav-icon hover:bg-bg-highlight rounded">
                    <MoreVertical className="w-4 h-4" />
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

export default function UsersPage() {
  const { user: currentUser, loading: authLoading } = useRequireAdmin()
  const { users, isLoading, mutate } = useUsers()
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [showEditUserModal, setShowEditUserModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Filter users based on search and filters
  const filteredUsers = users.filter((user: User) => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && user.approved && user.is_active_carer) ||
      (statusFilter === 'pending' && !user.approved) ||
      (statusFilter === 'inactive' && !user.is_active_carer)
    
    const matchesType = typeFilter === 'all' || 
      (typeFilter === 'admin' && user.is_admin) ||
      (typeFilter === 'carer' && !user.is_admin)
    
    return matchesSearch && matchesStatus && matchesType
  })

  const handleApproveUser = async (userId: string) => {
    try {
      await apiClient.approveUser(userId)
      toast.success('User approved successfully')
      mutate() // Refresh the data
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve user')
    }
  }

  const handleDisableUser = async (userId: string) => {
    try {
      await apiClient.disableUser(userId)
      toast.success('User disabled successfully')
      mutate() // Refresh the data
    } catch (error: any) {
      toast.error(error.message || 'Failed to disable user')
    }
  }

  const handleEnableUser = async (userId: string) => {
    try {
      await apiClient.enableUser(userId)
      toast.success('User enabled successfully')
      mutate() // Refresh the data
    } catch (error: any) {
      toast.error(error.message || 'Failed to enable user')
    }
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setShowEditUserModal(true)
  }

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user)
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedUser) return
    setDeleteLoading(true)
    try {
      await apiClient.deleteUser(selectedUser.id)
      toast.success('User deleted successfully')
      mutate() // Refresh the data
      setShowDeleteDialog(false)
      setSelectedUser(null)
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete user')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleCloseModals = () => {
    setShowEditUserModal(false)
    setShowDeleteDialog(false)
    setSelectedUser(null)
  }

  const getTypeCount = (isAdmin: boolean) => {
    return users.filter((user: User) => user.is_admin === isAdmin).length
  }

  const getStatusCount = (status: string) => {
    switch (status) {
      case 'active':
        return users.filter((user: User) => user.approved && user.is_active_carer).length
      case 'pending':
        return users.filter((user: User) => !user.approved).length
      case 'inactive':
        return users.filter((user: User) => !user.is_active_carer).length
      default:
        return 0
    }
  }

  if (authLoading || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-btn-primary" />
            <p className="text-text-secondary">Loading users...</p>
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
          { label: 'User Management' }
        ]} />

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              User Management
            </h1>
            <p className="text-text-secondary">
              Manage carers and administrators
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
            <button className="btn-primary flex items-center gap-2" onClick={() => setShowAddUserModal(true)}>
              <Plus className="w-4 h-4" />
              Add User
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-card-subtext">Total Users</p>
                <p className="text-2xl font-bold text-card-title">{users.length}</p>
              </div>
              <div className="w-12 h-12 bg-btn-primary rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-card-subtext">Carers</p>
                <p className="text-2xl font-bold text-card-title">{getTypeCount(false)}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-800" />
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-card-subtext">Admins</p>
                <p className="text-2xl font-bold text-card-title">{getTypeCount(true)}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-purple-800" />
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-card-subtext">Pending Approval</p>
                <p className="text-2xl font-bold text-card-title">{getStatusCount('pending')}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-yellow-800" />
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-card-subtext">Active Users</p>
                <p className="text-2xl font-bold text-card-title">{getStatusCount('active')}</p>
              </div>
              <div className="w-12 h-12 bg-text-positive/10 rounded-lg flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-text-positive" />
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-card-subtext">Inactive Users</p>
                <p className="text-2xl font-bold text-card-title">{getStatusCount('inactive')}</p>
              </div>
              <div className="w-12 h-12 bg-text-danger/10 rounded-lg flex items-center justify-center">
                <UserX className="w-6 h-6 text-text-danger" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <select 
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="input-field w-32"
            >
              <option value="all">All Types</option>
              <option value="admin">Admins</option>
              <option value="carer">Carers</option>
            </select>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field w-32"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Users List */}
        {filteredUsers.length === 0 ? (
          <div className="card p-12 text-center">
            <Users className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-card-title mb-2">No users found</h3>
            <p className="text-text-secondary">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'No users have been added yet'
              }
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user: User) => (
              <UserCard 
                key={user.id} 
                user={user}
                onApprove={handleApproveUser}
                onDisable={handleDisableUser}
                onEnable={handleEnableUser}
                onEdit={handleEditUser}
                onDelete={handleDeleteUser}
              />
            ))}
          </div>
        ) : (
          <UserTable 
            users={filteredUsers}
            onApprove={handleApproveUser}
            onDisable={handleDisableUser}
            onEnable={handleEnableUser}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
          />
        )}
        <AddUserModal open={showAddUserModal} onClose={() => setShowAddUserModal(false)} onUserAdded={mutate} />
        <EditUserModal 
          open={showEditUserModal} 
          onClose={handleCloseModals} 
          onUserUpdated={mutate} 
          user={selectedUser} 
        />
        <DeleteConfirmationDialog 
          open={showDeleteDialog} 
          onClose={handleCloseModals} 
          onConfirm={handleConfirmDelete} 
          user={selectedUser} 
          loading={deleteLoading} 
        />
      </div>
    </DashboardLayout>
  )
} 