import axios from "axios";
import React, { useEffect, useState, useRef } from "react";

export default function Main() {

    const [messageInput, setMessageInput] = useState("");
    const [topK, setTopK] = useState(5);
    const [knowledgeId, setKnowledgeId] = useState("");
    const [loading, setLoading] = useState(false);
    const [Categories, setCategories] = useState([]);
    const [inquiryStatus, setinquiryStatus] = useState(false);
    const [inquiryInfo, setInquiryInfo] = useState({
        name: null,
        email: null,
        group: null,
        phone: null,
        detail: null,
    });
    const [welecome, setWelecome] = useState(false);
    const [micStatus, setmicStatus] = useState(false);
    const sectionEndRef = useRef(null);
    const [plusmenu, setplusmenu] = useState(false);
    const [sectionContent, setSectionContent] = useState([]);
    const timerRef = useRef(null);
    const hasRunRef = useRef(false);


    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // 월: 01~12
    const date = String(now.getDate()).padStart(2, '0');        // 일: 01~31
    const hours = String(now.getHours()).padStart(2, '0');      // 시: 00~23
    const minutes = String(now.getMinutes()).padStart(2, '0');  // 분: 00~59
    const formattedTime = `${month}. ${date}. ${hours}:${minutes}`;

    setTimeout(() => {
        setWelecome(true);
    }, 1000);

    useEffect(() => {
        getCategory();
    }, []);

    useEffect(() => {
        sectionEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [sectionContent]);

    useEffect(() => {
        if (hasRunRef.current) return;
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
        timerRef.current = setTimeout(() => {
            console.log("5초 동안 sectionContent 변경 없음 → getinquiryform(6) 실행");
            console.log(`카테고리 : ${Categories}`);
            setSectionContent(prev => [
                ...prev,
                <div className="inquiry-feedback-form" key={`inquiry-${Date.now()}`}>
                    <div className="inquiry-sky-form">
                        <h3 className="chatbot-submenu-title-h3">잠깐만요!</h3>
                        <p className="inquiry-feedback-p">오늘 상담이 도움이 되셨나요? <br />여러분의 소중한 의견을 들려주세요.</p>

                        <div className="inquiry-feedback-choice">
                            <div className="feedback-button up">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M9.17802 4.86094C9.85374 3.73019 11.2896 3.27528 12.5079 3.84716L12.7418 3.97063C13.8723 4.64974 14.3271 6.08593 13.7554 7.30441L13.2973 8.2792H16.8611L17.1015 8.2922C18.2807 8.41243 19.2001 9.40996 19.2001 10.6187C19.2001 11.0476 19.0831 11.444 18.8817 11.7884C19.0799 12.1329 19.1968 12.5293 19.2001 12.9582C19.2001 13.5528 18.9759 14.089 18.6153 14.5016C18.6576 14.6738 18.6803 14.8525 18.6803 15.0377C18.6803 15.8533 18.2612 16.5649 17.6343 16.9841C17.5725 18.1376 16.6791 19.0701 15.5421 19.1839L15.3017 19.1968H11.9199C11.3351 19.1968 10.7536 19.0864 10.2111 18.8752L9.98044 18.7777L9.9577 18.7679L9.74329 18.664L9.72055 18.6542L9.32421 18.443C8.92463 18.2318 8.56728 17.9654 8.25541 17.6599C8.12221 18.534 7.36853 19.2001 6.45891 19.2001H5.41934C4.41551 19.2001 3.6001 18.3845 3.6001 17.3805L3.60659 10.0988C3.60659 9.09478 4.42201 8.2792 5.42584 8.2792H6.4654C6.81626 8.2792 7.14437 8.37993 7.42375 8.5554L9.05133 5.09489L9.07082 5.0559L9.15853 4.89344L9.17802 4.86419V4.86094ZM5.42584 9.83887C5.2829 9.83887 5.16595 9.95584 5.16595 10.0988V17.3772C5.16595 17.5202 5.2829 17.6372 5.42584 17.6372H6.4654C6.60834 17.6372 6.7253 17.5202 6.7253 17.3772V10.0988C6.7253 9.95584 6.60834 9.83887 6.4654 9.83887H5.42584ZM11.8452 5.25736C11.3644 5.03315 10.7958 5.20537 10.523 5.64727L10.4515 5.77724L8.60626 9.70565C8.49256 9.94934 8.42759 10.2093 8.41134 10.4757L8.40809 10.6122V14.2807L8.41459 14.5374C8.49256 15.5999 9.1098 16.5552 10.0617 17.0621L10.4353 17.2603L10.6399 17.361C11.0427 17.543 11.4781 17.6372 11.9199 17.6372H15.3017L15.3797 17.6339C15.7728 17.5949 16.0814 17.2603 16.0814 16.8574L16.0749 16.7729C16.0717 16.7436 16.0684 16.7176 16.0619 16.6884C15.9742 16.2952 16.2016 15.9021 16.5817 15.7786C16.8968 15.6779 17.121 15.3822 17.121 15.0377C17.121 14.898 17.0852 14.7713 17.0203 14.6543C16.8156 14.2937 16.9293 13.8355 17.2801 13.6146C17.5011 13.4748 17.644 13.2311 17.644 12.9582C17.644 12.7275 17.5433 12.5195 17.3776 12.3733C17.2087 12.2239 17.1112 12.0126 17.1112 11.7884C17.1112 11.5642 17.2087 11.353 17.3776 11.2036C17.5433 11.0574 17.644 10.8494 17.644 10.6187L17.6407 10.5407C17.605 10.1735 17.3126 9.88111 16.9455 9.84537L16.8676 9.84212H12.0758C11.8094 9.84212 11.5625 9.70565 11.4196 9.48145C11.2766 9.25724 11.2572 8.97131 11.3709 8.73086L12.3455 6.64156C12.5729 6.15416 12.3909 5.57904 11.9394 5.30935L11.8452 5.25736Z" fill="#323232" />
                                </svg>
                                네, 도움이 되었어요
                            </div>
                            <div className="feedback-button down"><i className="icon-down"></i>아니요, 더 개선이 필요해요</div>
                        </div>
                    </div>
                    <br />

                    <div className="chatbot-bottom-nav">
                        <div className="chatbot-submenu home" onClick={getfirstMenu}><i className="icon-home" style={{ width: "20px", height: "20px" }}></i> 처음으로</div>
                        <div className="chatbot-submenu speak"><i className="icon-speak"></i> </div>
                    </div>
                </div>
            ]);
            hasRunRef.current = true;
        }, 10000);
        return () => clearTimeout(timerRef.current);
    }, [sectionContent, Categories]);



    const EmogiToTag = (emogi) => {
        const tags = {
            "💻": "icon-monitor",
            "🖥️": "icon-kiosk",
            "🔧": "icon-code",
            "💳": "icon-card",
            "📋": "icon-card",
        };

        return tags[emogi] ?? "icon-default";
    };

    const getCategory = () => {
        console.log("카테고리를 불러옵니다.");
        axios.get(`${process.env.REACT_APP_API_URL}/system/quick-categories`).then((res) => {
            console.log(res.data);
            setCategories(res.data);
        })
    }



    // --- ✨ AI 응답 요청 함수 ---
    const requestAssistantAnswer = async (question) => {
        try {
            const payload = {
                question,
                top_k: Number(topK),
                knowledge_id: knowledgeId ? Number(knowledgeId) : null,
            };
            const response = await fetch(`${process.env.REACT_APP_API_URL}/llm/chat/sessions/42/qa`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                }
            );
            const message = await parseError(response);
            return response.json();
        } catch (error) {
            console.log(error);
        }
    };

    const InquiryCreate = async () => {
        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/inquiries/`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        customer_name: inquiryInfo.name,
                        company: inquiryInfo.group,
                        phone: inquiryInfo.phone,
                        content: inquiryInfo.detail,
                        status: "new",
                        assignee_admin_id: 0,
                    }),
                }
            );
            console.log(response.data);
        } catch (error) {
            console.log(error);
        }
    }





    const getSubmenu = () => {
        setinquiryStatus(false);
        setSectionContent(prev => [
            ...prev,
            <div className="chatbot-underline" key={`underline-${Date.now()}`} />,
            <div className="chatbot-submenu-wrap" key={`submenu-${Date.now()}`}>
                <h5 className="chatbot-submenu-title-h5">POS 시스템 지원</h5>
                <p>번호를 입력하거나 클릭하여 세부 문제를 선택하세요.</p>
                <div className="chatbot-submenu-single" onClick={getAnswer}>
                    <div className="chatbot-submenu-id">1</div>
                    <div>
                        <h3>시스템 부팅/시작 오류</h3>
                        <p>POS가 켜지지 않거나 시작 중 멈춤</p>
                    </div>
                </div>

                <div className="chatbot-submenu-single">
                    <div className="chatbot-submenu-id">2</div>
                    <div>
                        <h3>시스템 성능 저하</h3>
                        <p>느린 처리 속도, 멈춤 현상</p>
                    </div>
                </div>

                <div className="chatbot-submenu-single">
                    <div className="chatbot-submenu-id">3</div>
                    <div>
                        <h3>영수증 프린터 문제</h3>
                        <p>인쇄 안됨, 용지 걸림, 인쇄 품질</p>
                    </div>
                </div>

                <div className="chatbot-submenu-single">
                    <div className="chatbot-submenu-id">4</div>
                    <div>
                        <h3>네트워크 연결 문제</h3>
                        <p>인터넷 연결 끊김, 서버 연결 오류</p>
                    </div>
                </div>

                <div className="chatbot-submenu-single">
                    <div className="chatbot-submenu-id">5</div>
                    <div>
                        <h3>데이터 백업/복구</h3>
                        <p>매출 데이터 백업, 시스템 복구</p>
                    </div>
                </div>
                <div className="chatbot-bottom-nav">
                    <div className="chatbot-submenu back" onClick={getfirstMenu}><i className="icon-back"></i> 이전 메뉴 보기</div>
                </div>
            </div>

        ]);
    }

    const getAnswer = () => {
        setSectionContent(prev => [
            ...prev,
            <div className="chatbot-bubble user" key={`user-bubble-${Date.now()}`}>
                <div className="bubble-date user">09. 23. 16:59</div>
                <div className="bubble-message user">시스템 부팅/시작 오류 관련 문의입니다.</div>
            </div>,

            <div className="chatbot-guide" key={`guide-${Date.now()}`}>
                <h5 className="chatbot-submenu-title-h5">POS 시스템 부팅 오류 해결 가이드</h5>
                <h6 className="chatbot-submenu-title-h6">즉시 시도할 수 있는 해결 방법:</h6>
                <br />
                <h6 className="chatbot-submenu-title-h6">리스트 타입 - 1단계: 전원 확인</h6>

                <ul className="guide-list-ul">
                    <li>전원 케이블이 제대로 연결되어 있는지 확인</li>
                    <li>전원 버튼을 10초간 길게 눌러 완전 종료 후 재시작</li>
                    <li>전원 어댑터 LED 표시등 확인</li>
                </ul>
                <br />

                <h6 className="chatbot-submenu-title-h6">넘버링 리스트 타입 - 2단계: 하드웨어 점검</h6>
                <ol className="guide-list-ol">
                    <li>모든 USB 연결 장치 분리 후 재시작</li>
                    <li>RAM 메모리 재장착 (가능한 경우)</li>
                    <li>하드디스크 연결 상태 확인</li>
                </ol>
                <br />

                <p className="emergncy-call">긴급 연락: 1588-1234 (24시간)</p>
                <br />

                <div className="chatbot-bottom-nav">
                    <div className="chatbot-submenu back" onClick={getSubmenu}><i className="icon-back"></i> 이전 메뉴 보기</div>
                    <div className="chatbot-submenu home" onClick={getfirstMenu}><i className="icon-home" style={{ width: "20px", height: "20px" }}></i> 처음으로</div>
                    <div className="chatbot-submenu up"><i className="icon-up"></i> </div>
                    <div className="chatbot-submenu down"><i className="icon-down"></i> </div>
                    <div className="chatbot-submenu copy"><i className="icon-copy"></i> </div>
                    <div className="chatbot-submenu speak"><i className="icon-speak"></i> </div>
                </div>
            </div>
        ]);
    }

    const getfirstMenu = () => {
        setinquiryStatus(false);
        setSectionContent(prev => [
            ...prev,
            <div className="after-loading" key={`after-loading-${Date.now()}`}>
                <div className="chatbot-button-grid">
                    <div className="chatbot-button" onClick={() => getinquiryform(1)}>
                        <div className="chatbot-button-icon icon-headset"></div>
                        <div>
                            <div className="chatbot-button-title ">문의하기</div>
                            <div className="chatbot-button-desc">직접 상담 및 지원 요청</div>
                        </div>
                    </div>

                    <div className="chatbot-button">
                        <div className="chatbot-button-icon icon-headset"></div>
                        <div>
                            <div className="chatbot-button-title ">자주하는 질문</div>
                            <div className="chatbot-button-desc">질문 목록 보기</div>
                        </div>
                    </div>

                    {Categories.map(category => (
                        <div key={category.id} className="chatbot-button" onClick={getSubmenu}>
                            <div className={`chatbot-button-icon ${EmogiToTag(category.icon_emoji)}`}></div>
                            <div>
                                <div className="chatbot-button-title">{category.name}</div>
                                <div className="chatbot-button-desc">{category.description}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        ]);
    }



    const getinquiryform = (status) => {
        setinquiryStatus(status);
        if (status === 1) {
            setSectionContent(prev => [
                ...prev,
                <div className="chatbot-underline" key={`underline-${Date.now()}`} />,
                <div className="inquiry-form" key={`inquiry-${Date.now()}`}>
                    <div className="chatbot-inquiry-header">
                        <div className="inquiry-step"><h4>1</h4>/5 단계</div>

                        <div>
                            <h5 className="chatbot-submenu-title-h5">문의 정보 수집</h5>
                            <p className="inquiry-question">성함을 알려주세요.</p>
                        </div>
                    </div>
                    <br />

                    <div className="inquiry-message">
                        <h6 className="chatbot-submenu-title-h6">문의하기 시작</h6>
                        <br />

                        <p className="assistant-text">안녕하세요! 문의사항을 접수해드리겠습니다. <br />빠른 처리를 위해 몇 가지 정보를 수집하겠습니다.</p>
                        <br />

                        <p className="assistant-text-bold">첫 번째로, 성함을 알려주세요. </p>
                        <p className="assistant-text">(예: 홍길동)</p>
                        <br />
                    </div>
                    <div className="chatbot-bottom-nav">
                        <div className="chatbot-submenu home" onClick={getfirstMenu}><i className="icon-home" style={{ width: "20px", height: "20px" }}></i> 처음으로</div>
                        <div className="chatbot-submenu up"><i className="icon-up"></i> </div>
                        <div className="chatbot-submenu down"><i className="icon-down"></i> </div>
                        <div className="chatbot-submenu copy"><i className="icon-copy"></i> </div>
                        <div className="chatbot-submenu speak"><i className="icon-speak"></i> </div>
                    </div>
                </div>
            ]);
        } else if (status === 2) {
            setSectionContent(prev => [
                ...prev,
                <div className="inquiry-form" key={`inquiry-${Date.now()}`}>
                    <div className="chatbot-inquiry-header">
                        <div className="inquiry-step"><h4>2</h4>/5 단계</div>

                        <div>
                            <h5 className="chatbot-submenu-title-h5">회사 정보 수집</h5>
                            <p className="inquiry-question">회사명을 알려주세요.</p>
                        </div>
                    </div>
                    <br />

                    <div className="inquiry-message">
                        <h6 className="chatbot-submenu-title-h6">{messageInput}님, 안녕하세요!</h6>
                        <br />

                        <p className="assistant-text">두 번째로, 거래처(회사명)을 알려주세요.<br />개인 문의인 경우 "개인"이라고 입력해주세요.<br />(예: 가람포스텍, 개인)</p>
                        <br />
                    </div>
                    <div className="chatbot-bottom-nav">
                        <div className="chatbot-submenu home" onClick={getfirstMenu}><i className="icon-home" style={{ width: "20px", height: "20px" }}></i> 처음으로</div>
                        <div className="chatbot-submenu up"><i className="icon-up"></i> </div>
                        <div className="chatbot-submenu down"><i className="icon-down"></i> </div>
                        <div className="chatbot-submenu copy"><i className="icon-copy"></i> </div>
                        <div className="chatbot-submenu speak"><i className="icon-speak"></i> </div>
                    </div>
                </div>
            ]);
        } else if (status === 3) {
            setSectionContent(prev => [
                ...prev,
                <div className="inquiry-form" key={`inquiry-${Date.now()}`}>
                    <div className="chatbot-inquiry-header">
                        <div className="inquiry-step"><h4>3</h4>/5 단계</div>

                        <div>
                            <h5 className="chatbot-submenu-title-h5">연락처</h5>
                            <p className="inquiry-question">연락처를 기입해주세요</p>
                        </div>
                    </div>
                    <br />

                    <div className="inquiry-message">

                        <p className="assistant-text">
                            세 번째로, 연락처를 알려주세요. <br />
                            빠른 처리를 위해 필요합니다. <br /><br />
                            (예: 010-1234-5678)
                        </p>
                        <br />
                    </div>
                    <div className="chatbot-bottom-nav">
                        <div className="chatbot-submenu home" onClick={getfirstMenu}><i className="icon-home" style={{ width: "20px", height: "20px" }}></i> 처음으로</div>
                        <div className="chatbot-submenu up"><i className="icon-up"></i> </div>
                        <div className="chatbot-submenu down"><i className="icon-down"></i> </div>
                        <div className="chatbot-submenu copy"><i className="icon-copy"></i> </div>
                        <div className="chatbot-submenu speak"><i className="icon-speak"></i> </div>
                    </div>
                </div>
            ]);
        } else if (status === 4) {
            setSectionContent(prev => [
                ...prev,
                <div className="inquiry-form" key={`inquiry-${Date.now()}`}>
                    <div className="chatbot-inquiry-header">
                        <div className="inquiry-step"><h4>4</h4>/5 단계</div>

                        <div>
                            <h5 className="chatbot-submenu-title-h5">문의 내용</h5>
                            <p className="inquiry-question">문의내용을 입력해주세요</p>
                        </div>
                    </div>
                    <br />

                    <div className="inquiry-message">
                        <p className="assistant-text">
                            구체적인 문의 내용을 알려주세요.<br />
                            자세히 설명해주실수록 더 정확한 지원이 가능합니다.<br /><br />

                            (예: 카드리더기 오류로 결제가 안됩니다, POS 용지 부족으로 용지 요청드립니다)
                        </p>
                        <br />
                    </div>
                    <div className="chatbot-bottom-nav">
                        <div className="chatbot-submenu home" onClick={getfirstMenu}><i className="icon-home" style={{ width: "20px", height: "20px" }}></i> 처음으로</div>
                        <div className="chatbot-submenu up"><i className="icon-up"></i> </div>
                        <div className="chatbot-submenu down"><i className="icon-down"></i> </div>
                        <div className="chatbot-submenu copy"><i className="icon-copy"></i> </div>
                        <div className="chatbot-submenu speak"><i className="icon-speak"></i> </div>
                    </div>
                </div>
            ]);

        } else if (status === 5) {
            setSectionContent(prev => [
                ...prev,
                <div className="inquiry-form" key={`inquiry-${Date.now()}`}>
                    <div className="chatbot-inquiry-header">
                        <div className="inquiry-step"><h4>5</h4>/5 단계</div>

                        <div>
                            <h5 className="chatbot-submenu-title-h5">이메일</h5>
                            <p className="inquiry-question">이메일을 입력해주세요</p>
                        </div>
                    </div>
                    <br />

                    <div className="inquiry-message">
                        <p className="assistant-text">
                            이메일을 입력해주세요<br /><br />

                            (예: bct@bctone.kr)
                        </p>
                        <br />
                    </div>
                    <div className="chatbot-bottom-nav">
                        <div className="chatbot-submenu home" onClick={getfirstMenu}><i className="icon-home" style={{ width: "20px", height: "20px" }}></i> 처음으로</div>
                        <div className="chatbot-submenu up"><i className="icon-up"></i> </div>
                        <div className="chatbot-submenu down"><i className="icon-down"></i> </div>
                        <div className="chatbot-submenu copy"><i className="icon-copy"></i> </div>
                        <div className="chatbot-submenu speak"><i className="icon-speak"></i> </div>
                    </div>
                </div>
            ]);

        } else if (status === 6) {
            InquiryCreate();
            setSectionContent(prev => [
                ...prev,
                <div className="chatbot-bubble assistant" key={`user-bubble-${Date.now()}`}>
                    <div className="bubble-date assistant">{formattedTime}</div>
                    <div className="bubble-message assistant">
                        📝문의가 접수 되었습니다.<br />
                        <br />
                        접수 정보:<br />
                        • 작성자: {inquiryInfo.name}<br />
                        • 거래처: {inquiryInfo.group}<br />
                        • 연락처: {inquiryInfo.phone}<br />
                        • 이메일: {inquiryInfo.email}<br />
                        • 문의 내용: {inquiryInfo.detail}<br />
                        <br />
                        귀하의 문의사항이 정상적으로 접수되었습니다.<br />
                        담당자가 확인 후 영업일 기준 1-2일 내에 연락드리겠습니다.<br />
                        <br />
                        긴급한 사항인 경우 1588-1234로 직접 연락주시기 바랍니다.<br />
                        <br />
                        감사합니다! 🙏<br />
                    </div>
                </div>
            ]);
            setinquiryStatus(false);
        } else if (status === 7) {
            setSectionContent(prev => [
                ...prev,
                <div className="inquiry-feedback-form" key={`inquiry-${Date.now()}`}>
                    <div className="inquiry-sky-form">
                        <h3 className="chatbot-submenu-title-h3">긴급 기술지원</h3>
                        <p className="inquiry-feedback-p">문제 상황을 사진으로 찍어서 이메일로 보내주시면 더 빠른 해결이 가능합니다.</p>

                        <div className="inquiry-feedback-choice">
                            <div className="feedback-button up">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M4.81646 0.752374C4.57883 0.183856 3.95919 -0.116947 3.36962 0.0424784L3.20419 0.0875988C1.26103 0.617012 -0.39937 2.50004 0.0849144 4.79216C1.20087 10.0562 5.34286 14.1983 10.6068 15.3142C12.9019 15.8016 14.7819 14.1381 15.3113 12.1949L15.3564 12.0295C15.5188 11.4369 15.215 10.8172 14.6495 10.5826L11.7228 9.36437C11.2265 9.15681 10.6519 9.3012 10.309 9.71931L9.14795 11.1391C7.03334 10.0893 5.33083 8.33261 4.35323 6.17585L5.68276 5.09296C6.10087 4.75305 6.24224 4.17852 6.0377 3.67919L4.81646 0.752374Z" fill="#323232" />
                                </svg>
                                대표번호 1588-1234
                            </div>
                            <div className="feedback-button down">
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none">
                                    <path d="M4.91875 4C3.85938 4 3 4.93099 3 6.07865C3 6.10911 3 6.1362 3.00312 6.16667H3V14.8333C3 16.0284 3.89688 17 5 17H17C18.1031 17 19 16.0284 19 14.8333V6.16667H18.9969C18.9969 6.1362 19 6.10911 19 6.07865C19 4.93099 18.1406 4 17.0812 4H4.91875ZM17.5 8.34349V14.8333C17.5 15.1313 17.275 15.375 17 15.375H5C4.725 15.375 4.5 15.1313 4.5 14.8333V8.34349L9.3375 12.318C10.3187 13.1271 11.6781 13.1271 12.6625 12.318L17.5 8.34349ZM4.5 6.07865C4.5 5.82812 4.6875 5.625 4.91875 5.625H17.0812C17.3125 5.625 17.5 5.82812 17.5 6.07865C17.5 6.22083 17.4375 6.35625 17.3344 6.44089L11.7563 11.0247C11.3094 11.3904 10.6906 11.3904 10.2437 11.0247L4.66563 6.44089C4.5625 6.35625 4.5 6.22083 4.5 6.07865Z" fill="#323232" />
                                </svg>
                                기술지원 이메일 tech@garampos.com
                            </div>
                        </div>
                    </div>
                    <br />

                    <div className="chatbot-bottom-nav">
                        <div className="chatbot-submenu home" onClick={getfirstMenu}><i className="icon-home" style={{ width: "20px", height: "20px" }}></i> 처음으로</div>
                        <div className="chatbot-submenu speak"><i className="icon-speak"></i> </div>
                    </div>
                </div>
            ]);
            setinquiryStatus(false);
        } else if (status === "feedback") {

        }
    }

    // 메시지 전송
    const handleSend = async () => {
        const content = messageInput.trim();
        if (!content) return;


        if (inquiryStatus === 1) {
            setInquiryInfo(prev => ({
                ...prev,
                name: content
            }));
            setSectionContent(prev => [
                ...prev,
                <div className="chatbot-bubble user" key={`user-bubble-${Date.now()}`}>
                    <div className="bubble-date user">{formattedTime}</div>
                    <div className="bubble-message user">{content}</div>
                </div>
            ]);
            setMessageInput("");
            getinquiryform(2);

        } else if (inquiryStatus === 2) {
            setInquiryInfo(prev => ({
                ...prev,
                group: content
            }));
            setSectionContent(prev => [
                ...prev,
                <div className="chatbot-bubble user" key={`user-bubble-${Date.now()}`}>
                    <div className="bubble-date user">{formattedTime}</div>
                    <div className="bubble-message user">{content}</div>
                </div>
            ]);
            setMessageInput("");
            getinquiryform(3);

        } else if (inquiryStatus === 3) {
            setInquiryInfo(prev => ({
                ...prev,
                phone: content
            }));
            setSectionContent(prev => [
                ...prev,
                <div className="chatbot-bubble user" key={`user-bubble-${Date.now()}`}>
                    <div className="bubble-date user">{formattedTime}</div>
                    <div className="bubble-message user">{content}</div>
                </div>
            ]);
            setMessageInput("");
            getinquiryform(4);

        } else if (inquiryStatus === 4) {
            setInquiryInfo(prev => ({
                ...prev,
                detail: content
            }));
            setSectionContent(prev => [
                ...prev,
                <div className="chatbot-bubble user" key={`user-bubble-${Date.now()}`}>
                    <div className="bubble-date user">{formattedTime}</div>
                    <div className="bubble-message user">{content}</div>
                </div>
            ]);
            setMessageInput("");
            getinquiryform(5);
        } else if (inquiryStatus === 5) {
            setInquiryInfo(prev => ({
                ...prev,
                email: content
            }));
            setSectionContent(prev => [
                ...prev,
                <div className="chatbot-bubble user" key={`user-bubble-${Date.now()}`}>
                    <div className="bubble-date user">{formattedTime}</div>
                    <div className="bubble-message user">{content}</div>
                </div>
            ]);
            setMessageInput("");
            getinquiryform(6);
        } else if (!inquiryStatus) {
            setSectionContent(prev => [
                ...prev,
                <div className="chatbot-bubble user" key={`user-bubble-${Date.now()}`}>
                    <div className="bubble-date user">{formattedTime}</div>
                    <div className="bubble-message user">{content}</div>
                </div>
            ]);
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
                const answer = data.answer?.trim?.() ? data.answer.trim() : "응답을 가져올 수 없습니다.";

                setSectionContent(prev => [
                    ...prev,
                    <div className="chatbot-bubble assistant" key={`user-bubble-${Date.now()}`}>
                        <div className="bubble-date assistant">{formattedTime}</div>
                        <div className="bubble-message assistant">{answer}</div>
                    </div>
                ]);
            } catch (error) {
                console.error("메시지 전송 오류:", error);
                setSectionContent(prev => [
                    ...prev,
                    <div className="chatbot-bubble assistant" key={`user-bubble-${Date.now()}`}>
                        <div className="bubble-date assistant">{formattedTime}</div>
                        <div className="bubble-message assistant">⚠️ 서버 연결 오류가 발생했습니다. 관리자에 문의해주세요</div>
                    </div>
                ]);
            } finally {
                setLoading(false);
            }
        }
    };



    return (
        <>
            <div className="chatbot-service">

                <header className="chatbot-header">
                    <div className="chatbot-header-inner">
                        <i className="chatbot-logo"></i>
                        <div style={{ display: "flex" }}>
                            <div className="chatbot-header-title">가람포스텍 AI 지원센터</div>
                            <div className="chatbot-header-subtitle">24시간 스마트 고객지원 서비스</div>
                        </div>
                    </div>
                    <div className="chatbot-header-buttons">
                        <button className="chatbot-header-button"><i className="icon-home"></i></button>
                        <button className="chatbot-header-button"><i className="icon-call"></i></button>
                        {/* <button className="chatbot-header-button"><i className="icon-close"></i></button> */}
                    </div>
                </header>


                <main className="chatbot-chat-area">

                    <div className={`loading-section ${welecome ? "fade-out" : "fade-in"}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60" fill="none">
                            <path d="M30 0C46.5685 0 60 13.4315 60 30C60 46.5685 46.5685 60 30 60C13.4315 60 0 46.5685 0 30C0 13.4315 13.4315 0 30 0ZM30 13C20.6112 13 13 20.6112 13 30C13 39.3888 20.6112 47 30 47C39.3888 47 47 39.3888 47 30C47 20.6112 39.3888 13 30 13Z" fill="url(#paint0_linear_3312_547)" />
                            <defs>
                                <linearGradient id="paint0_linear_3312_547" x1="2.66172e-09" y1="16.5517" x2="60.0019" y2="16.5609" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#F3AE2F" />
                                    <stop offset="0.461538" stopColor="#D28A87" />
                                    <stop offset="1" stopColor="#AD61EF" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <h1>가람포스텍 AI 지원센터</h1>
                        <p>24시간 스마트 고객지원</p>
                    </div>

                    <section className={`chatbot-chat-section ${welecome ? "fade-in" : "fade-out"}`} >
                        <div className="after-loading">
                            <div className="chatbot-welecome-section">
                                <h1 className="chatbot-intro-title">안녕하세요! 가람포스텍 AI 지원센터입니다.</h1>
                                <p className="chatbot-intro-text">
                                    POS 시스템, 키오스크, 결제 단말기 관련 궁금한 점이나 문제가 있으시면 <br /> 언제든지 말씀해 주세요!
                                </p>
                            </div>
                            <div className="chatbot-button-grid">
                                <div className="chatbot-button" onClick={() => getinquiryform(1)}>
                                    <div className="chatbot-button-icon icon-headset"></div>
                                    <div>
                                        <div className="chatbot-button-title ">문의하기</div>
                                        <div className="chatbot-button-desc">직접 상담 및 지원 요청</div>
                                    </div>
                                </div>

                                <div className="chatbot-button">
                                    <div className="chatbot-button-icon icon-headset"></div>
                                    <div>
                                        <div className="chatbot-button-title ">자주하는 질문</div>
                                        <div className="chatbot-button-desc">질문 목록 보기</div>
                                    </div>
                                </div>

                                {Categories.map(category => (
                                    <div key={category.id} className="chatbot-button" onClick={getSubmenu}>
                                        <div className={`chatbot-button-icon ${EmogiToTag(category.icon_emoji)}`}></div>
                                        <div>
                                            <div className="chatbot-button-title">{category.name}</div>
                                            <div className="chatbot-button-desc">{category.description}</div>
                                        </div>
                                    </div>
                                ))}

                            </div>
                        </div>

                        {sectionContent.map((content) => content)}

                        <div ref={sectionEndRef} />

                    </section>
                </main>


                <footer className="chatbot-input-area">
                    <div className="chatbot-input-box">
                        <textarea className="chatbot-input-message" placeholder="메시지를 입력하세요..."
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                        />
                        <div className="chatbot-input-tools">
                            <div className="chatbot-input-tools-left">

                                {/* <button className={`chatbot-input-button${plusmenu ? "-active" : ""}`}
                                    onClick={() => setplusmenu((prev) => !prev)}
                                >
                                    <i className="icon-attachment-active"></i>
                                </button> */}

                                <div className={`plus-menu ${plusmenu ? "open" : ""}`}>
                                    <div className="menu-section">
                                        <div className="menu-item" >
                                            <div className="menu-item-icon"><i className="icon-clip"></i></div>
                                            <div className="menu-item-text">
                                                <div className="menu-item-title">사진 및 파일 첨부</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>



                            <div className="chatbot-input-tools-right">
                                <button className={`chatbot-input-button mic${micStatus ? "-active" : ""}`}
                                    onClick={() => setmicStatus((prev) => !prev)}
                                >
                                    <i className="icon-mic-active"></i>
                                </button>
                                <button className="chatbot-input-button send"
                                    onClick={handleSend}
                                ><i className="icon-send"></i></button>
                            </div>
                        </div>
                    </div>
                </footer>
            </div >



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