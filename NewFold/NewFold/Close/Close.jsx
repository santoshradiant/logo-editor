import React from "react";

export const Close = ({ className }) => {
  return (
    <svg
      className={`close ${className}`}
      fill="none"
      height="32"
      viewBox="0 0 32 32"
      width="32"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        className="path"
        d="M23 10.41L21.59 9L16 14.59L10.41 9L9 10.41L14.59 16L9 21.59L10.41 23L16 17.41L21.59 23L23 21.59L17.41 16L23 10.41Z"
        fill="#404040"
      />
    </svg>
  );
};
