import { useState } from 'react';
import Sidebar from "../admin_components/sidebar";
import Dashboard from "../admin_components/dashboard";
import Knowledge from "../admin_components/knowledge";
import Assistant from "../admin_components/assistant";
import Chart from '../admin_components/chart';
import Chatbot from '../admin_components/chatbot';
import Inquiry from '../admin_components/inquiry';
import ChatHistory from '../admin_components/chat_history';

import "../admin_styles/dashboard.css";
import "../admin_styles/knowledge.css";
import "../admin_styles/assistant.css";
import "../admin_styles/chart.css";
import "../admin_styles/chatbot.css";
import "../admin_styles/inquiry.css";
import "../admin_styles/chat_history.css";



export default function Adminpage() {
    const [role, setRole] = useState(sessionStorage.getItem("role") || "guest");
    const [admin_email, setadmin_email] = useState(sessionStorage.getItem("admin_email"));
    const [admin_name, setadmin_name] = useState(sessionStorage.getItem("admin_name"));

    const [view, setView] = useState('inquiry');


    // useEffect(() => {
    //     if (role === "admin") {
    //         setView("admin_login");
    //     } else {
    //         setView("dashboard");
    //     }
    // }, [role]); // role 값이 바뀔 때만 실행됨


    const [loading, setLoading] = useState(false);

    const handleMenuClick = (newView) => {
        if (view === newView) return;
        setLoading(true);
        setTimeout(() => {
            setView(newView);
            setLoading(false);
        }, 500);
    };


    const renderView = () => {
        switch (view) {
            case 'dashboard':
                return <Dashboard />;
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

    return (
        <>
            <div className={`loading-overlay ${loading ? ' ' : 'hidden'}`} id="loadingOverlay">
                <div className="loading-content">
                    <div className="loading-spinner"></div>
                    <p>Loading...</p>
                </div>
            </div >

            {/* 관리자 페이지 */}
            < div className="admin-wrapper" >
                {view !== "admin_login" && (
                    <Sidebar view={view} handleMenuClick={handleMenuClick} role={role} admin_email={admin_email} admin_name={admin_name} />
                )}


                {renderView()}
            </div >
        </>
    )
}