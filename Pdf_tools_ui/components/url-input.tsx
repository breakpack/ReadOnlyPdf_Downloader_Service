"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Globe, FileText } from "lucide-react"

interface UrlInputProps {
  onConvert: (url: string) => void
  isLoading: boolean
}

export function UrlInput({ onConvert, isLoading }: UrlInputProps) {
  const [url, setUrl] = useState("")
  const [error, setError] = useState("")

  const validateUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!url.trim()) {
      setError("URL을 입력해주세요")
      return
    }

    if (!validateUrl(url)) {
      setError("올바른 URL 형식을 입력해주세요 (예: https://example.com)")
      return
    }

    onConvert(url)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto bg-card border-border">
      <CardHeader className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-primary">
          <Globe className="h-8 w-8" />
          <FileText className="h-8 w-8" />
        </div>
        <CardTitle className="text-2xl font-bold text-foreground">URL에서 PDF로 추출</CardTitle>
        <CardDescription className="text-muted-foreground">
          웹페이지 URL을 입력하면 PDF 파일로 추출해드립니다
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="h-12 text-lg bg-input border-border focus:ring-ring"
              disabled={isLoading}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <Button
            type="submit"
            className="w-full h-12 text-lg bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={isLoading || !url.trim()}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                추출 중...
              </div>
            ) : (
              "PDF로 변환"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
