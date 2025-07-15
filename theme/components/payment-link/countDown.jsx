import React, { useEffect, useState } from "react";
import Timer from "../../assets/images/timer-count-down.svg";

function CountDown({ paymentLinkData, customClassName, setLinkExpired }) {
  const [secondsLeft, setSecondsLeft] = useState(
    paymentLinkData?.polling_timeout ?? null
  );

  useEffect(() => {
    setSecondsLeft(paymentLinkData?.polling_timeout ?? null);
  }, [paymentLinkData?.polling_timeout]);

  useEffect(() => {
    if (secondsLeft === 0) {
      setLinkExpired(true);
    }
    if (secondsLeft === null || secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsLeft !== null]);

  const formatTime = (secs) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  return (
    <div>
      {secondsLeft !== null && (
        <div className={customClassName}>
          <Timer />
          <span>{formatTime(secondsLeft)}</span>
        </div>
      )}
    </div>
  );
}
export default React.memo(CountDown);
