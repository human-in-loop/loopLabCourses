import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import CourseDetail from "@/pages/course-detail";
import CoursePlayer from "@/pages/course-player";
import Auth from "@/pages/auth";
import NotFound from "@/pages/not-found";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminSubmissions from "@/pages/admin-submissions";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/courses/:id" component={CourseDetail} />
      <Route path="/learn/course/:id" component={CoursePlayer} />
      <Route path="/auth" component={Auth} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/submissions" component={AdminSubmissions} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-loop-dark text-white font-inter overflow-x-hidden">
          <Header />
          <main>
            <Router />
          </main>
          <Footer />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
