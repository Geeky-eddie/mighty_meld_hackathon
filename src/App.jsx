import React, { useState, useEffect } from "react";
import { StartScreen, PlayScreen } from "./Screens";

function App() {
  const [gameState, setGameState] = useState("start");
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const darkModeState = localStorage.getItem("darkMode");
    if (darkModeState !== null) {
      setIsDarkMode(JSON.parse(darkModeState));
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkModeState = !isDarkMode;
    setIsDarkMode(newDarkModeState);

    localStorage.setItem("darkMode", JSON.stringify(newDarkModeState));
  };

  switch (gameState) {
    case "start":
      return <StartScreen start={() => setGameState("play")} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />;
    case "play":
      return <PlayScreen end={() => setGameState("start")}  isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />;
    default:
      throw new Error("Invalid game state " + gameState);
  }
}

export default App;
