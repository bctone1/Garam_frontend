import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { showToast } from '../utill/utill';

// wordcloud 라이브러리 로드
const WordCloud = require('wordcloud');

export default function ChatHistory() {
    const [SessionsList, setSessionsList] = useState([]);
    const [selectedSession, setSelectedSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [wordCloudData, setWordCloudData] = useState([]);
    const canvasRef = useRef(null);

    const fetchSessions = () => {
        axios.get(`${process.env.REACT_APP_API_URL}/chat/sessions?offset=0&limit=100`).then((res) => {
            console.log(res.data);
            setSessionsList(res.data);
            showToast("세션 목록 가져오기 성공", "success");
        }).catch((err) => {
            console.error("세션 목록 가져오기 오류:", err);
            showToast("세션 목록 가져오기 실패", "error");
        });
    }

    const fetchMessages = (sessionId) => {
        setLoading(true);
        axios.get(`${process.env.REACT_APP_API_URL}/chat/sessions/${sessionId}/messages`).then((res) => {
            // console.log(res.data);
            setMessages(res.data);
            setLoading(false);
        }).catch((err) => {
            console.error("메시지 가져오기 오류:", err);
            setMessages([]);
            setLoading(false);
        });
    }


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

    // 워드클라우드 색상 팔레트 (이미지와 비슷하게)
    const wcColors = [
        '#8B0000', // 다크레드
        '#228B22', // 포레스트그린
        '#1E90FF', // 도저블루
        '#9932CC', // 다크오키드
        '#B8860B', // 다크골든로드
        '#2F4F4F', // 다크슬레이트그레이
        '#8B4513', // 새들브라운
        '#006400', // 다크그린
        '#4B0082', // 인디고
        '#DC143C', // 크림슨
    ];

    const fetchWordCloudData = () => {
        setWordCloudData([
            ['POS', 15],
            ['결제', 12],
            ['키오스크', 10],
            ['영수증', 8],
            ['터치', 7],
            ['설정', 6],
            ['네트워크', 5],
            ['블루투스', 4],
            ['관리자', 3],
            ['화면', 2]
        ]);

        // axios.get(`${process.env.REACT_APP_API_URL}/chat/keywords`)
        //     .then((res) => {
        //         const wordData = res.data.map(item => [item.word, item.count]);
        //         setWordCloudData(wordData);
        //     })
        //     .catch((err) => {
        //         console.log("워드클라우드 데이터 가져오기 오류:", err);
        //         // 테스트용 더미 데이터
        //         setWordCloudData([
        //             ['POS', 15],
        //             ['결제', 12],
        //             ['키오스크', 10],
        //             ['영수증', 8],
        //             ['터치', 7],
        //             ['설정', 6],
        //             ['네트워크', 5],
        //             ['블루투스', 4],
        //             ['관리자', 3],
        //             ['화면', 2]
        //         ]);
        //     });
    }

    const renderWordCloud = (wordData) => {
        if (!WordCloud) {
            console.warn("WordCloud 라이브러리가 로드되지 않았습니다.");
            return;
        }

        const canvas = canvasRef.current;
        if (!canvas || !wordData || wordData.length === 0) return;

        // 키워드 탭이 활성화되어 있지 않으면 렌더링하지 않음
        const keywordView = canvas.closest('.keyword-stats-view');
        if (!keywordView || keywordView.style.display === 'none') {
            return;
        }

        const container = canvas.parentElement;
        if (container) {
            const containerWidth = container.offsetWidth;
            // 컨테이너가 보이지 않으면 기본값 사용
            canvas.width = containerWidth > 0 ? containerWidth : 800;
        } else {
            canvas.width = 800; // 기본값
        }
        canvas.height = 350;

        // 최대/최소 빈도 계산
        const maxCount = wordData[0][1];
        const minCount = wordData[wordData.length - 1][1];

        // 워드클라우드 데이터 준비 [단어, 가중치]
        const list = wordData.map(([word, count]) => {
            // 빈도에 따른 크기 계산 (12 ~ 80)
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
        // 키워드 검색 기능 구현
        // 예: 해당 키워드가 포함된 세션으로 이동
        console.log("검색 키워드:", keyword);
        // TODO: 키워드로 세션 필터링 또는 해당 세션으로 스크롤
    }

    const [mainTab, setMainTab] = useState("date");
    

    useEffect(() => {
        fetchSessions();
        fetchWordCloudData();
    }, []);

    useEffect(() => {
        if (wordCloudData.length > 0) {
            renderWordCloud(wordCloudData);
        }
    }, [wordCloudData]);

    // 키워드 탭이 활성화될 때 워드클라우드 다시 렌더링
    useEffect(() => {
        if (mainTab === "keywords" && wordCloudData.length > 0) {
            // DOM이 완전히 표시된 후 렌더링하기 위해 약간의 지연
            const timer = setTimeout(() => {
                renderWordCloud(wordCloudData);
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [mainTab, wordCloudData]);

    

    return (
        <main className="main">
            {/* 페이지 헤더  */}
            <div className="history-page-header">
                <h1 className="page-title">대화 기록 <span id="totalCount">(14건)</span></h1>
                <div className="history-header-actions">
                    <button className="history-refresh-btn">
                        <i className="fas fa-sync-alt"></i> 새로고침
                    </button>
                </div>
            </div>

            {/* 필터 바 */}
            <div className="filter-bar">
                <div className="main-tabs">
                    <button className={`main-tab ${mainTab === "date" ? "active" : ""}`} onClick={() => setMainTab("date")}>날짜별</button>
                    <button className={`main-tab ${mainTab === "category" ? "active" : ""}`} onClick={() => setMainTab("category")}>분류별</button>
                    <button className={`main-tab ${mainTab === "questions" ? "active" : ""}`} onClick={() => setMainTab("questions")}>질문만</button>
                    <button className={`main-tab ${mainTab === "keywords" ? "active" : ""}`} onClick={() => setMainTab("keywords")}>키워드</button>
                </div>

                <div className="filter-divider"></div>

                <div id="dynamicFilters">

                    <div className="date-range-picker" style={{ display: mainTab === "date" ? "block" : "none" }}>
                        <input type="date" value="2025-12-13" readOnly />
                        <span>~</span>
                        <input type="date" value="2025-12-17" readOnly />
                    </div>

                    <div className="filter-group" style={{ display: mainTab === "category" ? "flex" : "none" }}>
                        <span className="filter-label">채널</span>
                        <div className="channel-btns">
                            <button className="channel-btn active" >전체</button>
                            <button className="channel-btn "><i className="fas fa-globe"></i> 웹</button>
                            <button className="channel-btn "><i className="fas fa-mobile-alt"></i> 모바일</button>
                        </div>
                    </div>
                    <div className="filter-group" style={{ marginLeft: "1rem", display: mainTab === "category" ? "flex" : "none" }}>
                        <span className="filter-label">분류</span>
                        <select className="category-select">
                            <option value="all">전체</option>
                            <option value="pos">POS시스템</option>
                            <option value="kiosk">키오스크</option>
                            <option value="terminal">결제단말기</option>
                            <option value="install">설치/설정</option>
                            <option value="etc">기타</option>
                        </select>
                    </div>


                    <span style={{ color: "var(--text-muted)", fontSize: "0.8125rem", display: mainTab === "questions" ? "block" : "none" }}>
                        <i className="fas fa-info-circle" style={{ marginRight: "0.375rem" }}></i>사용자 질문만 표시됩니다
                    </span>

                    <div className="date-range-picker" style={{ display: mainTab === "keywords" ? "block" : "none" }}>
                        <input type="date" value="2025-12-11" readOnly />
                        <span>~</span>
                        <input type="date" value="2025-12-17" readOnly />
                    </div>

                    <span style={{ color: "var(--text-muted)", fontSize: "0.8125rem", marginLeft: "0.5rem", display: mainTab === "keywords" ? "block" : "none" }}>
                        <i className="fas fa-info-circle" style={{ marginRight: "0.375rem" }}></i>선택 기간의 키워드 분석
                    </span>


                </div>

                <div className="stats-summary">
                    <span>
                        <i className="fas fa-check-circle" style={{ color: "var(--success)" }}></i> 응답
                        <strong id="statSuccess">11</strong>
                    </span>
                    <span>
                        <i className="fas fa-times-circle" style={{ color: "var(--danger)" }}></i> 실패
                        <strong id="statFailed">3</strong>
                    </span>
                </div>

            </div>

            {/* 컨텐츠 영역 */}
            <div id="contentArea">

                <div className="session-list" style={{ display: mainTab === "date" || mainTab === "category" ? "flex" : "none" }}>


                    <div className="session-card active">
                        <div className="session-header">
                            <div className="session-toggle">
                                <i className="fas fa-chevron-down"></i>
                            </div>
                            <div className="session-info">
                                <div className="session-top">
                                    <span className="session-id">#763</span>
                                    <span className="badge channel ">웹</span>
                                    <span className="badge cat">POS시스템</span>

                                </div>
                                <div className="session-preview">POS 카드결제 시 통신 오류가 발생해요</div>
                            </div>
                            <div className="session-meta">2025-12-17 오후 04:41</div>
                        </div>
                        <div className="session-content">
                            <div className="chat-messages">

                                <div className="message user ">
                                    <div className="message-bubble">
                                        <div className="msg-header">
                                            <span className="msg-role">사용자</span>
                                            <span className="msg-time">오후 04:41</span>
                                        </div>
                                        <div className="msg-text">POS 카드결제 시 통신 오류가 발생해요</div>
                                    </div>
                                </div>

                                <div className="message ai ">
                                    <div className="message-bubble">
                                        <div className="msg-header">
                                            <span className="msg-role">AI</span>
                                            <span className="msg-time">오후 04:41</span>
                                        </div>
                                        <div className="msg-text">카드 결제 통신 오류 해결 방법을 안내드립니다. 1. 인터넷 연결 상태 확인 2. POS 기기 재부팅 3. VAN사 고객센터 문의</div>
                                    </div>
                                </div>

                            </div>

                        </div>
                    </div>

                    <div className="session-card active">
                        <div className="session-header">
                            <div className="session-toggle">
                                <i className="fas fa-chevron-down"></i>
                            </div>
                            <div className="session-info">
                                <div className="session-top">
                                    <span className="session-id">#760</span>
                                    <span className="badge channel mobile">모바일</span>
                                    <span className="badge cat">키오스크</span>
                                    <span className="badge failed">실패</span>
                                </div>
                                <div className="session-preview">키오스크 터치가 인식이 안돼요</div>
                            </div>
                            <div className="session-meta">2025-12-17 오후 12:22</div>
                        </div>
                        <div className="session-content">
                            <div className="chat-messages">

                                <div className="message user ">
                                    <div className="message-bubble">
                                        <div className="msg-header">
                                            <span className="msg-role">사용자</span>
                                            <span className="msg-time">오후 12:22</span>
                                        </div>
                                        <div className="msg-text">키오스크 터치가 인식이 안돼요</div>
                                    </div>
                                </div>

                                <div className="message ai ">
                                    <div className="message-bubble">
                                        <div className="msg-header">
                                            <span className="msg-role">AI</span>
                                            <span className="msg-time">오후 12:22</span>
                                        </div>
                                        <div className="msg-text">터치 보정이 필요할 수 있습니다.</div>
                                    </div>
                                </div>

                                <div className="message user ">
                                    <div className="message-bubble">
                                        <div className="msg-header">
                                            <span className="msg-role">사용자</span>
                                            <span className="msg-time">오후 12:24</span>
                                        </div>
                                        <div className="msg-text">관리자 메뉴 비밀번호가 뭔가요?</div>
                                    </div>
                                </div>

                                <div className="message ai failed">
                                    <div className="message-bubble">
                                        <div className="msg-header">
                                            <span className="msg-role">AI</span>
                                            <span className="msg-time">오후 12:24</span>
                                        </div>
                                        <div className="msg-text">해당 내용은 찾을 수 없습니다.</div>
                                    </div>
                                </div>

                            </div>

                            <div className="session-footer">
                                <div className="footer-alert">
                                    <i className="fas fa-exclamation-triangle"></i>
                                    답변 실패 - 지식베이스 등록 필요
                                </div>
                                <button className="kb-btn">
                                    <i className="fas fa-plus"></i> 지식베이스 추가
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="question-list" style={{ display: mainTab === "questions" ? "flex" : "none" }}>
                    <div className="history-question-item" >POS 카드결제 시 통신 오류가 발생해요</div>
                    <div className="history-question-item" >키오스크 화면 밝기 조절은 어디서 하나요?</div>
                    <div className="history-question-item" >결제단말기 영수증이 안나와요</div>
                    <div className="history-question-item" >키오스크 터치가 인식이 안돼요</div>
                    <div className="history-question-item" >관리자 메뉴 비밀번호가 뭔가요?</div>
                    <div className="history-question-item" >영수증 프린터 용지 교체 방법</div>
                    <div className="history-question-item" >결제 취소 방법 알려주세요</div>
                    <div className="history-question-item" >AS 신청하려고 합니다</div>
                    <div className="history-question-item" >WiFi 설정 방법이요</div>
                </div>


                <div className="keyword-stats-view" style={{ display: mainTab === "keywords" ? "block" : "none" }}>
                    <div className="keyword-header">
                        <h2><i className="fas fa-cloud" style={{ color: "var(--primary)", marginRight: "0.5rem" }}></i>키워드 통계</h2>
                        <p>선택한 기간의 고객 문의에서 추출된 키워드</p>
                    </div>

                    <div className="keyword-period">
                        <i className="fas fa-calendar-alt" style={{ marginRight: "0.5rem" }}></i>2025-12-11 ~ 2025-12-17 (15건의 대화)
                    </div>

                    <div className="wordcloud-main">
                        <canvas
                            ref={canvasRef}
                            id="wordcloud-canvas"
                            width="800"
                            height="350"
                        >
                        </canvas>
                    </div>

                    <div className="keyword-hint">
                        <i className="fas fa-mouse-pointer"></i>
                        키워드를 클릭하면 해당 대화로 이동합니다
                    </div>

                    <div className="stats-cards">
                        <div className="stat-card">
                            <div className="stat-value">15</div>
                            <div className="stat-label">전체 대화</div>
                        </div>
                        <div className="stat-card success">
                            <div className="stat-value">12</div>
                            <div className="stat-label">응답 성공</div>
                        </div>
                        <div className="stat-card danger">
                            <div className="stat-value">3</div>
                            <div className="stat-label">응답 실패</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">47</div>
                            <div className="stat-label">고유 키워드</div>
                        </div>
                    </div>
                </div>


            </div>
        </main>
    );
}