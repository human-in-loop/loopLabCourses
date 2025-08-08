import { MongoClient, Db, Collection } from 'mongodb';
import type { User, Course, Enrollment, InsertUser, InsertEnrollment } from '@shared/schema';

class MongoDB {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private isConnected = false;

  async connect(): Promise<void> {
    const mongoUrl = process.env.MONGODB_URL;
    const dbName = process.env.MONGODB_DB_NAME || 'LoopLabCourses';

    if (!mongoUrl) {
      console.warn('MONGODB_URL not configured. MongoDB connection disabled.');
      return;
    }

    try {
      // Add database name to URL if not already present
      const finalUrl = mongoUrl.includes('?') 
        ? `${mongoUrl}&retryWrites=true&w=majority`
        : `${mongoUrl}/${dbName}?retryWrites=true&w=majority`;

      this.client = new MongoClient(finalUrl, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
        family: 4, // Use IPv4, skip trying IPv6
        tls: true,
        tlsAllowInvalidCertificates: true, // For Replit environment
        tlsAllowInvalidHostnames: true,
      });
      await this.client.connect();
      this.db = this.client.db(dbName);
      this.isConnected = true;
      console.log(`Connected to MongoDB database: ${dbName}`);
      
      // Create indexes for better performance
      await this.createIndexes();
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      console.log('Falling back to in-memory storage');
      this.isConnected = false;
    }
  }

  private async createIndexes(): Promise<void> {
    if (!this.db) return;

    try {
      // User indexes
      await this.db.collection('users').createIndex({ email: 1 }, { unique: true });
      await this.db.collection('users').createIndex({ verificationToken: 1 });
      await this.db.collection('users').createIndex({ verificationTokenExpiry: 1 });
      
      // TTL index - automatically delete unverified users after 2 days
      await this.db.collection('users').createIndex(
        { createdAt: 1 }, 
        { 
          expireAfterSeconds: 172800, // 2 days in seconds
          partialFilterExpression: { isVerified: false }
        }
      );

      // Course indexes (using your collection name)
      await this.db.collection('Courses').createIndex({ id: 1 }, { unique: true });

      // Enrollment indexes
      await this.db.collection('enrollments').createIndex({ userId: 1 });
      await this.db.collection('enrollments').createIndex({ courseId: 1 });
      await this.db.collection('enrollments').createIndex({ userId: 1, courseId: 1 }, { unique: true });

      console.log('MongoDB indexes created successfully with TTL for unverified users');
    } catch (error) {
      console.error('Error creating indexes:', error);
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.isConnected = false;
      console.log('Disconnected from MongoDB');
    }
  }

  isReady(): boolean {
    return this.isConnected && this.db !== null;
  }

  getDb(): Db | null {
    return this.db;
  }

  getUsersCollection(): Collection<User> | null {
    return this.db ? this.db.collection<User>('users') : null;
  }

  getCoursesCollection(): Collection<Course> | null {
    return this.db ? this.db.collection<Course>('Courses') : null;
  }

  getEnrollmentsCollection(): Collection<Enrollment> | null {
    return this.db ? this.db.collection<Enrollment>('enrollments') : null;
  }
}

export const mongoDB = new MongoDB();

// Initialize connection when module is imported
mongoDB.connect().catch(console.error);

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoDB.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await mongoDB.disconnect();
  process.exit(0);
});