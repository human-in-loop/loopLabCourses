import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import AuthorModal from "@/components/admin/author-modal";
import RichTextEditor from "@/components/admin/rich-text-editor";

interface Author {
    id: string;
    name: string;
    email: string;
    bio: string;
    avatar?: string;
    socials?: {
        twitter?: string;
        linkedin?: string;
        website?: string;
        github?: string;
    };
    isActive: boolean;
    createdAt: string;
}

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    status: "draft" | "published";
    authorId: string;
    author?: Author;
    createdAt: string;
    updatedAt: string;
}

export default function AdminBlogEdit() {
    const { id } = useParams();
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const isEditing = Boolean(id);

    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        content: "",
        excerpt: "",
        status: "draft" as "draft" | "published",
        authorId: "",
    });

    const [showAuthorModal, setShowAuthorModal] = useState(false);
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

    // Fetch existing post if editing
    const { data: post, isLoading } = useQuery<BlogPost>({
        queryKey: ["/api/admin/blog/posts", id],
        queryFn: async () => {
            const response = await fetch(`/api/admin/blog/posts/${id}`, {
                credentials: "include",
            });
            if (!response.ok) throw new Error("Failed to fetch post");
            return response.json();
        },
        enabled: isEditing,
    });

    // Fetch authors
    const { data: authors } = useQuery<Author[]>({
        queryKey: ["/api/admin/blog/authors"],
        queryFn: async () => {
            const response = await fetch("/api/admin/blog/authors", {
                credentials: "include",
            });
            if (!response.ok) throw new Error("Failed to fetch authors");
            return response.json();
        },
    });

    // Populate form when editing
    useEffect(() => {
        if (post) {
            setFormData({
                title: post.title,
                slug: post.slug,
                content: post.content,
                excerpt: post.excerpt,
                status: post.status,
                authorId: post.authorId || "",
            });
            setSlugManuallyEdited(true); // Don't auto-generate slug for existing posts
        }
    }, [post]);

    // Auto-generate slug from title
    useEffect(() => {
        if (!isEditing && formData.title && !slugManuallyEdited) {
            const slug = formData.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
            setFormData(prev => ({ ...prev, slug }));
        }
    }, [formData.title, isEditing, slugManuallyEdited]);

    const saveMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            const url = isEditing
                ? `/api/admin/blog/posts/${id}`
                : `/api/admin/blog/posts`;

            const response = await fetch(url, {
                method: isEditing ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    ...data,
                    excerpt: data.excerpt || data.content.substring(0, 160) + "...", // Auto-trim excerpt
                }),
            });

            if (!response.ok) throw new Error("Failed to save post");
            return response.json();
        },
        onSuccess: () => {
            toast({
                title: `Post ${isEditing ? 'updated' : 'created'} successfully`,
                description: "Your blog post has been saved.",
            });
            queryClient.invalidateQueries({ queryKey: ["/api/admin/blog/posts"] });
            setLocation("/admin/blog");
        },
        onError: () => {
            toast({
                title: "Error",
                description: `Failed to ${isEditing ? 'update' : 'create'} post.`,
                variant: "destructive",
            });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        saveMutation.mutate(formData);
    };

    const handlePublish = () => {
        saveMutation.mutate({ ...formData, status: "published" });
    };

    if (isEditing && isLoading) {
        return (
            <div className="min-h-screen pt-20 px-4 bg-loop-dark text-white">
                <div className="max-w-4xl mx-auto">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-700 rounded mb-6"></div>
                        <div className="h-64 bg-gray-700 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-20 px-4 bg-loop-dark text-white">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold">
                        {isEditing ? "Edit Post" : "Create New Post"}
                    </h1>
                    <Button
                        variant="outline"
                        onClick={() => setLocation("/admin/blog")}
                        className="border-gray-600 text-gray-300"
                    >
                        <i className="fas fa-arrow-left mr-2"></i>
                        Back to Posts
                    </Button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="bg-gray-800/50 border-gray-700">
                                <CardHeader>
                                    <CardTitle>Post Content</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <Label htmlFor="title" className="text-gray-300">Title *</Label>
                                        <Input
                                            id="title"
                                            value={formData.title}
                                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                            className="bg-gray-700 border-gray-600 text-white"
                                            placeholder="Enter post title..."
                                            required
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="slug" className="text-gray-300">Slug *</Label>
                                        <Input
                                            id="slug"
                                            value={formData.slug}
                                            onChange={(e) => {
                                                setFormData(prev => ({ ...prev, slug: e.target.value }));
                                                setSlugManuallyEdited(true); // Mark as manually edited
                                            }}
                                            className="bg-gray-700 border-gray-600 text-white"
                                            placeholder="post-url-slug"
                                            required
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            URL: /blog/{formData.slug}
                                        </p>
                                    </div>

                                    <div>
                                        <Label htmlFor="excerpt" className="text-gray-300">Excerpt</Label>
                                        <Textarea
                                            id="excerpt"
                                            value={formData.excerpt}
                                            onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                                            className="bg-gray-700 border-gray-600 text-white"
                                            placeholder="Brief description of the post..."
                                            rows={3}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Leave empty to auto-generate from content (first 160 characters)
                                        </p>
                                    </div>

                                    <div>
                                        <Label htmlFor="content" className="text-gray-300">Content *</Label>
                                        <RichTextEditor
                                            content={formData.content}
                                            onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                                            placeholder="Write your blog post content here..."
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Use the toolbar above for formatting, images, videos, and more
                                        </p>
                                    </div>

                                    <div>
                                        <Label htmlFor="author" className="text-gray-300">Author *</Label>
                                        <div className="flex gap-2">
                                            <Select
                                                value={formData.authorId}
                                                onValueChange={(value) => setFormData(prev => ({ ...prev, authorId: value }))}
                                            >
                                                <SelectTrigger className="bg-gray-700 border-gray-600 text-white flex-1">
                                                    <SelectValue placeholder="Select an author" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-gray-700 border-gray-600">
                                                    {authors?.map(author => (
                                                        <SelectItem key={author.id} value={author.id} className="text-white">
                                                            <div className="flex items-center space-x-2">
                                                                {author.avatar && (
                                                                    <img
                                                                        src={author.avatar}
                                                                        alt={author.name}
                                                                        className="w-6 h-6 rounded-full"
                                                                    />
                                                                )}
                                                                <span>{author.name}</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setShowAuthorModal(true)}
                                                className="border-gray-600 text-gray-300"
                                            >
                                                <i className="fas fa-plus mr-1"></i>
                                                New
                                            </Button>
                                        </div>

                                        {/* Show selected author preview */}
                                        {formData.authorId && authors && (
                                            <div className="mt-3 p-3 bg-gray-700/50 rounded-lg">
                                                {(() => {
                                                    const selectedAuthor = authors.find(a => a.id === formData.authorId);
                                                    return selectedAuthor ? (
                                                        <div className="flex items-start space-x-3">
                                                            {selectedAuthor.avatar && (
                                                                <img
                                                                    src={selectedAuthor.avatar}
                                                                    alt={selectedAuthor.name}
                                                                    className="w-12 h-12 rounded-full"
                                                                />
                                                            )}
                                                            <div className="flex-1">
                                                                <h4 className="font-medium text-white">{selectedAuthor.name}</h4>
                                                                <p className="text-sm text-gray-400 mt-1">{selectedAuthor.bio}</p>
                                                                {selectedAuthor.socials && (
                                                                    <div className="flex space-x-3 mt-2">
                                                                        {selectedAuthor.socials.twitter && (
                                                                            <a href={selectedAuthor.socials.twitter} target="_blank" rel="noopener noreferrer"
                                                                                className="text-blue-400 hover:text-blue-300">
                                                                                <i className="fab fa-twitter"></i>
                                                                            </a>
                                                                        )}
                                                                        {selectedAuthor.socials.linkedin && (
                                                                            <a href={selectedAuthor.socials.linkedin} target="_blank" rel="noopener noreferrer"
                                                                                className="text-blue-600 hover:text-blue-500">
                                                                                <i className="fab fa-linkedin"></i>
                                                                            </a>
                                                                        )}
                                                                        {selectedAuthor.socials.website && (
                                                                            <a href={selectedAuthor.socials.website} target="_blank" rel="noopener noreferrer"
                                                                                className="text-gray-400 hover:text-gray-300">
                                                                                <i className="fas fa-globe"></i>
                                                                            </a>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ) : null;
                                                })()}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <Card className="bg-gray-800/50 border-gray-700">
                                <CardHeader>
                                    <CardTitle>Publish Settings</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="status" className="text-gray-300">Status</Label>
                                        <Select
                                            value={formData.status}
                                            onValueChange={(value: "draft" | "published") =>
                                                setFormData(prev => ({ ...prev, status: value }))
                                            }
                                        >
                                            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-gray-700 border-gray-600">
                                                <SelectItem value="draft" className="text-white">Draft</SelectItem>
                                                <SelectItem value="published" className="text-white">Published</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="pt-4 space-y-3">
                                        <Button
                                            type="submit"
                                            disabled={saveMutation.isPending}
                                            className="w-full bg-gray-600 hover:bg-gray-700"
                                        >
                                            {saveMutation.isPending ? "Saving..." : "Save Draft"}
                                        </Button>

                                        {formData.status === "draft" && (
                                            <Button
                                                type="button"
                                                onClick={handlePublish}
                                                disabled={saveMutation.isPending}
                                                className="w-full bg-loop-purple hover:bg-loop-purple/80"
                                            >
                                                {saveMutation.isPending ? "Publishing..." : "Publish Now"}
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {isEditing && post && (
                                <Card className="bg-gray-800/50 border-gray-700">
                                    <CardHeader>
                                        <CardTitle>Post Info</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2 text-sm">
                                        <div>
                                            <span className="text-gray-400">Created:</span>
                                            <br />
                                            <span className="text-white">
                                                {new Date(post.createdAt).toLocaleString()}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Last Updated:</span>
                                            <br />
                                            <span className="text-white">
                                                {new Date(post.updatedAt).toLocaleString()}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </form>
                <AuthorModal
                    isOpen={showAuthorModal}
                    onClose={() => setShowAuthorModal(false)}
                    onAuthorCreated={(authorId) => {
                        setFormData(prev => ({ ...prev, authorId }));
                        setShowAuthorModal(false);
                    }}
                />
            </div>
        </div>
    );
}