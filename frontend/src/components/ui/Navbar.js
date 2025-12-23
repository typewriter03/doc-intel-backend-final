'use client';

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);
  const { user, login, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => document.removeEventListener("keydown", handleEscKey);
  }, []);

  const navLinks = [
    { name: "Features", href: "/#features" },
    { name: "How It Works", href: "/#how-it-works" },
    { name: "Use Cases", href: "/#use-cases" },
    { name: "FAQ", href: "/#faq" },
    { name: "About", href: "/about" },
  ];

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500  ${isScrolled
          ? "bg-background-card/80 backdrop-blur-xl border-b border-border shadow-elevated mx-4 md:mx-10 lg:mx-20 mt-4 rounded-2xl"
          : "bg-transparent mx-4 md:mx-10 lg:mx-20 mt-4"
          }`}
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 md:gap-3 group relative z-10">
              <div className="relative">
                <Image
                  src="/images/logo.png"
                  alt="NiyamR Flow"
                  className="rounded-xl transition-transform duration-300 group-hover:scale-105"
                  width={100}
                  height={100}
                  priority
                />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1 absolute left-1/2 transform -translate-x-1/2">
              {navLinks.map((link, index) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="relative px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors group"
                >
                  {link.name}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent-blue group-hover:w-full transition-all duration-300"></span>
                </Link>
              ))}
            </nav>

            {/* Right Side Actions */}
            <div className="hidden lg:flex items-center gap-3">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={logout}
                    className="group relative px-6 py-2.5 rounded-xl bg-background-subtle border border-border hover:bg-background-card text-text-primary font-semibold shadow-soft hover:shadow-elevated transition-all duration-300 hover:scale-105 flex items-center gap-2"
                  >
                    Logout
                  </button>
                  {user.photoURL && (
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-border">
                      <Image src={user.photoURL} alt={user.displayName} width={40} height={40} />
                    </div>
                  )}
                </>
              ) : (
                <button
                  onClick={login}
                  className="group relative px-6 py-2.5 rounded-xl bg-accent-blue hover:bg-accent-blue-soft text-white font-semibold shadow-soft hover:shadow-elevated transition-all duration-300 hover:scale-105 flex items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Sign In
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-background-subtle transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-text-primary" />
              ) : (
                <Menu className="w-6 h-6 text-text-primary" />
              )}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Mobile Menu Panel */}
            <motion.div
              ref={mobileMenuRef}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-background-card shadow-2xl z-50 lg:hidden overflow-y-auto"
            >
              {/* Mobile Menu Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <Link
                  href="/"
                  className="flex items-center gap-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Image
                    src="/images/logo.png"
                    alt="NiyamR Flow"
                    className="rounded-xl"
                    width={50}
                    height={50}
                  />
                  <span className="text-lg font-bold text-text-primary">
                    NiyamR Flow
                  </span>
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-background-subtle transition-colors"
                >
                  <X className="w-6 h-6 text-text-primary" />
                </button>
              </div>

              {/* Mobile Menu Links */}
              <div className="p-6 space-y-1">
                {navLinks.map((link, index) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between px-4 py-3 text-base font-medium text-text-secondary hover:text-text-primary hover:bg-background-subtle rounded-xl transition-all group"
                  >
                    {link.name}
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </Link>
                ))}
              </div>

              {/* Mobile Menu Footer */}
              <div className="p-6 border-t border-border space-y-3">
                <Link
                  href="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full px-6 py-3 rounded-xl bg-accent-blue hover:bg-accent-blue-soft text-white font-semibold shadow-soft hover:shadow-elevated transition-all duration-300 flex items-center justify-center gap-2 group"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Launch App
                </Link>
              </div>

              {/* Decorative Bottom Border */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-accent-blue"></div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
