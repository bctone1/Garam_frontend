import axios from "axios";
import React, { useEffect, useState } from "react";
import { Chart as ChartJS, LineElement, PointElement, CategoryScale, LinearScale, Title, Tooltip, Legend, Filler } from "chart.js";
import { Line, Doughnut, Bar } from "react-chartjs-2";

// Chart.js 요소 등록
ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Title, Tooltip, Legend, Filler);


export default function Chart() {

    const ITEMS_PER_PAGE = 7;
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
    const [TotalCost, setTotalCost] = useState([]);
    const [WindowData, setWindowData] = useState({});
    const [documents, setdocuments] = useState([]);


    const sortedCost = [...TotalCost].sort((a, b) => new Date(b.date) - new Date(a.date));
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(sortedCost.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentItems = sortedCost.slice(startIndex, endIndex);
    // 페이지 변경 함수
    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    useEffect(() => {
        fetchFAQs();
        fetchConversationChart();
        fetchFeedbackChart();
        fetchResponseTimeChart();
        fetchSatisfactionChart();
        fetchHourlyChart();
        fetchRequestTrendChart();
        fetchCostTrendChart();
        fetch_Knowledge();
    }, []);

    useEffect(() => {
        fetchCost(period);
        fetchCostWindow(period);
        fetchDaily(period);
        fetchHourly(period);
    }, [period]);

    const fetch_Knowledge = () => {
        axios.get(`${process.env.REACT_APP_API_URL}/knowledge`, {
            params: {
                offset: 0,
                limit: 5,
            },
        }).then((res) => {
            setdocuments(res.data);
            // console.log("📌 지식베이스 목록:", res.data);
        }).catch((err) => {
            console.log(err);
        });
    }


    const fetchHourly = async (days) => {
        const hours = [];
        const inquiries = [];

        const res = await axios.get(`${process.env.REACT_APP_API_URL}/analytics/timeseries/hourly?days=${days}`);
        const apiData = res.data;
        const hourlyTotals = Array.from({ length: 24 }, (_, i) => ({ hour: i, total: 0 }));

        apiData.forEach((item) => {
            const hour = new Date(item.ts).getHours(); // 시 추출 (한국시간 기반)
            hourlyTotals[hour].total += item.messages; // 시별 합산
        });

        // 3️⃣ inquiries 배열 구성
        hourlyTotals.forEach((h) => {
            hours.push(`${h.hour}:00`);
            inquiries.push(h.total);
        });
        // console.log(hours);
        // console.log(inquiries);

        setHourlyChart({
            labels: hours,
            datasets: [{
                label: '대화량',
                data: inquiries,
                backgroundColor: 'rgba(30, 96, 225, 0.8)',
                borderRadius: 4
            }]
        });


    }

    const fetchDaily = async (days) => {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - (days - 1));
        const formatDate = (date) => date.toISOString().split('T')[0];
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/analytics/daily?start=${formatDate(startDate)}&end=${formatDate(endDate)}`);
        const data = res.data
        // console.log(data);

        const total_feedback_helpful = data.reduce(
            (sum, item) => sum + (item.feedback_helpful || 0), 0
        );
        const total_feedback_not_helpful = data.reduce(
            (sum, item) => sum + (item.feedback_not_helpful || 0), 0
        );
        setFeedbackChart({
            labels: ['Helpful', 'Improvement Needed'],
            datasets: [{
                data: [total_feedback_helpful, total_feedback_not_helpful],
                backgroundColor: [
                    '#28a745',
                    '#dc3545',
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        });



        const tempMap = {}; // { '1': [점수, ...], '2': [...], ... }

        res.data.forEach(item => {
            const month = new Date(item.d).getMonth() + 1; // 0~11 → 1~12
            const totalFeedback = item.feedback_helpful + item.feedback_not_helpful;
            // console.log(totalFeedback);
            const score = totalFeedback === 0 ? 0 : (item.feedback_helpful / totalFeedback) * 100;
            // console.log(score);

            if (!tempMap[month]) tempMap[month] = [];
            tempMap[month].push(score);
        });

        // console.log(tempMap);

        // 2. labels: 1월~12월
        const labels = Array.from({ length: 12 }, (_, i) => `${i + 1}월`);

        // 3. groupdata: 각 달 평균, 없으면 0
        const groupdata = labels.map((_, i) => {
            const month = i + 1;
            if (!tempMap[month]) return 0;
            return Math.round(tempMap[month][0]);  // 반올림
        });

        // console.log(labels);
        // console.log(groupdata);

        // 4. 차트 업데이트
        setSatisfactionChart({
            labels,
            datasets: [{
                label: 'Satisfaction (%)',
                data: groupdata,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true,
                tension: 0.4
            }]
        });










        const groupedByWeekday = res.data.reduce((acc, curr) => {
            const day = curr.weekday; // 1(월) ~ 7(일)
            const messages = curr.messages_total || 0;
            acc[day] = (acc[day] || 0) + messages;
            return acc;
        }, {});
        const orderedData = [1, 2, 3, 4, 5, 6, 7].map(day => groupedByWeekday[day] || 0);
        setConversationChart({
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [
                {
                    label: 'Conversation Count',
                    data: orderedData,
                    borderColor: '#1e60e1',
                    backgroundColor: 'rgba(30, 96, 225, 0.1)',
                    fill: true,
                    tension: 0.4,
                },
            ],
        });
    };

    const fetchCostWindow = (days) => {
        try {
            axios.get(`${process.env.REACT_APP_API_URL}/analytics/windows?days=${days}`).then((res) => {
                setWindowData(res.data);
            })
        } catch (error) {
            console.log(error);
        }
    }

    const fetchCost = async (days) => {
        try {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(endDate.getDate() - (days - 1));

            const formatDate = (date) => date.toISOString().split('T')[0];

            const res = await axios.get(`${process.env.REACT_APP_API_URL}/api-cost/rows?start=${formatDate(startDate)}&end=${formatDate(endDate)}`);
            const data = res.data;
            // console.log(data);

            const labels = [...new Set(data.map(item => item.d))].sort();
            // 2️⃣ 날짜별 product 합계 계산
            const chartgrouped = labels.map(date => {
                const dailyData = data.filter(item => item.d === date);
                const embeddingData = dailyData.find(i => i.product === 'embedding');
                const llmData = dailyData.find(i => i.product === 'llm');
                const sttData = dailyData.find(i => i.product === 'stt');

                return {
                    date,
                    // Embedding
                    embedding: embeddingData?.embedding_tokens || 0,
                    embedding_cost: embeddingData ? Number(embeddingData.cost_usd || 0) : 0,

                    // LLM
                    llm: llmData?.llm_tokens || 0,
                    llm_cost: llmData ? Number(llmData.cost_usd || 0) : 0,

                    // STT
                    stt: sttData?.audio_seconds || 0,
                    stt_cost: sttData ? Number(sttData.cost_usd || 0) : 0,

                    // 총비용 (3개 합계)
                    total_cost:
                        (embeddingData ? Number(embeddingData.cost_usd || 0) : 0) +
                        (llmData ? Number(llmData.cost_usd || 0) : 0) +
                        (sttData ? Number(sttData.cost_usd || 0) : 0),
                };
            });

            // console.log(chartgrouped);
            setTotalCost(chartgrouped);

            // 3️⃣ Chart.js 데이터 포맷으로 변환
            setRequestTrendChart({
                labels: chartgrouped.map((g) => g.date.slice(5).replace("-", "/")), // '10/27' 형식
                datasets: [
                    {
                        label: 'Embedding',
                        data: chartgrouped.map(g => g.embedding),
                        backgroundColor: 'rgba(139, 92, 246, 0.8)',
                        borderRadius: 4,
                        yAxisID: 'y',   // 왼쪽 Y축 사용
                    },
                    {
                        label: 'LLM',
                        data: chartgrouped.map(g => g.llm),
                        backgroundColor: 'rgba(23, 162, 184, 0.8)',
                        borderRadius: 4,
                        yAxisID: 'y',   // 왼쪽 Y축 사용
                    },
                    {
                        label: 'STT',
                        data: chartgrouped.map(g => g.stt),
                        backgroundColor: 'rgba(255, 193, 7, 0.8)',
                        borderRadius: 4,
                        yAxisID: 'y1',  // 오른쪽 Y축 사용
                    }
                ]
            });

            setCostTrendChart({
                labels: chartgrouped.map((g) => g.date.slice(5).replace("-", "/")), // '10/27' 형식
                datasets: [
                    {
                        label: "임베딩 비용 ($)",
                        data: chartgrouped.map((g) => g.embedding_cost.toFixed(2)),
                        borderColor: "#8b5cf6",
                        backgroundColor: "rgba(139, 92, 246, 0.1)",
                        fill: true,
                        tension: 0.4,
                    },
                    {
                        label: "LLM 비용 ($)",
                        data: chartgrouped.map((g) => g.llm_cost.toFixed(2)),
                        borderColor: "#17a2b8",
                        backgroundColor: "rgba(23, 162, 184, 0.1)",
                        fill: true,
                        tension: 0.4,
                    },
                    {
                        label: "음성 비용 ($)",
                        data: chartgrouped.map((g) => g.stt_cost.toFixed(2)),
                        borderColor: "#ffc107",
                        backgroundColor: "rgba(255, 193, 7, 0.1)",
                        fill: true,
                        tension: 0.4,
                    },
                ],
            });


            // ✅ 같은 product끼리 합산
            const grouped = data.reduce((acc, item) => {
                const { product, llm_tokens = 0, embedding_tokens = 0, cost_usd = 0, audio_seconds = 0 } = item;

                // product가 없으면 기본 객체 생성
                if (!acc["embedding"]) acc["embedding"] = {
                    product: "embedding",
                    total_llm_tokens: 0,
                    total_embedding_tokens: 0,
                    total_cost_usd: 0,
                    total_audio_seconds: 0
                };
                if (!acc["llm"]) acc["llm"] = {
                    product: "llm",
                    total_llm_tokens: 0,
                    total_embedding_tokens: 0,
                    total_cost_usd: 0,
                    total_audio_seconds: 0
                };
                if (!acc["stt"]) acc["stt"] = {
                    product: "stt",
                    total_llm_tokens: 0,
                    total_embedding_tokens: 0,
                    total_cost_usd: 0,
                    total_audio_seconds: 0
                };

                // 실제 데이터 더하기
                acc[product].total_llm_tokens += llm_tokens;
                acc[product].total_embedding_tokens += embedding_tokens;
                acc[product].total_cost_usd += Number(cost_usd);
                acc[product].total_audio_seconds += audio_seconds;

                return acc;
            }, {});

            console.log(grouped);


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
            console.log("📊 Product별 합계:", summary);




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

    // 일별 문의량
    const fetchConversationChart = () => {


        setConversationChartOptions({
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: "index",
                intersect: false,
            },
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


        setSatisfactionOptions({
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: "index",
                intersect: false,
            },
            plugins: {
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    min: 0,
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
        setHourlyOptions({
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: "index",
                intersect: false,
            },
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
                        text: 'Conversation Count'
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
                                return `${label}: ${value} seconds`;
                            } else {
                                return `${label}: ${value} tokens`;
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
                            return value + ' tokens';
                        }
                    },
                    title: {
                        display: true,
                        text: 'Token Usage'
                    }
                },
                y1: {
                    type: 'linear',
                    position: 'right',
                    beginAtZero: true,
                    grid: {
                        drawOnChartArea: false
                    },
                    ticks: {
                        callback: function (value) {
                            return value + ' seconds';
                        }
                    },
                    title: {
                        display: true,
                        text: 'Speech Usage'
                    }
                }

            }
        });
    }

    //일별 API비용 추이
    const fetchCostTrendChart = () => {
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
                            <h1>Analysis and Reports</h1>
                            <p className="page-subtitle">Analyze chatbot performance and user insights.</p>
                        </div>
                    </div>
                    <div className="header-right">
                        <div className="date-selector">
                            <select className="date-select" id="dateRange"
                                onChange={(e) => setPeriod(Number(e.target.value))}
                                value={period}
                            >
                                <option value={1}>Today</option>
                                <option value={7}>Last 7 days</option>
                                <option value={30}>Last 30 days</option>
                                {/* <option value={90}>지난 90일</option> */}
                            </select>
                        </div>
                    </div>
                </header>
                <div className="chart-main-container">


                    {/* AI API 사용량 및 비용 섹션  */}
                    <div className="section" style={{ marginBottom: "2rem" }}>
                        <h2 className="section-title">
                            <i className="fas fa-brain"></i>
                            AI API Usage and Cost
                        </h2>

                        {/* API 요약 카드 (요청수 / 비용) */}
                        <div className="metrics-row">
                            <div className="metric-card">
                                <div className="metric-value purple">
                                    <div className="metric-value info">
                                        {APICost?.[0]
                                            ? `${APICost[0].total_embedding_tokens.toLocaleString()} tokens / $${APICost[0].total_cost_usd?.toFixed(2)}`
                                            : "Loading..."}
                                    </div>
                                </div>
                                <div className="chart-metric-label">Embedding</div>
                                <small style={{ color: "#6c757d", fontSize: "0.75rem" }}>Knowledge Base Vectorization</small>
                            </div>

                            <div className="metric-card">
                                <div className="metric-value info">
                                    {APICost?.[1]
                                        ? `${APICost[1].total_llm_tokens.toLocaleString()} tokens / $${APICost[1].total_cost_usd?.toFixed(2)}`
                                        : "Loading..."}
                                </div>
                                <div className="chart-metric-label">API</div>
                                <small style={{ color: "#6c757d", fontSize: "0.75rem" }}>GPT-4o-mini</small>
                            </div>

                            <div className="metric-card">
                                <div className="metric-value warning">
                                    {APICost?.[2]
                                        ? `${APICost[2].total_audio_seconds.toLocaleString()} seconds / $${APICost[2].total_cost_usd?.toFixed(2)}`
                                        : "Loading..."}
                                </div>
                                <div className="chart-metric-label">Speech API</div>
                                <small style={{ color: "#6c757d", fontSize: "0.75rem" }}>NAVER Clova Speech STT</small>
                            </div>

                            <div className="metric-card">
                                <div className="metric-value success">

                                    {APICost?.[3] ? `$ ${APICost[3].total_cost_usd?.toFixed(2)}` : "Loading..."}
                                </div>
                                <div className="chart-metric-label">Total API Usage</div>
                                {/* <small style={{ color: "#6c757d", fontSize: "0.75rem" }}>이번 달 누적</small> */}
                            </div>
                        </div>

                        {/* 일별 요청 수 추이 차트 */}
                        <div className="chart-card" style={{ marginBottom: "1.5rem" }}>
                            <div className="chart-header">
                                <h3 className="chart-title">Daily Usage</h3>
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
                                <h3 className="chart-title">Daily API Cost</h3>
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
                                <h3 className="chart-title">Daily API Usage History</h3>
                            </div>
                            <div className="satisfaction-content">
                                <table className="satisfaction-table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Embedding Tokens</th>
                                            <th>Embedding Cost</th>
                                            <th>LLM Tokens</th>
                                            <th>LLM Cost</th>
                                            <th>Speech Usage</th>
                                            <th>Speech Cost</th>
                                            <th>Total Cost</th>
                                        </tr>
                                    </thead>
                                    <tbody id="apiUsageTableBody">
                                        {currentItems.map(cost => (
                                            <tr key={cost.date}>
                                                <td>{cost.date}</td>
                                                <td>{cost.embedding} tokens</td>
                                                <td>$ {cost.embedding_cost.toFixed(2)}</td>
                                                <td>{cost.llm} tokens</td>
                                                <td>$ {cost.llm_cost.toFixed(2)}</td>
                                                <td>{cost.stt} seconds</td>
                                                <td>$ {cost.stt_cost.toFixed(2)}</td>
                                                <td><strong>$ {cost.total_cost.toFixed(2)}</strong></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* 페이지네이션 */}
                            <div className="pagination-container">
                                <div className="pagination-info">
                                    {startIndex + 1} - {Math.min(endIndex, TotalCost.length)} / Total {TotalCost.length} items
                                </div>
                                <div className="pagination-controls">
                                    <button
                                        className="pagination-btn"
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                    >
                                        <i className="fas fa-chevron-left"></i> Previous
                                    </button>

                                    <div className="page-numbers">
                                        {Array.from({ length: totalPages }, (_, i) => (
                                            <button
                                                key={i + 1}
                                                className={`page-number ${currentPage === i + 1 ? "active" : ""}`}
                                                onClick={() => handlePageChange(i + 1)}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        className="pagination-btn"
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                    >
                                        Next <i className="fas fa-chevron-right"></i>
                                    </button>
                                </div>
                            </div>


                        </div>

                        {/* API 비용 정보 안내 */}
                        <div className="info-box">
                            <h3>
                                <i className="fas fa-info-circle"></i>
                                API Cost Information
                            </h3>
                            <ul>
                                <li>
                                    <i className="fas fa-check" style={{ color: "#28a745", marginRight: "0.5rem" }}></i>
                                    <strong>Embedding Cost:</strong> Occurs during the vectorization process of documents when registering files in the knowledge base (one-time)
                                </li>
                                <li>
                                    <i className="fas fa-check" style={{ color: "#28a745", marginRight: "0.5rem" }}></i>
                                    <strong>LLM API Cost:</strong> Occurs when the chatbot generates answers based on search results (GPT-4o-mini 32B baseline)
                                </li>
                                <li>
                                    <i className="fas fa-check" style={{ color: "#28a745", marginRight: "0.5rem" }}></i>
                                    <strong>Speech API Cost:</strong> Cost of converting speech input to text (NAVER Clova Speech STT baseline, $0.047 per minute)
                                </li>
                            </ul>
                        </div>
                    </div>
                    {/* 상단 성능 지표 카드들  */}
                    <div className="section" style={{ marginBottom: "2rem" }}>
                        <h2 className="section-title">
                            <i className="fas fa-chart-line"></i>
                            Chatbot Performance Metrics
                        </h2>

                        <div className="metrics-row">
                            <div className="metric-card">
                                <div className="metric-value success">{WindowData.resolve_rate_excluding_noresp}%</div>
                                <div className="chart-metric-label">Resolution Rate</div>
                            </div>

                            <div className="metric-card">
                                <div className="metric-value info">
                                    {Number(WindowData.avg_response_ms * 0.001 || 0).toFixed(2)} seconds
                                </div>
                                <div className="chart-metric-label">Average Response Time</div>
                            </div>

                            <div className="metric-card">
                                <div className="metric-value purple">
                                    {Number(WindowData.avg_turns).toFixed(2)} turns
                                </div>
                                <div className="chart-metric-label">Average Conversation Turn Count</div>
                            </div>

                            <div className="metric-card">
                                <div className="metric-value info" id="dailyAverage">
                                    {Number(WindowData?.avg_messages || 0).toFixed(2)} inquiries/day
                                </div>
                                <div className="chart-metric-label">Average Daily Inquiry Count</div>
                            </div>
                        </div>
                    </div>

                    {/* 상단 차트 2개 */}
                    <div className="content-grid">
                        <div className="chart-card">
                            <div className="chart-header">
                                <h3 className="chart-title">Daily Conversation Count</h3>
                            </div>
                            <div className="chart-container">
                                <div id="conversationChart" style={{ height: "270px" }}>
                                    {ConversationChart ? <Line data={ConversationChart} options={ConversationchartOptions} /> : <p>Loading...</p>}
                                </div>
                            </div>
                        </div>

                        <div className="chart-card">
                            <div className="chart-header">
                                <h3 className="chart-title">User Feedback Distribution</h3>
                            </div>
                            <div className="chart-container">
                                <div id="feedbackChart" style={{ height: "270px" }}>
                                    {FeedbackChart ? <Doughnut data={FeedbackChart} options={FeedbackchartOptions} /> : <p>Loading...</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 응답 시간 분석 및 사용자 만족도 트렌드 */}
                    {/* <div className="content-grid">
                        <div className="chart-card">
                            <div className="chart-header">
                                <h3 className="chart-title">응답 시간 분석(avg_response_ms)(X)</h3>
                            </div>
                            <div className="chart-container">
                                <div id="responseTimeChart" style={{ height: "270px" }}>
                                    {ResponseTimeChart ? <Bar data={ResponseTimeChart} options={ResponseTimeOptions} /> : <p>Loading...</p>}
                                </div>
                            </div>
                        </div>

                        <div className="chart-card">
                            <div className="chart-header">
                                <h3 className="chart-title">사용자 만족도 트렌드 <br/>(받는 데이터 부족 1년치 데이터를 받아서 하기에는 무리)</h3>
                            </div>
                            <div className="chart-container">
                                <div id="satisfactionChart" style={{ height: "270px" }}>
                                    {SatisfactionChart ? <Line data={SatisfactionChart} options={SatisfactionOptions} /> : <p>Loading...</p>}
                                </div>
                            </div>
                        </div>
                    </div> */}

                    {/* 시간대별 대화량 */}
                    <div className="chart-card full-width" style={{ marginBottom: "2rem" }}>
                        <div className="chart-header">
                            <h3 className="chart-title">Hourly Conversation Count</h3>
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
                                <h3 className="chart-title">Top 5 Frequently Asked Questions</h3>
                            </div>

                            <div className="questions-content">
                                {faqs.map((faq, index) => (
                                    <div className="question-item" key={index}>
                                        <div className="question-rank">{index + 1}</div>
                                        <div className="question-content">
                                            <div className="question-text">{faq.question}</div>
                                            <div className="question-count">{faq.views} inquiries (+{faq.satisfaction_rate}%)</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="questions-card">
                            <div className="chart-header">
                                <h3 className="chart-title">Recently Uploaded Files</h3>
                            </div>
                            <div className="satisfaction-content">
                                <table className="satisfaction-table">
                                    <thead>
                                        <tr>
                                            <th>Upload Date</th>
                                            <th>Title</th>
                                            <th>Size</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {documents.map(document => (
                                            <tr key={document.id}>
                                                <td>{new Date(document.created_at).toISOString().split("T")[0]}</td>
                                                <td>{document.original_name}</td>
                                                <td className="emoji-rating">{formatBytes(document.size)}</td>
                                            </tr>
                                        ))}
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

function formatBytes(bytes) {
    if (bytes >= 1024 * 1024 * 1024) return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
    if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    if (bytes >= 1024) return (bytes / 1024).toFixed(2) + " KB";
    return bytes + " B";
}
