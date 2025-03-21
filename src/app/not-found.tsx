"use client";

import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center px-6 py-12 relative"
      style={{
        backgroundImage: `url('/pattern-bg.svg'), linear-gradient(135deg, hsl(var(--primary) / 0.05) 0%, hsl(var(--accent) / 0.1) 100%)`,
        backgroundSize: "100px 100px, cover",
      }}
    >
      <div className="max-w-md w-full space-y-8 text-center glass-effect rounded-xl p-8 shadow-soft animate-fade-in">
        {/* 404 Illustration */}
        <div className="relative h-60 w-full flex justify-center items-center animate-float">
          <div className="absolute text-[180px] font-black gradient-text">
            404
          </div>
          <div className="z-10 text-center">
            <svg
              className="h-40 w-40 text-primary"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
        </div>

        <div className="animate-slide-up">
          <h1 className="text-4xl font-extrabold text-foreground">
            Page Not Found
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-sm mx-auto">
            Sorry, we couldn't find the page you're looking for. It might have
            been moved or deleted.
          </p>
        </div>

        <div
          className="mt-10 animate-slide-up"
          style={{ animationDelay: "0.2s" }}
        >
          <Link
            href={`/`}
            className="btn-primary hover-lift inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-medium"
          >
            <FiArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
        </div>
      </div>

      <div
        className="mt-16 text-center border-t border-primary/10 pt-8 w-full max-w-md animate-fade-in"
        style={{ animationDelay: "0.4s" }}
      >
        <p className="text-sm text-muted-foreground">
          If you need assistance, please contact our support team.
        </p>
      </div>
    </div>
  );
}
