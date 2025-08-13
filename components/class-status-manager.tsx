"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Settings } from "lucide-react"
import { useEffect, useRef } from "react"

interface Subject {
  id: number
  name: string
  time: string
  status: "active" | "completed" | "free"
}

interface ClassStatusManagerProps {
  subjects: Subject[]
  setSubjects: (subjects: Subject[]) => void
}

export default function ClassStatusManager({ subjects, setSubjects }: ClassStatusManagerProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  const updateClassStatus = (id: number, newStatus: "active" | "completed" | "free") => {
    setSubjects(subjects.map((subject) => (subject.id === id ? { ...subject, status: newStatus } : subject)))

    if (typeof window !== "undefined" && window.gsap) {
      window.gsap.fromTo(
        `[data-subject-id="${id}"]`,
        { scale: 0.95, opacity: 0.7 },
        { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)" },
      )
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500 shadow-lg shadow-green-500/30"
      case "completed":
        return "bg-red-500 shadow-lg shadow-red-500/30"
      case "free":
        return "bg-blue-500 shadow-lg shadow-blue-500/30"
      default:
        return "bg-gray-500"
    }
  }

  useEffect(() => {
    if (typeof window !== "undefined" && window.gsap && cardRef.current) {
      window.gsap.fromTo(
        cardRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" },
      )

      window.gsap.fromTo(
        ".status-item",
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: "power2.out", delay: 0.2 },
      )
    }
  }, [])

  return (
    <Card ref={cardRef} className="glass-card hover:scale-[1.02] transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-white">
          <Settings className="h-6 w-6 text-green-400 float-icon" />
          <span className="gradient-text">Class Status Manager</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {subjects.map((subject) => (
            <div
              key={subject.id}
              data-subject-id={subject.id}
              className="status-item p-5 glass-card rounded-xl hover:scale-[1.02] transition-all duration-300 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`w-4 h-4 rounded-full ${getStatusColor(subject.status)} relative`}>
                    {subject.status === "active" && (
                      <div className="absolute inset-0 rounded-full animate-ping bg-green-400 opacity-75"></div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-white group-hover:gradient-text transition-all">{subject.name}</h4>
                    <p className="text-sm text-slate-300">{subject.time}</p>
                  </div>
                </div>
                <Badge
                  variant={subject.status === "active" ? "default" : "secondary"}
                  className={`${
                    subject.status === "active"
                      ? "bg-green-500 text-white shadow-lg shadow-green-500/30"
                      : subject.status === "completed"
                        ? "bg-red-500/20 text-red-300 border border-red-500/30"
                        : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                  } transition-all duration-300`}
                >
                  {subject.status === "active" && "🟢 "}
                  {subject.status === "completed" && "🔴 "}
                  {subject.status === "free" && "🔵 "}
                  {subject.status === "active" ? "Ongoing" : subject.status === "completed" ? "Over" : "Free"}
                </Badge>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={subject.status === "active" ? "default" : "outline"}
                  onClick={() => updateClassStatus(subject.id, "active")}
                  className={`text-xs transition-all duration-300 ${
                    subject.status === "active"
                      ? "bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/30"
                      : "glass-card hover:bg-green-500/20 text-slate-300 hover:text-green-300 border-slate-600 hover:border-green-500/50"
                  }`}
                >
                  🟢 Ongoing
                </Button>
                <Button
                  size="sm"
                  variant={subject.status === "completed" ? "default" : "outline"}
                  onClick={() => updateClassStatus(subject.id, "completed")}
                  className={`text-xs transition-all duration-300 ${
                    subject.status === "completed"
                      ? "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30"
                      : "glass-card hover:bg-red-500/20 text-slate-300 hover:text-red-300 border-slate-600 hover:border-red-500/50"
                  }`}
                >
                  🔴 Over
                </Button>
                <Button
                  size="sm"
                  variant={subject.status === "free" ? "default" : "outline"}
                  onClick={() => updateClassStatus(subject.id, "free")}
                  className={`text-xs transition-all duration-300 ${
                    subject.status === "free"
                      ? "bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                      : "glass-card hover:bg-blue-500/20 text-slate-300 hover:text-blue-300 border-slate-600 hover:border-blue-500/50"
                  }`}
                >
                  🔵 Free
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
