let modelViewerPromise;

export const loadModelViewer = () => {
  if (!modelViewerPromise) {
    modelViewerPromise = import("@google/model-viewer");
  }
  return modelViewerPromise;
};
