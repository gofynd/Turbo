import { useState, useEffect } from "react";
import { isRunningOnClient, throttle } from "../utils";

export const useWindowWidth = () => {
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    if (isRunningOnClient()) {
      const handleResize = throttle(() => {
        setWindowWidth(window.innerWidth);
      }, 1500);
      setWindowWidth(window.innerWidth);
      window.addEventListener("resize", handleResize);
      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }
  }, []);

  return windowWidth;
};
