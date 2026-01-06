import axios from "axios";
import { useState, useEffect } from "react";
import { assistant_showNotification, showToast } from '../utill/utill';

export default function Assisstant() {
    const [status, setStatus] = useState("idle");


    const [modelSetting, setmodelSetting] = useState({});

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_URL}/model`).then((res) => {
            setmodelSetting(res.data); // 단일 객체 반환
            console.log(res.data);
        }).catch((err) => {
            if (err.response && err.response.status === 404) {
                alert("해당 setting을 찾을 수 없습니다.");
            } else {
                console.error(err);
            }
        });
    }, []);

    const handleClick = () => {
        setStatus("saving");
        axios.put(`${process.env.REACT_APP_API_URL}/model`, modelSetting).then((res) => {
            console.log(res.data);
            setTimeout(() => {
                setStatus("done");
                setTimeout(() => {
                    setStatus("idle");
                }, 2000);
            }, 1500);
            assistant_showNotification("AI 모델 설정이 저장되었습니다. 변경사항이 즉시 적용됩니다.", "success");
        }).catch((err) => {
            showToast("설정변경 중 오류가 발생했습니다.", 'error');
        });

    };

    const handleSettings = (key) => {
        // alert(`${key} 토글 클릭`);
        setmodelSetting((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };


    return (
        <>
            <main className="assistant-main-content">
                {/* 상단 헤더 */}
                <header className="top-header">
                    <div className="header-left">
                        <div className="page-title">
                            <h1>AI 모델 설정</h1>
                            <p className="page-subtitle">GPT-4o-mini 모델의 성능과 동작을 조정하여 최적의 응답을 생성하세요</p>
                        </div>
                    </div>
                    <div className="header-right">
                        <div className="status-indicator">
                            <div className="status-dot"></div>
                            <span>GPT-4o-mini 활성</span>
                        </div>
                    </div>
                </header>

                <div className="assistant-main-container">
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
                                <div className="metric-value">{modelSetting.accuracy}%</div>
                                <div className="metric-label">응답 정확도</div>
                            </div>
                            <div className="metric-item">
                                <div className="metric-value">
                                    {(modelSetting.avg_response_time_ms / 1000).toFixed(3)}초
                                </div>
                                <div className="metric-label">평균 응답시간</div>
                            </div>
                            <div className="metric-item">
                                <div className="metric-value">{modelSetting.month_conversations}</div>
                                <div className="metric-label">이번 달 처리 문의</div>
                            </div>
                            <div className="metric-item">
                                <div className="metric-value">{modelSetting.uptime_percent}%</div>
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
                                    <div className="model-name">GPT-4o-mini</div>
                                    <div className="model-provider">OpenAI</div>
                                </div>
                            </div>

                            <div className="model-description">
                                OpenAI의 경량화 모델로 빠른 응답 속도와 안정적인 성능을 제공합니다. 고객 기술 지원 문의 응대에 최적화되어 있습니다.
                            </div>

                            <div className="model-features">
                                <span className="feature-tag">고속 응답</span>
                                <span className="feature-tag">안정적 성능</span>
                                <span className="feature-tag">기술지원 최적화</span>
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
                                    <select className="input-field" id="responseStyle" value={modelSetting.response_style}
                                        onChange={(e) => setmodelSetting({
                                            ...modelSetting,
                                            response_style: e.target.value,
                                        })}
                                    >
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
                                    <div className={`toggle ${modelSetting.block_inappropriate ? "active" : ""}`}
                                        onClick={() => handleSettings("block_inappropriate")}
                                    ></div>
                                </div>
                                <div className="toggle-switch">
                                    <div className="toggle-info">
                                        <h4>기술 외 문의 제한</h4>
                                        <div className="toggle-description">기술지원 외 주제 응답 제한</div>
                                    </div>
                                    <div className={`toggle ${modelSetting.restrict_non_tech ? "active" : ""}`}
                                        onClick={() => handleSettings("restrict_non_tech")}
                                    ></div>
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
                                    <div className={`toggle ${modelSetting.fast_response_mode ? "active" : ""}`}
                                        onClick={() => handleSettings("fast_response_mode")}
                                    ></div>
                                </div>
                                <div className="toggle-switch">
                                    <div className="toggle-info">
                                        <h4>상담원 연결 추천</h4>
                                        <div className="toggle-description">복잡한 문의시 상담원 연결 안내</div>
                                    </div>
                                    <div className={`toggle ${modelSetting.suggest_agent_handoff ? "active" : ""}`}
                                        onClick={() => handleSettings("suggest_agent_handoff")}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 액션 버튼  */}
                    <div className="assistant-actions">
                        {/* <button className="assistant-btn assistant-btn-secondary">
                            <i className="fas fa-undo"></i>
                            기본값 복원
                        </button> */}
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
            </main >
        </>
    )
}