import React, { useEffect, useState, useMemo } from "react";
import Slider from "react-slick";
import styles from "../styles/sections/collections-listing.less";
import SliderRightIcon from "../assets/images/glide-arrow-right.svg";
import SliderLeftIcon from "../assets/images/glide-arrow-left.svg";
import { isRunningOnClient } from "../helper/utils";
import { COLLECTION } from "../queries/collectionsQuery";
import { useGlobalStore, useFPI } from "fdk-core/utils";
import placeholderImage from "../assets/images/placeholder/collections-listing.png";
import CollectionCard from "../components/collection-card/collection-card";
import { useWindowWidth } from "../helper/hooks";

export function Component({ props, blocks, globalConfig, id: sectionId }) {
  const fpi = useFPI();
  const {
    heading,
    description,
    layout_mobile,
    layout_desktop,
    per_row,
    img_container_bg,
    padding_top,
    padding_bottom,
  } = props;

  const itemsPerRow = Number(per_row?.value ?? 3);

  const windowWidth = useWindowWidth();
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

  const getImgSrcSet = () => {
    if (globalConfig?.img_hd) {
      return [];
    }
    return [
      { breakpoint: { min: 1728 }, width: Math.round(3564 / itemsPerRow) },
      { breakpoint: { min: 1512 }, width: Math.round(3132 / itemsPerRow) },
      { breakpoint: { min: 1296 }, width: Math.round(2700 / itemsPerRow) },
      { breakpoint: { min: 1080 }, width: Math.round(2250 / itemsPerRow) },
      { breakpoint: { min: 900 }, width: Math.round(1890 / itemsPerRow) },
      { breakpoint: { min: 720 }, width: Math.round(1530 / 3) },
      { breakpoint: { min: 540 }, width: Math.round(1170 / 3) },
      { breakpoint: { min: 360 }, width: Math.round(810) },
      { breakpoint: { min: 180 }, width: Math.round(450) },
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
    paddingTop: `${padding_top?.value ?? 16}px`,
    paddingBottom: `${padding_bottom?.value ?? 16}px`,
    "--bg-color": `${img_container_bg?.value || "#00000000"}`,
    maxWidth: "100vw",
  };

  return (
    <section className={styles.collections__template} style={dynamicStyles}>
      <div className={`fx-title-block ${styles["section-title-block"]}`}>
        <h2 className={`fx-title ${styles["section-title"]} fontHeader`}>
          {heading?.value}
        </h2>
        <p className={`fx-description ${styles["section-description"]}`}>
          {description.value}
        </p>
      </div>
      {!isLoading && showStackedView() && (
        <div className={styles.collectionGrid} style={getColumns()}>
          {collectionsForStackedView?.map((card, index) => (
            <CollectionItem
              key={`${card?.data?.collection?.name}_${index}`}
              collection={card?.data?.collection}
              props={props}
              srcset={getImgSrcSet()}
              defer={index >= per_row?.value}
            />
          ))}
        </div>
      )}
      {!isLoading && showScrollView() && collectionsForScrollView?.length && (
        <div
          className={`${styles.collectionSlider} ${collectionsForScrollView?.length === 1 && styles.singleItem}`}
          style={{
            "--slick-dots": `${Math.ceil(collectionsForScrollView?.length / per_row?.value) * 22 + 10}px`,
          }}
        >
          <Slider {...config} className={`${styles.hideOnMobile}`}>
            {collectionsForScrollView?.map((card, index) => (
              <CollectionItem
                className={styles.sliderItem}
                key={`${card?.data?.collection?.name}_${index}`}
                collection={card?.data?.collection}
                props={props}
                srcset={getImgSrcSet()}
                defer={index >= per_row?.value}
              />
            ))}
          </Slider>
          <Slider {...configMobile} className={`${styles.hideOnDesktop}`}>
            {collectionsForScrollView?.map((card, index) => (
              <CollectionItem
                className={styles.sliderItem}
                key={`${card?.data?.collection?.name}_${index}`}
                collection={card?.data?.collection}
                props={props}
                srcset={getImgSrcSet()}
                defer={index >= 1}
              />
            ))}
          </Slider>
        </div>
      )}
      {!isLoading && isDemoBlock() && (
        <div className={`${styles.collectionGrid} ${styles.defaultGrid}`}>
          {["Featured Products", "New Arrivals", "Best Sellers"].map(
            (item, index) => (
              <CollectionItem
                key={`default_${index}`}
                collection={{ name: item }}
                props={props}
                srcset={getImgSrcSet()}
                defer={false}
              />
            )
          )}
        </div>
      )}
    </section>
  );
}

const CollectionItem = ({
  className = "",
  props,
  collection,
  srcset,
  defer = false,
}) => {
  const { img_fill, img_container_bg, button_text, name_placement } = props;
  return (
    <div className={`fx-collection-card ${className}`}>
      <CollectionCard
        collectionName={collection?.name}
        collectionImage={collection?.banners?.portrait?.url || placeholderImage}
        collectionAction={collection?.action}
        buttonText={button_text?.value}
        isNameOverImage={name_placement?.value === "inside"}
        imageProps={{
          backgroundColor: img_container_bg?.value,
          isImageFill: img_fill?.value,
          aspectRatio: 0.8,
          sources: srcset,
          defer,
        }}
      />
    </div>
  );
};

export const settings = {
  label: "t:resource.sections.collections_listing.collections_listing",
  props: [
    {
      type: "text",
      id: "heading",
      default: "t:resource.default_values.collects_listing_heading",
      label: "t:resource.common.heading",
      info: "t:resource.common.section_heading_text",
    },
    {
      type: "textarea",
      id: "description",
      default: "t:resource.default_values.collects_listing_description",
      label: "t:resource.common.description",
      info: "t:resource.common.section_description_text",
    },
    {
      id: "layout_mobile",
      type: "select",
      options: [
        {
          value: "stacked",
          text: "t:resource.common.stack",
        },
        {
          value: "horizontal",
          text: "t:resource.common.horizontal",
        },
      ],
      default: "horizontal",
      label: "t:resource.sections.collections_listing.layout_mobile",
      info: "t:resource.common.alignment_of_content",
    },
    {
      id: "layout_desktop",
      type: "select",
      options: [
        {
          value: "grid",
          text: "t:resource.common.stack",
        },
        {
          value: "horizontal",
          text: "t:resource.common.horizontal",
        },
      ],
      default: "horizontal",
      label: "t:resource.sections.collections_listing.layout_desktop",
      info: "t:resource.common.alignment_of_content",
    },
    {
      type: "select",
      id: "name_placement",
      label: "Collection Title & Button Placement",
      default: "inside",
      info: "Place collection title and button inside or outside the image",
      options: [
        {
          value: "inside",
          text: "Inside the image",
        },
        {
          value: "outside",
          text: "Outside the image",
        },
      ],
    },
    {
      type: "select",
      id: "name_placement",
      label: "Collection Title & Button Placement",
      default: "inside",
      info: "Place collection title and button inside or outside the image",
      options: [
        {
          value: "inside",
          text: "Inside the image",
        },
        {
          value: "outside",
          text: "Outside the image",
        },
      ],
    },
    {
      type: "text",
      id: "button_text",
      default: "t:resource.default_values.shop_now",
      label: "t:resource.common.button_text",
    },
    {
      type: "range",
      id: "per_row",
      label: "t:resource.sections.collections_listing.collections_per_row_desktop",
      min: "3",
      max: "4",
      step: "1",
      info: "t:resource.common.not_applicable_for_mobile",
      default: "3",
    },
    {
      type: "color",
      id: "img_container_bg",
      category: "t:resource.common.image_container",
      default: "#00000000",
      label: "t:resource.common.container_background_color",
      info: "t:resource.common.image_container_bg_color",
    },
    {
      type: "checkbox",
      id: "img_fill",
      category: "t:resource.common.image_container",
      default: true,
      label: "t:resource.common.fit_image_to_container",
      info: "t:resource.common.clip_image_to_fit_container",
    },
    {
      type: "range",
      id: "padding_top",
      min: 0,
      max: 100,
      step: 1,
      unit: "px",
      label: "Top padding",
      default: 16,
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
  blocks: [
    {
      type: "collection-item",
      name: "t:resource.sections.collections_listing.collection_item",
      props: [
        {
          type: "collection",
          id: "collection",
          label: "t:resource.sections.collections_listing.select_collection",
        },
      ],
    },
  ],
  preset: {
    blocks: [
      {
        name: "t:resource.sections.collections_listing.collection_1",
      },
      {
        name: "t:resource.sections.collections_listing.collection_2",
      },
      {
        name: "t:resource.sections.collections_listing.collection_3",
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
