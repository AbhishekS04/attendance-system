const bcrypt = require("bcrypt")

async function generateHashes() {
  const soetcrHash = await bcrypt.hash("soetcr2023", 10)
  const studentHash = await bcrypt.hash("student2023", 10)
  const teacherHash = await bcrypt.hash("teacher123", 10)
  const crHash = await bcrypt.hash("cr123", 10)

  console.log("-- Update users with proper password hashes")
  console.log(`UPDATE attendance.users SET password_hash = '${soetcrHash}' WHERE email = 'soetcr@gmail.com';`)
  console.log(`UPDATE attendance.users SET password_hash = '${studentHash}' WHERE email = 'student2023@gmail.com';`)
  console.log(`UPDATE attendance.users SET password_hash = '${teacherHash}' WHERE email = 'teacher@school.edu';`)
  console.log(`UPDATE attendance.users SET password_hash = '${crHash}' WHERE email = 'cr@school.edu';`)
}

generateHashes().catch(console.error)
