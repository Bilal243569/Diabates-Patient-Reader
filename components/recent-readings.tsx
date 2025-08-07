import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "lucide-react"

interface SugarReading {
  id: number
  reading_type: string
  sugar_level: number
  reading_date: string
  reading_time: string
  notes: string | null
}

interface RecentReadingsProps {
  readings: SugarReading[]
}

export function RecentReadings({ readings }: RecentReadingsProps) {
  const getStatusColor = (level: number, type: string) => {
    if (type === "fasting") {
      if (level >= 70 && level <= 100) return "bg-green-100 text-green-800 border-green-200 hover:bg-green-200"
      if (level > 100) return "bg-red-100 text-red-800 border-red-200 hover:bg-red-200"
      return "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200"
    } else {
      if (level < 140) return "bg-green-100 text-green-800 border-green-200 hover:bg-green-200"
      if (level >= 140 && level < 200) return "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200"
      return "bg-red-100 text-red-800 border-red-200 hover:bg-red-200"
    }
  }

  const getStatus = (level: number, type: string) => {
    if (type === "fasting") {
      if (level >= 70 && level <= 100) return "normal"
      if (level > 100) return "high"
      return "low"
    } else {
      if (level < 140) return "normal"
      if (level >= 140 && level < 200) return "elevated"
      return "high"
    }
  }

  const formatDate = (dateString: string) => {
    return dateString
  }

  const formatTime = (timeString: string) => {
    const time = new Date(`2000-01-01T${timeString}`)
    return time.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  return (
    <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl text-gray-800">Recent Readings</CardTitle>
        <CardDescription className="text-gray-600 text-sm">Your latest blood sugar measurements</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 sm:space-y-4">
          {readings.length > 0 ? (
            readings.map((reading) => (
              <div
                key={reading.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-xs sm:text-sm capitalize">{reading.reading_type}</span>
                    <Badge className={`text-xs ${getStatusColor(reading.sugar_level, reading.reading_type)}`}>
                      {getStatus(reading.sugar_level, reading.reading_type)}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-500">
                    {reading.reading_time}
                  </div>
                  {reading.notes && (
                    <div className="text-xs text-gray-600 mt-1 truncate max-w-[120px] sm:max-w-xs" title={reading.notes}>
                      {reading.notes}
                    </div>
                  )}
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <div className="text-base sm:text-lg font-bold text-gray-900">{reading.sugar_level}</div>
                  <div className="text-xs text-gray-500">mg/dL</div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 sm:py-8 text-gray-500">
              <Calendar className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-gray-300" />
              <p className="text-sm sm:text-base">No readings recorded yet.</p>
              <p className="text-xs sm:text-sm">Add your first reading to get started!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
