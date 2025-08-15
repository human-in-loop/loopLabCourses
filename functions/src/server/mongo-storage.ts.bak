import { Collection, Db, ObjectId } from "mongodb";
import { 
  User, InsertUser,
  Course, InsertCourse,
  Enrollment, InsertEnrollment,
  LessonProgress, InsertLessonProgress,
  Submission, InsertSubmission, GradeSubmission,
  Module, Lesson
} from "@shared/schema";
import { randomUUID } from "crypto";
import type { IStorage, PaginatedResult, CourseStructure } from "./storage";

// Correctly typed helper to convert MongoDB document to our application types
function fromMongo<T extends { _id?: ObjectId }> (doc: T | null): Omit<T, '_id'> | null {
    if (!doc) return null;
    const { _id, ...rest } = doc;
    return rest as Omit<T, '_id'>;
}

export class MongoStorage implements IStorage {
    private db: Db;
    private users: Collection<User>;
    private courses: Collection<Course>;
    private enrollments: Collection<Enrollment>;
    private submissions: Collection<Submission>;
    private lessonProgress: Collection<LessonProgress>;

    constructor(db: Db) {
        this.db = db;
        this.users = this.db.collection<User>("users");
        this.courses = this.db.collection<Course>("courses");
        this.enrollments = this.db.collection<Enrollment>("enrollments");
        this.submissions = this.db.collection<Submission>("submissions");
        this.lessonProgress = this.db.collection<LessonProgress>("lessonProgress");
    }

    // USER MANAGEMENT
    async getUser(id: string): Promise<User | null> {
        return this.users.findOne({ id });
    }

    async getUserByEmail(email: string): Promise<User | null> {
        return this.users.findOne({ email });
    }

    async createUser(insertUser: InsertUser, verificationToken?: string): Promise<User> {
        const user: User = {
            ...insertUser,
            id: randomUUID(),
            isVerified: false,
            isAdmin: false,
            verificationToken: verificationToken || null,
            verificationTokenExpiry: verificationToken ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null,
            lastActivity: new Date(),
            createdAt: new Date(),
        };
        await this.users.insertOne(user as any);
        return user;
    }

    async updateUserActivity(id: string): Promise<void> {
        await this.users.updateOne({ id }, { $set: { lastActivity: new Date() } });
    }

    async verifyUser(id: string): Promise<User | null> {
        const result = await this.users.findOneAndUpdate(
            { id },
            { $set: { isVerified: true, verificationToken: null, verificationTokenExpiry: null } },
            { returnDocument: 'after' }
        );
        return result;
    }

    async verifyUserByToken(token: string): Promise<User | null> {
        const result = await this.users.findOneAndUpdate(
            { verificationToken: token, verificationTokenExpiry: { $gt: new Date() } },
            { $set: { isVerified: true, verificationToken: null, verificationTokenExpiry: null } },
            { returnDocument: 'after' }
        );
        return result;
    }

    async updateUserVerificationToken(userId: string, token: string, expiry: Date): Promise<void> {
        await this.users.updateOne({ id: userId }, { $set: { verificationToken: token, verificationTokenExpiry: expiry } });
    }

    async getUnverifiedUsers(): Promise<User[]> {
        return this.users.find({ isVerified: false, createdAt: { $lt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) } }).toArray();
    }

    async getPaginatedUsers(page: number, limit: number, search: string): Promise<PaginatedResult<User>> {
        const query = search ? { $or: [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] } : {};
        const total = await this.users.countDocuments(query);
        const items = await this.users.find(query).skip((page - 1) * limit).limit(limit).toArray();
        return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    // COURSE MANAGEMENT
    async getCourses(): Promise<Course[]> {
        return this.courses.find({}).toArray();
    }

    async getCourse(id: string): Promise<Course | null> {
        return this.courses.findOne({ id });
    }

    async createCourse(courseData: InsertCourse): Promise<Course> {
        const course: Course = {
            ...courseData,
            id: randomUUID(),
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        await this.courses.insertOne(course as any);
        return course;
    }

    async updateCourse(id: string, updates: Partial<Course>): Promise<Course | null> {
        return this.courses.findOneAndUpdate({ id }, { $set: { ...updates, updatedAt: new Date() } }, { returnDocument: 'after' });
    }

    async deleteCourse(id: string): Promise<boolean> {
        const result = await this.courses.deleteOne({ id });
        return result.deletedCount > 0;
    }

    // COURSE STRUCTURE
    async getCourseStructure(courseId: string): Promise<CourseStructure | null> {
        // This is a simplified implementation. A real implementation might use aggregation.
        const course = await this.getCourse(courseId);
        if (!course) return null;
        // Assuming modules and lessons are stored within the course document for this example
        const modules = (course as any).modules || []; 
        return { course, modules };
    }

    async createModule(courseId: string, moduleData: Partial<Module>): Promise<Module> {
        const module: Module = { ...moduleData, id: randomUUID(), courseId, lessons: [] } as Module;
        await this.courses.updateOne({ id: courseId }, { $push: { modules: module as any } });
        return module;
    }

    async updateModule(id: string, updates: Partial<Module>): Promise<Module | null> {
        const updateFields: { [key: string]: any } = {};
        for (const key in updates) {
            if (updates.hasOwnProperty(key)) {
                updateFields[`modules.$.${key}`] = (updates as any)[key];
            }
        }

        const result = await this.courses.updateOne(
            { "modules.id": id },
            { $set: updateFields }
        );

        if (result.modifiedCount === 0) {
            return null; // No module found or updated
        }

        // Fetch the updated module using the new getModule method
        return this.getModule(id);
    }

    async deleteModule(id: string): Promise<boolean> {
        const result = await this.courses.updateOne({ "modules.id": id }, { $pull: { modules: { id } } as any });
        return result.modifiedCount > 0;
    }

    async createLesson(moduleId: string, lessonData: Partial<Lesson>): Promise<Lesson> {
        const lesson: Lesson = { ...lessonData, id: randomUUID(), moduleId } as Lesson;
        await this.courses.updateOne({ "modules.id": moduleId }, { $push: { "modules.$.lessons": lesson as any } });
        return lesson;
    }

    async updateLesson(id: string, updates: Partial<Lesson>): Promise<Lesson | null> {
        const setFields: { [key: string]: any } = {};
        for (const key in updates) {
            if (updates.hasOwnProperty(key)) {
                setFields[`modules.$[].lessons.$[lesson].${key}`] = (updates as any)[key];
            }
        }

        const result = await this.courses.findOneAndUpdate(
            { "modules.lessons.id": id },
            { $set: setFields },
            {
                arrayFilters: [{ "lesson.id": id }],
                returnDocument: 'after'
            }
        );

        if (!result) {
            return null;
        }

        // Find the updated lesson from the returned course document
        for (const module of result.modules || []) {
            const updatedLesson = module.lessons?.find(l => l.id === id);
            if (updatedLesson) {
                return updatedLesson;
            }
        }
        return null;
    }

    async deleteLesson(id: string): Promise<boolean> {
        const result = await this.courses.updateOne(
            { "modules.lessons.id": id }, // Find the course that contains the lesson
            { $pull: { "modules.$.lessons": { id: id } } } // Pull the lesson from the lessons array
        );
        return result.modifiedCount > 0;
    }

    // ENROLLMENT
    async createEnrollment(enrollmentData: InsertEnrollment): Promise<Enrollment> {
        const enrollment: Enrollment = { ...enrollmentData, id: randomUUID(), enrolledAt: new Date(), hasAccess: false };
        await this.enrollments.insertOne(enrollment as any);
        return enrollment;
    }

    async getEnrollment(id: string): Promise<Enrollment | null> {
        return this.enrollments.findOne({ id });
    }

    async getUserEnrollments(userId: string): Promise<Enrollment[]> {
        return this.enrollments.find({ userId }).toArray();
    }

    async grantCourseAccess(userId: string, courseId: string): Promise<void> {
        await this.enrollments.updateOne({ userId, courseId }, { $set: { hasAccess: true } });
    }

    async revokeCourseAccess(userId: string, courseId: string): Promise<void> {
        await this.enrollments.updateOne({ userId, courseId }, { $set: { hasAccess: false } });
    }

    async hasAccess(userId: string, courseId: string): Promise<boolean> {
        const enrollment = await this.enrollments.findOne({ userId, courseId, hasAccess: true });
        return !!enrollment;
    }

    async completeCourse(enrollmentId: string, completedAt: Date, accessExpiresAt: Date): Promise<void> {
        await this.enrollments.updateOne({ id: enrollmentId }, { $set: { completedAt, accessExpiresAt } });
    }

    // LESSON PROGRESS
    async recordLessonProgress(progressData: InsertLessonProgress): Promise<LessonProgress> {
        const progress: LessonProgress = { ...progressData, id: randomUUID(), completedAt: new Date() };
        await this.lessonProgress.insertOne(progress as any);
        return progress;
    }

    async getUserLessonProgress(userId: string, courseId: string): Promise<LessonProgress[]> {
        return this.lessonProgress.find({ userId, courseId }).toArray();
    }

    // SUBMISSIONS
    async createSubmission(submissionData: InsertSubmission): Promise<Submission> {
        const submission: Submission = { ...submissionData, id: randomUUID(), submittedAt: new Date() };
        await this.submissions.insertOne(submission as any);
        return submission;
    }

    async getSubmission(id: string): Promise<Submission | null> {
        return this.submissions.findOne({ id });
    }

    async getUserSubmissions(userId: string, courseId: string): Promise<Submission[]> {
        return this.submissions.find({ userId, course_id: courseId }).toArray();
    }

    async getAllSubmissions(): Promise<Submission[]> {
        return this.submissions.find({}).toArray();
    }

    async gradeSubmission(id: string, grade: GradeSubmission, gradedBy: string): Promise<Submission | null> {
        return this.submissions.findOneAndUpdate(
            { id }, 
            { $set: { ...grade, gradedAt: new Date(), gradedBy } }, 
            { returnDocument: 'after' }
        );
    }

    async getModule(id: string): Promise<Module | null> {
        const result = await this.courses.aggregate([
            { $unwind: "$modules" },
            { $match: { "modules.id": id } },
            { $replaceRoot: { newRoot: "$modules" } }
        ]).next();

        return result as Module | null;
    }

    async getCourseModules(courseId: string): Promise<Module[]> {
        const course = await this.getCourse(courseId);
        return (course?.modules as Module[]) || [];
    }
}