import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Home,
  Activity,
} from 'lucide-react';
import useStore from '../store/useStore';

const STATUS_COLORS: Record<string, string> = {
  'not-started': '#B2BEC3',
  'in-progress': '#6B8F71',
  blocked: '#E07A7A',
  completed: '#7ABF7E',
};

const CATEGORY_COLORS = ['#6B8F71', '#D4A843', '#7AAFBF', '#BF7A9E', '#7A8FBF', '#BFA07A', '#9E7ABF'];

export default function DashboardView() {
  const projects = useStore((s) => s.projects);
  const properties = useStore((s) => s.properties);
  const finances = useStore((s) => s.finances);
  const getTotalStress = useStore((s) => s.getTotalStress);
  const getCompletionPercentage = useStore((s) => s.getCompletionPercentage);
  const getBlockedProjects = useStore((s) => s.getBlockedProjects);
  const setSelectedProjectId = useStore((s) => s.setSelectedProjectId);
  const setShowProjectModal = useStore((s) => s.setShowProjectModal);

  const totalStress = getTotalStress();
  const completionPct = getCompletionPercentage();
  const blocked = getBlockedProjects();

  // Financial calculations
  const totalPropertyValue = properties.reduce((sum, p) => sum + p.estimatedValue, 0);
  const totalMortgage = properties.reduce((sum, p) => sum + p.mortgageBalance, 0);
  const totalEquity = totalPropertyValue - totalMortgage;
  const monthlyPayments = properties.reduce((sum, p) => sum + p.monthlyPayment, 0);

  const actualSpent = finances
    .filter((f) => f.type === 'expense')
    .reduce((sum, f) => sum + f.amount, 0);
  const projectedCosts = projects.reduce((sum, p) => sum + p.estimatedCost, 0);
  const income = finances
    .filter((f) => f.type === 'income')
    .reduce((sum, f) => sum + f.amount, 0);

  // Status breakdown for pie chart
  const statusData = [
    { name: 'Not Started', value: projects.filter((p) => p.status === 'not-started').length, color: STATUS_COLORS['not-started'] },
    { name: 'In Progress', value: projects.filter((p) => p.status === 'in-progress').length, color: STATUS_COLORS['in-progress'] },
    { name: 'Blocked', value: projects.filter((p) => p.status === 'blocked').length, color: STATUS_COLORS['blocked'] },
    { name: 'Completed', value: projects.filter((p) => p.status === 'completed').length, color: STATUS_COLORS['completed'] },
  ].filter((d) => d.value > 0);

  // Cost by category bar chart
  const categoryMap = new Map<string, number>();
  for (const project of projects) {
    const existing = categoryMap.get(project.category) || 0;
    categoryMap.set(project.category, existing + project.estimatedCost);
  }
  const costByCategory = Array.from(categoryMap.entries())
    .map(([category, cost]) => ({ category, cost }))
    .sort((a, b) => b.cost - a.cost);

  // Property equity bar chart
  const propertyEquityData = properties.map((p) => ({
    name: p.name.length > 12 ? p.name.substring(0, 12) + '...' : p.name,
    equity: p.estimatedValue - p.mortgageBalance,
    mortgage: p.mortgageBalance,
    color: p.color,
  }));

  const stressLabel = totalStress > 70 ? 'High' : totalStress > 40 ? 'Moderate' : 'Low';
  const stressColor = totalStress > 70 ? 'text-stress-high' : totalStress > 40 ? 'text-stress-medium' : 'text-stress-low';
  const stressBg = totalStress > 70 ? 'bg-stress-high' : totalStress > 40 ? 'bg-stress-medium' : 'bg-stress-low';

  const openProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setShowProjectModal(true);
  };

  if (projects.length === 0) {
    return (
      <div className="p-4 md:p-6 text-center py-20">
        <Activity size={48} className="mx-auto mb-4 text-text-muted" />
        <p className="text-lg font-medium text-text mb-2">No data yet</p>
        <p className="text-sm text-text-light">Add properties and projects to see your dashboard.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <h2 className="text-lg font-bold text-text mb-6">Dashboard</h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
              <CheckCircle2 size={16} className="text-primary" />
            </div>
            <span className="text-xs text-text-muted">Completion</span>
          </div>
          <p className="text-2xl font-bold text-text">{completionPct}%</p>
          <p className="text-xs text-text-light mt-1">
            {projects.filter((p) => p.status === 'completed').length} of {projects.length} projects
          </p>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-8 h-8 rounded-lg ${stressBg}/20 flex items-center justify-center`}>
              <AlertTriangle size={16} className={stressColor} />
            </div>
            <span className="text-xs text-text-muted">Stress Level</span>
          </div>
          <p className={`text-2xl font-bold ${stressColor}`}>{stressLabel}</p>
          <p className="text-xs text-text-light mt-1">{totalStress}% load</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
              <TrendingUp size={16} className="text-green-600" />
            </div>
            <span className="text-xs text-text-muted">Total Equity</span>
          </div>
          <p className="text-2xl font-bold text-text">${(totalEquity / 1000).toFixed(0)}K</p>
          <p className="text-xs text-text-light mt-1">{properties.length} properties</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <DollarSign size={16} className="text-accent-dark" />
            </div>
            <span className="text-xs text-text-muted">Monthly Payments</span>
          </div>
          <p className="text-2xl font-bold text-text">${monthlyPayments.toLocaleString()}</p>
          <p className="text-xs text-text-light mt-1">across all properties</p>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Status pie chart */}
        <div className="card">
          <h3 className="text-sm font-semibold text-text mb-4">Project Status</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {statusData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #DCE8DE',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Legend
                formatter={(value: string) => (
                  <span className="text-xs text-text-light">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Cost by category */}
        <div className="card">
          <h3 className="text-sm font-semibold text-text mb-4">Budget by Category</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={costByCategory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#DCE8DE" />
              <XAxis
                dataKey="category"
                tick={{ fontSize: 11, fill: '#636E72' }}
                axisLine={{ stroke: '#DCE8DE' }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#636E72' }}
                axisLine={{ stroke: '#DCE8DE' }}
                tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #DCE8DE',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Budget']}
              />
              <Bar dataKey="cost" radius={[4, 4, 0, 0]}>
                {costByCategory.map((_, i) => (
                  <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Property equity chart */}
      <div className="card mb-6">
        <h3 className="text-sm font-semibold text-text mb-4">Property Portfolio</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={propertyEquityData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#DCE8DE" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: '#636E72' }}
              axisLine={{ stroke: '#DCE8DE' }}
              tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`}
            />
            <YAxis
              dataKey="name"
              type="category"
              width={100}
              tick={{ fontSize: 11, fill: '#636E72' }}
              axisLine={{ stroke: '#DCE8DE' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #DCE8DE',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              formatter={(value) => `$${Number(value).toLocaleString()}`}
            />
            <Bar dataKey="equity" stackId="a" fill="#6B8F71" radius={[0, 4, 4, 0]} name="Equity" />
            <Bar dataKey="mortgage" stackId="a" fill="#B2BEC3" radius={[0, 4, 4, 0]} name="Mortgage" />
            <Legend
              formatter={(value: string) => (
                <span className="text-xs text-text-light">{value}</span>
              )}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Financial summary */}
        <div className="card">
          <h3 className="text-sm font-semibold text-text mb-3 flex items-center gap-2">
            <DollarSign size={16} />
            Financial Summary
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-light">Total Property Value</span>
              <span className="text-sm font-medium text-text">
                ${totalPropertyValue.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-light">Total Mortgage</span>
              <span className="text-sm font-medium text-stress-high">
                -${totalMortgage.toLocaleString()}
              </span>
            </div>
            <hr className="border-primary-50" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-light">Net Equity</span>
              <span className="text-sm font-bold text-primary-dark">
                ${totalEquity.toLocaleString()}
              </span>
            </div>
            <hr className="border-primary-50" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-light flex items-center gap-1">
                <TrendingDown size={12} className="text-stress-high" />
                Spent on Projects
              </span>
              <span className="text-sm font-medium text-text">
                ${actualSpent.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-light">Projected Total Cost</span>
              <span className="text-sm font-medium text-text">
                ${projectedCosts.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-light flex items-center gap-1">
                <TrendingUp size={12} className="text-stress-low" />
                Income Received
              </span>
              <span className="text-sm font-medium text-stress-low">
                ${income.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Blocked projects */}
        <div className="card">
          <h3 className="text-sm font-semibold text-text mb-3 flex items-center gap-2">
            <AlertTriangle size={16} className="text-stress-high" />
            Blocked Projects ({blocked.length})
          </h3>
          {blocked.length === 0 ? (
            <div className="text-center py-8 text-text-muted">
              <CheckCircle2 size={32} className="mx-auto mb-2 text-stress-low" />
              <p className="text-sm">Nothing blocked. Great work!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {blocked.map((project) => {
                const prop = properties.find((p) => p.id === project.propertyId);
                const deps = project.dependencies
                  .map((id) => projects.find((p) => p.id === id)?.name)
                  .filter(Boolean);
                return (
                  <div
                    key={project.id}
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-primary-50/50 cursor-pointer"
                    onClick={() => openProject(project.id)}
                  >
                    <Home size={14} className="text-text-muted mt-0.5" style={prop ? { color: prop.color } : undefined} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-text">{project.name}</p>
                      {deps.length > 0 && (
                        <p className="text-xs text-text-muted">
                          Waiting on: {deps.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
