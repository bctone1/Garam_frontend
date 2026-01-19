export default function Sidebar({ view, handleMenuClick, role, admin_email, admin_name }) {


    // 메뉴 데이터 정의
    const menuItems = [
        { key: "dashboard", icon: "fas fa-tachometer-alt", label: "Dashboard" },
        { key: "knowledge", icon: "fas fa-book", label: "Knowledge Base Management" },
        { key: "assistant", icon: "fas fa-robot", label: "AI Model Settings" },
        { key: "chart", icon: "fas fa-chart-bar", label: "Analysis and Reports" },
        { key: "chatbot", icon: "fas fa-comments", label: "Chatbot Operation Settings" },
        { key: "inquiry", icon: "fa-solid fa-address-book", label: "Inquiry Management" },
        { key: "chat_history", icon: "fas fa-comment-dots", label: "Chat History" },
    ];

    // role이 admin이면 "문의 관리"만 보이도록 필터링
    const visibleMenu = role !== "superadmin"
        ? menuItems.filter(item => item.key === "inquiry")
        : menuItems;


    const handleLogout = () => {
        sessionStorage.clear();
        window.location.href = "/"
    };

    return (
        <aside className="sidebar" id="sidebar">
            {/* 사이드바 헤더 */}
            <div className="sidebar-header">
                <div className="brand-logo">
                    <i className="fas fa-microchip"></i>
                </div>
                <div className="brand-info">
                    <h2 className="brand-name">Garm Postech</h2>
                    <p className="brand-subtitle">AI Management Center</p>
                </div>
                <button className="sidebar-toggle" id="sidebarToggle">
                    <i className="fas fa-bars"></i>
                </button>
            </div>

            {/* 네비게이션 */}
            <nav className="sidebar-nav">
                <ul className="nav-menu">
                    {visibleMenu.map((item) => (
                        <li key={item.key} className="nav-item">
                            <a
                                className={`nav-link ${view === item.key ? "active" : ""}`}
                                onClick={() => handleMenuClick(item.key)}
                            >
                                <i className={item.icon}></i>
                                <span className="nav-text">{item.label}</span>
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* 사이드바 푸터 */}
            <div className="sidebar-footer">
                <div className="user-profile">
                    <div className="user-avatar">
                        <i className="fas fa-user-tie"></i>
                    </div>
                    <div className="user-info">
                        {/* <div className="user-name">{role === "admin" ? "일반 관리자" : "최종 관리자"}</div> */}
                        <div className="user-name">{admin_name}</div>
                        <div className="user-email">{admin_email}</div>
                    </div>
                </div>
                <div className="sidebar-actions">
                    <button className="action-btn" title="Logout"
                        onClick={() => handleLogout()}>
                        <i className="fas fa-sign-out-alt"></i>
                    </button>
                </div>
            </div>
        </aside>
    );
}
