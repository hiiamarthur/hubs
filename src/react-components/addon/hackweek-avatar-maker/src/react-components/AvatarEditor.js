import React from "react";
import styles from "../../../../room/CustAvatarPopover.scss"
export function AvatarEditor({ thumbnailMode, leftPanel, rightPanel, buttonTip, toolbar }) {
  return (
    <>
      <div className={styles.main}>
        {!thumbnailMode && leftPanel}
        {rightPanel}
        {buttonTip}
      </div>
      {!thumbnailMode && toolbar}
    </>
  );
}
