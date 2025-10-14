import React, { useState } from "react";

export default function Main() {
    const [messages, setMessages] = useState([]);

    // 4자리 랜덤 숫자 생성 함수
    const generateSessionId = () => {
        return Math.floor(1000 + Math.random() * 9000).toString();
    };

    const [state, setState] = useState({
        baseUrl: "http://localhost:5002",
        // sessionId: generateSessionId(),
        sessionId: 42,
    });


    const [messageInput, setMessageInput] = useState("");
    const [topK, setTopK] = useState(5); // 선택된 Top-K 값
    const [knowledgeId, setKnowledgeId] = useState(""); // 선택된 지식베이스
    const [loading, setLoading] = useState(false);


    // --- ✨ AI 응답 요청 함수 ---
    const requestAssistantAnswer = async (question) => {
        const payload = {
            question,
            top_k: Number(topK),
            knowledge_id: knowledgeId ? Number(knowledgeId) : null,
        };

        const response = await fetch(
            `${state.baseUrl}/chat/sessions/${state.sessionId}/qa`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            }
        );

        if (!response.ok) {
            // const message = await response.text();
            // throw new Error(message || "AI 응답 요청 실패");
            const message = await parseError(response);
            throw new Error(message);
        }
        return response.json();
    };



    // 메시지 전송
    const handleSend = async () => {
        const content = messageInput.trim();
        if (!content) return;

        // 사용자 메시지 추가
        const newUserMessage = { role: "user", content };
        setMessages((prev) => [...prev, newUserMessage]);
        setMessageInput("");
        setLoading(true);

        try {
            const start = performance.now();
            const latencyMs = Math.round(performance.now() - start);
            const response = await fetch(
                `${state.baseUrl}/chat/sessions/${state.sessionId}/messages`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        session_id: state.sessionId,
                        role: "user",
                        content,
                        response_latency_ms: latencyMs,
                    }),
                }
            );




            const data = await requestAssistantAnswer(content);
            // const data = await response.json();
            const answer = data.answer?.trim?.() ? data.answer.trim() : "응답을 가져올 수 없습니다.";


            // AI 응답 추가
            const newAssistantMessage = {
                role: "assistant",
                content: answer || "응답을 불러올 수 없습니다.",
            };

            setMessages((prev) => [...prev, newAssistantMessage]);
        } catch (error) {
            console.error("메시지 전송 오류:", error);
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: "⚠️ 서버 연결 오류가 발생했습니다.",
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="chat-app">
                <header className="chat-header">
                    <div className="header-left">
                        <button className="ghost-button" id="newSessionButton">
                            + 새 대화
                        </button>
                        <div className="title-group">
                            <h1>AI 상담 챗봇</h1>
                            <div className="session-meta">
                                <span>세션</span>
                                <span className="session-id">{state.sessionId}</span>
                                <span className="connection-status">
                                    <span className="status-dot"></span>
                                    <span>연결됨</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="chat-main" id="chatMain">
                    <div className="chat-main-inner">
                        <div className="messages" id="messages">
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`message-row ${msg.role === "user" ? "user" : "assistant"}`}
                                >
                                    <div className="avatar">
                                        {msg.role === "user" ? "나" : "AI"}
                                    </div>
                                    <div className="message-bubble">{msg.content}</div>
                                </div>
                            ))}

                            {loading && (
                                <div className="message-row assistant">
                                    <div className="avatar">AI</div>
                                    <div className="message-bubble typing">
                                        <span className="typing-dot"></span>
                                        <span className="typing-dot"></span>
                                        <span className="typing-dot"></span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>

                <footer className="chat-footer">
                    <div className="footer-inner">
                        <div className="footer-top">
                            <textarea
                                id="messageInput"
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                placeholder="메시지를 입력하고 Enter 키로 전송해보세요."
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                            />
                            <button className="primary-button" onClick={handleSend}>
                                <span>전송</span>
                            </button>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}

async function parseError(response) {
    const fallback = `${response.status} ${response.statusText}`.trim();
    try {
        const data = await response.clone().json();
        if (typeof data === "string") return data;
        if (data.detail) {
            if (typeof data.detail === "string") return data.detail;
            if (Array.isArray(data.detail)) {
                return data.detail
                    .map((item) => item.msg || item.message || (typeof item === "string" ? item : JSON.stringify(item)))
                    .join(", ");
            }
            if (typeof data.detail === "object") {
                return data.detail.message || JSON.stringify(data.detail);
            }
        }
        if (data.message) return data.message;
        return JSON.stringify(data);
    } catch (error) {
        try {
            const text = await response.clone().text();
            return text || fallback;
        } catch {
            return fallback || "요청 처리에 실패했습니다.";
        }
    }
}