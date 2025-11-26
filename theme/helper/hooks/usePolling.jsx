import { useEffect, useRef } from "react";

export const usePolling = ({
  apiFn,
  intervals,
  conditionFn,
  maxTries = null,
  autoStart = false,
}) => {
  const currentIntervalIndex = useRef(0);
  const scheduledTimeoutId = useRef(null);
  const attemptsCount = useRef(0);
  const isPollingActive = useRef(false);
  const isExecuting = useRef(false);

  const conditionFnRef = useRef(conditionFn);
  useEffect(() => {
    conditionFnRef.current = conditionFn;
  }, [conditionFn]);

  const executePolling = async () => {
    if (!isPollingActive.current || isExecuting.current) return;
    isExecuting.current = true;

    attemptsCount.current += 1;
    console.log(
      `Polling attempt: ${attemptsCount.current}${maxTries ? ` of ${maxTries}` : ""}`
    );

    try {
      await apiFn();
    } catch (error) {
      console.error("Error while polling API:", error);
    }

    const shouldContinuePolling = conditionFnRef.current
      ? await Promise.resolve(conditionFnRef.current())
      : true;

    if (!shouldContinuePolling) {
      console.log("Polling stopped: Condition function returned false");
      stopPolling();
      return;
    }

    if (maxTries !== null && attemptsCount.current >= maxTries) {
      console.log(`Polling stopped: Max tries (${maxTries}) reached`);
      stopPolling();
      return;
    }

    const delayInSeconds =
      intervals[currentIntervalIndex.current] ||
      intervals[intervals.length - 1];

    currentIntervalIndex.current = Math.min(
      currentIntervalIndex.current + 1,
      intervals.length - 1
    );

    scheduledTimeoutId.current = setTimeout(() => {
      isExecuting.current = false;
      executePolling();
    }, delayInSeconds * 1000);
  };

  const startPolling = () => {
    if (isPollingActive.current || !intervals.length) return;

    isPollingActive.current = true;
    attemptsCount.current = 0;
    currentIntervalIndex.current = 0;
    executePolling();
  };

  const stopPolling = () => {
    isPollingActive.current = false;
    isExecuting.current = false;
    if (scheduledTimeoutId.current) {
      clearTimeout(scheduledTimeoutId.current);
    }
    currentIntervalIndex.current = 0;
    attemptsCount.current = 0;
  };

  useEffect(() => {
    if (autoStart) {
      startPolling();
    }

    return () => {
      stopPolling();
    };
  }, [autoStart, apiFn, intervals, maxTries]);

  return {
    startPolling,
    stopPolling,
    get isPolling() {
      return isPollingActive.current;
    },
    get attempts() {
      return attemptsCount.current;
    },
  };
};
