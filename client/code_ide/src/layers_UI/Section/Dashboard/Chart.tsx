import { Card } from "@/components/ui/card";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function Chart() {
    
    const analyticsData = [
      { name: 'Mon', projects: 2 },
      { name: 'Tue', projects: 4 },
      { name: 'Wed', projects: 3 },
      { name: 'Thu', projects: 6 },
      { name: 'Fri', projects: 5 },
    ]
    return(
        <>
         {/* Analytics */}
        <Card className="p-6 rounded-2xl shadow-sm">
          <h2 className="text-xl font-semibold mb-6">Project Analytics</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="projects"
                  stroke="var(--primary)"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card></>
    )
};

       