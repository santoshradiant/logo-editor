import PropTypes from "prop-types";
import React from "react";
import "./builder-topbar-undo.css";

export const BuilderTopbarUndo = ({ state, className }) => {
  return <div className={`builder-topbar-undo ${className}`} />;
};

BuilderTopbarUndo.propTypes = {
  state: PropTypes.oneOf(["selected", "hover", "idle", "disabled"]),
};
