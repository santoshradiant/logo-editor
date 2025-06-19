import PropTypes from "prop-types";
import React from "react";
import "./builder-topbar-redo.css";

export const BuilderTopbarRedo = ({ state, className }) => {
  return <div className={`builder-topbar-redo ${className}`} />;
};

BuilderTopbarRedo.propTypes = {
  state: PropTypes.oneOf(["selected", "hover", "idle", "disabled"]),
};
