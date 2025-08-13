"use client"

import { useEffect } from "react"
import { CheckCircle, Sparkles } from "lucide-react"

interface SuccessPopupProps {
  show: boolean
  message: string
}

export default function SuccessPopup({ show, message }: SuccessPopupProps) {
  useEffect(() => {
    if (show && typeof window !== "undefined" && window.gsap) {
      const popup = document.querySelector(".success-popup")
      const sparkles = document.querySelectorAll(".sparkle")

      if (popup) {
        // Enhanced popup animation
        window.gsap.fromTo(
          popup,
          {
            scale: 0,
            opacity: 0,
            rotation: -180,
            y: 50,
          },
          {
            scale: 1,
            opacity: 1,
            rotation: 0,
            y: 0,
            duration: 0.6,
            ease: "back.out(1.7)",
            onComplete: () => {
              // Sparkle animation
              window.gsap.to(sparkles, {
                rotation: 360,
                scale: 1.2,
                duration: 0.8,
                stagger: 0.1,
                ease: "power2.out",
                yoyo: true,
                repeat: 1,
              })

              // Exit animation
              window.gsap.to(popup, {
                scale: 0.8,
                opacity: 0,
                y: -30,
                duration: 0.4,
                delay: 2.5,
                ease: "power2.in",
              })
            },
          },
        )
      }
    }
  }, [show])

  if (!show) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="success-popup relative">
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur-xl opacity-30 animate-pulse"></div>

        {/* Main popup */}
        <div className="relative bg-gradient-to-r from-green-600 via-green-500 to-emerald-600 text-white px-8 py-6 rounded-2xl shadow-2xl flex items-center gap-4 max-w-md border border-green-400/20 backdrop-blur-sm">
          {/* Decorative sparkles */}
          <div className="absolute -top-2 -left-2">
            <Sparkles className="h-4 w-4 text-green-300 sparkle" />
          </div>
          <div className="absolute -top-1 -right-2">
            <Sparkles className="h-3 w-3 text-emerald-300 sparkle" />
          </div>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
            <Sparkles className="h-3 w-3 text-green-200 sparkle" />
          </div>

          {/* Success icon with glow */}
          <div className="relative">
            <CheckCircle className="h-8 w-8 flex-shrink-0 text-white" />
            <div className="absolute inset-0 bg-white rounded-full blur-md opacity-30 animate-ping"></div>
          </div>

          {/* Message */}
          <span className="font-semibold text-lg leading-relaxed">{message}</span>

          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shimmer"></div>
        </div>
      </div>
    </div>
  )
}
