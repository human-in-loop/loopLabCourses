// Create client/src/pages/admin-users.tsx
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

interface User {
    id: string;
    name: string;
    email: string;
    isVerified: boolean;
    isAdmin: boolean;
    createdAt: string;
}

interface UsersResponse {
    items: User[];
    total: number;
    page: number;
    totalPages: number;
}

export default function AdminUsers() {
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [activeFilter, setActiveFilter] = useState<"all" | "verified" | "unverified" | "admins">("all");
    const { toast } = useToast();

    const { data: usersData, isLoading, error } = useQuery<UsersResponse>({
        queryKey: ["/api/admin/users", currentPage, searchQuery],
        queryFn: async () => {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: "10",
                search: searchQuery,
            });

            const response = await fetch(`/api/admin/users?${params}`, {
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error("Failed to fetch users");
            }

            return response.json();
        },
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
    };

    // Filter users based on active filter
    const filteredUsers = usersData?.items?.filter(user => {
        switch (activeFilter) {
            case "verified":
                return user.isVerified;
            case "unverified":
                return !user.isVerified;
            case "admins":
                return user.isAdmin;
            default:
                return true;
        }
    }) || [];

    const getFilterCount = (filter: typeof activeFilter) => {
        if (!usersData?.items) return 0;

        switch (filter) {
            case "verified":
                return usersData.items.filter(user => user.isVerified).length;
            case "unverified":
                return usersData.items.filter(user => !user.isVerified).length;
            case "admins":
                return usersData.items.filter(user => user.isAdmin).length;
            default:
                return usersData.items.length;
        }
    };

    if (error) {
        return (
            <div className="min-h-screen pt-20 px-4 bg-loop-dark text-white">
                <div className="max-w-6xl mx-auto">
                    <Card className="bg-red-900/20 border-red-500/30">
                        <CardContent className="p-6">
                            <p className="text-red-400">Failed to load users. Please try again.</p>
                        </CardContent>
                    </Card>
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
                    {/* Header - Always visible */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold gradient-text">User Management</h1>
                        <p className="text-gray-400 mt-2">Manage users, verifications, and permissions</p>
                    </div>

                    {/* Search Bar - Always visible */}
                    <Card className="bg-gray-800/50 border-gray-700 mb-6">
                        <CardContent className="p-6">
                            <form onSubmit={handleSearch} className="flex gap-4">
                                <Input
                                    placeholder="Search users by name or email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="flex-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                />
                                <Button
                                    type="submit"
                                    className="bg-loop-purple hover:bg-loop-purple/80"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Searching..." : "Search"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Filter Tabs - Always visible */}
                    <Card className="bg-gray-800/50 border-gray-700">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-xl text-white">All Users</CardTitle>
                                {usersData && (
                                    <Badge variant="outline" className="text-gray-300">
                                        {filteredUsers.length} of {usersData.total} users
                                    </Badge>
                                )}
                            </div>

                            {/* Filter Tabs */}
                            <div className="flex space-x-2 mt-4">
                                {([
                                    { key: "all", label: "All" },
                                    { key: "verified", label: "Verified" },
                                    { key: "unverified", label: "Unverified" },
                                    { key: "admins", label: "Admins" }
                                ] as const).map((filter) => (
                                    <Button
                                        key={filter.key}
                                        size="sm"
                                        variant={activeFilter === filter.key ? "default" : "outline"}
                                        onClick={() => setActiveFilter(filter.key)}
                                        className={
                                            activeFilter === filter.key
                                                ? "bg-loop-purple hover:bg-loop-purple/80"
                                                : "border-gray-600 text-gray-300 hover:bg-gray-700"
                                        }
                                    >
                                        {filter.label} ({getFilterCount(filter.key)})
                                    </Button>
                                ))}
                            </div>
                        </CardHeader>

                        <CardContent>
                            {isLoading ? (
                                /* Loading State */
                                <div className="space-y-4">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="animate-pulse">
                                            <div className="h-16 bg-gray-700 rounded"></div>
                                        </div>
                                    ))}
                                </div>
                            ) : filteredUsers.length === 0 ? (
                                /* Empty State - but navigation stays visible */
                                <div className="text-center py-12">
                                    <div className="bg-gray-700/50 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                                        <i className="fas fa-users text-gray-400 text-2xl"></i>
                                    </div>
                                    <h3 className="text-xl font-semibold text-white mb-2">
                                        {searchQuery
                                            ? "No users found matching your search"
                                            : `No ${activeFilter} users found`
                                        }
                                    </h3>
                                    <p className="text-gray-400 mb-6">
                                        {searchQuery
                                            ? `Try adjusting your search term "${searchQuery}"`
                                            : `There are currently no ${activeFilter === "all" ? "" : activeFilter + " "}users in the system`
                                        }
                                    </p>
                                    {searchQuery && (
                                        <Button
                                            onClick={() => {
                                                setSearchQuery("");
                                                setActiveFilter("all");
                                            }}
                                            variant="outline"
                                            className="border-gray-600 text-gray-300 hover:bg-gray-700"
                                        >
                                            <i className="fas fa-times mr-2"></i>
                                            Clear Search
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                /* Users Table */
                                <>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="text-gray-300">Name</TableHead>
                                                <TableHead className="text-gray-300">Email</TableHead>
                                                <TableHead className="text-gray-300">Status</TableHead>
                                                <TableHead className="text-gray-300">Admin</TableHead>
                                                <TableHead className="text-gray-300">Joined</TableHead>
                                                <TableHead className="text-gray-300">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredUsers.map((user) => (
                                                <TableRow key={user.id} className="border-gray-700">
                                                    <TableCell className="font-medium text-white">
                                                        {user.name}
                                                    </TableCell>
                                                    <TableCell className="text-gray-300">
                                                        {user.email}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={user.isVerified ? "default" : "secondary"}
                                                            className={
                                                                user.isVerified
                                                                    ? "bg-green-500/20 text-green-400 border-green-500/30"
                                                                    : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                                                            }
                                                        >
                                                            {user.isVerified ? "Verified" : "Pending"}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {user.isAdmin ? (
                                                            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                                                                Admin
                                                            </Badge>
                                                        ) : (
                                                            <span className="text-gray-500">User</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-gray-400">
                                                        {new Date(user.createdAt).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="border-gray-600 text-gray-300 hover:bg-gray-700"
                                                        >
                                                            Manage
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>

                                    {/* Pagination */}
                                    {usersData && usersData.totalPages > 1 && (
                                        <div className="flex items-center justify-between mt-6">
                                            <p className="text-sm text-gray-400">
                                                Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, usersData.total)} of {usersData.total} users
                                            </p>

                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                                    disabled={currentPage === 1}
                                                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                                                >
                                                    Previous
                                                </Button>

                                                <span className="text-sm text-gray-400">
                                                    Page {currentPage} of {usersData.totalPages}
                                                </span>

                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => setCurrentPage(Math.min(usersData.totalPages, currentPage + 1))}
                                                    disabled={currentPage === usersData.totalPages}
                                                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                                                >
                                                    Next
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}