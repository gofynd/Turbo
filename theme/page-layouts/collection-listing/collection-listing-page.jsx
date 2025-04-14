import React from "react";
import { useParams } from "react-router-dom";
import Shimmer from "../../components/shimmer/shimmer";
import ProductListing from "@gofynd/theme-template/pages/product-listing/product-listing";
import "@gofynd/theme-template/pages/product-listing/index.css";
import useCollectionListing from "./useCollectionListing";
import { getHelmet } from "../../providers/global-provider";
import { isRunningOnClient } from "../../helper/utils";

const CollectionListingPage = ({ fpi, props = {} }) => {
  const params = useParams();
  const slug = params?.slug || props?.collection?.value;
  const listingProps = useCollectionListing({ fpi, slug, props });

  const { seo } = listingProps;

  if (listingProps?.isPageLoading && isRunningOnClient()) {
    return <Shimmer />;
  }

  return (
    <>
      {getHelmet({ seo })}
      <div className="margin0auto basePageContainer">
        <ProductListing {...listingProps} />
      </div>
    </>
  );
};

export default CollectionListingPage;
