/**
 * FyDropdown Component
 *
 * A customizable dropdown component that supports various options, error handling, and label configurations.
 * This component is built using React and uses CSS modules for styling.
 *
 * @param {Array<{ key: string, display: string }>} options - An array of options to display in the dropdown. Each option should have `key` and `display` properties.
 * @param {string} [label=""] - The text label displayed above or beside the dropdown.
 * @param {string} [placeholder=""] - The text shown when no option is selected.
 * @param {object} [error] - If provided, the dropdown will display an error message. The object should contain an `error.message` property.
 * @param {boolean} [required=false] - If true, the dropdown will indicate that selecting an option is mandatory.
 * @param {boolean} [showAsterik=true] - If true, an asterisk (*) will be displayed next to the label to indicate a required field.
 * @param {string} [labelClassName] - Optional custom CSS class(es) to apply to the label element.
 * @param {string} [containerClassName] - Optional custom CSS class(es) to apply to the dropdown container element.
 * @param {object} [value] - The currently selected option, should be an object with `key` and `display` properties.
 * @param {function} onChange - Callback function triggered when an option is selected. Receives the selected option object as an argument.
 *
 * @returns {JSX.Element} A customizable dropdown menu with label, error message, and various styling options.
 */

import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import styles from "./fy-dropdown-lib.less";
import ArrowDownIcon from "../../../assets/images/arrow-down.svg";
import { createPortal } from "react-dom";
import { useGlobalTranslation } from "fdk-core/utils";

const FyDropdown = ({
  options = [],
  label = "",
  placeholder = "",
  error,
  required = false,
  showAsterik = true,
  labelClassName,
  containerClassName,
  value,
  disabled = false,
  // optionLabel = "display",
  onChange = (value) => { },
  dataKey = "key",
  getOptionLabel = (option) => option.display ?? option,
}) => {
  const { t } = useGlobalTranslation("translation");
  const [selectedValue, setSelectedValue] = useState();
  const [isOpen, setIsOpen] = useState(false);
  const dropdown = useRef(null);
  const dropdownButton = useRef(null);
  const dropdownList = useRef(null);
  const [dropdownStyles, setDropdownStyles] = useState({});

  const [query, setQuery] = useState(getOptionLabel(value || {}) || "");
  const [filteredOptions, setFilteredOptions] = useState([]);
  //   const [selectedOption, setSelectedOption] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // setSelectedValue(options?.find((option) => option[dataKey] === value[dataKey]));
    setQuery(getOptionLabel(value || {}) || "");
  }, [value]);

  useEffect(() => {
    setFilteredOptions(options);
  }, [options]);

  const customLabelClassName = useMemo(
    () => `${styles.label} ${labelClassName ?? ""}`,
    [labelClassName]
  );
  const customContainerClassName = useMemo(
    () => `${styles.dropdownContainer}  ${containerClassName ?? ""}`,
    [containerClassName]
  );

  const toggleDropdown = (event) => {
    if (disabled) return;
    // event?.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  const handleClickOutside = useCallback((event) => {
    if (!dropdown?.current?.contains(event.target)) {
      setIsOpen(false);
    }
  }, []);

  const adjustDropdownMenuPosition = useCallback(() => {
    const dropdownButtonElement = dropdownButton?.current;
    const dropdownListElement = dropdownList?.current;

    if (dropdownButtonElement && dropdownListElement) {
      const buttonRect = dropdownButtonElement.getBoundingClientRect();
      const menuRect = dropdownListElement.getBoundingClientRect();

      let topPosition = buttonRect.bottom + 4;

      if (topPosition + menuRect.height > window.innerHeight) {
        topPosition = buttonRect.top - menuRect.height - 4;
      }

      setDropdownStyles({
        position: "fixed",
        top: `${topPosition}px`,
        left: `${buttonRect.left}px`,
        width: `${buttonRect?.width}px`,
      });
    }
  }, [dropdownButton?.current, dropdownList?.current]);

  const handleChange = useCallback(
    (option) => {
      setSelectedValue(option);
      onChange?.(option);
      setQuery(getOptionLabel(option));
      toggleDropdown();
    },
    [toggleDropdown]
  );

  const handleInputChange = (e) => {
    const value = e.target?.value;

    setQuery(value);
    if (value) {
      setFilteredOptions(
        options.filter((option) =>
          (getOptionLabel(option) || "")
            .toLowerCase()
            .includes(value.toLowerCase())
        )
      );
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const clearEventListeners = () => {
      window.removeEventListener("click", handleClickOutside);
      window.removeEventListener("scroll", adjustDropdownMenuPosition);
      window.removeEventListener("resize", adjustDropdownMenuPosition);
    };
    if (isOpen) {
      window.addEventListener("resize", adjustDropdownMenuPosition);
      window.addEventListener("scroll", adjustDropdownMenuPosition);
      window.addEventListener("click", handleClickOutside);
      adjustDropdownMenuPosition();
    } else {
      clearEventListeners();
    }

    return () => {
      clearEventListeners();
    };
  }, [isOpen, filteredOptions]);

  const handleClear = () => {
    setQuery("");
    setFilteredOptions(options);
    onChange?.({});
    setIsOpen(false);
  };

  const handleOptionClick = (option) => {
    setQuery(option.label);
    setIsOpen(false);
  };

  const handleBlur = () => {
    if (value) {
      setQuery(getOptionLabel(value || {}) || "");
    }
  };

  return (
    <div className={customContainerClassName}>
      {label && (
        // eslint-disable-next-line jsx-a11y/label-has-associated-control
        <label className={customLabelClassName}>
          {label}
          {required && showAsterik && <span> *</span>}
        </label>
      )}
      <div
        className={`${styles.dropdown} ${error ? styles.dropDownError : ""}`}
        ref={dropdown}
      >
        {/* <div
          className={styles.dropdownButton}
          onClick={toggleDropdown}
          ref={dropdownButton}
        >
          <span className={styles.selectedValue}>
            {selectedValue?.display || placeholder}
          </span>
          <SvgWrapper
            svgSrc="arrow-down"
            className={`${styles.dropdownIcon} ${isOpen ? styles.open : ""}`}
          />
        </div> */}
        <div
          className={styles.dropdownButton}
          disabled={disabled}
          onClick={toggleDropdown}
          ref={dropdownButton}
        >
          <input
            id="input-query"
            className={styles.text_field}
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder={placeholder}
            disabled={disabled}
            autoComplete="off"
            onBlur={handleBlur}
          />
          {/* <label className={styles.label} for="input-query" id="label-fname">
            <div className={styles.text}>First Name</div>
          </label> */}
          {/* {query && (
            <span className={styles.clear_icon} onClick={handleClear}>
              &times;
            </span>
          )} */}

          <ArrowDownIcon
            className={`${styles.dropdownIcon} ${isOpen ? styles.open : ""}`}
          />
        </div>
        {createPortal(
          <ul
            className={`${styles.dropdownList}  ${isOpen ? styles.open : ""}`}
            ref={dropdownList}
            style={dropdownStyles}
          >
            <div className={`fydrop ${styles.listWrapper}`}>
              {filteredOptions.length ? (
                filteredOptions?.map((option, index) => (
                  <li
                    className={`${styles.dropdownOption} ${styles.hover}`}
                    key={option?.[dataKey] || index}
                    onClick={() => handleChange(option)}
                  >
                    {/* {option?.[optionLabel]} */}
                    {getOptionLabel(option)}
                  </li>
                ))
              ) : (
                <li className={`${styles.dropdownOption} ${styles.noOption}`}>
                  {t("resource.common.no_options")}
                </li>
              )}
            </div>
          </ul>,
          document.body
        )}
      </div>
      {isOpen && (
        <div className={styles.emptyDiv} onClickCapture={toggleDropdown}></div>
      )}
      {error && <div className={styles.error}>{error.message}</div>}
    </div>
  );
};

export default FyDropdown;
