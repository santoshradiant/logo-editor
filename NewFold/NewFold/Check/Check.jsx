import React from "react";

export const Check = ({ className }) => {
  return (
    <svg
      className={`check ${className}`}
      fill="none"
      height="6"
      viewBox="0 0 8 6"
      width="8"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        className="path"
        clipRule="evenodd"
        d="M8 0.947369L3 6L0 3.2887L0.942809 2.39551L3 4.10526L7 0L8 0.947369Z"
        fill="#A3A3A3"
        fillRule="evenodd"
      />
    </svg>
  );
};
