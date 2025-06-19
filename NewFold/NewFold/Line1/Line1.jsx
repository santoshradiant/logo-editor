import React from "react";

export const Line1 = ({ className }) => {
  return (
    <svg
      className={`line-1 ${className}`}
      fill="none"
      height="24"
      viewBox="0 0 1 24"
      width="1"
      xmlns="http://www.w3.org/2000/svg"
    >
      <line
        className="line-2"
        stroke="#CCCCCC"
        x1="0.5"
        x2="0.499999"
        y1="2.18557e-08"
        y2="24"
      />
    </svg>
  );
};
