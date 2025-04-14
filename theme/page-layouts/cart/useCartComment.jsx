import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { debounce } from "../../helper/utils";
import { CART_META_UPDATE } from "../../queries/cartQuery";

const useCartComment = ({ fpi, cartData }) => {
  const [comment, setComment] = useState(cartData.comment);
  const [searchParams] = useSearchParams();

  const buyNow = JSON.parse(searchParams?.get("buy_now") || "false");

  useEffect(() => {
    setComment(cartData.comment);
  }, [cartData]);

  const updateComment = (comm) => {
    if (comm?.length > 500) return;
    const payload = {
      updateCartMetaId: cartData.id?.toString(),
      cartMetaRequestInput: {
        comment: comm?.toString(),
      },
      buyNow,
    };
    fpi.executeGQL(CART_META_UPDATE, payload);
  };

  /* eslint-disable-next-line react-hooks/exhaustive-deps */
  const debounceUpdate = useCallback(
    debounce((newComment) => {
      updateComment(newComment);
    }, 500),
    []
  );

  const onCommentChange = (comm) => {
    setComment(comm);
    debounceUpdate(comm);
  };

  return {
    comment,
    onCommentChange,
  };
};

export default useCartComment;
