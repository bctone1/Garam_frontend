# Notice & Notification Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 클라이언트 요청 3건 — 공지사항 관리(superadmin 전용 mock), 문의 완료 시 알림 즉시 제거, 알림 배지 크기 확대 — 을 프론트엔드 단독으로 구현한다.

**Architecture:** localStorage 기반 mock 영속화 + React 함수 컴포넌트. 공지 데이터는 `garam.notices` 단일 키에 저장하고, 데이터 접근은 `src/utill/notice_storage.js`로 캡슐화한다. 관리자 측은 신규 메뉴 1개 + 모달 1개. 키오스크 측은 상단 슬라이드 배너 + 메인 메뉴 신규 항목 1개. 문의 알림 변경은 inquiry.js 한 곳, CSS 변경은 inquiry.css 한 룰.

**Tech Stack:** React 19, react-markdown + remark-gfm + rehype-raw (이미 설치), localStorage, FileReader API, axios(기존), 기존 SCSS 변수(`--primary-color` 등). **테스트 프레임워크 부재** — 검증은 `npm start`(포트 3002) 후 브라우저 수동 확인.

**검증 환경 공통 사항:**
- 서버 시작: `npm start` (포트 3002 자동 설정)
- 관리자 URL: `http://localhost:3002/admin`
- 키오스크 URL: `http://localhost:3002/`
- DevTools → Application → Local Storage 에서 `garam.notices` 키 확인 가능

**참조 디자인 문서:** `docs/superpowers/specs/2026-05-07-notice-and-notification-improvements-design.md`

---

## File Structure

| 파일 | 역할 | 상태 |
|---|---|---|
| `src/utill/notice_storage.js` | localStorage CRUD + 시드 + 활성 공지 정렬·필터 | 신설 |
| `src/admin_components/notice.js` | 관리자 공지 페이지 (목록·통계·모달 트리거) | 신설 |
| `src/admin_components/notice_modal.js` | 등록·수정 모달 (마크다운 textarea + 미리보기 + 이미지 base64) | 신설 |
| `src/admin_styles/notice.css` | 관리자 공지 페이지 스타일 | 신설 |
| `src/admin_components/sidebar.js` | 메뉴에 `notice` 추가, superadmin visibility 분기 확장 | 수정 |
| `src/pages/Admin.js` | import + `case 'notice'` 라우팅 | 수정 |
| `src/user_components/Main.js` | 상단 배너 + "공지사항" 메뉴 항목 + 본문 모달 | 수정 |
| `src/user_styles/main.css` | 배너·메뉴 카드·본문 모달 스타일 | 수정 |
| `src/admin_components/inquiry.js` | `handleComplete`에 알림 제거 + `99+` 표기 | 수정 |
| `src/admin_styles/inquiry.css` | `.inquiry-notification-badge` 크기 확대 | 수정 |

**총 신설 4개 / 수정 5개 / 백엔드·DB 무변경.**

---

## Task 1: notice_storage.js — localStorage 헬퍼 + 시드

**Files:**
- Create: `src/utill/notice_storage.js`

- [ ] **Step 1: 파일 생성 및 전체 코드 작성**

```javascript
const KEY = 'garam.notices';

const SEED = [
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
];

function readRaw() {
    try {
        const raw = localStorage.getItem(KEY);
        if (raw === null) {
            localStorage.setItem(KEY, JSON.stringify(SEED));
            return [...SEED];
        }
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function writeRaw(notices) {
    localStorage.setItem(KEY, JSON.stringify(notices));
}

export function getNotices() {
    return readRaw().sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export function getActiveNotices() {
    const now = new Date();
    return readRaw()
        .filter(n => !n.starts_at || new Date(n.starts_at) <= now)
        .filter(n => !n.ends_at || new Date(n.ends_at) > now)
        .sort((a, b) => {
            if (a.is_important !== b.is_important) return a.is_important ? -1 : 1;
            return new Date(b.created_at) - new Date(a.created_at);
        });
}

export function createNotice(input) {
    const notices = readRaw();
    const now = new Date().toISOString();
    const next = {
        id: Date.now(),
        title: input.title,
        content: input.content,
        is_important: !!input.is_important,
        starts_at: input.starts_at || null,
        ends_at: input.ends_at || null,
        created_by: input.created_by || "관리자",
        created_at: now,
        updated_at: now,
    };
    notices.push(next);
    writeRaw(notices);
    return next;
}

export function updateNotice(id, patch) {
    const notices = readRaw();
    const idx = notices.findIndex(n => n.id === id);
    if (idx === -1) return null;
    const merged = {
        ...notices[idx],
        ...patch,
        id: notices[idx].id,
        created_at: notices[idx].created_at,
        updated_at: new Date().toISOString(),
    };
    notices[idx] = merged;
    writeRaw(notices);
    return merged;
}

export function deleteNotice(id) {
    const next = readRaw().filter(n => n.id !== id);
    writeRaw(next);
}

export function classifyNotice(notice) {
    const now = new Date();
    if (notice.starts_at && new Date(notice.starts_at) > now) return 'scheduled';
    if (notice.ends_at && new Date(notice.ends_at) <= now) return 'expired';
    return 'active';
}
```

- [ ] **Step 2: 브라우저 콘솔 수동 검증**

`npm start` 실행 후 `http://localhost:3002` 접속. DevTools 콘솔에서:

```javascript
const m = await import('/src/utill/notice_storage.js');
// 또는 컴포넌트가 import한 시점 이후 Application > Local Storage에서 garam.notices 확인
localStorage.getItem('garam.notices')
```

Expected: 자동 import는 안 되므로 우선 `Application → Local Storage` 패널에서 다음 단계 이후 키 생성 여부 확인.

- [ ] **Step 3: Commit**

```bash
git add src/utill/notice_storage.js
git commit -m "feat(notice): add localStorage-based notice storage helper with seed data"
```

---

## Task 2: notice_modal.js — 등록·수정 모달

**Files:**
- Create: `src/admin_components/notice_modal.js`

- [ ] **Step 1: 모달 컴포넌트 작성**

```javascript
import { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { showToast } from '../utill/utill';

const MAX_IMAGE_BYTES = 1024 * 1024;

export default function NoticeModal({ initial, onClose, onSubmit }) {
    const [form, setForm] = useState({
        title: initial?.title || '',
        content: initial?.content || '',
        is_important: initial?.is_important || false,
        starts_at: initial?.starts_at ? toDatetimeLocal(initial.starts_at) : '',
        ends_at: initial?.ends_at ? toDatetimeLocal(initial.ends_at) : '',
    });
    const [showPreview, setShowPreview] = useState(false);
    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);

    const isEdit = !!initial;

    const handleImagePick = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            showToast('이미지 파일만 업로드 가능합니다.', 'error');
            return;
        }
        if (file.size > MAX_IMAGE_BYTES) {
            showToast('이미지는 1MB 이하만 첨부할 수 있습니다 (mock 환경 한계).', 'warning');
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = reader.result;
            insertAtCursor(`![](${dataUrl})\n`);
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    const insertAtCursor = (text) => {
        const ta = textareaRef.current;
        if (!ta) return;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const before = form.content.slice(0, start);
        const after = form.content.slice(end);
        const next = before + text + after;
        setForm(prev => ({ ...prev, content: next }));
        setTimeout(() => {
            ta.focus();
            ta.selectionStart = ta.selectionEnd = start + text.length;
        }, 0);
    };

    const handleSubmit = () => {
        if (!form.title.trim()) {
            showToast('제목은 필수입니다.', 'error');
            return;
        }
        if (!form.content.trim()) {
            showToast('내용은 필수입니다.', 'error');
            return;
        }
        if (form.starts_at && form.ends_at && new Date(form.starts_at) >= new Date(form.ends_at)) {
            showToast('종료일은 시작일 이후여야 합니다.', 'error');
            return;
        }
        onSubmit({
            title: form.title.trim(),
            content: form.content,
            is_important: form.is_important,
            starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
            ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
        });
    };

    return (
        <>
            <div className="modal-backdrop" onClick={onClose}></div>
            <div className="modal-container notice-modal-container">
                <div className="modal-header">
                    <h3 className="modal-title">{isEdit ? '공지사항 수정' : '공지사항 추가'}</h3>
                    <button className="modal-close" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                <div className="modal-body">
                    <div className="notice-form">
                        <div className="form-group">
                            <label className="form-label">
                                제목 <span className="required-mark">*</span>
                            </label>
                            <input
                                type="text"
                                className="form-input"
                                value={form.title}
                                onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
                                placeholder="공지 제목을 입력하세요"
                                maxLength={200}
                            />
                        </div>

                        <div className="form-group">
                            <div className="notice-content-toolbar">
                                <label className="form-label">
                                    내용 (마크다운 지원) <span className="required-mark">*</span>
                                </label>
                                <div className="notice-toolbar-actions">
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-secondary"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <i className="fas fa-image"></i> 이미지 삽입
                                    </button>
                                    <button
                                        type="button"
                                        className={`btn btn-sm ${showPreview ? 'btn-primary' : 'btn-secondary'}`}
                                        onClick={() => setShowPreview(p => !p)}
                                    >
                                        <i className="fas fa-eye"></i> {showPreview ? '편집' : '미리보기'}
                                    </button>
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    onChange={handleImagePick}
                                />
                            </div>
                            {showPreview ? (
                                <div className="notice-preview">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        rehypePlugins={[rehypeRaw]}
                                    >
                                        {form.content || '_미리볼 내용이 없습니다._'}
                                    </ReactMarkdown>
                                </div>
                            ) : (
                                <textarea
                                    ref={textareaRef}
                                    className="notice-textarea"
                                    value={form.content}
                                    onChange={(e) => setForm(p => ({ ...p, content: e.target.value }))}
                                    placeholder={"## 제목\n\n- 항목\n- 항목\n\n![](이미지 삽입 버튼 사용)"}
                                    rows={12}
                                />
                            )}
                        </div>

                        <div className="form-group notice-flag-row">
                            <label className="notice-checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={form.is_important}
                                    onChange={(e) => setForm(p => ({ ...p, is_important: e.target.checked }))}
                                />
                                <span>중요 공지 (키오스크 상단 배너에 노출)</span>
                            </label>
                        </div>

                        <div className="notice-date-row">
                            <div className="form-group">
                                <label className="form-label">게시 시작일</label>
                                <input
                                    type="datetime-local"
                                    className="form-input"
                                    value={form.starts_at}
                                    onChange={(e) => setForm(p => ({ ...p, starts_at: e.target.value }))}
                                />
                                <small className="form-help">비워두면 즉시 게시</small>
                            </div>
                            <div className="form-group">
                                <label className="form-label">게시 종료일</label>
                                <input
                                    type="datetime-local"
                                    className="form-input"
                                    value={form.ends_at}
                                    onChange={(e) => setForm(p => ({ ...p, ends_at: e.target.value }))}
                                />
                                <small className="form-help">비워두면 무기한</small>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>취소</button>
                    <button className="btn btn-primary" onClick={handleSubmit}>
                        <i className={`fas ${isEdit ? 'fa-save' : 'fa-plus'}`}></i>
                        {isEdit ? ' 저장' : ' 등록'}
                    </button>
                </div>
            </div>
        </>
    );
}

function toDatetimeLocal(isoString) {
    const d = new Date(isoString);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/admin_components/notice_modal.js
git commit -m "feat(notice): add admin notice modal with markdown editor and image upload"
```

---

## Task 3: notice.js — 관리자 공지 페이지

**Files:**
- Create: `src/admin_components/notice.js`

- [ ] **Step 1: 페이지 컴포넌트 작성**

```javascript
import { useState, useEffect } from 'react';
import { showToast } from '../utill/utill';
import {
    getNotices,
    createNotice,
    updateNotice,
    deleteNotice,
    classifyNotice,
} from '../utill/notice_storage';
import NoticeModal from './notice_modal';

export default function Notice() {
    const [notices, setNotices] = useState([]);
    const [search, setSearch] = useState('');
    const [editTarget, setEditTarget] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const adminName = sessionStorage.getItem('admin_name') || '관리자';

    const reload = () => setNotices(getNotices());

    useEffect(() => { reload(); }, []);

    const counts = notices.reduce((acc, n) => {
        const k = classifyNotice(n);
        acc.total += 1;
        acc[k] = (acc[k] || 0) + 1;
        return acc;
    }, { total: 0, active: 0, scheduled: 0, expired: 0 });

    const filtered = notices.filter(n =>
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.content.toLowerCase().includes(search.toLowerCase())
    );

    const openCreate = () => { setEditTarget(null); setShowModal(true); };
    const openEdit = (notice) => { setEditTarget(notice); setShowModal(true); };
    const closeModal = () => { setShowModal(false); setEditTarget(null); };

    const handleSubmit = (input) => {
        if (editTarget) {
            updateNotice(editTarget.id, input);
            showToast('공지사항이 수정되었습니다.', 'success');
        } else {
            createNotice({ ...input, created_by: adminName });
            showToast('공지사항이 등록되었습니다.', 'success');
        }
        closeModal();
        reload();
    };

    const handleDelete = (notice) => {
        if (!window.confirm(`"${notice.title}" 공지를 삭제하시겠습니까?`)) return;
        deleteNotice(notice.id);
        showToast('공지사항이 삭제되었습니다.', 'warning');
        reload();
    };

    const formatDate = (iso) => iso ? new Date(iso).toLocaleString('ko-KR') : '-';
    const previewText = (md) => {
        const stripped = md
            .replace(/!\[[^\]]*\]\([^)]+\)/g, '[이미지]')
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
            .replace(/[#*_`>~-]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
        return stripped.length > 120 ? stripped.slice(0, 120) + '…' : stripped;
    };

    return (
        <>
            {showModal && (
                <div className="modal show" style={{ display: 'flex' }}>
                    <NoticeModal
                        initial={editTarget}
                        onClose={closeModal}
                        onSubmit={handleSubmit}
                    />
                </div>
            )}

            <main className="main-content">
                <header className="top-header">
                    <div className="header-left">
                        <div className="page-title">
                            <h1>공지사항 관리</h1>
                            <p className="page-subtitle">키오스크 상단 배너 및 공지사항 메뉴에 노출됩니다</p>
                        </div>
                    </div>
                    <div className="header-right">
                        <div className="header-stats">
                            <div className="stat-item">
                                <span className="stat-label">전체</span>
                                <span className="stat-value">{counts.total}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">게시중</span>
                                <span className="stat-value">{counts.active || 0}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">예약</span>
                                <span className="stat-value">{counts.scheduled || 0}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">만료</span>
                                <span className="stat-value">{counts.expired || 0}</span>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="documents-section notice-section">
                    <div className="section-header">
                        <div className="header-left">
                            <h3>공지사항 목록</h3>
                            <span className="document-count">{filtered.length}건</span>
                        </div>
                        <div className="header-actions">
                            <div className="search-box">
                                <i className="fas fa-search"></i>
                                <input
                                    type="text"
                                    placeholder="제목·내용 검색..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <button className="btn btn-primary" onClick={openCreate}>
                                <i className="fas fa-plus"></i> 공지사항 추가
                            </button>
                        </div>
                    </div>

                    {filtered.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">
                                <i className="fas fa-bullhorn"></i>
                            </div>
                            <p>등록된 공지사항이 없습니다.</p>
                        </div>
                    ) : (
                        <div className="notice-list">
                            {filtered.map((notice) => {
                                const status = classifyNotice(notice);
                                return (
                                    <div key={notice.id} className={`notice-card notice-card--${status}`}>
                                        <div className="notice-card-header">
                                            <div className="notice-card-title-row">
                                                {notice.is_important && (
                                                    <span className="notice-important-badge">
                                                        <i className="fas fa-star"></i> 중요
                                                    </span>
                                                )}
                                                <span className={`notice-status-badge notice-status-${status}`}>
                                                    {status === 'active' ? '게시중' : status === 'scheduled' ? '예약' : '만료'}
                                                </span>
                                                <h4 className="notice-card-title">{notice.title}</h4>
                                            </div>
                                            <div className="notice-card-actions">
                                                <button
                                                    className="action-btn-small"
                                                    title="수정"
                                                    onClick={() => openEdit(notice)}
                                                >
                                                    <i className="fas fa-pen"></i>
                                                </button>
                                                <button
                                                    className="action-btn-small delete"
                                                    title="삭제"
                                                    onClick={() => handleDelete(notice)}
                                                >
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="notice-card-preview">{previewText(notice.content)}</div>
                                        <div className="notice-card-meta">
                                            <span><i className="fas fa-user"></i> {notice.created_by}</span>
                                            <span><i className="fas fa-calendar-plus"></i> 등록 {formatDate(notice.created_at)}</span>
                                            <span><i className="fas fa-play-circle"></i> 시작 {formatDate(notice.starts_at)}</span>
                                            <span><i className="fas fa-stop-circle"></i> 종료 {formatDate(notice.ends_at)}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/admin_components/notice.js
git commit -m "feat(notice): add admin notice management page with list, search and CRUD"
```

---

## Task 4: notice.css — 관리자 공지 페이지 스타일

**Files:**
- Create: `src/admin_styles/notice.css`

- [ ] **Step 1: CSS 작성**

```css
.notice-section .notice-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1.5rem;
}

.notice-card {
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    padding: 1rem 1.25rem;
    background: var(--bg-white);
    transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.notice-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transform: translateY(-1px);
}

.notice-card--expired {
    opacity: 0.6;
}

.notice-card--scheduled {
    border-left: 4px solid #f59e0b;
}

.notice-card--active {
    border-left: 4px solid #10b981;
}

.notice-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 0.5rem;
}

.notice-card-title-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
    flex: 1;
}

.notice-card-title {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
}

.notice-important-badge {
    background: #fef3c7;
    color: #92400e;
    padding: 0.15rem 0.5rem;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
}

.notice-status-badge {
    padding: 0.15rem 0.5rem;
    border-radius: 999px;
    font-size: 0.7rem;
    font-weight: 600;
}

.notice-status-active {
    background: #d1fae5;
    color: #065f46;
}

.notice-status-scheduled {
    background: #fef3c7;
    color: #92400e;
}

.notice-status-expired {
    background: #f3f4f6;
    color: #4b5563;
}

.notice-card-actions {
    display: flex;
    gap: 0.25rem;
    flex-shrink: 0;
}

.notice-card-preview {
    color: var(--text-secondary);
    font-size: 0.875rem;
    line-height: 1.5;
    margin-bottom: 0.5rem;
}

.notice-card-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    font-size: 0.75rem;
    color: var(--text-secondary);
}

.notice-card-meta span {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
}

.notice-modal-container {
    max-width: 760px;
    width: 90%;
}

.notice-form .form-group {
    margin-bottom: 1.25rem;
}

.notice-form .form-label {
    display: block;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: var(--text-primary);
}

.notice-form .form-input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    font-size: 1rem;
    font-family: inherit;
}

.notice-form .required-mark {
    color: var(--danger-color);
}

.notice-content-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 0.5rem;
    flex-wrap: wrap;
}

.notice-toolbar-actions {
    display: flex;
    gap: 0.5rem;
}

.notice-textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    font-size: 0.95rem;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    resize: vertical;
    min-height: 240px;
}

.notice-preview {
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    padding: 1rem;
    min-height: 240px;
    background: var(--bg-light, #fafafa);
    font-size: 0.95rem;
    line-height: 1.6;
}

.notice-preview img {
    max-width: 100%;
    height: auto;
}

.notice-flag-row .notice-checkbox-label {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.95rem;
    color: var(--text-primary);
    cursor: pointer;
}

.notice-flag-row input[type="checkbox"] {
    width: 18px;
    height: 18px;
}

.notice-date-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}

.notice-form .form-help {
    display: block;
    margin-top: 0.25rem;
    color: var(--text-secondary);
    font-size: 0.75rem;
}

@media (max-width: 768px) {
    .notice-date-row {
        grid-template-columns: 1fr;
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/admin_styles/notice.css
git commit -m "feat(notice): add admin notice page styles"
```

---

## Task 5: sidebar.js — 메뉴 추가 및 권한 분기

**Files:**
- Modify: `src/admin_components/sidebar.js`

- [ ] **Step 1: 메뉴 배열에 notice 추가 및 visibleMenu 로직 변경**

```javascript
// 변경 전 menuItems (5-13)
const menuItems = [
    { key: "dashboard", icon: "fas fa-tachometer-alt", label: "대시보드" },
    { key: "knowledge", icon: "fas fa-book", label: "지식베이스 관리" },
    { key: "assistant", icon: "fas fa-robot", label: "AI 모델 설정" },
    { key: "chart", icon: "fas fa-chart-bar", label: "분석 및 보고서" },
    { key: "chatbot", icon: "fas fa-comments", label: "챗봇 운영 설정" },
    { key: "inquiry", icon: "fa-solid fa-address-book", label: "문의 관리" },
    { key: "chat_history", icon: "fas fa-comment-dots", label: "대화 기록" },
];

// 변경 후
const menuItems = [
    { key: "dashboard", icon: "fas fa-tachometer-alt", label: "대시보드" },
    { key: "notice", icon: "fas fa-bullhorn", label: "공지사항 관리" },
    { key: "knowledge", icon: "fas fa-book", label: "지식베이스 관리" },
    { key: "assistant", icon: "fas fa-robot", label: "AI 모델 설정" },
    { key: "chart", icon: "fas fa-chart-bar", label: "분석 및 보고서" },
    { key: "chatbot", icon: "fas fa-comments", label: "챗봇 운영 설정" },
    { key: "inquiry", icon: "fa-solid fa-address-book", label: "문의 관리" },
    { key: "chat_history", icon: "fas fa-comment-dots", label: "대화 기록" },
];
```

`visibleMenu` 분기는 변경 없음 (`role !== "superadmin"`인 경우 inquiry만 노출하므로 일반 admin에게 notice도 자동 차단됨).

- [ ] **Step 2: 브라우저 검증**

`npm start` 후 `/admin` 접속 (superadmin 세션 필요). 사이드바에 "공지사항 관리"가 대시보드 다음 위치에 보이고, 일반 admin으로 전환하면 inquiry만 보이는지 확인.

- [ ] **Step 3: Commit**

```bash
git add src/admin_components/sidebar.js
git commit -m "feat(notice): add notice management entry to admin sidebar"
```

---

## Task 6: Admin.js — 라우팅 case 추가

**Files:**
- Modify: `src/pages/Admin.js`

- [ ] **Step 1: import 및 case 추가**

```javascript
// 상단 import 블록에 추가 (8라인 'import Inquiry' 다음)
import Notice from '../admin_components/notice';

// CSS import 블록에 추가 (16라인 dashboard 등 옆)
import "../admin_styles/notice.css";

// renderView switch (51-73)에 case 추가 - 'dashboard' case 다음
case 'notice':
    return <Notice />;
```

전체 변경 후 `renderView`:

```javascript
const renderView = () => {
    switch (view) {
        case 'dashboard':
            return <Dashboard />;
        case 'notice':
            return <Notice />;
        case 'knowledge':
            return <Knowledge />;
        case 'assistant':
            return <Assistant />;
        case 'chart':
            return <Chart />;
        case 'chatbot':
            return <Chatbot />;
        case 'inquiry':
            return <Inquiry
                setRole={setRole}
                role={role}
                setadmin_email={setadmin_email}
                setadmin_name={setadmin_name}
            />;
        case 'chat_history':
            return <ChatHistory />;
        default:
            return <div>준비 중입니다: {view}</div>;
    }
};
```

- [ ] **Step 2: 브라우저 검증**

사이드바 "공지사항 관리" 클릭 → 공지 페이지 렌더링. 시드 데이터 2건이 카드로 표시되어야 함. "공지사항 추가" 클릭 → 모달 열림 → 제목 "테스트", 내용 "**굵게**" 입력 → 미리보기 토글 → 굵은 텍스트로 렌더 → 등록. 목록에 새 카드가 추가되고 `localStorage.garam.notices`에 3번째 항목이 들어가는지 DevTools에서 확인.

- [ ] **Step 3: Commit**

```bash
git add src/pages/Admin.js
git commit -m "feat(notice): wire notice page into admin routing"
```

---

## Task 7: Main.js — 키오스크 상단 배너 + 공지 메뉴 항목 + 본문 모달

**Files:**
- Modify: `src/user_components/Main.js`

이 작업은 한 파일에 3가지 변경이 들어가므로 단계를 세분화한다.

- [ ] **Step 1: import 및 헬퍼 사용 추가**

`Main.js` 상단 import 블록(1-7)에 다음 줄을 추가한다:

```javascript
import ReactMarkdown from "react-markdown";  // 이미 존재할 수 있음 — 중복이면 추가하지 않음
import remarkGfm from "remark-gfm";          // 이미 존재
import rehypeRaw from "rehype-raw";          // 이미 존재
import { getActiveNotices } from "../utill/notice_storage";
```

(`react-markdown`·`remark-gfm`·`rehype-raw`는 이미 import되어 있으므로 그대로 두고 `getActiveNotices`만 추가.)

- [ ] **Step 2: bullhorn 아이콘 + 공지 state 추가**

`Icons` 객체(13-95)의 마지막 항목(`file:` 다음)에 추가:

```javascript
        bullhorn: (
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 5L6 9H3C2.45 9 2 9.45 2 10V14C2 14.55 2.45 15 3 15H6L11 19V5Z" fill="#323232" fillOpacity="0.08" stroke="#323232" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M14 8C15.66 8 17 9.79 17 12C17 14.21 15.66 16 14 16" stroke="#323232" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M17 5C19.76 5 22 8.13 22 12C22 15.87 19.76 19 17 19" stroke="#323232" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
        ),
```

`useState` 블록(97-120 영역)에 다음 라인을 추가:

```javascript
    const [bannerNotices, setBannerNotices] = useState([]);
    const [allActiveNotices, setAllActiveNotices] = useState([]);
    const [bannerIndex, setBannerIndex] = useState(0);
    const [openNoticeId, setOpenNoticeId] = useState(null);
    const [showNoticeListSection, setShowNoticeListSection] = useState(false);
```

- [ ] **Step 3: 공지 로드 및 슬라이드 useEffect 추가**

기존 useEffect 블록 근처에 추가 (다른 fetch들과 같은 위치):

```javascript
    useEffect(() => {
        const all = getActiveNotices();
        setAllActiveNotices(all);
        setBannerNotices(all.filter(n => n.is_important));
    }, []);

    useEffect(() => {
        if (bannerNotices.length <= 1) return;
        const t = setInterval(() => {
            setBannerIndex(prev => (prev + 1) % bannerNotices.length);
        }, 5000);
        return () => clearInterval(t);
    }, [bannerNotices.length]);
```

- [ ] **Step 4: 배너·공지 섹션 렌더링 추가**

키오스크 메인 화면 최상단에 배너를 두고, 메인 메뉴 그리드에 "공지사항" 항목을, 그리고 별도 공지 섹션을 렌더링한다.

`return ( <> ... </> )` 시작 직후, 가장 먼저 다음 배너 블록을 렌더링한다 (welcome screen·메인 화면 모두에서 보이도록):

```jsx
{bannerNotices.length > 0 && (
    <div className="notice-banner">
        <div className="notice-banner-inner" onClick={() => setOpenNoticeId(bannerNotices[bannerIndex].id)}>
            <span className="notice-banner-badge">
                <i className="fas fa-bullhorn"></i> 중요 공지
            </span>
            <span className="notice-banner-title">{bannerNotices[bannerIndex].title}</span>
            {bannerNotices.length > 1 && (
                <span className="notice-banner-counter">
                    {bannerIndex + 1} / {bannerNotices.length}
                </span>
            )}
        </div>
    </div>
)}
```

기존 메인 메뉴 그리드(예: `paper / chart / menuEdit / faq` 카드들이 모여 있는 영역) 옆에 다음 카드를 추가한다 (정확한 위치는 기존 `Icons.faq` 사용 카드 다음):

```jsx
<button
    type="button"
    className="main-menu-card notice-menu-card"
    onClick={() => setShowNoticeListSection(true)}
>
    <div className="main-menu-icon">{Icons.bullhorn}</div>
    <div className="main-menu-label">공지사항</div>
    {allActiveNotices.length > 0 && (
        <span className="notice-menu-count">{allActiveNotices.length}</span>
    )}
</button>
```

(주의: 기존 메뉴 카드 className이 `main-menu-card`가 아닐 수 있다. 실제 코드의 카드 className을 그대로 따라 쓰고, `notice-menu-card`만 추가 클래스로 붙인다.)

본문 모달과 공지 리스트 섹션을 컴포넌트 트리 끝부분(메인 콘텐츠 다음, 다른 모달들과 같은 위치)에 추가:

```jsx
{showNoticeListSection && (
    <div className="notice-list-section">
        <div className="notice-list-header">
            <button className="notice-list-back" onClick={() => setShowNoticeListSection(false)}>
                <i className="fas fa-arrow-left"></i> 처음으로
            </button>
            <h2>공지사항</h2>
        </div>
        {allActiveNotices.length === 0 ? (
            <div className="notice-list-empty">등록된 공지사항이 없습니다.</div>
        ) : (
            <ul className="notice-list-items">
                {allActiveNotices.map(n => (
                    <li key={n.id} className={`notice-list-item ${openNoticeId === n.id ? 'open' : ''}`}>
                        <button
                            className="notice-list-item-header"
                            onClick={() => setOpenNoticeId(openNoticeId === n.id ? null : n.id)}
                        >
                            {n.is_important && (
                                <span className="notice-banner-badge">
                                    <i className="fas fa-bullhorn"></i> 중요
                                </span>
                            )}
                            <span className="notice-list-item-title">{n.title}</span>
                            <span className="notice-list-item-date">
                                {new Date(n.created_at).toLocaleDateString('ko-KR')}
                            </span>
                            <i className={`fas fa-chevron-${openNoticeId === n.id ? 'up' : 'down'}`}></i>
                        </button>
                        {openNoticeId === n.id && (
                            <div className="notice-list-item-body">
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    rehypePlugins={[rehypeRaw]}
                                >
                                    {n.content}
                                </ReactMarkdown>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        )}
    </div>
)}

{openNoticeId !== null && !showNoticeListSection && (
    <div className="notice-banner-modal-backdrop" onClick={() => setOpenNoticeId(null)}>
        <div className="notice-banner-modal" onClick={(e) => e.stopPropagation()}>
            <button className="notice-banner-modal-close" onClick={() => setOpenNoticeId(null)}>
                <i className="fas fa-times"></i>
            </button>
            {(() => {
                const n = allActiveNotices.find(x => x.id === openNoticeId);
                if (!n) return null;
                return (
                    <>
                        <div className="notice-banner-modal-header">
                            {n.is_important && (
                                <span className="notice-banner-badge">
                                    <i className="fas fa-bullhorn"></i> 중요 공지
                                </span>
                            )}
                            <h3>{n.title}</h3>
                            <small>{new Date(n.created_at).toLocaleString('ko-KR')}</small>
                        </div>
                        <div className="notice-banner-modal-body">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeRaw]}
                            >
                                {n.content}
                            </ReactMarkdown>
                        </div>
                    </>
                );
            })()}
        </div>
    </div>
)}
```

- [ ] **Step 5: 브라우저 검증**

`http://localhost:3002/` 접속 → 시드 공지 중 `is_important: true`인 "시스템 점검 안내"가 상단 배너에 노출되는지 확인. 배너 클릭 → 본문 모달에서 마크다운(점검 일정 헤더, 굵은 텍스트, 리스트)이 정상 렌더링되는지 확인. 메인 메뉴에 "공지사항" 카드가 보이고, 클릭하면 공지 리스트 섹션으로 전환. 각 카드 클릭 시 본문이 펼쳐져야 함. "처음으로" 클릭하면 메인 복귀.

- [ ] **Step 6: Commit**

```bash
git add src/user_components/Main.js
git commit -m "feat(notice): add kiosk top banner, notice menu and detail modal"
```

---

## Task 8: main.css — 키오스크 배너·메뉴·모달 스타일

**Files:**
- Modify: `src/user_styles/main.css`

- [ ] **Step 1: 파일 끝에 신규 룰 추가**

```css
/* ===== 공지사항 — 키오스크 ===== */

.notice-banner {
    position: sticky;
    top: 0;
    z-index: 50;
    width: 100%;
    background: linear-gradient(90deg, #fef3c7, #fde68a);
    border-bottom: 1px solid #f59e0b;
    cursor: pointer;
}

.notice-banner-inner {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1.25rem;
    max-width: 1200px;
    margin: 0 auto;
}

.notice-banner-badge {
    background: #92400e;
    color: #fff;
    padding: 0.2rem 0.625rem;
    border-radius: 999px;
    font-size: 0.8rem;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    flex-shrink: 0;
}

.notice-banner-title {
    flex: 1;
    color: #78350f;
    font-weight: 500;
    font-size: 1rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.notice-banner-counter {
    color: #78350f;
    font-size: 0.85rem;
    flex-shrink: 0;
}

/* 메인 메뉴의 공지사항 카드 */
.notice-menu-card {
    position: relative;
}

.notice-menu-count {
    position: absolute;
    top: 8px;
    right: 8px;
    background: #ef4444;
    color: #fff;
    border-radius: 999px;
    padding: 2px 8px;
    font-size: 0.75rem;
    font-weight: 700;
    min-width: 22px;
    text-align: center;
}

/* 공지 리스트 섹션 (별도 화면) */
.notice-list-section {
    position: fixed;
    inset: 0;
    background: #fff;
    z-index: 100;
    overflow-y: auto;
    padding: 1.5rem;
}

.notice-list-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #e5e7eb;
    margin-bottom: 1rem;
}

.notice-list-header h2 {
    margin: 0;
    font-size: 1.5rem;
}

.notice-list-back {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    background: #fff;
    cursor: pointer;
    font-size: 0.95rem;
}

.notice-list-back:hover {
    background: #f9fafb;
}

.notice-list-empty {
    text-align: center;
    color: #9ca3af;
    padding: 4rem 1rem;
}

.notice-list-items {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.notice-list-item {
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    overflow: hidden;
    background: #fff;
}

.notice-list-item-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    padding: 0.875rem 1rem;
    background: transparent;
    border: 0;
    cursor: pointer;
    text-align: left;
    font-size: 1rem;
}

.notice-list-item-header:hover {
    background: #f9fafb;
}

.notice-list-item-title {
    flex: 1;
    font-weight: 600;
    color: #111827;
}

.notice-list-item-date {
    color: #6b7280;
    font-size: 0.85rem;
}

.notice-list-item-body {
    padding: 0 1rem 1.25rem;
    border-top: 1px solid #f3f4f6;
    line-height: 1.6;
    color: #374151;
}

.notice-list-item-body img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
}

/* 배너 클릭 시 띄우는 본문 모달 */
.notice-banner-modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 200;
    padding: 1rem;
}

.notice-banner-modal {
    background: #fff;
    border-radius: 16px;
    max-width: 600px;
    width: 100%;
    max-height: 80vh;
    overflow-y: auto;
    padding: 1.5rem;
    position: relative;
}

.notice-banner-modal-close {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    background: transparent;
    border: 0;
    font-size: 1.25rem;
    cursor: pointer;
    color: #6b7280;
    width: 32px;
    height: 32px;
    border-radius: 8px;
}

.notice-banner-modal-close:hover {
    background: #f3f4f6;
}

.notice-banner-modal-header {
    margin-bottom: 1rem;
}

.notice-banner-modal-header h3 {
    margin: 0.5rem 0 0.25rem;
    font-size: 1.25rem;
}

.notice-banner-modal-header small {
    color: #6b7280;
}

.notice-banner-modal-body {
    line-height: 1.7;
    color: #374151;
}

.notice-banner-modal-body img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
}
```

- [ ] **Step 2: 브라우저 시각 검증**

키오스크 진입 → 노란 배경의 상단 배너 노출 + "중요 공지" 라벨 + 제목 표시. 배너 hover 시 cursor pointer, 클릭 시 모달이 화면 가운데에 뜸. 메인 메뉴의 "공지사항" 카드 우상단에 빨간 카운트 배지가 보임. 카드 클릭 → 화이트 풀스크린 공지 리스트로 전환.

- [ ] **Step 3: Commit**

```bash
git add src/user_styles/main.css
git commit -m "feat(notice): add kiosk banner, menu badge and modal styles"
```

---

## Task 9: inquiry.js — 완료 시 알림 즉시 제거

**Files:**
- Modify: `src/admin_components/inquiry.js`

- [ ] **Step 1: setNotifications를 RenderInquiries로 prop 전달**

`Inquiry` 컴포넌트(line 270-285)에서 `RenderInquiries`에 `setNotifications` prop을 추가한다.

```jsx
// 변경 전
<RenderInquiries
    inquiries={categoryFilter === "all"
        ? inquiries
        : inquiries.filter(inquiry => inquiry.inquiryType === categoryFilter)
    }
    adminUsers={adminUsers}
    currentAdminUser={currentAdminUser}
    role={role}
    setinquiries={setinquiries}
    fetch_inquiry_list={fetch_inquiry_list}
/>

// 변경 후 — setNotifications 추가
<RenderInquiries
    inquiries={categoryFilter === "all"
        ? inquiries
        : inquiries.filter(inquiry => inquiry.inquiryType === categoryFilter)
    }
    adminUsers={adminUsers}
    currentAdminUser={currentAdminUser}
    role={role}
    setinquiries={setinquiries}
    fetch_inquiry_list={fetch_inquiry_list}
    setNotifications={setNotifications}
/>
```

- [ ] **Step 2: RenderInquiries 시그니처에 setNotifications 추가**

`function RenderInquiries({ ... })` 시그니처(line 290)에 `setNotifications`를 추가한다.

```javascript
// 변경 전
function RenderInquiries({ inquiries, adminUsers, currentAdminUser, role, setinquiries, fetch_inquiry_list }) {

// 변경 후
function RenderInquiries({ inquiries, adminUsers, currentAdminUser, role, setinquiries, fetch_inquiry_list, setNotifications }) {
```

- [ ] **Step 3: handleComplete 마지막에 알림 제거 로직 추가**

`handleComplete` (line 356-393)의 `showToast(...)` 호출 직전에 다음 1줄을 추가한다.

```javascript
// 변경 전 (마지막 부분)
            );
            showToast("문의가 처리 완료되었습니다.", "info");
        } catch (error) {
            console.log(error);
        }
    }

// 변경 후
            );
            setNotifications(prev => prev.filter(n => n.inquiry?.id !== inquiry.id));
            showToast("문의가 처리 완료되었습니다.", "info");
        } catch (error) {
            console.log(error);
        }
    }
```

- [ ] **Step 4: 브라우저 검증**

관리자 → 문의 관리. 처리중인 문의 1건을 골라 "완료" 버튼 클릭 → 처리결과 입력 → 확인. 우상단 종 아이콘 배지 카운트가 즉시 감소하고, 종 클릭 시 드롭다운에서 해당 inquiry의 알림이 사라져 있어야 함.

- [ ] **Step 5: Commit**

```bash
git add src/admin_components/inquiry.js
git commit -m "feat(inquiry): hide notifications related to completed inquiry"
```

---

## Task 10: inquiry.js — 알림 배지 99+ 표기

**Files:**
- Modify: `src/admin_components/inquiry.js`

- [ ] **Step 1: 배지 렌더링 IIFE로 교체**

기존 line 143-145의 배지 렌더링을 다음과 같이 변경한다.

```jsx
// 변경 전
{notifications.filter(notification => notification.read_at === null).length > 0 && (
    <span className="inquiry-notification-badge">{notifications.filter(notification => notification.read_at === null).length}</span>
)}

// 변경 후
{(() => {
    const unreadCount = notifications.filter(n => n.read_at === null).length;
    if (unreadCount === 0) return null;
    const display = unreadCount > 99 ? '99+' : unreadCount;
    return <span className="inquiry-notification-badge">{display}</span>;
})()}
```

- [ ] **Step 2: 브라우저 검증**

DevTools 콘솔에서 임시로 100건 알림을 흉내낼 수 없으므로, 배지에 1자리 숫자가 정상 표시되는지 + 종 아이콘이 0건일 때 사라지는지만 우선 확인. 추후 실제 환경에서 100건 누적 시 "99+" 노출.

- [ ] **Step 3: Commit**

```bash
git add src/admin_components/inquiry.js
git commit -m "feat(inquiry): cap notification badge count at 99+"
```

---

## Task 11: inquiry.css — 배지 크기 확대

**Files:**
- Modify: `src/admin_styles/inquiry.css`

- [ ] **Step 1: `.inquiry-notification-badge` 룰 변경**

line 230-246을 다음과 같이 교체한다.

```css
/* 변경 전 */
   .inquiry-notification-badge {
       position: absolute;
       top: -4px;
       right: -4px;
       background: var(--danger-color);
       color: white;
       font-size: 0.7rem;
       font-weight: 600;
       min-width: 18px;
       height: 18px;
       border-radius: 9px;
       display: flex;
       align-items: center;
       justify-content: center;
       padding: 0 4px;
       border: 2px solid var(--bg-white);
   }

/* 변경 후 */
   .inquiry-notification-badge {
       position: absolute;
       top: -6px;
       right: -6px;
       background: var(--danger-color);
       color: white;
       font-size: 0.85rem;
       font-weight: 700;
       min-width: 22px;
       height: 22px;
       border-radius: 11px;
       display: flex;
       align-items: center;
       justify-content: center;
       padding: 0 6px;
       border: 2px solid var(--bg-white);
   }
```

- [ ] **Step 2: 브라우저 검증**

문의 관리 페이지에서 종 아이콘 우상단의 배지가 명확히 커졌고, 두 자리 숫자(예: 알림 12건)도 잘림 없이 표시되는지 확인.

- [ ] **Step 3: Commit**

```bash
git add src/admin_styles/inquiry.css
git commit -m "feat(inquiry): enlarge notification badge for readability"
```

---

## Task 12: 통합 검증 및 마무리

**Files:** (변경 없음 — 검수 단계)

- [ ] **Step 1: localStorage 초기화 후 시드 동작 확인**

DevTools → Application → Local Storage → `garam.notices` 키 삭제 → 키오스크 새로고침 → 시드 2건이 다시 들어오는지 확인.

- [ ] **Step 2: spec §8 검증 시나리오 1~15 전수 확인**

- 1. superadmin 로그인 → 공지사항 관리 메뉴 표시
- 2. 일반 admin 로그인 → 공지사항 관리 메뉴 비표시
- 3. 신규 등록 → localStorage 즉시 반영
- 4. 같은 브라우저 키오스크에서 노출
- 5. 마크다운 (헤더·굵기·리스트·이미지) 렌더링
- 6. 이미지 업로드 (1MB 이내) → base64 본문 삽입 → 키오스크 정상 노출
- 7. is_important 등록 → 키오스크 배너 즉시 노출 (재진입 후)
- 8. is_important=false → 배너 비표시, 메뉴 항목에서만 보임
- 9. starts_at 미래 → 키오스크에서 비표시
- 10. ends_at 경과 → 키오스크에서 비표시
- 11. 삭제 → storage·관리자·키오스크 모두에서 사라짐
- 12. 문의 완료 → 알림 카운트 즉시 감소 + 드롭다운에서 제거
- 13. 알림 0건 → 배지 비표시
- 14. 100건 이상 → "99+" 표기 (코드 검토로 확인)
- 15. 두 자리 숫자 가독성

- [ ] **Step 3: 빌드 검증**

```bash
npm run build
```

Expected: 에러 없이 성공. 경고는 기존 수준을 초과하지 않는지 확인.

- [ ] **Step 4: 최종 Commit (필요시)**

검증 중 발견한 버그가 있으면 수정 commit. 없으면 본 단계 생략.

```bash
git status
git log --oneline -15
```

---

## Implementation Order Summary

```
1. notice_storage.js (헬퍼 + 시드)            ← 독립
2. notice_modal.js (모달 컴포넌트)             ← 독립 (utill만 의존)
3. notice.js (관리자 페이지)                   ← 1, 2 의존
4. notice.css (관리자 스타일)                  ← 독립
5. sidebar.js (메뉴 추가)                       ← 독립
6. Admin.js (라우팅)                            ← 3, 5 의존
   ── 여기서 관리자 측 동작 가능 ──
7. Main.js (배너 + 메뉴 + 모달)                 ← 1 의존
8. main.css (키오스크 스타일)                   ← 7 시각 대응
   ── 여기서 키오스크 측 동작 가능 ──
9. inquiry.js (완료 시 알림 제거)               ← 독립
10. inquiry.js (99+ 표기)                       ← 9와 같은 파일, 별 commit 권장
11. inquiry.css (배지 크기)                     ← 독립
   ── 여기서 알림 개선 동작 가능 ──
12. 통합 검증
```

각 작업은 독립적인 commit이며, 도중 중단되어도 다음 작업이 영향을 받지 않도록 설계했다.
