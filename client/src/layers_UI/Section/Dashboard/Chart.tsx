import { Card } from "@/components/ui/card";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const analyticsData = [
  { day: "Mon", commits: 4, deployments: 1 },
  { day: "Tue", commits: 9, deployments: 3 },
  { day: "Wed", commits: 6, deployments: 2 },
  { day: "Thu", commits: 14, deployments: 5 },
  { day: "Fri", commits: 11, deployments: 4 },
  { day: "Sat", commits: 5, deployments: 1 },
  { day: "Sun", commits: 8, deployments: 2 },
];

export default function Chart() {
  return (
    <Card className="rounded-2xl p-5 fade-in-up delay-200">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold">Weekly Activity</h2>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
            Commits
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
            Deploys
          </span>
        </div>
      </div>

      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={analyticsData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gradCommits" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradDeploys" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                fontSize: "12px",
                color: "var(--foreground)",
              }}
              cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
            />
            <Area
              type="monotone"
              dataKey="commits"
              stroke="var(--primary)"
              strokeWidth={2.5}
              fill="url(#gradCommits)"
            />
            <Area
              type="monotone"
              dataKey="deployments"
              stroke="#22d3ee"
              strokeWidth={2.5}
              fill="url(#gradDeploys)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}