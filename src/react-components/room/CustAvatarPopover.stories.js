import React from "react";
import { RoomLayout } from "../layout/RoomLayout";
import { CustAvatarPopoverButton } from "./CustAvatarPopover";

export default {
  title: "Room/CustAvatarPopover",
  parameters: {
    layout: "fullscreen"
  }
};

const room = {
  url: "hubs.link/oggNnrN",
  code: "478816",
  embed:
    '<iframe src="https://hubs.mozilla.com/oggNnrN/handsome-famous-park?embed_token=5555555555555555555555555" style="width: 1024px; height: 768px;" allow="microphone; camera; vr; speaker;"></iframe>'
};

export const Base = () => (
  <RoomLayout
    toolbarCenter={
      <CustAvatarPopoverButton
        shortUrl="https://hubs.link"
        url={room.url}
        code={room.code}
        embed={room.embed}
        initiallyVisible
      />
    }
  />
);

export const CustAvatarLink = () => (
  <RoomLayout
    toolbarCenter={
      <CustAvatarPopoverButton CustAvatarRequired initiallyVisible CustAvatarUrl="https://hubs.mozilla.com/123?hub_CustAvatar_id=123" />
    }
  />
);
