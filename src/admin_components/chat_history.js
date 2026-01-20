import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { showToast } from '../utill/utill';
import React from 'react';
// Load wordcloud library
const WordCloud = require('wordcloud');

export default function ChatHistory() {
    const [SessionsList, setSessionsList] = useState([]);
    const [selectedSession, setSelectedSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [wordCloudData, setWordCloudData] = useState([]);
    const canvasRef = useRef(null);

    const [dateFrom, setDateFrom] = useState(new Date(Date.now() - 86400000).toISOString().split('T')[0]);
    const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);

    const [sessionCount, setSessionCount] = useState({
        total: 0,
        success: 0,
        failed: 0
    });
    const fetchSessionCount = (dateFrom, dateTo) => {
        // console.log(dateFrom, dateTo);
        axios.get(`${process.env.REACT_APP_API_URL}/chat-history/sessions/count?date_from=${dateFrom}&date_to=${dateTo}`).then((res) => {
            // console.log(res.data);
            setSessionCount(res.data);
        }).catch((err) => {
            console.log(err);
        });
    }

    const fetchSessions = (dateFrom, dateTo) => {
        // axios.get(`${process.env.REACT_APP_API_URL}/chat/sessions?offset=0&limit=100`).then((res) => {
        axios.get(`${process.env.REACT_APP_API_URL}/chat-history/sessions?date_from=${dateFrom}&date_to=${dateTo}`).then((res) => {
            // console.log(res.data);
            setSessionsList(res.data);
            showToast("Session list loaded successfully", "success");
        }).catch((err) => {
            console.error("Failed to load session list:", err);
            showToast("Failed to load session list", "error");
        });
    }

    const fetchMessages = (sessionId) => {
        setLoading(true);
        axios.get(`${process.env.REACT_APP_API_URL}/chat/sessions/${sessionId}/messages`).then((res) => {
            // console.log(res.data);
            setMessages(res.data);
            setLoading(false);
        }).catch((err) => {
            console.error("Failed to load messages:", err);
            setMessages([]);
            setLoading(false);
        });
    }

    const [failedMessageId, setFailedMessageId] = useState({
        question_text: "",
        assistant_answer: "",
    });
    const getFailedMessageId = (sessionId) => {
        axios.get(`${process.env.REACT_APP_API_URL}/chat-history/suggestions?session_id=${sessionId}`).then((res) => {
            // console.log(res.data[0]);
            setFailedMessageId(res.data[0]);
        }).catch((err) => {
            console.log(err);
        });

    }



    const handleSessionClick = (session) => {
        if (selectedSession?.session_id === session.session_id) {
            setSelectedSession({});
        } else {
            setSelectedSession(session);
            fetchMessages(session.session_id);
            if (session.status === 'failed') {
                getFailedMessageId(session.session_id);
            }
        }
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

    // Wordcloud color palette
    const wcColors = [
        '#8B0000', // dark red
        '#228B22', // forest green
        '#1E90FF', // dodger blue
        '#9932CC', // dark orchid
        '#B8860B', // dark goldenrod
        '#2F4F4F', // dark slate gray
        '#8B4513', // saddle brown
        '#006400', // dark green
        '#4B0082', // indigo
        '#DC143C', // crimson
    ];

    const fetchWordCloudData = (dateFrom, dateTo) => {

        axios.get(`${process.env.REACT_APP_API_URL}/chat-history/wordcloud?top_n=100&date_from=${dateFrom}&date_to=${dateTo}`).then((res) => {
            // API response example: [{ keyword: 'how', count: 3 }, ...]
            // console.log(res.data.items);
            const normalized = (res.data.items ?? [])
                .map((item) => [
                    item.keyword ?? item.word ?? item.text ?? "",
                    Number(item.count ?? item.value ?? 0),
                ])
                .filter(([keyword, count]) => Boolean(keyword) && Number.isFinite(count) && count > 0)
                .sort((a, b) => b[1] - a[1]); // renderWordCloud uses [0] as max, so it must be sorted DESC

            // console.log(normalized);
            setWordCloudData(normalized);
        }).catch((err) => {
            console.log(err);
        });

        // setWordCloudData([
        //     ['POS', 15],
        //     ['Payment', 12],
        //     ['Kiosk', 10],
        //     ['Receipt', 8],
        //     ['Touch', 7],
        //     ['Settings', 6],
        //     ['Network', 5],
        //     ['Bluetooth', 4],
        //     ['Admin', 3],
        //     ['Screen', 2]
        // ]);
    }

    const renderWordCloud = (wordData) => {
        if (!WordCloud) {
            console.warn("WordCloud library is not loaded.");
            return;
        }

        const canvas = canvasRef.current;
        if (!canvas || !wordData || wordData.length === 0) return;

        // Don't render if the Keywords tab is not active
        const keywordView = canvas.closest('.keyword-stats-view');
        if (!keywordView || keywordView.style.display === 'none') {
            return;
        }

        const container = canvas.parentElement;
        if (container) {
            const containerWidth = container.offsetWidth;
            // Use default size if container is not visible
            canvas.width = containerWidth > 0 ? containerWidth : 800;
        } else {
            canvas.width = 800; // default
        }
        canvas.height = 350;

        // Calculate max/min frequency
        const maxCount = wordData[0][1];
        const minCount = wordData[wordData.length - 1][1];

        // Prepare wordcloud data [word, weight]
        const list = wordData.map(([word, count]) => {
            // Scale size by frequency (12 ~ 80)
            const size = Math.max(12, Math.min(80, 12 + (count / maxCount) * 68));
            return [word, size];
        });

        WordCloud(canvas, {
            list: list,
            gridSize: 8,
            weightFactor: 1,
            fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif',
            fontWeight: function (word, weight) {
                if (weight > 50) return '700';
                if (weight > 35) return '600';
                if (weight > 20) return '500';
                return '400';
            },
            color: function (word, weight) {
                return wcColors[Math.floor(Math.random() * wcColors.length)];
            },
            rotateRatio: 0.3,
            rotationSteps: 2,
            backgroundColor: '#ffffff',
            shuffle: true,
            drawOutOfBound: false,
            shrinkToFit: true,
            click: function (item) {
                if (item) {
                    searchKeyword(item[0]);
                }
            },
            hover: function (item, dimension, event) {
                if (item) {
                    canvas.style.cursor = 'pointer';
                } else {
                    canvas.style.cursor = 'default';
                }
            }
        });
    }

    const searchKeyword = (keyword) => {
        // Keyword search (optional)
        // e.g., navigate to sessions that include the keyword
        // console.log("Search keyword:", keyword);
        // TODO: filter sessions by keyword or scroll to a matching session
    }

    const [mainTab, setMainTab] = useState("date");


    useEffect(() => {
        fetchSessions(dateFrom, dateTo);
        fetchWordCloudData(dateFrom, dateTo);
        fetchSessionCount(dateFrom, dateTo);
    }, []);

    useEffect(() => {
        if (wordCloudData.length > 0) {
            renderWordCloud(wordCloudData);
        }
    }, [wordCloudData]);

    // Re-render wordcloud when the Keywords tab becomes active
    useEffect(() => {
        if (mainTab === "keywords" && wordCloudData.length > 0) {
            // Small delay to ensure DOM is fully visible before rendering
            const timer = setTimeout(() => {
                renderWordCloud(wordCloudData);
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [mainTab, wordCloudData]);


    const handleQuestionClick = (session) => {
        handleSessionClick(session);
        setMainTab("date");
    }


    const [addKnowledgeModal, setAddKnowledgeModal] = useState(false);

    const PostKnowledge = (event) => {
        event.preventDefault(); // required
        const formData = new FormData(event.target);
        const answer = formData.get("answer");
        // console.log(answer);

        axios.post(
            `${process.env.REACT_APP_API_URL}/chat-history/suggestions/${failedMessageId.message_id}/ingest`,
            {
                final_answer: answer,
                target_knowledge_id: 50,
            }
        ).then((res) => {

        }).catch((err) => {
            console.log(err);
        });

        setAddKnowledgeModal(false);
    }

    const [filterChannel, setFilterChannel] = useState({
        channel: "all",
        category: "all",
    });

    const filteredSessions = (SessionsList ?? []).filter((session) => {
        const channelMatch =
            !filterChannel.channel ||
            filterChannel.channel === "all" ||
            session.channel === filterChannel.channel;

        const categoryMatch =
            !filterChannel.category ||
            filterChannel.category === "all" ||
            session.category === filterChannel.category;

        return channelMatch && categoryMatch;
    });

    return (
        <>
            <div className={`modal ${addKnowledgeModal ? "show" : ""}`} onClick={() => setAddKnowledgeModal(false)}>
                <div className="modal-content" onClick={(event) => event.stopPropagation()} style={{ maxWidth: "1000px" }}>
                    <div className="modal-header">
                        <h3 className="modal-title">Add to Knowledge Base</h3>
                        <button className="modal-close" onClick={() => setAddKnowledgeModal(false)}>
                            &times;
                        </button>
                    </div>

                    <form onSubmit={PostKnowledge}>
                        <div className="form-group">
                            <label className="form-label">Failed question</label>
                            <input type="text" className="form-input" readOnly value={failedMessageId.question_text} />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Write an answer</label>
                            <textarea className="form-input" rows={6} name="answer"
                                required
                                value={failedMessageId.assistant_answer}
                                onChange={(e) => {
                                    setFailedMessageId((prev) => ({ ...prev, assistant_answer: e.target.value }));
                                }}
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
                                onClick={() => setAddKnowledgeModal(false)}
                            >
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary">
                                Add
                            </button>
                        </div>
                    </form>
                </div>
            </div>


            <main className="main">
                {/* Page header */}
                <div className="history-page-header">
                    <h1 className="page-title">Chat History <span>({sessionCount.total})</span></h1>
                    <div className="history-header-actions">
                        <button className="history-refresh-btn">
                            <i className="fas fa-sync-alt"></i> Refresh
                        </button>
                    </div>
                </div>

                {/* Filter bar */}
                <div className="filter-bar">
                    <div className="main-tabs">
                        <button className={`main-tab ${mainTab === "date" ? "active" : ""}`} onClick={() => setMainTab("date")}>By date</button>
                        <button className={`main-tab ${mainTab === "category" ? "active" : ""}`} onClick={() => setMainTab("category")}>By category</button>
                        <button className={`main-tab ${mainTab === "questions" ? "active" : ""}`} onClick={() => setMainTab("questions")}>Questions only</button>
                        <button className={`main-tab ${mainTab === "keywords" ? "active" : ""}`} onClick={() => setMainTab("keywords")}>Keywords</button>
                    </div>

                    <div className="filter-divider"></div>

                    <div>

                        <div className="date-range-picker" style={{ display: mainTab === "date" ? "block" : "none" }}>
                            <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); fetchSessions(e.target.value, dateTo); fetchSessionCount(e.target.value, dateTo); }} />
                            <span>~</span>
                            <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); fetchSessions(dateFrom, e.target.value); fetchSessionCount(dateFrom, e.target.value); }} />
                        </div>

                        <div className="filter-group" style={{ display: mainTab === "category" ? "flex" : "none" }}>
                            <span className="filter-label">Channel</span>
                            <div className="channel-btns">
                                <button className={`channel-btn ${filterChannel.channel === "all" ? "active" : ""}`} onClick={() => setFilterChannel({ ...filterChannel, channel: "all" })}>All</button>
                                <button className={`channel-btn ${filterChannel.channel === "web" ? "active" : ""}`} onClick={() => setFilterChannel({ ...filterChannel, channel: "web" })}><i className="fas fa-globe"></i> Web</button>
                                <button className={`channel-btn ${filterChannel.channel === "mobile" ? "active" : ""}`} onClick={() => setFilterChannel({ ...filterChannel, channel: "mobile" })}><i className="fas fa-mobile-alt"></i> Mobile</button>
                            </div>
                        </div>
                        <div className="filter-group" style={{ marginLeft: "1rem", display: mainTab === "category" ? "flex" : "none" }}>
                            <span className="filter-label">Category</span>
                            <select className="category-select"
                                value={filterChannel.category}
                                onChange={(e) => setFilterChannel({ ...filterChannel, category: e.target.value })}
                            >
                                <option value="all">All</option>
                                <option value="POS 시스템">POS System</option>
                                <option value="키오스크">Kiosk</option>
                                <option value="결제 단말기">Payment Terminal</option>
                                <option value="설치/설정">Installation / Setup</option>
                                <option value="기타">Other</option>
                            </select>
                        </div>


                        <span style={{ color: "var(--text-muted)", fontSize: "0.8125rem", display: mainTab === "questions" ? "block" : "none" }}>
                            <i className="fas fa-info-circle" style={{ marginRight: "0.375rem" }}></i>Only user questions are shown
                        </span>

                        <div className="date-range-picker" style={{ display: mainTab === "keywords" ? "block" : "none" }}>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => {
                                    setDateFrom(e.target.value);
                                    fetchSessions(e.target.value, dateTo);
                                    fetchSessionCount(e.target.value, dateTo);
                                    fetchWordCloudData(e.target.value, dateTo);
                                }}
                            />
                            <span>~</span>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => {
                                    setDateTo(e.target.value);
                                    fetchSessions(dateFrom, e.target.value);
                                    fetchSessionCount(dateFrom, e.target.value);
                                    fetchWordCloudData(dateFrom, e.target.value);
                                }}
                            />
                        </div>

                        <span style={{ color: "var(--text-muted)", fontSize: "0.8125rem", marginLeft: "0.5rem", display: mainTab === "keywords" ? "block" : "none" }}>
                            <i className="fas fa-info-circle" style={{ marginRight: "0.375rem" }}></i>Keyword analysis for the selected period
                        </span>


                    </div>

                    <div className="stats-summary">
                        <span>
                            <i className="fas fa-check-circle" style={{ color: "var(--success)" }}></i> Answered
                            <strong>{sessionCount.success}</strong>
                        </span>
                        <span>
                            <i className="fas fa-times-circle" style={{ color: "var(--danger)" }}></i> Failed
                            <strong >{sessionCount.failed}</strong>
                        </span>
                    </div>

                </div>

                {/* Content area */}
                <div>

                    <div className="session-list" style={{ display: mainTab === "date" || mainTab === "category" ? "flex" : "none" }}>

                        {filteredSessions.map((session) => {
                            return (
                                <div className={`session-card ${selectedSession?.session_id === session.session_id ? "active" : ""}`} key={session.session_id}
                                    onClick={() => handleSessionClick(session)}
                                >
                                    <div className="session-header">
                                        <div className="session-toggle">
                                            <i className="fas fa-chevron-down"></i>
                                        </div>
                                        <div className="session-info">
                                            <div className="session-top">
                                                <span className="session-id">#{session.session_id}</span>
                                                {session.channel === 'web' && <span className="badge channel web">Web</span>}
                                                {session.channel === 'mobile' && <span className="badge channel mobile">Mobile</span>}

                                                {session.category && <span className="badge cat">{session.category}</span>}

                                                {session.status === 'failed' && <span className="badge failed">Failed</span>}
                                                {session.status === 'commit' && <span className="badge" style={{ background: "rgb(214 237 253)", color: "var(--accent)" }}>Updated</span>}

                                            </div>
                                            <div className="session-preview">{session.first_question}</div>
                                        </div>
                                        <div className="session-meta">{formatDate(session.created_at)}</div>
                                    </div>
                                    <div className="session-content"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className="chat-messages">
                                            {messages.map((message, index) => (
                                                <React.Fragment key={`${message.session_id}-message-${index}`}>
                                                    {message.role === 'user' ? (
                                                        <div className="message user">
                                                            <div className="message-bubble">
                                                                <div className="msg-header">
                                                                    <span className="msg-role">User</span>
                                                                    <span className="msg-time">{formatDate(message.created_at)}</span>
                                                                </div>
                                                                <div className="msg-text">{message.content}</div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className={`message ai ${failedMessageId.message_id === message.id ? "failed" : ""}`}>
                                                            <div className="message-bubble">
                                                                <div className="msg-header">
                                                                    <span className="msg-role">AI #{message.id}</span>
                                                                    <span className="msg-time">{formatDate(message.created_at)}</span>
                                                                </div>
                                                                <div className="msg-text">{message.content}</div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </div>
                                        {session.status === 'failed' && (
                                            <div className="session-footer">
                                                <div className="footer-alert">
                                                    <i className="fas fa-exclamation-triangle"></i>
                                                    Answer failed — needs Knowledge Base entry
                                                </div>
                                                <button className="kb-btn" onClick={() => {
                                                    setAddKnowledgeModal(true)

                                                }}>
                                                    <i className="fas fa-plus"></i> Add to Knowledge Base
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}

                    </div>

                    <div className="question-list" style={{ display: mainTab === "questions" ? "flex" : "none" }}>
                        {SessionsList.map((session) => {
                            return (
                                <div className="history-question-item" key={`question-${session.session_id}`}
                                    onClick={() => handleQuestionClick(session)}
                                >
                                    {session.first_question}{session.status === 'failed' && <span className="badge failed">Failed</span>}
                                </div>
                            )
                        })}
                    </div>


                    <div className="keyword-stats-view" style={{ display: mainTab === "keywords" ? "block" : "none" }}>
                        <div className="keyword-header">
                            <h2><i className="fas fa-cloud" style={{ color: "var(--primary)", marginRight: "0.5rem" }}></i>Keyword Stats</h2>
                            <p>Keywords extracted from customer inquiries during the selected period</p>
                        </div>

                        <div className="keyword-period">
                            <i className="fas fa-calendar-alt" style={{ marginRight: "0.5rem" }}></i>{dateFrom} ~ {dateTo} ({sessionCount.total} conversations)
                        </div>

                        <div className="wordcloud-main">
                            <canvas
                                ref={canvasRef}
                                width="800"
                                height="350"
                            >
                            </canvas>
                        </div>

                        {/* <div className="keyword-hint">
                            <i className="fas fa-mouse-pointer"></i>
                            Click a keyword to jump to the relevant conversation
                        </div> */}

                        <div className="stats-cards">
                            <div className="stat-card">
                                <div className="stat-value">{sessionCount.total}</div>
                                <div className="stat-label">Total conversations</div>
                            </div>
                            <div className="stat-card success">
                                <div className="stat-value">{sessionCount.success}</div>
                                <div className="stat-label">Answered</div>
                            </div>
                            <div className="stat-card danger">
                                <div className="stat-value">{sessionCount.failed}</div>
                                <div className="stat-label">Failed</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value">{wordCloudData.length}</div>
                                <div className="stat-label">Unique keywords</div>
                            </div>
                        </div>
                    </div>


                </div>
            </main >
        </>
    );
}