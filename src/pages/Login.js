export default function Loginpage() {
    const handleLogin = (role) => {
        sessionStorage.setItem("role", role); // 세션스토리지에 저장

        if (role === "admin" || role === "superadmin") {
            window.location.href = "/admin";
        }
    };

    return (
        <>
            로그인 페이지<br />
            <button onClick={() => handleLogin("user")}>사용자</button> <br />
            <button onClick={() => handleLogin("admin")}>관리자</button> <br />
        </>
    );
}
