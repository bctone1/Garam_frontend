import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";

import Admin from "./pages/Admin";
import Main from "../src/user_components/Main";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Main />} /> {/* 로그인 페이지 */}
          
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Router>
      {/* <Main /> */}
    </>


  );
}

export default App;
