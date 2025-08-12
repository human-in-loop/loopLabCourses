import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();

  const { data: user } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  const { data: courses } = useQuery({
    queryKey: ["/api/courses"],
  });

  const { data: submissions } = useQuery({
    queryKey: ["/api/admin/submissions"],
    enabled: !!user?.isAdmin,
  });

  // Redirect if not admin
  if (!user?.isAdmin) {
    setLocation("/");
    return null;
  }

  const pendingSubmissions = submissions?.filter(s => s.grade === null) || [];
  const totalSubmissions = submissions?.length || 0;

  return (
    <div className="min-h-screen pt-16 px-4">
      <div className="max-w-7xl mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2" data-testid="text-admin-dashboard-title">
            Admin Dashboard
          </h1>
          <p className="text-gray-400">
            Manage courses, track student progress, and grade submissions.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="glassmorphism border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-loop-purple/20">
                  <i className="fas fa-graduation-cap text-loop-purple text-xl"></i>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-white">{courses?.length || 0}</h3>
                  <p className="text-gray-400 text-sm">Total Courses</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glassmorphism border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-loop-orange/20">
                  <i className="fas fa-file-alt text-loop-orange text-xl"></i>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-white">{totalSubmissions}</h3>
                  <p className="text-gray-400 text-sm">Total Submissions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glassmorphism border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-500/20">
                  <i className="fas fa-clock text-yellow-500 text-xl"></i>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-white">{pendingSubmissions.length}</h3>
                  <p className="text-gray-400 text-sm">Pending Reviews</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glassmorphism border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-500/20">
                  <i className="fas fa-check-circle text-green-500 text-xl"></i>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-white">{totalSubmissions - pendingSubmissions.length}</h3>
                  <p className="text-gray-400 text-sm">Graded</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="glassmorphism border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <i className="fas fa-tasks mr-2"></i>
                Student Submissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 mb-4">
                Review and grade student project submissions. Complete the course lifecycle by grading final projects.
              </p>
              <Link href="/admin/submissions">
                <Button className="w-full bg-gradient-to-r from-loop-purple to-loop-orange hover:shadow-lg transition-all duration-300">
                  <i className="fas fa-edit mr-2"></i>
                  Grade Submissions
                  {pendingSubmissions.length > 0 && (
                    <Badge className="ml-2 bg-yellow-500/20 text-yellow-400">
                      {pendingSubmissions.length} pending
                    </Badge>
                  )}
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="glassmorphism border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <i className="fas fa-cogs mr-2"></i>
                Course Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 mb-4">
                Manage your course catalog, pricing, and content. Add new courses or edit existing ones.
              </p>
              <Button 
                className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 transition-all duration-300"
                disabled
              >
                <i className="fas fa-wrench mr-2"></i>
                Course Editor (Coming Soon)
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Submissions */}
        {submissions && submissions.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-white mb-4">Recent Submissions</h2>
            <div className="space-y-3">
              {submissions.slice(0, 5).map((submission) => (
                <Card key={submission.id} className="glassmorphism border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-white">{submission.projectTitle}</h3>
                        <p className="text-gray-400 text-sm">
                          Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {submission.grade !== null ? (
                          <Badge 
                            className={`${
                              submission.grade >= 70 
                                ? 'bg-green-600/20 text-green-400 border-green-600/30' 
                                : 'bg-red-600/20 text-red-400 border-red-600/30'
                            }`}
                          >
                            {submission.grade}/100
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-600/20 text-yellow-400 border-yellow-600/30">
                            Pending
                          </Badge>
                        )}
                        <Link href="/admin/submissions">
                          <Button size="sm" variant="outline" className="border-gray-600 text-gray-300">
                            Review
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}