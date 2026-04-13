import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import './App.css'; // 确保这里的名字和你刚才创建/修改的文件名一致

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
