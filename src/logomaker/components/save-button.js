import React from 'react';
import PropTypes from 'prop-types';

import CloudDoneIcon from '@mui/icons-material/CloudDone';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';

import { useIsMobile } from '@eig-builder/core-utils/hooks/useResponsiveQuery';
import Text from '@eig-builder/module-localization';
import { DataElementLocations } from '@eig-builder/core-utils/helpers/tagging-helper';
import useSaveResponse from './use-save-response';

const CustomTooltip = styled(Tooltip)`
  max-width: 180px;
  text-align: center;
`;

const Loader = styled(CircularProgress)(({ theme }) => `
  color: ${theme.palette.grey[500]};
  margin-left: ${theme.spacing(2)};
  @media (max-width: 350px) {
    display: none;
  }
`);

const SavedIcon = styled(CloudDoneIcon)(({ theme }) => `
  margin-left: ${theme.spacing(2)};
  margin-top: ${theme.spacing(-0.5)};
  font-size: 20px;
  min-height: 20px;
  min-width: 20px;
  @media (max-width: 350px) {
    display: none;
  }
`);

const SaveButton = ({ onClick, tooltip, ...restProps }) => {
  const isMobile = useIsMobile();
  const { title, disabled } = useSaveResponse(restProps);

  // Construct the save button
  const ButtonComponent = (
    <Button
      variant={isMobile ? 'text' : 'outlined'}
      disabled={disabled}
      onClick={onClick}
      data-element-location={DataElementLocations.HEADER}
      data-element-label="logo--header--save"
      data-element-id="logo--header--save"
    >
      <Text message={title} />
      {restProps.saving && <Loader size={20} thickness={5} />}
      {!restProps.saving && disabled && <SavedIcon />}
    </Button>
  );

  if (!tooltip) {
    return ButtonComponent;
  }

  return (
    <CustomTooltip title={tooltip} arrow>
      <span>{ButtonComponent}</span>
    </CustomTooltip>
  );
};

SaveButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  tooltip: PropTypes.any,
};

export default SaveButton;
