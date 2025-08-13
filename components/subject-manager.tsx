"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { BookOpen, Plus, Edit, Trash2 } from "lucide-react"

interface Subject {
  id: number
  name: string
  code: string
  faculty: string
  time: string
  status: string
  day: string
}

interface SubjectManagerProps {
  subjects: Subject[]
  setSubjects: (subjects: Subject[]) => void
  showSuccess: (message: string) => void
}

export default function SubjectManager({ subjects, setSubjects, showSuccess }: SubjectManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    faculty: "",
    time: "",
    day: "Monday",
  })

  const handleSubmit = () => {
    if (!formData.name || !formData.code || !formData.faculty || !formData.time) {
      alert("Please fill all fields!")
      return
    }

    if (editingSubject) {
      setSubjects(
        subjects.map((s) =>
          s.id === editingSubject.id ? { ...editingSubject, ...formData, status: editingSubject.status } : s,
        ),
      )
      showSuccess("Subject updated successfully!")
    } else {
      const newSubject = {
        id: Math.max(...subjects.map((s) => s.id), 0) + 1,
        ...formData,
        status: "free",
      }
      setSubjects([...subjects, newSubject])
      showSuccess("Subject added successfully!")
    }

    setIsDialogOpen(false)
    setEditingSubject(null)
    setFormData({ name: "", code: "", faculty: "", time: "", day: "Monday" })
  }

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject)
    setFormData({
      name: subject.name,
      code: subject.code,
      faculty: subject.faculty,
      time: subject.time,
      day: subject.day,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this subject?")) {
      setSubjects(subjects.filter((s) => s.id !== id))
      showSuccess("Subject deleted successfully!")
    }
  }

  const openAddDialog = () => {
    setEditingSubject(null)
    setFormData({ name: "", code: "", faculty: "", time: "", day: "Monday" })
    setIsDialogOpen(true)
  }

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Subject Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Subject
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-800 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">{editingSubject ? "Edit Subject" : "Add New Subject"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-gray-300">
                  Subject Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter subject name"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="code" className="text-gray-300">
                  Subject Code
                </Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="Enter subject code (e.g., CS101)"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="faculty" className="text-gray-300">
                  Faculty Name
                </Label>
                <Input
                  id="faculty"
                  value={formData.faculty}
                  onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                  placeholder="Enter faculty name"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="time" className="text-gray-300">
                  Time Slot
                </Label>
                <Input
                  id="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  placeholder="e.g., 9:00 AM - 10:00 AM"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="day" className="text-gray-300">
                  Day
                </Label>
                <select
                  id="day"
                  value={formData.day}
                  onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                  className="w-full p-2 bg-gray-700 border border-gray-600 text-white rounded-md"
                >
                  {days.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>
              <Button onClick={handleSubmit} className="w-full">
                {editingSubject ? "Update Subject" : "Add Subject"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {days.map((day) => {
          const daySubjects = subjects.filter((s) => s.day === day)
          return (
            <Card key={day} className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <BookOpen className="h-5 w-5" />
                  {day} ({daySubjects.length} subjects)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {daySubjects.map((subject) => (
                    <div
                      key={subject.id}
                      className="flex items-center justify-between p-3 bg-gray-700 rounded-lg border border-gray-600"
                    >
                      <div>
                        <h3 className="font-semibold text-white">{subject.name}</h3>
                        <p className="text-sm text-gray-300">
                          {subject.code} • {subject.faculty} • {subject.time}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(subject)}
                          className="bg-blue-600 hover:bg-blue-700 text-white border-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(subject.id)}
                          className="bg-red-600 hover:bg-red-700 text-white border-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {daySubjects.length === 0 && (
                    <p className="text-gray-400 text-center py-4">No subjects scheduled for {day}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
