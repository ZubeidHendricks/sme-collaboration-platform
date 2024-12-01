import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, Users, Award } from 'lucide-react';

const MetricCard = ({ title, value, trend, icon: Icon }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
          {trend && (
            <p className={`text-sm mt-1 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '+' : ''}{trend}% from previous period
            </p>
          )}
        </div>
        <Icon className="w-8 h-8 text-blue-500" />
      </div>
    </CardContent>
  </Card>
);

const AnalyticsDashboard = () => {
  const [platformMetrics, setPlatformMetrics] = useState(null);
  const [projectTrends, setProjectTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch metrics from smart contract
      const metrics = await web3Service.getPlatformMetrics();
      setPlatformMetrics(metrics);

      // Sample project trends data
      setProjectTrends([
        { month: 'Jan', projects: 5, value: 50000 },
        { month: 'Feb', projects: 7, value: 65000 },
        { month: 'Mar', projects: 10, value: 80000 },
        { month: 'Apr', projects: 8, value: 70000 },
        { month: 'May', projects: 12, value: 90000 },
        { month: 'Jun', projects: 15, value: 120000 }
      ]);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setLoading(false);
    }
  };

  if (loading || !platformMetrics) {
    return <div>Loading analytics...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Platform Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Project Value"
          value={`$${platformMetrics.totalValue.toLocaleString()}`}
          trend={15}
          icon={DollarSign}
        />
        <MetricCard
          title="Completed Projects"
          value={platformMetrics.completedCount}
          trend={8}
          icon={Award}
        />
        <MetricCard
          title="Average Team Size"
          value={platformMetrics.averageTeamSize}
          trend={5}
          icon={Users}
        />
        <MetricCard
          title="Success Rate"
          value={`${platformMetrics.successRate}%`}
          trend={3}
          icon={TrendingUp}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Project Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={projectTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="projects"
                    stroke="#8884d8"
                    name="Projects"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="value"
                    stroke="#82ca9d"
                    name="Value"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="projects" fill="#8884d8" name="Projects" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;