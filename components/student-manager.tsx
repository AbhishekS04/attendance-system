"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Users, Plus, Edit, Trash2, RefreshCw, Upload } from "lucide-react"

interface Student {
  id: number
  name: string
  rollNumber: string
  class: string
}

interface StudentManagerProps {
  students: Student[]
  setStudents: (students: Student[]) => void
  showSuccess: (message: string) => void
}

export default function StudentManager({ students, setStudents, showSuccess }: StudentManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    rollNumber: "",
    class: "",
  })
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = () => {
    if (!formData.name || !formData.rollNumber || !formData.class) {
      alert("Please fill all fields!")
      return
    }

    if (editingStudent) {
      setStudents(students.map((s) => (s.id === editingStudent.id ? { ...editingStudent, ...formData } : s)))
      showSuccess("Student updated successfully!")
    } else {
      const newStudent = {
        id: Math.max(...students.map((s) => s.id), 0) + 1,
        ...formData,
      }
      setStudents([...students, newStudent])
      showSuccess("Student added successfully!")
    }

    setIsDialogOpen(false)
    setEditingStudent(null)
    setFormData({ name: "", rollNumber: "", class: "" })
  }

  const handleEdit = (student: Student) => {
    setEditingStudent(student)
    setFormData({
      name: student.name,
      rollNumber: student.rollNumber,
      class: student.class,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this student?")) {
      setStudents(students.filter((s) => s.id !== id))
      showSuccess("Student deleted successfully!")
    }
  }

  const openAddDialog = () => {
    setEditingStudent(null)
    setFormData({ name: "", rollNumber: "", class: "" })
    setIsDialogOpen(true)
  }

  const saveStudentsToDB = async () => {
    try {
      setIsSaving(true)
      const response = await fetch('/api/students/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ students }),
      })

      const data = await response.json()
      
      if (response.ok) {
        showSuccess(data.message || `Successfully saved ${data.count} students to the database.`)
      } else {
        throw new Error(data.error || 'Failed to save students to database')
      }
    } catch (error) {
      console.error('Error saving students:', error)
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to save students to database'}`)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Student Management</h2>
        <div className="flex gap-3">
          <Button 
            onClick={saveStudentsToDB} 
            className="bg-green-600 hover:bg-green-700"
            disabled={isSaving || students.length === 0}
          >
            {isSaving ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Save to Database
              </>
            )}
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAddDialog} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-800 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white">{editingStudent ? "Edit Student" : "Add New Student"}</DialogTitle>
              </DialogHeader>
            <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-gray-300">
                    Student Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter student name"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="rollNumber" className="text-gray-300">
                    Roll Number
                  </Label>
                  <Input
                    id="rollNumber"
                    value={formData.rollNumber}
                    onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                    placeholder="Enter roll number"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="class" className="text-gray-300">
                    Class
                  </Label>
                  <Input
                    id="class"
                    value={formData.class}
                    onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                    placeholder="Enter class (e.g., CSE-A)"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <Button onClick={handleSubmit} className="w-full">
                  {editingStudent ? "Update Student" : "Add Student"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Users className="h-5 w-5" />
            Student List ({students.length} students)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {students.map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between p-3 bg-gray-700 rounded-lg border border-gray-600"
              >
                <div>
                  <h3 className="font-semibold text-white">{student.name}</h3>
                  <p className="text-sm text-gray-300">
                    Roll No: {student.rollNumber} • Class: {student.class}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(student)}
                    className="bg-blue-600 hover:bg-blue-700 text-white border-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(student.id)}
                    className="bg-red-600 hover:bg-red-700 text-white border-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
