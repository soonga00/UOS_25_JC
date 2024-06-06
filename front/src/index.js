import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import './dist/styles.css';
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter } from "react-router-dom";
import './index.css';

const root = ReactDOM.createRoot(document.getElementById("root"));

const linkElement = document.createElement('link');
linkElement.href = "https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500&family=Song+Myung&display=swap";
linkElement.rel = "stylesheet";
document.head.appendChild(linkElement);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
