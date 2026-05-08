import { useState, useEffect } from 'react';
import { showToast } from '../utill/utill';
import {
    getNotices,
    createNotice,
    updateNotice,
    deleteNotice,
} from '../utill/notice_storage';
import NoticeModal from './notice_modal';

export default function Notice() {
    const [notices, setNotices] = useState([]);
    const [search, setSearch] = useState('');
    const [editTarget, setEditTarget] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const adminId = sessionStorage.getItem('admin_id')
        ? parseInt(sessionStorage.getItem('admin_id'), 10)
        : null;

    const reload = async () => {
        setLoading(true);
        try {
            const list = await getNotices({ limit: 100 });
            setNotices(list);
        } catch (err) {
            console.error(err);
            showToast('공지사항을 불러오지 못했습니다.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { reload(); }, []);

    const counts = notices.reduce((acc, n) => {
        acc.total += 1;
        acc[n.status] = (acc[n.status] || 0) + 1;
        return acc;
    }, { total: 0, active: 0, scheduled: 0, expired: 0 });

    const filtered = notices.filter(n =>
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.content.toLowerCase().includes(search.toLowerCase())
    );

    const openCreate = () => { setEditTarget(null); setShowModal(true); };
    const openEdit = (notice) => { setEditTarget(notice); setShowModal(true); };
    const closeModal = () => { setShowModal(false); setEditTarget(null); };

    const handleSubmit = async (input) => {
        try {
            if (editTarget) {
                await updateNotice(editTarget.id, input);
                showToast('공지사항이 수정되었습니다.', 'success');
            } else {
                await createNotice({ ...input, author_admin_id: adminId });
                showToast('공지사항이 등록되었습니다.', 'success');
            }
            closeModal();
            await reload();
        } catch (err) {
            console.error(err);
            showToast('공지사항 저장에 실패했습니다.', 'error');
        }
    };

    const handleDelete = async (notice) => {
        if (!window.confirm(`"${notice.title}" 공지를 삭제하시겠습니까?`)) return;
        try {
            await deleteNotice(notice.id);
            showToast('공지사항이 삭제되었습니다.', 'warning');
            await reload();
        } catch (err) {
            console.error(err);
            showToast('공지사항 삭제에 실패했습니다.', 'error');
        }
    };

    const formatDate = (iso) => iso ? new Date(iso).toLocaleString('ko-KR') : '-';
    const previewText = (md) => {
        const stripped = (md || '')
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
                            <p className="page-subtitle">중요 공지는 키오스크 진입 시 팝업으로, 일반 공지는 공지사항 메뉴에서 노출됩니다</p>
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

                    {loading ? (
                        <div className="empty-state"><p>불러오는 중...</p></div>
                    ) : filtered.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">
                                <i className="fas fa-bullhorn"></i>
                            </div>
                            <p>등록된 공지사항이 없습니다.</p>
                        </div>
                    ) : (
                        <div className="notice-list">
                            {filtered.map((notice) => {
                                const status = notice.status;
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
                                            <span><i className="fas fa-calendar-plus"></i> 등록 {formatDate(notice.created_at)}</span>
                                            <span><i className="fas fa-play-circle"></i> 시작 {formatDate(notice.start_at)}</span>
                                            <span><i className="fas fa-stop-circle"></i> 종료 {formatDate(notice.end_at)}</span>
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
