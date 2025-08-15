// Create client/src/pages/admin-faq.tsx
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

interface FAQ {
    id: string;
    question: string;
    answer: string;
    order: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export default function AdminFAQ() {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
    const [formData, setFormData] = useState({
        question: "",
        answer: "",
        order: 0,
        isActive: true,
    });

    const queryClient = useQueryClient();
    const { toast } = useToast();

    // Fetch FAQs
    const { data: faqs, isLoading } = useQuery<FAQ[]>({
        queryKey: ["/api/admin/faqs"],
        queryFn: async () => {
            const response = await apiRequest("GET", "/api/admin/faqs");
            if (!response.ok) throw new Error("Failed to fetch FAQs");
            return response.json();
        },
    });

    // Create/Update FAQ mutation
    const saveFAQMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            const url = editingFAQ ? `/api/admin/faqs/${editingFAQ.id}` : "/api/admin/faqs";
            const method = editingFAQ ? "PUT" : "POST";
            const response = await apiRequest(method, url, data);
            if (!response.ok) throw new Error("Failed to save FAQ");
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/faqs"] });
            setDialogOpen(false);
            setEditingFAQ(null);
            setFormData({ question: "", answer: "", order: 0, isActive: true });
            toast({ title: editingFAQ ? "FAQ updated" : "FAQ created" });
        },
    });

    // Delete FAQ mutation
    const deleteFAQMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await apiRequest("DELETE", `/api/admin/faqs/${id}`);
            if (!response.ok) throw new Error("Failed to delete FAQ");
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/faqs"] });
            toast({ title: "FAQ deleted" });
        },
    });

    const handleEdit = (faq: FAQ) => {
        setEditingFAQ(faq);
        setFormData({
            question: faq.question,
            answer: faq.answer,
            order: faq.order,
            isActive: faq.isActive,
        });
        setDialogOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        saveFAQMutation.mutate(formData);
    };

    return (
        <div className="min-h-screen pt-20 px-4 bg-loop-dark text-white">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">FAQ Management</h1>
                <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-8 text-center">
                        <p className="text-gray-400">FAQ management features coming soon...</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}