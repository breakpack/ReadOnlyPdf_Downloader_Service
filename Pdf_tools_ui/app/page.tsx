"use client"

import { useState, useEffect, useRef } from "react"
import { UrlInput } from "@/components/url-input"
import { ConversionStatus } from "@/components/conversion-status"
import { FeatureSection } from "@/components/feature-section"

type ConversionState = "idle" | "converting" | "success" | "error"

interface ProgressData {
  session_id: string
  log?: string
  completed: boolean
  error?: string
  pdf_path?: string
}

export default function HomePage() {
  const [state, setState] = useState<ConversionState>("idle")
  const [currentUrl, setCurrentUrl] = useState("")
  const [downloadUrl, setDownloadUrl] = useState("")
  const [error, setError] = useState("")
  const [logs, setLogs] = useState<string[]>([])
  const [sessionId, setSessionId] = useState("")
  const eventSourceRef = useRef<EventSource | null>(null)

  const handleConvert = async (url: string) => {
    setState("converting")
    setCurrentUrl(url)
    setError("")
    setLogs(["추출을 시작합니다..."])

    try {
      // FastAPI 백엔드 호출 (새로운 세션 기반 방식)
      const response = await fetch("/api/convert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        throw new Error("추출 중 오류가 발생했습니다")
      }

      const data = await response.json()
      setSessionId(data.sessionId)
      setDownloadUrl(data.downloadUrl)
      
      // SSE 연결 시작
      startProgressTracking(data.sessionId)

    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다")
      setState("error")
    }
  }

  const startProgressTracking = (sessionId: string) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    // 환경변수에서 외부 API URL 가져오기
   const backendUrl = process.env.NEXT_PUBLIC_API_URL as string
    const eventSource = new EventSource(`${backendUrl}/stream-progress/${sessionId}`)
    eventSourceRef.current = eventSource

    console.log("Starting SSE connection:", `${backendUrl}/stream-progress/${sessionId}`)

    eventSource.onopen = (event) => {
      console.log("SSE connection opened:", event)
    }

    eventSource.onmessage = (event) => {
      console.log("SSE message received:", event.data)
      try {
        const data: ProgressData = JSON.parse(event.data)
        console.log("Progress data:", data)
        
        // 로그 메시지 추가
        if (data.log) {
          setLogs(prev => [...prev, data.log!])
        }
        
        if (data.completed) {
          if (data.error) {
            setError(data.error)
            setState("error")
          } else {
            setState("success")
          }
          eventSource.close()
        }
      } catch (err) {
        console.error("Progress tracking error:", err)
      }
    }

    eventSource.onerror = (error) => {
      console.error("SSE error:", error)
      console.log("EventSource readyState:", eventSource.readyState)
      eventSource.close()
    }
  }

  const handleDownload = () => {
    if (downloadUrl) {
      // 새 창에서 다운로드 링크 열기
      window.open(downloadUrl, '_blank')
    }
  }

  const handleReset = () => {
    setState("idle")
    setCurrentUrl("")
    setDownloadUrl("")
    setError("")
    setLogs([])
    setSessionId("")
    
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
  }

  // 컴포넌트 언마운트 시 SSE 연결 정리
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-center text-foreground">URL to PDF 추출기</h1>
          <p className="text-center text-muted-foreground mt-2">웹페이지 에서 빠르게 PDF를 추출하세요</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 space-y-16">
        {/* Conversion Section */}
        <section className="flex justify-center">
          {state === "idle" ? (
            <UrlInput onConvert={handleConvert} isLoading={false} />
          ) : (
            <ConversionStatus
              status={state}
              url={currentUrl}
              downloadUrl={downloadUrl}
              error={error}
              logs={logs}
              onReset={handleReset}
              onDownload={handleDownload}
            />
          )}
        </section>

        {/* Features Section */}
        {state === "idle" && <FeatureSection />}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 mt-16">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground">© 2024 URL to PDF 추출. FastAPI 백엔드와 함께 구동됩니다.</p>
        </div>
      </footer>
    </div>
  )
}
