import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapPinIcon, MenuIcon, LogOutIcon, UserIcon } from "lucide-react";
import { Button } from "./Button";
import { useSectionScroll } from "../utils/useSectionScroll";
import { useAuth } from "../lib/auth";

export function Navbar() {
  const scrollToSection = useSectionScroll();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border-subtle bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="font-heading text-2xl font-semibold text-primary">
            Safe Methods
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <button
            onClick={() => scrollToSection("services")}
            className="text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            Services
          </button>
          <button
            onClick={() => scrollToSection("contact")}
            className="text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            Contact
          </button>
          <button
            onClick={() => scrollToSection("blog")}
            className="text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            Blog
          </button>
        </nav>

        <div className="flex items-center gap-4 md:gap-6">
          <div className="hidden sm:flex items-center gap-1 text-muted-foreground">
            <MapPinIcon className="w-4 h-4" />
            <span className="text-xs font-medium">Canada</span>
          </div>

          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden sm:flex items-center gap-2 text-sm text-foreground">
                <UserIcon className="w-4 h-4 text-primary" />
                {user.email}
              </span>
              <Link to="/account" className="hidden sm:block">
                <Button variant="ghost" size="sm">
                  My Account
                </Button>
              </Link>
              <Button variant="secondary" size="sm" onClick={handleSignOut}>
                <LogOutIcon className="w-4 h-4 mr-1.5" />
                Log Out
              </Button>
            </div>
          ) : (
            <div className="hidden sm:block">
              <Link to="/login">
                <Button variant="secondary" size="sm">
                  Login
                </Button>
              </Link>
            </div>
          )}

          <button className="md:hidden p-2 text-foreground" aria-label="Menu">
            <MenuIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
