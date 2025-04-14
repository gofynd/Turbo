import React, { useState } from "react";

const useFilterModal = ({
  filters = [],
  resetFilters = () => {},
  handleFilterUpdate = () => {},
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => {
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const handleApplyClick = () => {
    // console.log({ sortItem });
    // handleSortUpdate(sortItem.value);
    closeModal();
  };

  const handleResetClick = () => {
    resetFilters();
    closeModal();
  };

  return {
    isOpen,
    filters,
    onCloseModalClick: closeModal,
    onResetBtnClick: handleResetClick,
    onApplyBtnClick: handleApplyClick,
    onFilterUpdate: handleFilterUpdate,
    openFilterModal: openModal,
  };
};

export default useFilterModal;
