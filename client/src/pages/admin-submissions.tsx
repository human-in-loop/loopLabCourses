import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Submission } from "@shared/schema";

export default function AdminSubmissions() {
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [isGrading, setIsGrading] = useState(false);
  const [grade, setGrade] = useState("");
  const [feedback, setFeedback] = useState("");
  const { toast } = useToast();

  const { data: submissions, isLoading } = useQuery<Submission[]>({
    queryKey: ["/api/admin/submissions"],
  });

  const gradeSubmissionMutation = useMutation({
    mutationFn: async ({ id, gradeData }: { id: string; gradeData: { grade: number; feedback?: string } }) => {
      return apiRequest(`/api/admin/submissions/${id}/grade`, {
        method: "POST",
        body: JSON.stringify(gradeData),
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/submissions"] });
      setIsGrading(false);
      setSelectedSubmission(null);
      setGrade("");
      setFeedback("");
      
      toast({
        title: "Submission Graded",
        description: data.courseCompleted 
          ? `Grade submitted! Course completed with 10-day access expiration.`
          : "Grade submitted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Grading Failed",
        description: error.message || "Failed to grade submission",
        variant: "destructive",
      });
    },
  });

  const handleGradeSubmission = () => {
    if (!selectedSubmission || !grade) return;

    const gradeNumber = parseInt(grade);
    if (isNaN(gradeNumber) || gradeNumber < 0 || gradeNumber > 100) {
      toast({
        title: "Invalid Grade",
        description: "Grade must be a number between 0 and 100",
        variant: "destructive",
      });
      return;
    }

    gradeSubmissionMutation.mutate({
      id: selectedSubmission.id,
      gradeData: {
        grade: gradeNumber,
        feedback: feedback.trim() || undefined,
      },
    });
  };

  const openGradingDialog = (submission: Submission) => {
    setSelectedSubmission(submission);
    setGrade(submission.grade?.toString() || "");
    setFeedback(submission.feedback || "");
    setIsGrading(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 px-4">
        <div className="max-w-6xl mx-auto py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-700 rounded w-1/3"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 px-4">
      <div className="max-w-6xl mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2" data-testid="text-admin-title">
            Student Submissions
          </h1>
          <p className="text-gray-400">
            Review and grade student project submissions. Grading the final submission automatically completes the course.
          </p>
        </div>

        {!submissions || submissions.length === 0 ? (
          <Card className="glassmorphism border-gray-700">
            <CardContent className="p-8 text-center">
              <i className="fas fa-inbox text-4xl text-gray-400 mb-4"></i>
              <h3 className="text-lg font-semibold text-white mb-2">No Submissions Yet</h3>
              <p className="text-gray-400">
                Student submissions will appear here when they submit their projects.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission) => (
              <Card key={submission.id} className="glassmorphism border-gray-700" data-testid={`card-submission-${submission.id}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white flex items-center">
                        <i className="fas fa-file-alt mr-2"></i>
                        {submission.projectTitle}
                      </CardTitle>
                      <p className="text-gray-400 text-sm mt-1">
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
                          Grade: {submission.grade}/100
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-600/20 text-yellow-400 border-yellow-600/30">
                          <i className="fas fa-clock mr-1"></i>
                          Pending Review
                        </Badge>
                      )}
                      <Button
                        onClick={() => openGradingDialog(submission)}
                        size="sm"
                        className="bg-loop-purple hover:bg-loop-purple/80"
                        data-testid={`button-grade-${submission.id}`}
                      >
                        <i className="fas fa-edit mr-2"></i>
                        {submission.grade !== null ? "Edit Grade" : "Grade"}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-white mb-2">Project Description</h4>
                      <p className="text-gray-300 leading-relaxed">{submission.description}</p>
                    </div>
                    
                    {submission.feedback && (
                      <div>
                        <h4 className="font-semibold text-white mb-2">Instructor Feedback</h4>
                        <div className="bg-gray-800/50 rounded-lg p-3">
                          <p className="text-gray-300">{submission.feedback}</p>
                          {submission.gradedAt && (
                            <p className="text-gray-500 text-sm mt-2">
                              Graded: {new Date(submission.gradedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Grading Dialog */}
        <Dialog open={isGrading} onOpenChange={setIsGrading}>
          <DialogContent className="glassmorphism border-gray-700 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">
                Grade Submission: {selectedSubmission?.projectTitle}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="grade" className="text-gray-200">Grade (0-100)</Label>
                <Input
                  id="grade"
                  type="number"
                  min="0"
                  max="100"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="mt-1 bg-gray-800/80 border-gray-500 text-white"
                  placeholder="85"
                  data-testid="input-grade"
                />
              </div>
              
              <div>
                <Label htmlFor="feedback" className="text-gray-200">Feedback (Optional)</Label>
                <Textarea
                  id="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="mt-1 bg-gray-800/80 border-gray-500 text-white"
                  placeholder="Great work! Your implementation shows solid understanding of the concepts..."
                  rows={4}
                  data-testid="textarea-feedback"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleGradeSubmission}
                  disabled={gradeSubmissionMutation.isPending || !grade}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  data-testid="button-submit-grade"
                >
                  {gradeSubmissionMutation.isPending ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Submitting Grade...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check mr-2"></i>
                      Submit Grade
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setIsGrading(false)}
                  variant="outline"
                  className="border-gray-600 text-gray-300"
                  data-testid="button-cancel-grade"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}