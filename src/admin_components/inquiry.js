import axios from "axios";
import { showToast } from '../utill/utill';
import { useState, useEffect, useRef } from 'react';

export default function Inquiry({ setRole, role, setadmin_email, setadmin_name }) {


    const [adminUsers, setadminUsers] = useState([]);
    const [inquiries, setinquiries] = useState([]);
    const [currentAdminUser, setcurrentAdminUser] = useState("");
    const [openAddAdminModal, setopenAddAdminModal] = useState(false);
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [notifications, setNotifications] = useState([]);
    const [openNotificationModal, setOpenNotificationModal] = useState(false);
    const [showNotificationContent, setShowNotificationContent] = useState(false);
    const admin_name = sessionStorage.getItem("admin_name");
    const [adminId, setAdminId] = useState(sessionStorage.getItem("admin_id") ? sessionStorage.getItem("admin_id") : null);

    useEffect(() => {
        setcurrentAdminUser(admin_name);
    }, [admin_name]);

    useEffect(() => {
        fetch_admin_users();
        fetch_inquiry_list();
    }, []);

    const fetch_notificatoins = (admin_id) => {
        axios.get(`${process.env.REACT_APP_API_URL}/notifications?recipient_admin_id=${admin_id}&unread_only=false&limit=10`).then((res) => {
            // console.log(res.data);
            setNotifications(res.data);
        }).catch((err) => {
            console.log(err);
        });
    }

    useEffect(() => {
        if (adminId) {
            fetch_notificatoins(adminId);
        }
    }, [adminId]);

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
            // console.log(res.data);
        }).catch((err) => {
            console.log(err);
        });
    }
    // const [showNotificationModal, setShowNotificationModal] = useState(false);
    // const showNotificationDetail = (notification) => {
    //     console.log(notification);
    //     setShowNotificationModal(true);
    //     setShowNotificationContent(!showNotificationContent)
    // }

    const checkNotification = (notification) => {
        // console.log(notification);
        // console.log(adminId);
        axios.post(`${process.env.REACT_APP_API_URL}/notifications/${notification.id}/read`, {
            recipient_admin_id: adminId
        });
        setShowNotificationContent(!showNotificationContent)

        setTimeout(() => {
            fetch_notificatoins(adminId);
        }, 500);
    }

    return (
        <>
            {/* <div className={`modal ${showNotificationModal ? "show" : ""}`} id="notificationModal" onClick={() => setShowNotificationModal(false)}>
                <div
                    className="modal-content"
                    onClick={(event) => event.stopPropagation()}
                >
                    <div className="modal-header">
                        <h3 className="modal-title">상세내용</h3>
                        <button className="modal-close" onClick={() => setShowNotificationModal(false)}>
                            &times;
                        </button>
                    </div>

                    <div id="addAdminForm">
                        <div>

                        </div>
                    </div>
                </div>
            </div> */}

            <div className={`modal ${openAddAdminModal ? "show" : ""}`} id="addAdminModal" onClick={() => setopenAddAdminModal(false)}>
                <AddAdminModal setopenAddAdminModal={setopenAddAdminModal} fetch_admin_users={fetch_admin_users} />
            </div>

            <main className="inquiry-main-content">
                <div className="inquiry-page-header">
                    <button
                        className="inquiry-notification-btn"
                        title="알림"
                        onClick={() => setShowNotificationContent(!showNotificationContent)}
                    >
                        <svg className="inquiry-notification-icon" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                        <span className="inquiry-notification-badge">{notifications.filter(notification => notification.read_at === null).length}</span>
                    </button>

                    <div className={`inquiry-notification-content ${showNotificationContent ? 'show' : ''}`}>

                        {notifications.map((notification) => (
                            <div className={`inquiry-notification-item ${notification.read_at !== null ? 'read' : ''}`} key={notification.id}>
                                <div className="inquiry-notification-item-title">
                                    <span className="inquiry-notification-item-title-text">
                                        {notification.body}
                                    </span>

                                    {notification.read_at === null && (
                                        <button className="btn btn-primary notification-read-btn" onClick={() => checkNotification(notification)}>확인</button>
                                    )}

                                </div>
                            </div>
                        ))}

                    </div>


                </div>

                <div className="page-header">
                    <h1 className="page-title">Inquiry Management</h1>
                    <p className="page-subtitle">Manage inquiries received through the chatbot.</p>

                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-number">{inquiries.length}</div>
                            <div className="stat-label">Total Inquiries</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number"> {inquiries.filter(i => i.status === "new").length}</div>
                            <div className="stat-label">New Inquiries</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number">{inquiries.filter(i => i.status === "processing").length}</div>
                            <div className="stat-label">Processing</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number">{inquiries.filter(i => i.status === "on_hold").length}</div>
                            <div className="stat-label">Processing On Hold</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number">{inquiries.filter(i => i.status === "completed").length}</div>
                            <div className="stat-label">Processing Completed</div>
                        </div>
                    </div>
                </div>

                {/* 관리자 관리 섹션  */}
                <div className="admin-management">
                    <div className="section-header">
                        <h3 className="section-title">Admin Management</h3>

                        {role === "superadmin" && (
                            <button className="btn btn-primary"
                                onClick={() => setopenAddAdminModal(true)}
                            >
                                <i className="fas fa-user-plus"></i>
                                Add Admin
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
                            fetch_inquiry_list={fetch_inquiry_list}
                            fetch_notificatoins={fetch_notificatoins}
                        />
                    </div>
                </div>

                <div className="inquiry-section">
                    <div className="section-header">
                        <h3 className="section-title"> Inquiry List</h3>

                        <div className="inquiry-filter">
                            <select
                                className="inquiry-filter-select"
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                            >
                                <option value="all">All</option>
                                <option value="paper_request">Paper Request</option>
                                <option value="sales_report">Sales Report</option>
                                <option value="kiosk_menu_update">Menu Update and Add</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                    </div>

                    <div className="inquiry-list" id="inquiryList">
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
                    </div>
                </div>
            </main >
        </>
    )
}

function RenderInquiries({ inquiries, adminUsers, currentAdminUser, role, setinquiries, fetch_inquiry_list }) {

    const [openDropdownId, setOpenDropdownId] = useState(null);
    const sudo = role === "superadmin" ? true : false
    const statusText = {
        new: "New",
        processing: "Processing",
        on_hold: "On Hold",
        completed: "Completed",
    };
    const statusClass = {
        new: "status-new",
        processing: "status-processing",
        on_hold: "status-on_hold",
        completed: "status-completed",
    };

    const actionsReturn = (action) => {
        const actions = {
            "new": "Inquiry Received",
            "assign": "Assignee Assignment",
            "on_hold": "Processing On Hold",
            "resume": "Processing Resume",
            "transfer": "Assignee Transfer",
            "complete": "Processing Complete",
            "note": "Note Add",
            "contact": "Customer Contact",
            "delete": "Inquiry Delete",
        };
        return actions[action] ?? "icon-default";
    }

    const filteredInquiries = inquiries.filter((inquiry) => {
        if (sudo) return true;
        return inquiry.assignee && inquiry.assignee === currentAdminUser;
    });

    if (inquiries.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-icon">
                    <i className="fas fa-inbox"></i>
                </div>
                <p>No inquiries have been received yet.</p>
            </div>
        );
    }

    const toggleDropdown = (id) => {
        setOpenDropdownId((prev) => (prev === id ? null : id));
    };

    const superadmin_id = adminUsers.find(cat => cat.name === currentAdminUser)?.id

    const handleComplete = ({ inquiry }) => {
        const inputreason = prompt("Please enter the processing result.");
        if (inputreason === null) { console.log("The action has been canceled."); return; }
        if (inputreason.trim() === "") { alert("Please enter the reason."); return; }

        try {
            axios.post(`${process.env.REACT_APP_API_URL}/inquiries/${inquiry.id}/histories/note`, {
                admin_id: superadmin_id,
                details: `Processing Result: ${inputreason}`,
                action: "complete"
            });
            axios.post(`${process.env.REACT_APP_API_URL}/inquiries/${inquiry.id}/status`, {
                status: "completed",
                details: "string",
                actor_admin_id: superadmin_id,
            });
            setinquiries((prevInquiries) => prevInquiries.map((item) => item.id === inquiry.id ?
                {
                    ...item,
                    status: "completed",
                    assignee: currentAdminUser,
                    assignedDate: new Date().toISOString().slice(0, 19).replace("T", " "),
                    history: [
                        ...(item.history || []),
                        {
                            action: "complete",
                            admin: currentAdminUser,
                            timestamp: new Date().toISOString().slice(0, 19).replace("T", " "),
                            details: `Processing Result: ${inputreason}`,
                        },
                    ],
                } : item)
            );
            showToast("Inquiry has been processed and completed.", "info");
        } catch (error) {
            console.log(error);
        }
    }

    const handleSelectAdmin = ({ admin, inquiry, action }) => {
        if (action === "New Assignment") {
            try {
                axios.post(`${process.env.REACT_APP_API_URL}/inquiries/${inquiry.id}/histories/note`, {
                    admin_id: superadmin_id,
                    details: `${admin.name} has been assigned to the inquiry.`,
                    action: "assign"
                });
                axios.post(`${process.env.REACT_APP_API_URL}/inquiries/${inquiry.id}/assign`, {
                    admin_id: admin.id,
                    actor_admin: superadmin_id
                });
                setinquiries((prevInquiries) => prevInquiries.map((item) => item.id === inquiry.id ?
                    {
                        ...item,
                        status: "processing",
                        assignee: admin.name,
                        assignedDate: new Date().toISOString().slice(0, 19).replace("T", " "),
                        history: [
                            ...(item.history || []),
                            {
                                action: "assign",
                                admin: currentAdminUser,
                                timestamp: new Date().toISOString().slice(0, 19).replace("T", " "),
                                details: `${admin.name} has been assigned to the inquiry.`,
                            },
                        ],
                    } : item)
                );
            } catch (error) {
                console.log(error);
            }
        } else {
            const inputreason = prompt("Please enter the transfer reason.");
            if (inputreason === null) { console.log("The transfer has been canceled."); return; }
            if (inputreason.trim() === "") { alert("Please enter the reason."); return; }
            const currentItem = inquiries.find((i) => i.id === inquiry.id);
            const prevAssignee = currentItem?.assignee || "Unassigned";

            try {
                axios.post(`${process.env.REACT_APP_API_URL}/inquiries/${inquiry.id}/histories/note`, {
                    admin_id: superadmin_id,
                    details: `${prevAssignee || "Unassigned"} -> ${admin.name} (Reason:${inputreason})`,
                    // details: `테스트`,
                    action: "transfer"
                });

                axios.post(`${process.env.REACT_APP_API_URL}/inquiries/${inquiry.id}/transfer`, {
                    to_admin_id: admin.id,
                    actor_admin: superadmin_id
                });

                setinquiries((prevInquiries) => prevInquiries.map((item) => item.id === inquiry.id ?
                    {
                        ...item,
                        status: "processing",
                        assignee: admin.name,
                        assignedDate: new Date().toISOString().slice(0, 19).replace("T", " "),
                        history: [
                            ...(item.history || []),
                            {
                                action: "transfer",
                                admin: currentAdminUser,
                                timestamp: new Date().toISOString().slice(0, 19).replace("T", " "),
                                details: `${prevAssignee || "Unassigned"} -> ${admin.name} (Reason:${inputreason})`,
                            },
                        ],
                    } : item)
                );
            } catch (error) {
                console.log(error);
            }
        }
        showToast(`${admin.name} Inquiry has been ${action}.`, "info");
        toggleDropdown(inquiry.id);
    };


    const deleteDetail = async (inquiry) => {
        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/inquiries/${inquiry.id}`,
                {
                    method: "DELETE",
                }
            );
            // console.log(response.data);
            fetch_inquiry_list();
            showToast(`Inquiry has been deleted.`, "warning");
        } catch (err) {
            console.error("Deletion request error:", err);
        }
    }


    const handleNote = ({ inquiry }) => {
        const inputreason = prompt("Please enter the note.");
        if (inputreason === null) { console.log("The note has been canceled."); return; }
        if (inputreason.trim() === "") { alert("Please enter the note."); return; }
        try {
            axios.post(`${process.env.REACT_APP_API_URL}/inquiries/${inquiry.id}/histories/note`, {
                admin_id: superadmin_id,
                details: `${inputreason}`,
                action: "note"
            });

            setinquiries((prevInquiries) => prevInquiries.map((item) => item.id === inquiry.id ?
                {
                    ...item,
                    status: "processing",
                    assignee: currentAdminUser,
                    assignedDate: new Date().toISOString().slice(0, 19).replace("T", " "),
                    history: [
                        ...(item.history || []),
                        {
                            action: "note",
                            admin: currentAdminUser,
                            timestamp: new Date().toISOString().slice(0, 19).replace("T", " "),
                            details: `${inputreason}`,
                        },
                    ],
                } : item)
            );
            showToast("Note has been added.", "info");
        } catch (error) {
            console.log(error);
        }
    }

    const handleHold = ({ inquiry }) => {
        const inputreason = prompt("Please enter the on hold reason.");
        if (inputreason === null) { console.log("The on hold has been canceled."); return; }
        if (inputreason.trim() === "") { alert("Please enter the reason."); return; }

        try {
            axios.post(`${process.env.REACT_APP_API_URL}/inquiries/${inquiry.id}/histories/note`, {
                admin_id: superadmin_id,
                details: `${inputreason}`,
                action: "on_hold"
            });
            axios.post(`${process.env.REACT_APP_API_URL}/inquiries/${inquiry.id}/status`, {
                status: "on_hold",
                details: "string",
                actor_admin_id: superadmin_id,
            });
            setinquiries((prevInquiries) => prevInquiries.map((item) => item.id === inquiry.id ?
                {
                    ...item,
                    status: "on_hold",
                    assignee: currentAdminUser,
                    assignedDate: new Date().toISOString().slice(0, 19).replace("T", " "),
                    history: [
                        ...(item.history || []),
                        {
                            action: "on_hold",
                            admin: currentAdminUser,
                            timestamp: new Date().toISOString().slice(0, 19).replace("T", " "),
                            details: `${inputreason}`,
                        },
                    ],
                } : item)
            );
            showToast("Inquiry has been changed to on hold status.", "info");
        } catch (error) {
            console.log(error);
        }
    }

    const handleResume = ({ inquiry }) => {
        if (!window.confirm("Do you want to resume the inquiry?")) return;

        try {
            axios.post(`${process.env.REACT_APP_API_URL}/inquiries/${inquiry.id}/status`, {
                status: "processing",
                details: "string",
                actor_admin_id: superadmin_id,
            });

            axios.post(`${process.env.REACT_APP_API_URL}/inquiries/${inquiry.id}/histories/note`, {
                admin_id: superadmin_id,
                details: "Processing has been resumed from on hold status.",
                action: "resume"
            });

            setinquiries((prevInquiries) => prevInquiries.map((item) => item.id === inquiry.id ?
                {
                    ...item,
                    status: "processing",
                    assignee: currentAdminUser,
                    assignedDate: new Date().toISOString().slice(0, 19).replace("T", " "),
                    history: [
                        ...(item.history || []),
                        {
                            action: "resume",
                            admin: currentAdminUser,
                            timestamp: new Date().toISOString().slice(0, 19).replace("T", " "),
                            details: "Processing has been resumed from on hold status.",
                        },
                    ],
                } : item)
            );
            showToast("Inquiry has been resumed.", "info");
        } catch (error) {
            console.log(error);
        }
    }

    const handleContact = () => {
        showToast("Under development.", "warning");
    }

    const labelType = (type) => {
        if (type === "paper_request") return "Paper Request";
        if (type === "sales_report") return "Sales Report";
        if (type === "kiosk_menu_update") return "Menu Update and Add";
        if (type === "other") return "Other";
    }

    return (
        <>
            {filteredInquiries.length === 0 && (
                <div className="empty-state">
                    <div className="empty-icon">
                        <i className="fas fa-inbox"></i>
                    </div>
                    <p>No inquiries have been received yet.</p>
                </div>
            )}
            {filteredInquiries.map((inquiry) => {
                const isCurrentUser = inquiry.assignee === currentAdminUser;
                const processorInfo = inquiry.assignee && (
                    <div className="processor-info">
                        <div className="assignee-avatar">{inquiry.assignee.charAt(0)}</div>
                        <span>Assignee: {inquiry.assignee}</span>
                        {inquiry.assignedDate && <span>• {inquiry.assignedDate}</span>}
                    </div>
                );

                const historyHtml = inquiry.history.map((item, idx) => (
                    <div key={idx} className="history-item">
                        <div className="history-action">{actionsReturn(item.action)}</div>
                        <div className="history-admin">by {item.admin}</div>
                        <div className="history-time">{item.timestamp}</div>
                        {item.details && (
                            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.25rem", }}>
                                {item.details}
                            </div>
                        )}
                    </div>
                ));

                // 액션 버튼 조건
                let actionButtons = null;
                if (inquiry.status === "new") {
                    actionButtons = (
                        <>
                            <div className="assign-dropdown">
                                <div className={`assign-dropdown-menu ${openDropdownId === inquiry.id ? "show" : ""}`} id={`dropdown-${inquiry.id}`}>
                                    {adminUsers.map((admin) => (
                                        <div key={admin.name} className="assign-dropdown-item" onClick={() => handleSelectAdmin({ admin, inquiry, action: "New Assignment" })}>
                                            <div className="admin-avatar">{admin.name.charAt(0)}</div>
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{admin.name}</div>
                                                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                                                    {admin.department}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button className="btn btn-warning btn-sm" onClick={() => toggleDropdown(inquiry.id)}>
                                <i className="fas fa-user-plus"></i> Assignee Assignment
                            </button>
                        </>
                    );
                } else if (inquiry.status === "processing" && (isCurrentUser || sudo)) {
                    actionButtons = (
                        <>
                            {/* <button className="btn btn-info btn-sm" onClick={() => handleContact()}>
                                <i className="fas fa-phone"></i> 연락
                            </button> */}
                            <button className="btn btn-secondary btn-sm" onClick={() => handleNote({ inquiry })}>
                                <i className="fas fa-sticky-note"></i> Note
                            </button>
                            <button className="btn btn-warning btn-sm" onClick={() => handleHold({ inquiry })}>
                                <i className="fas fa-pause"></i> On Hold
                            </button>


                            <div className="assign-dropdown">
                                <div className={`assign-dropdown-menu ${openDropdownId === inquiry.id ? "show" : ""}`} id={`dropdown-${inquiry.id}`}>
                                    {adminUsers.map((admin) => (
                                        <div key={admin.name} className="assign-dropdown-item" onClick={() => handleSelectAdmin({ admin, inquiry, action: "Transfer" })}>
                                            <div className="admin-avatar">{admin.name.charAt(0)}</div>
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{admin.name}</div>
                                                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", }}>
                                                    {admin.department}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button className="btn btn-primary btn-sm" onClick={() => toggleDropdown(inquiry.id)}>
                                <i className="fas fa-exchange-alt"></i> Transfer
                            </button>

                            <button className="btn btn-success btn-sm" onClick={() => handleComplete({ inquiry })}>
                                <i className="fas fa-check"></i> Complete
                            </button>
                        </>
                    );
                } else if (inquiry.status === "on_hold" && (isCurrentUser || sudo)) {
                    actionButtons = (
                        <>
                            <button className="btn btn-info btn-sm" onClick={() => handleResume({ inquiry })}>
                                <i className="fas fa-play"></i> Resume
                            </button>
                            <button className="btn btn-secondary btn-sm" onClick={() => handleNote({ inquiry })}>
                                <i className="fas fa-sticky-note"></i> Note
                            </button>

                            <div className="assign-dropdown">
                                <div className={`assign-dropdown-menu ${openDropdownId === inquiry.id ? "show" : ""}`} id={`dropdown-${inquiry.id}`}>
                                    {adminUsers.map((admin) => (
                                        <div key={admin.name} className="assign-dropdown-item" onClick={() => handleSelectAdmin({ admin, inquiry, action: "Transfer" })}>
                                            <div className="admin-avatar">{admin.name.charAt(0)}</div>
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{admin.name}</div>
                                                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", }}>{admin.department}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <button className="btn btn-primary btn-sm" onClick={() => toggleDropdown(inquiry.id)} >
                                <i className="fas fa-exchange-alt"></i> Transfer
                            </button>

                            <button className="btn btn-success btn-sm" onClick={() => handleComplete({ inquiry })}>
                                <i className="fas fa-check"></i> Complete
                            </button>
                        </>
                    );
                }

                return (
                    <div key={inquiry.id} className="inquiry-item">

                        <div className="inquiry-header">
                            <div className="inquiry-info">
                                <div className="inquiry-name">{inquiry.businessName}</div>
                                <div className="inquiry-meta">
                                    <span className="inquiry-meta-item">Category</span> : {labelType(inquiry.inquiryType)} | <span className="inquiry-meta-item">Business Number</span> : {inquiry.businessNumber} | <span className="inquiry-meta-item">Phone</span> : {inquiry.phone} | <span className="inquiry-meta-item">Received Date</span> : {inquiry.createdDate}
                                </div>
                            </div>

                            <div className="inquiry-actions">
                                <span className={`status-badge ${statusClass[inquiry.status]}`}>
                                    {statusText[inquiry.status]}
                                </span>
                                <div className="action-buttons">
                                    {actionButtons}
                                    <button className="btn btn-danger btn-sm" onClick={() => deleteDetail(inquiry)} >
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="inquiry-content">
                            <div className="inquiry-file-preview-container">
                                {inquiry.attachments.map((attachment, index) => {
                                    return (
                                        <div key={index} className="inquiry-file-preview-item">
                                            {attachment.contentType && attachment.contentType.startsWith('image/') && (
                                                <div className="inquiry-file-preview-image-wrapper">
                                                    <img
                                                        // src={`http://localhost:5002${attachment.storageKey}`}
                                                        src={`https://garam.onecloud.kr:5002${attachment.storageKey}`}
                                                        className="inquiry-file-preview-image"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>

                            {inquiry.content}
                        </div>
                        {processorInfo}
                        <div className="history-timeline">{historyHtml}</div>
                    </div>
                );
            })}
        </>
    );
}



function RenderAdminGrid({ adminUsers, currentAdminUser, setcurrentAdminUser, setRole, role, setadmin_email, setadmin_name, inquiries, fetch_admin_users, fetch_inquiry_list, fetch_notificatoins }) {


    const [adminId, setAdminId] = useState(sessionStorage.getItem("admin_id") ? sessionStorage.getItem("admin_id") : null);
    const wsRef = useRef(null);

    useEffect(() => {
        if (adminId === null) return;

        // 기존 소켓 정리
        if (wsRef.current) {
            wsRef.current.close();
        }

        // 배포환경
        // const ws = new WebSocket(`wss://garam.onecloud.kr:5002/ws/notifications?admin_id=${adminId}`);
        const ws = new WebSocket(`wss://globalgaram.onecloud.kr:5005/ws/notifications?admin_id=${adminId}`);

        // const ws = new WebSocket(`ws://localhost:5002/ws/notifications?admin_id=${adminId}`);

        wsRef.current = ws;

        ws.onopen = () => {
            console.log(`🟢 WebSocket connected (admin_id=${adminId})`);
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("실시간 알림:", data);
            if (data.type === "notification_created") {
                fetch_inquiry_list();
                fetch_notificatoins(adminId);
                showToast(data.notification.body, "info");
            }
        };

        ws.onclose = () => {
            console.log("🔴 WebSocket disconnected");
        };

        ws.onerror = (err) => {
            console.log(err);
        };

        return () => {
            ws.close();
        };
    }, [adminId]);



    const getAssignedCount = (adminName) =>
        inquiries.filter(i => i.assignee === adminName && i.status === "processing").length + inquiries.filter(i => i.assignee === adminName && i.status === "on_hold").length;

    const getCompletedCount = (adminName) =>
        inquiries.filter(i => i.assignee === adminName && i.status === "completed").length;

    const switchToAdmin = (admin) => {
        const inputPassword = prompt(`Please enter the password for the "${admin.name}" account:`);
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

            fetch_notificatoins(admin.id);
            setAdminId(admin.id);
            fetch_inquiry_list();


            showToast(`Switched to ${admin.name}.`, "info");

        } else {
            alert("❌ The password is incorrect.");
        }
    };

    const handleDelete = async (admin) => {
        if (!window.confirm(`Are you sure you want to delete the "${admin.name}" user?`)) return;

        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/admin_users/${admin.id}`,
                {
                    method: "DELETE",
                }
            );
            showToast(`Deleted successfully.`, "warning");
            fetch_admin_users();
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
                        {isCurrentUser && <div className="current-badge">Current User</div>}

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
                                <div className="admin-stat-label">In Progress</div>
                            </div>
                            <div className="admin-stat">
                                <div className="admin-stat-number">{completedCount}</div>
                                <div className="admin-stat-label">Completed</div>
                            </div>
                        </div>



                        <div className="admin-actions">
                            {!isCurrentUser && (
                                <button
                                    className="btn btn-sm btn-primary"
                                    onClick={() => switchToAdmin(admin)}
                                >
                                    <i className="fas fa-exchange-alt"></i> Switch
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
                                    <i className="fas fa-trash"></i> Delete
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
            showToast(`${NewUser.name} admin has been added.`, 'success');
            setNewUser({
                name: "",
                email: "",
                password: "",
                department: ""
            });
            setopenAddAdminModal(false);
            fetch_admin_users();
        }).catch((err) => {
            showToast("An error occurred while adding the admin.", 'error');
        });
    }


    return (
        <div className="modal-content" onClick={(event) => event.stopPropagation()}>

            <div className="modal-header">
                <h3 className="modal-title">Add Admin</h3>
                <button className="modal-close" onClick={() => setopenAddAdminModal(false)}>
                    &times;
                </button>
            </div>

            <div id="addAdminForm">
                <div className="form-group">
                    <label className="form-label">Name</label>
                    <input type="text" className="form-input" id="adminName" value={NewUser.name}
                        onChange={(e) =>
                            setNewUser((prev) => ({ ...prev, name: e.target.value }))
                        }
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-input" id="adminEmail" value={NewUser.email}
                        onChange={(e) =>
                            setNewUser((prev) => ({ ...prev, email: e.target.value }))
                        }
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Password</label>
                    <input type="password" className="form-input" id="adminPassword" value={NewUser.password}
                        onChange={(e) =>
                            setNewUser((prev) => ({ ...prev, password: e.target.value }))
                        }
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Department</label>
                    <input
                        type="text"
                        className="form-input"
                        id="adminDepartment"
                        placeholder="e.g., Customer Support Team"
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
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-primary"
                        onClick={() => create_admin()}
                    >
                        Add
                    </button>
                </div>
            </div>
        </div>
    );
}