import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Check if user is already authenticated
  const { data: user } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  const signUpMutation = useMutation({
    mutationFn: async (data: { email: string; name: string }) => {
      const response = await apiRequest("POST", "/api/auth/signup", data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Account created successfully!",
        description: data.message || "Please check your email to verify your account.",
      });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: "Signup failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const signInMutation = useMutation({
    mutationFn: async (data: { email: string }) => {
      const response = await apiRequest("POST", "/api/auth/signin", data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Welcome back!",
        description: "You have been signed in successfully.",
      });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: "Sign in failed",
        description: error.message || "Please check your email and try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    if (isSignUp) {
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
    } else {
      const email = formData.get("email") as string;
      
      if (!email) {
        toast({
          title: "Email required",
          description: "Please enter your email address.",
          variant: "destructive",
        });
        return;
      }
      
      signInMutation.mutate({ email });
    }
  };

  // Redirect if already authenticated
  if (user) {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen pt-16 px-4 flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-br from-loop-purple/10 via-loop-dark to-loop-orange/10"></div>
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-loop-purple/20 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-loop-orange/10 rounded-full blur-3xl animate-float" style={{animationDelay: '-3s'}}></div>
      
      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Card className="glassmorphism border-gray-700">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-white mb-2">
              {isSignUp ? "Join Loop Lab" : "Welcome Back"}
            </CardTitle>
            <p className="text-gray-300">
              {isSignUp 
                ? "Create an account to access premium courses" 
                : "Sign in to continue your learning journey"
              }
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-sm font-semibold text-gray-200">
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="mt-1 bg-loop-dark/50 border-gray-600 text-white placeholder-gray-400 focus:border-loop-purple focus:ring-loop-purple"
                  placeholder="your@email.com"
                  data-testid="input-email"
                />
              </div>
              
              {isSignUp && (
                <div>
                  <Label htmlFor="name" className="text-sm font-semibold text-gray-200">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="mt-1 bg-loop-dark/50 border-gray-600 text-white placeholder-gray-400 focus:border-loop-purple focus:ring-loop-purple"
                    placeholder="Your Name"
                    data-testid="input-name"
                  />
                </div>
              )}
              
              {isSignUp && (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    className="rounded border-gray-600 text-loop-purple focus:ring-loop-purple bg-loop-dark/50"
                    data-testid="checkbox-terms"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-300">
                    I agree to the terms and conditions
                  </label>
                </div>
              )}
              
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-loop-purple to-loop-orange hover:shadow-lg transition-all duration-300"
                disabled={signUpMutation.isPending || signInMutation.isPending}
                data-testid={isSignUp ? "button-signup" : "button-signin"}
              >
                {(signUpMutation.isPending || signInMutation.isPending) && (
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                )}
                {isSignUp ? "Create Account" : "Sign In"}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-loop-purple hover:text-loop-orange transition-colors"
                data-testid="button-toggle-mode"
              >
                {isSignUp 
                  ? "Already have an account? Sign in" 
                  : "Don't have an account? Sign up"
                }
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
