import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

interface SiteSettings {
    siteName: string;
    siteDescription: string;
    allowRegistration: boolean;
    requireEmailVerification: boolean;
    maxCoursesPerUser: number;
    supportEmail: string;
    maintenanceMode: boolean;
}

export default function AdminSettings() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const [formData, setFormData] = useState<SiteSettings>({
        siteName: "",
        siteDescription: "",
        allowRegistration: true,
        requireEmailVerification: true,
        maxCoursesPerUser: 10,
        supportEmail: "",
        maintenanceMode: false
    });

    // Fetch current settings
    const { data: settings, isLoading } = useQuery<SiteSettings>({
        queryKey: ["/api/admin/settings"],
        queryFn: async () => {
            const response = await fetch("/api/admin/settings", {
                credentials: "include",
            });
            if (!response.ok) {
                throw new Error("Failed to fetch settings");
            }
            return response.json();
        }
    });

    // Update form data when settings are loaded
    React.useEffect(() => {
        if (settings) {
            setFormData(settings);
        }
    }, [settings]);

    // Update settings mutation
    const updateSettingsMutation = useMutation({
        mutationFn: async (settings: SiteSettings) => {
            const response = await fetch("/api/admin/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(settings),
            });
            if (!response.ok) {
                throw new Error("Failed to update settings");
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
            toast({
                title: "Settings Updated",
                description: "Site settings have been updated successfully.",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Update Failed",
                description: error.message || "Failed to update settings.",
                variant: "destructive",
            });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateSettingsMutation.mutate(formData);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen pt-20 px-4 bg-loop-dark text-white">
                <div className="max-w-4xl mx-auto">
                    <div className="animate-pulse space-y-6">
                        <div className="h-8 bg-gray-700 rounded w-64"></div>
                        <div className="space-y-4">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="h-20 bg-gray-700 rounded"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-20 px-4 bg-loop-dark text-white">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    {/* Header */}
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-4xl font-bold gradient-text">Site Settings</h1>
                            <p className="text-gray-400 mt-2">Configure general site settings and preferences</p>
                        </div>
                        <Link href="/admin/dashboard">
                            <Button variant="outline" className="border-loop-accent text-loop-accent hover:bg-loop-accent hover:text-white">
                                <i className="fas fa-arrow-left mr-2"></i>
                                Back to Dashboard
                            </Button>
                        </Link>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* General Settings */}
                        <Card className="bg-gray-800/50 border-gray-700">
                            <CardHeader>
                                <CardTitle className="text-xl text-white flex items-center">
                                    <i className="fas fa-cog mr-2 text-loop-purple"></i>
                                    General Settings
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="siteName" className="text-gray-300">Site Name</Label>
                                    <Input
                                        id="siteName"
                                        value={formData.siteName}
                                        onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                                        className="bg-gray-700 border-gray-600 text-white"
                                        placeholder="Your Site Name"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="siteDescription" className="text-gray-300">Site Description</Label>
                                    <Textarea
                                        id="siteDescription"
                                        value={formData.siteDescription}
                                        onChange={(e) => setFormData({ ...formData, siteDescription: e.target.value })}
                                        className="bg-gray-700 border-gray-600 text-white"
                                        rows={3}
                                        placeholder="Brief description of your site"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="supportEmail" className="text-gray-300">Support Email</Label>
                                    <Input
                                        id="supportEmail"
                                        type="email"
                                        value={formData.supportEmail}
                                        onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
                                        className="bg-gray-700 border-gray-600 text-white"
                                        placeholder="support@yoursite.com"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* User Management */}
                        <Card className="bg-gray-800/50 border-gray-700">
                            <CardHeader>
                                <CardTitle className="text-xl text-white flex items-center">
                                    <i className="fas fa-users mr-2 text-loop-accent"></i>
                                    User Management
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label className="text-gray-300">Allow New Registrations</Label>
                                        <p className="text-sm text-gray-400">Allow new users to register accounts</p>
                                    </div>
                                    <Switch
                                        checked={formData.allowRegistration}
                                        onCheckedChange={(checked) => setFormData({ ...formData, allowRegistration: checked })}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label className="text-gray-300">Require Email Verification</Label>
                                        <p className="text-sm text-gray-400">Users must verify their email before accessing courses</p>
                                    </div>
                                    <Switch
                                        checked={formData.requireEmailVerification}
                                        onCheckedChange={(checked) => setFormData({ ...formData, requireEmailVerification: checked })}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="maxCourses" className="text-gray-300">Max Courses Per User</Label>
                                    <Input
                                        id="maxCourses"
                                        type="number"
                                        min="1"
                                        value={formData.maxCoursesPerUser}
                                        onChange={(e) => setFormData({ ...formData, maxCoursesPerUser: parseInt(e.target.value) || 10 })}
                                        className="bg-gray-700 border-gray-600 text-white"
                                    />
                                    <p className="text-sm text-gray-400 mt-1">Maximum number of courses a user can enroll in</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* System Settings */}
                        <Card className="bg-gray-800/50 border-gray-700">
                            <CardHeader>
                                <CardTitle className="text-xl text-white flex items-center">
                                    <i className="fas fa-server mr-2 text-loop-orange"></i>
                                    System Settings
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label className="text-gray-300">Maintenance Mode</Label>
                                        <p className="text-sm text-gray-400">Temporarily disable site access for maintenance</p>
                                    </div>
                                    <Switch
                                        checked={formData.maintenanceMode}
                                        onCheckedChange={(checked) => setFormData({ ...formData, maintenanceMode: checked })}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Save Button */}
                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                disabled={updateSettingsMutation.isPending}
                                className="bg-loop-purple hover:bg-loop-purple/80 px-8"
                            >
                                {updateSettingsMutation.isPending ? "Saving..." : "Save Settings"}
                            </Button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}