import React from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";

const STATUS_COLORS = {
  "Pending": "#97a0af",
  "In Progress": "#0052cc",
  "Completed": "#36b37e",
};

const PRIORITY_COLORS = {
  "High": "#de350b",
  "Medium": "#ff8b00",
  "Low": "#36b37e",
};

function ProjectStatsChart({ tasks }) {
  if (!tasks || tasks.length === 0) return null;

  const statusData = ["Pending", "In Progress", "Completed"].map(s => ({
    name: s,
    value: tasks.filter(t => t.status === s).length,
  })).filter(d => d.value > 0);

  const priorityData = ["High", "Medium", "Low"].map(p => ({
    name: p,
    value: tasks.filter(t => t.priority === p).length,
  }));

  const pct = tasks.length
    ? Math.round((tasks.filter(t => t.status === "Completed").length / tasks.length) * 100)
    : 0;

  return (
    <div className="stats-chart-row">
      {/* Status donut */}
      <div className="stats-chart-panel">
        <div className="stats-chart-label">Status breakdown</div>
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={statusData}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={76}
              dataKey="value"
              paddingAngle={2}
            >
              {statusData.map((entry) => (
                <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(val, name) => [val + " tasks", name]}
              contentStyle={{ fontSize: 12, borderRadius: 6 }}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label — absolute positioned inside the panel */}
        <div className="donut-center-label">
          <span className="donut-pct">{pct}%</span>
          <span className="donut-sub">done</span>
        </div>
        {/* Legend */}
        <div className="chart-legend">
          {statusData.map(d => (
            <span key={d.name} className="chart-legend-item">
              <span className="chart-legend-dot" style={{ background: STATUS_COLORS[d.name] }} />
              {d.name} ({d.value})
            </span>
          ))}
        </div>
      </div>

      {/* Priority bar */}
      <div className="stats-chart-panel">
        <div className="stats-chart-label">Priority breakdown</div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={priorityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#5e6c84" }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#5e6c84" }} />
            <Tooltip
              formatter={(val) => [val + " tasks"]}
              contentStyle={{ fontSize: 12, borderRadius: 6 }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {priorityData.map(d => (
                <Cell key={d.name} fill={PRIORITY_COLORS[d.name]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ProjectStatsChart;
