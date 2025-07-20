import { ApiResponse, PaginatedResponse } from '@/types'
import { config } from './config'

// Types for API requests
interface LoginRequest {
  email: string
  password: string
}

interface RegisterRequest {
  username: string
  email: string
  password: string
  password_confirm: string
  first_name: string
  last_name: string
  phone?: string
  address?: string
  emergency_contact?: string
  emergency_phone?: string
  date_of_birth?: string
  role: 'support_worker' | 'practitioner' | 'family' | 'super_admin';
}

interface AuthResponse {
  user: any
  tokens: {
    access: string
    refresh: string
  }
}

// API Client Class
class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    // Add auth token if available
    const token = this.getAuthToken()
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const config: RequestInit = {
      ...options,
      headers,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token')
    }
    return null
  }

  private setAuthToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token)
    }
  }

  private clearAuthToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    }
  }

  // Authentication
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
    
    this.setAuthToken(response.tokens.access)
    if (typeof window !== 'undefined') {
      localStorage.setItem('refresh_token', response.tokens.refresh)
    }
    
    return response
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
    
    return response
  }

  async logout(): Promise<void> {
    this.clearAuthToken()
  }

  async getProfile(): Promise<any> {
    return this.request<any>('/users/profile')
  }

  async updateProfile(userData: Partial<any>): Promise<any> {
    return this.request<any>('/users/update_profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    })
  }

  async changePassword(passwordData: { current_password: string; new_password: string }): Promise<any> {
    return this.request<any>('/users/change_password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    })
  }

  // Clients
  async getClients(params?: Record<string, any>): Promise<PaginatedResponse<any>> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
    return this.request<PaginatedResponse<any>>(`/clients${queryString}`)
  }

  async getClient(id: string): Promise<any> {
    return this.request<any>(`/clients/${id}`)
  }

  async createClient(clientData: any): Promise<any> {
    return this.request<any>('/clients', {
      method: 'POST',
      body: JSON.stringify(clientData),
    })
  }

  async updateClient(id: string, clientData: any): Promise<any> {
    return this.request<any>(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(clientData),
    })
  }

  async deleteClient(id: string): Promise<void> {
    return this.request<void>(`/clients/${id}`, {
      method: 'DELETE',
    })
  }

  async getClientSummary(): Promise<any> {
    return this.request<any>('/clients/summary')
  }

  async getClientContacts(id: string): Promise<any[]> {
    return this.request<any[]>(`/clients/${id}/contacts`)
  }

  // Users (Admin only)
  async getUsers(params?: Record<string, any>): Promise<PaginatedResponse<any>> {
    const base = '/users'
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
    return this.request<PaginatedResponse<any>>(`${base}${queryString}`)
  }

  async approveUser(userId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/users/${userId}/approve`, {
      method: 'POST',
    })
  }

  async disableUser(userId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/users/${userId}/disable`, {
      method: 'POST',
    })
  }

  async enableUser(userId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/users/${userId}/enable`, {
      method: 'POST',
    })
  }

  async updateUser(userId: string, userData: Partial<any>): Promise<any> {
    return this.request<any>(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    })
  }

  async deleteUser(userId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/users/${userId}`, {
      method: 'DELETE',
    })
  }

  // Behaviors
  async getBehaviors(params?: Record<string, any>): Promise<PaginatedResponse<any>> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
    return this.request<PaginatedResponse<any>>(`/behaviors${queryString}`)
  }

  async getBehavior(id: string): Promise<any> {
    return this.request<any>(`/behaviors/${id}`)
  }

  async createBehavior(behaviorData: any): Promise<any> {
    return this.request<any>('/behaviors', {
      method: 'POST',
      body: JSON.stringify(behaviorData),
    })
  }

  async updateBehavior(id: string, behaviorData: any): Promise<any> {
    return this.request<any>(`/behaviors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(behaviorData),
    })
  }

  async deleteBehavior(id: string): Promise<void> {
    return this.request<void>(`/behaviors/${id}`, {
      method: 'DELETE',
    })
  }

  async getMyBehaviors(): Promise<any[]> {
    return this.request<any[]>('/behaviors/my_behaviors')
  }

  async getCriticalBehaviors(): Promise<any[]> {
    return this.request<any[]>('/behaviors/critical')
  }

  async getTodayBehaviors(): Promise<any[]> {
    return this.request<any[]>('/behaviors/today')
  }

  // Activities
  async getActivities(params?: Record<string, any>): Promise<PaginatedResponse<any>> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
    return this.request<PaginatedResponse<any>>(`/activities${queryString}`)
  }

  async getActivity(id: string): Promise<any> {
    return this.request<any>(`/activities/${id}`)
  }

  async createActivity(activityData: any): Promise<any> {
    return this.request<any>('/activities', {
      method: 'POST',
      body: JSON.stringify(activityData),
    })
  }

  async updateActivity(id: string, activityData: any): Promise<any> {
    return this.request<any>(`/activities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(activityData),
    })
  }

  async deleteActivity(id: string): Promise<void> {
    return this.request<void>(`/activities/${id}`, {
      method: 'DELETE',
    })
  }

  // Activity Logs
  async getActivityLogs(params?: Record<string, any>): Promise<PaginatedResponse<any>> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
    return this.request<PaginatedResponse<any>>(`/activities/logs${queryString}`)
  }

  async createActivityLog(logData: any): Promise<any> {
    return this.request<any>('/activities/logs', {
      method: 'POST',
      body: JSON.stringify(logData),
    })
  }

  async updateActivityLog(id: string, logData: any): Promise<any> {
    return this.request<any>(`/activities/logs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(logData),
    })
  }

  async deleteActivityLog(id: string): Promise<void> {
    return this.request<void>(`/activities/logs/${id}`, {
      method: 'DELETE',
    })
  }

  async getActivityLog(id: string): Promise<any> {
    return this.request<any>(`/activities/logs/${id}`)
  }

  async getTodayActivities(): Promise<any[]> {
    return this.request<any[]>('/activities/logs/today')
  }

  async getMyActivities(): Promise<any[]> {
    return this.request<any[]>('/activities/logs/my_activities')
  }

  async getOverdueActivities(): Promise<any[]> {
    return this.request<any[]>('/activities/logs/overdue')
  }

  async getActivityAnalytics(params?: Record<string, any>): Promise<any> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
    return this.request<any>(`/activities/logs/analytics${queryString}`)
  }

  async getMasteryTracking(params?: Record<string, any>): Promise<any> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
    return this.request<any>(`/activities/logs/mastery_tracking${queryString}`)
  }

  // Scheduler
  async getSchedules(params?: Record<string, any>): Promise<PaginatedResponse<any>> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
    return this.request<PaginatedResponse<any>>(`/scheduler/schedules${queryString}`)
  }

  async getSchedule(id: string): Promise<any> {
    return this.request<any>(`/scheduler/schedules/${id}`)
  }

  async createSchedule(scheduleData: any): Promise<any> {
    return this.request<any>('/scheduler/schedules', {
      method: 'POST',
      body: JSON.stringify(scheduleData),
    })
  }

  async updateSchedule(id: string, scheduleData: any): Promise<any> {
    return this.request<any>(`/scheduler/schedules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(scheduleData),
    })
  }

  async deleteSchedule(id: string): Promise<void> {
    return this.request<void>(`/scheduler/schedules/${id}`, {
      method: 'DELETE',
    })
  }

  async getScheduleCalendar(startDate: string, endDate: string): Promise<Record<string, any[]>> {
    return this.request<Record<string, any[]>>(`/scheduler/schedules/calendar?start_date=${startDate}&end_date=${endDate}`)
  }

  async getTodaySchedules(): Promise<any[]> {
    return this.request<any[]>('/scheduler/schedules/today')
  }

  async getUpcomingSchedules(): Promise<any[]> {
    return this.request<any[]>('/scheduler/schedules/upcoming')
  }

  async getOverdueSchedules(): Promise<any[]> {
    return this.request<any[]>('/scheduler/schedules/overdue')
  }

  async performScheduleAction(id: string, action: string, data?: any): Promise<any> {
    return this.request<any>(`/scheduler/schedules/${id}/quick_action`, {
      method: 'POST',
      body: JSON.stringify({ action, ...data }),
    })
  }

  async rescheduleActivity(id: string, newDate: string, newTime: string, reason?: string): Promise<any> {
    return this.request<any>(`/scheduler/schedules/${id}/reschedule`, {
      method: 'POST',
      body: JSON.stringify({
        new_date: newDate,
        new_time: newTime,
        reason
      }),
    })
  }

  async getScheduleStats(): Promise<any> {
    return this.request<any>('/scheduler/schedules/stats')
  }

  async getScheduleConflicts(): Promise<any[]> {
    return this.request<any[]>('/scheduler/schedules/conflicts')
  }

  // Goals
  async getGoals(params?: Record<string, any>): Promise<PaginatedResponse<any>> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
    return this.request<PaginatedResponse<any>>(`/goals${queryString}`)
  }

  async getGoal(id: string): Promise<any> {
    return this.request<any>(`/goals/${id}`)
  }

  async createGoal(goalData: any): Promise<any> {
    return this.request<any>('/goals', {
      method: 'POST',
      body: JSON.stringify(goalData),
    })
  }

  async updateGoal(id: string, goalData: any): Promise<any> {
    return this.request<any>(`/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(goalData),
    })
  }

  async deleteGoal(id: string): Promise<void> {
    return this.request<void>(`/goals/${id}`, {
      method: 'DELETE',
    })
  }

  async trackGoalProgress(id: string, progressData: any): Promise<any> {
    return this.request<any>(`/goals/${id}/track`, {
      method: 'POST',
      body: JSON.stringify(progressData),
    })
  }

  // Shifts
  async getShifts(params?: Record<string, any>): Promise<PaginatedResponse<any>> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
    return this.request<PaginatedResponse<any>>(`/shifts${queryString}`)
  }

  async getShift(id: string): Promise<any> {
    return this.request<any>(`/shifts/${id}`)
  }

  async createShift(shiftData: any): Promise<any> {
    return this.request<any>('/shifts', {
      method: 'POST',
      body: JSON.stringify(shiftData),
    })
  }

  async updateShift(id: string, shiftData: any): Promise<any> {
    return this.request<any>(`/shifts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(shiftData),
    })
  }

  async deleteShift(id: string): Promise<void> {
    return this.request<void>(`/shifts/${id}`, {
      method: 'DELETE',
    })
  }

  async clockIn(shiftId: string, location?: string): Promise<any> {
    return this.request<any>(`/shifts/${shiftId}/clock-in`, {
      method: 'POST',
      body: JSON.stringify({ location }),
    })
  }

  async clockOut(shiftId: string, location?: string): Promise<any> {
    return this.request<any>(`/shifts/${shiftId}/clock-out`, {
      method: 'PATCH',
      body: JSON.stringify({ location }),
    })
  }

  async getMyShifts(): Promise<any[]> {
    return this.request<any[]>(`/shifts/my_shifts`)
  }

  // Reports
  async getBehaviorReports(params?: Record<string, any>): Promise<any> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
    return this.request<any>(`/reports/behaviors${queryString}`)
  }

  async getActivityReports(params?: Record<string, any>): Promise<any> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
    return this.request<any>(`/reports/activities${queryString}`)
  }

  async getShiftReports(params?: Record<string, any>): Promise<any> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
    return this.request<any>(`/reports/shifts${queryString}`)
  }

  // Media
  async uploadMedia(file: File, metadata?: any): Promise<any> {
    const formData = new FormData()
    formData.append('file', file)
    
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata))
    }

    const token = this.getAuthToken()
    const headers: Record<string, string> = {}
    
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(`${this.baseURL}/media/upload`, {
      method: 'POST',
      headers,
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`)
    }

    return response.json()
  }

  // Dashboard Stats
  async getDashboardStats(): Promise<any> {
    return this.request<any>('/dashboard/stats')
  }

  // Reports
  async generateBehaviorReport(params?: Record<string, any>): Promise<Blob> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
    const response = await fetch(`${this.baseURL}/reports/behaviors${queryString}`, {
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return response.blob()
  }

  async generateActivityReport(params?: Record<string, any>): Promise<Blob> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
    const response = await fetch(`${this.baseURL}/reports/activities${queryString}`, {
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return response.blob()
  }

  async generateShiftReport(params?: Record<string, any>): Promise<Blob> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
    const response = await fetch(`${this.baseURL}/reports/shifts${queryString}`, {
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return response.blob()
  }

  async generateGoalReport(params?: Record<string, any>): Promise<Blob> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
    const response = await fetch(`${this.baseURL}/reports/goals${queryString}`, {
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return response.blob()
  }

  async generateScheduleReport(params?: Record<string, any>): Promise<Blob> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
    const response = await fetch(`${this.baseURL}/reports/schedules${queryString}`, {
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return response.blob()
  }
}

// Create and export the API client instance
export const apiClient = new ApiClient(config.apiUrl)

// Export types for use in components
export type { LoginRequest, RegisterRequest, AuthResponse } 