import axios from "axios";
import React, { useEffect, useState } from "react";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import { showNotification } from '../utill/utill';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
  BarElement
} from "chart.js";

// Chart.js 등록
ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
  BarElement
);

export default function Dashboard() {

  const [period, setPeriod] = useState(30);
  const [TrendChart, setTrendChart] = useState(null);
  const [ChatList, setChatList] = useState([]);
  const [FeedbackChart, setFeedbackChart] = useState(null);
  const [HourlyChart, setHourlyChart] = useState(null);
  const [HourlyOptions, setHourlyOptions] = useState({});
  const [dashboard, setDashabord] = useState({});
  const [refreshStatus, setrefreshStatus] = useState(false);


  useEffect(() => {
    const fetchTrendChart = async () => {
      const chartData = await buildTrendChartData(period);
      console.log(chartData);
      setTrendChart(chartData);
    };
    fetchTrendChart();
  }, [period]);

  const Trendoptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "#e9ecef" },
      },
      x: {
        grid: { display: false },
      },
    },
  };

  const Feedbackoptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
    },
  };



  const buildTrendChartData = async (days) => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/analytics/timeseries/daily?days=${days}`);
      const apiData = res.data;
      console.log(apiData);

      apiData.sort((a, b) => new Date(a.ts) - new Date(b.ts));
      const labels = apiData.map(item =>
        new Date(item.ts).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })
      );
      const data = apiData.map(item => item.sessions); // 🔹 또는 item.avg_response_ms

      return {
        labels,
        datasets: [
          {
            label: "일일 대화량",
            data,
            borderColor: "#1e60e1",
            backgroundColor: "rgba(30, 96, 225, 0.1)",
            tension: 0.4,
            fill: true,
          },
        ],
      };
    } catch (error) {
      console.error("데이터 불러오기 오류:", error);
      return {
        labels: [],
        datasets: [],
      };
    }
  };

  const getChat = () => {
    axios.get(`${process.env.REACT_APP_API_URL}/chat/sessions?offset=0&limit=5`).then((res) => {
      // console.log(res.data);
      setChatList(res.data);
    })
  }
  const fetchDaily = async (days) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - (days - 1));
    const formatDate = (date) => date.toISOString().split('T')[0];
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/analytics/daily?start=${formatDate(startDate)}&end=${formatDate(endDate)}`);
    const data = res.data
    console.log(data);

    const total_feedback_helpful = data.reduce(
      (sum, item) => sum + (item.feedback_helpful || 0), 0
    );
    const total_feedback_not_helpful = data.reduce(
      (sum, item) => sum + (item.feedback_not_helpful || 0), 0
    );
    setFeedbackChart({
      labels: ['도움됨', '개선필요'],
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

  }

  // 피드백 차트 (임시)
  useEffect(() => {
    fetchDashboard();
    fetchData();
    getChat();
    fetchDaily(7);
  }, []);



  const fetchData = async () => {
    try {
      const hours = [];
      const inquiries = [];

      const res = await axios.get(`${process.env.REACT_APP_API_URL}/analytics/timeseries/hourly?days=7`);
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

      setHourlyChart({
        labels: hours,
        datasets: [
          {
            label: "대화량",
            data: inquiries,
            backgroundColor: "rgba(30, 96, 225, 0.8)",
            yAxisID: "y",
          },
          // {
          //   label: "만족도 (%)",
          //   data: [10, 10, 10, 10, 60, 80, 90, 60, 10, 10, 11, 10, 1, 10, 10, 10, 10, 10, 1, 10, 10, 10, 10, 10, 1, 10, 10],
          //   type: "line",
          //   borderColor: "#28a745",
          //   backgroundColor: "rgba(40, 167, 69, 0.1)",
          //   yAxisID: "y1",
          //   tension: 0.4,
          // },
        ],
      });

      setHourlyOptions({
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: "index",
          intersect: false,
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
          },
          y: {
            type: "linear",
            display: true,
            position: "left",
            grid: {
              color: "#e9ecef",
            },
            title: {
              display: true,
              text: "대화량",
            },
          },
          // y1: {
          //   type: "linear",
          //   display: true,
          //   position: "right",
          //   grid: {
          //     drawOnChartArea: false,
          //   },
          //   title: {
          //     display: true,
          //     text: "만족도 (%)",
          //   },
          // },
        },
        plugins: {
          legend: {
            display: false,
          },
        },
      });

    } catch (error) {
      console.error("데이터 불러오기 오류:", error);
    }
  };



  const fetchDashboard = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/analytics/dashboard`);
      const apiData = res.data;
      setDashabord(apiData);
    } catch (error) {
      console.log(error);
    }

  }




  const handlerefresh = async () => {
    console.log("ENV:", process.env.REACT_APP_API_URL);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/system/referesh_dashboard`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          // body: JSON.stringify({ user_id: session?.user?.id }),
        }
      );
      const data = await response.json();
      console.log(data);

    } catch (error) {

    }
    setrefreshStatus(true);
    setTimeout(() => {
      showNotification('데이터가 새로고침되었습니다.', 'success');
      setrefreshStatus(false);
    }, 1000);
  }





  return (
    <>
      {/* 메인 콘텐츠 */}
      <main className="main-content">
        {/* 상단 헤더 */}
        <header className="dashboard-top-header">
          <div className="dashboard-header-left">
            <button className="mobile-menu-btn" id="mobileMenuBtn">
              <i className="fas fa-bars"></i>
            </button>
            <div className="dashboard-page-title">
              <h1>대시보드</h1>
              <p className="dashboard-page-subtitle">Smart POS AI 기술지원 현황</p>
            </div>
          </div>
          <div className="header-right">
            <div className="header-stats">
              <div className="stat-item">
                <span className="dashboard-stat-label">시스템 상태</span>
                <div className="dashboard-status-indicator online">
                  <span className="status-dot"></span>
                  <span className="status-text">정상</span>
                </div>
              </div>
              <div className="stat-item">
                <span className="dashboard-stat-label">마지막 업데이트</span>
                <span className="dashboard-stat-value" id="lastUpdate">방금 전</span>
              </div>
            </div>
            <button className={`refresh-btn ${refreshStatus ? "spinning" : ""} `} id="refreshBtn" title="새로고침" onClick={() => handlerefresh()}>
              <i className="fas fa-sync-alt"></i>
            </button>
          </div>
        </header>

        {/* 메트릭 카드 섹션 */}
        <section className="metrics-section">
          <div className="dashboard-metrics-grid">
            <div className="dashboard-metric-card primary">
              <div className="metric-icon">
                <i className="fas fa-comments"></i>
              </div>
              <div className="metric-content">
                <div className="dashboard-metric-value" id="totalConversations">{dashboard.total_sessions}</div>
                <div className="metric-label">대화량</div>
                {/* <div className="metric-change positive">
                  <i className="fas fa-arrow-up"></i>
                  <span>+15.3%</span>
                  <small>지난주 대비</small>
                </div> */}
              </div>
            </div>

            <div className="dashboard-metric-card success">
              <div className="metric-icon">
                <i className="fas fa-thumbs-up"></i>
              </div>
              <div className="metric-content">
                <div className="dashboard-metric-value" id="satisfactionRate">{(dashboard.satisfaction_rate * 100).toFixed(0)}%</div>
                <div className="metric-label">사용자 만족도</div>
                {/* <div className="metric-change positive">
                  <i className="fas fa-arrow-up"></i>
                  <span>+3.2%</span>
                  <small>지난주 대비</small>
                </div> */}
              </div>
            </div>

            <div className="dashboard-metric-card warning">
              <div className="metric-icon">
                <i className="fas fa-clock"></i>
              </div>
              <div className="metric-content">
                <div className="dashboard-metric-value" id="avgResponseTime">{(dashboard.avg_response_ms / 1000).toFixed(2)}초</div>
                <div className="metric-label">평균 응답시간</div>
                {/* <div className="metric-change neutral">
                  <i className="fas fa-minus"></i>
                  <span>-0.2초</span>
                  <small>지난주 대비</small>
                </div> */}
              </div>
            </div>
          </div>
        </section>

        {/* 차트 섹션 */}
        <section className="charts-section">
          <div className="charts-grid">
            {/* 일별 대화량 */}
            <div className="dashboard-chart-card">
              <div className="chart-header">
                <h3 className="chart-title">일별 대화량</h3>
                <div className="chart-controls">
                  <select
                    className="chart-period"
                    id="trendPeriod"
                    value={period}
                    onChange={(e) => setPeriod(Number(e.target.value))}
                  >
                    <option value={7}>지난 7일</option>
                    <option value={30}>지난 30일</option>
                    <option value={90}>지난 90일</option>
                  </select>
                  {/* <button className="chart-action" title="차트 다운로드">
                    <i className="fas fa-download"></i>
                  </button> */}
                </div>
              </div>
              <div className="chart-container">
                {/* <canvas id="trendChart"></canvas> */}
                <div id="trendChart" style={{ height: "280px" }}>
                  {TrendChart ? <Line data={TrendChart} options={Trendoptions} /> : <p>Loading...</p>}
                </div>
              </div>
            </div>

            {/* 피드백 기반 만족도 분포 */}
            <div className="dashboard-chart-card">
              <div className="chart-header">
                <h3 className="chart-title">사용자 피드백 분포</h3>
                <div className="chart-controls">
                  {/* <button className="chart-action" title="차트 다운로드">
                    <i className="fas fa-download"></i>
                  </button> */}
                </div>
              </div>
              <div className="chart-container">
                {/* <canvas id="feedbackChart"></canvas> */}
                <div id="feedbackChart" style={{ height: "280px" }}>
                  {FeedbackChart ? <Doughnut data={FeedbackChart} options={Feedbackoptions} /> : <p>Loading...</p>}
                </div>
              </div>
            </div>
          </div>

          {/* 시간대별 사용량 */}
          <div className="dashboard-chart-card full-width">
            <div className="chart-header">
              <h3 className="chart-title">시간대별 사용량</h3>
              <div className="chart-controls">
                <div className="chart-legend">
                  <span className="legend-item">
                    <span className="legend-color" style={{ background: "#1e60e1" }}></span>
                    대화량
                  </span>
                  {/* <span className="legend-item">
                    <span className="legend-color" style={{ background: "#28a745" }}></span>
                    만족도(X)
                  </span> */}
                </div>
                {/* <button className="chart-action" title="차트 다운로드">
                  <i className="fas fa-download"></i>
                </button> */}
              </div>
            </div>
            <div className="chart-container">
              {/* <canvas id="hourlyChart"></canvas> */}
              <div id="hourlyChart" style={{ height: "180px" }}>
                {HourlyChart ? <Bar data={HourlyChart} options={HourlyOptions} /> : <p>Loading...</p>}
              </div>
            </div>
          </div>
        </section>

        {/* 최근 활동 섹션 */}
        <section className="activity-section">
          <div className="activity-grid">


            {/* 최근 대화  */}
            {/* <div className="activity-card">
              <div className="activity-header">
                <h3 className="activity-title">최근 대화</h3>

              </div>
              <div className="activity-content">
                <div className="conversation-list" id="recentConversations">

                  {ChatList.map(chat => (
                    <div className="conversation-item">
                      <div className="conversation-avatar">
                        <i className="fas fa-user"></i>
                      </div>
                      <div className="conversation-content">
                        <div className="conversation-text">{chat.title} / {chat.preview}</div>
                        <div className="conversation-meta">
                          <span className="conversation-time">{chat.created_at}</span>
                        </div>
                      </div>
                    </div>
                  ))}

                </div>
              </div>
            </div> */}





          </div>
        </section>
      </main>
    </>
  );
}


