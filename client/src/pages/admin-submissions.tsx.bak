import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Submission } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function AdminSubmissions() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: submissions = [], isLoading } = useQuery<Submission[]>({ queryKey: ["/api/admin/submissions"] });

  const [isGradingModalOpen, setIsGradingModalOpen] = useState(false);
  const [currentSubmission, setCurrentSubmission] = useState<Submission | null>(null);
  const [grade, setGrade] = useState<string>(""); // Change to string
  const [feedback, setFeedback] = useState<string>("");

  const gradeSubmissionMutation = useMutation({
    mutationFn: async ({ submissionId, grade, feedback }: { submissionId: string; grade: number; feedback?: string }) => {
      const response = await apiRequest("POST", `/api/admin/submissions/${submissionId}/grade`, { grade, feedback });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to grade submission.");
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Submission Graded",
        description: data?.courseCompleted
          ? `Grade submitted! Course completed with 10-day access expiration.`
          : "Grade submitted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/submissions"] });
      setIsGradingModalOpen(false);
      setCurrentSubmission(null);
      setGrade("");
      setFeedback("");
    },
    onError: (error: any) => {
      toast({
        title: "Grading Failed",
        description: error.message || "There was an error grading the submission.",
        variant: "destructive",
      });
    },
  });

  const handleGradeClick = (submission: Submission) => {
    setCurrentSubmission(submission);
    // Convert the number to a string to match the state's type
    setGrade(submission.grade != null ? String(submission.grade) : "");
    setFeedback(submission.feedback || "");
    setIsGradingModalOpen(true);
  };

  const handleGradeSubmit = () => {
    if (currentSubmission && grade !== "") {
      gradeSubmissionMutation.mutate({
        submissionId: currentSubmission.id,
        grade: Number(grade),
        feedback: feedback || undefined,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 px-4 flex items-center justify-center">
        <div className="glassmorphism p-8 rounded-2xl animate-pulse max-w-4xl w-full">
          <div className="h-12 bg-gray-700 rounded mb-4"></div>
          <div className="h-6 bg-gray-700 rounded mb-6"></div>
          <div className="h-40 bg-gray-700 rounded mb-6"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 px-4">
      <div className="max-w-7xl mx-auto py-8">
        <h1 className="text-4xl font-bold text-white mb-8">Submissions Management</h1>

        <Card className="glassmorphism border-gray-700">
          <CardHeader>
            <CardTitle className="text-xl text-white">All Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            {submissions && submissions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project Title</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Course ID</TableHead>
                    <TableHead>Submitted At</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="font-medium">{submission.projectTitle}</TableCell>
                      <TableCell>{submission.userId}</TableCell>
                      <TableCell>{submission.courseId}</TableCell>
                      <TableCell>{format(new Date(submission.submittedAt), 'MMM dd, yyyy HH:mm')}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${submission.grade !== null ? 'bg-green-600/20 text-green-400' : 'bg-yellow-600/20 text-yellow-400'}`}>
                          {submission.grade !== null ? submission.grade : 'Pending'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => handleGradeClick(submission)}>
                          {submission.grade !== null ? 'View/Edit Grade' : 'Grade'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-gray-400">No submissions found.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isGradingModalOpen} onOpenChange={setIsGradingModalOpen}>
        <DialogContent className="sm:max-w-[425px] glassmorphism border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Grade Submission</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="grade" className="text-right text-gray-300">Grade</Label>
              <Input
                id="grade"
                type="number"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="col-span-3 bg-gray-800 text-white border-gray-600"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="feedback" className="text-right text-gray-300">Feedback</Label>
              <Textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="col-span-3 bg-gray-800 text-white border-gray-600"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGradingModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleGradeSubmit} disabled={gradeSubmissionMutation.isPending}>
              {gradeSubmissionMutation.isPending ? 'Saving...' : 'Save Grade'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
