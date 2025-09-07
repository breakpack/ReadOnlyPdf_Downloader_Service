# PDF Tools

웹페이지를 자동으로 스크롤하면서 이미지를 다운로드하고 PDF로 변환하는 웹 애플리케이션입니다.

## 📋 개요

이 프로젝트는 읽기 전용 PDF 웹사이트에서 페이지를 자동으로 스크롤하며 이미지를 수집하여 PDF 파일로 변환하는 도구입니다. Next.js 프론트엔드와 FastAPI 백엔드로 구성된 풀스택 웹 애플리케이션입니다.

## 🏗️ 아키텍처

- **프론트엔드**: Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui
- **백엔드**: FastAPI + Python 3.11
- **웹 스크래핑**: Selenium WebDriver (Chrome)
- **PDF 생성**: ReportLab
- **컨테이너화**: Docker + Docker Compose
- **서브모듈**: ReadOnlyPdf_Downloader (핵심 스크래핑 엔진)

## 📁 프로젝트 구조

```
Pdf_tools/
├── docker-compose.yml          # Docker Compose 설정
├── Dockerfile.backend          # 백엔드 Docker 이미지
├── Dockerfile.frontend         # 프론트엔드 Docker 이미지
├── .env                        # 환경 변수 설정
├── downloads/                  # 생성된 PDF 파일 저장소
├── images/                     # 다운로드된 이미지 저장소
├── Pdf_tools_ui/              # Next.js 프론트엔드
│   ├── app/
│   │   └── api/convert/route.ts  # API 라우트 핸들러
│   ├── components/             # UI 컴포넌트
│   ├── package.json
│   └── ...
├── Pdf_tools_Back/            # FastAPI 백엔드
│   ├── main.py                # 메인 FastAPI 애플리케이션
│   ├── requirements.txt       # Python 의존성
│   └── ReadOnlyPdf_Downloader/  # 서브모듈 (핵심 스크래핑 엔진)
└── README.md
```

## 🚀 시작하기

### 사전 요구사항

- Docker & Docker Compose
- Git

### 1. 프로젝트 클론 및 서브모듈 초기화

```bash
git clone <repository-url>
cd Pdf_tools

# 서브모듈 초기화 및 업데이트
git submodule init
git submodule update
```

### 2. 환경 변수 설정

`.env` 파일을 확인하고 필요시 수정하세요:

```env
# 외부 접속용 설정
EXTERNAL_HOST=your-domain.com  # 실제 서버 도메인으로 변경
BACKEND_PORT=8000
FRONTEND_PORT=3001

# 백엔드 URL 설정
FASTAPI_URL=http://backend:8000
NEXT_PUBLIC_API_URL=http://your-domain.com:8000
```

### 3. Docker Compose로 실행

```bash
# 서비스 빌드 및 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f
```

### 4. 접속

- **프론트엔드**: http://localhost:3001
- **백엔드 API**: http://localhost:8000
- **API 문서**: http://localhost:8000/docs

## 📖 사용법

1. 웹 인터페이스에서 변환하고 싶은 웹페이지 URL을 입력
2. 변환 버튼 클릭
3. 실시간 진행 상황 모니터링 (SSE를 통한 실시간 업데이트)
4. 완료되면 PDF 파일 다운로드

## 🔧 주요 기능

### 프론트엔드 (Next.js)
- 반응형 웹 인터페이스
- 실시간 진행 상황 표시 (Server-Sent Events)
- TypeScript + Tailwind CSS
- shadcn/ui 컴포넌트 라이브러리

### 백엔드 (FastAPI)
- RESTful API 엔드포인트
- 비동기 처리 및 백그라운드 작업
- CORS 설정으로 외부 접속 지원
- SSE(Server-Sent Events)를 통한 실시간 진행 상황 스트리밍

### 핵심 스크래핑 엔진 (서브모듈)
- Selenium을 이용한 자동 웹페이지 스크롤
- `page0`, `page1` 형식의 이미지 자동 감지 및 다운로드
- 멀티스레딩 기반 빠른 이미지 다운로드
- 자동 PDF 생성 및 페이지 정렬
- iframe 및 특정 div (`id="contents"`) 지원

## 🛠️ API 엔드포인트

### POST `/process-url`
웹페이지를 처리하여 PDF로 변환

**요청:**
```json
{
  "url": "https://example.com"
}
```

**응답:**
```json
{
  "session_id": "abc12345",
  "success": true,
  "message": "작업이 시작되었습니다.",
  "download_url": "/download-pdf/abc12345"
}
```

### GET `/stream-progress/{session_id}`
실시간 진행 상황 스트림 (SSE)

### GET `/download-pdf/{session_id}`
완성된 PDF 파일 다운로드

## 🔧 개발 환경 설정

### 로컬 개발

**백엔드:**
```bash
cd Pdf_tools_Back
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**프론트엔드:**
```bash
cd Pdf_tools_ui
npm install
npm run dev
```

### 서브모듈 업데이트

```bash
# 서브모듈을 최신 버전으로 업데이트
git submodule update --remote

# 서브모듈 변경사항 커밋
git add Pdf_tools_Back/ReadOnlyPdf_Downloader
git commit -m "Update ReadOnlyPdf_Downloader submodule"
```

## 📦 의존성

### 프론트엔드 (package.json)
- Next.js 14.2.16
- React 18
- TypeScript 5
- Tailwind CSS 4.1.9
- Radix UI 컴포넌트들
- Lucide React 아이콘

### 백엔드 (requirements.txt)
- FastAPI 0.104.1
- Uvicorn 0.24.0
- Selenium 4.15.0
- Pillow 10.0.1
- ReportLab 4.0.4

## 📝 서브모듈: ReadOnlyPdf_Downloader

이 프로젝트는 `ReadOnlyPdf_Downloader`를 서브모듈로 사용합니다. 이 모듈은 웹페이지 스크롤 및 이미지 다운로드의 핵심 기능을 담당합니다.

**주요 특징:**
- 자동 스크롤 및 이미지 감지
- 멀티스레딩 다운로드
- 자동 PDF 생성
- 충돌 방지를 위한 고유 파일명 생성

자세한 사용법은 `Pdf_tools_Back/ReadOnlyPdf_Downloader/README.md`를 참조하세요.

## 🐳 Docker 설정

### 멀티 스테이지 빌드
- **프론트엔드**: Node.js 18 Alpine 기반
- **백엔드**: Python 3.11 Slim 기반 + Chromium 설치

### 볼륨 마운트
- `./downloads`: 생성된 PDF 파일
- `./images`: 다운로드된 이미지 파일

## 🌐 외부 접속 설정

프로덕션 환경에서 외부에서 접속하려면:

1. `.env` 파일의 `EXTERNAL_HOST`를 실제 도메인으로 변경
2. 방화벽에서 포트 개방
3. 리버스 프록시 설정 (선택사항)

## ⚡ 성능 최적화

- 멀티스레딩을 통한 동시 이미지 다운로드
- Docker 이미지 최적화 (slim 베이스 이미지 사용)
- 백그라운드 작업 처리로 논블로킹 API
- SSE를 통한 효율적인 실시간 업데이트

## 🔒 보안 고려사항

- CORS 설정 (운영환경에서는 특정 도메인만 허용 권장)
- 파일 경로 검증
- 세션 기반 접근 제어

## 📄 라이선스

MIT License

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 문의

프로젝트 관련 문의사항이 있으시면 Issues를 통해 연락해 주세요.