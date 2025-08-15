import { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import type { Course, Module, Lesson } from "@shared/schema";

export default function AdminCourseEdit() {
    const { id } = useParams();
    const [, setLocation] = useLocation();
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const isEdit = Boolean(id);
    const [activeTab, setActiveTab] = useState("details");
    const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
    const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
    const [currentModule, setCurrentModule] = useState<Module | null>(null);
    const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);

    // Course form data
    const [courseData, setCourseData] = useState({
        title: "",
        description: "",
        price: 0,
        category: "",
        difficulty: "beginner" as "beginner" | "intermediate" | "advanced",
        isPublished: false,
        imageUrl: "",
        tags: "",
        instructor: "", // Add missing fields from schema
        units: "",
        schedule: "",
        duration: ""
    });

    // Module form data
    const [moduleData, setModuleData] = useState({
        title: "",
        description: "",
        order: 1
    });

    // Lesson form data
    const [lessonData, setLessonData] = useState({
        title: "",
        description: "",
        content: "",
        videoUrl: "",
        type: "video" as Lesson['type'],
        order: 1,
        duration: "0",
        isRequired: false,
        moduleId: "" // Add this missing property
    });

    // Fetch course data
    const { data: course, isLoading: courseLoading } = useQuery<Course>({
        queryKey: ["/api/admin/courses", id],
        queryFn: async () => {
            if (!id) return null;
            const response = await fetch(`/api/admin/courses/${id}`, {
                credentials: "include",
            });
            if (!response.ok) throw new Error("Failed to fetch course");
            return response.json();
        },
        enabled: isEdit,
    });

    // Fetch modules for this course
    const { data: modules = [], isLoading: modulesLoading } = useQuery<Module[]>({
        queryKey: ["/api/admin/modules", id],
        queryFn: async () => {
            if (!id) return [];
            const response = await fetch(`/api/admin/modules?courseId=${id}`, {
                credentials: "include",
            });
            if (!response.ok) throw new Error("Failed to fetch modules");
            return response.json();
        },
        enabled: isEdit,
    });

    // Fetch lessons for this course
    const { data: lessons = [], isLoading: lessonsLoading } = useQuery<Lesson[]>({
        queryKey: ["/api/admin/lessons", id],
        queryFn: async () => {
            if (!id) return [];
            const response = await fetch(`/api/admin/lessons?courseId=${id}`, {
                credentials: "include",
            });
            if (!response.ok) throw new Error("Failed to fetch lessons");
            return response.json();
        },
        enabled: isEdit,
    });

    // Set form data when course loads
    useEffect(() => {
        if (course) {
            setCourseData({
                title: course.title,
                description: course.description || "",
                price: course.price || 0,
                category: course.category,
                difficulty: course.level?.toLowerCase() as "beginner" | "intermediate" | "advanced" || "beginner",
                isPublished: course.isPremium || false,
                imageUrl: course.thumbnail || "", // Use 'thumbnail' instead of 'imageUrl'
                tags: "", // Set to empty since tags might not exist in schema
                instructor: course.instructor || "",
                units: course.units || "",
                schedule: course.schedule || "",
                duration: course.duration || ""
            });
        }
    }, [course]);

    // Course mutations
    const saveCourse = useMutation({
        mutationFn: async (data: typeof courseData) => {
            const url = isEdit ? `/api/admin/courses/${id}` : "/api/admin/courses";
            const method = isEdit ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    title: data.title,
                    description: data.description,
                    price: data.price,
                    category: data.category,
                    level: data.difficulty.charAt(0).toUpperCase() + data.difficulty.slice(1),
                    isPremium: data.isPublished,
                    instructor: data.instructor,
                    units: data.units,
                    schedule: data.schedule,
                    duration: data.duration,
                    // Send as 'thumbnail' to match your schema
                    ...(data.imageUrl && { thumbnail: data.imageUrl }),
                    // Only include tags if they exist
                    ...(data.tags && data.tags.trim() && {
                        tags: data.tags.split(",").map(tag => tag.trim()).filter(Boolean)
                    })
                }),
            });

            if (!response.ok) throw new Error(`Failed to ${isEdit ? "update" : "create"} course`);
            return response.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/courses"] });
            toast({
                title: isEdit ? "Course Updated" : "Course Created",
                description: `Course has been ${isEdit ? "updated" : "created"} successfully.`,
            });
            if (!isEdit) {
                setLocation(`/admin/courses/edit/${data.id}`);
            }
        },
    });

    // Module mutations
    const saveModule = useMutation({
        mutationFn: async (data: typeof moduleData) => {
            const url = currentModule ? `/api/admin/modules/${currentModule.id}` : "/api/admin/modules";
            const method = currentModule ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ ...data, courseId: id }),
            });

            if (!response.ok) throw new Error(`Failed to ${currentModule ? "update" : "create"} module`);
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/modules", id] });
            setIsModuleModalOpen(false);
            setCurrentModule(null);
            setModuleData({ title: "", description: "", order: 1 });
            toast({ title: "Module saved successfully" });
        },
    });

    // Lesson mutations
    const saveLesson = useMutation({
        mutationFn: async (data: typeof lessonData) => {
            const url = currentLesson ? `/api/admin/lessons/${currentLesson.id}` : "/api/admin/lessons";
            const method = currentLesson ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    ...data,
                    moduleId: data.moduleId || modules[0]?.id,
                    duration: data.duration.toString()
                }),
            });

            if (!response.ok) throw new Error(`Failed to ${currentLesson ? "update" : "create"} lesson`);
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/lessons", id] });
            setIsLessonModalOpen(false);
            setCurrentLesson(null);
            setLessonData({
                title: "", description: "", content: "", videoUrl: "",
                type: "video", order: 1, duration: "0", isRequired: false, moduleId: ""
            });
            toast({ title: "Lesson saved successfully" });
        },
    });

    const handleCourseSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        saveCourse.mutate(courseData);
    };

    const handleModuleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        saveModule.mutate(moduleData);
    };

    const handleLessonSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        saveLesson.mutate(lessonData);
    };

    if (isEdit && courseLoading) {
        return (
            <div className="min-h-screen pt-20 px-4 bg-loop-dark text-white">
                <div className="max-w-6xl mx-auto">
                    <div className="animate-pulse space-y-6">
                        <div className="h-8 bg-gray-700 rounded w-64"></div>
                        <div className="h-96 bg-gray-700 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-20 px-4 bg-loop-dark text-white">
            <div className="max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    {/* Header */}
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-4xl font-bold gradient-text">
                                {isEdit ? `Edit: ${course?.title}` : "Create New Course"}
                            </h1>
                            <p className="text-gray-400 mt-2">
                                {isEdit ? "Manage all aspects of your course" : "Create a comprehensive course"}
                            </p>
                        </div>
                        <Link href="/admin/courses">
                            <Button variant="outline" className="border-loop-accent text-loop-accent hover:bg-loop-accent hover:text-white">
                                <i className="fas fa-arrow-left mr-2"></i>
                                Back to Courses
                            </Button>
                        </Link>
                    </div>

                    {/* Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="bg-gray-800 mb-6">
                            <TabsTrigger value="details" className="data-[state=active]:bg-loop-purple">
                                Course Details
                            </TabsTrigger>
                            {isEdit && (
                                <>
                                    <TabsTrigger value="modules" className="data-[state=active]:bg-loop-purple">
                                        Modules ({modules.length})
                                    </TabsTrigger>
                                    <TabsTrigger value="lessons" className="data-[state=active]:bg-loop-purple">
                                        Lessons ({lessons.length})
                                    </TabsTrigger>
                                </>
                            )}
                        </TabsList>

                        {/* Course Details Tab */}
                        <TabsContent value="details">
                            <Card className="bg-gray-800/50 border-gray-700">
                                <CardHeader>
                                    <CardTitle className="text-xl text-white">Course Information</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleCourseSubmit} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="md:col-span-2">
                                                <Label htmlFor="title" className="text-gray-300">Course Title</Label>
                                                <Input
                                                    id="title"
                                                    value={courseData.title}
                                                    onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
                                                    className="bg-gray-700 border-gray-600 text-white"
                                                    required
                                                />
                                            </div>

                                            <div className="md:col-span-2">
                                                <Label htmlFor="description" className="text-gray-300">Description</Label>
                                                <Textarea
                                                    id="description"
                                                    value={courseData.description}
                                                    onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
                                                    className="bg-gray-700 border-gray-600 text-white"
                                                    rows={4}
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="price" className="text-gray-300">Price ($)</Label>
                                                <Input
                                                    id="price"
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={courseData.price}
                                                    onChange={(e) => setCourseData({ ...courseData, price: parseFloat(e.target.value) || 0 })}
                                                    className="bg-gray-700 border-gray-600 text-white"
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="category" className="text-gray-300">Category</Label>
                                                <Input
                                                    id="category"
                                                    value={courseData.category}
                                                    onChange={(e) => setCourseData({ ...courseData, category: e.target.value })}
                                                    className="bg-gray-700 border-gray-600 text-white"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="difficulty" className="text-gray-300">Difficulty</Label>
                                                <Select
                                                    value={courseData.difficulty}
                                                    onValueChange={(value: "beginner" | "intermediate" | "advanced") =>
                                                        setCourseData({ ...courseData, difficulty: value })
                                                    }
                                                >
                                                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-gray-800 border-gray-600">
                                                        <SelectItem value="beginner" className="text-white">Beginner</SelectItem>
                                                        <SelectItem value="intermediate" className="text-white">Intermediate</SelectItem>
                                                        <SelectItem value="advanced" className="text-white">Advanced</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div>
                                                <Label htmlFor="imageUrl" className="text-gray-300">Image URL</Label>
                                                <Input
                                                    id="imageUrl"
                                                    type="url"
                                                    value={courseData.imageUrl}
                                                    onChange={(e) => setCourseData({ ...courseData, imageUrl: e.target.value })}
                                                    className="bg-gray-700 border-gray-600 text-white"
                                                />
                                            </div>

                                            <div className="md:col-span-2">
                                                <Label htmlFor="tags" className="text-gray-300">Tags</Label>
                                                <Input
                                                    id="tags"
                                                    value={courseData.tags}
                                                    onChange={(e) => setCourseData({ ...courseData, tags: e.target.value })}
                                                    className="bg-gray-700 border-gray-600 text-white"
                                                    placeholder="javascript, react, frontend"
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="instructor" className="text-gray-300">Instructor</Label>
                                                <Input
                                                    id="instructor"
                                                    value={courseData.instructor}
                                                    onChange={(e) => setCourseData({ ...courseData, instructor: e.target.value })}
                                                    className="bg-gray-700 border-gray-600 text-white"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="units" className="text-gray-300">Units</Label>
                                                <Input
                                                    id="units"
                                                    value={courseData.units}
                                                    onChange={(e) => setCourseData({ ...courseData, units: e.target.value })}
                                                    className="bg-gray-700 border-gray-600 text-white"
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="schedule" className="text-gray-300">Schedule</Label>
                                                <Input
                                                    id="schedule"
                                                    value={courseData.schedule}
                                                    onChange={(e) => setCourseData({ ...courseData, schedule: e.target.value })}
                                                    className="bg-gray-700 border-gray-600 text-white"
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="duration" className="text-gray-300">Duration</Label>
                                                <Input
                                                    id="duration"
                                                    value={courseData.duration}
                                                    onChange={(e) => setCourseData({ ...courseData, duration: e.target.value })}
                                                    className="bg-gray-700 border-gray-600 text-white"
                                                    placeholder="e.g., 4 weeks"
                                                />
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    id="isPublished"
                                                    checked={courseData.isPublished}
                                                    onChange={(e) => setCourseData({ ...courseData, isPublished: e.target.checked })}
                                                    className="rounded"
                                                />
                                                <Label htmlFor="isPublished" className="text-gray-300">
                                                    Make this a premium course
                                                </Label>
                                            </div>
                                        </div>

                                        <div className="flex justify-end">
                                            <Button
                                                type="submit"
                                                disabled={saveCourse.isPending}
                                                className="bg-loop-purple hover:bg-loop-purple/80"
                                            >
                                                {saveCourse.isPending ? "Saving..." : isEdit ? "Update Course" : "Create Course"}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Modules Tab */}
                        {isEdit && (
                            <TabsContent value="modules">
                                <Card className="bg-gray-800/50 border-gray-700">
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <CardTitle className="text-xl text-white">Course Modules</CardTitle>
                                        <Dialog open={isModuleModalOpen} onOpenChange={setIsModuleModalOpen}>
                                            <DialogTrigger asChild>
                                                <Button className="bg-loop-purple hover:bg-loop-purple/80">
                                                    <i className="fas fa-plus mr-2"></i>Add Module
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="bg-gray-900 border-gray-700 text-white">
                                                <DialogHeader>
                                                    <DialogTitle>{currentModule ? "Edit Module" : "Create Module"}</DialogTitle>
                                                </DialogHeader>
                                                <form onSubmit={handleModuleSubmit} className="space-y-4">
                                                    <div>
                                                        <Label htmlFor="moduleTitle" className="text-gray-300">Module Title</Label>
                                                        <Input
                                                            id="moduleTitle"
                                                            value={moduleData.title}
                                                            onChange={(e) => setModuleData({ ...moduleData, title: e.target.value })}
                                                            className="bg-gray-800 border-gray-600 text-white"
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="moduleDescription" className="text-gray-300">Description</Label>
                                                        <Textarea
                                                            id="moduleDescription"
                                                            value={moduleData.description}
                                                            onChange={(e) => setModuleData({ ...moduleData, description: e.target.value })}
                                                            className="bg-gray-800 border-gray-600 text-white"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="moduleOrder" className="text-gray-300">Order</Label>
                                                        <Input
                                                            id="moduleOrder"
                                                            type="number"
                                                            value={moduleData.order}
                                                            onChange={(e) => setModuleData({ ...moduleData, order: parseInt(e.target.value) || 1 })}
                                                            className="bg-gray-800 border-gray-600 text-white"
                                                        />
                                                    </div>
                                                    <div className="flex justify-end space-x-2">
                                                        <Button type="button" variant="outline" onClick={() => setIsModuleModalOpen(false)}>
                                                            Cancel
                                                        </Button>
                                                        <Button type="submit" disabled={saveModule.isPending}>
                                                            {saveModule.isPending ? "Saving..." : "Save Module"}
                                                        </Button>
                                                    </div>
                                                </form>
                                            </DialogContent>
                                        </Dialog>
                                    </CardHeader>
                                    <CardContent>
                                        {modulesLoading ? (
                                            <div className="text-center py-8">Loading modules...</div>
                                        ) : modules.length === 0 ? (
                                            <div className="text-center py-8 text-gray-400">
                                                No modules yet. Create your first module to get started.
                                            </div>
                                        ) : (
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Order</TableHead>
                                                        <TableHead>Title</TableHead>
                                                        <TableHead>Description</TableHead>
                                                        <TableHead>Actions</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {modules.map((module) => (
                                                        <TableRow key={module.id}>
                                                            <TableCell>{module.order}</TableCell>
                                                            <TableCell className="font-medium">{module.title}</TableCell>
                                                            <TableCell className="text-gray-400">
                                                                {module.description || "No description"}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => {
                                                                        setCurrentModule(module);
                                                                        setModuleData({
                                                                            title: module.title,
                                                                            description: module.description || "",
                                                                            order: module.order
                                                                        });
                                                                        setIsModuleModalOpen(true);
                                                                    }}
                                                                >
                                                                    Edit
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        )}

                        {/* Lessons Tab */}
                        {isEdit && (
                            <TabsContent value="lessons">
                                <Card className="bg-gray-800/50 border-gray-700">
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <CardTitle className="text-xl text-white">Course Lessons</CardTitle>
                                        <Dialog open={isLessonModalOpen} onOpenChange={setIsLessonModalOpen}>
                                            <DialogTrigger asChild>
                                                <Button
                                                    className="bg-loop-purple hover:bg-loop-purple/80"
                                                    disabled={modules.length === 0}
                                                >
                                                    <i className="fas fa-plus mr-2"></i>Add Lesson
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl">
                                                <DialogHeader>
                                                    <DialogTitle>{currentLesson ? "Edit Lesson" : "Create Lesson"}</DialogTitle>
                                                </DialogHeader>
                                                <form onSubmit={handleLessonSubmit} className="space-y-4">
                                                    <div>
                                                        <Label htmlFor="lessonTitle" className="text-gray-300">Lesson Title</Label>
                                                        <Input
                                                            id="lessonTitle"
                                                            value={lessonData.title}
                                                            onChange={(e) => setLessonData({ ...lessonData, title: e.target.value })}
                                                            className="bg-gray-800 border-gray-600 text-white"
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="lessonType" className="text-gray-300">Type</Label>
                                                        <Select
                                                            value={lessonData.type}
                                                            onValueChange={(value: Lesson['type']) => setLessonData({ ...lessonData, type: value })}
                                                        >
                                                            <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent className="bg-gray-800 border-gray-600">
                                                                <SelectItem value="video" className="text-white">Video</SelectItem>
                                                                <SelectItem value="text" className="text-white">Text</SelectItem>
                                                                <SelectItem value="quiz" className="text-white">Quiz</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="moduleId" className="text-gray-300">Module</Label>
                                                        <Select
                                                            value={lessonData.moduleId}
                                                            onValueChange={(value) => setLessonData({ ...lessonData, moduleId: value })}
                                                        >
                                                            <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                                                                <SelectValue placeholder="Select a module" />
                                                            </SelectTrigger>
                                                            <SelectContent className="bg-gray-800 border-gray-600">
                                                                {modules.map((module) => (
                                                                    <SelectItem key={module.id} value={module.id} className="text-white">
                                                                        {module.title}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    {lessonData.type === "video" && (
                                                        <div>
                                                            <Label htmlFor="videoUrl" className="text-gray-300">Video URL</Label>
                                                            <Input
                                                                id="videoUrl"
                                                                value={lessonData.videoUrl}
                                                                onChange={(e) => setLessonData({ ...lessonData, videoUrl: e.target.value })}
                                                                className="bg-gray-800 border-gray-600 text-white"
                                                            />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <Label htmlFor="lessonContent" className="text-gray-300">Content</Label>
                                                        <Textarea
                                                            id="lessonContent"
                                                            value={lessonData.content}
                                                            onChange={(e) => setLessonData({ ...lessonData, content: e.target.value })}
                                                            className="bg-gray-800 border-gray-600 text-white"
                                                            rows={3}
                                                        />
                                                    </div>
                                                    <div className="flex justify-end space-x-2">
                                                        <Button type="button" variant="outline" onClick={() => setIsLessonModalOpen(false)}>
                                                            Cancel
                                                        </Button>
                                                        <Button type="submit" disabled={saveLesson.isPending}>
                                                            {saveLesson.isPending ? "Saving..." : "Save Lesson"}
                                                        </Button>
                                                    </div>
                                                </form>
                                            </DialogContent>
                                        </Dialog>
                                    </CardHeader>
                                    <CardContent>
                                        {modules.length === 0 ? (
                                            <div className="text-center py-8 text-gray-400">
                                                Create modules first before adding lessons.
                                            </div>
                                        ) : lessonsLoading ? (
                                            <div className="text-center py-8">Loading lessons...</div>
                                        ) : lessons.length === 0 ? (
                                            <div className="text-center py-8 text-gray-400">
                                                No lessons yet. Create your first lesson to get started.
                                            </div>
                                        ) : (
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Order</TableHead>
                                                        <TableHead>Title</TableHead>
                                                        <TableHead>Type</TableHead>
                                                        <TableHead>Duration</TableHead>
                                                        <TableHead>Actions</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {lessons.map((lesson) => (
                                                        <TableRow key={lesson.id}>
                                                            <TableCell>{lesson.order}</TableCell>
                                                            <TableCell className="font-medium">{lesson.title}</TableCell>
                                                            <TableCell>
                                                                <Badge variant="outline" className="capitalize">
                                                                    {lesson.type}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>{lesson.duration || "0"} min</TableCell>
                                                            <TableCell>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => {
                                                                        setCurrentLesson(lesson);
                                                                        setLessonData({
                                                                            title: lesson.title,
                                                                            description: "", // Remove lesson.description since it doesn't exist in schema
                                                                            content: lesson.content || "",
                                                                            videoUrl: lesson.videoUrl || "",
                                                                            type: lesson.type,
                                                                            order: lesson.order,
                                                                            duration: lesson.duration?.toString() || "0",
                                                                            isRequired: lesson.isRequired,
                                                                            moduleId: lesson.moduleId || ""
                                                                        });
                                                                        setIsLessonModalOpen(true);
                                                                    }}
                                                                >
                                                                    Edit
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        )}
                    </Tabs>
                </motion.div>
            </div>
        </div>
    );
}