import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Activity, Calendar } from "lucide-react"

interface UserStats {
  reading_type: string
  avg_level: number
  reading_count: number
  min_level: number
  max_level: number
}

interface StatsCardsProps {
  stats: UserStats[]
}

export function StatsCards({ stats }: StatsCardsProps) {
  // Calculate overall statistics from real data
  const fastingStats = stats.find((s) => s.reading_type === "fasting")
  const randomStats = stats.find((s) => s.reading_type === "random")

  const totalReadings = stats.reduce((sum, stat) => sum + Number(stat.reading_count), 0)
  const avgFasting = fastingStats ? Number(fastingStats.avg_level) : 0
  const avgRandom = randomStats ? Number(randomStats.avg_level) : 0

  // Calculate readings in range (normal range: fasting 70-100, random <140)
  const fastingInRange = fastingStats && avgFasting >= 70 && avgFasting <= 100
  const randomInRange = randomStats && avgRandom < 140
  const inRangePercentage =
    stats.length > 0
      ? Math.round((((fastingInRange ? 1 : 0) + (randomInRange ? 1 : 0)) / Math.min(stats.length, 2)) * 100)
      : 0

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
      <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-xl transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium text-purple-700">Average Fasting</CardTitle>
          <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-lg sm:text-2xl font-bold text-purple-800">
            {avgFasting > 0 ? `${Math.round(avgFasting)} mg/dL` : "No data"}
          </div>
          <p className="text-xs text-purple-600 flex items-center">
            {avgFasting > 0 && avgFasting <= 100 ? (
              <>
                <TrendingDown className="h-3 w-3 mr-1" />
                Normal range
              </>
            ) : avgFasting > 100 ? (
              <>
                <TrendingUp className="h-3 w-3 mr-1" />
                Above normal
              </>
            ) : (
              "No readings yet"
            )}
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-xl transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium text-blue-700">Average Random</CardTitle>
          <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-lg sm:text-2xl font-bold text-blue-800">
            {avgRandom > 0 ? `${Math.round(avgRandom)} mg/dL` : "No data"}
          </div>
          <p className="text-xs text-blue-600 flex items-center">
            {avgRandom > 0 && avgRandom < 140 ? (
              <>
                <TrendingDown className="h-3 w-3 mr-1" />
                Normal range
              </>
            ) : avgRandom >= 140 ? (
              <>
                <TrendingUp className="h-3 w-3 mr-1" />
                Above normal
              </>
            ) : (
              "No readings yet"
            )}
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-green-100 hover:shadow-xl transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium text-green-700">Total Readings</CardTitle>
          <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-lg sm:text-2xl font-bold text-green-800">{totalReadings}</div>
          <p className="text-xs text-green-600">{totalReadings > 0 ? "Readings recorded" : "Start tracking today"}</p>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-0 bg-gradient-to-br from-orange-50 to-orange-100 hover:shadow-xl transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium text-orange-700">In Range</CardTitle>
          <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-lg sm:text-2xl font-bold text-orange-800">{stats.length > 0 ? `${inRangePercentage}%` : "0%"}</div>
          <p className="text-xs text-orange-600">{stats.length > 0 ? "Within normal range" : "No data available"}</p>
        </CardContent>
      </Card>
    </div>
  )
}
