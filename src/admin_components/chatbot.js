import axios from "axios";
import { useState, useEffect } from "react";
import { showNotification } from '../utill/utill';


export default function Chatbot() {
    // useEffect(() => {
    //     axios
    //         .get(`${process.env.REACT_APP_API_URL}/system/settings/${settingId}/quick-categories`, {
    //             params: {
    //                 offset: 0,
    //                 limit: 50,
    //             },
    //         })
    //         .then((res) => {
    //             setCategories(res.data);
    //             console.log(res.data);
    //         })
    //         .catch((err) => {
    //             if (err.response && err.response.status === 404) {
    //                 alert("해당 setting을 찾을 수 없습니다.");
    //             } else {
    //                 console.error(err);
    //             }
    //         });
    // }, [settingId]);

    useEffect(() => {
        axios
            .get(`${process.env.REACT_APP_API_URL}/system/setting`)
            .then((res) => {
                setsystemSettings(res.data); // 단일 객체 반환
                console.log(res.data);
            })
            .catch((err) => {
                if (err.response && err.response.status === 404) {
                    alert("해당 setting을 찾을 수 없습니다.");
                } else {
                    console.error(err);
                }
            });

        axios
            .get(`${process.env.REACT_APP_API_URL}/system/quick-categories`, {
                params: {
                    offset: 0,
                    limit: 50,
                },
            })
            .then((res) => {
                setCategories(res.data);
                console.log(res.data);
            })
            .catch((err) => {
                if (err.response && err.response.status === 404) {
                    alert("해당 setting을 찾을 수 없습니다.");
                } else {
                    console.error(err);
                }
            });
    }, []);

    const [systemSettings, setsystemSettings] = useState({
        welcome_title: "",
        welcome_message: "",
        emergency_phone: "",
        emergency_email: "",
        operating_hours: "",

    });
    const [categories, setCategories] = useState([]);

    const [pickerPosition, setPickerPosition] = useState({ top: 0, left: 0 });
    const [activeCategoryId, setActiveCategoryId] = useState(null);

    const toggleEmojiPicker = (event, id) => {
        const iconElement = event.currentTarget;
        const rect = iconElement.getBoundingClientRect();

        if (activeCategoryId === id) {
            setActiveCategoryId(null);
            return;
        }

        setPickerPosition({
            top: rect.bottom + 5 + window.scrollY,
            left: rect.left + window.scrollX,
        });
        setActiveCategoryId(id);
    };

    const selectEmoji = (emoji) => {
        setCategories((prevCategories) =>
            prevCategories.map((category) =>
                category.id === activeCategoryId
                    ? { ...category, icon: emoji } // 선택된 카테고리만 업데이트
                    : category
            )
        );
        // alert(`선택한 이모지: ${emoji} (카테고리 ${activeCategoryId})`);
        setActiveCategoryId(null);
    };


    const addCategory = () => {
        showNotification('카테고리가 추가되었습니다.', 'success');
        setCategories((prevCategories) => {
            const newId = prevCategories.length
                ? Math.max(...prevCategories.map((c) => c.id)) + 1
                : 1;

            const newCategory = {
                id: newId,
                icon_emoji: "📋",
                name: `새 카테고리 ${newId}`,
                description: "설명을 입력해주세요",
            };

            return [...prevCategories, newCategory];
        });
    };

    return (
        <>
            <main className="main-content">
                <header className="top-header">
                    <div className="header-left">
                        <div className="page-title">
                            <h1>챗봇 운영 설정</h1>
                            <p className="page-subtitle">챗봇의 외관과 동작을 설정합니다</p>
                        </div>
                    </div>
                    <div className="header-right">
                        <a href="../09.10-가람포스텍 챗봇(수정).html" target="_blank" className="preview-btn">
                            <i className="fas fa-external-link-alt"></i>
                            챗봇 미리보기
                        </a>
                    </div>
                </header>

                <div className="main-container">
                    {/* 환영 메시지 */}
                    <div className="card">
                        <h2 className="card-title">
                            <i className="fas fa-home"></i>
                            환영 메시지
                        </h2>

                        <div className="form-group">
                            <label className="form-label">환영 제목</label>
                            <input
                                type="text"
                                className="form-input"
                                value={systemSettings?.welcome_title}
                                id="welcomeTitle"
                                onChange={(e) =>
                                    setsystemSettings((prev) => ({
                                        ...prev,
                                        welcome_title: e.target.value
                                    }))
                                }
                            />
                            <div className="form-help">사용자가 처음 보는 메시지 제목</div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">환영 내용</label>
                            <textarea
                                className="form-input form-textarea"
                                id="welcomeMessage"
                                value={systemSettings?.welcome_message}
                                onChange={(e) =>
                                    setsystemSettings((prev) => ({
                                        ...prev,
                                        welcome_message: e.target.value
                                    }))
                                }
                            />

                            <div className="form-help">환영 제목 아래 표시되는 설명</div>
                        </div>
                    </div>

                    {/* 빠른 지원 카테고리 */}
                    <div className="card">
                        <h2 className="card-title">
                            <i className="fas fa-th-large"></i>
                            빠른 지원 카테고리
                        </h2>

                        <div className="categories-list" id="categoriesList">
                            {categories.map((category) => (
                                <div className="category-item" key={category.id}>
                                    <div
                                        className="category-icon"
                                        onClick={(e) => toggleEmojiPicker(e, category.id)}
                                    >
                                        {category.icon_emoji}
                                    </div>
                                    <div className="category-info">
                                        <input
                                            type="text"
                                            className="category-input"
                                            value={category.name}
                                            id={`category${category.id}Name`}
                                            readOnly
                                        />
                                        <input
                                            type="text"
                                            className="category-desc-input"
                                            value={category.description}
                                            id={`category${category.id}Desc`}
                                            readOnly
                                        />
                                    </div>
                                    <div className="category-actions">
                                        <button
                                            className="category-action-btn btn-edit"
                                            title="수정"
                                        >
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button
                                            className="category-action-btn btn-delete"
                                            title="삭제"
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button className="add-category-btn" onClick={() => addCategory()}>
                        <i className="fas fa-plus"></i>
                        새 카테고리 추가
                    </button>

                    {/* 이모지 선택기 (화면에 하나만 띄우기, 절대 좌표로 배치) */}
                    {activeCategoryId && (
                        <div
                            className="emoji-picker show"
                            style={{
                                position: "absolute",
                                top: pickerPosition.top,
                                left: pickerPosition.left,
                                zIndex: 999,
                                background: "#fff",
                                border: "1px solid #ccc",
                                borderRadius: "8px",
                                padding: "5px",
                            }}
                        >
                            {["🖥️", "📱", "💳", "🔧", "💻", "🖨️", "🌐", "💡", "📊", "📋", "📈", "🎯", "🏆", "⭐", "🚀", "🔒", "📞", "💬"].map((emoji) => (
                                <button
                                    key={emoji}
                                    className="emoji-option"
                                    onClick={() => selectEmoji(emoji)}
                                    style={{ fontSize: "20px", margin: "2px" }}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="form-help">카테고리명과 설명을 직접 수정할 수 있습니다. 이모지를 클릭하여 아이콘을 변경하세요.</div>
                </div>

                {/* 긴급 연락처 */}
                <div className="card">
                    <h2 className="card-title">
                        <i className="fas fa-phone"></i>
                        긴급 연락처
                    </h2>

                    <div className="contact-grid">
                        <div className="form-group">
                            <label className="form-label">기술지원 전화번호</label>
                            <input type="tel" className="form-input" value={systemSettings?.emergency_phone} id="emergencyPhone"
                                onChange={(e) =>
                                    setsystemSettings((prev) => ({
                                        ...prev,
                                        emergency_phone: e.target.value
                                    }))
                                }
                            />
                            <div className="form-help">긴급 상황 시 연결될 번호</div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">기술지원 이메일</label>
                            <input type="email" className="form-input" value={systemSettings?.emergency_email} id="emergencyEmail"
                                onChange={(e) =>
                                    setsystemSettings((prev) => ({
                                        ...prev,
                                        emergency_email: e.target.value
                                    }))
                                }
                            />
                            <div className="form-help">문의 접수용 이메일</div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">운영 시간</label>
                        <select className="form-input" id="operatingHours" value={systemSettings?.operating_hours}
                            onChange={(e) =>
                                setsystemSettings((prev) => ({
                                    ...prev,
                                    operating_hours: e.target.value
                                }))
                            }
                        >
                            <option value="24/7">연중무휴 24시간</option>
                            <option value="business">평일 09:00-18:00</option>
                            <option value="extended">평일 08:00-22:00</option>
                        </select>
                        <div className="form-help">기술지원 서비스 운영 시간</div>
                    </div>
                </div>



                {/* 기본 동작 설정 */}
                <div className="card">
                    <h2 className="card-title">
                        <i className="fas fa-cog"></i>
                        기본 동작 설정
                    </h2>

                    <div className="form-group">
                        <label className="form-label">파일 업로드 허용</label>
                        <select className="form-input" id="fileUpload" value={systemSettings?.file_upload_mode}
                            onChange={(e) =>
                                setsystemSettings((prev) => ({
                                    ...prev,
                                    file_upload_mode: e.target.value
                                }))
                            }
                        >
                            <option value="true">허용 (이미지, 문서)</option>
                            <option value="images">이미지만 허용</option>
                            <option value="false">차단</option>
                        </select>
                        <div className="form-help">사용자가 파일을 첨부할 수 있는지 설정</div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">세션 유지 시간</label>
                        <select className="form-input" id="sessionDuration" value={systemSettings?.session_duration}
                            onChange={(e) =>
                                setsystemSettings((prev) => ({
                                    ...prev,
                                    session_duration: e.target.value
                                }))
                            }
                        >
                            <option value="30">30분</option>
                            <option value="60" >1시간</option>
                            <option value="120">2시간</option>
                            <option value="unlimited">무제한</option>
                        </select>
                        <div className="form-help">대화 세션이 유지되는 시간</div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">최대 메시지 수</label>
                        <select className="form-input" id="maxMessages" value={systemSettings?.max_messages}
                            onChange={(e) =>
                                setsystemSettings((prev) => ({
                                    ...prev,
                                    max_messages: e.target.value
                                }))
                            }
                        >
                            <option value="10">10개</option>
                            <option value="30" >30개</option>
                            <option value="50">50개</option>
                            <option value="unlimited">제한 없음</option>
                        </select>
                        <div className="form-help">한 세션에서 주고받을 수 있는 최대 메시지 수</div>
                    </div>
                </div>

                {/* 액션 버튼  */}
                <div className="chatbot-actions">
                    <button className="btn chatbot-btn-secondary" >
                        <i className="fas fa-undo"></i>
                        기본값으로 되돌리기
                    </button>
                    <button className="btn btn-primary" >
                        <i className="fas fa-save"></i>
                        설정 저장
                    </button>
                </div>

            </main>
        </>
    )
}