import React, { useEffect, useState } from "react";
import Loader from "../../../../components/loader/loader";
import styles from "./viewer-3d.less";
import { isRunningOnClient } from "../../../../helper/utils";
import { loadModelViewer } from "./modalViewerLoader";

function Viewer3D({ src, prompt, autoRotate, children }) {
  const [isModalViewerLoaded, setIsModalViewerLoaded] = useState(false);
  useEffect(() => {
    if (isRunningOnClient) {
      loadModelViewer()
        .catch(console.error)
        .finally(() => {
          setIsModalViewerLoaded(true);
        })
        .catch(console.error);
    }
  }, []);

  return isModalViewerLoaded ? (
    <model-viewer
      src={src}
      camera-controls
      auto-rotate
      disable-pan
      className={styles.viewer3d}
    />
  ) : (
    <Loader />
  );
}

export default Viewer3D;
