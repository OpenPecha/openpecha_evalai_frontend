import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface Submission {
  submission_id?: string;
  model_name: string;
  metrics: Record<string, number>;
  rank?: number;
}

interface LeaderboardChartProps {
  submissions: Submission[];
  availableMetrics: string[];
  className?: string;
}

// Custom tooltip component moved outside for better performance
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg p-3">
        <p className="font-medium text-neutral-700 dark:text-neutral-100 text-sm mb-2">
          {data.fullModel}
        </p>
        <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-2">
          Rank: #{data.rank}
        </p>
        {payload.map((entry: any) => {
          const metric = entry.dataKey;
          const value = entry.value;
          let displayValue;
          
          // Format the value based on metric type
          if (metric === "CER" || metric === "WER" || metric === "ACCURACY") {
            displayValue = `${value.toFixed(2)}%`;
          } else {
            displayValue = value.toFixed(4);
          }
          
          return (
            <div key={metric} className="flex items-center justify-between space-x-2">
              <div className="flex items-center space-x-1">
                <div 
                  className="w-3 h-3 rounded" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-xs text-neutral-700 dark:text-neutral-300">
                  {metric}:
                </span>
              </div>
              <span className="text-xs font-medium text-neutral-700 dark:text-neutral-100">
                {displayValue}
              </span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

const LeaderboardChart: React.FC<LeaderboardChartProps> = ({
  submissions,
  availableMetrics,
  className = "",
}) => {
  // Transform data for chart
  const chartData = submissions.slice(0, 8).map((submission, index) => {
    const data: any = {
      model: submission.model_name.length > 15 
        ? submission.model_name.substring(0, 15) + "..." 
        : submission.model_name,
      fullModel: submission.model_name,
      rank: submission.rank || index + 1,
    };

    // Add each metric as a separate field
    availableMetrics.forEach((metric) => {
      if (submission.metrics[metric] !== undefined) {
        // Convert percentage-based metrics to percentage for better visualization
        if (metric === "CER" || metric === "WER" || metric === "ACCURACY") {
          data[metric] = (submission.metrics[metric] * 100);
        } else {
          data[metric] = submission.metrics[metric];
        }
      }
    });

    return data;
  });

  // Define colors for different metrics
  const getMetricColor = (metric: string) => {
    switch (metric) {
      case "CER":
        return "#dc2626"; // red-600
      case "WER":
        return "#ea580c"; // orange-600
      case "ACCURACY":
        return "#16a34a"; // green-600
      case "BLEU":
        return "#2563eb"; // blue-600
      default:
        return "#6b7280"; // gray-500
    }
  };



  if (submissions.length === 0) {
    return (
      <div className={`${className} flex items-center justify-center py-8`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-700 rounded-lg flex items-center justify-center mx-auto mb-3">
            <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-100 mb-1">
            No data to visualize
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            Submit results to see performance comparisons
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          margin={{
            top: 10,
            right: 20,
            left: 20,
            bottom: 60,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="model" 
            angle={-45}
            textAnchor="end"
            height={80}
            fontSize={10}
            className="text-neutral-600 dark:text-neutral-400"
          />
          <YAxis 
            fontSize={10}
            className="text-neutral-600 dark:text-neutral-400"
            domain={[0, 100]}
            ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ fontSize: '12px' }}
            className="text-neutral-600 dark:text-neutral-400"
          />
          {availableMetrics.slice(0, 3).map((metric) => (
            <Bar
              key={metric}
              dataKey={metric}
              fill={getMetricColor(metric)}
              radius={[2, 2, 0, 0]}
              name={metric}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LeaderboardChart;
