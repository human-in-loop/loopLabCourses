import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useState } from "react";
import { Course } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface CourseModule {
  id: string;
  title: string;
  description: string;
  lessons: CourseLesson[];
  isCompleted: boolean;
}

interface CourseLesson {
  id: string;
  title: string;
  type: 'video' | 'text' | 'assignment';
  content: string;
  duration?: string;
  isCompleted: boolean;
}

export default function CoursePlayer() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: course, isLoading: courseLoading } = useQuery<Course>({
    queryKey: ["/api/courses", id],
  });

  const { data: user } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  const { data: progress } = useQuery({
    queryKey: ["/api/courses", id, "progress"],
    enabled: !!id && !!user,
  });

  const completeLesson = useMutation({
    mutationFn: async (lessonId: string) => {
      return apiRequest(`/api/lessons/${lessonId}/complete`, {
        method: "POST",
        body: JSON.stringify({ courseId: id }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses", id, "progress"] });
      queryClient.invalidateQueries({ queryKey: ["/api/courses", id, "content"] });
      toast({
        title: "Lesson Completed",
        description: "Your progress has been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to mark lesson as complete. Please try again.",
        variant: "destructive",
      });
    },
  });

  const { data: access, isLoading: accessLoading } = useQuery({
    queryKey: ["/api/courses", id, "access"],
    enabled: !!user && !!id,
  });

  const { data: courseContent, isLoading: contentLoading } = useQuery<{
    modules: CourseModule[];
    progress: number;
    enrollmentId: string;
  }>({
    queryKey: ["/api/courses", id, "content"],
    enabled: !!user && !!id && access?.hasAccess,
    retry: (failureCount, error: any) => {
      if (error?.message?.includes('expired') || error?.message?.includes('access')) {
        return false; // Don't retry for access errors
      }
      return failureCount < 3;
    },
  });

  const completeCoursesMutation = useMutation({
    mutationFn: async (enrollmentId: string) => {
      const response = await apiRequest("POST", "/api/courses/complete", { enrollmentId });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Congratulations!",
        description: `Course completed! Access expires on ${new Date(data.accessExpiresAt).toLocaleDateString()}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/courses", id, "content"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to mark course as complete",
        variant: "destructive",
      });
    },
  });

  // Redirect if not authenticated
  if (!user) {
    setLocation("/auth");
    return null;
  }

  if (courseLoading || accessLoading) {
    return (
      <div className="min-h-screen pt-16 px-4 flex items-center justify-center">
        <div className="glassmorphism p-8 rounded-2xl animate-pulse max-w-6xl w-full">
          <div className="h-8 bg-gray-700 rounded mb-4"></div>
          <div className="grid lg:grid-cols-4 gap-6">
            <div className="h-96 bg-gray-700 rounded"></div>
            <div className="lg:col-span-3 h-96 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen pt-16 px-4 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4 glassmorphism border-gray-700">
          <CardContent className="pt-6">
            <div className="flex mb-4 gap-2">
              <i className="fas fa-exclamation-circle text-2xl text-red-500"></i>
              <h1 className="text-2xl font-bold text-white">Course Not Found</h1>
            </div>
            <p className="mt-4 text-sm text-gray-300">
              The course you're looking for doesn't exist or has been removed.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!access?.hasAccess) {
    return (
      <div className="min-h-screen pt-16 px-4 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4 glassmorphism border-gray-700">
          <CardContent className="pt-6">
            <div className="flex mb-4 gap-2">
              <i className="fas fa-lock text-2xl text-yellow-500"></i>
              <h1 className="text-2xl font-bold text-white">Access Denied</h1>
            </div>
            <p className="mt-4 text-sm text-gray-300">
              {access?.reason === "Email not verified" 
                ? "Please verify your email to access this course."
                : "You don't have access to this course. Please enroll first."}
            </p>
            <Button 
              onClick={() => setLocation(`/courses/${id}`)}
              className="mt-4 w-full bg-gradient-to-r from-loop-purple to-loop-orange"
            >
              View Course Details
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (contentLoading) {
    return (
      <div className="min-h-screen pt-16 px-4 flex items-center justify-center">
        <div className="glassmorphism p-8 rounded-2xl animate-pulse max-w-6xl w-full">
          <div className="h-8 bg-gray-700 rounded mb-4"></div>
          <div className="grid lg:grid-cols-4 gap-6">
            <div className="h-96 bg-gray-700 rounded"></div>
            <div className="lg:col-span-3 h-96 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Mock course content for demonstration
  const mockContent = {
    modules: [
      {
        id: "module-1",
        title: "Introduction to Modern Software Development",
        description: "Get started with AI-assisted coding fundamentals",
        isCompleted: false,
        lessons: [
          {
            id: "lesson-1-1",
            title: "Course Overview",
            type: "video" as const,
            content: "Welcome to Modern Software Development! This course will teach you...",
            duration: "15 min",
            isCompleted: false,
          },
          {
            id: "lesson-1-2",
            title: "Development Environment Setup",
            type: "text" as const,
            content: "Let's set up your development environment...",
            isCompleted: false,
          },
        ],
      },
      {
        id: "module-2",
        title: "AI-Assisted Coding",
        description: "Learn to leverage AI tools for faster development",
        isCompleted: false,
        lessons: [
          {
            id: "lesson-2-1",
            title: "Introduction to GitHub Copilot",
            type: "video" as const,
            content: "GitHub Copilot is an AI pair programmer...",
            duration: "20 min",
            isCompleted: false,
          },
          {
            id: "lesson-2-2",
            title: "First Coding Assignment",
            type: "assignment" as const,
            content: "Create a simple web application using AI assistance...",
            isCompleted: false,
          },
        ],
      },
    ],
    progress: 25,
    enrollmentId: "enrollment-123",
  };

  const content = courseContent || mockContent;
  const currentModule = content.modules.find(m => m.id === selectedModule) || content.modules[0];
  const currentLesson = currentModule?.lessons.find(l => l.id === selectedLesson) || currentModule?.lessons[0];

  const handleCompleteCourse = () => {
    if (content.enrollmentId) {
      completeCoursesMutation.mutate(content.enrollmentId);
    }
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video': return 'fas fa-play-circle';
      case 'text': return 'fas fa-file-text';
      case 'assignment': return 'fas fa-tasks';
      default: return 'fas fa-book';
    }
  };

  return (
    <div className="min-h-screen pt-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-loop-purple/20 to-loop-orange/20 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2" data-testid="text-course-title">
                {course.title}
              </h1>
              <div className="flex items-center gap-4">
                <Progress value={content.progress} className="w-32" />
                <span className="text-sm text-gray-300">{content.progress}% Complete</span>
              </div>
            </div>
            <Button
              onClick={() => setLocation(`/courses/${id}`)}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Back to Course
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar - Course Modules */}
          <div className="lg:col-span-1">
            <Card className="glassmorphism border-gray-700 sticky top-24">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <i className="fas fa-list mr-2"></i>
                  Course Modules
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {content.modules.map((module) => (
                  <div key={module.id} className="space-y-2">
                    <button
                      onClick={() => {
                        setSelectedModule(module.id);
                        setSelectedLesson(module.lessons[0]?.id || null);
                      }}
                      className={`w-full p-3 rounded-lg text-left transition-all ${
                        selectedModule === module.id
                          ? 'bg-loop-purple/20 border border-loop-purple/50'
                          : 'bg-gray-800/50 hover:bg-gray-700/50'
                      }`}
                      data-testid={`button-module-${module.id}`}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-white text-sm">{module.title}</h3>
                        {module.isCompleted && (
                          <i className="fas fa-check-circle text-green-500"></i>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{module.description}</p>
                    </button>
                    
                    {selectedModule === module.id && (
                      <div className="ml-4 space-y-1">
                        {module.lessons.map((lesson) => (
                          <button
                            key={lesson.id}
                            onClick={() => setSelectedLesson(lesson.id)}
                            className={`w-full p-2 rounded text-left text-sm transition-all ${
                              selectedLesson === lesson.id
                                ? 'bg-loop-orange/20 text-loop-orange'
                                : 'text-gray-300 hover:bg-gray-700/30'
                            }`}
                            data-testid={`button-lesson-${lesson.id}`}
                          >
                            <div className="flex items-center">
                              <i className={`${getLessonIcon(lesson.type)} mr-2`}></i>
                              <span>{lesson.title}</span>
                              {lesson.duration && (
                                <span className="ml-auto text-xs text-gray-500">
                                  {lesson.duration}
                                </span>
                              )}
                              {lesson.isCompleted && (
                                <i className="fas fa-check ml-2 text-green-500"></i>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <Card className="glassmorphism border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center">
                      <i className={`${getLessonIcon(currentLesson?.type || 'text')} mr-2`}></i>
                      {currentLesson?.title || "Select a lesson"}
                    </CardTitle>
                    {currentLesson?.duration && (
                      <p className="text-gray-400 text-sm mt-1">
                        Duration: {currentLesson.duration}
                      </p>
                    )}
                  </div>
                  {content.progress >= 90 && (
                    <Button
                      onClick={handleCompleteCourse}
                      disabled={completeCoursesMutation.isPending}
                      className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                    >
                      {completeCoursesMutation.isPending ? (
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                      ) : (
                        <i className="fas fa-trophy mr-2"></i>
                      )}
                      Complete Course
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {currentLesson ? (
                  <div className="space-y-6">
                    {currentLesson.type === 'video' && (
                      <div className="bg-black rounded-lg aspect-video flex items-center justify-center">
                        <div className="text-center text-gray-400">
                          <i className="fas fa-play-circle text-6xl mb-4"></i>
                          <p>Video Player Placeholder</p>
                          <p className="text-sm">In production, this would integrate with your video platform</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="prose prose-invert max-w-none">
                      <div className="text-gray-300 leading-relaxed">
                        {currentLesson.content}
                      </div>
                      {!currentLesson.isCompleted && (
                        <div className="mt-6 pt-6 border-t border-gray-700">
                          <Button
                            onClick={() => completeLesson.mutate(currentLesson.id)}
                            disabled={completeLesson.isPending}
                            className="bg-green-600 hover:bg-green-700 text-white"
                            data-testid={`button-complete-current-lesson`}
                          >
                            {completeLesson.isPending ? (
                              <>
                                <i className="fas fa-spinner fa-spin mr-2"></i>
                                Saving Progress...
                              </>
                            ) : (
                              <>
                                <i className="fas fa-check mr-2"></i>
                                Mark Lesson Complete
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>

                    {currentLesson.type === 'assignment' && (
                      <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-6">
                        <h3 className="text-blue-300 font-semibold mb-3">
                          <i className="fas fa-tasks mr-2"></i>
                          Assignment
                        </h3>
                        <p className="text-gray-300 mb-4">{currentLesson.content}</p>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          Submit Assignment
                        </Button>
                      </div>
                    )}

                    <div className="flex justify-between pt-6 border-t border-gray-700">
                      <Button
                        variant="outline"
                        disabled={!currentLesson}
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        <i className="fas fa-chevron-left mr-2"></i>
                        Previous
                      </Button>
                      <Button
                        disabled={!currentLesson}
                        className="bg-gradient-to-r from-loop-purple to-loop-orange"
                      >
                        Next
                        <i className="fas fa-chevron-right ml-2"></i>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-12">
                    <i className="fas fa-book-open text-6xl mb-4"></i>
                    <p>Select a module and lesson to begin learning</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}