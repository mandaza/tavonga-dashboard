// Environment configuration
export const config = {
  // API Configuration - Use HTTPS for production
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 
         (process.env.NODE_ENV === 'production' 
           ? 'https://jellyfish-app-ho48c.ondigitalocean.app/api/v1'
           : 'http://localhost:8000/api/v1'),
  
  // Environment
  environment: process.env.NEXT_PUBLIC_ENVIRONMENT || 'development',
  
  // App settings
  appName: 'Tavonga CareConnect',
  appVersion: '1.0.0',
  
  // Feature flags
  features: {
    enableNotifications: true,
    enableRealTimeUpdates: true,
    enableFileUpload: true,
  },
  
  // Pagination defaults
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100,
  },
  
  // Timeouts
  timeouts: {
    apiRequest: 30000, // 30 seconds
    authRefresh: 60000, // 1 minute
  },
}

// API endpoints
export const endpoints = {
  auth: {
    login: '/users/login',
    register: '/users',
    profile: '/users/profile',
    updateProfile: '/users/update_profile',
  },
  users: {
    list: '/users',
    detail: (id: string) => `/users/${id}`,
    approve: (id: string) => `/users/${id}/approve`,
    disable: (id: string) => `/users/${id}/disable`,
    enable: (id: string) => `/users/${id}/enable`,
  },
  behaviors: {
    list: '/behaviors',
    detail: (id: string) => `/behaviors/${id}`,
    myBehaviors: '/behaviors/my_behaviors',
    critical: '/behaviors/critical',
    today: '/behaviors/today',
  },
  activities: {
    list: '/activities',
    detail: (id: string) => `/activities/${id}`,
    logs: '/activities/logs',
    logDetail: (id: string) => `/activities/logs/${id}`,
    todayActivities: '/activities/logs/today',
    myActivities: '/activities/logs/my_activities',
    overdueActivities: '/activities/logs/overdue',
    analytics: '/activities/logs/analytics',
    masteryTracking: '/activities/logs/mastery_tracking',
  },
  goals: {
    list: '/goals',
    detail: (id: string) => `/goals/${id}`,
    track: (id: string) => `/goals/${id}/track`,
  },
  shifts: {
    list: '/shifts',
    detail: (id: string) => `/shifts/${id}`,
    myShifts: '/shifts/my_shifts',
    clockIn: (id: string) => `/shifts/${id}/clock-in`,
    clockOut: (id: string) => `/shifts/${id}/clock-out`,
  },
  reports: {
    behaviors: '/reports/behaviors',
    activities: '/reports/activities',
    shifts: '/reports/shifts',
  },
  media: {
    upload: '/media/upload',
  },
  dashboard: {
    stats: '/dashboard/stats',
  },
} 