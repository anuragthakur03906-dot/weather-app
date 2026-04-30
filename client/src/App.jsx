import React from "react";
import WeatherCard from "./components/WeatherCard";
import SearchHistory from "./components/SearchHistory";

const App = () => {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-6"
      style={{
        background: "linear-gradient(135deg, #1e1b4b, #4c1d95, #5b21b6)"
      }}
    >
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <WeatherCard />
        </div>
        <div className="hidden md:block">
          <SearchHistory />
        </div>
      </div>
    </div>
  );
};

export default App;