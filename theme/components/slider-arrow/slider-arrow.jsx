import React from "react";
import RightArrow from "../../assets/images/slide-arrow-right.svg";
import LeftArrow from "../../assets/images/slide-arrow-left.svg";
import styles from "./slider-arrow.less";

export const SliderNextArrow = (props) => {
  const { onClick, nextArrowStyles } = props;
  return (
    <div
      className={` ${styles.slickArrow} ${nextArrowStyles}`}
      onClick={onClick}
    >
      <RightArrow />
    </div>
  );
};

export const SliderPrevArrow = (props) => {
  const { onClick, prevArrowStyles } = props;
  return (
    <div
      className={` ${styles.slickArrow} ${prevArrowStyles}`}
      onClick={onClick}
    >
      <LeftArrow />
    </div>
  );
};
