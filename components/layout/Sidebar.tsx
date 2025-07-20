'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  BarChart3,
  Calendar,
  Users,
  FileText,
  Clock,
  Settings,
  ChevronLeft,
  ChevronRight,
  Activity,
  Target,
  Brain,
  UserCheck
} from 'lucide-react'

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3
  },
  {
    name: 'Scheduler',
    href: '/scheduler',
    icon: Calendar
  },
  {
    name: 'Activities',
    href: '/activities',
    icon: Activity
  },
  {
    name: 'Behaviors',
    href: '/behaviors',
    icon: Brain
  },
  {
    name: 'Goals',
    href: '/goals',
    icon: Target
  },
  {
    name: 'Clients',
    href: '/clients',
    icon: UserCheck
  },
  {
    name: 'Users',
    href: '/users',
    icon: Users
  },
  {
    name: 'Shifts',
    href: '/shifts',
    icon: Clock
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: FileText
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings
  }
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <div className={cn(
      "bg-nav-bg shadow-nav transition-all duration-300 ease-in-out",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-default">
          {!collapsed && (
            <h1 className="text-lg font-semibold text-text-primary">
              Tavonga CareConnect 
            </h1>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-lg hover:bg-bg-highlight transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4 text-nav-icon" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-nav-icon" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "sidebar-item",
                  isActive && "sidebar-item-active"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5",
                  isActive ? "nav-icon-active" : "nav-icon"
                )} />
                {!collapsed && (
                  <span className={cn(
                    "font-medium",
                    isActive ? "text-text-primary" : "text-text-secondary"
                  )}>
                    {item.name}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        {!collapsed && (
          <div className="p-4 border-t border-border-default">
            <div className="text-xs text-text-muted">
              © 2024 Tavonga CareConnect | Fructox
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 