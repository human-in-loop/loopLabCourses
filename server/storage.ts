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
  getEnrollment(id: string): Promise<Enrollment | undefined>;
  getUserEnrollments(userId: string): Promise<Enrollment[]>;
  getCourseEnrollments(courseId: string): Promise<Enrollment[]>;
  grantCourseAccess(userId: string, courseId: string): Promise<void>;
  hasAccess(userId: string, courseId: string): Promise<boolean>;
  completeCourse(enrollmentId: string, completedAt: Date, accessExpiresAt: Date): Promise<void>;
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
        category: "Development",
        price: 29900 // $299.00 in cents
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
        category: "AI",
        price: 19900 // $199.00 in cents
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
        category: "Security",
        price: 0 // Free course
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
      completedAt: null,
      accessExpiresAt: null,
      paymentId: null,
      paidAmount: null,
    };
    this.enrollments.set(id, enrollment);
    return enrollment;
  }

  async getEnrollment(id: string): Promise<Enrollment | undefined> {
    return this.enrollments.get(id);
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
    
    // Check if enrollment exists and has access
    if (!enrollment?.hasAccess) {
      return false;
    }
    
    // Check if access has expired
    if (enrollment.accessExpiresAt && enrollment.accessExpiresAt < new Date()) {
      return false;
    }
    
    return true;
  }

  async completeCourse(enrollmentId: string, completedAt: Date, accessExpiresAt: Date): Promise<void> {
    const enrollment = this.enrollments.get(enrollmentId);
    if (enrollment) {
      enrollment.completedAt = completedAt;
      enrollment.accessExpiresAt = accessExpiresAt;
      this.enrollments.set(enrollmentId, enrollment);
    }
  }
}

import { MongoStorage } from "./mongo-storage";

// Always try MongoDB first if URL is provided, with graceful fallback
class HybridStorage implements IStorage {
  private mongoStorage: MongoStorage | null = null;
  private memStorage: MemStorage;
  
  constructor() {
    this.memStorage = new MemStorage();
    if (process.env.MONGODB_URL) {
      this.mongoStorage = new MongoStorage();
      console.log('Attempting MongoDB connection with in-memory fallback');
    } else {
      console.log('Using in-memory storage (no MongoDB URL provided)');
    }
  }
  
  private async useStorage(): Promise<IStorage> {
    if (this.mongoStorage) {
      // Import mongoDB here to avoid circular dependency
      const { mongoDB } = await import("./mongodb");
      if (mongoDB.isReady()) {
        return this.mongoStorage;
      }
    }
    return this.memStorage;
  }

  async getUser(id: string): Promise<User | undefined> {
    const storage = await this.useStorage();
    return storage.getUser(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const storage = await this.useStorage();
    return storage.getUserByEmail(email);
  }

  async createUser(user: InsertUser, verificationToken?: string): Promise<User> {
    const storage = await this.useStorage();
    return storage.createUser(user, verificationToken);
  }

  async updateUserActivity(id: string): Promise<void> {
    const storage = await this.useStorage();
    return storage.updateUserActivity(id);
  }

  async verifyUser(id: string): Promise<void> {
    const storage = await this.useStorage();
    return storage.verifyUser(id);
  }

  async verifyUserByToken(token: string): Promise<User | null> {
    const storage = await this.useStorage();
    return storage.verifyUserByToken(token);
  }

  async getUnverifiedUsers(): Promise<User[]> {
    const storage = await this.useStorage();
    return storage.getUnverifiedUsers();
  }

  async getCourses(): Promise<Course[]> {
    const storage = await this.useStorage();
    return storage.getCourses();
  }

  async getCourse(id: string): Promise<Course | undefined> {
    const storage = await this.useStorage();
    return storage.getCourse(id);
  }

  async createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment> {
    const storage = await this.useStorage();
    return storage.createEnrollment(enrollment);
  }

  async getUserEnrollments(userId: string): Promise<Enrollment[]> {
    const storage = await this.useStorage();
    return storage.getUserEnrollments(userId);
  }

  async getCourseEnrollments(courseId: string): Promise<Enrollment[]> {
    const storage = await this.useStorage();
    return storage.getCourseEnrollments(courseId);
  }

  async grantCourseAccess(userId: string, courseId: string): Promise<void> {
    const storage = await this.useStorage();
    return storage.grantCourseAccess(userId, courseId);
  }

  async hasAccess(userId: string, courseId: string): Promise<boolean> {
    const storage = await this.useStorage();
    return storage.hasAccess(userId, courseId);
  }

  async getEnrollment(id: string): Promise<Enrollment | undefined> {
    const storage = await this.useStorage();
    return storage.getEnrollment(id);
  }

  async completeCourse(enrollmentId: string, completedAt: Date, accessExpiresAt: Date): Promise<void> {
    const storage = await this.useStorage();
    return storage.completeCourse(enrollmentId, completedAt, accessExpiresAt);
  }
}

export const storage: IStorage = new HybridStorage();
