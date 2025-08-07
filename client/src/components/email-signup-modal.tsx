import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface EmailSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EmailSignupModal({ isOpen, onClose }: EmailSignupModalProps) {
  const { toast } = useToast();

  const signUpMutation = useMutation({
    mutationFn: async (data: { email: string; name: string }) => {
      const response = await apiRequest("POST", "/api/auth/signup", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Welcome to Loop Lab!",
        description: "You will receive course access within 2 days of verification.",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Signup failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const name = formData.get("name") as string;
    
    if (!email || !name) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    signUpMutation.mutate({ email, name });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glassmorphism border-gray-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-white mb-2">
            Join Loop Lab
          </DialogTitle>
          <p className="text-center text-gray-300">
            Get access to premium courses and updates
          </p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="signup-email" className="text-sm font-semibold text-gray-200">
              Email Address
            </Label>
            <Input
              id="signup-email"
              name="email"
              type="email"
              required
              className="mt-1 bg-loop-dark/50 border-gray-600 text-white placeholder-gray-400 focus:border-loop-purple focus:ring-loop-purple"
              placeholder="your@email.com"
              data-testid="input-signup-email"
            />
          </div>
          
          <div>
            <Label htmlFor="signup-name" className="text-sm font-semibold text-gray-200">
              Full Name
            </Label>
            <Input
              id="signup-name"
              name="name"
              type="text"
              required
              className="mt-1 bg-loop-dark/50 border-gray-600 text-white placeholder-gray-400 focus:border-loop-purple focus:ring-loop-purple"
              placeholder="Your Name"
              data-testid="input-signup-name"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="signup-terms"
              required
              className="rounded border-gray-600 text-loop-purple focus:ring-loop-purple bg-loop-dark/50"
              data-testid="checkbox-signup-terms"
            />
            <label htmlFor="signup-terms" className="text-sm text-gray-300">
              I agree to the terms and conditions
            </label>
          </div>
          
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-loop-purple to-loop-orange hover:shadow-lg transition-all duration-300"
            disabled={signUpMutation.isPending}
            data-testid="button-signup-modal"
          >
            {signUpMutation.isPending && (
              <i className="fas fa-spinner fa-spin mr-2"></i>
            )}
            Get Access
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
