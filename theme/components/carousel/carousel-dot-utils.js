/**

 * Carousel dot helpers: sliding 5-dot viewport when there are many slides,

 * with distance-based inactive sizes (large → medium → small) so tiers stay

 * stable at list ends.

 *
 *
 * Compact inactive pattern (5-dot window): tier depends on where the active slide sits

 * in the window (rel = selectedIndex − windowStart). See getInactiveDotTier.

 */



/** @typedef {'active' | 'large' | 'medium' | 'small'} CarouselDotSizeTier */



/**

 * Shortest-path direction between two slide indices (handles wrap-around).

 * @param {number} prev

 * @param {number} curr

 * @param {number} total

 * @returns {'forward' | 'backward'}

 */

export function getCarouselNavDirection(prev, curr, total) {

  if (total <= 1 || prev === curr) {

    return "forward";

  }

  const forwardSteps = (curr - prev + total) % total;

  const backwardSteps = (prev - curr + total) % total;

  if (forwardSteps < backwardSteps) {

    return "forward";

  }

  if (backwardSteps < forwardSteps) {

    return "backward";

  }

  return "forward";

}



/**

 * Visible dot window: when total > threshold, show a sliding window of dots

 * centered on the active slide when possible; at the start/end the window

 * sticks so all 5 indices stay valid.

 *

 * @param {number} total

 * @param {number} selectedIndex

 * @param {object} [options]

 * @param {number} [options.windowSize=5]

 * @param {number} [options.threshold=5] — show full list when total <= threshold

 * @returns {{ windowStart: number, visibleIndices: number[] }}

 */

export function getCarouselDotWindow(

  total,

  selectedIndex,

  { windowSize = 5, threshold = 5 } = {}

) {

  if (total <= threshold) {

    return {

      windowStart: 0,

      visibleIndices: Array.from({ length: total }, (_, i) => i),

    };

  }



  const size = Math.min(windowSize, total);

  const maxStart = total - size;

  let windowStart = selectedIndex - Math.floor(size / 2);

  windowStart = Math.max(0, Math.min(windowStart, maxStart));

  const visibleIndices = Array.from(

    { length: size },

    (_, i) => windowStart + i

  );

  return { windowStart, visibleIndices };

}



/**

 * Inactive dot size from position in the 5-slot window vs active column `rel`.

 * Patterns (L = large tier, active = current slide):

 * - rel 0 (e.g. first slide): L L L L S — start emphasis.

 * - rel 1: M L L M S — first scroll.

 * - rel 2 steady: S M L M S.

 * - rel 3 (mirror of rel 1): S M L M at sides of active.

 * - rel 4 (last slide in window): S L L L L.

 *

 * @param {number} rel — selectedIndex − windowStart (column of active, 0..windowSize-1)

 * @param {number} posInWindow — slideIndex − windowStart

 * @returns {Exclude<CarouselDotSizeTier, 'active'>}

 */

function getInactiveDotTier(rel, posInWindow) {

  switch (rel) {

    case 0:

      return posInWindow <= 3 ? "large" : "small";

    case 1:

      if (posInWindow === 0) {

        return "medium";

      }

      if (posInWindow === 2) {

        return "large";

      }

      if (posInWindow === 3) {

        return "medium";

      }

      return "small";

    case 2:

      if (posInWindow === 0 || posInWindow === 4) {

        return "small";

      }

      if (posInWindow === 1 || posInWindow === 3) {

        return "medium";

      }

      return "small";

    case 3:

      if (posInWindow === 0) {

        return "small";

      }

      if (posInWindow === 1) {

        return "medium";

      }

      if (posInWindow === 2) {

        return "large";

      }

      return "medium";

    case 4:

      if (posInWindow === 0) {

        return "small";

      }

      return "large";

    default:

      return "small";

  }

}



/**

 * Size tier for one dot in the compact window.

 * - Active: "active" (full-size, full opacity in CSS).

 * - Inactive: tiers from the moving 5-dot window pattern (see getInactiveDotTier).

 *

 * @param {number} slideIndex

 * @param {object} ctx

 * @param {number} ctx.total

 * @param {number} ctx.selectedIndex

 * @param {number} ctx.windowStart

 * @param {number} ctx.windowSize — expected 5 when compact

 * @returns {CarouselDotSizeTier}

 */

export function getCarouselDotSizeTier(

  slideIndex,

  { total, selectedIndex, windowStart, windowSize }

) {

  if (slideIndex === selectedIndex) {

    return "active";

  }



  const rel = selectedIndex - windowStart;

  const posInWindow = slideIndex - windowStart;

  if (

    rel < 0 ||

    rel >= windowSize ||

    posInWindow < 0 ||

    posInWindow >= windowSize

  ) {

    return "small";

  }



  return getInactiveDotTier(rel, posInWindow);

}


