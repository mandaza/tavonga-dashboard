'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { User, LogOut, Settings, Bell } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth'
import Link from 'next/link'

export default function Header() {
  const [showDropdown, setShowDropdown] = useState(false)
  const { user, logout } = useAuth()
  const currentDate = format(new Date(), 'EEEE, MMMM d, yyyy')

  const handleLogout = () => {
    logout()
    setShowDropdown(false)
  }

  return (
    <header className="bg-bg-appbar border-b border-border-default px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Date */}
        <div className="text-text-secondary">
          {currentDate}
        </div>

        {/* Right side - Notifications and User */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="p-2 rounded-lg hover:bg-bg-highlight transition-colors relative">
            <Bell className="w-5 h-5 text-nav-icon" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-text-danger rounded-full"></span>
          </button>

          {/* User Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-bg-highlight transition-colors"
            >
              <div className="w-8 h-8 bg-icon-profile-container rounded-full flex items-center justify-center">
                {user?.profile_image ? (
                  <img 
                    src={user.profile_image} 
                    alt={user.full_name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-4 h-4 text-icon-profile" />
                )}
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-text-primary">
                  {user?.full_name || 'User'}
                </div>
                <div className="text-xs text-text-secondary">
                  {user?.email || 'user@tavonga.com'}
                </div>
              </div>
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-bg-primary border border-border-default rounded-lg shadow-card z-50">
                <div className="py-2">
                  <Link 
                    href="/profile" 
                    className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-bg-highlight transition-colors"
                    onClick={() => setShowDropdown(false)}
                  >
                    <User className="w-4 h-4 text-nav-icon" />
                    <span className="text-sm text-text-primary">Profile</span>
                  </Link>
                  <Link 
                    href="/settings" 
                    className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-bg-highlight transition-colors"
                    onClick={() => setShowDropdown(false)}
                  >
                    <Settings className="w-4 h-4 text-nav-icon" />
                    <span className="text-sm text-text-primary">Settings</span>
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-bg-highlight transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-nav-icon" />
                    <span className="text-sm text-text-primary">Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
} 