import { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { showToast } from '../utill/utill';

const MAX_IMAGE_BYTES = 1024 * 1024;

export default function NoticeModal({ initial, onClose, onSubmit }) {
    const initialSnapshot = {
        title: initial?.title || '',
        content: initial?.content || '',
        is_important: initial?.is_important || false,
        starts_at: initial?.starts_at ? toDatetimeLocal(initial.starts_at) : '',
        ends_at: initial?.ends_at ? toDatetimeLocal(initial.ends_at) : '',
    };
    const [form, setForm] = useState(initialSnapshot);
    const [showPreview, setShowPreview] = useState(false);
    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);

    const isEdit = !!initial;

    const isDirty = (
        form.title !== initialSnapshot.title ||
        form.content !== initialSnapshot.content ||
        form.is_important !== initialSnapshot.is_important ||
        form.starts_at !== initialSnapshot.starts_at ||
        form.ends_at !== initialSnapshot.ends_at
    );

    const requestClose = () => {
        if (!isDirty) {
            onClose();
            return;
        }
        if (window.confirm('입력한 내용이 사라집니다. 닫으시겠습니까?')) {
            onClose();
        }
    };

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
            <div className="modal-backdrop" onClick={requestClose}></div>
            <div className="modal-container notice-modal-container">
                <div className="modal-header">
                    <h3 className="modal-title">{isEdit ? '공지사항 수정' : '공지사항 추가'}</h3>
                    <button className="modal-close" onClick={requestClose}>
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
                                <span>중요 공지 (키오스크 진입 시 팝업으로 노출)</span>
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
                    <button className="btn btn-secondary" onClick={requestClose}>취소</button>
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
