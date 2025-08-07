"use client"

import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, Tooltip, Legend, Area } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface SugarReading {
  id: number
  reading_type: string
  sugar_level: number
  reading_date: string
  reading_time: string
  notes: string | null
}

interface SugarChartProps {
  readings: SugarReading[]
}

export function SugarChart({ readings }: SugarChartProps) {
  // Process readings data for chart
  const processChartData = () => {
    if (!readings || readings.length === 0) {
      console.log("No readings data available for chart")
      return []
    }

    console.log("Processing chart data:", {
      totalReadings: readings.length,
      sampleReadings: readings.slice(0, 3)
    })

    // Group readings by date
    const groupedData: {
      [key: string]: { date: string; fasting?: number; random?: number; beforeMeal?: number; afterMeal?: number }
    } = {}

    readings.forEach((reading) => {
      const date = reading.reading_date
      if (!groupedData[date]) {
        groupedData[date] = { date }
      }

      // Map reading types to chart data
      switch (reading.reading_type) {
        case "fasting":
          groupedData[date].fasting = reading.sugar_level
          break
        case "random":
          groupedData[date].random = reading.sugar_level
          break
        case "before-meal":
          groupedData[date].beforeMeal = reading.sugar_level
          break
        case "after-meal":
          groupedData[date].afterMeal = reading.sugar_level
          break
        default:
          console.log("Unknown reading type:", reading.reading_type)
      }
    })

    // Convert to array and sort by date
    const sortedData = Object.values(groupedData)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-14) // Show last 14 days
      .map((item) => {
        const [year, month, day] = item.date.split("-");
        // Use Date.UTC to avoid timezone shifting issues
        const pkDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
        return {
          ...item,
          date: pkDate.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "Asia/Karachi" }),
        };
      });

    console.log("Processed chart data:", {
      groupedDataCount: Object.keys(groupedData).length,
      sortedDataCount: sortedData.length,
      sampleData: sortedData.slice(0, 3)
    })

    return sortedData
  }

  const chartData = processChartData()

  if (chartData.length === 0) {
    return (
      <div className="h-[300px] sm:h-[400px] w-full flex items-center justify-center text-gray-500 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-200">
        <div className="text-center">
          <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">📊</div>
          <div className="text-base sm:text-lg font-medium mb-2">No Data Available</div>
          <p className="text-sm">Start adding readings to see your trends</p>
          <p className="text-xs text-gray-400 mt-2">
            Readings count: {readings?.length || 0}
          </p>
        </div>
      </div>
    )
  }

  return (
    <ChartContainer
      config={{
        fasting: {
          label: "Fasting",
          color: "#8b5cf6", // Purple
        },
        random: {
          label: "Random",
          color: "#3b82f6", // Blue
        },
        beforeMeal: {
          label: "Before Meal",
          color: "#10b981", // Green
        },
        afterMeal: {
          label: "After Meal",
          color: "#f59e0b", // Orange
        },
      }}
      className="h-[300px] sm:h-[400px] w-full bg-gradient-to-br from-white via-purple-50 to-blue-50 rounded-xl shadow-lg p-4"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 30, right: 30, left: 10, bottom: 30 }}>
          <defs>
            <linearGradient id="colorFasting" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.5}/>
              <stop offset="100%" stopColor="#a78bfa" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            stroke="#666" 
            fontSize={12} 
            tick={{ fill: "#666" }}
            tickMargin={10}
            axisLine={false}
          />
          <YAxis 
            stroke="#666" 
            fontSize={12} 
            domain={[60, 250]} 
            tick={{ fill: "#666" }}
            tickMargin={10}
            axisLine={false}
            label={{ value: "mg/dL", angle: -90, position: "insideLeft", fill: "#888", fontSize: 12 }}
          />

          {/* Reference lines for normal ranges */}
          <ReferenceLine y={70} stroke="#10b981" strokeDasharray="5 5" strokeOpacity={0.6} />
          <ReferenceLine y={100} stroke="#10b981" strokeDasharray="5 5" strokeOpacity={0.6} />
          <ReferenceLine y={140} stroke="#f59e0b" strokeDasharray="5 5" strokeOpacity={0.6} />
          <ReferenceLine y={200} stroke="#ef4444" strokeDasharray="5 5" strokeOpacity={0.6} />

          {/* Area under fasting line for visual effect */}
          <Area
            type="monotone"
            dataKey="fasting"
            stroke="none"
            fill="url(#colorFasting)"
            fillOpacity={0.3}
            isAnimationActive={true}
          />

          {/* Modern Tooltip */}
          <Tooltip
            contentStyle={{ background: "#fff", borderRadius: 12, border: "1px solid #eee", boxShadow: "0 2px 8px #0001" }}
            itemStyle={{ fontSize: 14 }}
            labelStyle={{ fontWeight: 600, color: "#8b5cf6" }}
            formatter={(value, name) => [
              `${value} mg/dL`,
              typeof name === "string" ? name.charAt(0).toUpperCase() + name.slice(1) : name
            ]}
          />

          {/* Modern Legend */}
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ paddingBottom: 10, fontSize: 14 }}
          />

          {/* Animated Lines with custom dots */}
          <Line
            type="monotone"
            dataKey="fasting"
            stroke="#8b5cf6"
            strokeWidth={3}
            dot={{ fill: "#8b5cf6", stroke: "#fff", strokeWidth: 2, r: 6 }}
            activeDot={{ r: 8, fill: "#a78bfa", stroke: "#8b5cf6", strokeWidth: 2 }}
            connectNulls={false}
            name="Fasting"
            isAnimationActive={true}
          />
          <Line
            type="monotone"
            dataKey="random"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ fill: "#3b82f6", stroke: "#fff", strokeWidth: 2, r: 6 }}
            activeDot={{ r: 8, fill: "#60a5fa", stroke: "#3b82f6", strokeWidth: 2 }}
            connectNulls={false}
            name="Random"
            isAnimationActive={true}
          />
          <Line
            type="monotone"
            dataKey="beforeMeal"
            stroke="#10b981"
            strokeWidth={3}
            dot={{ fill: "#10b981", stroke: "#fff", strokeWidth: 2, r: 6 }}
            activeDot={{ r: 8, fill: "#6ee7b7", stroke: "#10b981", strokeWidth: 2 }}
            connectNulls={false}
            name="Before Meal"
            isAnimationActive={true}
          />
          <Line
            type="monotone"
            dataKey="afterMeal"
            stroke="#f59e0b"
            strokeWidth={3}
            dot={{ fill: "#f59e0b", stroke: "#fff", strokeWidth: 2, r: 6 }}
            activeDot={{ r: 8, fill: "#fde68a", stroke: "#f59e0b", strokeWidth: 2 }}
            connectNulls={false}
            name="After Meal"
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
