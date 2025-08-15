import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Course } from "@shared/schema";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function CoursePlayer() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [courseContent, setCourseContent] = useState<any>(null);
  const [loadingContent, setLoadingContent] = useState(true);
  const [errorContent, setErrorContent] = useState<string | null>(null);

  const { data: course, isLoading: isLoadingCourse } = useQuery<Course>({
    queryKey: ["/api/courses", id],
    enabled: !!id,
  });

  const { data: access, isLoading: isLoadingAccess } = useQuery<{ hasAccess: boolean; reason?: string }>({
    queryKey: ["/api/courses", id, "access"],
    enabled: !!id,
  });

  useEffect(() => {
    const fetchCourseContent = async () => {
      if (!id || isLoadingAccess) return; // Wait for access check to complete

      if (!access?.hasAccess) {
        setLoadingContent(false);
        setErrorContent(access?.reason || "You do not have access to this course.");
        return;
      }

      try {
        setLoadingContent(true);
        const response = await apiRequest("GET", `/api/courses/${id}/content`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch course content.");
        }
        const data = await response.json();
        setCourseContent(data);
      } catch (err: any) {
        setErrorContent(err.message || "An error occurred while loading course content.");
        toast({
          title: "Error",
          description: err.message || "Failed to load course content.",
          variant: "destructive",
        });
      } finally {
        setLoadingContent(false);
      }
    };

    fetchCourseContent();
  }, [id, access, isLoadingAccess, toast]);

  if (isLoadingCourse || isLoadingAccess || loadingContent) {
    return (
      <div className="min-h-screen pt-16 px-4 flex items-center justify-center">
        <div className="glassmorphism p-8 rounded-2xl animate-pulse max-w-4xl w-full">
          <div className="h-12 bg-gray-700 rounded mb-4"></div>
          <div className="h-6 bg-gray-700 rounded mb-6"></div>
          <div className="h-40 bg-gray-700 rounded mb-6"></div>
        </div>
      </div>
    );
  }

  if (errorContent) {
    return (
      <div className="min-h-screen pt-16 px-4 flex items-center justify-center">
        <div className="glassmorphism p-8 rounded-2xl max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Access Denied</h2>
          <p className="text-gray-300">{errorContent}</p>
          <button 
            onClick={() => window.location.href = `/courses/${id}`}
            className="mt-6 bg-loop-purple hover:bg-loop-purple/80 text-white font-bold py-2 px-4 rounded"
          >
            Go to Course Details
          </button>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen pt-16 px-4 flex items-center justify-center">
        <div className="glassmorphism p-8 rounded-2xl max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Course Not Found</h2>
          <p className="text-gray-300">The course you are looking for does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 px-4">
      <div className="max-w-6xl mx-auto glassmorphism p-8 rounded-2xl">
        <h1 className="text-3xl font-bold mb-6">{course.title}</h1>
        <p className="text-gray-300 mb-8">Welcome to the course player for {course.title}.</p>

        {courseContent && courseContent.modules && courseContent.modules.length > 0 ? (
          <div className="space-y-8">
            {courseContent.modules.map((module: any) => (
              <div key={module.id} className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold mb-4">{module.title}</h2>
                <p className="text-gray-400 mb-6">{module.description}</p>
                <div className="space-y-4">
                  {module.lessons.map((lesson: any) => (
                    <div key={lesson.id} className="bg-gray-700 p-4 rounded-md flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium">{lesson.title}</h3>
                        <p className="text-sm text-gray-400">Type: {lesson.type}</p>
                      </div>
                      <button className="bg-loop-accent hover:bg-loop-accent/80 text-white px-3 py-1 rounded-md text-sm">
                        Start Lesson
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No content available for this course yet.</p>
        )}
      </div>
    </div>
  );
}
