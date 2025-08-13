"use client"

import { useState, useEffect } from "react"
import { Calendar, dateFnsLocalizer } from "react-big-calendar"
import { format, parse, startOfWeek, getDay } from "date-fns"
import { enUS } from "date-fns/locale"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import "react-big-calendar/lib/css/react-big-calendar.css"

const locales = {
  "en-US": enUS,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

interface AttendanceEvent {
  id: string
  title: string
  start: Date
  end: Date
  resource: {
    status: "present" | "absent" | "late"
    subject: string
    class: string
  }
}

interface AttendanceCalendarProps {
  studentId?: string
  classId?: string
}

export default function AttendanceCalendar({ studentId, classId }: AttendanceCalendarProps) {
  const [events, setEvents] = useState<AttendanceEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAttendanceData()
  }, [studentId, classId])

  const fetchAttendanceData = async () => {
    try {
      const params = new URLSearchParams()
      if (studentId) params.append("studentId", studentId)
      if (classId) params.append("classId", classId)

      const response = await fetch(`/api/attendance/records?${params}`)
      const records = await response.json()

      const attendanceEvents: AttendanceEvent[] = records.map((record: any) => ({
        id: record.id,
        title: `${record.subject_name} - ${record.status}`,
        start: new Date(record.date),
        end: new Date(record.date),
        resource: {
          status: record.status,
          subject: record.subject_name,
          class: record.class_name,
        },
      }))

      setEvents(attendanceEvents)
    } catch (error) {
      console.error("Error fetching attendance data:", error)
    } finally {
      setLoading(false)
    }
  }

  const eventStyleGetter = (event: AttendanceEvent) => {
    let backgroundColor = "#3174ad"

    switch (event.resource.status) {
      case "present":
        backgroundColor = "#10b981"
        break
      case "absent":
        backgroundColor = "#ef4444"
        break
      case "late":
        backgroundColor = "#f59e0b"
        break
    }

    return {
      style: {
        backgroundColor,
        borderRadius: "4px",
        opacity: 0.8,
        color: "white",
        border: "0px",
        display: "block",
      },
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Attendance Calendar</CardTitle>
          <CardDescription>Loading attendance data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance Calendar</CardTitle>
        <CardDescription>Visual overview of attendance records</CardDescription>
        <div className="flex gap-4 mt-4">
          <div className="flex items-center gap-2">
            <Badge className="bg-green-500">Present</Badge>
            <Badge className="bg-red-500">Absent</Badge>
            <Badge className="bg-yellow-500">Late</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-96">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            eventPropGetter={eventStyleGetter}
            views={["month", "week", "day"]}
            defaultView="month"
          />
        </div>
      </CardContent>
    </Card>
  )
}
