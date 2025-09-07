from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import sys
import uuid
import json
import asyncio
import threading
import io
import contextlib
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
sys.path.append('ReadOnlyPdf_Downloader')
from ReadOnlyPdf_Downloader.auto_scroll_browser import scroll_and_download_from_url, scroll_and_download_from_url_with_progress

app = FastAPI()

# CORS 설정 추가
# CORS 설정 - 외부 접속을 위해 더 유연하게 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 외부 접속을 위해 모든 도메인 허용 (운영환경에서는 특정 도메인만 허용 권장)
    allow_credentials=False,  # 쿠키 사용하지 않으므로 False로 설정
    allow_methods=["*"],
    allow_headers=["*"],
)

class URLRequest(BaseModel):
    url: str

progress_data = {}
sent_logs = {}  # 이미 전송된 로그 추적

# print 함수를 패치해서 로그를 캡처
original_print = print
def patched_print(*args, **kwargs):
    # 원본 print 실행
    original_print(*args, **kwargs)
    # 로그 메시지를 callback으로 전달 (현재 세션 ID가 있는 경우)
    if hasattr(patched_print, 'current_callback') and patched_print.current_callback:
        message = ' '.join(str(arg) for arg in args)
        patched_print.current_callback(message)

async def generate_progress_stream(session_id: str):
    """SSE 스트림 생성"""
    print(f"SSE stream started for session: {session_id}")
    sent_logs[session_id] = set()  # 해당 세션에서 이미 전송된 로그 추적
    
    # 초기 연결 확인을 위한 메시지
    yield f"data: {json.dumps({'session_id': session_id, 'status': 'connected', 'log': 'SSE 연결 성공'})}\n\n"
    
    last_data = None
    while True:
        if session_id in progress_data:
            data = progress_data[session_id]
            
            # 새로운 데이터일 때만 전송
            if data != last_data:
                print(f"SSE sending new data: {data}")
                yield f"data: {json.dumps(data)}\n\n"
                last_data = data.copy()
            
            if data.get('completed') or data.get('error'):
                print(f"SSE stream ending for session: {session_id}")
                # 전송된 로그 추적 정리
                if session_id in sent_logs:
                    del sent_logs[session_id]
                break
        
        await asyncio.sleep(0.5)

@app.get("/stream-progress/{session_id}")
async def stream_progress(session_id: str):
    """실시간 진행도 스트림"""
    return StreamingResponse(
        generate_progress_stream(session_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
        }
    )

@app.post("/process-url")
async def process_url(request: URLRequest):
    try:
        url = request.url
        session_id = str(uuid.uuid4())[:8]
        
        # 진행상황 초기화
        progress_data[session_id] = {
            "session_id": session_id,
            "status": "starting",
            "progress": 0,
            "message": "작업을 시작합니다...",
            "completed": False,
            "error": None
        }
        print(f"Progress data initialized for session {session_id}: {progress_data[session_id]}")
        
        def progress_callback(log_message):
            """백엔드 로그를 그대로 전달하는 콜백 함수"""
            # print 하지 않고 직접 progress_data에 저장
            progress_data[session_id] = {
                "session_id": session_id,
                "log": log_message,
                "completed": False,
                "error": None
            }
        
        # 즉시 세션 정보 반환
        response_data = {
            "session_id": session_id,
            "success": True,
            "message": "작업이 시작되었습니다. 진행상황을 확인하세요.",
            "download_url": f"/download-pdf/{session_id}"
        }
        
        # 백그라운드에서 작업 실행
        def background_task():
            try:
                progress_callback("🚀 작업을 시작합니다...")
                progress_callback(f"📄 URL: {url}")
                
                # 진행상황 콜백과 stdout 모두 캡처하는 래퍼 함수
                def combined_progress_callback(*args):
                    try:
                        if len(args) == 1:
                            # 단일 메시지 (로그)
                            progress_callback(args[0])
                        elif len(args) == 3:
                            # progress_callback(status, progress, message) 형태
                            status, prog, message = args
                            progress_callback(f"📊 [{status}] {message} ({prog}%)")
                        else:
                            # 기타 형태
                            progress_callback(str(args))
                    except Exception as e:
                        # 콜백 에러 방지
                        pass
                
                # 진행상황 콜백이 있는 함수 사용 (print 패치 없이)
                result = scroll_and_download_from_url_with_progress(url, combined_progress_callback)
                
                if result['success']:
                    progress_callback("✅ 작업이 성공적으로 완료되었습니다!")
                    
                    # 완료 상태 업데이트
                    progress_data[session_id] = {
                        "session_id": session_id,
                        "log": "✅ PDF 생성이 완료되었습니다!",
                        "completed": True,
                        "error": None,
                        "pdf_path": result['pdf_path']
                    }
                else:
                    error_msg = result.get('error', 'Unknown error')
                    progress_callback(f"❌ 오류 발생: {error_msg}")
                    
                    progress_data[session_id] = {
                        "session_id": session_id,
                        "log": f"❌ 오류: {error_msg}",
                        "completed": True,
                        "error": error_msg
                    }
                    
            except Exception as e:
                error_msg = str(e)
                progress_callback(f"❌ 예외 발생: {error_msg}")
                
                progress_data[session_id] = {
                    "session_id": session_id,
                    "log": f"❌ 예외 발생: {error_msg}",
                    "completed": True,
                    "error": error_msg
                }
        
        # 백그라운드 스레드로 시작 (asyncio 대신)
        thread = threading.Thread(target=background_task)
        thread.daemon = True
        thread.start()
        
        return response_data
    
    except Exception as e:
        # 에러 상태 업데이트
        if 'session_id' in locals():
            progress_data[session_id] = {
                "session_id": session_id,
                "status": "error", 
                "progress": 0,
                "message": f"오류: {str(e)}",
                "completed": True,
                "error": str(e)
            }
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/download-pdf/{session_id}")
async def download_pdf(session_id: str):
    """PDF 파일 다운로드"""
    if session_id in progress_data:
        data = progress_data[session_id]
        if data.get('pdf_path') and os.path.exists(data['pdf_path']):
            return FileResponse(
                path=data['pdf_path'],
                filename=os.path.basename(data['pdf_path']),
                media_type="application/pdf"
            )
    
    raise HTTPException(status_code=404, detail="PDF file not found")

@app.get("/")
async def root():
    return {"message": "FastAPI Docker Service"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)