import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import * as icons from "react-icons/gi";
import { Tile } from "./Tile";
import "./index.css";
import { motion, AnimatePresence } from "framer-motion";



const flipSound = new Audio("./flip.mp3");
const correctSound = new Audio("./win.mp3");
const matchSound = new Audio("./matched.mp3");
const mismatchSound = new Audio("./lose.mp3");
const backgroundMusic = new Audio("./loopedmusic3.mp3");




export const possibleTileContents = [
  icons.GiHearts,
  icons.GiWaterDrop,
  icons.GiDiceSixFacesFive,
  icons.GiUmbrella,
  icons.GiCube,
  icons.GiBeachBall,
  icons.GiDragonfly,
  icons.GiHummingbird,
  icons.GiFlowerEmblem,
  icons.GiOpenBook,
];









const bothclasses =
"flex flex-col w-full max-w-[320px] h-[320px] gap-y-8 rounded-lg p-2 mt-16 items-center";



const contained = "flex justify-center w-full";



const Loading = ({ onComplete }) => {


  const [count, setCount] = useState(3);

  useEffect(() => {

    const interval = setInterval(() => {

      setCount((prevCount) => prevCount - 1);

    }, 1000);

    if (count === 0) {

      clearInterval(interval);

      onComplete();
    }

    return () => clearInterval(interval);
  }, [count, onComplete]);


  return (
    <motion.div
      key="loading"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex justify-center items-center w-full h-full absolute top-0 left-0 bg-white z-50"
    >
      <div className="text-pink-500 text-4xl font-bold">{count}</div>
    </motion.div>
  );
};

export function StartScreen({ start, isDarkMode, toggleDarkMode }) {

  const darkModeIcon = isDarkMode ? (

    <icons.GiSun size={24} color="#FFFF00" />
  ) : (
    <icons.GiMoon size={24} color="#FFFFFF" />
  );

  return (

    <AnimatePresence>
      <motion.div
        key="start"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0 }}
        transition={{ duration: 0.7 }}
        className={contained}
      >
        <motion.div
          whileHover={{ scale: 1.5 }}
          whileTap={{ scale: 0.9 }}
          className="bg-black absolute left-[50px] top-[50px] 
          cursor-pointer z-[2] transition duration-1000 rounded-full"
          onClick={toggleDarkMode}
        >

          {darkModeIcon}

        </motion.div>

        <div className={`${isDarkMode ? "active" : ""}`}>

          <div className="absolute flex justify-center items-center left-12 top-12 w-5 h-5">

            <div
              className={`relative inset-0 scale-0 sm:w-[250vw] w-[250vh] sm:h-[250vw] 
              h-[250vh] rounded-full bg-black transition duration-1000 ease-in-out 
              flex flex-shrink-0 flex-grow-0 ${
                isDarkMode ? "scale-100" : ""
              }`}
            >
            </div>
          </div>
        </div>

        <div className={`${bothclasses} bg-pink-50 pt-16 absolute`}>
          <h1 className="text-3xl text-pink-500 font-bold">Memory</h1>
          <p className="text-pink-500 font-medium">
            Flip over tiles looking for pairs
          </p>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              backgroundMusic.play();
              start();
            }}
            className="bg-gradient-to-b from-pink-400 to-pink-600 rounded-full transition 
            duration-300 shadow-md shadow-black/10 hover:opacity-70 text-white px-16 py-2"
          >
            Play
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export function PlayScreen({ end, isDarkMode, toggleDarkMode }) {
  const [tiles, setTiles] = useState(null);
  const [tryCount, setTryCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const darkModeIcon = isDarkMode ? (
    <icons.GiSun size={24} color="#FFFF00" />
  ) : (
    <icons.GiMoon size={24} color="#FFFFFF" />
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoading(false);
      setTiles(getTiles(16));
    }, 2000);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const backgroundAudio = new Audio(backgroundMusic);
    backgroundAudio.loop = true;
    backgroundAudio.volume = 0.1;
    backgroundAudio.play(); 

    
    return () => {
      backgroundAudio.pause();
    };
  }, []);

  const getTiles = (tileCount) => {
    if (tileCount % 2 !== 0) {
      throw new Error("The number of tiles must be even.");
    }

    const pairCount = tileCount / 2;

    const usedTileContents = possibleTileContents.slice(0, pairCount);

    const shuffledContents = usedTileContents
      .concat(usedTileContents)
      .sort(() => Math.random() - 0.5)
      .map((content) => ({ content, state: "start" }));

    return shuffledContents;
  };

  const flip = (i) => {
    if (tiles[i].state === "flipped") return;

    flipSound.play();

    const flippedTiles = tiles.filter((tile) => tile.state === "flipped");
    const flippedCount = flippedTiles.length;

    if (flippedCount === 2) return;

    if (flippedCount === 1) {
      setTryCount((c) => c + 1);

      const alreadyFlippedTile = flippedTiles[0];
      const justFlippedTile = tiles[i];

      let newState = "start";

      if (alreadyFlippedTile.content === justFlippedTile.content) {
        confetti({
          ticks: 100,
        });
        newState = "matched";
        matchSound.play();
      } else {
        mismatchSound.play();
      }

      setTimeout(() => {
        setTiles((prevTiles) => {
          const newTiles = prevTiles.map((tile) => ({
            ...tile,
            state: tile.state === "flipped" ? newState : tile.state,
          }));

          if (newTiles.every((tile) => tile.state === "matched")) {
            correctSound.play();
            setTimeout(end, 1000);
          }

          return newTiles;
        });
      }, 1000);
    }

    setTiles((prevTiles) => {
      return prevTiles.map((tile, index) => ({
        ...tile,
        state: i === index ? "flipped" : tile.state,
      }));
    });
  };

  return (
    <AnimatePresence>
      {isLoading ? (
        <Loading key="loading" onComplete={() => backgroundMusic.play()} />
      ) : (
        <motion.div
          key="play"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          transition={{ duration: 0.7 }}
          className="flex justify-center w-full"
        >
          <motion.div
            whileHover={{ scale: 1.5 }}
            whileTap={{ scale: 0.9 }}
            className="bg-black absolute left-[50px] top-[50px] cursor-pointer z-[2] 
            transition duration-1000 rounded-full"
            onClick={toggleDarkMode}
          >
            {darkModeIcon}
          </motion.div>

          <div className={`${isDarkMode ? "active" : ""}`}>
            <div className="absolute flex justify-center items-center left-12 top-12 w-5 h-5">
              <div
                className={`relative inset-0 scale-0 sm:w-[250vw] w-[250vh] sm:h-[250vw] h-[250vh] 
                rounded-full bg-black transition duration-1000 ease-in-out flex flex-shrink-0 flex-grow-0 ${
                  isDarkMode ? "scale-100" : ""
                }`}
              ></div>
            </div>
          </div>

          <div className="absolute">
            <div className={`${bothclasses}`}>
              <p className="text-indigo-500 font-medium text-lg">
                Tries{" "}
                <span className="ml-1 bg-indigo-200 rounded-md px-2">
                  {tryCount}
                </span>{" "}
              </p>
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="rounded-lg bg-indigo-50 grid grid-cols-4 p-3 gap-3 place-items-center w-full"
              >
                {tiles.map((tile, i) => (
                  <Tile key={i} flip={() => flip(i)} {...tile} />
                ))}
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
