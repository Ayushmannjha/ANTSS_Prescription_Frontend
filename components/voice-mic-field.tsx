"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

type VoiceMicFieldProps = {
  isListening: boolean
  isProcessing: boolean
  isActive: boolean
  onMicToggle: () => void
  variant?: "field" | "section"
  children: React.ReactElement<{ className?: string }>
}

export function VoiceMicField({
  isListening,
  isProcessing,
  isActive,
  onMicToggle,
  variant = "field",
  children,
}: VoiceMicFieldProps) {
  const icon = isProcessing ? (
    <Loader2 className="h-3 w-3 animate-spin" />
  ) : isListening && isActive ? (
    <MicOff className="h-3 w-3" />
  ) : (
    <Mic className="h-3 w-3" />
  )

  const micButton = (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onMicToggle}
      disabled={isProcessing}
      title={isListening && isActive ? "Stop voice input" : "Start voice input"}
      className={cn(
        "voice-mic-field__button h-5 w-5 shrink-0 rounded-full border p-0 shadow-none transition-all",
        isListening && isActive
          ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
          : "border-slate-200 bg-white text-slate-400 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600",
        isProcessing && "border-blue-200 bg-blue-50 text-blue-600"
      )}
      aria-label={isListening && isActive ? "Stop voice input" : "Start voice input"}
    >
      {icon}
    </Button>
  )

  if (variant === "field") {
    return children
  }

  if (variant === "section") {
    return (
      <span className="voice-mic-section inline-flex max-w-full items-center gap-2 align-middle">
        {children}
        {micButton}
      </span>
    )
  }

  return children
}
