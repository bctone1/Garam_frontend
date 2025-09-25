import axios from "axios";
import { useState, useEffect } from "react";

export default function AdminLogin({ handleMenuClick }) {
    const [adminUsers, setAdminUsers] = useState([]);
    const [selectedAdminId, setSelectedAdminId] = useState(""); // id만 저장
    const [password, setPassword] = useState("");

    // 관리자 목록 가져오기
    useEffect(() => {
        axios
            .get(`${process.env.REACT_APP_API_URL}/admin_users`, {
                params: { offset: 0, limit: 50 },
            })
            .then((res) => {
                setAdminUsers(res.data);
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

    // 로그인 처리 함수
    const handleLogin = () => {

        if (!selectedAdminId || !password) {
            alert("관리자와 비밀번호를 입력해주세요.");
            return;
        }

        // 선택된 관리자 찾기
        const selectedAdmin = adminUsers.find(
            (admin) => String(admin.id) === String(selectedAdminId)
        );

        if (!selectedAdmin) {
            alert("존재하지 않는 관리자입니다.");
            return;
        }
        // alert(selectedAdmin.password);
        // alert(password);

        // 비밀번호 비교 (실제로는 서버에서 인증해야 함)
        if (selectedAdmin.password !== password) {
            alert("비밀번호가 틀립니다.");
            return;
        }
        sessionStorage.setItem("admin_name", selectedAdmin.name);
        sessionStorage.setItem("admin_email", selectedAdmin.email);


        alert("✅ 로그인 성공");
        handleMenuClick("inquiry");
    };

    return (
        <main className="main-content flex flex-col gap-4 p-6 max-w-md mx-auto">
            <h1 className="text-xl font-bold">관리자 로그인</h1>

            {/* 관리자 선택 */}
            <select
                className="border p-2 rounded"
                value={selectedAdminId}
                onChange={(e) => setSelectedAdminId(e.target.value)}
            >
                <option value="">관리자 선택</option>
                {adminUsers
                    .filter((admin) => admin.id !== 0)
                    .map((admin) => (
                        <option key={admin.id} value={admin.id}>
                            {admin.name}
                        </option>
                    ))}
            </select>

            {/* 비밀번호 입력 */}
            <input
                type="password"
                placeholder="비밀번호 입력"
                className="border p-2 rounded"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            {/* 로그인 버튼 */}
            <button
                onClick={handleLogin}
                className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
                로그인
            </button>
        </main>
    );
}
