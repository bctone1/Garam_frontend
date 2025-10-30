import axios from "axios";
import React, { useEffect, useState } from "react";
import { Chart as ChartJS, LineElement, PointElement, CategoryScale, LinearScale, Title, Tooltip, Legend, Filler } from "chart.js";
import { Line, Doughnut, Bar } from "react-chartjs-2";

// Chart.js 요소 등록
ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Title, Tooltip, Legend, Filler);


export default function Chart() {

    const [faqs, setfaqs] = useState([]);
    const [ConversationChart, setConversationChart] = useState(null);
    const [ConversationchartOptions, setConversationChartOptions] = useState({});
    const [FeedbackChart, setFeedbackChart] = useState(null);
    const [FeedbackchartOptions, setFeedbackChartOptions] = useState({});
    const [ResponseTimeChart, setResponseTimeChart] = useState(null);
    const [ResponseTimeOptions, setResponseTimeOptions] = useState({});
    const [SatisfactionChart, setSatisfactionChart] = useState(null);
    const [SatisfactionOptions, setSatisfactionOptions] = useState({});
    const [HourlyChart, setHourlyChart] = useState(null);
    const [HourlyOptions, setHourlyOptions] = useState({});
    const [RequestTrendChart, setRequestTrendChart] = useState(null);
    const [RequestTrendChartOptions, setRequestTrendChartOptions] = useState({});
    const [CostTrendChart, setCostTrendChart] = useState(null);
    const [CostTrendChartOptions, setCostTrendChartOptions] = useState({});
    const [period, setPeriod] = useState(7);
    const [APICost, setAPICost] = useState([]);
    const [TotalCost, setTotalCost] = useState({});

    useEffect(() => {
        fetchFAQs();
        fetchConversationChart();
        fetchFeedbackChart();
        fetchResponseTimeChart();
        fetchSatisfactionChart();
        fetchHourlyChart();
        fetchRequestTrendChart();
        fetchCostTrendChart();
    }, []);

    useEffect(() => {
        fetchCost(period);
    }, [period]);

    const fetchCost = async (days) => {
        try {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(endDate.getDate() - (days - 1));

            const formatDate = (date) => date.toISOString().split('T')[0];

            const res = await axios.get(`${process.env.REACT_APP_API_URL}/api-cost/rows?start=${formatDate(startDate)}&end=${formatDate(endDate)}`);
            const data = res.data;
            console.log(data);

            const labels = [...new Set(data.map(item => item.d))].sort();

            // 2️⃣ 날짜별 product 합계 계산
            const chartgrouped = labels.map(date => {
                const dailyData = data.filter(item => item.d === date);
                return {
                    date,
                    embedding: dailyData.find(i => i.product === 'embedding')?.embedding_tokens || 0,
                    llm: dailyData.find(i => i.product === 'llm')?.llm_tokens || 0,
                    stt: dailyData.find(i => i.product === 'stt')?.audio_seconds || 0,
                };
            });

            // 3️⃣ Chart.js 데이터 포맷으로 변환
            setRequestTrendChart({
                labels: chartgrouped.map((g) => g.date.slice(5).replace("-", "/")), // '10/27' 형식
                datasets: [
                    {
                        label: 'Embedding',
                        data: chartgrouped.map(g => g.embedding),
                        backgroundColor: 'rgba(139, 92, 246, 0.8)',
                        borderRadius: 4
                    },
                    {
                        label: 'LLM',
                        data: chartgrouped.map(g => g.llm),
                        backgroundColor: 'rgba(23, 162, 184, 0.8)',
                        borderRadius: 4
                    },
                    {
                        label: 'STT',
                        data: chartgrouped.map(g => g.stt),
                        backgroundColor: 'rgba(255, 193, 7, 0.8)',
                        borderRadius: 4
                    }
                ]
            });


            const apicostgrouped = labels.map((date) => {
                const dailyData = data.filter((item) => item.d === date);
                return {
                    date,
                    embedding: dailyData
                        .filter((i) => i.product === "embedding")
                        .reduce((sum, i) => sum + Number(i.cost_usd || 0), 0),
                    llm: dailyData
                        .filter((i) => i.product === "llm")
                        .reduce((sum, i) => sum + Number(i.cost_usd || 0), 0),
                    stt: dailyData
                        .filter((i) => i.product === "stt")
                        .reduce((sum, i) => sum + Number(i.cost_usd || 0), 0),
                };
            });
            setCostTrendChart({
                labels: apicostgrouped.map((g) => g.date.slice(5).replace("-", "/")), // '10/27' 형식
                datasets: [
                    {
                        label: "임베딩 비용 ($)",
                        data: apicostgrouped.map((g) => g.embedding.toFixed(2)),
                        borderColor: "#8b5cf6",
                        backgroundColor: "rgba(139, 92, 246, 0.1)",
                        fill: true,
                        tension: 0.4,
                    },
                    {
                        label: "LLM 비용 ($)",
                        data: apicostgrouped.map((g) => g.llm.toFixed(2)),
                        borderColor: "#17a2b8",
                        backgroundColor: "rgba(23, 162, 184, 0.1)",
                        fill: true,
                        tension: 0.4,
                    },
                    {
                        label: "음성 비용 ($)",
                        data: apicostgrouped.map((g) => g.stt.toFixed(2)),
                        borderColor: "#ffc107",
                        backgroundColor: "rgba(255, 193, 7, 0.1)",
                        fill: true,
                        tension: 0.4,
                    },
                ],
            });











            // ✅ 같은 product끼리 합산
            const grouped = data.reduce((acc, item) => {
                const { product, llm_tokens, embedding_tokens, cost_usd, audio_seconds } = item;
                if (!acc[product]) {
                    acc[product] = {
                        product,
                        total_llm_tokens: 0,
                        total_embedding_tokens: 0,
                        total_cost_usd: 0,
                        total_audio_seconds: 0
                    };
                }
                acc[product].total_llm_tokens += llm_tokens;
                acc[product].total_embedding_tokens += embedding_tokens;
                acc[product].total_cost_usd += Number(cost_usd);
                acc[product].total_audio_seconds += audio_seconds;
                return acc;
            }, {});
            // 객체를 배열로 변환
            const summary = Object.values(grouped);
            const totalSummary = summary.reduce((acc, item) => {
                acc.total_llm_tokens += item.total_llm_tokens;
                acc.total_embedding_tokens += item.total_embedding_tokens;
                acc.total_cost_usd += item.total_cost_usd;
                acc.total_audio_seconds += item.total_audio_seconds;
                return acc;
            }, {
                product: "TOTAL",
                total_llm_tokens: 0,
                total_embedding_tokens: 0,
                total_cost_usd: 0,
                total_audio_seconds: 0
            });
            // ✅ summary 마지막에 추가
            summary.push(totalSummary);
            // console.log("📊 Product별 합계:", summary);
            setAPICost(summary);
        } catch (error) {
            console.log(error);
        }
    };


    const fetchFAQs = () => {
        axios.get(`${process.env.REACT_APP_API_URL}/faqs`, {
            params: {
                offset: 0,
                limit: 5,
                order_by: "views"
            },
        }).then((res) => {
            setfaqs(res.data);
            // console.log(res.data);
        }).catch((err) => {
            console.log(err);
        });
    }

    // 일별 대화 트렌드
    const fetchConversationChart = () => {
        setConversationChart({
            labels: ['월', '화', '수', '목', '금', '토', '일'],
            datasets: [
                {
                    label: '대화 수',
                    data: [120, 145, 130, 160, 185, 120, 90],
                    borderColor: '#1e60e1',
                    backgroundColor: 'rgba(30, 96, 225, 0.1)',
                    fill: true,
                    tension: 0.4,
                },
                {
                    label: '해결된 문의',
                    data: [110, 135, 125, 155, 175, 115, 85],
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    fill: false,
                    tension: 0.4,
                },
            ],
        });

        setConversationChartOptions({
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top' },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0, 0, 0, 0.1)' },
                },
                x: {
                    grid: { display: false },
                },
            },
        });
    }

    // 사용자 피드백 분포
    const fetchFeedbackChart = () => {
        setFeedbackChart({
            labels: ['도움됨', '도움안됨', '무응답'],
            datasets: [{
                data: [456, 52, 120],
                backgroundColor: [
                    '#28a745',
                    '#dc3545',
                    '#6c757d'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        });

        setFeedbackChartOptions({
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                }
            }
        });
    }

    // 응답 시간 분석
    const fetchResponseTimeChart = () => {
        setResponseTimeChart({
            labels: ['1초 이하', '1-2초', '2-3초', '3-5초', '5초 이상'],
            datasets: [{
                label: '응답 수',
                data: [650, 380, 120, 45, 15],
                backgroundColor: [
                    '#22c55e',
                    '#3b82f6',
                    '#f59e0b',
                    '#ef4444',
                    '#dc2626'
                ],
                borderRadius: 4
            }]
        });

        setResponseTimeOptions({
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '응답 수'
                    }
                }
            }
        });
    }


    // 사용자 만족도 트렌드
    const fetchSatisfactionChart = () => {
        setSatisfactionChart({
            labels: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
            datasets: [{
                label: '만족도 (%)',
                data: [85, 87, 84, 89, 91, 88, 90, 92, 89, 91, 93, 88],
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true,
                tension: 0.4
            }]
        });

        setSatisfactionOptions({
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    min: 80,
                    max: 95,
                    title: {
                        display: true,
                        text: '만족도 (%)'
                    }
                }
            }
        });
    }


    // 시간대별 대화량
    const fetchHourlyChart = () => {
        setHourlyChart({
            labels: ['0시', '1시', '2시', '3시', '4시', '5시', '6시', '7시', '8시', '9시', '10시', '11시', '12시', '13시', '14시', '15시', '16시', '17시', '18시', '19시', '20시', '21시', '22시', '23시'],
            datasets: [{
                label: '대화량',
                data: [5, 3, 2, 1, 2, 8, 12, 18, 25, 35, 45, 38, 42, 52, 48, 45, 42, 35, 28, 22, 18, 15, 12, 8],
                backgroundColor: 'rgba(30, 96, 225, 0.8)',
                borderRadius: 4
            }]
        });

        setHourlyOptions({
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '대화 수'
                    }
                }
            }
        });
    }

    //일별 요청 수 추이 
    const fetchRequestTrendChart = () => {
        setRequestTrendChartOptions({
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function (context) {
                            const label = context.dataset.label || '';
                            const value = context.parsed.y;

                            if (label.includes('STT')) {
                                return `${label}: ${value}초`;
                            } else {
                                return `${label}: ${value}토큰`;
                            }
                        }
                    }
                }
            },
            scales: {
                x: {
                    stacked: false
                },
                y: {
                    beginAtZero: true,
                    stacked: false,
                    ticks: {
                        callback: function (value) {
                            return value + '건';
                        }
                    }
                }
            }
        });
    }

    //일별 API비용 추이
    const fetchCostTrendChart = () => {
        // setCostTrendChart({
        //     labels: ['10/09', '10/10', '10/11', '10/12', '10/13', '10/14', '10/15'],
        //     datasets: [{
        //         label: '임베딩 비용 ($)',
        //         data: [3.42, 3.86, 4.15, 4.68, 3.58, 3.72, 4.15],
        //         borderColor: '#8b5cf6',
        //         backgroundColor: 'rgba(139, 92, 246, 0.1)',
        //         fill: true,
        //         tension: 0.4
        //     }, {
        //         label: 'LLM 비용 ($)',
        //         data: [8.17, 8.95, 10.90, 11.44, 9.21, 10.02, 10.45],
        //         borderColor: '#17a2b8',
        //         backgroundColor: 'rgba(23, 162, 184, 0.1)',
        //         fill: true,
        //         tension: 0.4
        //     }, {
        //         label: '음성 비용 ($)',
        //         data: [1.79, 1.79, 2.34, 2.65, 2.04, 2.21, 2.38],
        //         borderColor: '#ffc107',
        //         backgroundColor: 'rgba(255, 193, 7, 0.1)',
        //         fill: true,
        //         tension: 0.4
        //     }]
        // });

        setCostTrendChartOptions({
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function (context) {
                            return context.dataset.label + ': $' + context.parsed.y.toFixed(2);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function (value) {
                            return '$' + value.toFixed(2);
                        }
                    }
                }
            }
        });
    }


    return (
        <>
            <main className="chart-main-content">

                <header className="top-header">
                    <div className="header-left">
                        <div className="page-title">
                            <h1>분석 및 보고서</h1>
                            <p className="page-subtitle">챗봇 성능과 사용자 인사이트를 분석하세요</p>
                        </div>
                    </div>
                    <div className="header-right">
                        <div className="date-selector">
                            <select className="date-select" id="dateRange"
                                onChange={(e) => setPeriod(Number(e.target.value))}
                                value={period}
                            >
                                <option value={1}>오늘</option>
                                <option value={7}>지난 7일</option>
                                <option value={30}>지난 30일</option>
                                <option value={90}>지난 90일</option>
                            </select>
                        </div>
                    </div>
                </header>
                <div className="chart-main-container">


                    {/* AI API 사용량 및 비용 섹션  */}
                    <div className="section" style={{ marginBottom: "2rem" }}>
                        <h2 className="section-title">
                            <i className="fas fa-brain"></i>
                            AI API 사용량 및 비용
                        </h2>

                        {/* API 요약 카드 (요청수 / 비용) */}
                        <div className="metrics-row">
                            <div className="metric-card">
                                <div className="metric-value purple">
                                    <div className="metric-value info">
                                        {APICost?.[0]
                                            ? `${APICost[0].total_embedding_tokens.toLocaleString()} 토큰 / $${APICost[0].total_cost_usd?.toFixed(2)}`
                                            : "로딩 중..."}
                                    </div>
                                </div>
                                <div className="chart-metric-label">임베딩</div>
                                <small style={{ color: "#6c757d", fontSize: "0.75rem" }}>지식베이스 벡터화</small>
                            </div>

                            <div className="metric-card">
                                <div className="metric-value info">
                                    {APICost?.[1]
                                        ? `${APICost[1].total_llm_tokens.toLocaleString()} 토큰 / $${APICost[1].total_cost_usd?.toFixed(2)}`
                                        : "로딩 중..."}
                                </div>
                                <div className="chart-metric-label">LLM API</div>
                                <small style={{ color: "#6c757d", fontSize: "0.75rem" }}>EXAONE 4.0 (32B)</small>
                            </div>

                            <div className="metric-card">
                                <div className="metric-value warning">
                                    {APICost?.[2]
                                        ? `${APICost[2].total_audio_seconds.toLocaleString()} 초 / $${APICost[2].total_cost_usd?.toFixed(2)}`
                                        : "로딩 중..."}
                                </div>
                                <div className="chart-metric-label">음성 API</div>
                                <small style={{ color: "#6c757d", fontSize: "0.75rem" }}>NAVER Clova Speech STT</small>
                            </div>

                            <div className="metric-card">
                                <div className="metric-value success">

                                    {APICost?.[2] ? `$ ${APICost[3].total_cost_usd?.toFixed(2)}` : "로딩 중..."}
                                </div>
                                <div className="chart-metric-label">총 API 사용량</div>
                                {/* <small style={{ color: "#6c757d", fontSize: "0.75rem" }}>이번 달 누적</small> */}
                            </div>
                        </div>

                        {/* 일별 요청 수 추이 차트 */}
                        <div className="chart-card" style={{ marginBottom: "1.5rem" }}>
                            <div className="chart-header">
                                <h3 className="chart-title">일별 요청 수 추이</h3>
                            </div>
                            <div className="chart-container">
                                <div id="apiRequestTrendChart" style={{ height: "270px" }}>
                                    {RequestTrendChart ? <Bar data={RequestTrendChart} options={RequestTrendChartOptions} /> : <p>Loading...</p>}
                                </div>
                            </div>
                        </div>

                        {/* 일별 API 비용 추이 차트 */}
                        <div className="chart-card" style={{ marginBottom: "1.5rem" }}>
                            <div className="chart-header">
                                <h3 className="chart-title">일별 API 비용 추이</h3>
                            </div>
                            <div className="chart-container">
                                <div id="apiCostTrendChart" style={{ height: "270px" }}>
                                    {CostTrendChart ? <Line data={CostTrendChart} options={CostTrendChartOptions} /> : <p>Loading...</p>}
                                </div>
                            </div>
                        </div>

                        {/* 상세 비용 내역 테이블 */}
                        <div className="questions-card" style={{ marginBottom: "1.5rem" }}>
                            <div className="chart-header">
                                <h3 className="chart-title">날짜별 API 사용 내역 (X)</h3>
                            </div>
                            <div className="satisfaction-content">
                                <table className="satisfaction-table">
                                    <thead>
                                        <tr>
                                            <th>날짜</th>
                                            <th>임베딩 요청</th>
                                            <th>임베딩 비용</th>
                                            <th>LLM 요청</th>
                                            <th>LLM 비용</th>
                                            <th>음성 요청</th>
                                            <th>음성 비용</th>
                                            <th>총 비용</th>
                                        </tr>
                                    </thead>
                                    <tbody id="apiUsageTableBody">
                                        <tr>
                                            <td>2025-10-29</td>
                                            <td>212건</td>
                                            <td>$3.98</td>
                                            <td>146건</td>
                                            <td>$10.04</td>
                                            <td>38건</td>
                                            <td>$2.09</td>
                                            <td><strong>$16.11</strong></td>
                                        </tr>

                                        <tr>
                                            <td>2025-10-28</td>
                                            <td>245건</td>
                                            <td>$3.15</td>
                                            <td>122건</td>
                                            <td>$8.93</td>
                                            <td>45건</td>
                                            <td>$2.21</td>
                                            <td><strong>$14.29</strong></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* 페이지네이션 */}
                            <div className="pagination-container">
                                <div className="pagination-info" id="apiUsagePaginationInfo">
                                    1-7 / 총 7건
                                </div>
                                <div className="pagination-controls">
                                    <button className="pagination-btn" id="apiUsagePrevBtn" >
                                        <i className="fas fa-chevron-left"></i> 이전
                                    </button>
                                    <div className="page-numbers" id="apiUsagePageNumbers">
                                        {/* JavaScript로 동적 생성 */}
                                    </div>
                                    <button className="pagination-btn" id="apiUsageNextBtn" >
                                        다음 <i className="fas fa-chevron-right"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* API 비용 정보 안내 */}
                        <div className="info-box">
                            <h3>
                                <i className="fas fa-info-circle"></i>
                                API 비용 정보
                            </h3>
                            <ul>
                                <li>
                                    <i className="fas fa-check" style={{ color: "#28a745", marginRight: "0.5rem" }}></i>
                                    <strong>임베딩 비용:</strong> 지식베이스에 파일 등록 시 문서를 벡터화하는 과정에서 발생 (1회성)
                                </li>
                                <li>
                                    <i className="fas fa-check" style={{ color: "#28a745", marginRight: "0.5rem" }}></i>
                                    <strong>LLM API 비용:</strong> 챗봇이 검색 결과를 기반으로 답변을 생성할 때 발생 (EXAONE 4.0 32B 기준)
                                </li>
                                <li>
                                    <i className="fas fa-check" style={{ color: "#28a745", marginRight: "0.5rem" }}></i>
                                    <strong>음성 API 비용:</strong> 음성 입력을 텍스트로 변환하는 비용 (네이버 클로바 STT 기준, 분당 약 $0.047)
                                </li>
                            </ul>
                        </div>
                    </div>
                    {/* 상단 성능 지표 카드들  */}
                    <div className="section" style={{ marginBottom: "2rem" }}>
                        <h2 className="section-title">
                            <i className="fas fa-chart-line"></i>
                            챗봇 성능 지표
                        </h2>

                        <div className="metrics-row">
                            <div className="metric-card">
                                <div className="metric-value success">94.2%</div>
                                <div className="chart-metric-label">문제 해결률</div>
                            </div>

                            <div className="metric-card">
                                <div className="metric-value info">2.3분</div>
                                <div className="chart-metric-label">평균 응답 시간</div>
                            </div>

                            <div className="metric-card">
                                <div className="metric-value purple">3.2턴</div>
                                <div className="chart-metric-label">평균 대화 턴수</div>
                            </div>

                            <div className="metric-card">
                                <div className="metric-value info" id="dailyAverage">45.0건/일</div>
                                <div className="chart-metric-label">일평균 문의량</div>
                            </div>
                        </div>
                    </div>

                    {/* 상단 차트 2개 */}
                    <div className="content-grid">
                        <div className="chart-card">
                            <div className="chart-header">
                                <h3 className="chart-title">일별 대화 트렌드</h3>
                            </div>
                            <div className="chart-container">
                                <div id="conversationChart" style={{ height: "270px" }}>
                                    {ConversationChart ? <Line data={ConversationChart} options={ConversationchartOptions} /> : <p>Loading...</p>}
                                </div>
                            </div>
                        </div>

                        <div className="chart-card">
                            <div className="chart-header">
                                <h3 className="chart-title">사용자 피드백 분포</h3>
                            </div>
                            <div className="chart-container">
                                <div id="feedbackChart" style={{ height: "270px" }}>
                                    {FeedbackChart ? <Doughnut data={FeedbackChart} options={FeedbackchartOptions} /> : <p>Loading...</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 응답 시간 분석 및 사용자 만족도 트렌드 */}
                    <div className="content-grid">
                        <div className="chart-card">
                            <div className="chart-header">
                                <h3 className="chart-title">응답 시간 분석</h3>
                            </div>
                            <div className="chart-container">
                                <div id="responseTimeChart" style={{ height: "270px" }}>
                                    {ResponseTimeChart ? <Bar data={ResponseTimeChart} options={ResponseTimeOptions} /> : <p>Loading...</p>}
                                </div>
                            </div>
                        </div>

                        <div className="chart-card">
                            <div className="chart-header">
                                <h3 className="chart-title">사용자 만족도 트렌드</h3>
                            </div>
                            <div className="chart-container">
                                <div id="satisfactionChart" style={{ height: "270px" }}>
                                    {SatisfactionChart ? <Line data={SatisfactionChart} options={SatisfactionOptions} /> : <p>Loading...</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 시간대별 대화량 */}
                    <div className="chart-card full-width" style={{ marginBottom: "2rem" }}>
                        <div className="chart-header">
                            <h3 className="chart-title">시간대별 대화량</h3>
                        </div>
                        <div className="chart-container">
                            <div id="hourlyChart" style={{ height: "270px" }}>
                                {HourlyChart ? <Bar data={HourlyChart} options={HourlyOptions} /> : <p>Loading...</p>}
                            </div>
                        </div>
                    </div>

                    {/* 하단 인기 질문과 만족도 상세 */}
                    <div className="content-grid">
                        <div className="questions-card">
                            <div className="chart-header">
                                <h3 className="chart-title">인기 질문 TOP 5</h3>
                            </div>

                            <div className="questions-content">
                                {faqs.map((faq, index) => (
                                    <div className="question-item" key={index}>
                                        <div className="question-rank">{index + 1}</div>
                                        <div className="question-content">
                                            <div className="question-text">{faq.question}</div>
                                            <div className="question-count">{faq.views}회 질문 (+{faq.satisfaction_rate}%)</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="questions-card">
                            <div className="chart-header">
                                <h3 className="chart-title">최근 만족도 평가</h3>
                            </div>
                            <div className="satisfaction-content">
                                <table className="satisfaction-table">
                                    <thead>
                                        <tr>
                                            <th>시간</th>
                                            <th>문의 내용</th>
                                            <th>만족도</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>14:23</td>
                                            <td>POS 시스템이 갑자기 꺼져요</td>
                                            <td className="emoji-rating">👍</td>
                                        </tr>
                                        <tr>
                                            <td>14:18</td>
                                            <td>카드 결제가 안돼요</td>
                                            <td className="emoji-rating">👍</td>
                                        </tr>
                                        <tr>
                                            <td>14:12</td>
                                            <td>키오스크 화면이 검게 나와요</td>
                                            <td className="emoji-rating">👎</td>
                                        </tr>
                                        <tr>
                                            <td>14:05</td>
                                            <td>무선단말기 연결이 안돼요</td>
                                            <td className="emoji-rating">👍</td>
                                        </tr>
                                        <tr>
                                            <td>13:58</td>
                                            <td>CCTV 화질이 흐려요</td>
                                            <td className="emoji-rating">👍</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </>
    )
}