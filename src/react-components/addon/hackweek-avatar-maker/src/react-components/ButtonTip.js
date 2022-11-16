import React from "react";
import styles from "../../../../room/CustAvatarPopover.scss"
export function ButtonTip({ visible, top, left, text }) {
  return (
    <div className={styles.buttonTip} style={{ display: visible ? "block" : "none", top, left }}>
      {text}
    </div>
  );
}
