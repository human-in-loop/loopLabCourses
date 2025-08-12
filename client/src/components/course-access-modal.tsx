import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import EmailSignupModal from "./email-signup-modal";

interface CourseAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseTitle?: string;
}

export default function CourseAccessModal({ isOpen, onClose, courseTitle }: CourseAccessModalProps) {
  const [showEmailSignup, setShowEmailSignup] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  const handleSignUp = () => {
    setShowEmailSignup(true);
    onClose();
  };

  const handleSignIn = () => {
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="glassmorphism border-gray-700 max-w-lg">
          <DialogHeader>
            <div className="text-center mb-6">
              <i className="fas fa-lock text-4xl text-loop-purple mb-4"></i>
              <DialogTitle className="text-2xl font-bold text-white mb-2">
                Course Access Required
              </DialogTitle>
              <p className="text-gray-300">
                {courseTitle ? (
                  <>Sign up to access <strong>{courseTitle}</strong> on our Moodle platform</>
                ) : (
                  "Sign up to access this premium course content on our Moodle platform"
                )}
              </p>
            </div>
          </DialogHeader>
          
          <div className="space-y-4">
            {!user ? (
              <div className="space-y-4">
                <Button
                  onClick={handleSignUp}
                  className="w-full bg-gradient-to-r from-loop-purple to-loop-orange hover:shadow-lg transition-all duration-300 py-3 font-semibold"
                  data-testid="button-signup-from-course"
                >
                  <i className="fas fa-user-plus mr-2"></i>
                  Sign Up for Access
                </Button>
                
                <Link href="/auth" onClick={handleSignIn}>
                  <Button
                    variant="outline"
                    className="w-full glassmorphism border-gray-500 text-gray-200 hover:bg-white/10 hover:border-gray-400 transition-all duration-300 py-3 font-semibold"
                    data-testid="button-signin-from-course"
                  >
                    <i className="fas fa-sign-in-alt mr-2"></i>
                    Already Have Account? Sign In
                  </Button>
                </Link>
              </div>
            ) : !user?.isVerified ? (
              <div className="text-center">
                <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 mb-4">
                  <i className="fas fa-clock text-yellow-400 mb-2"></i>
                  <h3 className="text-lg font-semibold text-yellow-400 mb-2">Verification Pending</h3>
                  <p className="text-sm text-gray-300">
                    Your email verification is pending. Course access will be granted within 2 days of verification.
                  </p>
                </div>
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="border-gray-600"
                  data-testid="button-close-pending"
                >
                  Got it
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 mb-4">
                  <i className="fas fa-check-circle text-green-400 mb-2"></i>
                  <h3 className="text-lg font-semibold text-green-400 mb-2">Access Granted</h3>
                  <p className="text-sm text-gray-300">
                    You have verified access to this course. Click below to open the Moodle platform.
                  </p>
                </div>
                <Button
                  onClick={() => window.open("#", "_blank")}
                  className="w-full bg-gradient-to-r from-loop-purple to-loop-orange hover:shadow-lg transition-all duration-300"
                  data-testid="button-open-moodle"
                >
                  <i className="fas fa-external-link-alt mr-2"></i>
                  Open Course in Moodle
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <EmailSignupModal 
        isOpen={showEmailSignup} 
        onClose={() => setShowEmailSignup(false)} 
      />
    </>
  );
}
