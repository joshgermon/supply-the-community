import React, { useEffect } from "react";
import HomeView from "./HomeView.js";
import ReportView from "./ReportView.js";
import "./App.scss";

function App() {
  useEffect(() => {});
  return (
    <div className="App">
      <header>
        <h1>Supply the Community</h1>
      </header>
      <HomeView />
      <ReportView />
    </div>
  );
}

export default App;
