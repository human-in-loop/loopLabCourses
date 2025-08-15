// Create client/src/pages/admin-team.tsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface TeamMember {
    id: string;
    name: string;
    role: string;
    bio: string;
    image: string;
    linkedIn?: string;
    twitter?: string;
    github?: string;
    order: number;
    isActive: boolean;
}

export default function AdminTeam() {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        role: "",
        bio: "",
        image: "",
        linkedIn: "",
        twitter: "",
        github: "",
        order: 0,
        isActive: true,
    });

    const queryClient = useQueryClient();
    const { toast } = useToast();

    // Fetch team members
    const { data: teamMembers, isLoading } = useQuery<TeamMember[]>({
        queryKey: ["/api/admin/team"],
        queryFn: async () => {
            const response = await apiRequest("GET", "/api/admin/team");
            if (!response.ok) throw new Error("Failed to fetch team members");
            return response.json();
        },
    });

    // Create/Update team member mutation
    const saveTeamMemberMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            const url = editingMember ? `/api/admin/team/${editingMember.id}` : "/api/admin/team";
            const method = editingMember ? "PUT" : "POST";
            const response = await apiRequest(method, url, data);
            if (!response.ok) throw new Error("Failed to save team member");
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/team"] });
            setDialogOpen(false);
            setEditingMember(null);
            resetForm();
            toast({ title: editingMember ? "Team member updated" : "Team member added" });
        },
    });

    // Delete team member mutation
    const deleteTeamMemberMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await apiRequest("DELETE", `/api/admin/team/${id}`);
            if (!response.ok) throw new Error("Failed to delete team member");
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/team"] });
            toast({ title: "Team member removed" });
        },
    });

    const resetForm = () => {
        setFormData({
            name: "",
            role: "",
            bio: "",
            image: "",
            linkedIn: "",
            twitter: "",
            github: "",
            order: 0,
            isActive: true,
        });
    };

    const handleEdit = (member: TeamMember) => {
        setEditingMember(member);
        setFormData({
            name: member.name,
            role: member.role,
            bio: member.bio,
            image: member.image,
            linkedIn: member.linkedIn || "",
            twitter: member.twitter || "",
            github: member.github || "",
            order: member.order,
            isActive: member.isActive,
        });
        setDialogOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        saveTeamMemberMutation.mutate(formData);
    };

    return (
        <div className="min-h-screen pt-20 px-4 bg-loop-dark text-white">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Team Management</h1>
                <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-8 text-center">
                        <p className="text-gray-400">Team management features coming soon...</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}