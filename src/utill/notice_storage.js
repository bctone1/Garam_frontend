import axios from 'axios';

const API = process.env.REACT_APP_API_URL;

export async function getNotices(params = {}) {
    const { offset = 0, limit = 50, status = 'all', importantOnly = false, q } = params;
    const res = await axios.get(`${API}/notices/`, {
        params: {
            offset,
            limit,
            status,
            important_only: importantOnly,
            ...(q ? { q } : {}),
        },
    });
    return res.data;
}

export async function getActiveNotices(importantOnly = false) {
    return getNotices({ status: 'active', importantOnly, limit: 100 });
}

export async function getNoticeSummary() {
    const res = await axios.get(`${API}/notices/summary`);
    return res.data;
}

export async function createNotice(payload) {
    const res = await axios.post(`${API}/notices/`, payload);
    return res.data;
}

export async function updateNotice(id, patch) {
    const res = await axios.patch(`${API}/notices/${id}`, patch);
    return res.data;
}

export async function deleteNotice(id) {
    await axios.delete(`${API}/notices/${id}`);
}

export async function uploadNoticeImage(file) {
    const fd = new FormData();
    fd.append('file', file);
    const res = await axios.post(`${API}/notices/images`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
}

export function resolveNoticeAssetUrl(url) {
    if (!url) return url;
    if (/^https?:\/\//i.test(url) || url.startsWith('data:')) return url;
    return `${API}${url}`;
}

const DISMISS_KEY = 'garam.notices.dismissed_map';

export function getDismissedMap() {
    try {
        return JSON.parse(localStorage.getItem(DISMISS_KEY) || '{}');
    } catch {
        return {};
    }
}

export function dismissNoticeForToday(id) {
    const today = new Date().toISOString().split('T')[0];
    const map = getDismissedMap();
    map[id] = today;
    localStorage.setItem(DISMISS_KEY, JSON.stringify(map));
}

export function isDismissedToday(id) {
    const today = new Date().toISOString().split('T')[0];
    return getDismissedMap()[id] === today;
}
