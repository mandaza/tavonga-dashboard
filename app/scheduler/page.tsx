'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import AddScheduleModal from '@/components/AddScheduleModal'
import EditScheduleModal from '@/components/EditScheduleModal'
import DeleteScheduleModal from '@/components/DeleteScheduleModal'
import { 
  Calendar, 
  Plus, 
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Trash2,
  Grid3x3,
  List,
  ChevronDown
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate, formatTime } from '@/lib/utils'
import { useSchedules } from '@/lib/hooks'
import { Activity, User as UserType } from '@/types'
import toast from 'react-hot-toast'

// Helper function to format date as YYYY-MM-DD in local timezone
const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Helper function to get today's date in local timezone
const getTodayLocalDate = (): string => {
  return formatLocalDate(new Date())
}

// Generate calendar month data
const generateCalendarDays = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDate = new Date(firstDay)
  const endDate = new Date(lastDay)
  
  // Start from the beginning of the week containing the first day
  startDate.setDate(startDate.getDate() - startDate.getDay())
  
  // End at the end of the week containing the last day
  endDate.setDate(endDate.getDate() + (6 - endDate.getDay()))
  
  const days = []
  const current = new Date(startDate)
  
  while (current <= endDate) {
    days.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }
  
  return days
}

// Generate 7 days from a start date for week view
const generateWeekDays = (startDate: Date) => {
  const days = []
  const current = new Date(startDate)
  
  for (let i = 0; i < 7; i++) {
    days.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }
  
  return days
}

// Get the start of the week for a given date
const getWeekStart = (date: Date) => {
  const start = new Date(date)
  start.setDate(start.getDate() - start.getDay())
  return start
}

const CalendarDay = ({ 
  date, 
  activities, 
  onAddSchedule, 
  onEditSchedule,
  isCurrentMonth = true,
  view = 'month'
}: { 
  date: Date; 
  activities: any[]; 
  onAddSchedule: (date?: string) => void;
  onEditSchedule: (activityLog: any) => void;
  isCurrentMonth?: boolean;
  view?: 'month' | 'week';
}) => {
  const isToday = new Date().toDateString() === date.toDateString()
  const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' })
  const dayNumber = date.getDate()
  const isPast = date < new Date(new Date().setHours(0, 0, 0, 0))
  
  const minHeight = view === 'month' ? 'min-h-[120px]' : 'min-h-[200px]'
  
  return (
    <div className={cn(
      "border border-border-default rounded-lg p-3",
      minHeight,
      isToday && "bg-bg-highlight border-btn-primary",
      !isCurrentMonth && "opacity-40",
      isPast && "bg-gray-50"
    )}>
      <div className="flex items-center justify-between mb-2">
        <div>
          {view === 'week' && (
            <p className="text-xs text-text-muted">{dayOfWeek}</p>
          )}
          <p className={cn(
            "text-sm font-semibold",
            isToday ? "text-btn-primary" : "text-text-primary",
            !isCurrentMonth && "text-text-muted"
          )}>
            {dayNumber}
          </p>
        </div>
        {isToday && (
          <div className="w-2 h-2 bg-btn-primary rounded-full"></div>
        )}
      </div>
      
      {/* Activities for this day */}
      <div className="space-y-1">
        {activities.slice(0, view === 'month' ? 3 : 10).map((activity, index) => (
          <div
            key={activity.id || index}
            className={cn(
              "text-xs p-2 rounded cursor-pointer transition-colors",
              activity.status === 'completed' 
                ? "bg-green-100 text-green-800 hover:bg-green-200" 
                : activity.status === 'in_progress'
                ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                : activity.status === 'cancelled'
                ? "bg-red-100 text-red-800 hover:bg-red-200"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            )}
            onClick={() => onEditSchedule(activity)}
          >
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span className="truncate">{activity.scheduled_time}</span>
            </div>
            <div className="truncate font-medium">
              {activity.activity?.name || 'Activity'}
            </div>
          </div>
        ))}
        
        {activities.length > (view === 'month' ? 3 : 10) && (
          <div className="text-xs text-text-muted">
            +{activities.length - (view === 'month' ? 3 : 10)} more
          </div>
        )}
      </div>
      
      {/* Add activity button */}
      {!isPast && (
        <button
          onClick={() => onAddSchedule(formatLocalDate(date))}
          className="mt-2 w-full text-xs text-btn-primary hover:bg-bg-highlight p-1 rounded transition-colors flex items-center justify-center gap-1"
        >
          <Plus className="w-3 h-3" />
          Add
        </button>
      )}
    </div>
  )
}

const MonthView = ({ 
  activityLogs, 
  onAddSchedule, 
  onEditSchedule, 
  onDeleteSchedule,
  currentDate,
  onDateChange
}: { 
  activityLogs: any[], 
  onAddSchedule: (date?: string) => void,
  onEditSchedule: (activityLog: any) => void,
  onDeleteSchedule: (activityLog: any) => void,
  currentDate: Date,
  onDateChange: (date: Date) => void
}) => {
  const days = generateCalendarDays(currentDate.getFullYear(), currentDate.getMonth())
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  
  const getActivitiesForDate = (date: Date) => {
    const dateString = formatLocalDate(date)
    return activityLogs.filter(log => log.scheduled_date === dateString) || []
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    onDateChange(newDate)
  }

  const goToToday = () => {
    onDateChange(new Date())
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-card-title">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm bg-btn-primary text-white rounded hover:bg-btn-primary-hover transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 rounded-lg hover:bg-bg-highlight transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 rounded-lg hover:bg-bg-highlight transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-text-secondary py-2">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((date, index) => {
          const isCurrentMonth = date.getMonth() === currentDate.getMonth()
          const activities = getActivitiesForDate(date)
          
          return (
            <CalendarDay
              key={index}
              date={date}
              activities={activities}
              onAddSchedule={onAddSchedule}
              onEditSchedule={onEditSchedule}
              isCurrentMonth={isCurrentMonth}
              view="month"
            />
          )
        })}
      </div>
    </div>
  )
}

const WeekView = ({ 
  activityLogs, 
  onAddSchedule, 
  onEditSchedule, 
  onDeleteSchedule,
  currentDate,
  onDateChange
}: { 
  activityLogs: any[], 
  onAddSchedule: (date?: string) => void,
  onEditSchedule: (activityLog: any) => void,
  onDeleteSchedule: (activityLog: any) => void,
  currentDate: Date,
  onDateChange: (date: Date) => void
}) => {
  const weekStart = getWeekStart(currentDate)
  const weekDays = generateWeekDays(weekStart)
  
  const getActivitiesForDate = (date: Date) => {
    const dateString = formatLocalDate(date)
    return activityLogs.filter(log => log.scheduled_date === dateString) || []
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 7)
    } else {
      newDate.setDate(newDate.getDate() + 7)
    }
    onDateChange(newDate)
  }

  const goToToday = () => {
    onDateChange(new Date())
  }

  const formatWeekRange = (startDate: Date) => {
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + 6)
    
    if (startDate.getMonth() === endDate.getMonth()) {
      return `${startDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${endDate.getDate()}, ${startDate.getFullYear()}`
    } else {
      return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${endDate.getFullYear()}`
    }
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-card-title">
            {formatWeekRange(weekStart)}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm bg-btn-primary text-white rounded hover:bg-btn-primary-hover transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => navigateWeek('prev')}
            className="p-2 rounded-lg hover:bg-bg-highlight transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigateWeek('next')}
            className="p-2 rounded-lg hover:bg-bg-highlight transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Week grid */}
      <div className="grid grid-cols-7 gap-4">
        {weekDays.map((date, index) => {
          const activities = getActivitiesForDate(date)
          
          return (
            <CalendarDay
              key={index}
              date={date}
              activities={activities}
              onAddSchedule={onAddSchedule}
              onEditSchedule={onEditSchedule}
              view="week"
            />
          )
        })}
      </div>
    </div>
  )
}

const ActivityList = ({ 
  activityLogs, 
  onAddSchedule, 
  onEditSchedule, 
  onDeleteSchedule 
}: {
  activityLogs: any[];
  onAddSchedule: (date?: string) => void;
  onEditSchedule: (activityLog: any) => void;
  onDeleteSchedule: (activityLog: any) => void;
}) => {
  const today = getTodayLocalDate()
  const todayActivities = activityLogs.filter(log => log.scheduled_date === today)
  
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-card-title">Today's Activities</h3>
        <button 
          onClick={() => onAddSchedule(today)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Schedule Activity
        </button>
      </div>
      
      <div className="space-y-3">
        {todayActivities.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-card-subtext mb-4">No activities scheduled for today</p>
            <button 
              onClick={() => onAddSchedule(today)}
              className="btn-primary flex items-center gap-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              Schedule First Activity
            </button>
          </div>
        ) : (
          todayActivities.map((activityLog) => (
            <div
              key={activityLog.id}
              className="flex items-center justify-between p-4 bg-bg-highlight rounded-lg"
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-3 h-3 rounded-full",
                  activityLog.status === 'completed' && "bg-text-positive",
                  activityLog.status === 'in_progress' && "bg-blue-500",
                  activityLog.status === 'scheduled' && "bg-gray-400",
                  activityLog.status === 'cancelled' && "bg-text-danger"
                )}></div>
                
                <div>
                  <h4 className="font-medium text-card-title">{activityLog.activity.name}</h4>
                  <div className="flex items-center gap-4 mt-1">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-nav-icon" />
                      <span className="text-xs text-card-subtext">
                        {formatTime(activityLog.scheduled_time)}
                      </span>
                    </div>
                    {activityLog.assigned_user && (
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3 text-nav-icon" />
                        <span className="text-xs text-card-subtext">{activityLog.assigned_user.full_name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  activityLog.status === 'completed' && "bg-text-positive/10 text-text-positive",
                  activityLog.status === 'in_progress' && "bg-blue-100 text-blue-800",
                  activityLog.status === 'scheduled' && "bg-gray-100 text-gray-800",
                  activityLog.status === 'cancelled' && "bg-text-danger/10 text-text-danger"
                )}>
                  {activityLog.status.replace('_', ' ')}
                </span>
                
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => onEditSchedule(activityLog)}
                    className="p-1 text-[#4ECDC4] hover:bg-[#4ECDC4]/10 rounded"
                    title="Edit activity"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => onDeleteSchedule(activityLog)}
                    className="p-1 text-text-danger hover:bg-text-danger/10 rounded"
                    title="Delete activity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

const ActiveActivitiesStatus = ({ 
  activityLogs, 
  onEditSchedule, 
  onDeleteSchedule 
}: {
  activityLogs: any[];
  onEditSchedule: (activityLog: any) => void;
  onDeleteSchedule: (activityLog: any) => void;
}) => {
  const inProgressActivities = activityLogs.filter(log => log.status === 'in_progress')
  const completedActivities = activityLogs.filter(log => log.status === 'completed')
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* In Progress Activities */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-card-title flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            In Progress Activities ({inProgressActivities.length})
          </h3>
        </div>
        
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {inProgressActivities.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-card-subtext">No activities in progress</p>
            </div>
          ) : (
            inProgressActivities.map((activityLog) => (
              <div
                key={activityLog.id}
                className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200"
              >
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  
                  <div className="flex-1">
                    <h4 className="font-medium text-card-title">{activityLog.activity.name}</h4>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-nav-icon" />
                        <span className="text-xs text-card-subtext">
                          {formatDate(activityLog.scheduled_date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-nav-icon" />
                        <span className="text-xs text-card-subtext">
                          {formatTime(activityLog.scheduled_time)}
                        </span>
                      </div>
                      {activityLog.assigned_user && (
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3 text-nav-icon" />
                          <span className="text-xs text-card-subtext">{activityLog.assigned_user.full_name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    In Progress
                  </span>
                  
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => onEditSchedule(activityLog)}
                      className="p-1 text-[#4ECDC4] hover:bg-[#4ECDC4]/10 rounded"
                      title="Edit activity"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onDeleteSchedule(activityLog)}
                      className="p-1 text-text-danger hover:bg-text-danger/10 rounded"
                      title="Delete activity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Completed Activities */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-card-title flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-text-positive" />
            Completed Activities ({completedActivities.length})
          </h3>
        </div>
        
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {completedActivities.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-card-subtext">No completed activities</p>
            </div>
          ) : (
            completedActivities.map((activityLog) => (
              <div
                key={activityLog.id}
                className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200"
              >
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 bg-text-positive rounded-full"></div>
                  
                  <div className="flex-1">
                    <h4 className="font-medium text-card-title">{activityLog.activity.name}</h4>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-nav-icon" />
                        <span className="text-xs text-card-subtext">
                          {formatDate(activityLog.scheduled_date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-nav-icon" />
                        <span className="text-xs text-card-subtext">
                          {formatTime(activityLog.scheduled_time)}
                        </span>
                      </div>
                      {activityLog.assigned_user && (
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3 text-nav-icon" />
                          <span className="text-xs text-card-subtext">{activityLog.assigned_user.full_name}</span>
                        </div>
                      )}
                    </div>
                    {activityLog.completion_percentage && (
                      <div className="mt-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-text-positive h-2 rounded-full transition-all duration-300"
                              style={{ width: `${activityLog.completion_percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-card-subtext">{activityLog.completion_percentage}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-text-positive/10 text-text-positive">
                    Completed
                  </span>
                  
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => onEditSchedule(activityLog)}
                      className="p-1 text-[#4ECDC4] hover:bg-[#4ECDC4]/10 rounded"
                      title="Edit activity"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onDeleteSchedule(activityLog)}
                      className="p-1 text-text-danger hover:bg-text-danger/10 rounded"
                      title="Delete activity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

const QuickStats = ({ activityLogs }: { activityLogs: any[] }) => {
  const today = getTodayLocalDate()
  const todayActivities = activityLogs.filter(log => log.scheduled_date === today)
  
  // Debug logging to identify the issue
  console.log('=== QuickStats Debug ===')
  console.log('Today (local):', today)
  console.log('Total activities:', activityLogs.length)
  console.log('Activity dates:', activityLogs.map(log => ({ id: log.id, date: log.scheduled_date, status: log.status })))
  console.log('Today activities found:', todayActivities.length)
  console.log('Scheduled today:', todayActivities.filter(a => a.status === 'scheduled').length)
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-card-subtext">Scheduled Today</p>
            <p className="text-2xl font-bold text-card-title">
              {todayActivities.filter(a => a.status === 'scheduled').length || 0}
            </p>
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
            <p className="text-2xl font-bold text-card-title">
              {todayActivities.filter(a => a.status === 'in_progress').length || 0}
            </p>
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
            <p className="text-2xl font-bold text-card-title">
              {todayActivities.filter(a => a.status === 'completed').length || 0}
            </p>
          </div>
          <div className="w-12 h-12 bg-text-positive/10 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-text-positive" />
          </div>
        </div>
      </div>
      
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-card-subtext">Total Activities</p>
            <p className="text-2xl font-bold text-card-title">{activityLogs.length}</p>
          </div>
          <div className="w-12 h-12 bg-btn-primary rounded-lg flex items-center justify-center">
            <Plus className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SchedulerPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedActivityLog, setSelectedActivityLog] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [view, setView] = useState<'month' | 'week'>('month')
  const [currentDate, setCurrentDate] = useState(new Date())

  const { schedules: activityLogs, isLoading, isError, mutate } = useSchedules()

  const handleAddSchedule = (date?: string) => {
    if (date) {
      setSelectedDate(date)
    }
    setIsAddModalOpen(true)
  }

  const handleEditSchedule = (activityLog: any) => {
    setSelectedActivityLog(activityLog)
    setIsEditModalOpen(true)
  }

  const handleDeleteSchedule = (activityLog: any) => {
    setSelectedActivityLog(activityLog)
    setIsDeleteModalOpen(true)
  }

  const handleModalSuccess = () => {
    mutate()
    toast.success('Schedule updated successfully!')
  }

  const handleModalClose = () => {
    setSelectedActivityLog(null)
    setSelectedDate('')
  }

  const handleViewChange = (newView: 'month' | 'week') => {
    setView(newView)
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-btn-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (isError) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-text-danger mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-text-primary mb-2">Error Loading Schedule</h2>
            <p className="text-text-secondary">Please try refreshing the page</p>
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
          { label: 'Scheduler' }
        ]} />

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              Activity Scheduler
            </h1>
            <p className="text-text-secondary">
              Plan and schedule daily activities with full calendar functionality
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* View Switcher */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => handleViewChange('month')}
                className={cn(
                  "px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center gap-2",
                  view === 'month' 
                    ? "bg-white text-btn-primary shadow-sm" 
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                <Grid3x3 className="w-4 h-4" />
                Month
              </button>
              <button
                onClick={() => handleViewChange('week')}
                className={cn(
                  "px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center gap-2",
                  view === 'week' 
                    ? "bg-white text-btn-primary shadow-sm" 
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                <List className="w-4 h-4" />
                Week
              </button>
            </div>
            
            <button 
              onClick={() => handleAddSchedule()}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Schedule Activity
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <QuickStats activityLogs={activityLogs} />

        {/* Calendar Views */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3">
            {view === 'month' ? (
              <MonthView 
                activityLogs={activityLogs}
                onAddSchedule={handleAddSchedule}
                onEditSchedule={handleEditSchedule}
                onDeleteSchedule={handleDeleteSchedule}
                currentDate={currentDate}
                onDateChange={setCurrentDate}
              />
            ) : (
              <WeekView 
                activityLogs={activityLogs}
                onAddSchedule={handleAddSchedule}
                onEditSchedule={handleEditSchedule}
                onDeleteSchedule={handleDeleteSchedule}
                currentDate={currentDate}
                onDateChange={setCurrentDate}
              />
            )}
          </div>
          
          {/* Side Panel - Always show activity list */}
          <div className="xl:col-span-1">
            <ActivityList 
              activityLogs={activityLogs}
              onAddSchedule={handleAddSchedule}
              onEditSchedule={handleEditSchedule}
              onDeleteSchedule={handleDeleteSchedule}
            />
          </div>
        </div>

        {/* Active Activities Status - Show below calendar in mobile/tablet */}
        <div className="xl:hidden">
          <ActiveActivitiesStatus 
            activityLogs={activityLogs}
            onEditSchedule={handleEditSchedule}
            onDeleteSchedule={handleDeleteSchedule}
          />
        </div>
      </div>

      {/* Modals */}
      <AddScheduleModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          handleModalClose()
        }}
        onSuccess={handleModalSuccess}
        selectedDate={selectedDate}
      />

      <EditScheduleModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          handleModalClose()
        }}
        onSuccess={handleModalSuccess}
        activityLog={selectedActivityLog}
      />

      <DeleteScheduleModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          handleModalClose()
        }}
        onSuccess={handleModalSuccess}
        activityLog={selectedActivityLog}
      />
    </DashboardLayout>
  )
} 