import type { Express } from "express";
import "@shared/types";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertEnrollmentSchema } from "@shared/schema";
import { z } from "zod";

// Google Sheets integration (placeholder - user will need to configure)
const addToGoogleSheets = async (email: string, name: string) => {
  // TODO: Implement Google Sheets API integration
  // This would use googleapis to append user data to a spreadsheet
  console.log(`Adding to Google Sheets: ${email}, ${name}`);
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Create user
      const user = await storage.createUser(userData);
      
      // Add to Google Sheets
      await addToGoogleSheets(user.email, user.name);
      
      // Store user session
      req.session.userId = user.id;
      
      res.json({ user: { id: user.id, email: user.email, name: user.name, isVerified: user.isVerified } });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(400).json({ message: "Invalid signup data" });
    }
  });

  app.post("/api/auth/signin", async (req, res) => {
    try {
      const { email } = req.body;
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Update user activity
      await storage.updateUserActivity(user.id);
      
      // Store user session
      req.session.userId = user.id;
      
      res.json({ user: { id: user.id, email: user.email, name: user.name, isVerified: user.isVerified } });
    } catch (error) {
      console.error("Signin error:", error);
      res.status(500).json({ message: "Signin failed" });
    }
  });

  app.post("/api/auth/signout", (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Signed out successfully" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user: { id: user.id, email: user.email, name: user.name, isVerified: user.isVerified } });
  });

  // Course routes
  app.get("/api/courses", async (req, res) => {
    try {
      const courses = await storage.getCourses();
      res.json(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  app.get("/api/courses/:id", async (req, res) => {
    try {
      const course = await storage.getCourse(req.params.id);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.json(course);
    } catch (error) {
      console.error("Error fetching course:", error);
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });

  // Enrollment routes
  app.post("/api/enrollments", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const enrollmentData = insertEnrollmentSchema.parse({
        userId: req.session.userId,
        courseId: req.body.courseId
      });

      const enrollment = await storage.createEnrollment(enrollmentData);
      res.json(enrollment);
    } catch (error) {
      console.error("Enrollment error:", error);
      res.status(400).json({ message: "Failed to create enrollment" });
    }
  });

  app.get("/api/enrollments/my", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const enrollments = await storage.getUserEnrollments(req.session.userId);
      res.json(enrollments);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      res.status(500).json({ message: "Failed to fetch enrollments" });
    }
  });

  app.get("/api/courses/:courseId/access", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user?.isVerified) {
        return res.json({ hasAccess: false, reason: "Email not verified" });
      }

      const hasAccess = await storage.hasAccess(req.session.userId, req.params.courseId);
      res.json({ hasAccess });
    } catch (error) {
      console.error("Error checking access:", error);
      res.status(500).json({ message: "Failed to check access" });
    }
  });

  // Admin route for verification (would be triggered by cron job)
  app.post("/api/admin/verify-inactive-users", async (req, res) => {
    try {
      const unverifiedUsers = await storage.getUnverifiedUsers();
      
      for (const user of unverifiedUsers) {
        await storage.verifyUser(user.id);
        
        // Grant access to enrolled courses
        const enrollments = await storage.getUserEnrollments(user.id);
        for (const enrollment of enrollments) {
          await storage.grantCourseAccess(user.id, enrollment.courseId);
        }
      }

      res.json({ verifiedCount: unverifiedUsers.length });
    } catch (error) {
      console.error("Error verifying users:", error);
      res.status(500).json({ message: "Failed to verify users" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
