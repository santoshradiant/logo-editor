import React from "react";

export const Undo = ({ className }) => {
  return (
    <svg
      className={`undo ${className}`}
      fill="none"
      height="24"
      viewBox="0 0 24 24"
      width="24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        className="path"
        clipRule="evenodd"
        d="M6 8L9 5.4L7.6 4L2 9L7.6 14L9 12.6L6 10H16C18.2091 10 20 11.7909 20 14C20 16.2091 18.2091 18 16 18H9V20H16C19.3137 20 22 17.3137 22 14C22 10.6863 19.3137 8 16 8H6Z"
        fill="#A3A3A3"
        fillRule="evenodd"
      />
    </svg>
  );
};
