import React, { useEffect, useState,createContext,useContext,useRef } from "react";
import PropTypes from "prop-types";
import styles from "./CustAvatarPopover.scss";
import {startAnimation,cancelAnimation} from "../addon/hackweek-avatar-maker/src/game";
// import { CopyableTextInputField } from "../input/CopyableTextInputField";
import { Popover } from "../popover/Popover";
import { ToolbarButton } from "../input/ToolbarButton";
import { ReactComponent as CustAvatarIcon } from "../icons/Avatar.svg";
// import { Column } from "../layout/Column";
import { InviteLinkInputField } from "./InviteLinkInputField";
import { AvatarEditorContainer } from "../addon/hackweek-avatar-maker/src/react-components/AvatarEditorContainer";
import { FormattedMessage, defineMessage, useIntl } from "react-intl";
import { MoreMenuContext } from './MoreMenuPopover';

let strings = "";
function CustAvatarPopoverContent(props) {
  const ref = useRef(null);
  const [avatarGroup,setAvatarGroup] = useState({}); 
  console.log("CustAvatarPopoverContent");

 
  // useEffect(() => {

    
  //   const UpdateStore = event => {
  //     console.log("update Store,",props,event);
  //   }

  //   const element = ref.current;

  //   element.addEventListener('avatarEditorSaveStore', handleClick);

  //   return () => {
  //     element.removeEventListener('avatarEditorSaveStore', handleClick);
  //   };

  // },[]);

  useEffect(() => {
    console.log("avatarGroup,",avatarGroup,props);
  },[avatarGroup]);
  return (
    // <InviteLinkInputField fetchingCustAvatar={fetchingCustAvatar} custAvatarUrl={custAvatarUrl} onRevokeCustAvatar={revokeCustAvatar} />
    <div id="avatar-editor-root" className={styles.avatarEditorRoot}>
      <AvatarEditorContainer store={props.store}/>
    </div>
    
    // <Column center padding grow gap="lg" className={styles.custAvatarPopover}>
    //   {custAvatarRequired ? (
    //     <>
    //       <CustAvatarLinkInputField fetchingCustAvatar={fetchingCustAvatar} custAvatarUrl={custAvatarUrl} onRevokeCustAvatar={revokeCustAvatar} />
    //     </>
    //   ) : (
    //     <>
    //       <CopyableTextInputField
    //         label={<FormattedMessage id="cust-avatar-popover.room-link" defaultMessage="Room Link" />}
    //         value={url}
    //         buttonPreset="accent3"
    //       />
    //       <CopyableTextInputField
    //         label={<FormattedMessage id="cust-avatar-popover.embed-code" defaultMessage="Embed Code" />}
    //         value={embed}
    //         buttonPreset="accent5"
    //       />
    //     </>
    //   )}
    // </Column>
  );
}

CustAvatarPopoverContent.propTypes = {
  url: PropTypes.string,
  embed: PropTypes.string,
  custAvatarRequired: PropTypes.bool,
  fetchingCustAvatar: PropTypes.bool,
  custAvatarUrl: PropTypes.string,
  revokeCustAvatar: PropTypes.func
};

const custAvatarPopoverTitle = defineMessage({
  id: "cust-avatar-popover.title",
  defaultMessage: "CustAvatar"
});

const CustAvatarContext = createContext([false, () => {}]);


export function CustAvatarContextProvider({ initiallyVisible, children }) {
  const context = useState(initiallyVisible || false);
  return <CustAvatarContext.Provider value={context}>{children}</CustAvatarContext.Provider>;
}

export function CustAvatarPopoverButton({
  url,
  embed,
  initiallyVisible,
  popoverApiRef,
  custAvatarRequired,
  fetchingCustAvatar,
  custAvatarUrl,
  revokeCustAvatar,
  store,
  ...rest
}) {
  const intl = useIntl();
  const title = intl.formatMessage(custAvatarPopoverTitle);
  const [visible,setVisible] = useContext(CustAvatarContext);
  let needUpdate = true;
  document.addEventListener("updateAvatarGroupToCache",(e) => {
    console.log("updateAvatarGroupToCache,",e,store,needUpdate,store.state.profile,{...e.detail.storeAvatarPart},e.detail.storeAvatarPart);
    if(needUpdate)
      needUpdate = false;
    store.update({
      profile: { 
        displayName: store.state.profile.displayName,
        avatarId: store.state.profile.avatarId,
        hair: e.detail.storeAvatarPart.hair,
        ...e.detail.storeAvatarPart
      }
    });
    // cancelAnimation();
  })
  document.addEventListener("getStore",(e) => {
    e.preventDefault();
    e.detail.callback(store);
  })
  
  useEffect(()=> {
    console.log("visible CustAvatarPopoverButton,",visible);
    if(!visible)
      cancelAnimation();
    else
      startAnimation();
  },[visible]);

  return (
    <Popover
      title={title}
      content={(props) => (
        <CustAvatarPopoverContent
          // url={url}
          // embed={embed}gamired={custAvatarRequired}
          // fetchingCustAvatar={fetchingCustAvatar}
          // custAvatarUrl={custAvatarUrl}
          // revokeCustAvatar={revokeCustAvatar}
          store={store}
          {...props}
        />
        // <AvatarEditorContainer/>
      )}
      placement="top-start"
      offsetDistance={56}
      initiallyVisible={initiallyVisible}
      popoverApiRef={popoverApiRef}
      onChangeVisible={setVisible}
      isVisible={visible}
      // onChangeVisible={(visible) => {
      //   console.log("visible,",visible);
      // }}
    >
      {({ togglePopover, popoverVisible, triggerRef }) => (
        <ToolbarButton
          ref={triggerRef}
          icon={<CustAvatarIcon />}
          selected={popoverVisible}
          onClick={togglePopover}
          label={title}
          {...rest}
        />
      )}
    </Popover>
  );
}

CustAvatarPopoverButton.propTypes = {
  initiallyVisible: PropTypes.bool,
  popoverApiRef: PropTypes.object,
  ...CustAvatarPopoverContent.propTypes
};

document.addEventListener("DOMContentLoaded", () => {
    ReactDOM.render(<AvatarEditorContainer />, document.getElementById("avatar-editor-root"));
  });
