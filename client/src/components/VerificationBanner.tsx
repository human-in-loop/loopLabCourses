import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { AlertCircle, Mail, CheckCircle } from "lucide-react";

interface VerificationBannerProps {
  user: {
    isVerified: boolean;
    email: string;
    name: string;
  };
}

export default function VerificationBanner({ user }: VerificationBannerProps) {
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  const resendMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/auth/resend-verification");
      return response.json();
    },
    onSuccess: (data) => {
      setEmailSent(true);
      toast({
        title: "Verification email sent!",
        description: data.message || "Please check your inbox.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send email",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  if (user.isVerified) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          <div>
            <h3 className="font-medium text-green-800 dark:text-green-200">
              Email Verified
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300">
              Your email has been verified and you have access to all courses.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-medium text-yellow-800 dark:text-yellow-200">
            Email Verification Required
          </h3>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
            Please verify your email address to access course content. Check your inbox for a verification link.
          </p>
          <div className="flex items-center gap-2">
            {!emailSent ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => resendMutation.mutate()}
                disabled={resendMutation.isPending}
                className="text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700 hover:bg-yellow-100 dark:hover:bg-yellow-800/30"
                data-testid="button-resend-verification"
              >
                <Mail className="h-4 w-4 mr-2" />
                {resendMutation.isPending ? "Sending..." : "Resend Email"}
              </Button>
            ) : (
              <div className="text-sm text-yellow-700 dark:text-yellow-300 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Verification email sent! Check your inbox.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}