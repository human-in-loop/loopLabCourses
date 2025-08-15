import { Card, CardContent } from "@/components/ui/card";

export default function AdminServices() {
    return (
        <div className="min-h-screen pt-20 px-4 bg-loop-dark text-white">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Services Management</h1>
                <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-8 text-center">
                        <p className="text-gray-400">Services management features coming soon...</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}