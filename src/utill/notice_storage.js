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
