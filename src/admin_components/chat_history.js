import { useEffect, useState } from "react";
import axios from "axios";

export default function ChatHistory() {
    const [SessionsList, setSessionsList] = useState([]);
    const [selectedSession, setSelectedSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchSessions = () => {
        axios.get(`${process.env.REACT_APP_API_URL}/chat/sessions?offset=0&limit=100`).then((res) => {
            console.log(res.data);
            setSessionsList(res.data);
        }).catch((err) => {
            console.error("세션 목록 가져오기 오류:", err);
        });
    }

    const fetchMessages = (sessionId) => {
        setLoading(true);
        axios.get(`${process.env.REACT_APP_API_URL}/chat/sessions/${sessionId}/messages`).then((res) => {
            console.log(res.data);
            setMessages(res.data);
            setLoading(false);
        }).catch((err) => {
            console.error("메시지 가져오기 오류:", err);
            setMessages([]);
            setLoading(false);
        });
    }

    useEffect(() => {
        fetchSessions();
    }, []);

    const handleSessionClick = (session) => {
        setSelectedSession(session);
        fetchMessages(session.id);
    }

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleString("ko-KR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    return (
        <main className="chat-history-main-content">
            <div className="chat-history-container">
                {/* 왼쪽 세션 리스트 */}
                <div className="chat-history-sidebar">
                    <div className="chat-history-header">
                        <h2>대화 세션</h2>
                        <button className="btn-refresh" onClick={fetchSessions} title="새로고침">
                            <i className="fas fa-sync-alt"></i>
                        </button>
                    </div>
                    <div className="session-list">
                        {SessionsList.length === 0 ? (
                            <div className="empty-state">
                                <p>세션이 없습니다.</p>
                            </div>
                        ) : (
                            SessionsList.map((session) => (
                                <div
                                    key={session.id}
                                    className={`session-item ${selectedSession?.id === session.id ? "active" : ""}`}
                                    onClick={() => handleSessionClick(session)}
                                >
                                    <div className="session-item-header">
                                        <div className="session-title">
                                            {`${session.title} #${session.id}` || ` #${session.id}`}
                                        </div>
                                        <div className="session-date">
                                            {formatDate(session.created_at || session.createdAt)}
                                        </div>
                                    </div>
                                    {session.preview && (
                                        <div className="session-preview">
                                            {session.preview}
                                        </div>
                                    )}
                                    {/* <div className="session-meta">
                                        <span className="session-id">ID: {session.id}</span>
                                        {session.resolved !== undefined && (
                                            <span className={`session-status ${session.resolved ? "resolved" : "active"}`}>
                                                {session.resolved ? "완료" : "진행중"}
                                            </span>
                                        )}
                                    </div> */}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* 오른쪽 메시지 영역 */}
                <div className="chat-history-content">
                    {selectedSession ? (
                        <>
                            <div className="chat-history-content-header">
                                <div>
                                    <h3>{selectedSession.title || `세션 #${selectedSession.id}`}</h3>
                                    <p className="session-info">
                                        생성일: {formatDate(selectedSession.created_at || selectedSession.createdAt)}
                                    </p>
                                </div>
                            </div>
                            <div className="messages-container">
                                {loading ? (
                                    <div className="loading-state">
                                        <i className="fas fa-spinner fa-spin"></i>
                                        <p>메시지를 불러오는 중...</p>
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="empty-state">
                                        <i className="fas fa-comments"></i>
                                        <p>이 세션에는 메시지가 없습니다.</p>
                                    </div>
                                ) : (
                                    <div className="messages-list">
                                        {messages.map((message, index) => (
                                            <div
                                                key={message.id || index}
                                                className={`message-item ${message.role === "user" ? "user-message" : "assistant-message"}`}
                                            >
                                                <div className="message-header">
                                                    <span className="message-role">
                                                        {message.role === "user" ? "사용자" : "AI 어시스턴트"}
                                                    </span>
                                                    {message.created_at && (
                                                        <span className="message-time">
                                                            {formatDate(message.created_at)}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="message-content">
                                                    {message.content}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="empty-selection">
                            <i className="fas fa-comment-dots"></i>
                            <p>왼쪽에서 세션을 선택하여 대화 기록을 확인하세요.</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}