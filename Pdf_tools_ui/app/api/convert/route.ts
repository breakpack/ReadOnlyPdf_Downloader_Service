import { type NextRequest, NextResponse } from "next/server"

// FastAPI 백엔드 URL - 서버사이드에서는 내부 네트워크 사용
const FASTAPI_URL = process.env.FASTAPI_URL as string
// 클라이언트에서 접근할 수 있는 외부 URL
const EXTERNAL_API_URL = process.env.NEXT_PUBLIC_API_URL as string

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL이 필요합니다" }, { status: 400 })
    }

    // FastAPI 백엔드로 요청 전달 (새로운 세션 기반 방식)
    const response = await fetch(`${FASTAPI_URL}/process-url`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || `FastAPI 서버 오류: ${response.status}`)
    }

    // 백엔드에서 세션 ID와 함께 응답
    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      sessionId: data.session_id,
      message: data.message,
      downloadUrl: `${EXTERNAL_API_URL}${data.download_url}`, // 외부에서 접근 가능한 URL
    })
  } catch (error) {
    console.error("PDF 변환 오류:", error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "서버 오류가 발생했습니다",
        success: false,
      },
      { status: 500 },
    )
  }
}
