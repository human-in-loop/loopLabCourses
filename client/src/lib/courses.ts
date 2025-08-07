import { useQuery } from "@tanstack/react-query";
import { Course } from "@shared/schema";

export function useCourses() {
  return useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });
}

export function useCourse(id: string) {
  return useQuery<Course>({
    queryKey: ["/api/courses", id],
    enabled: !!id,
  });
}

export function useCourseAccess(courseId: string) {
  return useQuery<{ hasAccess: boolean; reason?: string }>({
    queryKey: ["/api/courses", courseId, "access"],
    enabled: !!courseId,
  });
}

export function useUserEnrollments() {
  return useQuery({
    queryKey: ["/api/enrollments/my"],
  });
}
