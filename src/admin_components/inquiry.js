import { showToast } from '../utill/utill';
import { useState } from 'react';

export default function Inquiry() {
    const adminUsers = [
        {
            id: 'admin1',
            name: '김관리',
            email: 'kim@garampos.com',
            department: '고객지원팀',
            assignedCount: 0,
            completedCount: 1
        },
        {
            id: 'admin2',
            name: '이관리',
            email: 'lee@garampos.com',
            department: '기술지원팀',
            assignedCount: 1,
            completedCount: 0
        },
        {
            id: 'admin3',
            name: '박관리',
            email: 'park@garampos.com',
            department: '운영팀',
            assignedCount: 0,
            completedCount: 0
        }
    ];

    const inquiries = [
        {
            id: 1,
            name: '홍길동',
            company: '가람포스텍',
            phone: '010-1234-5678',
            content: 'POS 시스템이 갑자기 꺼져서 재부팅을 해도 계속 같은 문제가 발생합니다. 긴급히 해결이 필요합니다.',
            status: 'new',
            createdDate: '2024-12-20 14:30',
            assignee: null,
            history: [
                {
                    action: '문의 접수',
                    admin: '시스템',
                    timestamp: '2024-12-20 14:30',
                    details: '챗봇을 통해 문의가 접수되었습니다.'
                }
            ]
        },
        {
            id: 2,
            name: '김영희',
            company: '스마트카페',
            phone: '010-2345-6789',
            content: '키오스크 터치 반응이 느려서 고객들이 불편해하고 있습니다. 설정 방법을 알려주세요.',
            status: 'processing',
            createdDate: '2024-12-20 13:15',
            assignee: '이관리',
            assignedDate: '2024-12-20 13:45',
            history: [
                {
                    action: '문의 접수',
                    admin: '시스템',
                    timestamp: '2024-12-20 13:15',
                    details: '챗봇을 통해 문의가 접수되었습니다.'
                },
                {
                    action: '담당자 배정',
                    admin: '이관리',
                    timestamp: '2024-12-20 13:45',
                    details: '이관리님이 문의를 담당하게 되었습니다.'
                }
            ]
        },
        {
            id: 3,
            name: '박철수',
            company: '베이커리하우스',
            phone: '010-3456-7890',
            content: '프린터에서 영수증이 출력되지 않습니다. 용지는 충분한 상태인데 어떻게 해야 할까요?',
            status: 'completed',
            createdDate: '2024-12-19 16:20',
            assignee: '김관리',
            assignedDate: '2024-12-19 16:30',
            completedDate: '2024-12-20 09:30',
            history: [
                {
                    action: '문의 접수',
                    admin: '시스템',
                    timestamp: '2024-12-19 16:20',
                    details: '챗봇을 통해 문의가 접수되었습니다.'
                },
                {
                    action: '담당자 배정',
                    admin: '김관리',
                    timestamp: '2024-12-19 16:30',
                    details: '김관리님이 문의를 담당하게 되었습니다.'
                },
                {
                    action: '처리 완료',
                    admin: '김관리',
                    timestamp: '2024-12-20 09:30',
                    details: '프린터 드라이버 재설치로 문제가 해결되었습니다.'
                }
            ]
        }
    ];
    const [currentAdminUser, setcurrentAdminUser] = useState("김관리");



    const [openAddAdminModal, setopenAddAdminModal] = useState(false);

    return (
        <>
            <div className={`modal ${openAddAdminModal ? "show" : ""}`} id="addAdminModal" onClick={() => setopenAddAdminModal(false)}>
                <AddAdminModal setopenAddAdminModal={setopenAddAdminModal} />

            </div>

            <main class="inquiry-main-content">
                <div class="page-header">
                    <h1 class="page-title">문의 관리</h1>
                    <p class="page-subtitle">챗봇을 통해 접수된 고객 문의를 관리합니다</p>

                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-number">0</div>
                            <div class="stat-label">전체 문의</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">0</div>
                            <div class="stat-label">신규 문의</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">0</div>
                            <div class="stat-label">처리중</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">0</div>
                            <div class="stat-label">처리 대기</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">0</div>
                            <div class="stat-label">처리 완료</div>
                        </div>
                    </div>
                </div>

                {/* 관리자 관리 섹션  */}
                <div class="admin-management">
                    <div class="section-header">
                        <h3 class="section-title">관리자 관리</h3>
                        <button class="btn btn-primary"
                            onClick={() => setopenAddAdminModal(true)}
                        >
                            <i class="fas fa-user-plus"></i>
                            관리자 추가
                        </button>
                    </div>
                    <div class="admin-grid" id="adminGrid">
                        {/* 관리자 카드들이 동적으로 추가됩니다 */}
                        <RenderAdminGrid adminUsers={adminUsers} currentAdminUser={currentAdminUser} setcurrentAdminUser={setcurrentAdminUser} />
                    </div>
                </div>

                <div class="inquiry-section">
                    <div class="section-header">
                        <h3 class="section-title">문의 목록</h3>
                    </div>
                    <div class="inquiry-list" id="inquiryList">
                        {/* 문의 목록이 여기에 동적으로 추가됩니다 */}
                        <RenderInquiries inquiries={inquiries} adminUsers={adminUsers} currentAdminUser={currentAdminUser} />
                    </div>
                </div>
            </main>
        </>
    )
}
function RenderInquiries({ inquiries, adminUsers, currentAdminUser }) {
    const statusText = {
        new: "신규",
        processing: "처리중",
        on_hold: "대기",
        completed: "완료",
    };

    const statusClass = {
        new: "status-new",
        processing: "status-processing",
        on_hold: "status-on_hold",
        completed: "status-completed",
    };

    if (inquiries.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-icon">
                    <i className="fas fa-inbox"></i>
                </div>
                <p>아직 접수된 문의가 없습니다.</p>
            </div>
        );
    }

    return (
        <>
            {inquiries.map((inquiry) => {
                const isCurrentUser = inquiry.assignee === currentAdminUser;

                const processorInfo = inquiry.assignee && (
                    <div className="processor-info">
                        <div className="assignee-avatar">{inquiry.assignee.charAt(0)}</div>
                        <span>담당자: {inquiry.assignee}</span>
                        {inquiry.assignedDate && <span>• {inquiry.assignedDate}</span>}
                    </div>
                );

                const historyHtml = inquiry.history.map((item, idx) => (
                    <div key={idx} className="history-item">
                        <div className="history-action">{item.action}</div>
                        <div className="history-admin">by {item.admin}</div>
                        <div className="history-time">{item.timestamp}</div>
                        {item.details && (
                            <div
                                style={{
                                    fontSize: "0.75rem",
                                    color: "var(--text-secondary)",
                                    marginTop: "0.25rem",
                                }}
                            >
                                {item.details}
                            </div>
                        )}
                    </div>
                ));

                // 액션 버튼 조건
                let actionButtons = null;
                if (inquiry.status === "new") {
                    actionButtons = (
                        <div className="assign-dropdown">
                            <button
                                className="btn btn-warning btn-sm"

                            >
                                <i className="fas fa-user-plus"></i> 담당자 지정
                            </button>
                            <div className="assign-dropdown-menu" id={`dropdown-${inquiry.id}`}>
                                {adminUsers.map((admin) => (
                                    <div
                                        key={admin.name}
                                        className="assign-dropdown-item"

                                    >
                                        <div className="admin-avatar">{admin.name.charAt(0)}</div>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{admin.name}</div>
                                            <div
                                                style={{
                                                    fontSize: "0.75rem",
                                                    color: "var(--text-secondary)",
                                                }}
                                            >
                                                {admin.department}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                } else if (inquiry.status === "processing" && isCurrentUser) {
                    actionButtons = (
                        <div className="action-buttons">
                            <button
                                className="btn btn-info btn-sm"

                            >
                                <i className="fas fa-phone"></i> 연락
                            </button>
                            <button
                                className="btn btn-secondary btn-sm"

                            >
                                <i className="fas fa-sticky-note"></i> 메모
                            </button>
                            <button
                                className="btn btn-warning btn-sm"

                            >
                                <i className="fas fa-pause"></i> 대기
                            </button>
                            <div className="assign-dropdown">
                                <button
                                    className="btn btn-primary btn-sm"

                                >
                                    <i className="fas fa-exchange-alt"></i> 이관
                                </button>
                                <div
                                    className="assign-dropdown-menu"
                                    id={`transfer-dropdown-${inquiry.id}`}
                                >
                                    {adminUsers
                                        .filter((a) => a.name !== currentAdminUser)
                                        .map((admin) => (
                                            <div
                                                key={admin.name}
                                                className="assign-dropdown-item"

                                            >
                                                <div className="admin-avatar">{admin.name.charAt(0)}</div>
                                                <div>
                                                    <div style={{ fontWeight: 600 }}>{admin.name}</div>
                                                    <div
                                                        style={{
                                                            fontSize: "0.75rem",
                                                            color: "var(--text-secondary)",
                                                        }}
                                                    >
                                                        {admin.department}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                            <button
                                className="btn btn-success btn-sm"

                            >
                                <i className="fas fa-check"></i> 완료
                            </button>
                        </div>
                    );
                } else if (inquiry.status === "on_hold" && isCurrentUser) {
                    actionButtons = (
                        <div className="action-buttons">
                            <button
                                className="btn btn-info btn-sm"
                            >
                                <i className="fas fa-play"></i> 재개
                            </button>
                            <button
                                className="btn btn-secondary btn-sm"
                            >
                                <i className="fas fa-sticky-note"></i> 메모
                            </button>
                            <div className="assign-dropdown">
                                <button
                                    className="btn btn-primary btn-sm"
                                >
                                    <i className="fas fa-exchange-alt"></i> 이관
                                </button>
                                <div
                                    className="assign-dropdown-menu"
                                    id={`transfer-dropdown-${inquiry.id}`}
                                >
                                    {adminUsers
                                        .filter((a) => a.name !== currentAdminUser)
                                        .map((admin) => (
                                            <div
                                                key={admin.name}
                                                className="assign-dropdown-item"
                                            >
                                                <div className="admin-avatar">{admin.name.charAt(0)}</div>
                                                <div>
                                                    <div style={{ fontWeight: 600 }}>{admin.name}</div>
                                                    <div
                                                        style={{
                                                            fontSize: "0.75rem",
                                                            color: "var(--text-secondary)",
                                                        }}
                                                    >
                                                        {admin.department}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                            <button
                                className="btn btn-success btn-sm"

                            >
                                <i className="fas fa-check"></i> 완료
                            </button>
                        </div>
                    );
                }

                return (
                    <div key={inquiry.id} className="inquiry-item">
                        <div className="inquiry-header">
                            <div className="inquiry-info">
                                <div className="inquiry-name">{inquiry.name}</div>
                                <div className="inquiry-meta">
                                    {inquiry.company} • {inquiry.phone} • {inquiry.createdDate}
                                </div>
                            </div>
                            <div className="inquiry-actions">
                                <span className={`status-badge ${statusClass[inquiry.status]}`}>
                                    {statusText[inquiry.status]}
                                </span>
                                {actionButtons}
                                <button
                                    className="btn btn-danger btn-sm"

                                >
                                    <i className="fas fa-trash"></i> 삭제
                                </button>
                            </div>
                        </div>
                        <div className="inquiry-content">{inquiry.content}</div>
                        {processorInfo}
                        <div className="history-timeline">{historyHtml}</div>
                    </div>
                );
            })}
        </>
    );
}



function RenderAdminGrid({ adminUsers, currentAdminUser, setcurrentAdminUser }) {
    const switchToAdmin = (adminName) => {
        setcurrentAdminUser(adminName)
        // alert(adminName);
        // currentAdminUser = adminName;
        // const userNameElement = document.querySelector('.user-name');
        // if (userNameElement) {
        //     userNameElement.textContent = currentAdminUser;
        // }


        showToast(`${adminName}으로 전환되었습니다.`, 'info');

    }
    return (
        <>
            {adminUsers.map((admin) => {
                const isCurrentUser = admin.name === currentAdminUser;



                return (
                    <div
                        key={admin.id}
                        className={`admin-card ${isCurrentUser ? "current" : ""}`}
                    >
                        {isCurrentUser && <div className="current-badge">현재 사용자</div>}

                        <div className="admin-info">
                            <div className="admin-avatar">{admin.name.charAt(0)}</div>
                            <div className="admin-details">
                                <h4>{admin.name}</h4>
                                <p>{admin.email}</p>
                                <p
                                    style={{
                                        fontSize: "0.8rem",
                                        color: "var(--primary-color)",
                                    }}
                                >
                                    {admin.department}
                                </p>
                            </div>
                        </div>

                        <div className="admin-stats">
                            <div className="admin-stat">
                                <div className="admin-stat-number">{admin.assignedCount}</div>
                                <div className="admin-stat-label">담당 중</div>
                            </div>
                            <div className="admin-stat">
                                <div className="admin-stat-number">{admin.completedCount}</div>
                                <div className="admin-stat-label">완료</div>
                            </div>
                        </div>

                        <div className="admin-actions">
                            {!isCurrentUser && (
                                <button
                                    className="btn btn-sm btn-primary"
                                    onClick={() => switchToAdmin(admin.name)}
                                >
                                    <i className="fas fa-exchange-alt"></i> 전환
                                </button>
                            )}

                            <button
                                className="btn btn-sm btn-danger"

                                disabled={isCurrentUser}
                                style={
                                    isCurrentUser
                                        ? { opacity: 0.5, cursor: "not-allowed" }
                                        : {}
                                }
                            >
                                <i className="fas fa-trash"></i> 삭제
                            </button>
                        </div>
                    </div>
                );
            })}
        </>
    );
}

function AddAdminModal({ setopenAddAdminModal }) {
    const [NewUser, setNewUser] = useState({
        name: null,
        email: null,
        group: null
    });
    return (
        <div className="modal-content" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
                <h3 className="modal-title">관리자 추가</h3>
                <button className="modal-close" onClick={() => setopenAddAdminModal(false)}>
                    &times;
                </button>
            </div>
            <div id="addAdminForm">
                <div className="form-group">
                    <label className="form-label">이름</label>
                    <input type="text" className="form-input" id="adminName" value={NewUser.name}
                        onChange={(e) =>
                            setNewUser((prev) => ({ ...prev, name: e.target.value }))
                        }
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">이메일</label>
                    <input type="email" className="form-input" id="adminEmail" value={NewUser.email}
                        onChange={(e) =>
                            setNewUser((prev) => ({ ...prev, email: e.target.value }))
                        }
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">부서</label>
                    <input
                        type="text"
                        className="form-input"
                        id="adminDepartment"
                        placeholder="예: 고객지원팀"
                        value={NewUser.group}
                        onChange={(e) =>
                            setNewUser((prev) => ({ ...prev, group: e.target.value }))
                        }
                    />
                </div>
                <div
                    style={{
                        display: "flex",
                        gap: "0.5rem",
                        justifyContent: "flex-end",
                        marginTop: "1.5rem",
                    }}
                >
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setopenAddAdminModal(false)}
                    >
                        취소
                    </button>
                    <button type="submit" className="btn btn-primary"
                        onClick={() => showToast(`${NewUser.name} 관리자가 추가되었습니다.`, 'success')}
                    >
                        추가
                    </button>
                </div>
            </div>
        </div>
    );
}
