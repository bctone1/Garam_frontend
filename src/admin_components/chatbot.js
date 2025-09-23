import { useState } from "react";
import { showNotification } from '../utill/utill';

export default function Chatbot() {
    const [categories, setCategories] = useState([
        {
            id: 1,
            icon: "🖥️",
            name: "POS 시스템",
            desc: "POS 시스템 관련 문의사항",
        },
        {
            id: 2,
            icon: "📱",
            name: "키오스크",
            desc: "키오스크 관련 문의사항",
        },
        {
            id: 3,
            icon: "💳",
            name: "결제 단말기",
            desc: "결제 단말기 관련 문의사항",
        },
        {
            id: 4,
            icon: "🔧",
            name: "설치/설정",
            desc: "설치 및 설정 관련 문의사항",
        },
        {
            id: 5,
            icon: "📝",
            name: "문의하기",
            desc: "직접 상담 및 지원 요청",
        }
    ]);

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
                icon: "📋",
                name: `새 카테고리 ${newId}`,
                desc: "설명을 입력해주세요",
            };

            return [...prevCategories, newCategory];
        });
    };

    return (
        <>
            <main class="main-content">
                <header class="top-header">
                    <div class="header-left">
                        <div class="page-title">
                            <h1>챗봇 운영 설정</h1>
                            <p class="page-subtitle">챗봇의 외관과 동작을 설정합니다</p>
                        </div>
                    </div>
                    <div class="header-right">
                        <a href="../09.10-가람포스텍 챗봇(수정).html" target="_blank" class="preview-btn">
                            <i class="fas fa-external-link-alt"></i>
                            챗봇 미리보기
                        </a>
                    </div>
                </header>

                <div class="main-container">
                    {/* 환영 메시지 */}
                    <div class="card">
                        <h2 class="card-title">
                            <i class="fas fa-home"></i>
                            환영 메시지
                        </h2>

                        <div class="form-group">
                            <label class="form-label">환영 제목</label>
                            <input type="text" class="form-input" value="안녕하세요! 가람포스텍 AI 지원센터입니다" id="welcomeTitle" />
                            <div class="form-help">사용자가 처음 보는 메시지 제목</div>
                        </div>

                        <div class="form-group">
                            <label class="form-label">환영 내용</label>
                            <textarea class="form-input form-textarea" id="welcomeMessage">POS 시스템, 키오스크, 결제 단말기 관련 궁금한 점이나 문제가 있으시면 언제든지 말씀해 주세요!</textarea>
                            <div class="form-help">환영 제목 아래 표시되는 설명</div>
                        </div>
                    </div>

                    {/* 빠른 지원 카테고리 */}
                    <div class="card">
                        <h2 class="card-title">
                            <i class="fas fa-th-large"></i>
                            빠른 지원 카테고리
                        </h2>

                        <div className="categories-list" id="categoriesList">
                            {categories.map((category) => (
                                <div className="category-item" key={category.id}>
                                    <div
                                        className="category-icon"
                                        onClick={(e) => toggleEmojiPicker(e, category.id)}
                                    >
                                        {category.icon}
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
                                            value={category.desc}
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

                    <button class="add-category-btn" onClick={() => addCategory()}>
                        <i class="fas fa-plus"></i>
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

                    <div class="form-help">카테고리명과 설명을 직접 수정할 수 있습니다. 이모지를 클릭하여 아이콘을 변경하세요.</div>
                </div>

                {/* 긴급 연락처 */}
                <div class="card">
                    <h2 class="card-title">
                        <i class="fas fa-phone"></i>
                        긴급 연락처
                    </h2>

                    <div class="contact-grid">
                        <div class="form-group">
                            <label class="form-label">기술지원 전화번호</label>
                            <input type="tel" class="form-input" value="1588-1234" id="emergencyPhone" />
                            <div class="form-help">긴급 상황 시 연결될 번호</div>
                        </div>

                        <div class="form-group">
                            <label class="form-label">기술지원 이메일</label>
                            <input type="email" class="form-input" value="tech@garampos.com" id="emergencyEmail" />
                            <div class="form-help">문의 접수용 이메일</div>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">운영 시간</label>
                        <select class="form-input" id="operatingHours">
                            <option value="24/7">연중무휴 24시간</option>
                            <option value="business" selected>평일 09:00-18:00</option>
                            <option value="extended">평일 08:00-22:00</option>
                        </select>
                        <div class="form-help">기술지원 서비스 운영 시간</div>
                    </div>
                </div>



                {/* 기본 동작 설정 */}
                <div class="card">
                    <h2 class="card-title">
                        <i class="fas fa-cog"></i>
                        기본 동작 설정
                    </h2>

                    <div class="form-group">
                        <label class="form-label">파일 업로드 허용</label>
                        <select class="form-input" id="fileUpload">
                            <option value="true" selected>허용 (이미지, 문서)</option>
                            <option value="images">이미지만 허용</option>
                            <option value="false">차단</option>
                        </select>
                        <div class="form-help">사용자가 파일을 첨부할 수 있는지 설정</div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">세션 유지 시간</label>
                        <select class="form-input" id="sessionDuration">
                            <option value="30">30분</option>
                            <option value="60" selected>1시간</option>
                            <option value="120">2시간</option>
                            <option value="unlimited">무제한</option>
                        </select>
                        <div class="form-help">대화 세션이 유지되는 시간</div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">최대 메시지 수</label>
                        <select class="form-input" id="maxMessages">
                            <option value="10">10개</option>
                            <option value="30" selected>30개</option>
                            <option value="50">50개</option>
                            <option value="unlimited">제한 없음</option>
                        </select>
                        <div class="form-help">한 세션에서 주고받을 수 있는 최대 메시지 수</div>
                    </div>
                </div>

                {/* 액션 버튼  */}
                <div class="chatbot-actions">
                    <button class="btn chatbot-btn-secondary" onclick="resetSettings()">
                        <i class="fas fa-undo"></i>
                        기본값으로 되돌리기
                    </button>
                    <button class="btn btn-primary" onclick="saveSettings()">
                        <i class="fas fa-save"></i>
                        설정 저장
                    </button>
                </div>

            </main>
        </>
    )
}