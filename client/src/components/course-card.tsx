import { motion } from "framer-motion";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Course } from "@shared/schema";

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
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

  const getCategoryGradient = (category: string) => {
    switch (category) {
      case 'Development': return 'from-loop-purple to-loop-orange';
      case 'AI': return 'from-loop-orange to-loop-purple';
      case 'Security': return 'from-loop-accent to-loop-purple';
      default: return 'from-gray-600 to-gray-700';
    }
  };

  return (
    <motion.div
      className="glassmorphism p-8 rounded-2xl hover:bg-white/5 transition-all duration-300 group cursor-pointer h-full flex flex-col"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      data-testid={`card-course-${course.id}`}
    >
      <div className="flex items-center justify-between mb-6">
        <i className={`${getCategoryIcon(course.category)} text-3xl ${getCategoryColor(course.category)}`}></i>
        <Badge className="bg-loop-accent/20 text-loop-accent border-loop-accent/30">
          <i className="fas fa-lock mr-1"></i>
          Premium
        </Badge>
      </div>
      
      <div className="flex-grow">
        <h3 className={`text-2xl font-bold mb-4 group-hover:${getCategoryColor(course.category)} transition-colors`} data-testid={`text-course-title-${course.id}`}>
          {course.title}
        </h3>
        
        <p className="text-gray-300 mb-6 text-base leading-relaxed" data-testid={`text-course-description-${course.id}`}>
          {course.description}
        </p>
        
        <div className="space-y-3 mb-6">
          <div className="flex items-center text-sm text-gray-400">
            <i className="fas fa-calendar mr-2 w-4"></i>
            <span data-testid={`text-course-duration-${course.id}`}>{course.duration} • {course.units}</span>
          </div>
          <div className="flex items-center text-sm text-gray-400">
            <i className="fas fa-user mr-2 w-4"></i>
            <span data-testid={`text-course-instructor-${course.id}`}>{course.instructor}</span>
          </div>
          <div className="flex items-center text-sm text-gray-400">
            <i className="fas fa-clock mr-2 w-4"></i>
            <span data-testid={`text-course-schedule-${course.id}`}>{course.schedule}</span>
          </div>
        </div>
      </div>
      
      <Link href={`/course/${course.id}`}>
        <Button 
          className={`w-full bg-gradient-to-r ${getCategoryGradient(course.category)} py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 group-hover:scale-105`}
          data-testid={`button-access-course-${course.id}`}
        >
          Access Course
        </Button>
      </Link>
    </motion.div>
  );
}
