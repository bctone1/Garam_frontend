import axios from "axios";
import { showToast } from '../utill/utill';
import { useState, useEffect } from 'react';

export default function Inquiry({ setRole, role, setadmin_email, setadmin_name }) {
    const admin_name = sessionStorage.getItem("admin_name");
    useEffect(() => {
        setcurrentAdminUser(admin_name);
    }, [admin_name]);


    const fetch_admin_users = () => {
        axios
            .get(`${process.env.REACT_APP_API_URL}/admin_users`, {
                params: {
                    offset: 0,
                    limit: 50,
                    // 필요하다면 department, q도 추가 가능
                    // department: "HR",
                    // q: "홍길동"
                },
            })
            .then((res) => {
                setadminUsers(res.data);
                console.log("📌 관리자 목록:", res.data);
            })
            .catch((err) => {
                if (err.response && err.response.status === 404) {
                    alert("해당 setting을 찾을 수 없습니다.");
                } else {
                    console.error("❌ 요청 실패:", err);
                }
            });
    }

    useEffect(() => {
        fetch_admin_users();
        fetch_inquiry_list();

    }, []);


    const fetch_inquiry_list = () => {
        axios
            .get(`${process.env.REACT_APP_API_URL}/inquiries/get_inquiry_list`)
            .then((res) => {
                setinquiries(res.data);
                console.log("📌 문의 목록:", res.data);
            })
            .catch((err) => {
                if (err.response && err.response.status === 404) {
                    alert("해당 setting을 찾을 수 없습니다.");
                } else {
                    console.error("❌ 요청 실패:", err);
                }
            });
    }

    const [adminUsers, setadminUsers] = useState([]);

    const [inquiries, setinquiries] = useState([
        {
            id: 1,
            name: '문의자1',
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
            name: '문의자2',
            company: '스마트카페',
            phone: '010-2345-6789',
            content: '키오스크 터치 반응이 느려서 고객들이 불편해하고 있습니다. 설정 방법을 알려주세요.',
            status: 'processing',
            createdDate: '2024-12-20 13:15',
            assignee: '임영빈',
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
                    admin: '임영빈',
                    timestamp: '2024-12-20 13:45',
                    details: '이관리님이 문의를 담당하게 되었습니다.'
                }
            ]
        },
        {
            id: 3,
            name: '문의자3',
            company: '베이커리하우스',
            phone: '010-3456-7890',
            content: '프린터에서 영수증이 출력되지 않습니다. 용지는 충분한 상태인데 어떻게 해야 할까요?',
            status: 'completed',
            createdDate: '2024-12-19 16:20',
            assignee: '박인식',
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
                    admin: '박인식',
                    timestamp: '2024-12-19 16:30',
                    details: '김관리님이 문의를 담당하게 되었습니다.'
                },
                {
                    action: '처리 완료',
                    admin: '박인식',
                    timestamp: '2024-12-20 09:30',
                    details: '프린터 드라이버 재설치로 문제가 해결되었습니다.'
                }
            ]
        }
    ]);
    const [currentAdminUser, setcurrentAdminUser] = useState("");

    const [openAddAdminModal, setopenAddAdminModal] = useState(false);

    return (
        <>
            <div className={`modal ${openAddAdminModal ? "show" : ""}`} id="addAdminModal" onClick={() => setopenAddAdminModal(false)}>
                <AddAdminModal setopenAddAdminModal={setopenAddAdminModal} fetch_admin_users={fetch_admin_users} />
            </div>

            <main className="inquiry-main-content">
                <div className="page-header">
                    <h1 className="page-title">문의 관리</h1>
                    <p className="page-subtitle">챗봇을 통해 접수된 고객 문의를 관리합니다</p>

                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-number">{inquiries.length}</div>
                            <div className="stat-label">전체 문의</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number">0</div>
                            <div className="stat-label">신규 문의</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number">0</div>
                            <div className="stat-label">처리중</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number">0</div>
                            <div className="stat-label">처리 대기</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number">0</div>
                            <div className="stat-label">처리 완료</div>
                        </div>
                    </div>
                </div>

                {/* 관리자 관리 섹션  */}
                <div className="admin-management">
                    <div className="section-header">
                        <h3 className="section-title">관리자 관리</h3>

                        {role === "superadmin" && (
                            <button className="btn btn-primary"
                                onClick={() => setopenAddAdminModal(true)}
                            >
                                <i className="fas fa-user-plus"></i>
                                관리자 추가
                            </button>
                        )}





                    </div>
                    <div className="admin-grid" id="adminGrid">
                        <RenderAdminGrid
                            adminUsers={adminUsers}
                            currentAdminUser={currentAdminUser}
                            setcurrentAdminUser={setcurrentAdminUser}
                            setRole={setRole}
                            role={role}
                            setadmin_email={setadmin_email}
                            setadmin_name={setadmin_name}
                            inquiries={inquiries}
                        />
                    </div>
                </div>

                <div className="inquiry-section">
                    <div className="section-header">
                        <h3 className="section-title">문의 목록</h3>
                    </div>
                    <div className="inquiry-list" id="inquiryList">
                        <RenderInquiries
                            inquiries={inquiries}
                            adminUsers={adminUsers}
                            currentAdminUser={currentAdminUser}
                            role={role}
                            setinquiries={setinquiries}
                        />
                    </div>
                </div>
            </main>
        </>
    )
}

function RenderInquiries({ inquiries, adminUsers, currentAdminUser, role, setinquiries }) {
    const [openDropdownId, setOpenDropdownId] = useState(null);

    const sudo = role === "superadmin" ? true : false

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

    const filteredInquiries = inquiries.filter((inquiry) => {
        if (sudo) return true; // superadmin은 모든 항목 표시
        return inquiry.assignee && inquiry.assignee === currentAdminUser;
    });

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
    const toggleDropdown = (id) => {
        setOpenDropdownId((prev) => (prev === id ? null : id));
    };

    const handleSelectAdmin = ({ admin, inquiry, action }) => {
        if (action === "신규배정") {
            setinquiries((prevInquiries) =>
                prevInquiries.map((item) =>
                    item.id === inquiry.id
                        ? {
                            ...item,
                            status: "processing",
                            assignee: admin.name,          // 담당자 교체
                            assignedDate: new Date().toISOString().slice(0, 19).replace("T", " "), // 배정 시간도 업데이트 가능
                            history: [
                                ...(item.history || []),
                                {
                                    action: "assign",
                                    admin: admin.name,
                                    timestamp: new Date().toISOString().slice(0, 19).replace("T", " "),
                                    details: `${admin.name}님이 문의를 담당하게 되었습니다.`,
                                },
                            ],
                        }
                        : item
                )
            );
        } else {
            const inputreason = prompt("이관사유를 입력해주세요");

            setinquiries((prevInquiries) =>
                prevInquiries.map((item) =>
                    item.id === inquiry.id
                        ? {
                            ...item,
                            status: "processing",
                            assignee: admin.name,
                            assignedDate: new Date().toISOString().slice(0, 19).replace("T", " "),
                            history: [
                                ...(item.history || []),
                                {
                                    action: "transfer",
                                    admin: admin.name,
                                    timestamp: new Date().toISOString().slice(0, 19).replace("T", " "),
                                    details: `${item.assignee || "미지정"} -> ${admin.name} (사유:${inputreason})`,
                                },
                            ],
                        }
                        : item
                )
            );

        }

        showToast(`${admin.name}문의가 ${action}되었습니다.`, "info");
        toggleDropdown(inquiry.id); // 드롭다운 닫기
    };


    return (
        <>
            {filteredInquiries.length === 0 && (
                <div className="empty-state">
                    <div className="empty-icon">
                        <i className="fas fa-inbox"></i>
                    </div>
                    <p>아직 접수된 문의가 없습니다.</p>
                </div>
            )}
            {filteredInquiries.map((inquiry) => {
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
                                onClick={() => toggleDropdown(inquiry.id)}
                            >
                                <i className="fas fa-user-plus"></i> 담당자 지정
                            </button>

                            <div
                                className={`assign-dropdown-menu ${openDropdownId === inquiry.id ? "show" : ""}`}
                                id={`dropdown-${inquiry.id}`}
                            >
                                {adminUsers.map((admin) => (
                                    <div key={admin.name} className="assign-dropdown-item"
                                        onClick={() => handleSelectAdmin({ admin, inquiry, action: "신규배정" })}
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
                } else if (inquiry.status === "processing" && (isCurrentUser || sudo)) {
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
                                    onClick={() => toggleDropdown(inquiry.id)}
                                >
                                    <i className="fas fa-exchange-alt"></i> 이관
                                </button>
                                <div
                                    className={`assign-dropdown-menu ${openDropdownId === inquiry.id ? "show" : ""}`}
                                    id={`dropdown-${inquiry.id}`}
                                >
                                    {adminUsers.map((admin) => (
                                        <div key={admin.name} className="assign-dropdown-item"
                                            onClick={() => handleSelectAdmin({ admin, inquiry, action: "이관" })}
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
                } else if (inquiry.status === "on_hold" && (isCurrentUser || sudo)) {
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
                                    onClick={() => toggleDropdown(inquiry.id)}
                                >
                                    <i className="fas fa-exchange-alt"></i> 이관
                                </button>
                                <div
                                    className={`assign-dropdown-menu ${openDropdownId === inquiry.id ? "show" : ""}`}
                                    id={`dropdown-${inquiry.id}`}
                                >
                                    {adminUsers.map((admin) => (
                                        <div key={admin.name} className="assign-dropdown-item"
                                            onClick={() => handleSelectAdmin({ admin, inquiry, action: "이관" })}
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



function RenderAdminGrid({ adminUsers, currentAdminUser, setcurrentAdminUser, setRole, role, setadmin_email, setadmin_name, inquiries }) {

    const getAssignedCount = (adminName) =>
        inquiries.filter(i => i.assignee === adminName && i.status === "processing").length;

    const getCompletedCount = (adminName) =>
        inquiries.filter(i => i.assignee === adminName && i.status === "completed").length;


    const switchToAdmin = (admin) => {
        const inputPassword = prompt(`"${admin.name}" 계정의 비밀번호를 입력하세요:`);
        if (!inputPassword) return;
        if (inputPassword === admin.password) {
            const newRole = admin.id === 0 ? "superadmin" : "admin";
            sessionStorage.setItem("role", newRole);
            sessionStorage.setItem("admin_name", admin.name);
            sessionStorage.setItem("admin_email", admin.email);
            sessionStorage.setItem("admin_id", admin.id);

            setRole(newRole); // <-- React state 갱신
            setadmin_email(admin.email);
            setadmin_name(admin.name);

            setcurrentAdminUser(admin.name);
            showToast(`${admin.name}으로 전환되었습니다.`, "info");
        } else {
            alert("❌ 비밀번호가 틀립니다.");
        }
    };

    return (
        <>
            {adminUsers.map((admin) => {
                const isCurrentUser = admin.name === currentAdminUser;
                const assignedCount = getAssignedCount(admin.name);
                const completedCount = getCompletedCount(admin.name);
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
                                <div className="admin-stat-number">{assignedCount}</div>
                                <div className="admin-stat-label">담당 중</div>
                            </div>
                            <div className="admin-stat">
                                <div className="admin-stat-number">{completedCount}</div>
                                <div className="admin-stat-label">완료</div>
                            </div>
                        </div>


                        <div className="admin-actions">
                            {!isCurrentUser && (
                                <button
                                    className="btn btn-sm btn-primary"
                                    onClick={() => switchToAdmin(admin)}
                                >
                                    <i className="fas fa-exchange-alt"></i> 전환
                                </button>
                            )}

                            {role === "superadmin" && (
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

                            )}

                        </div>
                    </div>
                );
            })}
        </>
    );
}

function AddAdminModal({ setopenAddAdminModal, fetch_admin_users }) {
    const [NewUser, setNewUser] = useState({});

    const create_admin = () => {
        axios.post(`${process.env.REACT_APP_API_URL}/admin_users`, NewUser)
            .then((res) => {
                console.log("생성된 관리자:", res.data);
                showToast(`${NewUser.name} 관리자가 추가되었습니다.`, 'success');
                setopenAddAdminModal(false);
                fetch_admin_users();
            })
            .catch((err) => {
                showToast("관리자 추가중 오류가 발생했습니다.", 'error');
            });
    }


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
                    <label className="form-label">비밀번호</label>
                    <input type="password" className="form-input" id="adminPassword" value={NewUser.password}
                        onChange={(e) =>
                            setNewUser((prev) => ({ ...prev, password: e.target.value }))
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
                        value={NewUser.department}
                        onChange={(e) =>
                            setNewUser((prev) => ({ ...prev, department: e.target.value }))
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
                        onClick={() => create_admin()}
                    >
                        추가
                    </button>
                </div>
            </div>
        </div>
    );
}
