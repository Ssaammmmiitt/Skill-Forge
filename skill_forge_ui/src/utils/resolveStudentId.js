/**
 * Auth user id and game student id are the same UUID; older sessions may only have user_id.
 */
export function resolveStudentId(user, student) {
  return (
    user?.student_id ||
    user?.user_id ||
    student?.student_id ||
    null
  )
}
