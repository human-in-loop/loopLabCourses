import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Course } from "@shared/schema";

export default function Courses() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");

    const { data: courses, isLoading } = useQuery<Course[]>({
        queryKey: ["/api/courses"],
        queryFn: async () => {
            const response = await fetch("/api/courses");
            if (!response.ok) throw new Error("Failed to fetch courses");
            return response.json();
        },
    });

    const filteredCourses = courses?.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "all" || course.category === selectedCategory;
        return matchesSearch && matchesCategory;
    }) || [];

    const categories = Array.from(new Set(courses?.map(course => course.category) || []));

    return (
        <div className="min-h-screen pt-20 px-4 bg-loop-dark text-white">
            <div className="max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-5xl font-bold mb-4">
                            <span className="gradient-text">Loop Lab Courses</span>
                        </h1>
                        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                            Master AI, machine learning, and human-AI collaboration through hands-on courses
                        </p>
                    </div>

                    {/* Search and Filter */}
                    <div className="flex flex-col md:flex-row gap-4 mb-8">
                        <Input
                            placeholder="Search courses..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 bg-gray-800 border-gray-600 text-white"
                        />
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger className="w-full md:w-48 bg-gray-800 border-gray-600 text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-600">
                                <SelectItem value="all">All Categories</SelectItem>
                                {categories.map(category => (
                                    <SelectItem key={category} value={category} className="text-white">
                                        {category}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Courses Grid */}
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="bg-gray-700 h-64 rounded-lg"></div>
                                </div>
                            ))}
                        </div>
                    ) : filteredCourses.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="bg-gray-700/50 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                                <i className="fas fa-search text-gray-400 text-2xl"></i>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">No courses found</h3>
                            <p className="text-gray-400">Try adjusting your search or filters</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredCourses.map((course, index) => (
                                <motion.div
                                    key={course.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                >
                                    <Link href={`/courses/${course.id}`}>
                                        <Card className="bg-gray-800/50 border-gray-700 hover:border-loop-purple/50 transition-all duration-300 cursor-pointer h-full">
                                            <CardContent className="p-6">
                                                {course.thumbnail && (
                                                    <img
                                                        src={course.thumbnail}
                                                        alt={course.title}
                                                        className="w-full h-40 object-cover rounded-lg mb-4"
                                                    />
                                                )}
                                                <div className="flex items-center justify-between mb-2">
                                                    <Badge variant="outline" className="text-xs">
                                                        {course.category}
                                                    </Badge>
                                                    {course.isPremium && (
                                                        <Badge className="bg-yellow-500/20 text-yellow-400">
                                                            Premium
                                                        </Badge>
                                                    )}
                                                </div>
                                                <h3 className="text-xl font-semibold text-white mb-2 line-clamp-2">
                                                    {course.title}
                                                </h3>
                                                <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                                                    {course.description}
                                                </p>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-500">{course.duration}</span>
                                                    <span className="text-lg font-bold text-loop-purple">
                                                        {course.isPremium ? `$${course.price}` : "Free"}
                                                    </span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}