import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

// Chart.js default options
export const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        color: '#000000',
        font: {
          size: 12,
        },
      },
    },
    tooltip: {
      backgroundColor: '#FFFFFF',
      titleColor: '#000000',
      bodyColor: '#6D6D6D',
      borderColor: '#E0E0E0',
      borderWidth: 1,
      cornerRadius: 8,
      displayColors: true,
    },
  },
  scales: {
    x: {
      grid: {
        color: '#E5E5E5',
        drawBorder: false,
      },
      ticks: {
        color: '#6D6D6D',
        font: {
          size: 11,
        },
      },
    },
    y: {
      grid: {
        color: '#E5E5E5',
        drawBorder: false,
      },
      ticks: {
        color: '#6D6D6D',
        font: {
          size: 11,
        },
      },
    },
  },
}

// Mock data for charts
export const behaviorTrendsData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      label: 'Aggression',
      data: [3, 5, 2, 7, 4, 1, 3],
      borderColor: '#FF6B6B',
      backgroundColor: 'rgba(255, 107, 107, 0.1)',
      tension: 0.4,
      fill: true,
    },
    {
      label: 'Self-harm',
      data: [1, 2, 1, 3, 2, 0, 1],
      borderColor: '#4ECDC4',
      backgroundColor: 'rgba(78, 205, 196, 0.1)',
      tension: 0.4,
      fill: true,
    },
    {
      label: 'Property Damage',
      data: [2, 1, 3, 2, 1, 2, 0],
      borderColor: '#45B7D1',
      backgroundColor: 'rgba(69, 183, 209, 0.1)',
      tension: 0.4,
      fill: true,
    },
  ],
}

export const behaviorFrequencyData = {
  labels: ['Aggression', 'Self-harm', 'Property Damage', 'Elopement', 'Stereotypy', 'Non-compliance'],
  datasets: [
    {
      label: 'Frequency',
      data: [45, 23, 18, 12, 8, 15],
      backgroundColor: [
        '#FF6B6B',
        '#4ECDC4',
        '#45B7D1',
        '#96CEB4',
        '#FFEAA7',
        '#DDA0DD',
      ],
      borderWidth: 0,
      borderRadius: 4,
    },
  ],
}

export const severityDistributionData = {
  labels: ['High', 'Medium', 'Low'],
  datasets: [
    {
      data: [25, 45, 30],
      backgroundColor: [
        '#FF6B6B',
        '#FFA726',
        '#4ECDC4',
      ],
      borderWidth: 0,
      borderRadius: 8,
    },
  ],
}

export const interventionEffectivenessData = {
  labels: ['Redirection', 'Time-out', 'Positive Reinforcement', 'Sensory Break', 'Communication Aid'],
  datasets: [
    {
      label: 'Success Rate (%)',
      data: [85, 60, 92, 78, 88],
      backgroundColor: '#4ECDC4',
      borderColor: '#3DB9B2',
      borderWidth: 2,
      borderRadius: 4,
    },
  ],
}

export const weeklyActivityData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      label: 'Activities Completed',
      data: [12, 15, 18, 14, 16, 10, 8],
      backgroundColor: '#4ECDC4',
      borderColor: '#3DB9B2',
      borderWidth: 2,
      borderRadius: 4,
    },
  ],
}

export const carerPerformanceData = {
  labels: ['Sarah J.', 'Michael C.', 'Emma D.', 'David L.', 'Lisa M.'],
  datasets: [
    {
      label: 'Shifts Completed',
      data: [45, 38, 42, 35, 40],
      backgroundColor: '#4ECDC4',
      borderColor: '#3DB9B2',
      borderWidth: 2,
      borderRadius: 4,
    },
  ],
} 