import type {LayoutProps} from 'sanity';
import {createGlobalStyle} from 'styled-components';

const MobileStudioStyles=createGlobalStyle`
  @media (max-width: 767px) {
    [data-testid='pane-footer'] {
      bottom: 64px !important;
    }

    [data-testid='action-submitjob'] {
      min-width: 180px !important;
      min-height: 56px !important;
      padding-inline: 24px !important;
      font-size: 16px !important;
      font-weight: 700 !important;
    }
  }
`;

export function MobileFriendlyLayout(props:LayoutProps){
  return <><MobileStudioStyles/>{props.renderDefault(props)}</>;
}
