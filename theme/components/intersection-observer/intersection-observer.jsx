import React, { useState, useEffect, useRef } from "react";
import { isRunningOnClient } from "../../helper/utils";

const IntersectionObserverComponent = ({
  children,
  root = null,
  rootMargin = "0px",
  threshold = 0.1,
  ...props
}) => {
  const [isInView, setIsInView] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    // Ensure IntersectionObserver is available
    if (!("IntersectionObserver" in window)) {
      console.warn("IntersectionObserver is not supported by your browser.");
      setIsInView(true); // Fallback to always show content if not supported
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect(); // Stop observing once it's in view
          }
        });
      },
      {
        root,
        rootMargin,
        threshold,
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (observer && observer.disconnect) {
        observer.disconnect();
      }
    };
  }, [root, rootMargin, threshold]);

  return (
    <div ref={elementRef} {...props}>
      {isInView || !isRunningOnClient() ? children : null}
    </div>
  );
};

export default IntersectionObserverComponent;
