export default function Loginpage() {
    return (
        <>
        로그인 페이지
        <button>사용자</button>
        <button onClick={()=>window.location.href="/admin"}>관리자</button>


        </>
    )
}