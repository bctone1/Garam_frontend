import axios from "axios";
import React, { useEffect, useState } from "react";

export default function Main() {
    const [messages, setMessages] = useState([]);

    // 4자리 랜덤 숫자 생성 함수
    const generateSessionId = () => {
        return Math.floor(1000 + Math.random() * 9000).toString();
    };

    const [messageInput, setMessageInput] = useState("");
    const [topK, setTopK] = useState(5);
    const [knowledgeId, setKnowledgeId] = useState("");
    const [loading, setLoading] = useState(false);


    // --- ✨ AI 응답 요청 함수 ---
    const requestAssistantAnswer = async (question) => {
        const payload = {
            question,
            top_k: Number(topK),
            knowledge_id: knowledgeId ? Number(knowledgeId) : null,
        };

        const response = await fetch(
            `${process.env.REACT_APP_API_URL}/chat/sessions/42/qa`,
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
                `${process.env.REACT_APP_API_URL}/chat/sessions/42/messages`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        session_id: 42,
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

    const [knowledgeList, setknowledgeList] = useState([]);


    useEffect(() => {
        axios
            .get(`${process.env.REACT_APP_API_URL}/knowledge/`, {
                params: {
                    offset: 0,
                    limit: 5,
                },
            })
            .then((res) => {
                setknowledgeList(res.data);
                console.log("📌 지식베이스 목록:", res.data);
            })
            .catch((err) => {
                if (err.response && err.response.status === 404) {
                    alert("해당 setting을 찾을 수 없습니다.");
                } else {
                    console.error("❌ 요청 실패:", err);
                }
            });
    }, []);

    return (
        <>
            <div className="chatbot-service">
                <header className="chatbot-header">
                    <div className="chatbot-header-inner">
                        <div className="chatbot-logo"></div>
                        <div className="chatbot-header-title">가람포스텍 AI 지원센터</div>
                        <div className="chatbot-header-subtitle">24시간 스마트 고객지원 서비스</div>
                    </div>
                    <div className="chatbot-header-buttons">
                        <button className="chatbot-header-button"><i className="icon-home"></i></button>
                        <button className="chatbot-header-button"><i className="icon-call"></i></button>
                        <button className="chatbot-header-button"><i className="icon-close"></i></button>
                    </div>
                </header>





                <div className="chatbot-chat-area">
                    <div className="chatbot-chat-section">
                        <h1 className="chatbot-intro-title">안녕하세요! 가람포스텍 AI 지원센터입니다.</h1>
                        <p className="chatbot-intro-text">
                            POS 시스템, 키오스크, 결제 단말기 관련 궁금한 점이나 문제가 있으시면 언제든지 말씀해 주세요!
                        </p>

                        <div className="chatbot-button chatbot-button--monitor">
                            <div className="chatbot-button-icon"></div>
                            <div>
                                <div className="chatbot-button-title">POS 시스템</div>
                                <div className="chatbot-button-desc">설치 및 문제 해결</div>
                            </div>
                        </div>
                    </div>
                </div>











                <div className="chatbot-input-area">
                    <div className="chatbot-input-box">
                        <input className="chatbot-input-message" placeholder="메시지를 입력하세요..." />
                        <div className="chatbot-input-tools">
                            <div className="chatbot-input-tools-left">
                                <button className="chatbot-input-button"><i className="icon-attachment"></i></button>
                            </div>
                            <div className="chatbot-input-tools-right">
                                <button className="chatbot-input-button"><i className="icon-mic"></i></button>
                                <button className="chatbot-input-button send"><i className="icon-send"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
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