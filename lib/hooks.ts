import useSWR, { mutate } from 'swr'
import { apiClient } from './api'

// Generic fetcher function
const fetcher = async (url: string) => {
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return response.json()
  } catch (error) {
    console.error('SWR fetcher error:', error)
    throw error
  }
}

// Dashboard hooks
export function useDashboardStats() {
  const { data, error, isLoading } = useSWR(
    '/api/v1/dashboard/stats',
    fetcher,
    { refreshInterval: 30000 } // Refresh every 30 seconds
  )

  return {
    stats: data,
    isLoading,
    isError: error,
    mutate: () => mutate('/api/v1/dashboard/stats')
  }
}

// User hooks
export function useUsers(params?: Record<string, any>) {
  const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
  const base = '/api/v1/users'
  const { data, error, isLoading } = useSWR(
    `${base}${queryString}`,
    fetcher
  )

  return {
    users: data?.results || [],
    total: data?.count || 0,
    page: 1, // DRF doesn't return page info this way
    totalPages: Math.ceil((data?.count || 0) / 20), // Assuming 20 per page
    isLoading,
    isError: error,
    mutate: () => mutate(`${base}${queryString}`)
  }
}

export function useUser(id: string) {
  const { data, error, isLoading } = useSWR(
    id ? `/api/v1/users/${id}` : null,
    fetcher
  )

  return {
    user: data,
    isLoading,
    isError: error,
    mutate: () => mutate(`/api/v1/users/${id}`)
  }
}

// Behavior hooks
export function useBehaviors(params?: Record<string, any>) {
  const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
  const { data, error, isLoading } = useSWR(
    `/api/v1/behaviors${queryString}`,
    fetcher
  )

  return {
    behaviors: data?.results || [],
    total: data?.count || 0,
    page: 1,
    totalPages: Math.ceil((data?.count || 0) / 20),
    isLoading,
    isError: error,
    mutate: () => mutate(`/api/v1/behaviors${queryString}`)
  }
}

export function useBehavior(id: string) {
  const { data, error, isLoading } = useSWR(
    id ? `/api/v1/behaviors/${id}` : null,
    fetcher
  )

  return {
    behavior: data,
    isLoading,
    isError: error,
    mutate: () => mutate(`/api/v1/behaviors/${id}`)
  }
}

export function useMyBehaviors() {
  const { data, error, isLoading } = useSWR(
    '/api/v1/behaviors/my_behaviors',
    fetcher
  )

  return {
    behaviors: data || [],
    isLoading,
    isError: error,
    mutate: () => mutate('/api/v1/behaviors/my_behaviors')
  }
}

export function useCriticalBehaviors() {
  const { data, error, isLoading } = useSWR(
    '/api/v1/behaviors/critical',
    fetcher,
    { refreshInterval: 60000 } // Refresh every minute for critical behaviors
  )

  return {
    behaviors: data || [],
    isLoading,
    isError: error,
    mutate: () => mutate('/api/v1/behaviors/critical')
  }
}

export function useTodayBehaviors() {
  const { data, error, isLoading } = useSWR(
    '/api/v1/behaviors/today',
    fetcher
  )

  return {
    behaviors: data || [],
    isLoading,
    isError: error,
    mutate: () => mutate('/api/v1/behaviors/today')
  }
}

// Activity hooks
export function useActivities(params?: Record<string, any>) {
  const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
  const { data, error, isLoading } = useSWR(
    `/api/v1/activities${queryString}`,
    fetcher
  )

  return {
    activities: data?.results || [],
    total: data?.count || 0,
    page: 1,
    totalPages: Math.ceil((data?.count || 0) / 20),
    isLoading,
    isError: error,
    mutate: () => mutate(`/api/v1/activities${queryString}`)
  }
}

export function useActivity(id: string) {
  const { data, error, isLoading } = useSWR(
    id ? `/api/v1/activities/${id}` : null,
    fetcher
  )

  return {
    activity: data,
    isLoading,
    isError: error,
    mutate: () => mutate(`/api/v1/activities/${id}`)
  }
}

// Activity Log hooks
export function useActivityLogs(params?: Record<string, any>) {
  const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
  const { data, error, isLoading } = useSWR(
    `/api/v1/activities/logs${queryString}`,
    fetcher
  )

  return {
    logs: data?.results || [],
    total: data?.count || 0,
    page: 1,
    totalPages: Math.ceil((data?.count || 0) / 20),
    isLoading,
    isError: error,
    mutate: () => mutate(`/api/v1/activities/logs${queryString}`)
  }
}

export function useActivityLog(id: string) {
  const { data, error, isLoading } = useSWR(
    id ? `/api/v1/activities/logs/${id}` : null,
    fetcher
  )

  return {
    log: data,
    isLoading,
    isError: error,
    mutate: () => mutate(`/api/v1/activities/logs/${id}`)
  }
}

export function useTodayActivities() {
  const { data, error, isLoading } = useSWR(
    '/api/v1/activities/logs/today',
    fetcher,
    { refreshInterval: 60000 } // Refresh every minute
  )

  return {
    activities: data || [],
    isLoading,
    isError: error,
    mutate: () => mutate('/api/v1/activities/logs/today')
  }
}

export function useMyActivities() {
  const { data, error, isLoading } = useSWR(
    '/api/v1/activities/logs/my_activities',
    fetcher
  )

  return {
    activities: data || [],
    isLoading,
    isError: error,
    mutate: () => mutate('/api/v1/activities/logs/my_activities')
  }
}

export function useOverdueActivities() {
  const { data, error, isLoading } = useSWR(
    '/api/v1/activities/logs/overdue',
    fetcher,
    { refreshInterval: 300000 } // Refresh every 5 minutes
  )

  return {
    activities: data || [],
    isLoading,
    isError: error,
    mutate: () => mutate('/api/v1/activities/logs/overdue')
  }
}



// Schedule hooks
export function useSchedules(params?: Record<string, any>) {
  const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
  const { data, error, isLoading } = useSWR(
    `/api/v1/scheduler/schedules${queryString}`,
    fetcher
  )

  return {
    schedules: data?.results || [],
    total: data?.count || 0,
    page: data?.page || 1,
    totalPages: Math.ceil((data?.count || 0) / 20), // Assuming 20 per page
    isLoading,
    isError: error,
    mutate: () => mutate(`/api/v1/scheduler/schedules${queryString}`)
  }
}

export function useSchedule(id: string) {
  const { data, error, isLoading } = useSWR(
    id ? `/api/v1/scheduler/schedules/${id}` : null,
    fetcher
  )

  return {
    schedule: data,
    isLoading,
    isError: error,
    mutate: () => mutate(`/api/v1/scheduler/schedules/${id}`)
  }
}

export function useTodaySchedules() {
  const { data, error, isLoading } = useSWR(
    '/api/v1/scheduler/schedules/today',
    fetcher
  )

  return {
    schedules: data || [],
    isLoading,
    isError: error,
    mutate: () => mutate('/api/v1/scheduler/schedules/today')
  }
}

export function useUpcomingSchedules() {
  const { data, error, isLoading } = useSWR(
    '/api/v1/scheduler/schedules/upcoming',
    fetcher
  )

  return {
    schedules: data || [],
    isLoading,
    isError: error,
    mutate: () => mutate('/api/v1/scheduler/schedules/upcoming')
  }
}

export function useOverdueSchedules() {
  const { data, error, isLoading } = useSWR(
    '/api/v1/scheduler/schedules/overdue',
    fetcher
  )

  return {
    schedules: data || [],
    isLoading,
    isError: error,
    mutate: () => mutate('/api/v1/scheduler/schedules/overdue')
  }
}

export function useScheduleCalendar(startDate: string, endDate: string) {
  const { data, error, isLoading } = useSWR(
    `/api/v1/scheduler/schedules/calendar?start_date=${startDate}&end_date=${endDate}`,
    fetcher
  )

  return {
    calendar: data || {},
    isLoading,
    isError: error,
    mutate: () => mutate(`/api/v1/scheduler/schedules/calendar?start_date=${startDate}&end_date=${endDate}`)
  }
}

export function useScheduleStats() {
  const { data, error, isLoading } = useSWR(
    '/api/v1/scheduler/schedules/stats',
    fetcher,
    { refreshInterval: 60000 } // Refresh every minute
  )

  return {
    stats: data,
    isLoading,
    isError: error,
    mutate: () => mutate('/api/v1/scheduler/schedules/stats')
  }
}

// Goal hooks
export function useGoals(params?: Record<string, any>) {
  const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
  const { data, error, isLoading } = useSWR(
    `/api/v1/goals${queryString}`,
    fetcher
  )

  return {
    goals: data?.results || [],
    total: data?.count || 0,
    page: 1,
    totalPages: Math.ceil((data?.count || 0) / 20),
    isLoading,
    isError: error,
    mutate: () => mutate(`/api/v1/goals${queryString}`)
  }
}

export function useGoal(id: string) {
  const { data, error, isLoading } = useSWR(
    id ? `/api/v1/goals/${id}` : null,
    fetcher
  )

  return {
    goal: data,
    isLoading,
    isError: error,
    mutate: () => mutate(`/api/v1/goals/${id}`)
  }
}

// Shift hooks
export function useShifts(params?: Record<string, any>) {
  const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
  const { data, error, isLoading } = useSWR(
    `/api/v1/shifts${queryString}`,
    fetcher
  )

  return {
    shifts: data?.results || [],
    total: data?.count || 0,
    page: 1,
    totalPages: Math.ceil((data?.count || 0) / 20),
    isLoading,
    isError: error,
    mutate: () => mutate(`/api/v1/shifts${queryString}`)
  }
}

export function useShift(id: string) {
  const { data, error, isLoading } = useSWR(
    id ? `/api/v1/shifts/${id}` : null,
    fetcher
  )

  return {
    shift: data,
    isLoading,
    isError: error,
    mutate: () => mutate(`/api/v1/shifts/${id}`)
  }
}

export function useMyShifts() {
  const { data, error, isLoading } = useSWR(
    '/api/v1/shifts/my_shifts',
    fetcher
  )

  return {
    shifts: data || [],
    isLoading,
    isError: error,
    mutate: () => mutate('/api/v1/shifts/my_shifts')
  }
}

// Report hooks
export function useBehaviorReports(params?: Record<string, any>) {
  const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
  const { data, error, isLoading } = useSWR(
    `/api/v1/reports/behaviors${queryString}`,
    fetcher
  )

  return {
    reports: data,
    isLoading,
    isError: error,
    mutate: () => mutate(`/api/v1/reports/behaviors${queryString}`)
  }
}

export function useActivityReports(params?: Record<string, any>) {
  const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
  const { data, error, isLoading } = useSWR(
    `/api/v1/reports/activities${queryString}`,
    fetcher
  )

  return {
    reports: data,
    isLoading,
    isError: error,
    mutate: () => mutate(`/api/v1/reports/activities${queryString}`)
  }
}

export function useShiftReports(params?: Record<string, any>) {
  const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
  const { data, error, isLoading } = useSWR(
    `/api/v1/reports/shifts${queryString}`,
    fetcher
  )

  return {
    reports: data,
    isLoading,
    isError: error,
    mutate: () => mutate(`/api/v1/reports/shifts${queryString}`)
  }
}

// Mutation functions for creating/updating data
export const useCreateBehavior = () => {
  return async (behaviorData: any) => {
    const result = await apiClient.createBehavior(behaviorData)
    mutate('/api/v1/behaviors')
    mutate('/api/v1/behaviors/my_behaviors')
    mutate('/api/v1/behaviors/today')
    return result
  }
}

export const useUpdateBehavior = () => {
  return async (id: string, behaviorData: any) => {
    const result = await apiClient.updateBehavior(id, behaviorData)
    mutate('/api/v1/behaviors')
    mutate(`/api/v1/behaviors/${id}`)
    mutate('/api/v1/behaviors/my_behaviors')
    mutate('/api/v1/behaviors/today')
    return result
  }
}

export const useCreateActivity = () => {
  return async (activityData: any) => {
    const result = await apiClient.createActivity(activityData)
    mutate('/api/v1/activities')
    return result
  }
}

export const useUpdateActivity = () => {
  return async (id: string, activityData: any) => {
    const result = await apiClient.updateActivity(id, activityData)
    mutate('/api/v1/activities')
    mutate(`/api/v1/activities/${id}`)
    return result
  }
}

export const useCreateGoal = () => {
  return async (goalData: any) => {
    const result = await apiClient.createGoal(goalData)
    mutate('/api/v1/goals')
    return result
  }
}

export const useUpdateGoal = () => {
  return async (id: string, goalData: any) => {
    const result = await apiClient.updateGoal(id, goalData)
    mutate('/api/v1/goals')
    mutate(`/api/v1/goals/${id}`)
    return result
  }
}

export const useCreateShift = () => {
  return async (shiftData: any) => {
    const result = await apiClient.createShift(shiftData)
    mutate('/api/v1/shifts')
    return result
  }
}

export const useUpdateShift = () => {
  return async (id: string, shiftData: any) => {
    const result = await apiClient.updateShift(id, shiftData)
    mutate('/api/v1/shifts')
    mutate(`/api/v1/shifts/${id}`)
    return result
  }
}

export const useClockIn = () => {
  return async (shiftId: string, location?: string) => {
    const result = await apiClient.clockIn(shiftId, location)
    mutate('/api/v1/shifts')
    mutate(`/api/v1/shifts/${shiftId}`)
    mutate('/api/v1/shifts/my_shifts')
    return result
  }
}

export const useClockOut = () => {
  return async (shiftId: string, location?: string) => {
    const result = await apiClient.clockOut(shiftId, location)
    mutate('/api/v1/shifts')
    mutate(`/api/v1/shifts/${shiftId}`)
    mutate('/api/v1/shifts/my_shifts')
    return result
  }
}

// Analytics hooks
export function useAnalyticsOverview(params?: Record<string, any>) {
  const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
  const { data, error, isLoading } = useSWR(
    `/api/v1/dashboard/stats${queryString}`,
    fetcher,
    { refreshInterval: 60000 }
  )

  return {
    overview: data,
    isLoading,
    isError: error,
    mutate: () => mutate(`/api/v1/dashboard/stats${queryString}`)
  }
}

export function useBehaviorAnalytics(params?: Record<string, any>) {
  const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
  const { data, error, isLoading } = useSWR(
    `/api/v1/behaviors/reports${queryString}`,
    fetcher
  )

  return {
    behaviorAnalytics: data,
    isLoading,
    isError: error,
    mutate: () => mutate(`/api/v1/behaviors/reports${queryString}`)
  }
}

export function useActivityAnalytics(params?: Record<string, any>) {
  const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
  const { data, error, isLoading } = useSWR(
    `/api/v1/activities/reports${queryString}`,
    fetcher
  )

  return {
    activityAnalytics: data,
    isLoading,
    isError: error,
    mutate: () => mutate(`/api/v1/activities/reports${queryString}`)
  }
}

export function useScheduleAnalytics(params?: Record<string, any>) {
  const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
  const { data, error, isLoading } = useSWR(
    `/api/v1/scheduler/statistics${queryString}`,
    fetcher
  )

  return {
    scheduleAnalytics: data,
    isLoading,
    isError: error,
    mutate: () => mutate(`/api/v1/scheduler/statistics${queryString}`)
  }
}

export function useShiftAnalytics(params?: Record<string, any>) {
  const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
  const { data, error, isLoading } = useSWR(
    `/api/v1/shifts/reports${queryString}`,
    fetcher
  )

  return {
    shiftAnalytics: data,
    isLoading,
    isError: error,
    mutate: () => mutate(`/api/v1/shifts/reports${queryString}`)
  }
}

export function useTrendData(type: string, params?: Record<string, any>) {
  const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
  const { data, error, isLoading } = useSWR(
    `/api/v1/${type}/trends${queryString}`,
    fetcher
  )

  return {
    trendData: data,
    isLoading,
    isError: error,
    mutate: () => mutate(`/api/v1/${type}/trends${queryString}`)
  }
}

// Tavonga's Behavioral Analytics Hooks
export function useTavongaBehaviorAnalytics(params?: Record<string, any>) {
  const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
  const { data, error, isLoading } = useSWR(
    `/api/v1/behaviors/temporal_patterns${queryString}`,
    fetcher
  )

  return {
    temporalPatterns: data,
    isLoading,
    isError: error,
    mutate: () => mutate(`/api/v1/behaviors/temporal_patterns${queryString}`)
  }
}

export function useTriggerAnalysis(params?: Record<string, any>) {
  const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
  const { data, error, isLoading } = useSWR(
    `/api/v1/behaviors/trigger_analysis${queryString}`,
    fetcher
  )

  return {
    triggerAnalysis: data,
    isLoading,
    isError: error,
    mutate: () => mutate(`/api/v1/behaviors/trigger_analysis${queryString}`)
  }
}

export function useInterventionAnalysis(params?: Record<string, any>) {
  const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
  const { data, error, isLoading } = useSWR(
    `/api/v1/behaviors/intervention_effectiveness${queryString}`,
    fetcher
  )

  return {
    interventionAnalysis: data,
    isLoading,
    isError: error,
    mutate: () => mutate(`/api/v1/behaviors/intervention_effectiveness${queryString}`)
  }
}

export function useWorkerAnalysis(params?: Record<string, any>) {
  const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
  const { data, error, isLoading } = useSWR(
    `/api/v1/behaviors/worker_analysis${queryString}`,
    fetcher
  )

  return {
    workerAnalysis: data,
    isLoading,
    isError: error,
    mutate: () => mutate(`/api/v1/behaviors/worker_analysis${queryString}`)
  }
}

export function usePredictiveIndicators(params?: Record<string, any>) {
  const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
  const { data, error, isLoading } = useSWR(
    `/api/v1/behaviors/predictive_indicators${queryString}`,
    fetcher
  )

  return {
    predictiveIndicators: data,
    isLoading,
    isError: error,
    mutate: () => mutate(`/api/v1/behaviors/predictive_indicators${queryString}`)
  }
}

export function useCurrentBehaviorTrends(params?: Record<string, any>) {
  const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
  const { data, error, isLoading } = useSWR(
    `/api/v1/behaviors/current_trends${queryString}`,
    fetcher,
    { refreshInterval: 30000 } // Refresh every 30 seconds for current data
  )

  return {
    currentTrends: data,
    isLoading,
    isError: error,
    mutate: () => mutate(`/api/v1/behaviors/current_trends${queryString}`)
  }
}

export function useGoalAnalytics(params?: Record<string, any>) {
  const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
  const { data, error, isLoading } = useSWR(
    `/api/v1/goals/analytics${queryString}`,
    fetcher
  )

  return {
    goalAnalytics: data,
    isLoading,
    isError: error,
    mutate: () => mutate(`/api/v1/goals/analytics${queryString}`)
  }
}

export function useGoalProgressTrends(params?: Record<string, any>) {
  const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
  const { data, error, isLoading } = useSWR(
    `/api/v1/goals/progress_trends${queryString}`,
    fetcher
  )

  return {
    progressTrends: data,
    isLoading,
    isError: error,
    mutate: () => mutate(`/api/v1/goals/progress_trends${queryString}`)
  }
}

export function useTavongaActivityAnalytics(params?: Record<string, any>) {
  const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
  const { data, error, isLoading } = useSWR(
    `/api/v1/activities/logs/analytics${queryString}`,
    fetcher
  )

  return {
    activityAnalytics: data,
    isLoading,
    isError: error,
    mutate: () => mutate(`/api/v1/activities/logs/analytics${queryString}`)
  }
}

export function useMasteryTracking(params?: Record<string, any>) {
  const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
  const { data, error, isLoading } = useSWR(
    `/api/v1/activities/logs/mastery_tracking${queryString}`,
    fetcher
  )

  return {
    masteryTracking: data,
    isLoading,
    isError: error,
    mutate: () => mutate(`/api/v1/activities/logs/mastery_tracking${queryString}`)
  }
}

// Client hooks
export function useClients(params?: Record<string, any>) {
  const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
  const { data, error, isLoading } = useSWR(
    `/api/v1/clients/${queryString}`,
    fetcher
  )

  return {
    clients: data?.results || data || [],
    total: data?.count || 0,
    isLoading,
    isError: error,
    mutate: () => mutate(`/api/v1/clients/${queryString}`)
  }
}

export function useClient(id: string) {
  const { data, error, isLoading } = useSWR(
    id ? `/api/v1/clients/${id}/` : null,
    fetcher
  )

  return {
    client: data,
    isLoading,
    isError: error,
    mutate: () => mutate(`/api/v1/clients/${id}/`)
  }
}

export function useClientContacts(clientId: string) {
  const { data, error, isLoading } = useSWR(
    clientId ? `/api/v1/clients/${clientId}/contacts/` : null,
    fetcher
  )

  return {
    contacts: data || [],
    isLoading,
    isError: error,
    mutate: () => mutate(`/api/v1/clients/${clientId}/contacts/`)
  }
}

export function useClientEmergencyContacts(clientId: string) {
  const { data, error, isLoading } = useSWR(
    clientId ? `/api/v1/clients/${clientId}/emergency_contacts/` : null,
    fetcher
  )

  return {
    emergencyContacts: data || [],
    isLoading,
    isError: error,
    mutate: () => mutate(`/api/v1/clients/${clientId}/emergency_contacts/`)
  }
}

export function usePrimaryClient() {
  // Use the first client's actual UUID (Tavonga)
  const clientId = 'd21bc38c-7ab1-42cb-9c7f-dabd45f129d9'
  const { data: client, error, isLoading } = useSWR(
    `/api/v1/clients/${clientId}/?v=2`,
    fetcher
  )

  // Fetch contacts for the primary client
  const { data: contacts } = useSWR(
    clientId ? `/api/v1/clients/${clientId}/contacts/?v=2` : null,
    fetcher
  )

  const { data: emergencyContacts } = useSWR(
    clientId ? `/api/v1/clients/${clientId}/emergency_contacts/?v=2` : null,
    fetcher
  )

  return {
    client,
    contacts: contacts || [],
    emergencyContacts: emergencyContacts || [],
    isLoading,
    isError: error,
    mutate: () => {
      mutate(`/api/v1/clients/${clientId}/?v=2`)
      mutate(`/api/v1/clients/${clientId}/contacts/?v=2`)
      mutate(`/api/v1/clients/${clientId}/emergency_contacts/?v=2`)
    }
  }
}