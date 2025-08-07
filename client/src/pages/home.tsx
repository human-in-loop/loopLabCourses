import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import CourseCard from "@/components/course-card";
import EmailSignupModal from "@/components/email-signup-modal";
import { Course } from "@shared/schema";
import logoPath from "@assets/logo_1754607126595.png";

export default function Home() {
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  
  const { data: courses, isLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const toggleFAQ = (faqId: string) => {
    const content = document.querySelector(`[data-faq-content="${faqId}"]`);
    const icon = document.querySelector(`[data-faq="${faqId}"] i`);
    
    if (content && icon) {
      if (content.classList.contains('hidden')) {
        content.classList.remove('hidden');
        (icon as HTMLElement).style.transform = 'rotate(180deg)';
      } else {
        content.classList.add('hidden');
        (icon as HTMLElement).style.transform = 'rotate(0deg)';
      }
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-loop-purple/20 via-loop-dark to-loop-orange/20"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-loop-purple/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-loop-orange/20 rounded-full blur-3xl animate-float" style={{animationDelay: '-3s'}}></div>
        
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <motion.h1 
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Master <span className="gradient-text">AI-Powered</span><br />
            Software Development
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Learn cutting-edge development practices with large language models, automated testing, and modern AI tooling from industry pioneers.
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <button 
              className="bg-gradient-to-r from-loop-purple to-loop-orange px-8 py-4 rounded-full text-lg font-semibold hover:shadow-lg hover:shadow-loop-purple/25 transform hover:scale-105 transition-all duration-300 animate-glow"
              onClick={() => document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' })}
              data-testid="button-browse-courses"
            >
              Browse Courses
            </button>
            <button 
              className="glassmorphism px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/10 transition-all duration-300"
              onClick={() => setIsEmailModalOpen(true)}
              data-testid="button-get-updates"
            >
              <i className="fas fa-envelope mr-2"></i>
              Get Updates
            </button>
          </motion.div>
        </div>
      </section>

      {/* Courses Section */}
      <section id="courses" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">Featured Courses</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Comprehensive programs designed to transform your development skills with AI-powered tools and modern practices.
            </p>
          </motion.div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="glassmorphism p-8 rounded-2xl animate-pulse">
                  <div className="w-full h-48 bg-gray-700 rounded-xl mb-4"></div>
                  <div className="h-6 bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-700 rounded mb-4"></div>
                  <div className="h-20 bg-gray-700 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <motion.div 
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              {courses?.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <CourseCard course={course} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-loop-surface/30">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why Choose <span className="gradient-text">Loop Lab</span>?
            </h2>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: "fas fa-brain",
                title: "AI-First Learning", 
                description: "Learn with and about AI tools that are reshaping software development",
                gradient: "from-loop-purple to-loop-orange"
              },
              {
                icon: "fas fa-users",
                title: "Industry Experts",
                description: "Learn from pioneers building the tools that are transforming the industry", 
                gradient: "from-loop-orange to-loop-accent"
              },
              {
                icon: "fas fa-project-diagram",
                title: "Hands-on Projects",
                description: "Build real applications using cutting-edge AI development workflows",
                gradient: "from-loop-accent to-loop-purple"
              },
              {
                icon: "fas fa-certificate", 
                title: "Certification",
                description: "Earn recognized credentials for modern software development skills",
                gradient: "from-loop-purple to-loop-orange"
              }
            ].map((feature, index) => (
              <motion.div 
                key={feature.title}
                className="text-center group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  <i className={`${feature.icon} text-2xl text-white`}></i>
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Meet Our <span className="gradient-text">Team</span>
            </h2>
            <p className="text-xl text-gray-300">
              Learn from industry leaders and AI development pioneers
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                name: "Mihail Eric",
                role: "Lead Instructor",
                color: "text-loop-purple",
                description: "AI researcher and software development expert pioneering modern development practices",
                image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300"
              },
              {
                name: "Sarah Chen",
                role: "Senior TA", 
                color: "text-loop-orange",
                description: "Machine learning engineer specializing in code generation and AI tooling",
                image: "https://images.unsplash.com/photo-1494790108755-2616b612c1ec?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=300"
              },
              {
                name: "Alex Rodriguez",
                role: "TA",
                color: "text-loop-accent", 
                description: "Full-stack developer with expertise in AI-powered development workflows",
                image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300"
              },
              {
                name: "Jordan Kim",
                role: "TA",
                color: "text-loop-purple",
                description: "DevOps engineer focused on AI-enhanced deployment and testing automation", 
                image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300"
              }
            ].map((member, index) => (
              <motion.div 
                key={member.name}
                className="glassmorphism p-6 rounded-2xl text-center hover:bg-white/5 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <img src={member.image} alt={member.name} className="w-24 h-24 rounded-full mx-auto mb-4 object-cover" />
                <h3 className="text-xl font-bold mb-2" data-testid={`text-team-name-${index}`}>{member.name}</h3>
                <p className={`mb-2 ${member.color}`}>{member.role}</p>
                <p className="text-sm text-gray-400 mb-4">{member.description}</p>
                <div className="flex justify-center space-x-3">
                  <a href="#" className="text-gray-400 hover:text-loop-purple transition-colors" data-testid={`link-linkedin-${index}`}>
                    <i className="fab fa-linkedin"></i>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-loop-purple transition-colors" data-testid={`link-github-${index}`}>
                    <i className="fab fa-github"></i>
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 bg-loop-surface/30">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">Frequently Asked</span> Questions
            </h2>
          </motion.div>

          <div className="space-y-4">
            {[
              {
                id: "prerequisites",
                question: "What programming experience do I need?",
                answer: "CS111 equivalent programming experience is required. CS221/229 is recommended but not mandatory. The course assumes familiarity with basic programming concepts and focuses on modern AI-enhanced development practices."
              },
              {
                id: "ai-tools", 
                question: "Do I need prior experience with AI development tools?",
                answer: "No prior experience with AI tools like GitHub Copilot is required. We start with fundamentals and progressively build to advanced usage. However, strong programming fundamentals are essential for success."
              },
              {
                id: "access",
                question: "How do I access course materials?", 
                answer: "After email registration, you'll receive access to our Moodle platform containing all course materials, assignments, and resources. Course access is granted within 2 days of signup verification."
              },
              {
                id: "time",
                question: "What is the time commitment?",
                answer: "Expect 10-12 hours per week including lectures, assignments, and project work. The hands-on nature requires time for experimentation with new tools and technologies."
              }
            ].map((faq, index) => (
              <motion.div 
                key={faq.id}
                className="glassmorphism rounded-2xl overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <button 
                  className="w-full px-8 py-6 text-left flex justify-between items-center hover:bg-white/5 transition-colors"
                  onClick={() => toggleFAQ(faq.id)}
                  data-faq={faq.id}
                  data-testid={`button-faq-${faq.id}`}
                >
                  <span className="text-lg font-semibold">{faq.question}</span>
                  <i className="fas fa-chevron-down transition-transform duration-300"></i>
                </button>
                <div className="px-8 pb-6 text-gray-300 hidden" data-faq-content={faq.id} data-testid={`text-faq-answer-${faq.id}`}>
                  <p>{faq.answer}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your <br /><span className="gradient-text">Development Skills?</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of developers learning to build the future with AI-powered tools and modern development practices.
          </p>
          <button 
            className="bg-gradient-to-r from-loop-purple to-loop-orange px-8 py-4 rounded-full text-lg font-semibold hover:shadow-lg hover:shadow-loop-purple/25 transform hover:scale-105 transition-all duration-300 animate-glow"
            onClick={() => setIsEmailModalOpen(true)}
            data-testid="button-start-learning"
          >
            <i className="fas fa-rocket mr-2"></i>
            Start Learning Today
          </button>
        </motion.div>
      </section>

      <EmailSignupModal isOpen={isEmailModalOpen} onClose={() => setIsEmailModalOpen(false)} />
    </>
  );
}
