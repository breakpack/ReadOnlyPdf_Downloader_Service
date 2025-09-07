"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Download, AlertCircle, RotateCcw } from "lucide-react"
import { useEffect, useRef } from "react"

interface ConversionStatusProps {
  status: "converting" | "success" | "error"
  url?: string
  downloadUrl?: string
  error?: string
  logs?: string[]
  onReset: () => void
  onDownload?: () => void
}

export function ConversionStatus({ 
  status, 
  url, 
  downloadUrl, 
  error, 
  logs = [],
  onReset, 
  onDownload 
}: ConversionStatusProps) {
  const logContainerRef = useRef<HTMLDivElement>(null)

  // 새 로그가 추가될 때마다 자동 스크롤
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
    }
  }, [logs])

  if (status === "converting") {
    return (
      <Card className="w-full max-w-4xl mx-auto bg-card border-border">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-6">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            <div className="text-center space-y-2 w-full">
              <h3 className="text-lg font-semibold text-foreground">PDF 추출 중...</h3>
              <p className="text-sm text-muted-foreground">{url && `${url}에서 PDF를 추출하고 있습니다.`}</p>
            </div>
            
            {/* 실시간 로그 표시 */}
            <div className="w-full space-y-3">
              <h4 className="text-md font-medium text-foreground">실시간 로그:</h4>
              <div 
                ref={logContainerRef}
                className="bg-black/90 rounded-lg p-4 h-64 overflow-y-auto border border-green-500/30"
                style={{ scrollBehavior: 'smooth' }}
              >
                <div className="space-y-1 font-mono text-sm">
                  {logs.map((log, index) => (
                    <div key={index} className="text-green-400">
                      <span className="text-green-600">[{new Date().toLocaleTimeString()}]</span> {log}
                    </div>
                  ))}
                  {logs.length === 0 && (
                    <div className="text-green-400/60">로그를 기다리는 중...</div>
                  )}
                  <div className="text-green-400">█</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (status === "success") {
    return (
      <Card className="w-full max-w-2xl mx-auto bg-card border-border">
        <CardHeader className="text-center">
          <div className="flex justify-center">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <CardTitle className="text-xl font-bold text-foreground">추출 완료!</CardTitle>
          <CardDescription className="text-muted-foreground">PDF 파일이 성공적으로 생성되었습니다</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {url && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">추출된 URL:</p>
              <p className="text-sm font-medium text-foreground break-all">{url}</p>
            </div>
          )}
          <div className="flex gap-2">
            <Button onClick={onDownload} className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground">
              <Download className="w-4 h-4 mr-2" />
              PDF 다운로드
            </Button>
            <Button
              onClick={onReset}
              variant="outline"
              className="border-border text-foreground hover:bg-muted bg-transparent"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              다시 추출
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (status === "error") {
    return (
      <Card className="w-full max-w-2xl mx-auto bg-card border-border">
        <CardHeader className="text-center">
          <div className="flex justify-center">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="text-xl font-bold text-foreground">추출 실패</CardTitle>
          <CardDescription className="text-muted-foreground">PDF 추출 중 오류가 발생했습니다</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
          <Button onClick={onReset} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            <RotateCcw className="w-4 h-4 mr-2" />
            다시 시도
          </Button>
        </CardContent>
      </Card>
    )
  }

  return null
}
