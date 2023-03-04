"use client"
import React, { useState, useMemo, useRef, useEffect } from "react";
import TinderCard from "react-tinder-card";
import { BsHeart, BsHeartFill } from "react-icons/bs";
import { CgUndo } from "react-icons/cg";
import { RxCross2 } from "react-icons/rx";
import Link from "next/link";
const db: { name: String; url: String }[] = [
  {
    name: "Richard Hendricks",
    url: "./richard.jpg",
  },
  {
    name: "Erlich Bachman",
    url: "./erlich.jpg",
  },
  {
    name: "Monica Hall",
    url: "./monica.jpg",
  },
  {
    name: "Jared Dunn",
    url: "./jared.jpg",
  },
  {
    name: "Dinesh Chugtai",
    url: "./dinesh.jpg",
  },
];


function Advanced() {
  const [lastDirection, setLastDirection] = useState();
  const [recs, setRecs] = useState([])
  const [currentIndex, setCurrentIndex] = useState(recs.length - 1);
  // used for outOfFrame closure
  const currentIndexRef = useRef(currentIndex);

  const childRefs = useMemo(
    () =>
      Array(recs.length)
        .fill(0)
        .map((i) => React.createRef()),
    [recs.length]
  );

  const updateCurrentIndex = (val: number) => {
    setCurrentIndex(val);
    currentIndexRef.current = val;
  };

  const canGoBack = currentIndex < recs.length - 1;

  const canSwipe = currentIndex >= 0;

  // set last direction and decrease current index
  const swiped = (direction: any, nameToDelete: String, index: number) => {
    setLastDirection(direction);
    updateCurrentIndex(index - 1);
  };

  const outOfFrame = (name: String, idx: number) => {
    console.log(`${name} (${idx}) left the screen!`, currentIndexRef.current);
    // handle the case in which go back is pressed before card goes outOfFrame
    currentIndexRef.current >= idx && childRefs[idx].current.restoreCard();
    // TODO: when quickly swipe and restore multiple times the same card,
    // it happens multiple outOfFrame events are queued and the card disappear
    // during latest swipes. Only the last outOfFrame event should be considered valid
  };

  const swipe = async (dir: any) => {
    if (canSwipe && currentIndex < recs.length) {
      await childRefs[currentIndex].current.swipe(dir); // Swipe the card!
    }
  };

  // increase current index and show card
  const goBack = async () => {
    if (!canGoBack) return;
    const newIndex = currentIndex + 1;
    updateCurrentIndex(newIndex);
    await childRefs[newIndex].current.restoreCard();
  };


  useEffect(() => {
    fetch("http://localhost:5000/v1/rec?userId=640343f1017385e590c1c4b3")
    .then((res) => res.json())
    .then((data) => {
      data.length=20
      setRecs(data)
      console.log(data)
    })
  }, [])
  

  return (
    <div className="overflow-x-hidden h-screen flex items-center w-screen">
      <div className="w-[30%] border-r-2">chat section</div>
      <div className="w-[70%] h-full flex flex-col justify-center space-y-4 items-center bg-gray-100">
        <div className="cardContainer">
          {recs && Array.isArray(recs) && recs.map((character, index) => (
            <TinderCard
              ref={childRefs[index]}
              className="swipe"
              key={character.name}
              onSwipe={(dir) => swiped(dir, character.name, index)}
              onCardLeftScreen={() => outOfFrame(character.name, index)}
              preventSwipe={["up", "down"]}
            >
              <div
                style={{ backgroundImage: `url(https://xsgames.co/randomusers/avatar.php?g=${character.gender=='M'?'male':'female'})`}}
                className="card"
              >
                <Link href={`/profile/${character.id}`} className="card_name">{character.name}</Link>
              </div>
            </TinderCard>
          ))}
        </div>
        <div className="flex space-x-4">
          <button
            style={{ backgroundColor: !canSwipe && "#c3c4d3" }}
            className="text-red-700 border border-red-700 hover:bg-red-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:focus:ring-red-800"
            onClick={() => swipe("left")}
          >
            <RxCross2 className="w-5 h-5" />
          </button>
          <button
            style={{ backgroundColor: !canGoBack && "#c3c4d3" }}
            className="text-blue-700 border border-blue-700 hover:bg-blue-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:focus:ring-blue-800"
            onClick={() => goBack()}
          >
            <CgUndo className="w-5 h-5" />
          </button>
          <button
            style={{ backgroundColor: !canSwipe && "#c3c4d3" }}
            className="text-pink-700 border border-pink-700 hover:bg-pink-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-pink-300 font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center dark:border-pink-500 dark:text-pink-500 dark:hover:text-white dark:focus:pink-blue-800"
            onClick={() => swipe("right")}
          >
            <BsHeart className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Advanced;
