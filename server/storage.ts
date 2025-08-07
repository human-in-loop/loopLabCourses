import { type User, type InsertUser, type Course, type Enrollment, type InsertEnrollment } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser, verificationToken?: string): Promise<User>;
  updateUserActivity(id: string): Promise<void>;
  verifyUser(id: string): Promise<void>;
  verifyUserByToken(token: string): Promise<User | null>;
  getUnverifiedUsers(): Promise<User[]>;
  
  // Course management
  getCourses(): Promise<Course[]>;
  getCourse(id: string): Promise<Course | undefined>;
  
  // Enrollment management
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;
  getUserEnrollments(userId: string): Promise<Enrollment[]>;
  getCourseEnrollments(courseId: string): Promise<Enrollment[]>;
  grantCourseAccess(userId: string, courseId: string): Promise<void>;
  hasAccess(userId: string, courseId: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private courses: Map<string, Course>;
  private enrollments: Map<string, Enrollment>;

  constructor() {
    this.users = new Map();
    this.courses = new Map();
    this.enrollments = new Map();
    this.initializeCourses();
  }

  private initializeCourses() {
    const courseData: Course[] = [
      {
        id: "modern-software",
        title: "Modern Software Development",
        description: "Master AI-assisted coding, automated testing, and cutting-edge development workflows with hands-on projects and industry guest speakers.",
        instructor: "Mihail Eric",
        duration: "10 weeks",
        units: "3 units",
        schedule: "Mon/Fri Lectures",
        moodleUrl: "https://moodle.example.com/course/view.php?id=1",
        isPremium: true,
        category: "Development"
      },
      {
        id: "ai-agents",
        title: "AI Coding Agents",
        description: "Build autonomous coding agents from scratch, understand agent architecture, and implement advanced human-AI collaboration patterns.",
        instructor: "Expert Practitioners",
        duration: "8 weeks",
        units: "2 units", 
        schedule: "Self-paced",
        moodleUrl: "https://moodle.example.com/course/view.php?id=2",
        isPremium: true,
        category: "AI"
      },
      {
        id: "security-testing",
        title: "AI Security & Testing", 
        description: "Advanced AI-powered security analysis, automated vulnerability detection, and intelligent test suite generation for modern applications.",
        instructor: "Security Experts",
        duration: "6 weeks",
        units: "2 units",
        schedule: "Weekend Intensive",
        moodleUrl: "https://moodle.example.com/course/view.php?id=3",
        isPremium: true,
        category: "Security"
      }
    ];

    courseData.forEach(course => this.courses.set(course.id, course));
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser, verificationToken?: string): Promise<User> {
    const id = randomUUID();
    const tokenExpiry = verificationToken ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null; // 24 hours
    const user: User = {
      ...insertUser,
      id,
      isVerified: false,
      verificationToken: verificationToken || null,
      verificationTokenExpiry: tokenExpiry,
      lastActivity: new Date(),
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserActivity(id: string): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.lastActivity = new Date();
      this.users.set(id, user);
    }
  }

  async verifyUser(id: string): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.isVerified = true;
      user.verificationToken = null;
      user.verificationTokenExpiry = null;
      this.users.set(id, user);
    }
  }

  async verifyUserByToken(token: string): Promise<User | null> {
    const user = Array.from(this.users.values()).find(
      u => u.verificationToken === token && 
           u.verificationTokenExpiry && 
           u.verificationTokenExpiry > new Date()
    );
    
    if (user) {
      user.isVerified = true;
      user.verificationToken = null;
      user.verificationTokenExpiry = null;
      this.users.set(user.id, user);
      return user;
    }
    
    return null;
  }

  async getUnverifiedUsers(): Promise<User[]> {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    return Array.from(this.users.values()).filter(
      user => !user.isVerified && user.lastActivity && user.lastActivity < twoDaysAgo
    );
  }

  async getCourses(): Promise<Course[]> {
    return Array.from(this.courses.values());
  }

  async getCourse(id: string): Promise<Course | undefined> {
    return this.courses.get(id);
  }

  async createEnrollment(insertEnrollment: InsertEnrollment): Promise<Enrollment> {
    const id = randomUUID();
    const enrollment: Enrollment = {
      ...insertEnrollment,
      id,
      hasAccess: false,
      enrolledAt: new Date(),
    };
    this.enrollments.set(id, enrollment);
    return enrollment;
  }

  async getUserEnrollments(userId: string): Promise<Enrollment[]> {
    return Array.from(this.enrollments.values()).filter(
      enrollment => enrollment.userId === userId
    );
  }

  async getCourseEnrollments(courseId: string): Promise<Enrollment[]> {
    return Array.from(this.enrollments.values()).filter(
      enrollment => enrollment.courseId === courseId
    );
  }

  async grantCourseAccess(userId: string, courseId: string): Promise<void> {
    const enrollment = Array.from(this.enrollments.values()).find(
      e => e.userId === userId && e.courseId === courseId
    );
    if (enrollment) {
      enrollment.hasAccess = true;
      this.enrollments.set(enrollment.id, enrollment);
    }
  }

  async hasAccess(userId: string, courseId: string): Promise<boolean> {
    const enrollment = Array.from(this.enrollments.values()).find(
      e => e.userId === userId && e.courseId === courseId
    );
    return enrollment?.hasAccess || false;
  }
}

import { MongoStorage } from "./mongo-storage";

// Use MongoDB storage if available, fallback to memory storage
const useMongoStorage = process.env.MONGODB_URL ? true : false;

export const storage: IStorage = useMongoStorage 
  ? new MongoStorage() 
  : new MemStorage();

console.log(`Using ${useMongoStorage ? 'MongoDB' : 'in-memory'} storage`);
