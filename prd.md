# Product Requirements Document (PRD)

## Tavonga's Autism & Intellectual Disability Support - Admin Web Dashboard

### Project Overview

The Admin Web Dashboard is the control center for the Tavonga support platform. It allows administrators to manage carers, plan daily activities, track behaviors, assign and monitor shifts, and generate reports. This dashboard will be built using Next.js and Tailwind CSS, with a strong focus on accessibility, analytics, and operational efficiency.

---

### Level

Medium to Advanced

### Type of Project

Admin Panel Development (Web), Behavior & Shift Analytics, Scheduling & Reporting Interface

---

### Skills Required

- Next.js (React framework)
- Tailwind CSS (UI styling)
- Chart.js or Recharts (data visualization)
- RESTful API integration
- SWR or React Query (data fetching)
- Role-based access control implementation

---

### Pages Required:

1. **Login Page**

   - Admin logs in using email and password
   - Input validation and error handling

2. **Dashboard/Home**

   - Overview of recent behavior logs and activity completion
   - Weekly and monthly analytics charts
   - Key stats: top behaviors, most used interventions, recent carer logs

3. **Behavior Analytics Page**

   - Visual graphs (Chart.js or Recharts):
     - Daily, weekly, monthly behavior timelines
     - Most common behaviors and triggers
     - Interventions and effectiveness
   - Exportable behavior reports

4. **Daily Plan & Scheduler Page**

   - 14-day calendar to assign activities
   - Drag-and-drop or form-based assignment
   - View by day or week

5. **Activity Pool Management Page**

   - Create/edit/delete activities
   - Tag to goals, include instructions, location, prerequisites

6. **Goals Management Page**

   - Create/edit/delete goals
   - Link activities to goals
   - View goal progression

7. **User Management Page**

   - Approve/reject carer signups
   - Reset passwords, disable accounts
   - View carer log activity

8. **Reports Page**

   - Export behavior or activity logs (CSV/PDF)
   - Filter by carer, behavior, date, severity, goal

9. **Shift Management Page**

   - Assign shifts (start/end time, location) to carers
   - View all upcoming, active, and completed shifts
   - See carer clock-in/out history
   - Flag late/missed shifts
   - Export shift logs

---

### User Roles and Permissions:

- **Admin**
  - Full access to all features
  - Can manage carers, activities, goals, plans, and shifts
  - Can generate and export analytics and reports

---

### Shared Components:

**Navigation System –**\
Sidebar layout with collapsible Tailwind sidebar\
Sections: Dashboard, Analytics, Scheduler, Shifts, Carers, Reports

**Header/Top Bar –**

- User avatar dropdown
- Current date and quick links (e.g., logout)

**Breadcrumbs –**

- Used in nested pages (e.g., Dashboard > Reports > Export)

---

### Modals/Popups:

- Add/Edit Activity Modal
- Add/Edit Goal Modal
- Assign Shift Modal
- Confirm Deletion Modal
- Preview Report Modal
- Toasts for feedback

---

### Technical Requirements:

- Use **Next.js** for frontend framework
- Use **Tailwind CSS** for styling
- Component-based architecture with reusable forms and tables
- Use **SWR** or **React Query** for API data fetching
- URL-based routing via Next.js routing
- Connect to Django REST API backend
- Charting via **Chart.js** or **Recharts**
- Mock API data example:

```json
{
  "id": "shift_102",
  "carer_id": "carer_01",
  "date": "2025-06-29",
  "start_time": "08:00",
  "end_time": "14:00",
  "clock_in": "08:05",
  "clock_out": "13:58",
  "status": "Completed"
}
```

---

### Additional Considerations:

- Clean modular folder structure
- Accessible, keyboard-navigable UI
- Responsive for tablets/laptops
- Form validation and helper tooltips
- Focused on usability for non-technical admins

---

### Deliverables:

- Fully functional **Next.js Admin Dashboard**
- Integration with Django REST backend
- Role-based authentication
- Shift, activity, and behavior tracking interfaces
- Analytics and exportable reporting tools
- Responsive and accessible UI built with Tailwind CSS

