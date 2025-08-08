import { MongoClient, Db, Collection } from 'mongodb';
import type { User, Course, Enrollment, InsertUser, InsertEnrollment } from '@shared/schema';

class MongoDB {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private isConnected = false;

  async connect(): Promise<void> {
    const mongoUrl = process.env.MONGODB_URL;
    const dbName = process.env.MONGODB_DB_NAME || 'loop-lab-course';

    if (!mongoUrl) {
      console.warn('MONGODB_URL not configured. MongoDB connection disabled.');
      return;
    }

    try {
      this.client = new MongoClient(mongoUrl, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
        family: 4, // Use IPv4, skip trying IPv6
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

      // Enrollment indexes
      await this.db.collection('enrollments').createIndex({ userId: 1 });
      await this.db.collection('enrollments').createIndex({ courseId: 1 });
      await this.db.collection('enrollments').createIndex({ userId: 1, courseId: 1 }, { unique: true });

      console.log('MongoDB indexes created successfully');
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
    return this.db ? this.db.collection<Course>('courses') : null;
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