import axios from "axios";
import { useState, useRef, useEffect } from 'react';
import { showToast } from '../utill/utill';
import * as XLSX from 'xlsx';

export default function Knowledge() {
    const [Categories, setCategories] = useState([]);
    const [uploadStatus, setuploadStatus] = useState(false);
    const [contentTap, setcontentTap] = useState("documentsTab");
    const [documents, setdocuments] = useState([]);
    const [openId, setOpenId] = useState(null);
    const [faqs, setfaqs] = useState([]);
    const fileInputRef = useRef(null);
    const [showAddFaqModal, setshowAddFaqModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [FAQquery, setFAQquery] = useState('');
    const [stores, setStores] = useState([]);
    const [storeSearchQuery, setStoreSearchQuery] = useState('');
    const [csvUploadStatus, setCsvUploadStatus] = useState(false);
    const csvFileInputRef = useRef(null);
    const [showAddStoreModal, setShowAddStoreModal] = useState(false);
    const [editStore, setEditStore] = useState(null);

    const getCategory = () => {
        // console.log("카테고리를 불러옵니다.");
        axios.get(`${process.env.REACT_APP_API_URL}/system/quick-categories`).then((res) => {
            console.log(res.data);
            setCategories(res.data);
        })
    }

    const fetch_FAQ = () => {
        axios.get(`${process.env.REACT_APP_API_URL}/faqs`, {
            params: {
                offset: 0,
                limit: 50,
            },
        }).then((res) => {
            setfaqs(res.data);
            console.log("📌 관리자 목록:", res.data);
        }).catch((err) => {
            if (err.response && err.response.status === 404) {
                alert("해당 setting을 찾을 수 없습니다.");
            } else {
                console.error("❌ 요청 실패:", err);
            }
        });
    }

    const fetch_Knowledge = () => {
        axios.get(`${process.env.REACT_APP_API_URL}/knowledge`, {
            params: {
                offset: 0,
                limit: 50,
            },
        }).then((res) => {
            setdocuments(res.data);
            console.log("📌 지식베이스 목록:", res.data);
        }).catch((err) => {
            if (err.response && err.response.status === 404) {
                alert("해당 setting을 찾을 수 없습니다.");
            } else {
                console.error("❌ 요청 실패:", err);
            }
        });
    }

    const fetch_Stores = () => {
        axios.get(`${process.env.REACT_APP_API_URL}/customer`, {
            params: {
                offset: 0,
                limit: 50,
            },
        }).then((res) => {
            setStores(res.data);
            console.log("📌 매장 목록:", res.data);
        }).catch((err) => {
            if (err.response && err.response.status === 404) {
                alert("매장 정보를 찾을 수 없습니다.");
            } else {
                console.error("❌ 매장 조회 실패:", err);
            }
        });
    }

    const handleCsvFileSelect = async (e) => {
        e.preventDefault();
        setCsvUploadStatus(true);
        const files = e.target.files || e.dataTransfer?.files;
        if (!files || files.length === 0) {
            console.warn("No files detected");
            setCsvUploadStatus(false);
            return;
        }

        const selectedFile = files[0];
        const ext = selectedFile.name.split('.').pop().toLowerCase();

        let uploadFile = selectedFile;
        if (ext === 'xlsx' || ext === 'xls') {
            try {
                const arrayBuffer = await selectedFile.arrayBuffer();
                const workbook = XLSX.read(arrayBuffer, { type: 'array' });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const csvString = XLSX.utils.sheet_to_csv(sheet);
                const blob = new Blob([csvString], { type: 'text/csv' });
                uploadFile = new File([blob], selectedFile.name.replace(/\.xlsx?$/i, '.csv'), { type: 'text/csv' });
            } catch (err) {
                console.error("Excel 변환 오류:", err);
                showToast('Excel 파일 변환에 실패했습니다.', 'error');
                setCsvUploadStatus(false);
                if (csvFileInputRef.current) csvFileInputRef.current.value = '';
                return;
            }
        }

        const formData = new FormData();
        formData.append("file", uploadFile);

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/customer/upload_csv`, {
                method: "POST",
                body: formData
            });
            const data = await response.json();
            console.log(data);
            fetch_Stores();
            showToast('파일이 업로드되었습니다.', 'success');
        } catch (err) {
            console.error("Upload error:", err);
            showToast('파일 업로드에 실패했습니다.', 'error');
        }
        setCsvUploadStatus(false);
        if (csvFileInputRef.current) csvFileInputRef.current.value = '';
    };

    const handleCsvDragOver = (event) => {
        event.preventDefault();
    };

    const handleCsvDrop = (event) => {
        event.preventDefault();
        handleCsvFileSelect(event);
    };

    useEffect(() => {
        getCategory();
        fetch_Knowledge();
        fetch_FAQ();
        fetch_Stores();
    }, []);

    const toggleFAQ = (id) => {
        setOpenId(openId === id ? null : id); // 이미 열려있으면 닫기
    };


    const handleFileSelect = async (e) => {
        e.preventDefault();
        setuploadStatus(true);
        const files = e.target.files || e.dataTransfer?.files;
        if (!files || files.length === 0) {
            console.warn("No files detected");
            setuploadStatus(false);
            return;
        }

        const selectedFile = files[0];
        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/knowledge/upload`, {
                method: "POST",
                body: formData
            });
            const data = await response.json();
            console.log(data);
            fetch_Knowledge();
        } catch (err) {
            console.error("Upload error:", err);
        }
        setuploadStatus(false);
    };

    const handleDragOver = (event) => {
        event.preventDefault();
    };

    const handleDrop = (event) => {
        event.preventDefault();
        handleFileSelect(event);
    };

    const filteredKnowledge = documents.filter((p) => {
        const matchesSearch = p.original_name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    const filteredStores = stores.filter((store) => {
        const name = store.business_name || '';
        const businessNumber = store.business_number || '';
        const query = storeSearchQuery.toLowerCase();
        return name.toLowerCase().includes(query) ||
            businessNumber.toLowerCase().includes(query);
    });

    const filteredFAQ = faqs.filter((faq) => {
        const matchesSearch = faq.question.toLowerCase().includes(FAQquery.toLowerCase());
        const categoryName = Categories.find(cat => cat.id === faq.quick_category_id)?.name || "카테고리 없음";
        const matchesCategory = categoryName.toLowerCase().includes(FAQquery.toLowerCase());

        return matchesSearch || matchesCategory;
    });


    const handleDeleteFAQ = async (faq) => {
        console.log(faq);
        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/faqs/${faq.id}`,
                {
                    method: "DELETE",
                }
            );
            fetch_FAQ();
            showToast('FAQ가 삭제되었습니다.', 'success');
        } catch (error) {
            console.log(error)
        }
    }

    const [FixIndex, setFixIndex] = useState(false);
    const handleFix = (faq) => {
        if (FixIndex === faq.id) {
            axios.patch(`${process.env.REACT_APP_API_URL}/faqs/${faq.id}`, {
                quick_category_id: faq.quick_category_id,
                answer: faq.answer
            }).then(res => {
                showToast('FAQ가 수정되었습니다.', 'success');
                setFixIndex(false);
                console.log(`FAQ ${faq.id} 카테고리 업데이트 성공`, res.data);
            }).catch(err => {
                console.error(`FAQ ${faq.id} 카테고리 업데이트 실패`, err);
            });
        } else {
            setFixIndex(faq.id);
        }
    }

    return (
        <>
            <div className={`modal ${showAddFaqModal ? "show" : ""}`} id="faqAddModal" style={{ display: `${showAddFaqModal ? "flex" : "none"}` }}>
                <FaqModal setshowAddFaqModal={setshowAddFaqModal} fetch_FAQ={fetch_FAQ} Categories={Categories} />
            </div>
            <div className={`modal ${showAddStoreModal ? "show" : ""}`} style={{ display: `${showAddStoreModal ? "flex" : "none"}` }}>
                <AddStoreModal setShowAddStoreModal={setShowAddStoreModal} fetch_Stores={fetch_Stores} />
            </div>
            <div className={`modal ${editStore ? "show" : ""}`} style={{ display: `${editStore ? "flex" : "none"}` }}>
                {editStore && <EditStoreModal store={editStore} setEditStore={setEditStore} fetch_Stores={fetch_Stores} />}
            </div>

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
                                <span className="stat-value" id="totalDocuments">{documents.length}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">FAQ</span>
                                <span className="stat-value">{faqs.length}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">매장</span>
                                <span className="stat-value">{stores.length}</span>
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
                        <button className={`tab-btn ${contentTap === "storeTab" ? "active" : ""}`} data-tab="store" onClick={() => setcontentTap("storeTab")}>
                            <i className="fas fa-store"></i>
                            매장 관리
                        </button>
                    </div>
                </section>

                {/* 문서 관리 탭 */}
                <section className={`tab-content ${contentTap === "documentsTab" ? "active" : ""}`} id="documentsTab">
                    {/* 업로드 영역 */}
                    <div className="upload-section">
                        <div className="upload-area" id="documentUploadArea"
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                        >
                            <div className={`upload-overlay ${uploadStatus ? "show" : ""}`} id="uploadOverlay">
                                <div className="spinner"></div>
                                <p style={{ color: " var(--primary-color)", fontWeight: "500" }}>파일을 처리하고 있습니다...</p>
                            </div>
                            <div style={{ display: `${uploadStatus ? "none" : ""}` }}>
                                <div className="upload-icon">
                                    <i className="fas fa-cloud-upload-alt"></i>
                                </div>
                                <div className="upload-text">
                                    <h3>파일을 드래그하거나 클릭해서 업로드</h3>
                                    <p>PDF, Word, 텍스트 파일 지원 • 업로드 즉시 챗봇에서 사용 가능</p>
                                </div>
                                <input type="file" id="documentFileInput" multiple accept=".pdf,.doc,.docx,.txt" style={{ display: "none" }} />
                                <div className="upload-buttons">
                                    <button className="btn btn-primary" onClick={() => fileInputRef.current?.click()}>
                                        <i className="fas fa-file-upload"></i>
                                        파일 선택
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        style={{ display: "none" }}
                                        onChange={handleFileSelect}
                                    />
                                </div>
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
                                    <input type="text" placeholder="문서 검색..." id="documentSearch"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <button className="btn btn-danger" >
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
                                            <input type="checkbox" id="selectAllDocuments" />
                                        </th>
                                        <th style={{ width: "auto", minWidth: "300px" }}>문서명</th>
                                        <th style={{ width: "100px" }}>크기</th>
                                        <th style={{ width: "120px" }}>업로드일</th>
                                        {/* <th style={{ width: "100px" }}>상태</th> */}
                                        <th style={{ width: "100px" }}>관리</th>
                                    </tr>
                                </thead>
                                <tbody id="documentsTableBody">
                                    {/* 문서 목록이 여기에 동적으로 로드됩니다 */}
                                    <LoadDocuments documents={filteredKnowledge} fetch_Knowledge={fetch_Knowledge} />
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
                                <button className="btn btn-primary" onClick={() => setshowAddFaqModal(true)}>
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
                                <span className="document-count">{filteredFAQ.length}개 FAQ</span>
                            </div>
                            <div className="header-actions">
                                <div className="search-box">
                                    <i className="fas fa-search"></i>
                                    <input type="text" placeholder="FAQ 검색..." id="faqSearch"
                                        vlaue={FAQquery}
                                        onChange={(e) => setFAQquery(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>




                        <div style={{ padding: "2rem" }}>
                            <div className="faq-list">
                                {filteredFAQ.map((faq) => (
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
                                                    <span>{Categories.find(cat => cat.id === faq.quick_category_id)?.name || "카테고리 없음"}</span>
                                                </div>
                                                <div className="faq-stats">
                                                    <span>
                                                        <i className="fas fa-eye"></i> {faq.views}회
                                                    </span>
                                                    {/* <span>
                                                        <i className="fas fa-thumbs-up"></i> {faq.satisfaction_rate}
                                                    </span> */}
                                                </div>
                                                {/* <button
                                                    className="action-btn-small"
                                                    title="편집"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        showToast('FAQ 편집 기능은 개발 중입니다.', 'info');
                                                    }}
                                                >
                                                    <i className="fas fa-edit"></i>
                                                </button> */}
                                                <button
                                                    className="action-btn-small delete"
                                                    title="삭제"
                                                    onClick={() => { handleDeleteFAQ(faq) }}
                                                >
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                                <button className="action-btn-small">
                                                    <i className={`fas fa-chevron-${openId === faq.id ? "up" : "down"}`}></i>
                                                </button>
                                            </div>
                                        </div>
                                        <div
                                            className={`faq-content ${openId === faq.id ? "show" : ""}`}
                                            id={`faq-content-${faq.id}`}
                                        >
                                            <div className="faq-answer">
                                                <textarea
                                                    style={{
                                                        display: `${FixIndex === faq.id ? "block" : "none"}`,
                                                        width: "100%",
                                                        padding: "0.75rem",
                                                        border: "1px solid var(--border-color)",
                                                        borderRadius: "var(--border-radius)",
                                                        fontSize: "0.875rem",
                                                        resize: "vertical",
                                                        fontFamily: "inherit",
                                                        minHeight: "120px",
                                                    }}
                                                    value={faq.answer}
                                                    onChange={(e) => {
                                                        const newValue = e.target.value;
                                                        setfaqs(prevFaqs =>
                                                            prevFaqs.map(item =>
                                                                item.id === faq.id ? { ...item, answer: newValue } : item
                                                            )
                                                        );
                                                    }}
                                                />
                                                <div
                                                    style={{ 
                                                        display: `${FixIndex === faq.id ? "none" : "block"}`,
                                                        whiteSpace: "pre-wrap",
                                                        wordWrap: "break-word"
                                                    }}
                                                    dangerouslySetInnerHTML={{ 
                                                        __html: (faq.answer || "")
                                                            .replace(/\n/g, "<br>")
                                                            .replace(/\r\n/g, "<br>")
                                                    }}
                                                />

                                            </div>

                                            <div className="faq-meta">
                                                <span>
                                                    <strong>생성일:</strong> {new Date(faq.created_at).toISOString().split('T')[0]}
                                                </span>
                                                <span>
                                                    <strong>만족도:</strong> {faq.satisfaction_rate}
                                                </span>
                                                <span>
                                                    <strong>카테고리:</strong> {Categories.find(cat => cat.id === faq.quick_category_id)?.name || "카테고리 없음"}
                                                </span>
                                                <select
                                                    value={faq.quick_category_id}
                                                    onClick={(e) => e.stopPropagation()}
                                                    onChange={(e) => {
                                                        const newCategoryId = Number(e.target.value); // 문자열 → 숫자
                                                        setfaqs(prevFaqs =>
                                                            prevFaqs.map(item =>
                                                                item.id === faq.id ? { ...item, quick_category_id: newCategoryId } : item
                                                            )
                                                        );
                                                    }}
                                                    style={{ display: `${FixIndex === faq.id ? "block" : "none"}` }}
                                                >
                                                    <option value="카테고리 없음">카테고리 없음</option>
                                                    {Categories.map(catetory => (
                                                        <option key={catetory.id} value={catetory.id}>{catetory.name}</option>
                                                    ))}
                                                </select>

                                                <button
                                                    className="action-btn-small"
                                                    onClick={() => handleFix(faq)}
                                                >
                                                    {FixIndex === faq.id ? "저장" : "수정"}
                                                </button>

                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>


                    </div>
                </section>

                {/* 매장 관리 탭 */}
                <section className={`tab-content ${contentTap === "storeTab" ? "active" : ""}`} id="storeTab">
                    <div className="upload-section">
                        <div className="upload-area" id="csvUploadArea"
                            onDragOver={handleCsvDragOver}
                            onDrop={handleCsvDrop}
                        >
                            <div className={`upload-overlay ${csvUploadStatus ? "show" : ""}`} id="csvUploadOverlay">
                                <div className="spinner"></div>
                                <p style={{ color: "var(--primary-color)", fontWeight: "500" }}>파일을 처리하고 있습니다...</p>
                            </div>
                            <div style={{ display: `${csvUploadStatus ? "none" : ""}` }}>
                                <div className="upload-icon">
                                    <i className="fas fa-file-excel"></i>
                                </div>
                                <div className="upload-text">
                                    <h3>CSV/Excel 파일을 드래그하거나 클릭해서 업로드</h3>
                                    <p>CSV 또는 Excel 파일로 매장 정보를 일괄 등록할 수 있습니다</p>
                                </div>
                                <div className="upload-buttons">
                                    <button className="btn btn-primary" onClick={() => csvFileInputRef.current?.click()}>
                                        <i className="fas fa-file-upload"></i>
                                        파일 선택
                                    </button>
                                    <input
                                        type="file"
                                        ref={csvFileInputRef}
                                        style={{ display: "none" }}
                                        accept=".csv,.xlsx,.xls"
                                        onChange={handleCsvFileSelect}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="documents-section">
                        <div className="section-header">
                            <div className="header-left">
                                <h3>매장 목록</h3>
                                <span className="document-count">{filteredStores.length}개 매장</span>
                            </div>
                            <div className="header-actions">
                                <div className="search-box">
                                    <i className="fas fa-search"></i>
                                    <input type="text" placeholder="매장 검색..." id="storeSearch"
                                        value={storeSearchQuery}
                                        onChange={(e) => setStoreSearchQuery(e.target.value)}
                                    />
                                </div>
                                <button className="btn btn-primary" onClick={() => setShowAddStoreModal(true)}>
                                    <i className="fas fa-plus"></i> 매장 추가
                                </button>
                            </div>
                        </div>

                        <div className="documents-table-wrapper">
                            <table className="documents-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: "50px" }}>
                                            <input type="checkbox" />
                                        </th>
                                        <th style={{ width: "auto", minWidth: "150px" }}>상호명</th>
                                        <th style={{ width: "150px" }}>사업자번호</th>
                                        <th style={{ width: "130px" }}>전화번호</th>
                                        <th style={{ width: "120px" }}>등록일</th>
                                        <th style={{ width: "100px" }}>관리</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <LoadStores stores={filteredStores} fetch_Stores={fetch_Stores} setEditStore={setEditStore} />
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            </main >
        </>
    )
}

function LoadDocuments({ documents, fetch_Knowledge }) {

    const handleDelete = async (doc) => {
        if (!window.confirm(doc.id + "." + doc.original_name + " 정말 삭제하시겠습니까?")) return;
        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/knowledge/${doc.id}`,
                {
                    method: "DELETE",
                }
            );
            fetch_Knowledge();
            showToast('문서가 삭제되었습니다.', 'success')
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <>
            {documents.map(doc => (
                <tr key={doc.id}>
                    <td><input type="checkbox" className="document-checkbox" /></td>
                    <td>
                        <div className="document-info">
                            <i className={`fas ${getFileIcon(doc.type)} document-icon`}></i>
                            <div className="document-details" style={{ maxWidth: "900px" }}>
                                <span className="document-name">{doc.original_name}</span>
                                <span className="document-excerpt">{doc.preview}</span>
                            </div>
                        </div>
                    </td>
                    <td>{formatBytes(doc.size)}</td>
                    <td>{new Date(doc.created_at).toISOString().split("T")[0]}</td>

                    {/* <td>
                        <span className={`status-badge ${doc.status}`}>
                            {doc.status === 'active' ? '사용중' : doc.status === 'processing' ? '처리중' : '오류'}
                        </span>
                    </td> */}
                    <td>
                        <div className="action-buttons">
                            {/* <button
                                className="action-btn-small" title="문서 보기" onClick={() => showToast('문서 미리보기 기능은 개발 중입니다.', 'info')}
                            >
                                <i className="fas fa-eye"></i>
                            </button> */}

                            <button
                                className="action-btn-small delete" title="삭제" onClick={() => handleDelete(doc)}
                            >
                                <i className="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr >
            ))
            }

        </>
    )
}

function LoadStores({ stores, fetch_Stores, setEditStore }) {
    const handleDeleteStore = async (store) => {
        if (!window.confirm(`"${store.business_name}" 매장을 정말 삭제하시겠습니까?`)) return;
        try {
            await fetch(
                `${process.env.REACT_APP_API_URL}/customer/${store.id}`,
                { method: "DELETE" }
            );
            fetch_Stores();
            showToast('매장이 삭제되었습니다.', 'success');
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <>
            {stores.map(store => (
                <tr key={store.id}>
                    <td><input type="checkbox" className="document-checkbox" /></td>
                    <td>
                        <div className="document-info">
                            <i className="fas fa-store document-icon"></i>
                            <div className="document-details">
                                <span className="document-name">{store.business_name}</span>
                            </div>
                        </div>
                    </td>
                    <td>{formatBusinessNumber(store.business_number)}</td>
                    <td>{store.phone || '-'}</td>
                    <td>{store.created_at ? new Date(store.created_at).toISOString().split("T")[0] : '-'}</td>
                    <td>
                        <div className="action-buttons">
                            <button
                                className="action-btn-small" title="수정"
                                onClick={() => setEditStore(store)}
                            >
                                <i className="fas fa-pen"></i>
                            </button>
                            <button
                                className="action-btn-small delete" title="삭제"
                                onClick={() => handleDeleteStore(store)}
                            >
                                <i className="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            ))}
        </>
    )
}

function formatBusinessNumber(num) {
    if (!num) return '-';
    const digits = num.replace(/[^0-9]/g, '');
    if (digits.length === 10) {
        return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
    }
    return num;
}

function formatBytes(bytes) {
    if (bytes >= 1024 * 1024 * 1024) return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
    if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    if (bytes >= 1024) return (bytes / 1024).toFixed(2) + " KB";
    return bytes + " B";
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

function FaqModal({ setshowAddFaqModal, fetch_FAQ, Categories }) {


    const [newFAQ, setnewFAQ] = useState({
        question: "",
        quick_category_id: "",
        answer: "",
    });

    const createFAQ = () => {
        console.log(newFAQ);

        if (!newFAQ.quick_category_id) {
            alert("카테고리 선택은 필수입니다!");
            return;
        }

        axios.post(`${process.env.REACT_APP_API_URL}/faqs`, {
            ...newFAQ,
            satisfaction_rate: 100,
        }).then((res) => {
            console.log("생성된 FAQ:", res.data);
            setshowAddFaqModal(false);
            fetch_FAQ();
            showToast("저장 완료", "success");
            setnewFAQ({
                question: "",
                quick_category_id: "",
                answer: "",
            });

        }).catch((err) => {
            console.error(err);
        });
    }

    return (
        <>
            <div className="modal-backdrop" onClick={() => setshowAddFaqModal(false)}></div>
            <div className="modal-container" style={{ maxWidth: "700px" }}>
                <div className="modal-header">
                    <h3 className="modal-title">새 FAQ 추가</h3>
                    <button className="modal-close" onClick={() => setshowAddFaqModal(false)}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                <div className="modal-body">
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                        <div>
                            <label
                                style={{
                                    display: "block",
                                    fontWeight: 600,
                                    marginBottom: "0.5rem",
                                    color: "var(--text-primary)",
                                }}
                            >
                                질문 <span style={{ color: "var(--danger-color)" }}>*</span>
                            </label>
                            <input
                                type="text"
                                id="faqQuestion"
                                placeholder="자주 묻는 질문을 입력하세요..."
                                style={{
                                    width: "100%",
                                    padding: "0.75rem",
                                    border: "1px solid var(--border-color)",
                                    borderRadius: "var(--border-radius)",
                                    fontSize: "1rem",
                                }}
                                value={newFAQ.question}
                                onChange={(e) =>
                                    setnewFAQ((prev) => ({ ...prev, question: e.target.value }))
                                }
                            />
                        </div>


                        <div>
                            <label
                                style={{
                                    display: "block",
                                    fontWeight: 600,
                                    marginBottom: "0.5rem",
                                    color: "var(--text-primary)",
                                }}
                            >
                                카테고리 <span style={{ color: "var(--danger-color)" }}>*</span>
                            </label>

                            <select
                                style={{
                                    width: "100%",
                                    padding: "0.75rem",
                                    border: "1px solid var(--border-color)",
                                    borderRadius: "var(--border-radius)",
                                    fontSize: "1rem",
                                }}
                                value={newFAQ.quick_category_id}
                                onChange={(e) =>
                                    setnewFAQ((prev) => ({ ...prev, quick_category_id: e.target.value }))
                                }
                            >
                                <option value="">카테고리를 선택해주세요</option>
                                {Categories.map(category => (
                                    <option key={category.id} value={category.id}>{category.name}</option>
                                ))}


                            </select>

                        </div>

                        <div>
                            <label
                                style={{
                                    display: "block",
                                    fontWeight: 600,
                                    marginBottom: "0.5rem",
                                    color: "var(--text-primary)",
                                }}
                            >
                                답변 <span style={{ color: "var(--danger-color)" }}>*</span>
                            </label>
                            <textarea
                                id="faqAnswer"
                                placeholder="상세한 답변을 입력하세요..."
                                rows={6}
                                style={{
                                    width: "100%",
                                    padding: "0.75rem",
                                    border: "1px solid var(--border-color)",
                                    borderRadius: "var(--border-radius)",
                                    fontSize: "1rem",
                                    resize: "vertical",
                                    fontFamily: "inherit",
                                }}
                                value={newFAQ.answer}
                                onChange={(e) =>
                                    setnewFAQ((prev) => ({ ...prev, answer: e.target.value }))
                                }
                            />
                        </div>

                        <div
                            style={{
                                background: "var(--secondary-color)",
                                padding: "1rem",
                                borderRadius: "var(--border-radius)",
                                borderLeft: "4px solid var(--primary-color)",
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                                <i className="fas fa-lightbulb" style={{ color: "var(--primary-color)" }}></i>
                                <strong style={{ color: "var(--text-primary)" }}>작성 팁</strong>
                            </div>
                            <ul
                                style={{
                                    margin: 0,
                                    paddingLeft: "1.2rem",
                                    color: "var(--text-secondary)",
                                    fontSize: "0.875rem",
                                    lineHeight: 1.4,
                                }}
                            >
                                <li>구체적이고 명확한 질문으로 작성해주세요</li>
                                <li>답변은 단계별로 나누어 설명하면 좋습니다</li>
                                <li>필요시 연락처 정보를 포함해주세요</li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={() => setshowAddFaqModal(false)}>
                        취소
                    </button>
                    <button className="btn btn-primary"
                        onClick={() => createFAQ()}
                    >
                        <i className="fas fa-plus"></i> FAQ 추가
                    </button>
                </div>
            </div>
        </>
    );
}

function AddStoreModal({ setShowAddStoreModal, fetch_Stores }) {
    const [formData, setFormData] = useState({
        business_name: "",
        business_number: "",
        phone: "",
    });

    const handleSubmit = () => {
        if (!formData.business_name.trim()) {
            alert("상호명은 필수입니다!");
            return;
        }
        axios.post(`${process.env.REACT_APP_API_URL}/customer/`, formData)
            .then(() => {
                setShowAddStoreModal(false);
                fetch_Stores();
                showToast("매장이 등록되었습니다.", "success");
            })
            .catch((err) => {
                console.error(err);
                showToast("매장 등록에 실패했습니다.", "error");
            });
    };

    const inputStyle = {
        width: "100%",
        padding: "0.75rem",
        border: "1px solid var(--border-color)",
        borderRadius: "var(--border-radius)",
        fontSize: "1rem",
    };

    const labelStyle = {
        display: "block",
        fontWeight: 600,
        marginBottom: "0.5rem",
        color: "var(--text-primary)",
    };

    return (
        <>
            <div className="modal-backdrop" onClick={() => setShowAddStoreModal(false)}></div>
            <div className="modal-container" style={{ maxWidth: "500px" }}>
                <div className="modal-header">
                    <h3 className="modal-title">매장 등록</h3>
                    <button className="modal-close" onClick={() => setShowAddStoreModal(false)}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                <div className="modal-body">
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                        <div>
                            <label style={labelStyle}>
                                상호명 <span style={{ color: "var(--danger-color)" }}>*</span>
                            </label>
                            <input type="text" placeholder="상호명을 입력하세요" style={inputStyle}
                                value={formData.business_name}
                                onChange={(e) => setFormData(prev => ({ ...prev, business_name: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>사업자번호</label>
                            <input type="text" placeholder="000-00-00000" style={inputStyle}
                                value={formData.business_number}
                                onChange={(e) => setFormData(prev => ({ ...prev, business_number: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>전화번호</label>
                            <input type="text" placeholder="전화번호를 입력하세요" style={inputStyle}
                                value={formData.phone}
                                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                            />
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={() => setShowAddStoreModal(false)}>취소</button>
                    <button className="btn btn-primary" onClick={handleSubmit}>
                        <i className="fas fa-plus"></i> 등록
                    </button>
                </div>
            </div>
        </>
    );
}

function EditStoreModal({ store, setEditStore, fetch_Stores }) {
    const [formData, setFormData] = useState({
        business_name: store.business_name || "",
        business_number: store.business_number || "",
        phone: store.phone || "",
    });

    const handleSubmit = () => {
        if (!formData.business_name.trim()) {
            alert("상호명은 필수입니다!");
            return;
        }
        axios.patch(`${process.env.REACT_APP_API_URL}/customer/${store.id}`, formData)
            .then(() => {
                setEditStore(null);
                fetch_Stores();
                showToast("매장 정보가 수정되었습니다.", "success");
            })
            .catch((err) => {
                console.error(err);
                showToast("매장 수정에 실패했습니다.", "error");
            });
    };

    const inputStyle = {
        width: "100%",
        padding: "0.75rem",
        border: "1px solid var(--border-color)",
        borderRadius: "var(--border-radius)",
        fontSize: "1rem",
    };

    const labelStyle = {
        display: "block",
        fontWeight: 600,
        marginBottom: "0.5rem",
        color: "var(--text-primary)",
    };

    return (
        <>
            <div className="modal-backdrop" onClick={() => setEditStore(null)}></div>
            <div className="modal-container" style={{ maxWidth: "500px" }}>
                <div className="modal-header">
                    <h3 className="modal-title">매장 수정</h3>
                    <button className="modal-close" onClick={() => setEditStore(null)}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                <div className="modal-body">
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                        <div>
                            <label style={labelStyle}>
                                상호명 <span style={{ color: "var(--danger-color)" }}>*</span>
                            </label>
                            <input type="text" placeholder="상호명을 입력하세요" style={inputStyle}
                                value={formData.business_name}
                                onChange={(e) => setFormData(prev => ({ ...prev, business_name: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>사업자번호</label>
                            <input type="text" placeholder="000-00-00000" style={inputStyle}
                                value={formData.business_number}
                                onChange={(e) => setFormData(prev => ({ ...prev, business_number: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>전화번호</label>
                            <input type="text" placeholder="전화번호를 입력하세요" style={inputStyle}
                                value={formData.phone}
                                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                            />
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={() => setEditStore(null)}>취소</button>
                    <button className="btn btn-primary" onClick={handleSubmit}>
                        <i className="fas fa-save"></i> 저장
                    </button>
                </div>
            </div>
        </>
    );
}
