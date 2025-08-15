import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import type { User, Course, Submission } from "@shared/schema";

interface ReportData {
    enrollmentStats: {
        totalEnrollments: number;
        thisMonth: number;
        lastMonth: number;
        topCourses: Array<{
            courseId: string;
            courseTitle: string;
            enrollmentCount: number;
        }>;
    };
    userActivity: {
        activeUsers: number;
        newUsersThisMonth: number;
        completionRate: number;
        recentActivity: Array<{
            userId: string;
            userName: string;
            action: string;
            timestamp: string;
        }>;
    };
    submissionStats: {
        totalSubmissions: number;
        pendingGrades: number;
        averageGrade: number;
        recentSubmissions: Array<{
            id: string;
            userId: string;
            userName: string;
            courseTitle: string;
            submittedAt: string;
            grade?: number;
        }>;
    };
}

export default function AdminReports() {
    const [selectedTimeframe, setSelectedTimeframe] = useState("30"); // days
    const [activeTab, setActiveTab] = useState("overview");

    // Fetch report data
    const { data: reportData, isLoading } = useQuery<ReportData>({
        queryKey: ["/api/admin/reports", selectedTimeframe],
        queryFn: async () => {
            const response = await fetch(`/api/admin/reports?timeframe=${selectedTimeframe}`, {
                credentials: "include",
            });
            if (!response.ok) {
                throw new Error("Failed to fetch report data");
            }
            return response.json();
        },
    });

    if (isLoading) {
        return (
            <div className="min-h-screen pt-20 px-4 bg-loop-dark text-white">
                <div className="max-w-7xl mx-auto">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-700 rounded w-64 mb-8"></div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-32 bg-gray-700 rounded"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const enrollmentChange = reportData?.enrollmentStats.thisMonth && reportData?.enrollmentStats.lastMonth
        ? ((reportData.enrollmentStats.thisMonth - reportData.enrollmentStats.lastMonth) / reportData.enrollmentStats.lastMonth) * 100
        : 0;

    return (
        <div className="min-h-screen pt-20 px-4 bg-loop-dark text-white">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    {/* Header */}
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-4xl font-bold gradient-text">Analytics & Reports</h1>
                            <p className="text-gray-400 mt-2">Track performance and user engagement</p>
                        </div>
                        <div className="flex space-x-4">
                            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                                <SelectTrigger className="bg-gray-800 border-gray-600 text-white w-[180px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-800 border-gray-600">
                                    <SelectItem value="7" className="text-white">Last 7 days</SelectItem>
                                    <SelectItem value="30" className="text-white">Last 30 days</SelectItem>
                                    <SelectItem value="90" className="text-white">Last 90 days</SelectItem>
                                    <SelectItem value="365" className="text-white">Last year</SelectItem>
                                </SelectContent>
                            </Select>
                            <Link href="/admin/dashboard">
                                <Button variant="outline" className="border-loop-accent text-loop-accent hover:bg-loop-accent hover:text-white">
                                    <i className="fas fa-arrow-left mr-2"></i>
                                    Back to Dashboard
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Overview Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <Card className="bg-gray-800/50 border-gray-700">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-400">Total Enrollments</CardTitle>
                                <i className="fas fa-user-graduate text-loop-purple"></i>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-white">
                                    {reportData?.enrollmentStats.totalEnrollments || 0}
                                </div>
                                <p className="text-xs text-gray-400">
                                    {enrollmentChange > 0 ? "+" : ""}{enrollmentChange.toFixed(1)}% from last month
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-gray-800/50 border-gray-700">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-400">Active Users</CardTitle>
                                <i className="fas fa-users text-loop-accent"></i>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-white">
                                    {reportData?.userActivity.activeUsers || 0}
                                </div>
                                <p className="text-xs text-gray-400">
                                    {reportData?.userActivity.newUsersThisMonth || 0} new this month
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-gray-800/50 border-gray-700">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-400">Completion Rate</CardTitle>
                                <i className="fas fa-chart-line text-green-500"></i>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-white">
                                    {reportData?.userActivity.completionRate?.toFixed(1) || 0}%
                                </div>
                                <p className="text-xs text-gray-400">Course completion rate</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-gray-800/50 border-gray-700">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-400">Pending Grades</CardTitle>
                                <i className="fas fa-clock text-yellow-500"></i>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-white">
                                    {reportData?.submissionStats.pendingGrades || 0}
                                </div>
                                <p className="text-xs text-gray-400">Submissions awaiting review</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Detailed Reports */}
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="bg-gray-800 mb-6">
                            <TabsTrigger value="overview" className="data-[state=active]:bg-loop-purple">Overview</TabsTrigger>
                            <TabsTrigger value="enrollments" className="data-[state=active]:bg-loop-purple">Enrollments</TabsTrigger>
                            <TabsTrigger value="activity" className="data-[state=active]:bg-loop-purple">User Activity</TabsTrigger>
                            <TabsTrigger value="submissions" className="data-[state=active]:bg-loop-purple">Submissions</TabsTrigger>
                        </TabsList>

                        {/* Overview Tab */}
                        <TabsContent value="overview" className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Top Performing Courses */}
                                <Card className="bg-gray-800/50 border-gray-700">
                                    <CardHeader>
                                        <CardTitle className="text-xl text-white">Top Performing Courses</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {reportData?.enrollmentStats.topCourses.slice(0, 5).map((course, index) => (
                                                <div key={course.courseId} className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-8 h-8 bg-loop-purple rounded-full flex items-center justify-center text-white text-sm font-bold">
                                                            {index + 1}
                                                        </div>
                                                        <span className="text-gray-300 truncate">{course.courseTitle}</span>
                                                    </div>
                                                    <Badge variant="outline" className="border-loop-accent text-loop-accent">
                                                        {course.enrollmentCount} enrolled
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Recent Activity Summary */}
                                <Card className="bg-gray-800/50 border-gray-700">
                                    <CardHeader>
                                        <CardTitle className="text-xl text-white">Recent Activity</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {reportData?.userActivity.recentActivity.slice(0, 5).map((activity) => (
                                                <div key={`${activity.userId}-${activity.timestamp}`} className="flex items-center justify-between">
                                                    <div>
                                                        <div className="text-gray-300 font-medium">{activity.userName}</div>
                                                        <div className="text-sm text-gray-400">{activity.action}</div>
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {new Date(activity.timestamp).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Enrollments Tab */}
                        <TabsContent value="enrollments" className="space-y-6">
                            <Card className="bg-gray-800/50 border-gray-700">
                                <CardHeader>
                                    <CardTitle className="text-xl text-white">Course Enrollment Details</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="border-gray-700">
                                                    <TableHead className="text-gray-400">Course</TableHead>
                                                    <TableHead className="text-gray-400">Enrollments</TableHead>
                                                    <TableHead className="text-gray-400">Growth</TableHead>
                                                    <TableHead className="text-gray-400">Status</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {reportData?.enrollmentStats.topCourses.map((course) => (
                                                    <TableRow key={course.courseId} className="border-gray-700">
                                                        <TableCell className="text-white font-medium">{course.courseTitle}</TableCell>
                                                        <TableCell className="text-gray-300">{course.enrollmentCount}</TableCell>
                                                        <TableCell className="text-green-400">+12%</TableCell>
                                                        <TableCell>
                                                            <Badge
                                                                variant="outline"
                                                                className={course.enrollmentCount > 10 ? "border-green-500 text-green-400" : "border-yellow-500 text-yellow-400"}
                                                            >
                                                                {course.enrollmentCount > 10 ? "Popular" : "Growing"}
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* User Activity Tab */}
                        <TabsContent value="activity" className="space-y-6">
                            <Card className="bg-gray-800/50 border-gray-700">
                                <CardHeader>
                                    <CardTitle className="text-xl text-white">User Activity Log</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="border-gray-700">
                                                    <TableHead className="text-gray-400">User</TableHead>
                                                    <TableHead className="text-gray-400">Action</TableHead>
                                                    <TableHead className="text-gray-400">Date</TableHead>
                                                    <TableHead className="text-gray-400">Type</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {reportData?.userActivity.recentActivity.map((activity) => (
                                                    <TableRow key={`${activity.userId}-${activity.timestamp}`} className="border-gray-700">
                                                        <TableCell className="text-white font-medium">{activity.userName}</TableCell>
                                                        <TableCell className="text-gray-300">{activity.action}</TableCell>
                                                        <TableCell className="text-gray-400">
                                                            {new Date(activity.timestamp).toLocaleDateString()}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline" className="border-blue-500 text-blue-400">
                                                                Activity
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Submissions Tab */}
                        <TabsContent value="submissions" className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                <Card className="bg-gray-800/50 border-gray-700">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-gray-400">Total Submissions</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-white">
                                            {reportData?.submissionStats.totalSubmissions || 0}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-gray-800/50 border-gray-700">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-gray-400">Average Grade</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-white">
                                            {reportData?.submissionStats.averageGrade?.toFixed(1) || 0}%
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-gray-800/50 border-gray-700">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-gray-400">Pending Reviews</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-white">
                                            {reportData?.submissionStats.pendingGrades || 0}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card className="bg-gray-800/50 border-gray-700">
                                <CardHeader>
                                    <CardTitle className="text-xl text-white">Recent Submissions</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="border-gray-700">
                                                    <TableHead className="text-gray-400">Student</TableHead>
                                                    <TableHead className="text-gray-400">Course</TableHead>
                                                    <TableHead className="text-gray-400">Submitted</TableHead>
                                                    <TableHead className="text-gray-400">Grade</TableHead>
                                                    <TableHead className="text-gray-400">Status</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {reportData?.submissionStats.recentSubmissions.map((submission) => (
                                                    <TableRow key={submission.id} className="border-gray-700">
                                                        <TableCell className="text-white font-medium">{submission.userName}</TableCell>
                                                        <TableCell className="text-gray-300">{submission.courseTitle}</TableCell>
                                                        <TableCell className="text-gray-400">
                                                            {new Date(submission.submittedAt).toLocaleDateString()}
                                                        </TableCell>
                                                        <TableCell className="text-gray-300">
                                                            {submission.grade ? `${submission.grade}%` : "N/A"}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge
                                                                variant="outline"
                                                                className={submission.grade ? "border-green-500 text-green-400" : "border-yellow-500 text-yellow-400"}
                                                            >
                                                                {submission.grade ? "Graded" : "Pending"}
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </motion.div>
            </div>
        </div>
    );
}