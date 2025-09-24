import { useState } from "react";
import { assistant_showNotification } from '../utill/utill';

export default function Assisstant() {
    const [status, setStatus] = useState("idle"); // idle | saving | done

    const handleClick = () => {
        setStatus("saving");

        // 저장 중 메시지
        setTimeout(() => {
            setStatus("done");

            // 완료 후 다시 원래 상태로
            setTimeout(() => {
                setStatus("idle");
            }, 2000);
        }, 1500);

        // 알림
        assistant_showNotification("AI 모델 설정이 저장되었습니다. 변경사항이 즉시 적용됩니다.", "success");
    };


    return (
        <>

            <main className="main-content">
                {/* 상단 헤더 */}
                <header className="top-header">
                    <div className="header-left">
                        <div className="page-title">
                            <h1>AI 모델 설정</h1>
                            <p className="page-subtitle">EXAONE 4.0 모델의 성능과 동작을 조정하여 최적의 응답을 생성하세요</p>
                        </div>
                    </div>
                    <div className="header-right">
                        <div className="status-indicator">
                            <div className="status-dot"></div>
                            <span>EXAONE 4.0 활성</span>
                        </div>
                    </div>
                </header>

                <div className="main-container">
                    {/* 현재 상태 */}
                    <div className="status-card">
                        <div className="status-header">
                            <h2 className="status-title">모델 운영 현황</h2>
                            <div className="status-badge">
                                <div className="status-dot"></div>
                                <span>정상 운영중</span>
                            </div>
                        </div>
                        <div className="simple-metrics">
                            <div className="metric-item">
                                <div className="metric-value">94%</div>
                                <div className="metric-label">응답 정확도</div>
                            </div>
                            <div className="metric-item">
                                <div className="metric-value">1.2초</div>
                                <div className="metric-label">평균 응답시간</div>
                            </div>
                            <div className="metric-item">
                                <div className="metric-value">847</div>
                                <div className="metric-label">이번 달 처리 문의</div>
                            </div>
                            <div className="metric-item">
                                <div className="metric-value">99.8%</div>
                                <div className="metric-label">모델 가동률</div>
                            </div>
                        </div>
                    </div>

                    {/* AI 모델 정보 */}
                    <div className="section">
                        <h2 className="section-title">
                            <i className="fas fa-brain"></i>
                            현재 AI 모델
                        </h2>
                        <div className="model-card">
                            <div className="model-header">
                                <div className="model-icon">
                                    <i className="fas fa-star"></i>
                                </div>
                                <div className="model-info">
                                    <div className="model-name">EXAONE 4.0</div>
                                    <div className="model-provider">LG AI Research</div>
                                </div>
                            </div>

                            <div className="model-description">
                                한국 최초 하이브리드 AI 모델로 자연어 처리와 추론 능력을 통합하여 제공합니다.
                                한국어에 특화되어 기술지원에 최적화되었으며, 높은 정확도와 빠른 응답 속도를 자랑합니다.
                            </div>

                            <div className="model-features">
                                <span className="feature-tag">한국어 특화</span>
                                <span className="feature-tag">하이브리드 추론</span>
                                <span className="feature-tag">기술지원 최적화</span>
                                <span className="feature-tag">131K 토큰 컨텍스트</span>
                            </div>
                        </div>
                    </div>

                    {/* 응답 스타일 설정 */}
                    <div className="section">
                        <h2 className="section-title">
                            <i className="fas fa-comments"></i>
                            응답 스타일 설정
                        </h2>
                        <div className="settings-grid">
                            <div className="setting-card">
                                <div className="setting-title">
                                    <i className="fas fa-user-tie"></i>
                                    응답 톤앤매너
                                </div>
                                <div className="setting-group">
                                    <label className="setting-label">응답 스타일</label>
                                    <select className="input-field" id="responseStyle">
                                        <option value="professional">전문적이고 정확한 답변</option>
                                        <option value="friendly">친근하고 대화형 답변</option>
                                        <option value="concise">간결하고 핵심적인 답변</option>
                                    </select>
                                    <small style={{ color: "var(--text-secondary)" }}>
                                        챗봇의 답변 톤앤매너를 설정합니다
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 응답 품질 설정 */}
                    <div className="section">
                        <h2 className="section-title">
                            <i className="fas fa-cog"></i>
                            응답 품질 설정
                        </h2>
                        <div className="settings-grid" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
                            <div className="setting-card">
                                <div className="setting-title">
                                    <i className="fas fa-shield-alt"></i>
                                    안전성 및 필터링
                                </div>
                                <div className="toggle-switch">
                                    <div className="toggle-info">
                                        <h4>부적절한 질문 차단</h4>
                                        <div className="toggle-description">욕설, 스팸 자동 차단</div>
                                    </div>
                                    <div className="toggle active"></div>
                                </div>
                                <div className="toggle-switch">
                                    <div className="toggle-info">
                                        <h4>기술 외 문의 제한</h4>
                                        <div className="toggle-description">기술지원 외 주제 응답 제한</div>
                                    </div>
                                    <div className="toggle active"></div>
                                </div>
                            </div>

                            <div className="setting-card">
                                <div className="setting-title">
                                    <i className="fas fa-clock"></i>
                                    응답 최적화
                                </div>
                                <div className="toggle-switch">
                                    <div className="toggle-info">
                                        <h4>빠른 응답 모드</h4>
                                        <div className="toggle-description">간단한 질문에 즉시 답변</div>
                                    </div>
                                    <div className="toggle active"></div>
                                </div>
                                <div className="toggle-switch">
                                    <div className="toggle-info">
                                        <h4>상담원 연결 추천</h4>
                                        <div className="toggle-description">복잡한 문의시 상담원 연결 안내</div>
                                    </div>
                                    <div className="toggle active"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 액션 버튼  */}
                    <div className="assistant-actions">
                        <button className="assistant-btn assistant-btn-secondary">
                            <i className="fas fa-undo"></i>
                            기본값 복원
                        </button>
                        <button
                            className="assistant-btn assistant-btn-primary"
                            onClick={handleClick}
                            disabled={status === "saving"}
                            style={{
                                background:
                                    status === "done" ? "var(--accent-color)" : "var(--primary-color)",
                            }}
                        >
                            {status === "idle" && (
                                <>
                                    <i className="fas fa-save"></i> 설정 저장
                                </>
                            )}
                            {status === "saving" && (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i> 저장 중...
                                </>
                            )}
                            {status === "done" && (
                                <>
                                    <i className="fas fa-check"></i> 저장 완료!
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </main>
        </>
    )
}