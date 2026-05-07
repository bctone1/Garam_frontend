# 공지사항 관리 및 문의 알림 개선 설계서 (프론트엔드 단독 / Mock)

- **작성일**: 2026-05-07
- **작성자**: Lim Yeong-Bin
- **대상 저장소**: `garam_frontend`
- **요청 출처**: 클라이언트 수정 요청 3건
- **작업 범위 제한**: **프론트엔드만**. 백엔드 API 및 DB 스키마는 본 단계에서 변경하지 않으며, 모든 데이터는 mock + 브라우저 로컬 영속화로 시뮬레이션한다.

---

## 1. 배경 및 목적

클라이언트로부터 다음 3건의 수정 요청을 받았다.

1. 관리자 페이지에서 공지사항을 등록할 수 있도록 **공지사항 관리 기능 추가**
2. 관리자 문의 내역 완료 조치 후 **알림 표시에서는 삭제 처리**
3. **문의 알림 표시 숫자 크기 수정**

본 문서는 위 3건을 단일 릴리스로 묶어 처리하기 위한 기능·UI 설계 명세이다. **본 단계에서는 프론트엔드 화면 구현만 수행**하며, 향후 백엔드 연동을 위한 데이터 모델은 부록(§9)에 참고용으로 남긴다.

---

## 2. 결정 요약

| 항목 | 결정 |
|---|---|
| 작업 범위 | 프론트엔드 단독 (백엔드·DB 변경 없음) |
| 데이터 영속화 | `localStorage` 키 `garam.notices` |
| 공지사항 노출 위치 (키오스크) | 메인 상단 배너 + 별도 메뉴 (둘 다) |
| 공지사항 등록·수정·삭제 권한 | superadmin 전용 |
| 공지사항 본문 형식 | 마크다운 + 이미지 첨부 (이미지는 base64 인라인) |
| 키오스크 배너 노출 조건 | `is_important = true` 공지만 |
| 문의 완료 시 알림 처리 | 프론트엔드 state에서 해당 inquiry의 알림을 즉시 제거 |
| 알림 배지 크기 | 확대 (`font-size: 0.85rem`, `min-width / height: 22px`) |

---

## 3. 모듈 1 — 공지사항 관리 시스템 (Mock)

### 3.1 데이터 영속화 전략

브라우저 `localStorage`에 단일 키로 공지 배열을 저장한다.

- **키**: `garam.notices`
- **값 형태**: `JSON.stringify(Notice[])`
- 같은 브라우저 내에서 관리자 페이지(`/admin`)와 키오스크(`/`) 간 데이터가 공유된다.
- 다른 브라우저·디바이스에는 공유되지 않는 점은 mock 단계의 의도된 한계이다.

### 3.2 클라이언트 데이터 모델

타입스크립트 스타일 타입 표기 (실제 코드는 JS).

```js
Notice = {
  id: number,                  // Date.now() 또는 incremental
  title: string,
  content: string,             // 마크다운 원문
  is_important: boolean,
  starts_at: string | null,    // ISO 8601, null = 즉시 게시
  ends_at:   string | null,    // ISO 8601, null = 무기한
  created_by: string,          // sessionStorage.admin_name
  created_at: string,          // ISO 8601
  updated_at: string,          // ISO 8601
}
```

이미지는 본문에 base64 data URL로 인라인 삽입한다 (`![](data:image/png;base64,...)`). 별도 첨부 테이블은 두지 않는다.

### 3.3 데이터 접근 헬퍼 (신설)

**파일**: `src/utill/notice_storage.js`

```js
const KEY = 'garam.notices';

export function getNotices() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

export function saveNotices(notices) {
  localStorage.setItem(KEY, JSON.stringify(notices));
}

export function getActiveNotices() {
  const now = new Date();
  return getNotices()
    .filter(n => !n.starts_at || new Date(n.starts_at) <= now)
    .filter(n => !n.ends_at   || new Date(n.ends_at)   >  now)
    .sort((a, b) => {
      if (a.is_important !== b.is_important) return a.is_important ? -1 : 1;
      return new Date(b.created_at) - new Date(a.created_at);
    });
}

export function createNotice(input) { /* push, save, return */ }
export function updateNotice(id, patch) { /* map, save, return */ }
export function deleteNotice(id) { /* filter, save */ }
```

`utill/utill.js`와 같은 위치에 두고 관리자·키오스크 양측에서 import한다.

### 3.4 관리자 UI

**파일 신설**: `src/admin_components/notice.js`, `src/admin_styles/notice.css`

**사이드바 메뉴 추가** (`src/admin_components/sidebar.js`):
```js
{ key: "notice", icon: "fas fa-bullhorn", label: "공지사항 관리" }
```
- 메뉴 위치: `dashboard` 다음, `knowledge` 앞
- 표시 조건: `role === "superadmin"`. 일반 admin에게는 노출하지 않는다 (현재 `inquiry`만 보이는 분기 로직을 확장).

**라우팅 추가** (`src/pages/Admin.js`):
- `import Notice from '../admin_components/notice';`
- `import "../admin_styles/notice.css";`
- `renderView()`의 `switch`에 `case 'notice': return <Notice />;` 추가

**`notice.js` 화면 구성**

```
┌────────────────────────────────────────────────────┐
│ 공지사항 관리                                       │
│ 키오스크 상단 배너 및 공지사항 메뉴에 노출됩니다     │
│ [전체 N] [게시중 M] [예약 P] [만료 Q]              │
├────────────────────────────────────────────────────┤
│ [검색]                       [+ 공지사항 추가]     │
├────────────────────────────────────────────────────┤
│ ⭐ [중요] 제목 ······· 게시기간 ··· [수정][삭제]    │
│        본문 미리보기 (3줄까지)                      │
│ ─────────────────────────────────────────────       │
│    [중요] 제목 ······· 게시기간 ··· [수정][삭제]    │
│ ...                                                │
└────────────────────────────────────────────────────┘
```

`knowledge.js`의 `documents-section` 패턴을 재사용해 시각적 일관성을 유지한다.

**상태 관리**:
- 컴포넌트 마운트 시 `getNotices()` 호출 → 로컬 state `notices`에 적재
- 등록·수정·삭제 후에도 동일하게 storage 헬퍼 호출 + state 갱신
- 별도 axios 호출은 일체 없음

**등록·수정 모달 (`NoticeModal`)**:
- 제목 (필수)
- 본문: `<textarea>` + 라이브 마크다운 미리보기 (`react-markdown` + `remark-gfm` + `rehype-raw` 이미 설치됨)
- 이미지 업로드 버튼: 로컬 파일 선택 → `FileReader.readAsDataURL` → 결과를 textarea 커서 위치에 `![](data:image/...;base64,...)` 형태로 삽입
- 중요 공지 체크박스 (`is_important`)
- 게시 시작일·종료일 (`<input type="datetime-local">`, 둘 다 선택 사항)
- [취소] [저장]

**이미지 크기 가드**:
- 단일 이미지가 1MB(원본 기준)를 초과하면 경고 + 거절. localStorage 5MB 한도를 고려한 안전장치.
- 사용자에게 "이미지 용량이 큽니다 (mock 환경 한계)" 토스트 노출.

### 3.5 키오스크 UI 1 — 상단 배너

**파일**: `src/user_components/Main.js`, `src/user_styles/main.css`

**동작**:
1. 컴포넌트 마운트 시 `getActiveNotices()` 호출
2. 응답 중 `is_important === true`인 공지만 필터링 → 로컬 state `bannerNotices`
3. 1건 이상이면 화면 최상단에 고정 배너 렌더링
4. 여러 건일 경우 5초 간격으로 자동 슬라이드 (좌우 화살표 인디케이터 제공)
5. 배너 클릭 시 본문 모달 오픈 (`react-markdown`로 마크다운 렌더링, base64 이미지 그대로 표시)
6. `is_important` 공지가 0건이면 배너 자체를 렌더링하지 않음 (DOM에서 제거)

**CSS 신설** (`src/user_styles/main.css`에 추가):
```css
.notice-banner { /* 화면 최상단 sticky/fixed */ }
.notice-banner-item { /* 슬라이드 1건 */ }
.notice-banner-badge { /* "중요" 라벨 */ }
.notice-banner-modal { /* 본문 마크다운 모달 */ }
```

### 3.6 키오스크 UI 2 — 별도 메뉴 항목

**파일**: `src/user_components/Main.js`

**동작**:
1. 메인 메뉴 그리드(현재 paper / chart / menuEdit / faq)에 **"공지사항"** 항목 추가
2. 신규 SVG 아이콘을 `Icons` 객체에 추가 (`bullhorn` / 메가폰 형태)
3. 클릭 시 키오스크 내 별도 섹션으로 전환 (모달이 아니라 화면 전환 — 기존 키오스크 패턴과 일관)
4. 해당 섹션은 `getActiveNotices()` 결과 전체(중요 + 일반)를 정렬 순서대로 표시
5. 각 공지는 카드 형태로 제목·작성일이 보이고, 카드 클릭 시 마크다운 본문 펼침/접힘 (FAQ 패턴과 동일)
6. 좌상단 "처음으로" 버튼으로 메인 복귀

### 3.7 초기 시드(Seed) 데이터

키오스크와 관리자 첫 진입 시 디버깅을 돕기 위해, `localStorage`에 `garam.notices` 키가 없을 경우 다음 mock 2건을 자동 주입한다.

```js
[
  {
    id: 1,
    title: "시스템 점검 안내",
    content: "## 점검 일정\n\n- **일시**: 2026-05-15 02:00 ~ 04:00\n- **영향**: 키오스크 일시 중단\n\n양해 부탁드립니다.",
    is_important: true,
    starts_at: null,
    ends_at: null,
    created_by: "최종관리자",
    created_at: "2026-05-01T09:00:00.000Z",
    updated_at: "2026-05-01T09:00:00.000Z",
  },
  {
    id: 2,
    title: "신규 메뉴 등록 절차 안내",
    content: "메뉴 수정·추가 요청은 **메뉴 수정 및 추가** 메뉴를 통해 접수해주세요.",
    is_important: false,
    starts_at: null,
    ends_at: null,
    created_by: "최종관리자",
    created_at: "2026-04-25T12:00:00.000Z",
    updated_at: "2026-04-25T12:00:00.000Z",
  },
]
```

이 시드는 `notice_storage.js`의 `getNotices()`에서 빈 배열일 때만 한 번 주입한다.

---

## 4. 모듈 2 — 문의 완료 시 알림 자동 삭제 (프론트만)

### 4.1 현재 동작

`src/admin_components/inquiry.js`의 `handleComplete` (라인 356-393):
- `POST /inquiries/:id/histories/note` (action=`complete`)
- `POST /inquiries/:id/status` (status=`completed`)
- 로컬 `inquiries` state 업데이트

알림(`notifications`)은 별도로 건드리지 않으므로, 완료된 문의에 대한 `inquiry_new`·`inquiry_assigned` 알림이 드롭다운과 배지 카운트에 그대로 남는다.

### 4.2 변경 동작

`handleComplete` 마지막에 다음 1줄을 추가한다:

```js
setNotifications(prev => prev.filter(n => n.inquiry?.id !== inquiry.id));
```

요건:
- `notifications` state는 현재 `Inquiry` 컴포넌트 최상위에서 관리되고 있으므로, `setNotifications`를 `RenderInquiries`에 prop으로 내려준다.
- 알림 배지 카운트는 `notifications.filter(n => n.read_at === null).length`로 파생되므로 자동 갱신된다.
- 백엔드 `notifications` 데이터는 변경하지 않는다 (요청 사양과 일치).

### 4.3 한계

- 다른 관리자 세션·다른 브라우저 탭에는 해당 알림이 그대로 남는다 (현재 사용자 세션만 즉시 삭제).
- WebSocket으로 새 알림이 들어오면 `fetch_notificatoins`가 다시 호출되어 알림이 복귀할 수 있는데, 본 변경은 "완료 클릭 시점의 즉시 반영"을 목표로 하므로 다음 fetch 시점까지의 윈도우만 보장한다. 충분한 UX 개선이며, 영구 삭제는 백엔드 작업으로 분리한다.

---

## 5. 모듈 3 — 문의 알림 배지 크기 확대

### 5.1 변경 위치

`src/admin_styles/inquiry.css` 230-246라인의 `.inquiry-notification-badge` 룰.

### 5.2 변경 내용

| 속성 | 변경 전 | 변경 후 |
|---|---|---|
| `font-size` | `0.7rem` | `0.85rem` |
| `min-width` | `18px` | `22px` |
| `height` | `18px` | `22px` |
| `border-radius` | `9px` | `11px` |
| `top` | `-4px` | `-6px` |
| `right` | `-4px` | `-6px` |
| `padding` | `0 4px` | `0 6px` (두 자리·`99+` 표기 시 좌우 여유 확보) |

### 5.3 99+ 표기 처리

`src/admin_components/inquiry.js` 143-145 라인의 배지 렌더링을 다음과 같이 수정한다:

```js
{(() => {
    const unreadCount = notifications.filter(n => n.read_at === null).length;
    if (unreadCount === 0) return null;
    const display = unreadCount > 99 ? '99+' : unreadCount;
    return <span className="inquiry-notification-badge">{display}</span>;
})()}
```

---

## 6. 변경 영향 파일 요약

| 파일 | 변경 유형 | 모듈 |
|---|---|---|
| `src/utill/notice_storage.js` | 신설 (localStorage 헬퍼 + 시드) | 1 |
| `src/admin_components/notice.js` | 신설 | 1 |
| `src/admin_styles/notice.css` | 신설 | 1 |
| `src/admin_components/sidebar.js` | 메뉴 추가 + visibility 분기 확장 | 1 |
| `src/pages/Admin.js` | import + 라우팅 case 추가 | 1 |
| `src/user_components/Main.js` | 배너 + 메뉴 항목 + 모달 추가 | 1 |
| `src/user_styles/main.css` | 배너·모달 스타일 | 1 |
| `src/admin_components/inquiry.js` | `handleComplete`에 알림 제거 + 99+ 표기 | 2, 3 |
| `src/admin_styles/inquiry.css` | 배지 크기 변경 | 3 |

**백엔드·DB·환경설정 파일 변경 없음.**

---

## 7. 비범위 (Out of Scope)

- 백엔드 API 신설 (`/notices` 등) 및 DB 스키마 변경 — 본 단계는 **mock 단독**
- 다른 디바이스·브라우저 간 공지·알림 동기화
- 키오스크에 공지 등록 시 실시간 푸시 (재진입/새로고침 시점에만 갱신)
- 공지사항 작성 이력·감사 로그
- 공지사항 사용자별 "확인" 처리
- 마크다운 본문 내 비이미지 첨부(PDF 등)

---

## 8. 검증 시나리오 (구현 검수 시 사용)

1. superadmin으로 로그인 → 공지사항 관리 메뉴가 보이는가
2. 일반 admin으로 로그인 → 공지사항 관리 메뉴가 보이지 않는가
3. 공지를 새로 등록하면 `localStorage.garam.notices`에 즉시 저장되는가
4. 등록한 공지가 같은 브라우저의 키오스크(`/`)에서 노출되는가
5. 마크다운(굵기·리스트·이미지)이 키오스크 모달에서 정상 렌더링되는가
6. 이미지 업로드 시 base64로 마크다운에 삽입되며 키오스크에서 정상 노출되는가
7. `is_important` 공지 등록 시 키오스크 상단 배너에 즉시 노출되는가 (재진입 후)
8. `is_important = false` 공지는 배너에 노출되지 않고, "공지사항" 메뉴에서만 보이는가
9. 게시 시작일이 미래인 공지는 키오스크에서 보이지 않는가
10. 게시 종료일 경과 후 키오스크에서 사라지는가
11. 공지 삭제 시 storage·관리자 목록·키오스크 양쪽에서 모두 사라지는가
12. 문의를 "완료"로 처리하면 알림 드롭다운 및 배지 카운트에서 즉시 제거되는가
13. 알림이 0건이면 배지가 사라지는가
14. 알림 100건 이상일 때 "99+"로 표시되며 배지 너비가 깨지지 않는가
15. 두 자리 숫자(예: 12)가 새 배지 크기에서 가독성 있게 표시되는가

---

## 9. 부록 — 향후 백엔드 연동 시 참고 데이터 모델

본 작업 단계에서는 구현하지 않으나, 추후 mock에서 백엔드 연동으로 전환 시 사용할 수 있는 권장 스키마를 남긴다.

**테이블 `notices`**

| 필드 | 타입 | 비고 |
|---|---|---|
| `id` | INT (PK, auto) | |
| `title` | VARCHAR(200) | 필수 |
| `content` | TEXT | 마크다운 |
| `is_important` | BOOLEAN | |
| `starts_at` | DATETIME, nullable | |
| `ends_at` | DATETIME, nullable | |
| `created_by_admin_id` | INT (FK → `admin_users.id`) | |
| `created_at` / `updated_at` | DATETIME | |

**테이블 `notice_attachments`** (이미지를 base64 인라인이 아닌 외부 저장으로 분리할 때)

| 필드 | 타입 | 비고 |
|---|---|---|
| `id` | INT (PK) | |
| `notice_id` | INT (FK → `notices.id`, CASCADE) | |
| `storage_key` | VARCHAR(500) | |
| `original_name` / `content_type` / `size` / `created_at` | | |

**예상 API**

| 메서드 | 경로 | 권한 |
|---|---|---|
| `GET` | `/notices` | superadmin |
| `GET` | `/notices/active` | public |
| `POST` / `PATCH` / `DELETE` | `/notices[/:id]` | superadmin |
| `POST` | `/notices/upload-image` | superadmin |

전환 시 `notice_storage.js`만 axios 호출로 교체하면 UI 변경은 최소화된다.
