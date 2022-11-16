import React from "react";
import cx from "classnames";
import styles from "../../../../room/CustAvatarPopover.scss"

function importAll(r) {
  let images = {};
  r.keys().map(item => { 
    console.log(item,r(item))
    images[item.replace('./', '')] = r(item); 
  });
  return images;
}

const images = importAll(require.context("../../../../../assets/avatarMaker/thumbnails", false, /\.jpg$/));

export const Thumbnail = React.forwardRef(({ as: Component = "div", image, className, children, ...props }, ref) => {
  return (
    <Component
      // className={cx("partThumbnail", className)}
      className={cx(styles.partThumbnail, className)}
      // style={{ backgroundImage: image ? `url("src/assets/avatarMaker/thumbnails/${image}.jpg")` : "none" }}
      style={{ backgroundImage: image ? `url(${images[image+".jpg"]})` : "none" }}
      
      {...props}
      ref={ref}
    >
      {children}
    </Component>
  );
});
