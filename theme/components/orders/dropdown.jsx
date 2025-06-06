import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import OutsideClickHandler from "react-outside-click-handler";
import styles from "./styles/dropdown.less";
import { useNavigate, useGlobalTranslation } from "fdk-core/utils";
import RadioIcon from "../../assets/images/radio";
import ArrowDropdownIcon from "../../assets/images/arrow-dropdown-black.svg";

function Dropdown({ type, selectedOption, dropdownData }) {
  const { t } = useGlobalTranslation("translation");
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const openDropdown = () => {
    setIsOpen(!isOpen);
  };
  const replaceQueryParam = (key, value) => {
    const querParams = new URLSearchParams(location.search);
    querParams.set(key, value);
    navigate("/profile/orders" + (querParams?.toString() ? `?${querParams.toString()}` : ""));
    close();
    getOrderDataWithFilterQuery();
  };
  const getOrderDataWithFilterQuery = () => { };
  const replaceQuery = (option) => {
    switch (type) {
      case "time": {
        replaceQueryParam("selected_date_filter", option.value);
        break;
      }
      case "status": {
        replaceQueryParam("status", option.value);
        break;
      }
      default:
        break;
    }
  };
  const close = () => {
    setIsOpen(false);
  };
  return (
    <OutsideClickHandler onOutsideClick={() => setIsOpen(false)}>
      <div className={`${styles.selected}`} onClick={openDropdown}>
      {selectedOption?.startsWith(".resource") ? t(selectedOption) : selectedOption}
        <ArrowDropdownIcon onBlur={close} />
        {isOpen && (
          <ul className={`${styles.menu}`}>
            {dropdownData.map((option, index) => (
              <li key={index} onClick={() => replaceQuery(option)}>
                <RadioIcon checked={option.is_selected} />
                <span>{option?.display?.startsWith('resource.') ? t(option.display) : option.display}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </OutsideClickHandler>
  );
}

export default Dropdown;
