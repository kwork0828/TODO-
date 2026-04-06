# 할일플래너 — 스마트 일정 관리

<p align="center">
  <img alt="React" src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white&style=flat-square" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white&style=flat-square" />
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white&style=flat-square" />
  <img alt="MongoDB" src="https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white&style=flat-square" />
  <img alt="Google Sheets" src="https://img.shields.io/badge/Google%20Sheets-API%20v4-34A853?logo=google-sheets&logoColor=white&style=flat-square" />
  <img alt="Vercel" src="https://img.shields.io/badge/Frontend-Vercel-000000?logo=vercel&logoColor=white&style=flat-square" />
  <img alt="Railway" src="https://img.shields.io/badge/Backend-Railway-0B0D0E?logo=railway&logoColor=white&style=flat-square" />
  <img alt="License" src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" />
</p>

> 구글 시트 양방향 연동 · 캘린더 뷰 · 카테고리별 관리 · 마감 자동 감지 · PWA 지원

---

## 스크린샷

> `client/public/screenshots/` 폴더에 스크린샷을 추가하세요.

---

## 주요 기능

| 기능 | 설명 |
|------|------|
| 📅 **캘린더 뷰** | 월/주/일 단위 일정 확인, 기간 태스크 바 표시 |
| 📋 **태스크 관리** | 생성·수정·삭제, 우선순위(긴급/높음/보통/낮음), 상태 관리 |
| 🏷️ **카테고리** | 탭별 분류, 구글 시트 탭과 1:1 연동 |
| 🔴 **자동 마감 초과** | 서버 시작 시·매 시간·조회 시 자동 overdue 처리 |
| 📊 **대시보드 통계** | 전체·초과·오늘·이번 주 마감, 완료율, 전주 대비 증감 |
| 🔗 **구글 시트 동기화** | 30초 폴링 + 수동 Push/Pull, LWW 충돌 해결 |
| 🌙 **다크 모드** | 토글 방식 |
| 📱 **반응형 디자인** | 360px+ 모든 화면, 모바일 슬라이드 메뉴 |
| ⚡ **PWA** | 오프라인 뷰, 홈 화면 추가 가능 |

---

## 기술 스택

| 레이어 | 기술 |
|--------|------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, FullCalendar 6 |
| **Backend** | Node.js 20, Express, TypeScript, express-rate-limit, compression |
| **Database** | MongoDB (Atlas M0 free tier) |
| **외부 연동** | Google Sheets API v4 |
| **인프라** | Docker, Docker Compose, Nginx |
| **CI/CD** | GitHub Actions → Vercel (frontend) + Railway (backend) |

---

## 배포 아키텍처

```
GitHub (main branch)
       │
       ├─ GitHub Actions ──┬─▶ Vercel  (React SPA, CDN 서빙)
       │                   └─▶ Railway (Express API)
       │                              │
       │                         MongoDB Atlas (M0)
       │
       └─ PR push ──▶ Vercel Preview (자동 프리뷰 URL)
```

---

## 로컬 개발 환경

### 사전 요구 사항

- Node.js 20+
- Docker Desktop (MongoDB 로컬 실행용)
- 구글 서비스 계정 키 파일

### 설치 & 실행

```bash
# 1. 저장소 클론
git clone https://github.com/YOUR_USERNAME/halil-planner.git
cd halil-planner

# 2. MongoDB 실행
docker run -d -p 27017:27017 --name mongo mongo:7

# 3. 서버 환경변수 설정
cp server/.env.example server/.env
# server/.env 파일을 열어 값 입력

# 4. 서버 실행
cd server && npm install && npm run dev

# 5. 클라이언트 실행 (새 터미널)
cd client && npm install && npm run dev
```

| 서비스 | URL |
|--------|-----|
| 클라이언트 | http://localhost:5173 |
| API 서버 | http://localhost:5000 |

---

## Docker로 실행 (전체 스택)

```bash
cp server/.env.example server/.env
# server/.env 편집 후

docker compose up --build
```

| 서비스 | URL |
|--------|-----|
| 웹 앱 | http://localhost |
| API 서버 | http://localhost:5000 |

---

## 환경 변수

### 서버 (`server/.env`)

| 변수 | 필수 | 설명 | 예시 |
|------|------|------|------|
| `PORT` | ✅ | 서버 포트 | `5000` |
| `NODE_ENV` | ✅ | 실행 환경 | `production` |
| `MONGO_URI` | ✅ | MongoDB 연결 문자열 | `mongodb+srv://...` |
| `CLIENT_URL` | ✅ | 프론트엔드 URL (CORS) | `https://halil-planner.vercel.app` |
| `GOOGLE_SHEETS_ID` | ⚠️ | 스프레드시트 ID | `1BxiMVs0...` |
| `GOOGLE_CLIENT_EMAIL` | ⚠️ | 서비스 계정 이메일 | `bot@project.iam.gserviceaccount.com` |
| `GOOGLE_PRIVATE_KEY` | ⚠️ | 서비스 계정 비밀키 | `"-----BEGIN PRIVATE KEY-----\n..."` |

> ⚠️ 구글 시트 연동 없이도 앱은 동작합니다 (`GOOGLE_SHEETS_ID` 미설정 시 동기화 비활성화)

### 클라이언트 (Vercel 환경변수)

| 변수 | 설명 | 예시 |
|------|------|------|
| `VITE_API_URL` | Railway 백엔드 URL | `https://halil-planner-api.railway.app` |

---

## 프로덕션 배포 가이드

### 1단계 — MongoDB Atlas 설정

1. [MongoDB Atlas](https://cloud.mongodb.com) 계정 생성
2. 무료 클러스터 생성 (M0 Sandbox)
3. **Database Access** → 사용자 추가 (비밀번호 저장)
4. **Network Access** → `0.0.0.0/0` 추가 (Railway IP 동적 할당 대응)
5. **Connect** → 연결 문자열 복사: `mongodb+srv://<user>:<pass>@cluster.mongodb.net/todo-schedule`

### 2단계 — Railway 백엔드 배포

1. [Railway](https://railway.app) 계정 생성 후 GitHub 연동
2. **New Project** → Deploy from GitHub → 이 저장소의 `server/` 폴더 선택
3. **Variables** 탭에서 환경변수 추가:
   ```
   NODE_ENV=production
   PORT=5000
   MONGO_URI=<Atlas 연결 문자열>
   CLIENT_URL=https://<your-app>.vercel.app
   GOOGLE_SHEETS_ID=<선택>
   GOOGLE_CLIENT_EMAIL=<선택>
   GOOGLE_PRIVATE_KEY=<선택>
   ```
4. **Settings** → Public Domain 생성 → URL 기록 (Vercel 설정에 필요)

### 3단계 — Vercel 프론트엔드 배포

1. [Vercel](https://vercel.com) 계정 생성 후 GitHub 연동
2. **New Project** → Import → `client/` 폴더 선택
3. **Environment Variables** 추가:
   ```
   VITE_API_URL=https://<railway-url>.railway.app
   ```
4. **Deploy** → 완료 후 URL 기록

### 4단계 — GitHub Actions 비밀값 설정

저장소 → **Settings** → **Secrets and variables** → **Actions** → New repository secret:

| Secret 이름 | 값 | 얻는 곳 |
|-------------|-----|---------|
| `VERCEL_TOKEN` | Vercel API 토큰 | Vercel → Settings → Tokens |
| `VERCEL_ORG_ID` | Vercel 조직 ID | `vercel whoami --token=<token>` |
| `VERCEL_PROJECT_ID` | Vercel 프로젝트 ID | `.vercel/project.json` 또는 Vercel 대시보드 |
| `RAILWAY_TOKEN` | Railway API 토큰 | Railway → Account → Tokens |
| `RAILWAY_PUBLIC_URL` | Railway 도메인 (https 제외) | Railway → Settings → Domain |
| `VITE_API_URL` | Railway 전체 URL | `https://<domain>.railway.app` |

#### Vercel ID 확인 방법

```bash
npm install -g vercel
vercel login
cd client
vercel link       # .vercel/project.json 생성됨
cat .vercel/project.json
# {"orgId":"team_xxx","projectId":"prj_xxx"}
```

---

## 커스텀 도메인 설정

### Vercel (프론트엔드)

1. Vercel 프로젝트 → **Settings** → **Domains**
2. `yourdomain.com` 입력 → Add
3. DNS 레코드 추가:
   ```
   Type: A       Name: @       Value: 76.76.21.21
   Type: CNAME   Name: www     Value: cname.vercel-dns.com
   ```
4. SSL 인증서는 자동 발급됩니다.

### Railway (백엔드 API 서브도메인)

`api.yourdomain.com`을 Railway 서비스에 연결:

1. Railway 프로젝트 → **Settings** → **Networking** → Custom Domain
2. `api.yourdomain.com` 입력
3. DNS에 CNAME 레코드 추가:
   ```
   Type: CNAME   Name: api   Value: <railway-provided-target>
   ```
4. 완료 후 `CLIENT_URL`을 `https://yourdomain.com`으로, `VITE_API_URL`을 `https://api.yourdomain.com`으로 업데이트

---

## CI/CD 워크플로우

| 이벤트 | 동작 |
|--------|------|
| **PR 생성/업데이트** | 린트 + 타입체크 + 빌드 검증 + Vercel 프리뷰 배포 |
| **`develop` 브랜치 push** | 린트 + 타입체크 + 빌드 검증 |
| **`main` 브랜치 push** | 빌드 게이트 → Vercel 프로덕션 배포 + Railway 배포 → 헬스체크 |

---

## API 엔드포인트

### 태스크
| 메서드 | 경로 | 설명 |
|--------|------|------|
| `GET` | `/api/tasks` | 목록 조회 (`?category=&status=&priority=&sort=newest\|oldest\|dueSoon\|priority`) |
| `POST` | `/api/tasks` | 생성 |
| `PUT` | `/api/tasks/:id` | 수정 |
| `DELETE` | `/api/tasks/:id` | 삭제 |
| `GET` | `/api/tasks/calendar` | 캘린더용 (`?month=2026-04`) |
| `GET` | `/api/tasks/stats` | 통계 |

### 카테고리
| 메서드 | 경로 | 설명 |
|--------|------|------|
| `GET` | `/api/categories` | 목록 |
| `POST` | `/api/categories` | 생성 |
| `PUT` | `/api/categories/:id` | 수정 |
| `DELETE` | `/api/categories/:id` | 삭제 |

### 동기화 & 시스템
| 메서드 | 경로 | 설명 |
|--------|------|------|
| `POST` | `/api/sync/push` | DB → 시트 |
| `POST` | `/api/sync/pull` | 시트 → DB |
| `GET` | `/api/sync/status` | 동기화 상태 |
| `GET` | `/api/dashboard/stats` | 대시보드 통계 |
| `GET` | `/api/health` | 헬스체크 |

---

## 프로젝트 구조

```
.
├── .github/
│   ├── workflows/
│   │   ├── ci.yml          # PR: 린트·빌드·프리뷰
│   │   └── deploy.yml      # main: 프로덕션 배포
│   └── dependabot.yml      # 자동 의존성 업데이트
├── client/
│   ├── public/
│   │   ├── manifest.json   # PWA
│   │   ├── sw.js           # 서비스 워커
│   │   └── icons/
│   ├── src/components/
│   ├── vercel.json         # Vercel 배포 설정
│   └── vite.config.ts      # 코드 스플리팅 포함
├── server/
│   ├── src/
│   ├── railway.json        # Railway 배포 설정
│   ├── Procfile
│   └── .env.example
├── shared/types.ts
├── docker-compose.yml
├── .gitignore
└── LICENSE
```

---

## 라이선스

[MIT](LICENSE)
