import React, { useMemo } from "react";
import { FDKLink } from "fdk-core/components";
import Slider from "react-slick";
import SliderRightIcon from "../assets/images/glide-arrow-right.svg";
import SliderLeftIcon from "../assets/images/glide-arrow-left.svg";
import FyImage from "fdk-react-templates/components/core/fy-image/fy-image";
import "fdk-react-templates/components/core/fy-image/fy-image.css";
import placeholderDesktop from "../assets/images/placeholder/image-slideshow-desktop.png";
import placeholderMobile from "../assets/images/placeholder/image-slideshow-mobile.png";

function getMobileImage(block) {
  return block?.mobile_image?.value || placeholderMobile;
}
function getDesktopImage(block) {
  return block?.image?.value || placeholderDesktop;
}
function getImgSrcSet(block, globalConfig) {
  if (globalConfig?.img_hd) {
    return [
      { breakpoint: { min: 501 } },
      { breakpoint: { max: 540 }, url: getMobileImage(block) },
    ];
  }
  return [
    { breakpoint: { min: 1728 }, width: 3564 },
    { breakpoint: { min: 1512 }, width: 3132 },
    { breakpoint: { min: 1296 }, width: 2700 },
    { breakpoint: { min: 1080 }, width: 2250 },
    { breakpoint: { min: 900 }, width: 1890 },
    { breakpoint: { min: 720 }, width: 1530 },
    { breakpoint: { max: 180 }, width: 450, url: getMobileImage(block) },
    { breakpoint: { max: 360 }, width: 810, url: getMobileImage(block) },
    { breakpoint: { max: 540 }, width: 1170, url: getMobileImage(block) },
  ];
}

export function Component({ props, blocks, globalConfig, preset }) {
  const blocksData = blocks.length === 0 ? preset?.blocks : blocks;
  const { autoplay, slide_interval, padding_top, padding_bottom } = props;

  const config = useMemo(
    () => ({
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
      infinite: blocksData.length > 1,
      swipeToSlide: true,
      autoplay: !!autoplay?.value,
      autoplaySpeed: (slide_interval?.value ?? 3) * 1000,
      pauseOnHover: true,
      cssEase: "linear",
      arrows: blocksData.length > 1,
      dots: blocksData.length > 1,
      nextArrow: <SliderRightIcon />,
      prevArrow: <SliderLeftIcon />,
      responsive: [
        {
          breakpoint: 800,
          settings: {
            arrows: false,
            pauseOnHover: false,
            swipe: blocksData.length > 1,
            swipeToSlide: false,
            touchThreshold: 80,
            draggable: false,
            touchMove: true,
          },
        },
      ],
    }),
    [autoplay?.value, slide_interval?.value, blocksData]
  );

  const dynamicStyles = {
    paddingTop: `${padding_top?.value ?? 0}px`,
    paddingBottom: `${padding_bottom?.value ?? 16}px`,
    "--slick-dots": `${blocksData?.length * 22 + 10}px`,
  };

  return (
    <section style={dynamicStyles}>
      <Slider
        {...config}
        initialSlide={0}
        className={blocksData?.length === 1 ? "no-nav" : ""}
      >
        {blocksData?.map((block, index) => (
          <FDKLink to={block?.props?.redirect_link?.value ?? ""} key={index}>
            <FyImage
             
              src={getDesktopImage(block?.props)}
              sources={getImgSrcSet(block?.props, globalConfig)}
              defer={index < 1 ? false : true}
              alt={`slide-${index}`}
              isFixedAspectRatio={false}
            />
          </FDKLink>
        ))}
      </Slider>
    </section>
  );
}

export const settings = {
  label: "t:resource.sections.image_slideshow.image_slideshow",
  blocks: [
    {
      name: "t:resource.common.image_card",
      type: "gallery",

      props: [
        {
          type: "image_picker",
          id: "image",
          label: "t:resource.common.desktop_image",
          default: "",
          options: {
            aspect_ratio: "16:5",
          },
        },
        {
          type: "image_picker",
          id: "mobile_image",
          label: "t:resource.common.mobile_image",
          default: "",
          options: {
            aspect_ratio: "3:4",
          },
        },
        {
          type: "url",
          id: "redirect_link",
          label: "t:resource.sections.image_slideshow.slide_link",
        },
      ],
    },
  ],
  props: [
    {
      type: "checkbox",
      id: "autoplay",
      default: true,
      label: "t:resource.common.auto_play_slides",
      info: "t:resource.sections.image_slideshow.check_to_autoplay_slides",
    },
    {
      type: "range",
      id: "slide_interval",
      min: 1,
      max: 10,
      step: 1,
      unit: "sec",
      label: "t:resource.common.change_slides_every",
      default: 3,
      info: "t:resource.sections.image_slideshow.autoplay_slide_duration",
    },
    {
      type: "range",
      id: "padding_top",
      min: 0,
      max: 100,
      step: 1,
      unit: "px",
      label: "t:resource.sections.image_slideshow.top_margin",
      default: 0,
      info: "t:resource.sections.image_slideshow.top_margin_info",
    },
    {
      type: "range",
      id: "padding_top",
      min: 0,
      max: 100,
      step: 1,
      unit: "px",
      label: "Top Margin",
      default: 0,
      info: "Top margin for section",
    },
    {
      type: "range",
      id: "padding_top",
      min: 0,
      max: 100,
      step: 1,
      unit: "px",
      label: "Top padding",
      default: 0,
      info: "Top padding for section",
    },
    {
      type: "range",
      id: "padding_bottom",
      min: 0,
      max: 100,
      step: 1,
      unit: "px",
      label: "Bottom padding",
      default: 16,
      info: "Bottom padding for section",
    },
  ],
  preset: {
    blocks: [
      {
        name: "t:resource.common.image_card",
        props: {
          image: {
            type: "image_picker",
            value: "",
          },
          mobile_image: {
            type: "image_picker",
            value: "",
          },
        },
      },
      {
        name: "t:resource.common.image_card",
        props: {
          image: {
            type: "image_picker",
            value: "",
          },
          mobile_image: {
            type: "image_picker",
            value: "",
          },
        },
      },
      {
        name: "t:resource.common.image_card",
        props: {
          image: {
            type: "image_picker",
            value: "",
          },
          mobile_image: {
            type: "image_picker",
            value: "",
          },
        },
      },
    ],
  },
};
export default Component;
