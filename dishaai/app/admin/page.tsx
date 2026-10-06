'use client';
import { useMemo } from 'react';
import {
  BarChart2, Users, Briefcase, TrendingUp, Activity,
  AlertTriangle, School, Globe, Star, Zap
} from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { DEMO_CAREERS } from '@/data/careers';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart,
  Line, Legend
} from 'recharts';

// Demo analytics data — illustrative only
const DEMO_ANALYTICS = {
  total_students: 1247,
  total_assessments: 1189,
  careers_explored: 4832,
  career_interest: [
    { name: 'Solar PV Technician', count: 324, pct: 26 },
    { name: 'EV Service Technician', count: 287, pct: 23 },
    { name: 'Industrial Electrician', count: 198, pct: 16 },
    { name: 'Computer Hardware Tech', count: 156, pct: 13 },
    { name: 'Healthcare Assistant', count: 142, pct: 11 },
    { name: 'Others', count: 140, pct: 11 },
  ],
  skill_gaps: [
    { name: 'Solar Installation', count: 489 },
    { name: 'Battery Management', count: 421 },
    { name: 'EV Diagnostics', count: 378 },
    { name: 'Electrical Safety', count: 312 },
    { name: 'Blueprint Reading', count: 267 },
  ],
  category_dist: [
    { name: 'Renewable Energy', value: 35, color: '#059669' },
    { name: 'Electric Vehicles', value: 28, color: '#0284c7' },
    { name: 'Electrical', value: 18, color: '#1a2e5a' },
    { name: 'IT & Electronics', value: 11, color: '#7c3aed' },
    { name: 'Others', value: 8, color: '#94a3b8' },
  ],
  monthly_assessments: [
    { month: 'Jun', assessments: 82, completions: 71 },
    { month: 'Jul', assessments: 98, completions: 87 },
    { month: 'Aug', assessments: 125, completions: 108 },
    { month: 'Sep', assessments: 174, completions: 152 },
    { month: 'Oct', assessments: 213, completions: 187 },
  ],
  top_states: [
    { state: 'Maharashtra', count: 312 },
    { state: 'Uttar Pradesh', count: 278 },
    { state: 'Gujarat', count: 198 },
    { state: 'Karnataka', count: 174 },
    { state: 'Rajasthan', count: 156 },
    { state: 'Tamil Nadu', count: 129 },
  ],
};

export default function AdminPage() {
  const statsCards = [
    { label: 'Total Students', value: DEMO_ANALYTICS.total_students.toLocaleString('en-IN'), icon: Users, color: '#1a2e5a', change: '+12%' },
    { label: 'Assessments Done', value: DEMO_ANALYTICS.total_assessments.toLocaleString('en-IN'), icon: Activity, color: '#0284c7', change: '+18%' },
    { label: 'Career Explores', value: DEMO_ANALYTICS.careers_explored.toLocaleString('en-IN'), icon: Briefcase, color: '#059669', change: '+24%' },
    { label: 'Completion Rate', value: '88%', icon: TrendingUp, color: '#d97706', change: '+3%' },
  ];

  return (
    <div className="min-h-screen bg-[#f0f4ff] flex">
      <Sidebar userName="Admin User" userRole="admin" />

      <main className="flex-1 ml-[240px]">
        <div className="max-w-[1040px] mx-auto px-8 py-8">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-[#1a2e5a]">Platform Analytics</h1>
              <p className="text-[#64748b] mt-1">Dashboard overview — Illustrative Demo Data</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="warning">
                <AlertTriangle size={11} />
                Demo Data Only
              </Badge>
              <Badge variant="info">SIH26241</Badge>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {statsCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label} padding="md">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-[#94a3b8] mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold text-[#1a2e5a]">{stat.value}</p>
                      <span className="text-xs font-medium text-[#059669]">{stat.change} this month</span>
                    </div>
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${stat.color}15` }}
                    >
                      <Icon size={20} style={{ color: stat.color }} />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Charts row 1 */}
          <div className="grid grid-cols-2 gap-6 mb-6">

            {/* Career interest bar chart */}
            <Card padding="md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-[#1a2e5a]">Top Career Interests</h2>
                <span className="text-xs text-[#94a3b8]">By student count</span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={DEMO_ANALYTICS.career_interest} layout="vertical" margin={{ left: 8, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 10, fill: '#475569' }}
                    axisLine={false}
                    tickLine={false}
                    width={120}
                  />
                  <Tooltip
                    contentStyle={{ fontSize: 12, border: '1px solid #e2e8f0', borderRadius: 10 }}
                    cursor={{ fill: '#f0f4ff' }}
                  />
                  <Bar dataKey="count" fill="#1a2e5a" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Category pie chart */}
            <Card padding="md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-[#1a2e5a]">Category Distribution</h2>
                <span className="text-xs text-[#94a3b8]">By % of students</span>
              </div>
              <div className="flex items-center gap-4">
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie
                      data={DEMO_ANALYTICS.category_dist}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                    >
                      {DEMO_ANALYTICS.category_dist.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ fontSize: 12, border: '1px solid #e2e8f0', borderRadius: 10 }}
                      formatter={(v) => [`${v}%`, '']}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {DEMO_ANALYTICS.category_dist.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-xs text-[#475569] flex-1">{item.name}</span>
                      <span className="text-xs font-bold text-[#1a2e5a]">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Charts row 2 */}
          <div className="grid grid-cols-2 gap-6 mb-6">

            {/* Monthly trend */}
            <Card padding="md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-[#1a2e5a]">Monthly Assessments</h2>
                <span className="text-xs text-[#94a3b8]">Assessments vs Completions</span>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={DEMO_ANALYTICS.monthly_assessments}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 12, border: '1px solid #e2e8f0', borderRadius: 10 }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="assessments" stroke="#1a2e5a" strokeWidth={2} dot={false} name="Started" />
                  <Line type="monotone" dataKey="completions" stroke="#0ea5e9" strokeWidth={2} dot={false} name="Completed" />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* Skill gaps */}
            <Card padding="md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-[#1a2e5a]">Top Skill Gaps</h2>
                <span className="text-xs text-[#94a3b8]">By student count</span>
              </div>
              <div className="space-y-3">
                {DEMO_ANALYTICS.skill_gaps.map((gap, i) => {
                  const pct = Math.round((gap.count / DEMO_ANALYTICS.total_students) * 100);
                  return (
                    <div key={gap.name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-[#475569] font-medium">{gap.name}</span>
                        <span className="text-xs text-[#94a3b8]">{gap.count} students ({pct}%)</span>
                      </div>
                      <div className="h-2 bg-[#f1f5f9] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#d97706] to-[#fbbf24]"
                          style={{ width: `${pct * 2.5}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* State distribution */}
          <Card padding="md">
            <h2 className="font-bold text-[#1a2e5a] mb-4 flex items-center gap-2">
              <Globe size={16} className="text-[#0284c7]" />
              Regional Distribution
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {DEMO_ANALYTICS.top_states.map((s, i) => (
                <div key={s.state} className="flex items-center justify-between p-3 bg-[#f8faff] rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#94a3b8] w-4">{i + 1}.</span>
                    <span className="text-sm font-medium text-[#1a2e5a]">{s.state}</span>
                  </div>
                  <span className="text-sm font-bold text-[#0284c7]">{s.count}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Demo disclaimer */}
          <div className="mt-6 p-4 bg-[#fffbeb] border border-[#fef3c7] rounded-2xl flex items-start gap-3">
            <AlertTriangle size={16} className="text-[#d97706] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-[#92400e]">Illustrative Data — Demo Mode</p>
              <p className="text-xs text-[#92400e] mt-0.5 leading-relaxed">
                All analytics shown on this page are illustrative figures for SIH26241 demonstration purposes only.
                They do not represent real user data. In production, this dashboard would connect to a live Supabase database.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
