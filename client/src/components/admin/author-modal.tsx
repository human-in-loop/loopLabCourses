import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import React from "react";

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

interface AuthorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAuthorCreated?: (authorId: string) => void;
    onAuthorUpdated?: () => void;
    author?: Author | null; // For editing
    mode?: 'create' | 'edit';
}

export default function AuthorModal({
    isOpen,
    onClose,
    onAuthorCreated,
    onAuthorUpdated,
    author,
    mode = 'create'
}: AuthorModalProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        name: author?.name || "",
        email: author?.email || "",
        bio: author?.bio || "",
        isActive: author?.isActive ?? true,
        socials: {
            twitter: author?.socials?.twitter || "",
            linkedin: author?.socials?.linkedin || "",
            website: author?.socials?.website || "",
            github: author?.socials?.github || "",
        },
    });

    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string>(author?.avatar || "");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const authorMutation = useMutation({
        mutationFn: async (data: FormData) => {
            const url = mode === 'edit' ? `/api/admin/blog/authors/${author?.id}` : "/api/admin/blog/authors";
            const method = mode === 'edit' ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                credentials: "include",
                body: data,
            });

            if (!response.ok) throw new Error(`Failed to ${mode} author`);
            return response.json();
        },
        onSuccess: (newAuthor) => {
            toast({
                title: `Author ${mode === 'edit' ? 'updated' : 'created'} successfully`,
                description: `${newAuthor.name} has been ${mode === 'edit' ? 'updated' : 'added to the system'}.`,
            });
            queryClient.invalidateQueries({ queryKey: ["/api/admin/blog/authors"] });

            if (mode === 'create' && onAuthorCreated) {
                onAuthorCreated(newAuthor.id);
            } else if (mode === 'edit' && onAuthorUpdated) {
                onAuthorUpdated();
            }

            onClose();
            resetForm();
        },
        onError: () => {
            toast({
                title: "Error",
                description: `Failed to ${mode} author.`,
                variant: "destructive",
            });
        },
    });

    const resetForm = () => {
        setFormData({
            name: "",
            email: "",
            bio: "",
            isActive: true,
            socials: { twitter: "", linkedin: "", website: "", github: "" },
        });
        setAvatarFile(null);
        setAvatarPreview("");
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const formDataToSend = new FormData();
        formDataToSend.append('name', formData.name);
        formDataToSend.append('email', formData.email);
        formDataToSend.append('bio', formData.bio);
        formDataToSend.append('isActive', formData.isActive.toString());
        formDataToSend.append('socials', JSON.stringify(formData.socials));

        if (avatarFile) {
            formDataToSend.append('avatar', avatarFile);
        } else if (mode === 'edit' && author?.avatar) {
            formDataToSend.append('currentAvatar', author.avatar);
        }

        authorMutation.mutate(formDataToSend);
    };

    // Reset form when modal opens/closes or author changes
    React.useEffect(() => {
        if (isOpen && author && mode === 'edit') {
            setFormData({
                name: author.name,
                email: author.email,
                bio: author.bio,
                isActive: author.isActive,
                socials: {
                    twitter: author.socials?.twitter || "",
                    linkedin: author.socials?.linkedin || "",
                    website: author.socials?.website || "",
                    github: author.socials?.github || "",
                },
            });
            setAvatarPreview(author.avatar || "");
        } else if (isOpen && mode === 'create') {
            resetForm();
        }
    }, [isOpen, author, mode]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{mode === 'edit' ? 'Edit Author' : 'Add New Author'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Avatar Upload */}
                    <div className="text-center">
                        <div className="mb-4">
                            {avatarPreview ? (
                                <img
                                    src={avatarPreview}
                                    alt="Avatar preview"
                                    className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-gray-600"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-full mx-auto bg-gray-600 flex items-center justify-center">
                                    <i className="fas fa-user text-gray-400 text-2xl"></i>
                                </div>
                            )}
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                        />

                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            className="border-gray-600 text-gray-300"
                        >
                            <i className="fas fa-camera mr-2"></i>
                            {avatarPreview ? 'Change Photo' : 'Upload Photo'}
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="name" className="text-gray-300">Full Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                className="bg-gray-700 border-gray-600 text-white"
                                placeholder="John Doe"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="email" className="text-gray-300">Email *</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                className="bg-gray-700 border-gray-600 text-white"
                                placeholder="john@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="bio" className="text-gray-300">Bio *</Label>
                        <Textarea
                            id="bio"
                            value={formData.bio}
                            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                            className="bg-gray-700 border-gray-600 text-white"
                            placeholder="Brief professional bio..."
                            rows={3}
                            required
                        />
                    </div>

                    {mode === 'edit' && (
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="isActive"
                                checked={formData.isActive}
                                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                            />
                            <Label htmlFor="isActive" className="text-gray-300">Active Author</Label>
                        </div>
                    )}

                    <div className="space-y-4">
                        <Label className="text-gray-300">Social Links</Label>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="twitter" className="text-gray-400 text-sm">Twitter</Label>
                                <Input
                                    id="twitter"
                                    value={formData.socials.twitter}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        socials: { ...prev.socials, twitter: e.target.value }
                                    }))}
                                    className="bg-gray-700 border-gray-600 text-white"
                                    placeholder="https://twitter.com/username"
                                />
                            </div>

                            <div>
                                <Label htmlFor="linkedin" className="text-gray-400 text-sm">LinkedIn</Label>
                                <Input
                                    id="linkedin"
                                    value={formData.socials.linkedin}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        socials: { ...prev.socials, linkedin: e.target.value }
                                    }))}
                                    className="bg-gray-700 border-gray-600 text-white"
                                    placeholder="https://linkedin.com/in/username"
                                />
                            </div>

                            <div>
                                <Label htmlFor="website" className="text-gray-400 text-sm">Website</Label>
                                <Input
                                    id="website"
                                    value={formData.socials.website}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        socials: { ...prev.socials, website: e.target.value }
                                    }))}
                                    className="bg-gray-700 border-gray-600 text-white"
                                    placeholder="https://example.com"
                                />
                            </div>

                            <div>
                                <Label htmlFor="github" className="text-gray-400 text-sm">GitHub</Label>
                                <Input
                                    id="github"
                                    value={formData.socials.github}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        socials: { ...prev.socials, github: e.target.value }
                                    }))}
                                    className="bg-gray-700 border-gray-600 text-white"
                                    placeholder="https://github.com/username"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="border-gray-600 text-gray-300"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={authorMutation.isPending}
                            className="bg-loop-purple hover:bg-loop-purple/80"
                        >
                            {authorMutation.isPending ?
                                (mode === 'edit' ? 'Updating...' : 'Creating...') :
                                (mode === 'edit' ? 'Update Author' : 'Create Author')
                            }
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}