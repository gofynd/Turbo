import React, { useEffect, useState, useMemo } from "react";
import { FDKLink } from "fdk-core/components";
import { convertActionToUrl } from "@gofynd/fdk-client-javascript/sdk/common/Utility";
import Slider from "react-slick";
import styles from "../styles/sections/collections-listing.less";
import SliderRightIcon from "../assets/images/glide-arrow-right.svg";
import SliderLeftIcon from "../assets/images/glide-arrow-left.svg";
import { isRunningOnClient, throttle } from "../helper/utils";
import { COLLECTION } from "../queries/collectionsQuery";
import { useGlobalStore, useFPI } from "fdk-core/utils";
import placeholderImage from "../assets/images/placeholder/collections-listing.png";
import FyImage from "@gofynd/theme-template/components/core/fy-image/fy-image";
import "@gofynd/theme-template/components/core/fy-image/fy-image.css";

export function Component({ props, blocks, globalConfig, id: sectionId }) {
  const fpi = useFPI();
  const {
    heading,
    description,
    layout_mobile,
    layout_desktop,
    button_text,
    per_row,
    img_container_bg,
    img_fill,
  } = props;

  const [windowWidth, setWindowWidth] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const collectionCustomValue =
    useGlobalStore(fpi?.getters?.CUSTOM_VALUE) ?? {};
  const collectionIds = useMemo(() => {
    return (
      blocks?.reduce(
        (acc, b) =>
          b?.props?.collection?.value
            ? [...acc, b?.props?.collection?.value]
            : acc,
        []
      ) || []
    );
  }, [blocks]);
  const customSectionId = collectionIds?.join("__");
  const collections =
    collectionCustomValue[`collectionData-${customSectionId}`];

  useEffect(() => {
    if (isRunningOnClient()) {
      setWindowWidth(window?.innerWidth);
    }
    const fetchCollections = async () => {
      if (!collections?.length && collectionIds?.length) {
        try {
          const promisesArr = collectionIds?.map((slug) =>
            fpi.executeGQL(COLLECTION, {
              slug: slug.split(" ").join("-"),
            })
          );
          const responses = await Promise.all(promisesArr);
          fpi.custom.setValue(`collectionData-${customSectionId}`, responses);
        } catch (err) {
          // console.log(err);
        }
      }
    };
    fetchCollections();
  }, [collectionIds]);

  const isDemoBlock = () => {
    if (
      collectionsForScrollView?.length > 0 ||
      collectionsForStackedView.length > 0
    ) {
      return false;
    }
    const collections =
      blocks?.reduce(
        (acc, b) =>
          b?.props?.collection?.value
            ? [...acc, b?.props?.collection?.value]
            : acc,
        []
      ) || [];
    return collections?.length === 0;
  };

  useEffect(() => {
    const handleResize = throttle(() => {
      setWindowWidth(isRunningOnClient() ? window.innerWidth : 0);
    }, 500);

    if (isRunningOnClient()) {
      window.addEventListener("resize", handleResize);
      handleResize();
    }

    return () => {
      if (isRunningOnClient()) {
        window.removeEventListener("resize", handleResize);
      }
    };
  }, []);

  const getImgSrcSet = () => {
    if (globalConfig?.img_hd) {
      return [];
    }
    return [
      {
        breakpoint: { min: 1023 },
        width: 500,
      },
      {
        breakpoint: { min: 481 },
        width: 416,
      },
      {
        breakpoint: { max: 480 },
        width: 480,
      },
    ];
  };

  const collectionsForStackedView = useMemo(() => {
    if (collections && collections?.length) {
      const totalItems = (per_row?.value ?? 3) * 2;
      return collections.slice(0, totalItems);
    }
  return [];
}, [collections, per_row]);


  const collectionsForScrollView = useMemo(() => {
    if (!isRunningOnClient()) {
      return collections?.slice(0, per_row?.value);
    }
    const totalItems = 12;
    if (collections && collections?.length) {
      return collections.slice(0, totalItems);
    }

    return [];
  }, [collections, per_row]);

  const showStackedView = () => {
    const hasCollection = (collectionsForStackedView || [])?.length > 0;
    if (
      collectionsForScrollView?.length === 1 &&
      layout_desktop?.value === "grid"
    ) {
      return true;
    }
    if (windowWidth <= 768) {
      return hasCollection && layout_mobile?.value === "stacked";
    }
    return hasCollection && layout_desktop?.value === "grid";
  };

  const showScrollView = () => {
    const hasCollection = (collectionsForScrollView || [])?.length > 0;
    if (windowWidth <= 768) {
      return hasCollection && layout_mobile?.value === "horizontal";
    }
    return hasCollection && layout_desktop?.value === "horizontal";
  };
  const getColumns = () => {
    const itemsPerRow = per_row?.value;
    return {
      "--grid-columns": itemsPerRow || 1,
    };
  };

  const [config, setConfig] = useState({
    dots: collectionsForScrollView?.length > per_row?.value,
    speed:
      collectionsForScrollView?.length / Number(per_row?.value) > 2 ? 700 : 400,
    slidesToShow: Number(per_row?.value),
    slidesToScroll: Number(per_row?.value),
    swipeToSlide: true,
    autoplay: false,
    autoplaySpeed: 3000,
    infinite: collectionsForScrollView?.length > Number(per_row?.value),
    cssEase: "linear",
    arrows: collectionsForScrollView?.length > per_row?.value,
    nextArrow: <SliderRightIcon />,
    prevArrow: <SliderLeftIcon />,
    responsive: [
      {
        breakpoint: 780,
        settings: {
          speed: 400,
          arrows: false,
          slidesToShow: 3,
          slidesToScroll: 3,
        },
      },
    ],
  });

  const configMobile = useMemo(
    () => ({
      dots: false,
      speed: 400,
      slidesToShow: 1,
      slidesToScroll: 1,
      swipeToSlide: true,
      autoplay: false,
      autoplaySpeed: 3000,
      infinite: collectionsForScrollView?.length > 1,
      arrows: false,
      nextArrow: <SliderRightIcon />,
      prevArrow: <SliderLeftIcon />,
      centerMode: collectionsForScrollView?.length > 1,
      centerPadding: "25px",
      cssEase: "linear",
    }),
    [collectionsForScrollView]
  );

  useEffect(() => {
    if (config.arrows !== collectionsForScrollView?.length > per_row?.value) {
      setConfig((prevConfig) => ({
        ...prevConfig,
        arrows: collectionsForScrollView?.length > per_row?.value,
        dots: collectionsForScrollView?.length > per_row?.value,
      }));
    }
  }, [collectionsForScrollView]);

  const dynamicStyles = {
    paddingTop: "16px",
    paddingBottom: `16px`,
    "--bg-color": `${img_container_bg?.value || "#00000000"}`,
    maxWidth: "100vw",
  };

  return (
    <div style={dynamicStyles} className={styles.collections__template}>
      <div>
        <div className={styles["section-title-block"]}>
          <h2 className={`${styles["section-title"]} fontHeader`}>
            {heading?.value}
          </h2>
          <p className={`${styles["section-description"]} fontBody`}>
            {description.value}
          </p>
        </div>
        {!isLoading && showStackedView() && (
          <div className={styles["collection-grid"]} style={getColumns()}>
            {collectionsForStackedView?.map((card, index) => (
              <div
                key={`COLLECTIONS${index}`}
                className={styles["collection-block"]}
                style={{ "--delay": `${150 * (index + 1)}ms` }}
              >
                <div className={styles["card-img"]} data-cardtype="COLLECTIONS">
                  <FDKLink
                    to={convertActionToUrl(card?.data?.collection?.action)}
                    className={styles["button-font"]}
                  >
                    <FyImage
                      backgroundColor={img_container_bg?.value}
                      isImageFill={img_fill?.value}
                      src={
                        card?.data?.collection?.banners?.portrait?.url ||
                        placeholderImage
                      }
                      aspectRatio={0.8}
                      mobileAspectRatio={0.8}
                      customClass={styles.imageGallery}
                      sources={getImgSrcSet()}
                      alt=""
                      defer={index <= per_row?.value ? false : true}
                    />
                    <div className={styles["collection-title-block"]}>
                      <div className={styles.background}></div>
                      {card?.data?.collection?.name && (
                        <h3
                          className={styles["collection-title"]}
                          title={card?.data?.collection?.name}
                        >
                          {card?.data?.collection?.name}
                        </h3>
                      )}
                      {button_text?.value?.length > 0 && (
                        <span
                          title={button_text?.value}
                          className={`${styles["collection-button"]}`}
                        >
                          {button_text?.value}
                        </span>
                      )}
                    </div>
                  </FDKLink>
                </div>
              </div>
            ))}
          </div>
        )}
        {!isLoading && showScrollView() && collectionsForScrollView?.length && (
          <>
            <div
              className={`${styles["collection-horizontal"]} ${collectionsForScrollView?.length === 1 && styles["single-card"]}`}
            >
              <div
                style={{
                  "--slick-dots": `${Math.ceil(collectionsForScrollView?.length / per_row?.value) * 22 + 10}px`,
                }}
              >
                <Slider
                  {...config}
                  className={`${styles["custom-slick-list"]} ${collectionsForScrollView?.length <= per_row?.value ? "no-nav" : ""} ${styles.hideOnMobile}`}
                >
                  {collectionsForScrollView?.map((card, index) => (
                    <div
                      key={`COLLECTIONS${index}`}
                      className={`${styles["collection-block"]} ${styles["custom-slick-slide"]}`}
                      style={{ "--delay": `${150 * (index + 1)}ms` }}
                    >
                      <div
                        data-cardtype="COLLECTIONS"
                        className={`${styles["pos-relative"]} ${collectionsForScrollView?.length < 3 && styles["single-card-view"]}`}
                      >
                        <FDKLink
                          to={convertActionToUrl(
                            card?.data?.collection?.action
                          )}
                          key={index}
                        >
                          <FyImage
                            backgroundColor={img_container_bg?.value}
                            isImageFill={img_fill?.value}
                            aspectRatio={0.8}
                            mobileAspectRatio={0.8}
                            customClass={styles.imageGallery}
                            src={
                              card?.data?.collection?.banners?.portrait?.url ||
                              placeholderImage
                            }
                            sources={getImgSrcSet()}
                            defer={index <= per_row?.value ? false : true}
                          />
                          <div className={styles["collection-title-block"]}>
                            <div className={styles.background}></div>
                            <h3
                              className={`${styles["collection-title"]}`}
                              title={card?.data?.collection?.name}
                            >
                              {card?.data?.collection?.name}
                            </h3>
                            {button_text?.value?.length > 0 && (
                              <span
                                title={button_text?.value}
                                className={`${styles["collection-button"]}`}
                              >
                                {button_text?.value}
                              </span>
                            )}
                          </div>
                        </FDKLink>
                      </div>
                    </div>
                  ))}
                </Slider>
                <Slider
                  {...configMobile}
                  className={`${styles["custom-slick-list"]} ${collectionsForScrollView?.length <= per_row?.value ? "no-nav" : ""}   ${styles.hideOnDesktop}`}
                >
                  {collectionsForScrollView?.map((card, index) => (
                    <div
                      key={`COLLECTIONS${index}`}
                      className={`${styles["collection-block"]} ${styles["custom-slick-slide"]}`}
                      style={{ "--delay": `${150 * (index + 1)}ms` }}
                    >
                      <div
                        data-cardtype="COLLECTIONS"
                        className={`${styles["pos-relative"]} ${collectionsForScrollView?.length < 3 && styles["single-card-view"]}`}
                      >
                        <FDKLink
                          to={convertActionToUrl(
                            card?.data?.collection?.action
                          )}
                          key={index}
                        >
                          <FyImage
                            backgroundColor={img_container_bg?.value}
                            isImageFill={img_fill?.value}
                            aspectRatio={0.8}
                            mobileAspectRatio={0.8}
                            customClass={styles.imageGallery}
                            src={
                              card?.data?.collection?.banners?.portrait?.url ||
                              placeholderImage
                            }
                            sources={getImgSrcSet()}
                            defer={index <= per_row?.value ? false : true}
                          />
                          <div className={styles["collection-title-block"]}>
                            <div className={styles.background}></div>
                            <h3
                              className={`${styles["collection-title"]}`}
                              title={card?.data?.collection?.name}
                            >
                              {card?.data?.collection?.name}
                            </h3>
                            {button_text?.value?.length > 0 && (
                              <span
                                title={button_text?.value}
                                className={`${styles["collection-button"]}`}
                              >
                                {button_text?.value}
                              </span>
                            )}
                          </div>
                        </FDKLink>
                      </div>
                    </div>
                  ))}
                </Slider>
              </div>
            </div>
          </>
        )}
        {!isLoading && isDemoBlock() && (
          <div className={styles.defaultGrid}>
            {["Featured Products", "New Arrivals", "Best Sellers"].map(
              (index) => (
                <div key={`COLLECTIONS${index}`}>
                  <div className={styles["collection-block"]}>
                    <div className="card-img" data-cardtype="COLLECTIONS">
                      <FyImage
                        backgroundColor={img_container_bg?.value}
                        isImageFill={img_fill?.value}
                        src={placeholderImage}
                        aspectRatio={0.8}
                        mobileAspectRatio={0.8}
                        customClass={styles.imageGallery}
                        alt=""
                        sources={getImgSrcSet()}
                      />
                      <div className={styles["collection-title-block"]}>
                        <div className={styles.background}></div>
                        <h3
                          className={`${styles["collection-title"]}`}
                          title={`${index}`}
                        >
                          {`${index}`}
                        </h3>
                        {button_text?.value?.length > 0 && (
                          <span
                            title={button_text?.value}
                            className={`${styles["collection-button"]}`}
                          >
                            {button_text?.value}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export const settings = {
  label: "Collections Highlights",
  props: [
    {
      type: "text",
      id: "heading",
      default: "Explore Our Collections",
      label: "Heading",
      info: "Heading text of the section",
    },
    {
      type: "textarea",
      id: "description",
      default:
        "Organize your products into these collections to help customers easily find what they're looking for. Each category can showcase a different aspect of your store's offerings.",
      label: "Description",
      info: "Description text of the section",
    },
    {
      id: "layout_mobile",
      type: "select",
      options: [
        {
          value: "stacked",
          text: "Stack",
        },
        {
          value: "horizontal",
          text: "Horizontal",
        },
      ],
      default: "horizontal",
      label: "Layout(Mobile)",
      info: "Alignment of content",
    },
    {
      id: "layout_desktop",
      type: "select",
      options: [
        {
          value: "grid",
          text: "Stack",
        },
        {
          value: "horizontal",
          text: "Horizontal",
        },
      ],
      default: "horizontal",
      label: "Layout(Desktop)",
      info: "Alignment of content",
    },
    {
      type: "text",
      id: "button_text",
      default: "Shop Now",
      label: "Button Text",
    },
    {
      type: "range",
      id: "per_row",
      label: "Display collections per row (desktop)",
      min: "3",
      max: "4",
      step: "1",
      info: "It'll not work for mobile layout",
      default: "3",
    },
    {
      type: "color",
      id: "img_container_bg",
      category: "Image Container",
      default: "#00000000",
      label: "Container Background Color",
      info: "This color will be used as the container background color of the Product/Collection/Category/Brand images wherever applicable",
    },
    {
      type: "checkbox",
      id: "img_fill",
      category: "Image Container",
      default: true,
      label: "Fit image to the container",
      info: "If the image aspect ratio is different from the container, the image will be clipped to fit the container. The aspect ratio of the image will be maintained",
    },
  ],
  blocks: [
    {
      type: "collection-item",
      name: "Collection Item",
      props: [
        {
          type: "collection",
          id: "collection",
          label: "Select Collection",
        },
      ],
    },
  ],
  preset: {
    blocks: [
      {
        name: "Collection 1",
      },
      {
        name: "Collection 2",
      },
      {
        name: "Collection 3",
      },
    ],
  },
};

Component.serverFetch = async ({ fpi, blocks, id }) => {
  try {
    const ids = [];
    const promisesArr = blocks?.map(async (block) => {
      if (block.props?.collection?.value) {
        const slug = block.props.collection.value;
        ids.push(slug);
        return fpi.executeGQL(COLLECTION, {
          slug: slug.split(" ").join("-"),
        });
      }
    });
    const responses = await Promise.all(promisesArr);
    return fpi.custom.setValue(`collectionData-${ids?.join("__")}`, responses);
  } catch (err) {
    // console.log(err);
  }
};
export default Component;
