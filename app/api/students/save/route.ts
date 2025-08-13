import { NextResponse } from 'next/server';
import { saveStudentsToDB } from '@/lib/db';

export async function POST(request: Request) {
  console.log('API: Received POST request to /api/students/save');
  try {
    const { students } = await request.json();
    console.log(`API: Parsed ${students?.length} students`);
    
    if (!students || !Array.isArray(students) || students.length === 0) {
      console.log('API: Invalid request - no students array');
      return NextResponse.json(
        { error: 'Invalid request. Students array is required.' },
        { status: 400 }
      );
    }

    // Validate each student object
    for (const student of students) {
      if (!student.name || !student.rollNumber || !student.class) {
        return NextResponse.json(
          { error: 'Each student must have name, rollNumber, and class properties.' },
          { status: 400 }
        );
      }
    }

    // Save students to database
    const results = await saveStudentsToDB(students);
    console.log(`API: Successfully saved ${results.length} students`);

    return NextResponse.json({
      message: `Successfully saved ${results.length} students to the database.`,
      count: results.length
    });
  } catch (error) {
    console.error('Error saving students:', error);
    console.log('API: Error in saving students');
    return NextResponse.json(
      { error: 'Failed to save students to database.' },
      { status: 500 }
    );
  }
}