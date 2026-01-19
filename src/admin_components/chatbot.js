import axios from "axios";
import { useState, useEffect } from "react";
import { showNotification, assistant_showNotification } from '../utill/utill';


export default function Chatbot() {

    useEffect(() => {
        axios
            .get(`${process.env.REACT_APP_API_URL}/system/setting`)
            .then((res) => {
                setsystemSettings(res.data); // 단일 객체 반환
                // console.log(res.data);
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
                // console.log(res.data);
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
        file_upload_mode: "",
        session_duration: "",
        max_messages: ""
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
                    ? { ...category, icon_emoji: emoji } // ✅ 속성 이름 수정
                    : category
            )
        );
        setActiveCategoryId(null);
    };



    const addCategory = () => {
        showNotification('Category added successfully.', 'success');
        setCategories((prevCategories) => {
            const newId = prevCategories.length
                ? Math.max(...prevCategories.map((c) => c.id)) + 1
                : 1;

            const newCategory = {
                id: newId,
                icon_emoji: "📋",
                name: `New Category ${newId}`,
                description: "Enter the description.",
            };

            return [...prevCategories, newCategory];
        });
    };

    const handleSettings = async () => {
        // alert("정보저장");
        try {
            const settingPayload = {
                welcome_title: systemSettings.welcome_title,
                welcome_message: systemSettings.welcome_message,
                operating_hours: systemSettings.operating_hours,
                file_upload_mode: systemSettings.file_upload_mode,
                session_duration: systemSettings.session_duration,
                max_messages: systemSettings.max_messages,
                emergency_phone: systemSettings.emergency_phone,
                emergency_email: systemSettings.emergency_email,
            };

            // 두 요청을 동시에 실행
            const [settingRes, categoryRes] = await Promise.all([
                fetch(`${process.env.REACT_APP_API_URL}/system/setting`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(settingPayload),
                }),
                fetch(`${process.env.REACT_APP_API_URL}/system/quick-categories-list`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(categories),
                }),
            ]);

            const [settingData, categoryData] = await Promise.all([
                settingRes.json(),
                categoryRes.json(),
            ]);

            console.log("System setting saved:", settingData);
            console.log("Categories saved:", categoryData);
            showNotification("Settings saved successfully.", "success");

        } catch (error) {
            console.error(error);
            alert("오류발생");
        }
    };

    const handleDelete = async (category_id) => {
        if (!window.confirm("Are you sure you want to delete this category?")) return;

        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/system/quick-categories/${category_id}`,
                {
                    method: "DELETE",
                }
            );

            if (!response.ok) {
                throw new Error(`Delete failed: ${response.status}`);
            }

            // 상태에서 삭제된 카테고리 제거
            setCategories((prev) =>
                prev.filter((category) => category.id !== category_id)
            );
            showNotification("The category has been deleted.", "success");

        } catch (error) {
            console.error(error);
            alert("Error occurred while deleting the category.");
        }
    };



    return (
        <>
            <main className="main-content">
                <header className="top-header">
                    <div className="header-left">
                        <div className="page-title">
                            <h1>Chatbot Operation Settings</h1>
                            <p className="page-subtitle">Set the appearance and behavior of the chatbot.</p>
                        </div>
                    </div>
                    {/* <div className="header-right">
                        <a href="../09.10-가람포스텍 챗봇(수정).html" target="_blank" className="preview-btn">
                            <i className="fas fa-external-link-alt"></i>
                            Chatbot Preview
                        </a>
                    </div> */}
                </header>

                <div className="main-container">
                    {/* 환영 메시지 */}
                    <div className="card">
                        <h2 className="card-title">
                            <i className="fas fa-home"></i>
                            Welcome Message
                        </h2>

                        <div className="form-group">
                            <label className="form-label">Welcome Title</label>
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
                            <div className="form-help">The title of the message displayed to the user for the first time.</div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Welcome Message</label>
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

                            <div className="form-help">The description displayed below the welcome title.</div>
                        </div>
                    </div>

                    {/* 빠른 지원 카테고리 */}
                    <div className="card">
                        <h2 className="card-title">
                            <i className="fas fa-th-large"></i>
                            Quick Support Categories
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
                                        {/* 이름 수정 */}
                                        <input
                                            type="text"
                                            className="category-input"
                                            value={category.name}
                                            id={`category${category.id}Name`}
                                            onChange={(e) =>
                                                setCategories((prev) =>
                                                    prev.map((cat) =>
                                                        cat.id === category.id
                                                            ? { ...cat, name: e.target.value }
                                                            : cat
                                                    )
                                                )
                                            }
                                        />

                                        {/* 설명 수정 */}
                                        <input
                                            type="text"
                                            className="category-desc-input"
                                            value={category.description || ""}
                                            id={`category${category.id}Desc`}
                                            onChange={(e) =>
                                                setCategories((prev) =>
                                                    prev.map((cat) =>
                                                        cat.id === category.id
                                                            ? { ...cat, description: e.target.value }
                                                            : cat
                                                    )
                                                )
                                            }
                                        />
                                    </div>

                                    <div className="category-actions">
                                        {/* <button
                                            className="category-action-btn btn-edit"
                                            title="수정"
                                        >
                                            <i className="fas fa-edit"></i>
                                        </button> */}
                                        <button
                                            onClick={() => handleDelete(category.id)}
                                            className="category-action-btn btn-delete"
                                            title="Delete"
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
                        Add New Category
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

                    <div className="form-help">You can directly modify the category name and description. Click on the emoji to change the icon.</div>
                </div>

                {/* 긴급 연락처 */}
                <div className="card">
                    <h2 className="card-title">
                        <i className="fas fa-phone"></i>
                        Emergency Contact
                    </h2>

                    <div className="contact-grid">
                        <div className="form-group">
                            <label className="form-label">Technical Support Phone Number</label>
                            <input type="tel" className="form-input" value={systemSettings?.emergency_phone} id="emergencyPhone"
                                onChange={(e) =>
                                    setsystemSettings((prev) => ({
                                        ...prev,
                                        emergency_phone: e.target.value
                                    }))
                                }
                            />
                            <div className="form-help">The number connected in case of emergency.</div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Technical Support Email</label>
                            <input type="email" className="form-input" value={systemSettings?.emergency_email} id="emergencyEmail"
                                onChange={(e) =>
                                    setsystemSettings((prev) => ({
                                        ...prev,
                                        emergency_email: e.target.value
                                    }))
                                }
                            />
                            <div className="form-help">The email for inquiries.</div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Operating Hours</label>
                        <select className="form-input" id="operatingHours" value={systemSettings?.operating_hours}
                            onChange={(e) =>
                                setsystemSettings((prev) => ({
                                    ...prev,
                                    operating_hours: e.target.value
                                }))
                            }
                        >
                            <option value="24/7">24/7</option>
                            <option value="business">Weekdays 09:00-18:00</option>
                            <option value="extended">Weekdays 08:00-22:00</option>
                        </select>
                        <div className="form-help">The operating hours of the technical support service.</div>
                    </div>
                </div>



                {/* 기본 동작 설정 */}
                <div className="card">
                    <h2 className="card-title">
                        <i className="fas fa-cog"></i>
                        Default Behavior Settings
                    </h2>

                    {/* <div className="form-group">
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
                    </div> */}

                    <div className="form-group">
                        <label className="form-label">Session Duration</label>
                        <select className="form-input" id="sessionDuration" value={systemSettings?.session_duration}
                            onChange={(e) =>
                                setsystemSettings((prev) => ({
                                    ...prev,
                                    session_duration: e.target.value
                                }))
                            }
                        >
                            <option value="30">30 minutes</option>
                            <option value="60" >1 hour</option>
                            <option value="120">2 hours</option>
                            <option value="unlimited">Unlimited</option>
                        </select>
                        <div className="form-help">The duration of the chat session.</div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Maximum Message Count</label>
                        <select className="form-input" id="maxMessages" value={systemSettings?.max_messages}
                            onChange={(e) =>
                                setsystemSettings((prev) => ({
                                    ...prev,
                                    max_messages: e.target.value
                                }))
                            }
                        >
                            <option value="10">10개</option>
                            <option value="30" >30 messages</option>
                            <option value="50">50 messages</option>
                            <option value="unlimited">Unlimited</option>
                        </select>
                        <div className="form-help">The maximum number of messages that can be exchanged in a session.</div>
                    </div>
                </div>

                {/* 액션 버튼  */}
                <div className="chatbot-actions">
                    {/* <button className="btn chatbot-btn-secondary" >
                        <i className="fas fa-undo"></i>
                        기본값으로 되돌리기
                    </button> */}
                    <button className="btn btn-primary"
                        onClick={() => handleSettings()}
                    >
                        <i className="fas fa-save"></i>
                        Save Settings
                    </button>
                </div>

            </main>
        </>
    )
}