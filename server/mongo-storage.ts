import { type User, type InsertUser, type Course, type Enrollment, type InsertEnrollment } from "@shared/schema";
import { randomUUID } from "crypto";
import { mongoDB } from "./mongodb";
import type { IStorage } from "./storage";

export class MongoStorage implements IStorage {
  constructor() {
    this.initializeCourses();
  }

  private async initializeCourses() {
    // Wait up to 10 seconds for MongoDB to connect
    let retries = 0;
    const maxRetries = 10;
    
    while (!mongoDB.isReady() && retries < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      retries++;
    }
    
    if (!mongoDB.isReady()) {
      console.log('MongoDB not available, courses will be handled by fallback storage');
      return;
    }

    const coursesCollection = mongoDB.getCoursesCollection();
    if (!coursesCollection) return;

    try {
      const existingCount = await coursesCollection.countDocuments();
      if (existingCount > 0) {
        console.log(`Found ${existingCount} existing courses in MongoDB`);
        return;
      }

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

      await coursesCollection.insertMany(courseData);
      console.log('Initialized courses in MongoDB Courses collection');
    } catch (error) {
      console.error('Error initializing courses:', error);
    }
  }

  // User management
  async getUser(id: string): Promise<User | undefined> {
    const collection = mongoDB.getUsersCollection();
    if (!collection) return undefined;
    
    const user = await collection.findOne({ id });
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const collection = mongoDB.getUsersCollection();
    if (!collection) return undefined;
    
    const user = await collection.findOne({ email });
    return user || undefined;
  }

  async createUser(insertUser: InsertUser, verificationToken?: string): Promise<User> {
    const collection = mongoDB.getUsersCollection();
    if (!collection) {
      throw new Error('MongoDB not available');
    }

    const id = randomUUID();
    const now = new Date();
    const tokenExpiry = verificationToken ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null;
    
    const user: User = {
      ...insertUser,
      id,
      isVerified: false,
      verificationToken: verificationToken || null,
      verificationTokenExpiry: tokenExpiry,
      lastActivity: now,
      createdAt: now,
    };

    await collection.insertOne(user);
    console.log(`User created in MongoDB: ${user.email} at ${now.toISOString()}`);
    return user;
  }

  async updateUserActivity(id: string): Promise<void> {
    const collection = mongoDB.getUsersCollection();
    if (!collection) return;

    await collection.updateOne(
      { id },
      { $set: { lastActivity: new Date() } }
    );
  }

  async verifyUser(id: string): Promise<void> {
    const collection = mongoDB.getUsersCollection();
    if (!collection) return;

    const result = await collection.updateOne(
      { id },
      { 
        $set: { 
          isVerified: true,
          verificationToken: null,
          verificationTokenExpiry: null,
          lastActivity: new Date()
        }
      }
    );
    
    if (result.modifiedCount > 0) {
      console.log(`User verified in MongoDB: ${id}`);
    }
  }

  async verifyUserByToken(token: string): Promise<User | null> {
    const collection = mongoDB.getUsersCollection();
    if (!collection) return null;

    const user = await collection.findOneAndUpdate(
      { 
        verificationToken: token,
        verificationTokenExpiry: { $gt: new Date() }
      },
      { 
        $set: { 
          isVerified: true,
          verificationToken: null,
          verificationTokenExpiry: null
        }
      },
      { returnDocument: 'after' }
    );

    return user || null;
  }

  async getUnverifiedUsers(): Promise<User[]> {
    const collection = mongoDB.getUsersCollection();
    if (!collection) return [];

    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    const users = await collection.find({
      isVerified: false,
      lastActivity: { $lt: twoDaysAgo }
    }).toArray();

    return users;
  }

  // Course management
  async getCourses(): Promise<Course[]> {
    const collection = mongoDB.getCoursesCollection();
    if (!collection) return [];
    
    const courses = await collection.find({}).toArray();
    return courses;
  }

  async getCourse(id: string): Promise<Course | undefined> {
    const collection = mongoDB.getCoursesCollection();
    if (!collection) return undefined;
    
    const course = await collection.findOne({ id });
    return course || undefined;
  }

  // Enrollment management
  async createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment> {
    const collection = mongoDB.getEnrollmentsCollection();
    if (!collection) {
      throw new Error('MongoDB not available');
    }

    const id = randomUUID();
    const newEnrollment: Enrollment = {
      ...enrollment,
      id,
      hasAccess: false,
      enrolledAt: new Date(),
    };

    await collection.insertOne(newEnrollment);
    return newEnrollment;
  }

  async getUserEnrollments(userId: string): Promise<Enrollment[]> {
    const collection = mongoDB.getEnrollmentsCollection();
    if (!collection) return [];
    
    const enrollments = await collection.find({ userId }).toArray();
    return enrollments;
  }

  async getCourseEnrollments(courseId: string): Promise<Enrollment[]> {
    const collection = mongoDB.getEnrollmentsCollection();
    if (!collection) return [];
    
    const enrollments = await collection.find({ courseId }).toArray();
    return enrollments;
  }

  async grantCourseAccess(userId: string, courseId: string): Promise<void> {
    const collection = mongoDB.getEnrollmentsCollection();
    if (!collection) return;

    await collection.updateOne(
      { userId, courseId },
      { $set: { hasAccess: true } }
    );
  }

  async hasAccess(userId: string, courseId: string): Promise<boolean> {
    const collection = mongoDB.getEnrollmentsCollection();
    if (!collection) return false;
    
    const enrollment = await collection.findOne({ userId, courseId, hasAccess: true });
    return enrollment !== null;
  }
}