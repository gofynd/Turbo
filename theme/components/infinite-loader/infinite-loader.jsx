import React, { useEffect, useRef } from "react";
import { isRunningOnClient } from "../../helper/utils";

const Spinner = React.lazy(
  () => import("../infinite-spinner/infinite-spinner")
);

const InfiniteLoader = ({
  children,
  isLoading,
  loader,
  loadMore,
  hasNext,
  infiniteLoaderEnabled = true,
}) => {
  const observer = useRef();
  const lastElementRef = useRef(null);

  useEffect(() => {
    if (!isRunningOnClient() || !infiniteLoaderEnabled) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNext && !isLoading) {
        loadMore();
      }
    });

    if (lastElementRef.current)
      observer.current.observe(lastElementRef.current);
    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, [isLoading, hasNext, loadMore, infiniteLoaderEnabled]);

  return (
    <>
      {children}
      {infiniteLoaderEnabled && (
        <div ref={lastElementRef}>{hasNext && (loader || <Spinner />)}</div>
      )}
    </>
  );
};

export default InfiniteLoader;
