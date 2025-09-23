import { useState } from 'react';

export default function Knowledge() {

    const [contentTap, setcontentTap] = useState("documentsTab");

    const documents = [
        {
            id: 1,
            name: 'POS 시스템 사용 매뉴얼.pdf',
            size: '2.4 MB',
            type: 'application/pdf',
            uploadDate: '2024-12-20',
            status: 'active',
            excerpt: 'POS 시스템의 기본 사용법과 문제 해결 방법...'
        },
        {
            id: 2,
            name: '키오스크 운영 가이드.docx',
            size: '1.8 MB',
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            uploadDate: '2024-12-19',
            status: 'active',
            excerpt: '키오스크 설치 및 운영에 관한 상세 가이드...'
        },
        {
            id: 3,
            name: '결제 시스템 정책.txt',
            size: '0.3 MB',
            type: 'text/plain',
            uploadDate: '2024-12-18',
            status: 'active',
            excerpt: '결제 시스템 사용 정책 및 보안 가이드라인...'
        }
    ];

    const [openId, setOpenId] = useState(null);

    const toggleFAQ = (id) => {
        setOpenId(openId === id ? null : id); // 이미 열려있으면 닫기
    };

    const faqs = [
        {
            id: 1,
            question: "POS 시스템이 갑자기 꺼졌을 때는 어떻게 해야 하나요?",
            views: 127,
            satisfaction: "94%",
            created: "2024-06-20",
            answer: (
                <>
                    <p>POS 시스템이 갑자기 꺼진 경우 다음 단계를 따라주세요:</p>
                    <ol style={{ marginLeft: "1.5rem", marginTop: "0.5rem" }}>
                        <li>전원 버튼을 5초간 눌러 완전히 종료한 후 다시 켜보세요</li>
                        <li>전원 케이블과 연결 상태를 확인하세요</li>
                        <li>문제가 지속되면 고객지원팀(1588-1234)으로 연락하세요</li>
                    </ol>
                </>
            ),
        },
        {
            id: 2,
            question: "카드 결제가 안될 때 해결방법은 무엇인가요?",
            views: 98,
            satisfaction: "89%",
            created: "2024-06-18",
            answer: (
                <>
                    <p>카드 결제 문제 해결 방법:</p>
                    <ol style={{ marginLeft: "1.5rem", marginTop: "0.5rem" }}>
                        <li>카드 리더기 연결 상태를 확인하세요</li>
                        <li>카드를 다시 삽입하거나 터치해보세요</li>
                        <li>다른 카드로 결제를 시도해보세요</li>
                        <li>POS 시스템을 재시작해보세요</li>
                    </ol>
                </>
            ),
        },
        {
            id: 3,
            question: "키오스크 화면이 멈췄을 때 대처방법을 알려주세요",
            views: 76,
            satisfaction: "92%",
            created: "2024-06-18",
            answer: (
                <>
                    <p>키오스크 화면 멈춤 현상 해결:</p>
                    <ol style={{ marginLeft: "1.5rem", marginTop: "0.5rem" }}>
                        <li>화면을 10초간 터치하지 마세요</li>
                        <li>전원 버튼을 길게 눌러 재시작하세요</li>
                        <li>네트워크 연결 상태를 확인하세요</li>
                        <li>문제가 반복되면 기술지원팀에 연락하세요</li>
                    </ol>
                </>
            ),
        },
        {
            id: 4,
            question: "시스템 초기 설정은 어떻게 하나요?",
            views: 145,
            satisfaction: "96%",
            created: "2024-06-18",
            answer: (
                <>
                    <p>시스템 초기 설정 방법:</p>
                    <ol style={{ marginLeft: "1.5rem", marginTop: "0.5rem" }}>
                        <li>네트워크 연결 설정을 먼저 완료하세요</li>
                        <li>관리자 계정을 생성하세요</li>
                        <li>매장 정보를 정확히 입력하세요</li>
                        <li>주변기기 연동을 테스트해보세요</li>
                    </ol>
                </>
            ),
        },
        {
            id: 5,
            question: "시스템 백업은 어떻게 하나요?",
            views: 63,
            satisfaction: "88%",
            created: "2024-06-18",
            answer: (
                <>
                    <p>시스템 백업 절차:</p>
                    <ol style={{ marginLeft: "1.5rem", marginTop: "0.5rem" }}>
                        <li>관리자 메뉴에서 '시스템 관리'를 선택하세요</li>
                        <li>'데이터 백업' 메뉴를 클릭하세요</li>
                        <li>백업할 데이터 범위를 선택하세요</li>
                        <li>'백업 시작' 버튼으로 백업을 실행하세요</li>
                    </ol>
                </>
            ),
        },


    ];




    return (
        <>
            <main className="main-content">
                {/* 상단 헤더 */}
                <header className="top-header">
                    <div className="header-left">
                        <div className="page-title">
                            <h1>지식베이스 관리</h1>
                            <p className="page-subtitle">파일 업로드하면 즉시 챗봇에서 활용 가능합니다</p>
                        </div>
                    </div>
                    <div className="header-right">
                        <div className="header-stats">
                            <div className="stat-item">
                                <span className="stat-label">활성 문서</span>
                                <span className="stat-value" id="totalDocuments">3</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">FAQ</span>
                                <span className="stat-value">5</span>
                            </div>
                        </div>
                        <div className="status-indicator">
                            <div className="status-dot"></div>
                            <span>정상 운영</span>
                        </div>
                    </div>
                </header>

                {/* 탭 네비게이션 */}
                <section className="knowledge-tab-navigation">
                    <div className="tab-container">
                        <button className={`tab-btn ${contentTap === "documentsTab" ? "active" : ""}`} data-tab="documents" onClick={() => setcontentTap("documentsTab")}>
                            <i className="fas fa-file-upload"></i>
                            문서 관리
                        </button>
                        <button className={`tab-btn ${contentTap === "faqTab" ? "active" : ""}`} data-tab="faq" onClick={() => setcontentTap("faqTab")}>
                            <i className="fas fa-question-circle"></i>
                            FAQ 관리
                        </button>
                    </div>
                </section>

                {/* 문서 관리 탭 */}
                <section className={`tab-content ${contentTap === "documentsTab" ? "active" : ""}`} id="documentsTab">
                    {/* 업로드 영역 */}
                    <div className="upload-section">
                        <div className="upload-area" id="documentUploadArea" onclick="document.getElementById('documentFileInput').click()">
                            <div className="upload-overlay" id="uploadOverlay">
                                <div className="spinner"></div>
                                <p style={{ color: " var(--primary-color)", fontWeight: "500" }}>파일을 처리하고 있습니다...</p>
                            </div>
                            <div className="upload-icon">
                                <i className="fas fa-cloud-upload-alt"></i>
                            </div>
                            <div className="upload-text">
                                <h3>파일을 드래그하거나 클릭해서 업로드</h3>
                                <p>PDF, Word, 텍스트 파일 지원 • 업로드 즉시 챗봇에서 사용 가능</p>
                            </div>
                            <input type="file" id="documentFileInput" multiple accept=".pdf,.doc,.docx,.txt" style={{ display: "none" }} />
                            <div className="upload-buttons">
                                <button className="btn btn-primary" onclick="document.getElementById('documentFileInput').click()">
                                    <i className="fas fa-file-upload"></i>
                                    파일 선택
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 업로드된 문서 목록  */}
                    <div className="documents-section">
                        <div className="section-header">
                            <div className="header-left">
                                <h3>업로드된 문서</h3>
                                <span className="document-count" id="documentCount">3개 문서</span>
                            </div>
                            <div className="header-actions">
                                <div className="search-box">
                                    <i className="fas fa-search"></i>
                                    <input type="text" placeholder="문서 검색..." id="documentSearch" oninput="filterDocuments()" />
                                </div>
                                <button className="btn btn-danger" onclick="bulkDeleteDocuments()">
                                    <i className="fas fa-trash"></i>
                                    선택 삭제
                                </button>
                            </div>
                        </div>

                        <div className="documents-table-wrapper">
                            <table className="documents-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: "50px" }}>
                                            <input type="checkbox" id="selectAllDocuments" onchange="toggleAllDocuments(this.checked)" />
                                        </th>
                                        <th style={{ width: "auto", minWidth: "300px" }}>문서명</th>
                                        <th style={{ width: "100px" }}>크기</th>
                                        <th style={{ width: "120px" }}>업로드일</th>
                                        <th style={{ width: "100px" }}>상태</th>
                                        <th style={{ width: "100px" }}>관리</th>
                                    </tr>
                                </thead>
                                <tbody id="documentsTableBody">
                                    {/* 문서 목록이 여기에 동적으로 로드됩니다 */}
                                    <LoadDocuments documents={documents} />
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                {/* FAQ 관리 탭 */}
                <section className={`tab-content ${contentTap === "faqTab" ? "active" : ""}`} id="faqTab">
                    <div className="upload-section">
                        <div className="upload-area" style={{ cursor: "default", borderStyle: "solid" }}>
                            <div className="upload-icon">
                                <i className="fas fa-question-circle"></i>
                            </div>
                            <div className="upload-text">
                                <h3>새로운 FAQ를 추가하세요</h3>
                                <p>고객이 자주 묻는 질문과 답변을 체계적으로 관리할 수 있습니다</p>
                            </div>
                            <div className="upload-buttons">
                                <button className="btn btn-primary" onclick="showAddFaqModal()">
                                    <i className="fas fa-plus"></i>
                                    FAQ 추가
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="documents-section">
                        <div className="section-header">
                            <div className="header-left">
                                <h3>FAQ 목록</h3>
                                <span className="document-count">5개 FAQ</span>
                            </div>
                            <div className="header-actions">
                                <div className="search-box">
                                    <i className="fas fa-search"></i>
                                    <input type="text" placeholder="FAQ 검색..." id="faqSearch" />
                                </div>
                            </div>
                        </div>




                        <div style={{ padding: "2rem" }}>
                            <div className="faq-list">
                                {faqs.map((faq) => (
                                    <div className="faq-item" key={faq.id}>
                                        <div
                                            className="faq-header"
                                            onClick={() => toggleFAQ(faq.id)}
                                            style={{ cursor: "pointer" }}
                                        >
                                            <div className="faq-question">
                                                <i
                                                    className="fas fa-question-circle"
                                                    style={{ color: "var(--primary-color)" }}
                                                ></i>
                                                <span>{faq.question}</span>
                                            </div>
                                            <div className="faq-actions">
                                                <div className="faq-stats">
                                                    <span>
                                                        <i className="fas fa-eye"></i> {faq.views}회
                                                    </span>
                                                    <span>
                                                        <i className="fas fa-thumbs-up"></i> {faq.satisfaction}
                                                    </span>
                                                </div>
                                                <button
                                                    className="action-btn-small"
                                                    title="편집"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        console.log("edit", faq.id);
                                                    }}
                                                >
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                                <button
                                                    className="action-btn-small delete"
                                                    title="삭제"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        console.log("delete", faq.id);
                                                    }}
                                                >
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                                <button
                                                    className="action-btn-small"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleFAQ(faq.id);
                                                    }}
                                                >
                                                    <i
                                                        className={`fas fa-chevron-${openId === faq.id ? "up" : "down"
                                                            }`}
                                                    ></i>
                                                </button>
                                            </div>
                                        </div>
                                        <div
                                            className={`faq-content ${openId === faq.id ? "show" : ""}`}
                                            id={`faq-content-${faq.id}`}
                                        >
                                            <div className="faq-answer">{faq.answer}</div>
                                            <div className="faq-meta">
                                                <span>
                                                    <strong>생성일:</strong> {faq.created}
                                                </span>
                                                <span>
                                                    <strong>만족도:</strong> {faq.satisfaction}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>


                    </div>
                </section>
            </main >
        </>
    )
}

function LoadDocuments({ documents }) {
    return (
        <>
            {documents.map(doc => (
                <tr>
                    <td><input type="checkbox" className="document-checkbox" /></td>
                    <td>
                        <div className="document-info">
                            <i className={`fas ${getFileIcon(doc.type)} document-icon`}></i>
                            <div className="document-details">
                                <span className="document-name">{doc.name}</span>
                                <span className="document-excerpt">{doc.excerpt}</span>
                            </div>
                        </div>
                    </td>
                    <td>{doc.size}</td>
                    <td>{doc.uploadDate}</td>
                    <td>
                        <span className={`status-badge ${doc.status}`}>
                            {doc.status === 'active' ? '사용중' : doc.status === 'processing' ? '처리중' : '오류'}
                        </span>
                    </td>
                    <td>
                        <div className="action-buttons">
                            <button className="action-btn-small" title="문서 보기" >
                                <i className="fas fa-eye"></i>
                            </button>
                            <button className="action-btn-small delete" title="삭제">
                                <i className="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            ))}

        </>
    )
}

function getFileIcon(type) {
    const iconMap = {
        'application/pdf': 'fa-file-pdf',
        'application/msword': 'fa-file-word',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'fa-file-word',
        'text/plain': 'fa-file-alt',
        'image/png': 'fa-file-image',
        'image/jpeg': 'fa-file-image',
        'image/jpg': 'fa-file-image',
        'image/gif': 'fa-file-image'
    };
    return iconMap[type] || 'fa-file';
}