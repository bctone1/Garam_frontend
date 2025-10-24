import axios from "axios";
import { showToast } from '../utill/utill';
import { useState, useEffect } from 'react';

export default function Inquiry({ setRole, role, setadmin_email, setadmin_name }) {

    const [adminUsers, setadminUsers] = useState([]);
    const [inquiries, setinquiries] = useState([]);
    const [currentAdminUser, setcurrentAdminUser] = useState("");
    const [openAddAdminModal, setopenAddAdminModal] = useState(false);
    const admin_name = sessionStorage.getItem("admin_name");

    useEffect(() => {
        setcurrentAdminUser(admin_name);
    }, [admin_name]);

    useEffect(() => {
        fetch_admin_users();
        fetch_inquiry_list();
    }, []);

    const fetch_admin_users = () => {
        axios.get(`${process.env.REACT_APP_API_URL}/admin_users`, {
            params: {
                offset: 0,
                limit: 50,
            },
        }).then((res) => {
            setadminUsers(res.data);
        }).catch((err) => {
            console.log(err);
        });
    }


    const fetch_inquiry_list = () => {
        axios.get(`${process.env.REACT_APP_API_URL}/inquiries/get_inquiry_list`).then((res) => {
            setinquiries(res.data);
            console.log(res.data);
        }).catch((err) => {
            console.log(err);
        });
    }

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
                            fetch_admin_users={fetch_admin_users}
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
        toggleDropdown(inquiry.id);
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



function RenderAdminGrid({ adminUsers, currentAdminUser, setcurrentAdminUser, setRole, role, setadmin_email, setadmin_name, inquiries, fetch_admin_users }) {

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

    const handleDelete = async (admin) => {
        if (!window.confirm(`${admin.name}번 사용자를 삭제하시겠습니까?`)) return;

        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/admin_users/${admin.id}`,
                {
                    method: "DELETE",
                }
            );

            if (response.status === 204) {
                alert("삭제되었습니다 ✅");
                fetch_admin_users();
            } else if (response.status === 404) {
                alert("해당 사용자를 찾을 수 없습니다 ❌");
            } else {
                alert("삭제 중 오류가 발생했습니다 ⚠️");
            }
        } catch (err) {
            console.error("삭제 요청 오류:", err);
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
                                    onClick={() => handleDelete(admin)}
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
        axios.post(`${process.env.REACT_APP_API_URL}/admin_users/`, NewUser).then((res) => {
            console.log("생성된 관리자:", res.data);
            showToast(`${NewUser.name} 관리자가 추가되었습니다.`, 'success');
            setNewUser({
                name: "",
                email: "",
                password: "",
                department: ""
            });
            setopenAddAdminModal(false);
            fetch_admin_users();
        }).catch((err) => {
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
