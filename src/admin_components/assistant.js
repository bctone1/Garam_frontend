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
                            <h1>AI Model Settings</h1>
                            <p className="page-subtitle">Adjust the performance and behavior of the GPT-4o-mini model to create the optimal response.</p>
                        </div>
                    </div>
                    <div className="header-right">
                        <div className="status-indicator">
                            <div className="status-dot"></div>
                            <span>GPT-4o-mini Active</span>
                        </div>
                    </div>
                </header>

                <div className="assistant-main-container">
                    {/* 현재 상태 */}
                    <div className="status-card">
                        <div className="status-header">
                            <h2 className="status-title">Model Operation Status</h2>
                            <div className="status-badge">
                                <div className="status-dot"></div>
                                <span>Normal Operation</span>
                            </div>
                        </div>
                        <div className="simple-metrics">
                            <div className="metric-item">
                                <div className="metric-value">{modelSetting.accuracy}%</div>
                                <div className="metric-label">Response Accuracy</div>
                            </div>
                            <div className="metric-item">
                                <div className="metric-value">
                                    {(modelSetting.avg_response_time_ms / 1000).toFixed(3)} seconds
                                </div>
                                <div className="metric-label">Average Response Time</div>
                            </div>
                            <div className="metric-item">
                                <div className="metric-value">{modelSetting.month_conversations}</div>
                                <div className="metric-label">Inquiries this month</div>
                            </div>
                            <div className="metric-item">
                                <div className="metric-value">{modelSetting.uptime_percent}%</div>
                                <div className="metric-label">Model Uptime</div>
                            </div>
                        </div>
                    </div>

                    {/* AI 모델 정보 */}
                    <div className="section">
                        <h2 className="section-title">
                            <i className="fas fa-brain"></i>
                            Current AI Model
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
                                OpenAI's lightweight model provides fast response times and stable performance. It is optimized for customer technical support inquiries.
                            </div>

                            <div className="model-features">
                                <span className="feature-tag">Fast Response</span>
                                <span className="feature-tag">Stable Performance</span>
                                <span className="feature-tag">Technical Support Optimization</span>
                            </div>
                        </div>
                    </div>

                    {/* 응답 스타일 설정 */}
                    <div className="section">
                        <h2 className="section-title">
                            <i className="fas fa-comments"></i>
                            Response Style Settings
                        </h2>
                        <div className="settings-grid">
                            <div className="setting-card">
                                <div className="setting-title">
                                    <i className="fas fa-user-tie"></i>
                                    Response Tone and Manner
                                </div>
                                <div className="setting-group">
                                    <label className="setting-label">Response Style</label>
                                    <select className="input-field" id="responseStyle" value={modelSetting.response_style}
                                        onChange={(e) => setmodelSetting({
                                            ...modelSetting,
                                            response_style: e.target.value,
                                        })}
                                    >
                                        <option value="professional">Professional and Accurate Answer</option>
                                        <option value="friendly">Friendly and Conversational Answer</option>
                                        <option value="concise">Concise and Core Answer</option>
                                    </select>
                                    <small style={{ color: "var(--text-secondary)" }}>
                                        Set the tone and manner of the chatbot's response.
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 응답 품질 설정 */}
                    <div className="section">
                        <h2 className="section-title">
                            <i className="fas fa-cog"></i>
                            Response Quality Settings
                        </h2>
                        <div className="settings-grid" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
                            <div className="setting-card">
                                <div className="setting-title">
                                    <i className="fas fa-shield-alt"></i>
                                    Safety and Filtering
                                </div>
                                <div className="toggle-switch">
                                    <div className="toggle-info">
                                        <h4>Block Inappropriate Questions</h4>
                                        <div className="toggle-description">Block inappropriate questions automatically.</div>
                                    </div>
                                    <div className={`toggle ${modelSetting.block_inappropriate ? "active" : ""}`}
                                        onClick={() => handleSettings("block_inappropriate")}
                                    ></div>
                                </div>
                                <div className="toggle-switch">
                                    <div className="toggle-info">
                                        <h4>Restrict Non-Technical Inquiries</h4>
                                        <div className="toggle-description">Restrict responses to non-technical inquiries.</div>
                                    </div>
                                    <div className={`toggle ${modelSetting.restrict_non_tech ? "active" : ""}`}
                                        onClick={() => handleSettings("restrict_non_tech")}
                                    ></div>
                                </div>
                            </div>

                            <div className="setting-card">
                                <div className="setting-title">
                                    <i className="fas fa-clock"></i>
                                    Response Optimization
                                </div>
                                <div className="toggle-switch">
                                    <div className="toggle-info">
                                        <h4>Fast Response Mode</h4>
                                        <div className="toggle-description">Answer simple questions immediately.</div>
                                    </div>
                                    <div className={`toggle ${modelSetting.fast_response_mode ? "active" : ""}`}
                                        onClick={() => handleSettings("fast_response_mode")}
                                    ></div>
                                </div>
                                <div className="toggle-switch">
                                    <div className="toggle-info">
                                        <h4>Recommend Agent Connection</h4>
                                        <div className="toggle-description">Guide to connect with an agent for complex inquiries.</div>
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
                                    <i className="fas fa-save"></i> Save Settings
                                </>
                            )}
                            {status === "saving" && (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i> Saving...
                                </>
                            )}
                            {status === "done" && (
                                <>
                                    <i className="fas fa-check"></i> Saved!
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </main >
        </>
    )
}