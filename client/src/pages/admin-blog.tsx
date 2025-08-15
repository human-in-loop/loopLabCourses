import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Post {
    id: string;
    title: string;
    slug: string;
    status: "draft" | "published";
    createdAt: string; // ISO string
}

export default function AdminBlog() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [location, setLocation] = useLocation();

    const {
        data: posts = [],
        isLoading,
        isError,
    } = useQuery<Post[]>({
        queryKey: ["/api/admin/blog/posts"],
        queryFn: async () => {
            const res = await apiRequest("GET", "/api/admin/blog/posts");
            if (!res.ok) throw new Error("Failed to fetch posts");
            return res.json();
        },
    });

    const createPost = useMutation({
        mutationFn: async (newPost: { title: string; content: string }) => {
            // TODO: replace with real API call when backend endpoints are ready
            // const res = await apiRequest("POST", "/api/admin/blog/posts", newPost);
            // return res.json();
            return Promise.resolve({
                id: crypto.randomUUID(),
                title: newPost.title,
                slug: "new-slug",
                status: "draft" as const,
                createdAt: new Date().toISOString(),
            });
        },
        onSuccess: () => {
            toast({ title: "Post created (simulation)", description: "Wire this up to your API next." });
            queryClient.invalidateQueries({ queryKey: ["/api/admin/blog/posts"] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (postId: string) => {
            const response = await fetch(`/api/admin/blog/posts/${postId}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (!response.ok) throw new Error("Failed to delete post");
            return response.json();
        },
        onSuccess: () => {
            toast({
                title: "Post deleted",
                description: "The blog post has been deleted successfully.",
            });
            queryClient.invalidateQueries({ queryKey: ["/api/admin/blog/posts"] });
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Failed to delete post.",
                variant: "destructive",
            });
        },
    });

    const handleCreatePost = () => {
        setLocation("/admin/blog/new");
    };

    return (
        <div className="min-h-screen pt-20 px-4 bg-loop-dark text-white">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Blog Management</h1>
                    <Button onClick={handleCreatePost} className="bg-loop-purple hover:bg-loop-purple/80">
                        <i className="fas fa-plus mr-2" />
                        Create New Post
                    </Button>
                </div>

                <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                        <CardTitle>All Posts</CardTitle>
                    </CardHeader>

                    <CardContent>
                        {isLoading ? (
                            <p className="text-gray-400">Loading posts...</p>
                        ) : isError ? (
                            <p className="text-red-400">Failed to load posts.</p>
                        ) : posts.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="bg-green-500/20 p-6 rounded-full mx-auto mb-6 w-fit">
                                    <i className="fas fa-pen-fancy text-green-400 text-3xl" />
                                </div>
                                <h3 className="text-2xl font-semibold text-white mb-2">No posts yet</h3>
                                <p className="text-gray-400 mb-6">Create your first post to get started.</p>
                                <Button onClick={handleCreatePost} className="bg-loop-purple hover:bg-loop-purple/80">
                                    <i className="fas fa-plus mr-2" />
                                    Create Post
                                </Button>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-gray-700">
                                        <TableHead className="text-gray-300">Title</TableHead>
                                        <TableHead className="text-gray-300">Slug</TableHead>
                                        <TableHead className="text-gray-300">Status</TableHead>
                                        <TableHead className="text-gray-300">Created</TableHead>
                                        <TableHead className="text-gray-300 text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {posts.map((post) => (
                                        <TableRow key={post.id} className="border-gray-700">
                                            <TableCell className="font-medium text-white">{post.title}</TableCell>
                                            <TableCell className="text-gray-300">/{post.slug}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={
                                                        post.status === "published"
                                                            ? "bg-green-600/20 text-green-400"
                                                            : "bg-yellow-600/20 text-yellow-300"
                                                    }
                                                >
                                                    {post.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-gray-400">
                                                {new Date(post.createdAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Link href={`/admin/blog/edit/${post.id}`}>
                                                    <Button size="sm" variant="outline" className="border-gray-600 text-gray-300">
                                                        <i className="fas fa-edit mr-1"></i>
                                                        Edit
                                                    </Button>
                                                </Link>
                                                <Link href={`/blog/${post.slug}`}>
                                                    <Button size="sm" variant="outline" className="border-gray-600 text-gray-300">
                                                        <i className="fas fa-eye mr-1"></i>
                                                        View
                                                    </Button>
                                                </Link>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        if (confirm(`Are you sure you want to delete "${post.title}"?`)) {
                                                            deleteMutation.mutate(post.id);
                                                        }
                                                    }}
                                                    className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                                                    disabled={deleteMutation.isPending}
                                                >
                                                    <i className="fas fa-trash mr-1"></i>
                                                    {deleteMutation.isPending ? "..." : "Delete"}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
