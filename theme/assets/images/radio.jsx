import React from 'react'

function RadioIcon({ checked = false, ...props }) {
  if (checked) {
    return (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <g
          id="radio-selected"
          stroke="none"
          stroke-width="1"
          fill="none"
          fill-rule="evenodd"
        >
          <path
            id="Rectangle"
            transform="matrix(-1 0 0 1 24 0)"
            d="M0 0h24v24H0z"
          ></path>
          <path
            d="M11.969 19.438a7.469 7.469 0 100-14.938 7.469 7.469 0 000 14.938z"
            id="Oval-16"
            stroke="var(--primaryColor)"
            transform="matrix(-1 0 0 1 23.938 0)"
          ></path>
          <path
            d="M12.055 16.29a4.25 4.25 0 100-8.5 4.25 4.25 0 000 8.5z"
            fill="var(--primaryColor)"
            transform="matrix(-1 0 0 1 24.11 0)"
          ></path>
        </g>
      </svg>
    );
  }

  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g
        transform="matrix(-1 0 0 1 24 0)"
        id="radio-regular"
        stroke="none"
        stroke-width="1"
        fill="none"
        fill-rule="evenodd"
      >
        <path id="Rectangle" d="M0 0h24v24H0z"></path>
        <circle
          id="Oval-16"
          stroke="var(--primaryColor)"
          cx="12"
          cy="12"
          r="7.5"
        ></circle>
      </g>
    </svg>
  );
}

export default RadioIcon;