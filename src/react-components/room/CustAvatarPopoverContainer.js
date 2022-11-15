import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import configs from "../../utils/configs";
import { hubUrl } from "../../utils/phoenix-utils";
import { CustAvatarPopoverButton } from "./CustAvatarPopover";
import { handleExitTo2DInterstitial } from "../../utils/vr-interstitial";
import { useInviteUrl } from "./useInviteUrl";

export function CustAvatarPopoverContainer({ hub, hubChannel, scene, ...rest }) {
  // TODO: Move to Hub class
  const shortUrl = `https://${configs.SHORTLINK_DOMAIN}`;
  const url = `${shortUrl}/${hub.hub_id}`;
  const embedUrl = hubUrl(hub.hub_id, { embed_token: hub.embed_token });
  const embedText = `<iframe src="${embedUrl}" style="width: 1024px; height: 768px;" allow="microphone; camera; vr; speaker;"></iframe>`;
  const popoverApiRef = useRef();

  // Handle clicking on the cust_avatar button while in VR.
  useEffect(
    () => {
      function onCustAvatarButtonClicked() {
        handleExitTo2DInterstitial(true, () => {}).then(() => {
          popoverApiRef.current.openPopover();
        });
      }

      scene.addEventListener("action_cust_avatar", onCustAvatarButtonClicked);

      return () => {
        scene.removeEventListener("action_cust_avatar", onCustAvatarButtonClicked);
      };
    },
    [scene, popoverApiRef]
  );

  const cust_avatarRequired = hub.entry_mode === "cust_avatar";
  const canGenerateCustAvatarUrl = hubChannel.can("update_hub");

  const { fetchingCustAvatar, cust_avatarUrl, revokeCustAvatar } = useInviteUrl(
    hubChannel,
    !cust_avatarRequired || !canGenerateCustAvatarUrl
  );

  if (cust_avatarRequired && !canGenerateCustAvatarUrl) {
    return null;
  }

  return (
    <CustAvatarPopoverButton
      cust_avatarRequired={cust_avatarRequired}
      fetchingCustAvatar={fetchingCustAvatar}
      cust_avatarUrl={cust_avatarUrl}
      revokeCustAvatar={revokeCustAvatar}
      url={url}
      embed={embedText}
      popoverApiRef={popoverApiRef}
      {...rest}
    />
  );
}

CustAvatarPopoverContainer.propTypes = {
  hub: PropTypes.object.isRequired,
  scene: PropTypes.object.isRequired,
  hubChannel: PropTypes.object.isRequired
};
