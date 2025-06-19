import PropTypes from "prop-types";
import React from "react";
import "./publish-menu.css";

export const PublishMenu = ({ state, className }) => {
  return <div className={`publish-menu ${className}`} />;
};

PublishMenu.propTypes = {
  state: PropTypes.oneOf(["hover", "selected", "idle"]),
};
