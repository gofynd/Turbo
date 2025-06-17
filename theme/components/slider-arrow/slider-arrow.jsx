import React from "react";
import RightArrow from "../../assets/images/slide-arrow-right.svg";
import LeftArrow from "../../assets/images/slide-arrow-left.svg";
import styles from "./slider-arrow.less";

export const SliderNextArrow = (props) => {
  const { onClick } = props;
  return (
    <div className={`slick-next ${styles.slickArrow}`} onClick={onClick}>
      <RightArrow />
    </div>
  );
};

export const SliderPrevArrow = (props) => {
  const { onClick } = props;
  return (
    <div className={`slick-prev ${styles.slickArrow}`} onClick={onClick}>
      <LeftArrow />
    </div>
  );
};
