import React from "react";
import styles from "../../../../room/CustAvatarPopover.scss";
import classNames from "classnames";
export const AvatarPartContainer = React.forwardRef(({ onKeyDown, isExpanded, children }, ref) => {
  return (
    <div
      tabIndex="0"
      role="button"
      // className={"partSelector " + (isExpanded ? "expanded" : "collapsed")}
      className={classNames(styles.partSelector, {
        [isExpanded ? styles.expanded : styles.collapsed]: true,
      })}
      onKeyDown={onKeyDown}
      ref={ref}
    >
      {children}
    </div>
  );
});
