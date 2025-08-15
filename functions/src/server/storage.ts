import {
  User, InsertUser,
  Course, InsertCourse,
  Enrollment, InsertEnrollment,
  LessonProgress, InsertLessonProgress,
  Submission, InsertSubmission, GradeSubmission,
  Module, Lesson
} from '@shared/schema';

// A new simplified pagination result type
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// A new simplified course structure type
export interface CourseStructure {
  course: Course;
  modules: Array<Module & { lessons: Lesson[] }>;
}

// The single, unified IStorage interface
export interface IStorage {
  // User Management
  getUser(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  createUser(user: InsertUser, verificationToken?: string): Promise<User>;
  updateUserActivity(id: string): Promise<void>;
  verifyUser(id: string): Promise<User | null>;
  verifyUserByToken(token: string): Promise<User | null>;
  updateUserVerificationToken(userId: string, token: string, expiry: Date): Promise<void>;
  getUnverifiedUsers(): Promise<User[]>;
  getPaginatedUsers(page: number, limit: number, search: string): Promise<PaginatedResult<User>>;

  // Course Management
  getCourses(): Promise<Course[]>;
  getCourse(id: string): Promise<Course | null>;
  createCourse(courseData: InsertCourse): Promise<Course>;
  updateCourse(id: string, updates: Partial<Course>): Promise<Course | null>;
  deleteCourse(id: string): Promise<boolean>;

  // Course Structure (Modules & Lessons)
  getCourseStructure(courseId: string): Promise<CourseStructure | null>;
  createModule(courseId: string, moduleData: Partial<Module>): Promise<Module>;
  updateModule(id: string, updates: Partial<Module>): Promise<Module | null>;
  deleteModule(id: string): Promise<boolean>;
  createLesson(moduleId: string, lessonData: Partial<Lesson>): Promise<Lesson>;
  updateLesson(id: string, updates: Partial<Lesson>): Promise<Lesson | null>;
  deleteLesson(id: string): Promise<boolean>;

  // Enrollment Management
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;
  getEnrollment(id: string): Promise<Enrollment | null>;
  getUserEnrollments(userId: string): Promise<Enrollment[]>;
  grantCourseAccess(userId: string, courseId: string): Promise<void>;
  revokeCourseAccess(userId: string, courseId: string): Promise<void>;
  hasAccess(userId: string, courseId: string): Promise<boolean>;
  completeCourse(enrollmentId: string, completedAt: Date, accessExpiresAt: Date): Promise<void>;

  // Lesson Progress
  recordLessonProgress(progress: InsertLessonProgress): Promise<LessonProgress>;
  getUserLessonProgress(userId: string, courseId: string): Promise<LessonProgress[]>;

  // Submissions
  createSubmission(submission: InsertSubmission): Promise<Submission>;
  getSubmission(id: string): Promise<Submission | null>;
  getUserSubmissions(userId: string, courseId: string): Promise<Submission[]>;
  getAllSubmissions(): Promise<Submission[]>;
  gradeSubmission(id: string, grade: GradeSubmission, gradedBy: string): Promise<Submission | null>;
}

// export const storage = new HybridStorage(); // Or whatever your storage class is named