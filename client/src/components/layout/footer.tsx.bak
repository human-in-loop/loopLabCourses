import { Link } from "wouter";
import logoPath from "@assets/logo_1754607126595.png";

export default function Footer() {
  const footerLinks = {
    courses: [
      { name: "Modern Software Development", href: "/course/modern-software" },
      { name: "AI Coding Agents", href: "/course/ai-agents" },
      { name: "Security & Testing", href: "/course/security-testing" },
    ],
    resources: [
      { name: "Documentation", href: "#" },
      { name: "Community", href: "#" },
      { name: "Support", href: "#" },
      { name: "Blog", href: "#" },
    ],
    social: [
      { name: "Twitter", href: "#", icon: "fab fa-twitter" },
      { name: "LinkedIn", href: "#", icon: "fab fa-linkedin" },
      { name: "GitHub", href: "#", icon: "fab fa-github" },
      { name: "Discord", href: "#", icon: "fab fa-discord" },
    ],
  };

  return (
    <footer className="bg-loop-surface/50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <img 
                src={logoPath} 
                alt="Loop Lab Logo" 
                className="w-8 h-8 rounded-lg object-cover"
              />
              <span className="text-lg font-bold gradient-text">Loop Lab</span>
            </div>
            <p className="text-gray-400 text-sm">
              Transforming software development education through AI-powered learning experiences.
            </p>
          </div>
          
          {/* Courses */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Courses</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {footerLinks.courses.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="hover:text-loop-purple transition-colors" data-testid={`link-footer-course-${link.name.toLowerCase().replace(/\s+/g, '-')}`}>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="hover:text-loop-purple transition-colors" data-testid={`link-footer-resource-${link.name.toLowerCase()}`}>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Social */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Connect</h4>
            <div className="flex space-x-4">
              {footerLinks.social.map((link) => (
                <a 
                  key={link.name}
                  href={link.href} 
                  className="text-gray-400 hover:text-loop-purple transition-colors"
                  data-testid={`link-footer-social-${link.name.toLowerCase()}`}
                >
                  <i className={`${link.icon} text-xl`}></i>
                </a>
              ))}
            </div>
          </div>
        </div>
        
        {/* Bottom */}
        <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm" data-testid="text-copyright">
            © 2024 Human in Loop AI Corp. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-loop-purple transition-colors text-sm" data-testid="link-footer-privacy">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-400 hover:text-loop-purple transition-colors text-sm" data-testid="link-footer-terms">
              Terms of Service
            </a>
            <a href="#" className="text-gray-400 hover:text-loop-purple transition-colors text-sm" data-testid="link-footer-contact">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
