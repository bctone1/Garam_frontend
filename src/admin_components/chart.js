import axios from "axios";
import React, { useEffect, useState } from "react";
import { Chart as ChartJS, LineElement, PointElement, CategoryScale, LinearScale, Title, Tooltip, Legend, Filler } from "chart.js";
import { Line, Doughnut, Bar } from "react-chartjs-2";

// Chart.js 요소 등록
ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Title, Tooltip, Legend, Filler);


export default function Chart() {

    useEffect(() => {
        axios
            .get(`${process.env.REACT_APP_API_URL}/faqs`, {
                params: {
                    offset: 0,
                    limit: 5,
                },
            })
            .then((res) => {
                setfaqs(res.data);
                console.log("📌 관리자 목록:", res.data);
            })
            .catch((err) => {
                if (err.response && err.response.status === 404) {
                    alert("해당 setting을 찾을 수 없습니다.");
                } else {
                    console.error("❌ 요청 실패:", err);
                }
            });
    }, []);

    const [faqs, setfaqs] = useState([]);



    // 일별 대화 트렌드
    const [ConversationChart, setConversationChart] = useState(null);
    const [ConversationchartOptions, setConversationChartOptions] = useState({});
    useEffect(() => {
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
    }, []);


    // 사용자 피드백 분포
    const [FeedbackChart, setFeedbackChart] = useState(null);
    const [FeedbackchartOptions, setFeedbackChartOptions] = useState({});
    useEffect(() => {
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
    }, []);

    // 응답 시간 분석
    const [ResponseTimeChart, setResponseTimeChart] = useState(null);
    const [ResponseTimeOptions, setResponseTimeOptions] = useState({});
    useEffect(() => {
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
    }, []);

    // 사용자 만족도 트렌드
    const [SatisfactionChart, setSatisfactionChart] = useState(null);
    const [SatisfactionOptions, setSatisfactionOptions] = useState({});
    useEffect(() => {
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
    }, []);

    // 시간대별 대화량
    const [HourlyChart, setHourlyChart] = useState(null);
    const [HourlyOptions, setHourlyOptions] = useState({});

    useEffect(() => {
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
    }, []);







    return (
        <>
            <main className="main-content">
                <header className="top-header">
                    <div className="header-left">
                        <div className="page-title">
                            <h1>분석 및 보고서</h1>
                            <p className="page-subtitle">챗봇 성능과 사용자 인사이트를 분석하세요</p>
                        </div>
                    </div>
                    <div className="header-right">
                        <div className="date-selector">
                            <select className="date-select" id="dateRange">
                                <option value="today">오늘</option>
                                <option value="week" >지난 7일</option>
                                <option value="month">지난 30일</option>
                                <option value="quarter">지난 90일</option>
                            </select>

                            <button className="btn btn-primary" >
                                <i className="fas fa-download"></i>
                                데이터 내보내기
                            </button>
                        </div>
                    </div>
                </header>

                <div className="main-container">
                    {/* 상단 성능 지표 카드들  */}
                    <div className="metrics-row">
                        <div className="metric-card">
                            <div className="metric-value success">94.2%</div>
                            <div className="metric-label">문제 해결률</div>
                        </div>

                        <div className="metric-card">
                            <div className="metric-value info">2.3분</div>
                            <div className="metric-label">평균 응답 시간</div>
                        </div>

                        <div className="metric-card">
                            <div className="metric-value purple">3.2턴</div>
                            <div className="metric-label">평균 대화 턴수</div>
                        </div>

                        <div className="metric-card">
                            <div className="metric-value info" id="dailyAverage">45.0건/일</div>
                            <div className="metric-label">일평균 문의량</div>
                        </div>
                    </div>

                    {/* 상단 차트 2개 */}
                    <div className="content-grid">
                        <div className="chart-card">
                            <div className="chart-header">
                                <h3 className="chart-title">일별 대화 트렌드</h3>
                                <div className="chart-controls">

                                    <button className="chart-action" title="차트 다운로드">
                                        <i className="fas fa-download"></i>
                                    </button>
                                </div>
                            </div>
                            <div className="chart-container">
                                {/* <canvas id="conversationChart"></canvas> */}
                                <div id="conversationChart" style={{ height: "270px" }}>
                                    {ConversationChart ? <Line data={ConversationChart} options={ConversationchartOptions} /> : <p>Loading...</p>}
                                </div>
                            </div>
                        </div>

                        <div className="chart-card">
                            <div className="chart-header">
                                <h3 className="chart-title">사용자 피드백 분포</h3>
                                <div className="chart-controls">
                                    <button className="chart-action" title="차트 다운로드">
                                        <i className="fas fa-download"></i>
                                    </button>
                                </div>
                            </div>
                            <div className="chart-container">
                                {/* <canvas id="feedbackChart"></canvas> */}
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
                                <div className="chart-controls">
                                    <button className="chart-action" title="차트 다운로드">
                                        <i className="fas fa-download"></i>
                                    </button>
                                </div>
                            </div>
                            <div className="chart-container">
                                {/* <canvas id="responseTimeChart"></canvas> */}
                                <div id="responseTimeChart" style={{ height: "270px" }}>
                                    {ResponseTimeChart ? <Bar data={ResponseTimeChart} options={ResponseTimeOptions} /> : <p>Loading...</p>}
                                </div>
                            </div>
                        </div>

                        <div className="chart-card">
                            <div className="chart-header">
                                <h3 className="chart-title">사용자 만족도 트렌드</h3>
                                <div className="chart-controls">
                                    <button className="chart-action" title="차트 다운로드">
                                        <i className="fas fa-download"></i>
                                    </button>
                                </div>
                            </div>
                            <div className="chart-container">
                                {/* <canvas id="satisfactionChart"></canvas> */}
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
                            <div className="chart-controls">
                                <button className="chart-action" title="차트 다운로드">
                                    <i className="fas fa-download"></i>
                                </button>
                            </div>
                        </div>
                        <div className="chart-container">
                            {/* <canvas id="hourlyChart"></canvas> */}
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