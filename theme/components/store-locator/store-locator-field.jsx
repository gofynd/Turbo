import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import styles from "./store-locator-field.less";
import ArrowDownIcon from "../../assets/images/arrow-down.svg";
import SearchIcon from "../../assets/images/store-locator-search.svg";
import LocationIcon from "../../assets/images/store-locator-location.svg";

/**
 * StoreLocatorField Component
 *
 * A reusable input field component for store locator that supports:
 * - Text input mode (for search)
 * - Dropdown mode (for city/state selection)
 * - Icon on the right side
 * - Floating label when active
 * - Suggestions dropdown (for search mode)
 *
 * @param {string} type - Type of field: 'search' | 'dropdown'
 * @param {string} placeholder - Placeholder text
 * @param {string} value - Current value
 * @param {function} onChange - Callback when value changes
 * @param {function} onFocus - Callback when field is focused
 * @param {function} onBlur - Callback when field is blurred
 * @param {Array} options - Options for dropdown mode
 * @param {Array} suggestions - Suggestions for search mode
 * @param {function} onSuggestionClick - Callback when suggestion is clicked
 * @param {string} className - Additional CSS classes
 * @param {object} inputRef - Ref for the input element
 */
function StoreLocatorField({
  type = "search", // 'search' | 'dropdown'
  placeholder = "",
  value = "",
  onChange,
  onFocus,
  onBlur,
  options = [],
  className = "",
  inputRef,
  disabled = false,
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [query, setQuery] = useState(value || "");
  const fieldRef = useRef(null);
  const dropdownRef = useRef(null);
  const inputElementRef = useRef(null);
  const blurTimeoutRef = useRef(null);
  const isDropdownClickRef = useRef(false);

  // Use provided ref or internal ref
  const actualInputRef = inputRef || inputElementRef;

  // Sync query with value prop
  useEffect(() => {
    if (
      type === "dropdown" &&
      value &&
      typeof value === "object" &&
      value.display
    ) {
      setQuery(value.display);
    } else {
      setQuery(value || "");
    }
  }, [value, type]);

  // Memoize filtered options for dropdown mode
  const filteredOptions = useMemo(() => {
    if (type !== "dropdown" || !query) {
      return options;
    }
    const searchTerm = query.toLowerCase();
    return options.filter((option) =>
      (option.display || option).toLowerCase().includes(searchTerm)
    );
  }, [type, query, options]);

  // Memoize display value
  const displayValue = useMemo(() => {
    if (type === "dropdown") {
      if (value && typeof value === "object" && value.display) {
        return value.display;
      }
      return query;
    }
    return value;
  }, [type, value, query]);

  // Memoize isActive state
  const isActive = useMemo(
    () => isFocused || value.length > 0 || query.length > 0,
    [isFocused, value, query]
  );

  // Memoize click outside handler
  const handleClickOutside = useCallback((event) => {
    if (fieldRef.current && !fieldRef.current.contains(event.target)) {
      setIsDropdownOpen(false);
    }
  }, []);

  // Handle click outside for dropdown
  useEffect(() => {
    if (type === "dropdown" && isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [type, isDropdownOpen, handleClickOutside]);

  // Memoize event handlers
  const handleFocus = useCallback(
    (e) => {
      setIsFocused(true);
      if (type === "dropdown") {
        setIsDropdownOpen(true);
      }
      onFocus?.(e);
    },
    [type, onFocus]
  );

  const handleBlur = useCallback(
    (e) => {
      // Clear any existing timeout
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
      
      // Delay to allow click on dropdown option to register
      blurTimeoutRef.current = setTimeout(() => {
        // Don't close if user is clicking on dropdown elements
        if (isDropdownClickRef.current) {
          isDropdownClickRef.current = false;
          return;
        }
        
        setIsFocused(false);
        if (type === "dropdown" && !isDropdownClickRef.current) {
          setIsDropdownOpen(false);
        }
        onBlur?.(e);
      }, 150);
    },
    [type, onBlur]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  const handleInputChange = useCallback(
    (e) => {
      const newValue = e.target.value;
      setQuery(newValue);

      if (type === "dropdown") {
        // Clear any pending blur timeout when typing
        if (blurTimeoutRef.current) {
          clearTimeout(blurTimeoutRef.current);
        }
        
        // Filter options based on new value to determine if dropdown should open
        const hasMatches = newValue
          ? options.some((option) =>
              (option.display || option)
                .toLowerCase()
                .includes(newValue.toLowerCase())
            )
          : options.length > 0; // Show all options if empty and has options
        setIsDropdownOpen(hasMatches);
      }

      onChange?.(e);
    },
    [type, options, onChange]
  );

  const handleOptionClick = useCallback(
    (option) => {
      isDropdownClickRef.current = true;
      const displayValue = option.display || option;
      setQuery(displayValue);
      setIsDropdownOpen(false);
      setIsFocused(false);
      
      // Create a synthetic event for consistency
      const syntheticEvent = {
        target: { value: displayValue },
      };
      onChange?.(syntheticEvent);
      
      // Reset the ref after a short delay
      setTimeout(() => {
        isDropdownClickRef.current = false;
      }, 200);
    },
    [onChange]
  );

  const handleDropdownIconClick = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (type === "dropdown") {
        isDropdownClickRef.current = true;
        
        // Clear any pending blur timeout
        if (blurTimeoutRef.current) {
          clearTimeout(blurTimeoutRef.current);
        }
        
        setIsDropdownOpen((prev) => {
          const newState = !prev;
          if (newState) {
            // Opening dropdown
            setIsFocused(true);
            actualInputRef.current?.focus();
          }
          return newState;
        });
        
        // Reset the ref after a short delay
        setTimeout(() => {
          isDropdownClickRef.current = false;
        }, 200);
      }
    },
    [type, actualInputRef]
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (type === "dropdown" && isDropdownOpen) {
        if (e.key === "Escape") {
          e.preventDefault();
          setIsDropdownOpen(false);
        }
      }
    },
    [type, isDropdownOpen]
  );

  // Memoize search icon rendering
  const searchIcon = useMemo(() => {
    return <SearchIcon aria-hidden="true" className={styles.fieldIcon} />;
  }, []);

  // Memoize dropdown arrow icon rendering
  const dropdownIcon = useMemo(() => {
    return (
      <ArrowDownIcon
        className={`${styles.fieldIcon} ${styles.dropdownIcon} ${
          isDropdownOpen ? styles.dropdownIconOpen : ""
        }`}
      />
    );
  }, [isDropdownOpen]);

  // Determine if search icon should be shown (for search fields or when typing in dropdown)
  const showSearchIcon = useMemo(() => {
    if (type === "search") return true;
    if (type === "dropdown" && (isFocused || query.length > 0)) return true;
    return false;
  }, [type, isFocused, query]);

  // Memoize label text
  const labelText = useMemo(
    () => (type === "search" ? "Enter a location" : placeholder),
    [type, placeholder]
  );

  return (
    <div className={`${styles.fieldContainer} ${className}`} ref={fieldRef}>
      <div
        className={`${styles.inputWrapper} ${isActive ? styles.inputWrapperActive : ""}`}
      >
        {isActive && (
          <div className={styles.floatingLabel}>
            <p className={styles.labelText}>{labelText}</p>
          </div>
        )}
        <div className={styles.inputContent}>
          {showSearchIcon && (
            <div className={styles.iconContainer}>{searchIcon}</div>
          )}
          <input
            ref={actualInputRef}
            type="text"
            className={styles.fieldInput}
            placeholder={isActive ? "" : placeholder}
            value={displayValue}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            disabled={disabled}
          />
          {type === "dropdown" && (
            <div
              className={`${styles.iconContainer} ${styles.dropdownIconContainer}`}
              onClick={handleDropdownIconClick}
              onMouseDown={(e) => {
                // Prevent blur from firing when clicking dropdown icon
                e.preventDefault();
              }}
            >
              {dropdownIcon}
            </div>
          )}
        </div>
      </div>

      {/* Options Dropdown (for dropdown mode) */}
      {type === "dropdown" && isDropdownOpen && filteredOptions.length > 0 && (
        <div 
          className={styles.optionsDropdown} 
          ref={dropdownRef}
          onMouseDown={(e) => {
            // Prevent blur from firing when clicking dropdown
            isDropdownClickRef.current = true;
          }}
        >
          <div className={styles.optionsList}>
            {filteredOptions.map((option, index) => {
              const displayText = option.display || option;
              const optionKey = option.key ?? option ?? index;
              return (
                <div
                  key={optionKey}
                  className={styles.optionItem}
                  onClick={() => handleOptionClick(option)}
                >
                  {displayText}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default StoreLocatorField;
