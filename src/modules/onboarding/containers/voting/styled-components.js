import { styled } from '@mui/material/styles'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import ButtonWithLoader from './../../components/selection/button-with-loader'

const LogoWrapper = styled('div')`
  transition:
    all 0.7s,
    width 0.7s,
    height 0.7s;
  width: 1280px;
  top: 88px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing(4)};

  max-width: 100%;
  min-width: 393px;

  @media screen and (max-width: 1440px) {
    min-width: calc(36% - 52px);
    top: 88px;
  }

  opacity: 1;
  z-index: 9999;
  transform: scale(1);

  .logoCard {
    div {
      padding: 10%;
    }
  }
`

const HoverCard = styled(Card)`
  border: ${(props) => (props.selected ? `2px solid ${props.theme.palette.primary.main}` : ' 2px solid transparent')};
  position: ${(props) => (props.selected ? 'relative' : 'initial')};
  overflow: visible !important;
  margin: 8px;
  padding-top: 56%;

  :hover {
    cursor: pointer;
    box-shadow:
      0 0 0 1px rgba(0, 0, 0, 0.22),
      0 2px 4px 0 rgba(0, 0, 0, 0.21),
      0 2px 1px 0 rgba(0, 0, 0, 0.19);
  }

  @media screen and (max-width: 599px) {
    width: calc(50% - 24px) !important;
    padding-top: 33% !important;
    margin: 12px !important;
    min-height: 40px !important;
    min-width: 40px !important;
  }
`

const LogoPreview = styled('div')`
  transition: opacity 200ms;
  position: absolute;
  margin: auto;
  padding: 26px;
  bottom: 0;
  top: 0;
  width: 100%;
  cursor: pointer;
`

const Overlay = styled('div')`
  position: absolute;
  width: 100%;
  height: 100%;
  background: rgba(246, 246, 246, 0.8);
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 2;

  &:hover {
    cursor: pointer;
  }
`

const Header = styled('div')`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-content: center;
`
const Subtitle = styled('div')`
  margin-left: ${({ theme }) => theme.spacing(2)};
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
`

const MoreButton = styled(Button)`
  width: 33.33%;
`

const DeleteButton = styled(ButtonWithLoader)`
  width: 33.33%;
  background-color: ${({ theme }) => theme.palette.red.main + '!important'};
  margin-right: ${({ theme }) => theme.spacing(4) + ' !important'};
  margin-top: ${({ theme }) => theme.spacing() + ' !important'};
`

const ButtonWrapper = styled('div')`
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  padding-bottom: 12px;
  bottom: 0;
  width: 100%;

  position: fixed;
  background: #f6f6f6;

  div {
    box-shadow: none !important;
  }
`

export { LogoWrapper, Header, HoverCard, LogoPreview, Overlay, Subtitle, ButtonWrapper, DeleteButton, MoreButton }
