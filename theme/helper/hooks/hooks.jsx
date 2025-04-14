import { useGlobalStore } from "fdk-core/utils";
import { useRef, useState, useEffect } from "react";
import Snackbar from "awesome-snackbar";
import { marked } from "marked";
import DOMPurify from "dompurify";

export function useLoggedInUser(fpi) {
  return {
    userData: useGlobalStore(fpi.getters.USER_DATA),
    loggedIn: useGlobalStore(fpi.getters.LOGGED_IN),
    userFetch: useGlobalStore(fpi.getters.USER_FETCHED),
  };
}

const getBgColor = (type) => {
  if (type === "success") {
    return "var(--successBackground)";
  }
  if (type === "error") {
    return "var(--errorBackground)";
  }
  return "var(--informationBackground)";
};

const getColor = (type) => {
  if (type === "success") {
    return "var(--successText)";
  }
  if (type === "error") {
    return "var(--errorText)";
  }
  return "var(--informationText)";
};

const getSnackbarDuration = (message = "") => {
  const baseTime = 1500;
  const threshold = 30; // Characters after which extra time is added
  const extraTimePerChar = baseTime / threshold;

  const extraTime = Math.max(
    0,
    ((message?.length || 0) - threshold) * extraTimePerChar
  );

  return baseTime + extraTime;
};

export const useSnackbar = () => {
  const snackbarRef = useRef(null);

  const showSnackbar = (message, type, position = "top-right") => {
    // Dismiss the current snackbar if it exists
    if (snackbarRef?.current) {
      snackbarRef.current.hide();
    }

    // Create a new snackbar and store it in the ref
    snackbarRef.current = new Snackbar(`${message}`, {
      position,
      style: {
        container: [
          ["background-color", getBgColor(type)],
          ["word-wrap", "break-word"],
        ],
        message: [
          ["color", getColor(type)],
          ["white-space", "normal"], // Ensure text wraps properly
          ["word-break", "break-word"],
        ],
        bold: [["font-weight", "bold"]],
        actionButton: [["color", "white"]],
      },
    });

    const id = setTimeout(() => {
      snackbarRef.current.hide();
      clearTimeout(id);
    }, getSnackbarDuration(message));
  };

  return { showSnackbar };
};

export const useRichText = (htmlContent) => {
  const [clientMarkedContent, setClientMarkedContent] = useState("");

  const preprocessMarkdown = (markdown) => {
    return markdown
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/__(.*?)__/g, "<strong>$1</strong>")
      .replace(/\+\+(.*?)\+\+/g, "<u>$1</u>")
      .replace(/==(.*?)==/g, "<mark>$1</mark>")
      .replace(/~~(.*?)~~/g, "<del>$1</del>")
      .replace(/\^\^([^^]+)\^\^/g, "<sup>$1</sup>")
      .replace(/,,(.*?),,/g, "<sub>$1</sub>")
      .replace(/{{youtube:(.*?)}}/g, (match, p1) => {
        return `<iframe width="560" height="315" src="https://www.youtube.com/embed/${p1}" frameborder="0" allowfullscreen></iframe>`;
      });
  };

  useEffect(() => {
    if (htmlContent) {
      const processedContent = preprocessMarkdown(htmlContent);
      const markedContent = marked(processedContent);
      const sanitizedHtml = DOMPurify.sanitize(markedContent);
      setClientMarkedContent(sanitizedHtml);
    }
  }, []);

  return clientMarkedContent;
};

export const useSliderDotsWidth = (sliderRef, departmentCategories) => {
  const [dotsWidth, setDotsWidth] = useState(0);

  useEffect(() => {
    const updateDotsWidth = () => {
      if (sliderRef.current) {
        const slickDots = sliderRef.current.querySelector(".slick-dots");
        if (slickDots) {
          const { width } = slickDots.getBoundingClientRect();
          setDotsWidth(width);
        }
      }
    };
    setTimeout(() => {
      updateDotsWidth();
    }, 100);
    window.addEventListener("resize", updateDotsWidth);

    return () => {
      window.removeEventListener("resize", updateDotsWidth);
    };
  }, [sliderRef.current, departmentCategories]);

  return dotsWidth;
};

export const useViewport = (minBreakpoint = 0, maxBreakpoint = Infinity) => {
  const [isInRange, setIsInRange] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== "undefined") {
        const width = window?.innerWidth;
        setIsInRange(width >= minBreakpoint && width <= maxBreakpoint);
      }
    };

    handleResize();

    window?.addEventListener("resize", handleResize);
    return () => {
      window?.removeEventListener("resize", handleResize);
    };
  }, [minBreakpoint, maxBreakpoint]);

  return isInRange;
};
