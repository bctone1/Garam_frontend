import { useState } from 'react';
import Sidebar from "../admin_components/sidebar";
import Dashboard from "../admin_components/dashboard";
import Knowledge from "../admin_components/knowledge";
import Assistant from "../admin_components/assistant";
import Chart from '../admin_components/chart';
import Chatbot from '../admin_components/chatbot';
import Inquiry from '../admin_components/inquiry';

import "../admin_styles/dashboard.css";
import "../admin_styles/knowledge.css";
import "../admin_styles/assistant.css";
import "../admin_styles/chart.css";
import "../admin_styles/chatbot.css";
import "../admin_styles/inquiry.css";


export default function Adminpage() {

    const [view, setView] = useState('dashboard');
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
                return <Inquiry />;
            default:
                return <div>준비 중입니다: {view}</div>;
        }
    };

    return (
        <>
            <div className={`loading-overlay ${loading ? ' ' : 'hidden'}`} id="loadingOverlay">
                <div className="loading-content">
                    <div className="loading-spinner"></div>
                    <p>관리자 시스템 로딩 중...</p>
                </div>
            </div >

            {/* 관리자 페이지 */}
            < div className="admin-wrapper" >
                <Sidebar view={view} handleMenuClick={handleMenuClick} />
                {renderView()}
            </div >
        </>
    )
}