'use client';
import { useSyncExternalStore } from 'react';
import {
  Users, Briefcase, TrendingUp, Activity, AlertTriangle, Globe
} from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
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
    { name: 'Renewable Energy', value: 35, color: '#e69b53' },
    { name: 'Electric Vehicles', value: 28, color: '#78a36d' },
    { name: 'Electrical', value: 18, color: '#c9803a' },
    { name: 'IT & Electronics', value: 11, color: '#b5712a' },
    { name: 'Others', value: 8, color: '#8a7e72' },
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

const tooltipStyle = {
  backgroundColor: '#1c1712',
  border: '1px solid rgba(246, 239, 229, 0.16)',
  borderRadius: '4px',
  color: '#f6efe5',
  fontSize: '12px',
};

function subscribeToMotionPreference(onChange: () => void) {
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  preference.addEventListener('change', onChange);
  return () => preference.removeEventListener('change', onChange);
}
const readMotionPreference = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const serverMotionPreference = () => true;

export default function AdminPage() {
  const reducedMotion = useSyncExternalStore(subscribeToMotionPreference, readMotionPreference, serverMotionPreference);
  const statsCards = [
    { label: 'Total Students', value: DEMO_ANALYTICS.total_students.toLocaleString('en-IN'), icon: Users, color: '#e69b53', change: '+12%' },
    { label: 'Assessments Done', value: DEMO_ANALYTICS.total_assessments.toLocaleString('en-IN'), icon: Activity, color: '#78a36d', change: '+18%' },
    { label: 'Career Explores', value: DEMO_ANALYTICS.careers_explored.toLocaleString('en-IN'), icon: Briefcase, color: '#e69b53', change: '+24%' },
    { label: 'Completion Rate', value: '88%', icon: TrendingUp, color: '#78a36d', change: '+3%' },
  ];

  return (
    <div className="app-page">
      <Sidebar userName="Admin User" userRole="admin" />

      <main className="app-main">
        <div className="app-content">
          <PageHeader
            chapter="06"
            eyebrow="System & impact analytics"
            title={<>Platform <em>Analytics</em></>}
            description="Overview of student assessments, vocational trends, and regional engagement."
            actions={
              <div className="flex items-center gap-3">
                <Badge variant="warning">
                  <AlertTriangle size={11} />
                  Demo Mode
                </Badge>
                <Badge variant="info">SIH26241</Badge>
              </div>
            }
          />

          {/* Stats row */}
          <section aria-label="Key platform metrics" className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
            {statsCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label} padding="md" className="min-w-0 p-3 sm:p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="eyebrow mb-1 text-[var(--ui-muted)]">{stat.label}</p>
                      <p className="font-[family-name:var(--ui-serif)] text-3xl text-[var(--ui-text)] sm:text-4xl">{stat.value}</p>
                      <span className="mt-2 block text-[11px] font-medium text-[var(--ui-success)]">{stat.change} this month</span>
                    </div>
                    <div
                      className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-[rgba(246,239,229,0.12)] bg-[var(--ui-surface-2)] sm:flex"
                    >
                      <Icon size={18} style={{ color: stat.color }} />
                    </div>
                  </div>
                </Card>
              );
            })}
          </section>

          {/* Charts row 1 */}
          <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Career interest bar chart */}
            <Card padding="md">
              <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="section-title text-xl text-[var(--ui-text)]">Top Career Interests</h2>
                <span className="text-xs text-[var(--ui-muted)]">By student count</span>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={DEMO_ANALYTICS.career_interest} layout="vertical" margin={{ left: 8, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(246, 239, 229, 0.08)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#b2a69a' }} axisLine={false} tickLine={false} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 10, fill: '#f6efe5' }}
                    axisLine={false}
                    tickLine={false}
                    width={130}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    cursor={{ fill: 'rgba(230, 155, 83, 0.08)' }}
                  />
                  <Bar dataKey="count" fill="#e69b53" radius={[0, 3, 3, 0]} isAnimationActive={!reducedMotion} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Category pie chart */}
            <Card padding="md">
              <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="section-title text-xl text-[var(--ui-text)]">Category Distribution</h2>
                <span className="text-xs text-[var(--ui-muted)]">By % of students</span>
              </div>
              <div className="flex min-w-0 flex-col items-center gap-5 xl:flex-row">
                <div className="h-[180px] w-[180px] shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={DEMO_ANALYTICS.category_dist}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        stroke="rgba(246, 239, 229, 0.1)"
                        isAnimationActive={!reducedMotion}
                      >
                        {DEMO_ANALYTICS.category_dist.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={tooltipStyle}
                        formatter={(v) => [`${v}%`, '']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full min-w-0 space-y-2 xl:flex-1">
                  {DEMO_ANALYTICS.category_dist.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="flex-1 text-xs text-[var(--ui-muted)]">{item.name}</span>
                      <span className="text-xs font-semibold text-[var(--ui-text)]">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Charts row 2 */}
          <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Monthly trend */}
            <Card padding="md">
              <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="section-title text-xl text-[var(--ui-text)]">Monthly Assessments</h2>
                <span className="text-xs text-[var(--ui-muted)]">Assessments vs Completions</span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={DEMO_ANALYTICS.monthly_assessments}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(246, 239, 229, 0.08)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#b2a69a' }} axisLine={false} tickLine={false} />
                  <YAxis width={36} tick={{ fontSize: 11, fill: '#b2a69a' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: '#b2a69a' }} />
                  <Line type="monotone" dataKey="assessments" stroke="#e69b53" strokeWidth={2} dot={false} name="Started" isAnimationActive={!reducedMotion} />
                  <Line type="monotone" dataKey="completions" stroke="#78a36d" strokeWidth={2} dot={false} name="Completed" isAnimationActive={!reducedMotion} />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* Skill gaps */}
            <Card padding="md">
              <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="section-title text-xl text-[var(--ui-text)]">Top Skill Gaps</h2>
                <span className="text-xs text-[var(--ui-muted)]">By student count</span>
              </div>
              <div className="space-y-3.5">
                {DEMO_ANALYTICS.skill_gaps.map((gap) => {
                  const pct = Math.round((gap.count / DEMO_ANALYTICS.total_students) * 100);
                  return (
                    <div key={gap.name}>
                      <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-2">
                        <span className="text-sm font-medium text-[var(--ui-text)]">{gap.name}</span>
                        <span className="text-xs text-[var(--ui-muted)]">{gap.count} students ({pct}%)</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full border border-[rgba(246,239,229,0.06)] bg-[var(--ui-surface-2)]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#b5712a] to-[#e69b53]"
                          style={{ width: `${pct}%` }}
                          role="progressbar"
                          aria-label={`${gap.name} skill gap share`}
                          aria-valuenow={pct}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Regional distribution */}
          <Card padding="md">
            <h2 className="section-title mb-4 flex items-center gap-2 text-xl text-[var(--ui-text)]">
              <Globe size={16} className="text-[var(--ui-accent)]" />
              Regional Distribution
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {DEMO_ANALYTICS.top_states.map((s, i) => (
                <div key={s.state} className="flex items-center justify-between rounded-sm border border-[var(--ui-border)] bg-[var(--ui-surface-2)] p-3">
                  <div className="flex items-center gap-2">
                    <span className="w-4 text-xs text-[var(--ui-faint)]">{i + 1}.</span>
                    <span className="text-sm font-medium text-[var(--ui-text)]">{s.state}</span>
                  </div>
                  <span className="text-sm font-semibold text-[var(--ui-accent)]">{s.count}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Demo disclaimer */}
          <div className="ui-alert mt-6 flex items-start gap-3">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-[var(--ui-accent)]" />
            <div>
              <p className="text-sm font-medium text-[var(--ui-text)]">Illustrative Data — Demo Mode</p>
              <p className="mt-0.5 text-xs leading-relaxed text-[var(--ui-muted)]">
                All analytics shown on this page are illustrative figures for SIH26241 demonstration purposes only.
                They do not represent real user data. In production, this dashboard connects to live database telemetry.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
