import Link from "next/link";
import { Github, Twitter, Linkedin, Mail } from "lucide-react";
import Image from "next/image";

export default function Footer() {
  const footerLinks = {
    Product: [
      { name: "Features", href: "#features" },
      { name: "How It Works", href: "#how-it-works" },
      { name: "Use Cases", href: "#use-cases" },
      { name: "API Docs", href: "#" },
    ],
    Company: [
      { name: "About", href: "/about" },
      { name: "Blog", href: "#" },
      { name: "Careers", href: "#" },
      { name: "Contact", href: "#" },
    ],
    Resources: [
      { name: "Documentation", href: "#" },
      { name: "Support", href: "#" },
      { name: "Status", href: "#" },
      { name: "FAQ", href: "#faq" },
    ],
    Legal: [
      { name: "Privacy", href: "#" },
      { name: "Terms", href: "#" },
      { name: "Security", href: "#" },
      { name: "Compliance", href: "#" },
    ],
  };

  const socialLinks = [
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Github, href: "#", label: "GitHub" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Mail, href: "#", label: "Email" },
  ];

  return (
    <footer className="relative py-20 border-t border-border bg-background">
      <div className="container mx-auto px-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-16">
          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-2">
                <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
                <Image
                  src="/images/logo.png"
                  alt="NiyamR Flow"
                  className="rounded-xl relative z-10 transition-transform duration-300 group-hover:scale-105"
                  width={100}
                  height={100}
                />
              </div>
              {/* <span className="text-xl font-bold text-gray-900 hidden sm:block">
                NiyamR Flow
              </span> */}
            </Link>
            <p className="text-sm text-text-secondary mb-6 max-w-sm leading-relaxed">
              Transform your documents into actionable intelligence with our
              AI-powered document processing platform. Enterprise-grade accuracy
              for modern teams.
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  className="w-10 h-10 rounded-xl bg-background-card border border-border hover:border-accent-blue hover:bg-accent-blue/5 flex items-center justify-center transition-all duration-300 group"
                  aria-label={label}
                >
                  <Icon className="w-5 h-5 text-text-muted group-hover:text-accent-blue transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="min-w-0">
              <h4 className="font-semibold mb-4 text-text-primary">
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-secondary hover:text-accent-blue transition-colors inline-block"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-border gap-4">
          <p className="text-sm text-text-muted">
            © {new Date().getFullYear()} NiyamR Flow. All rights reserved.
          </p>
          <p className="text-sm text-text-muted">
            Built with{" "}
            <span className="text-red-500 inline-block animate-pulse">♥</span>{" "}
            for document intelligence
          </p>
        </div>
      </div>
    </footer>
  );
}