import React, { useState } from "react";

const useSortModal = ({ sortOn = [], handleSortUpdate = () => {} }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => {
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const handleApplyClick = (sortItem) => {
    console.log({ sortItem });
    handleSortUpdate(sortItem.value);
    closeModal();
  };

  const handleResetClick = () => {
    handleSortUpdate("");
    closeModal();
  };

  return {
    isOpen,
    sortList: sortOn,
    onCloseModalClick: closeModal,
    onResetBtnClick: handleResetClick,
    onApplyBtnClick: handleApplyClick,
    openSortModal: openModal,
  };
};

export default useSortModal;
