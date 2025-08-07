import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useState } from "react";
import { Course } from "@shared/schema";
import CourseAccessModal from "@/components/course-access-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const [showAccessModal, setShowAccessModal] = useState(false);
  
  const { data: course, isLoading } = useQuery<Course>({
    queryKey: ["/api/courses", id],
  });

  const handleEnroll = () => {
    setShowAccessModal(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 px-4 flex items-center justify-center">
        <div className="glassmorphism p-8 rounded-2xl animate-pulse max-w-4xl w-full">
          <div className="h-12 bg-gray-700 rounded mb-4"></div>
          <div className="h-6 bg-gray-700 rounded mb-6"></div>
          <div className="h-40 bg-gray-700 rounded mb-6"></div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="h-32 bg-gray-700 rounded"></div>
            <div className="h-32 bg-gray-700 rounded"></div>
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Development': return 'fas fa-code';
      case 'AI': return 'fas fa-robot';
      case 'Security': return 'fas fa-shield-alt';
      default: return 'fas fa-book';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Development': return 'text-loop-purple';
      case 'AI': return 'text-loop-orange';
      case 'Security': return 'text-loop-accent';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-loop-purple/20 via-loop-dark to-loop-orange/20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center mb-6">
              <i className={`${getCategoryIcon(course.category)} text-4xl ${getCategoryColor(course.category)} mr-4`}></i>
              <Badge className="bg-loop-accent/20 text-loop-accent border-loop-accent/30" data-testid="badge-premium">
                <i className="fas fa-lock mr-1"></i>Premium Course
              </Badge>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 gradient-text" data-testid="text-course-title">
              {course.title}
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-8" data-testid="text-course-description">
              {course.description}
            </p>

            <Button
              onClick={handleEnroll}
              className="bg-gradient-to-r from-loop-purple to-loop-orange px-8 py-4 rounded-full text-lg font-semibold hover:shadow-lg hover:shadow-loop-purple/25 transform hover:scale-105 transition-all duration-300 animate-glow"
              data-testid="button-enroll"
            >
              <i className="fas fa-rocket mr-2"></i>
              Enroll Now
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Course Details */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Card className="glassmorphism border-gray-700 mb-8">
                  <CardHeader>
                    <CardTitle className="text-2xl text-white">Course Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">What You'll Learn</h3>
                        <div className="grid md:grid-cols-2 gap-3">
                          {[
                            "AI-assisted development workflows",
                            "Modern testing and deployment practices", 
                            "Industry-standard development tools",
                            "Real-world project experience",
                            "Collaborative coding techniques",
                            "Performance optimization strategies"
                          ].map((skill, index) => (
                            <div key={skill} className="flex items-center text-gray-300" data-testid={`text-skill-${index}`}>
                              <i className="fas fa-check-circle text-loop-accent mr-2"></i>
                              {skill}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Course Format</h3>
                        <div className="space-y-2 text-gray-300">
                          <div className="flex items-center">
                            <i className="fas fa-video text-loop-purple mr-2"></i>
                            Weekly interactive lectures and live coding sessions
                          </div>
                          <div className="flex items-center">
                            <i className="fas fa-code text-loop-orange mr-2"></i>
                            Hands-on programming assignments and projects
                          </div>
                          <div className="flex items-center">
                            <i className="fas fa-users text-loop-accent mr-2"></i>
                            Guest speakers from leading tech companies
                          </div>
                          <div className="flex items-center">
                            <i className="fas fa-comments text-loop-purple mr-2"></i>
                            Interactive Q&A and discussion forums
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Prerequisites</h3>
                        <div className="space-y-2 text-gray-300">
                          <div className="flex items-center">
                            <i className="fas fa-graduation-cap text-loop-orange mr-2"></i>
                            CS111 equivalent programming experience
                          </div>
                          <div className="flex items-center">
                            <i className="fas fa-laptop-code text-loop-purple mr-2"></i>
                            Basic familiarity with version control (Git)
                          </div>
                          <div className="flex items-center">
                            <i className="fas fa-brain text-loop-accent mr-2"></i>
                            CS221/229 recommended but not required
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Card className="glassmorphism border-gray-700 sticky top-24">
                  <CardHeader>
                    <CardTitle className="text-xl text-white">Course Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-gray-700">
                      <span className="text-gray-400">Instructor</span>
                      <span className="text-white font-semibold" data-testid="text-instructor">{course.instructor}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b border-gray-700">
                      <span className="text-gray-400">Duration</span>
                      <span className="text-white font-semibold" data-testid="text-duration">{course.duration}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b border-gray-700">
                      <span className="text-gray-400">Units</span>
                      <span className="text-white font-semibold" data-testid="text-units">{course.units}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b border-gray-700">
                      <span className="text-gray-400">Schedule</span>
                      <span className="text-white font-semibold" data-testid="text-schedule">{course.schedule}</span>
                    </div>
                    
                    <div className="pt-4">
                      <Button
                        onClick={handleEnroll}
                        className="w-full bg-gradient-to-r from-loop-purple to-loop-orange hover:shadow-lg hover:shadow-loop-purple/25 transition-all duration-300"
                        size="lg"
                        data-testid="button-enroll-sidebar"
                      >
                        <i className="fas fa-user-plus mr-2"></i>
                        Enroll in Course
                      </Button>
                    </div>

                    <div className="pt-2">
                      <p className="text-sm text-gray-400 text-center">
                        <i className="fas fa-info-circle mr-1"></i>
                        Email verification required for access
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <CourseAccessModal 
        isOpen={showAccessModal} 
        onClose={() => setShowAccessModal(false)}
        courseTitle={course.title}
      />
    </div>
  );
}
