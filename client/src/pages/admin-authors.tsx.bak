import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import AuthorModal from "@/components/admin/author-modal";

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
    updatedAt?: string;
}

export default function AdminAuthors() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [showAuthorModal, setShowAuthorModal] = useState(false);
    const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

    const { data: authors, isLoading, isError } = useQuery<Author[]>({
        queryKey: ["/api/admin/blog/authors"],
        queryFn: async () => {
            const response = await fetch("/api/admin/blog/authors", {
                credentials: "include",
            });
            if (!response.ok) throw new Error("Failed to fetch authors");
            return response.json();
        },
    });

    const deleteAuthorMutation = useMutation({
        mutationFn: async (authorId: string) => {
            const response = await fetch(`/api/admin/blog/authors/${authorId}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (!response.ok) throw new Error("Failed to delete author");
            return response.json();
        },
        onSuccess: () => {
            toast({
                title: "Author deleted",
                description: "The author has been deleted successfully.",
            });
            queryClient.invalidateQueries({ queryKey: ["/api/admin/blog/authors"] });
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Failed to delete author.",
                variant: "destructive",
            });
        },
    });

    const handleCreateAuthor = () => {
        setEditingAuthor(null);
        setModalMode('create');
        setShowAuthorModal(true);
    };

    const handleEditAuthor = (author: Author) => {
        setEditingAuthor(author);
        setModalMode('edit');
        setShowAuthorModal(true);
    };

    const handleDeleteAuthor = (author: Author) => {
        if (confirm(`Are you sure you want to delete "${author.name}"? This action cannot be undone.`)) {
            deleteAuthorMutation.mutate(author.id);
        }
    };

    return (
        <div className="min-h-screen pt-20 px-4 bg-loop-dark text-white">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold">Author Management</h1>
                    <Button
                        onClick={handleCreateAuthor}
                        className="bg-loop-purple hover:bg-loop-purple/80"
                    >
                        <i className="fas fa-plus mr-2"></i>
                        Add Author
                    </Button>
                </div>

                <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                        <CardTitle>Authors</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-loop-purple"></div>
                            </div>
                        ) : isError ? (
                            <div className="text-center py-8">
                                <p className="text-red-400">Failed to load authors</p>
                            </div>
                        ) : authors?.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="bg-gray-700/50 p-8 rounded-lg">
                                    <i className="fas fa-users text-gray-400 text-4xl mb-4"></i>
                                    <p className="text-gray-400 mb-4">No authors found</p>
                                    <Button onClick={handleCreateAuthor} className="bg-loop-purple hover:bg-loop-purple/80">
                                        Add First Author
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-gray-700">
                                        <TableHead className="text-gray-300">Author</TableHead>
                                        <TableHead className="text-gray-300">Email</TableHead>
                                        <TableHead className="text-gray-300">Bio</TableHead>
                                        <TableHead className="text-gray-300">Status</TableHead>
                                        <TableHead className="text-gray-300">Socials</TableHead>
                                        <TableHead className="text-gray-300 text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {authors?.map((author) => (
                                        <TableRow key={author.id} className="border-gray-700">
                                            <TableCell>
                                                <div className="flex items-center space-x-3">
                                                    {author.avatar ? (
                                                        <img
                                                            src={author.avatar}
                                                            alt={author.name}
                                                            className="w-10 h-10 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                                                            <i className="fas fa-user text-gray-400"></i>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="font-medium text-white">{author.name}</div>
                                                        <div className="text-sm text-gray-400">
                                                            Joined {new Date(author.createdAt).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-gray-300">{author.email}</TableCell>
                                            <TableCell className="text-gray-300 max-w-xs">
                                                <div className="truncate" title={author.bio}>
                                                    {author.bio.length > 50 ? `${author.bio.substring(0, 50)}...` : author.bio}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={
                                                        author.isActive
                                                            ? "bg-green-600/20 text-green-400"
                                                            : "bg-gray-600/20 text-gray-400"
                                                    }
                                                >
                                                    {author.isActive ? "Active" : "Inactive"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex space-x-2">
                                                    {author.socials?.twitter && (
                                                        <a href={author.socials.twitter} target="_blank" rel="noopener noreferrer"
                                                            className="text-blue-400 hover:text-blue-300">
                                                            <i className="fab fa-twitter"></i>
                                                        </a>
                                                    )}
                                                    {author.socials?.linkedin && (
                                                        <a href={author.socials.linkedin} target="_blank" rel="noopener noreferrer"
                                                            className="text-blue-600 hover:text-blue-500">
                                                            <i className="fab fa-linkedin"></i>
                                                        </a>
                                                    )}
                                                    {author.socials?.website && (
                                                        <a href={author.socials.website} target="_blank" rel="noopener noreferrer"
                                                            className="text-gray-400 hover:text-gray-300">
                                                            <i className="fas fa-globe"></i>
                                                        </a>
                                                    )}
                                                    {author.socials?.github && (
                                                        <a href={author.socials.github} target="_blank" rel="noopener noreferrer"
                                                            className="text-gray-400 hover:text-gray-300">
                                                            <i className="fab fa-github"></i>
                                                        </a>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleEditAuthor(author)}
                                                    className="border-gray-600 text-gray-300"
                                                >
                                                    <i className="fas fa-edit mr-1"></i>
                                                    Edit
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleDeleteAuthor(author)}
                                                    className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                                                    disabled={deleteAuthorMutation.isPending}
                                                >
                                                    <i className="fas fa-trash mr-1"></i>
                                                    {deleteAuthorMutation.isPending ? "..." : "Delete"}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                <AuthorModal
                    isOpen={showAuthorModal}
                    onClose={() => setShowAuthorModal(false)}
                    onAuthorCreated={() => setShowAuthorModal(false)}
                    onAuthorUpdated={() => setShowAuthorModal(false)}
                    author={editingAuthor}
                    mode={modalMode}
                />
            </div>
        </div>
    );
}