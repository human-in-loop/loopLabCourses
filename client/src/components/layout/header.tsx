import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import logoPath from "@assets/logo_1754607126595.png";

export default function Header() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { toast } = useToast();

  const { data: user } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  const signOutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/signout");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Signed out successfully",
        description: "Come back soon!",
      });
    },
  });

  const navigationItems = [
    { href: "/#courses", label: "Courses" },
    { href: "/#team", label: "Team" },
    { href: "/#faq", label: "FAQ" },
  ];

  const handleNavClick = (href: string) => {
    setIsMobileMenuOpen(false);
    
    if (href.startsWith('/#')) {
      const elementId = href.substring(2);
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <motion.nav 
      className="fixed top-0 w-full z-50 glassmorphism"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity" data-testid="link-logo">
            <img 
              src={logoPath} 
              alt="Loop Lab Logo" 
              className="w-10 h-10 rounded-lg object-cover"
            />
            <span className="text-xl font-bold gradient-text">The Loop Lab Course</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <button
                key={item.href}
                onClick={() => handleNavClick(item.href)}
                className="text-gray-300 hover:text-loop-purple transition-colors cursor-pointer"
                data-testid={`link-nav-${item.label.toLowerCase()}`}
              >
                {item.label}
              </button>
            ))}
            
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-300" data-testid="text-user-name">
                  Welcome, {user?.user?.name}
                </span>
                {!user?.user?.isVerified && (
                  <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full" data-testid="badge-unverified">
                    Pending Verification
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOutMutation.mutate()}
                  disabled={signOutMutation.isPending}
                  data-testid="button-signout"
                >
                  {signOutMutation.isPending ? (
                    <i className="fas fa-spinner fa-spin"></i>
                  ) : (
                    "Sign Out"
                  )}
                </Button>
              </div>
            ) : (
              <Link href="/auth">
                <Button 
                  className="bg-gradient-to-r from-loop-purple to-loop-orange px-6 py-2 rounded-full hover:shadow-lg hover:shadow-loop-purple/25 transition-all duration-300"
                  data-testid="button-signin-header"
                >
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" className="md:hidden text-white" data-testid="button-mobile-menu">
                <i className="fas fa-bars"></i>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="glassmorphism border-gray-700">
              <div className="flex flex-col space-y-4 mt-8">
                {navigationItems.map((item) => (
                  <button
                    key={item.href}
                    onClick={() => handleNavClick(item.href)}
                    className="text-gray-300 hover:text-loop-purple transition-colors text-left"
                    data-testid={`link-mobile-${item.label.toLowerCase()}`}
                  >
                    {item.label}
                  </button>
                ))}
                
                <div className="border-t border-gray-700 pt-4">
                  {user ? (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-300" data-testid="text-mobile-user-name">
                        Welcome, {user?.user?.name}
                      </p>
                      {!user?.user?.isVerified && (
                        <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full inline-block" data-testid="badge-mobile-unverified">
                          Pending Verification
                        </span>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          signOutMutation.mutate();
                          setIsMobileMenuOpen(false);
                        }}
                        disabled={signOutMutation.isPending}
                        className="w-full border-gray-600"
                        data-testid="button-mobile-signout"
                      >
                        {signOutMutation.isPending ? (
                          <i className="fas fa-spinner fa-spin"></i>
                        ) : (
                          "Sign Out"
                        )}
                      </Button>
                    </div>
                  ) : (
                    <Link href="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button 
                        className="w-full bg-gradient-to-r from-loop-purple to-loop-orange"
                        data-testid="button-mobile-signin"
                      >
                        Sign In
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.nav>
  );
}
