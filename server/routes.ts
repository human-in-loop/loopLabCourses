import type { Express } from "express";
import "@shared/types";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertEnrollmentSchema, paymentInitiationSchema, paymentWebhookSchema, courseCompletionSchema } from "@shared/schema";
import { z } from "zod";
import { generateVerificationToken, sendVerificationEmail, sendWelcomeEmail } from "./email";
import { monerisClient } from "./moneris";

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

      // Generate verification token
      const verificationToken = generateVerificationToken();
      
      // Create user with verification token
      const user = await storage.createUser(userData, verificationToken);
      
      // Add to Google Sheets
      await addToGoogleSheets(user.email, user.name);
      
      // Send verification email
      const emailSent = await sendVerificationEmail(user.email, user.name, verificationToken);
      
      // Store user session
      req.session.userId = user.id;
      
      const message = emailSent 
        ? "Account created! Please check your email to verify your account."
        : "Account created! Email verification is currently unavailable, but your account will be manually verified within 2 days.";
      
      res.json({ 
        user: { id: user.id, email: user.email, name: user.name, isVerified: user.isVerified },
        message 
      });
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

  // Email verification endpoint
  app.get("/api/auth/verify", async (req, res) => {
    try {
      const { token } = req.query;
      
      if (!token || typeof token !== 'string') {
        return res.status(400).send(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Verification Failed</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; text-align: center; background: #f5f5f5; }
              .container { max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
              .error { color: #e74c3c; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1 class="error">Verification Failed</h1>
              <p>Invalid verification link. Please check your email for the correct link.</p>
              <a href="${process.env.BASE_URL || 'http://localhost:5000'}">Return to Loop Lab Course</a>
            </div>
          </body>
          </html>
        `);
      }

      const user = await storage.verifyUserByToken(token);
      
      if (!user) {
        return res.status(400).send(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Verification Failed</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; text-align: center; background: #f5f5f5; }
              .container { max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
              .error { color: #e74c3c; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1 class="error">Verification Failed</h1>
              <p>This verification link has expired or is invalid. Please request a new verification email.</p>
              <a href="${process.env.BASE_URL || 'http://localhost:5000'}">Return to Loop Lab Course</a>
            </div>
          </body>
          </html>
        `);
      }

      // Grant access to enrolled courses
      const enrollments = await storage.getUserEnrollments(user.id);
      for (const enrollment of enrollments) {
        await storage.grantCourseAccess(user.id, enrollment.courseId);
      }

      // Send welcome email
      await sendWelcomeEmail(user.email, user.name);

      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Email Verified!</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; text-align: center; background: #f5f5f5; }
            .container { max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .success { color: #27ae60; }
            .button { display: inline-block; background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="success">🎉 Email Verified Successfully!</h1>
            <p>Welcome to Loop Lab Course, ${user.name}!</p>
            <p>Your email has been verified and you now have access to all your enrolled courses.</p>
            <a href="${process.env.BASE_URL || 'http://localhost:5000'}" class="button">Access Your Courses</a>
          </div>
        </body>
        </html>
      `);
    } catch (error) {
      console.error("Verification error:", error);
      res.status(500).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Verification Error</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; text-align: center; background: #f5f5f5; }
            .container { max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .error { color: #e74c3c; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="error">Verification Error</h1>
            <p>An error occurred during verification. Please try again later.</p>
            <a href="${process.env.BASE_URL || 'http://localhost:5000'}">Return to Loop Lab Course</a>
          </div>
        </body>
        </html>
      `);
    }
  });

  // Resend verification email
  app.post("/api/auth/resend-verification", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.isVerified) {
        return res.status(400).json({ message: "Email already verified" });
      }

      // Generate new verification token
      const verificationToken = generateVerificationToken();
      const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      
      // Update user with new token
      user.verificationToken = verificationToken;
      user.verificationTokenExpiry = tokenExpiry;
      await storage.updateUserActivity(user.id); // This will save the updated user
      
      // Send verification email
      const emailSent = await sendVerificationEmail(user.email, user.name, verificationToken);
      
      if (emailSent) {
        res.json({ message: "Verification email sent! Please check your inbox." });
      } else {
        res.status(500).json({ message: "Failed to send verification email. Email service may be unavailable." });
      }
    } catch (error) {
      console.error("Resend verification error:", error);
      res.status(500).json({ message: "Failed to resend verification email" });
    }
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

      // Get course to check if it's free or paid
      const course = await storage.getCourse(enrollmentData.courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      // For free courses, grant immediate access after email verification
      if (!course.price || course.price === 0) {
        const user = await storage.getUser(req.session.userId);
        if (!user?.isVerified) {
          return res.status(400).json({ message: "Please verify your email before enrolling in courses" });
        }

        const enrollment = await storage.createEnrollment(enrollmentData);
        await storage.grantCourseAccess(req.session.userId, enrollmentData.courseId);
        
        res.json({ 
          ...enrollment, 
          hasAccess: true,
          message: "Successfully enrolled! You now have access to this free course."
        });
      } else {
        // For paid courses, enrollment without access - payment required
        const enrollment = await storage.createEnrollment(enrollmentData);
        res.json({ 
          ...enrollment,
          message: "Enrollment created. Payment required for course access.",
          requiresPayment: true,
          price: course.price
        });
      }
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

  // Payment routes
  app.post("/api/payments/initiate", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { courseId } = paymentInitiationSchema.parse(req.body);
      
      // Get course details
      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      // Check if course is free
      if (!course.price || course.price === 0) {
        return res.status(400).json({ message: "This course is free" });
      }

      // Get user details
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if user already has access
      const hasAccess = await storage.hasAccess(req.session.userId, courseId);
      if (hasAccess) {
        return res.status(400).json({ message: "You already have access to this course" });
      }

      // Generate unique order ID
      const orderId = `course-${courseId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Convert price from cents to dollars
      const amount = (course.price / 100).toFixed(2);

      // Request payment ticket from Moneris
      const paymentResult = await monerisClient.preloadPayment({
        orderId,
        amount,
        description: `${course.title} - Loop Lab Course`,
        customerId: user.id,
        customerEmail: user.email,
      });

      if (!paymentResult.success) {
        return res.status(500).json({ message: paymentResult.error || "Payment initialization failed" });
      }

      res.json({
        ticket: paymentResult.ticket,
        orderId,
        amount: course.price,
        courseTitle: course.title,
      });
    } catch (error) {
      console.error("Payment initiation error:", error);
      res.status(500).json({ message: "Failed to initiate payment" });
    }
  });

  app.post("/api/payments/webhook", async (req, res) => {
    try {
      const signature = req.headers['x-moneris-signature'] as string;
      const payload = JSON.stringify(req.body);

      // Verify webhook signature
      if (!monerisClient.verifyWebhookSignature(payload, signature)) {
        return res.status(401).json({ message: "Invalid signature" });
      }

      const webhookData = paymentWebhookSchema.parse(req.body);

      // Check if payment was successful
      if (webhookData.result === 'APPROVED' && webhookData.response_code === '00') {
        // Extract course ID from order ID
        const orderIdMatch = webhookData.order_id.match(/^course-([^-]+)-/);
        if (!orderIdMatch) {
          console.error("Invalid order ID format:", webhookData.order_id);
          return res.status(400).json({ message: "Invalid order ID" });
        }

        const courseId = orderIdMatch[1];
        
        // Find existing enrollment or create new one
        const existingEnrollments = await storage.getUserEnrollments(''); // We need to find by order ID
        let userId = '';
        
        // In a real implementation, you'd store order -> user mapping
        // For now, we'll extract from the webhook data if available
        const course = await storage.getCourse(courseId);
        if (!course) {
          console.error("Course not found:", courseId);
          return res.status(404).json({ message: "Course not found" });
        }

        // Create or update enrollment with payment information
        const enrollmentData = {
          userId: '', // This should be extracted from your order tracking
          courseId,
          hasAccess: true,
          paymentId: webhookData.transaction_id,
          paidAmount: parseInt(webhookData.amount.replace('.', '')), // Convert to cents
        };

        // Grant immediate access
        await storage.grantCourseAccess(enrollmentData.userId, courseId);

        // Send confirmation email
        // await sendWelcomeEmail(userEmail, userName, course.title);

        console.log(`Payment successful for course ${courseId}, transaction ${webhookData.transaction_id}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error("Webhook processing error:", error);
      res.status(500).json({ message: "Webhook processing failed" });
    }
  });

  // Course completion and access expiration
  app.post("/api/courses/complete", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { enrollmentId } = courseCompletionSchema.parse(req.body);
      
      // Get enrollment details
      const enrollment = await storage.getEnrollment(enrollmentId);
      if (!enrollment || enrollment.userId !== req.session.userId) {
        return res.status(404).json({ message: "Enrollment not found" });
      }

      // Mark as completed and set access expiration (10 days from completion)
      const completedAt = new Date();
      const accessExpiresAt = new Date(completedAt.getTime() + 10 * 24 * 60 * 60 * 1000); // 10 days

      await storage.completeCourse(enrollmentId, completedAt, accessExpiresAt);

      res.json({ 
        message: "Course completed successfully",
        completedAt,
        accessExpiresAt,
      });
    } catch (error) {
      console.error("Course completion error:", error);
      res.status(500).json({ message: "Failed to complete course" });
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
