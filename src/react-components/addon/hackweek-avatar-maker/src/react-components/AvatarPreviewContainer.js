import React,{useEffect,memo} from "react";
import styles from "../../../../room/CustAvatarPopover.scss"

function makeid(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * 
charactersLength));
 }
 return result;
}

let key = "";
function Canvas(){
  useEffect(() => {
    console.trace("useEffect canvas");
  },[]);
  return (<canvas id="sceneAvatar"></canvas>);
}
export function AvatarPreviewContainer({ thumbnailMode, canvasUrl }) {
  return (
    <div id="sceneContainer">
      {/* {!thumbnailMode && ( */}
        <div className={styles.waveContainer} style={{ backgroundImage: canvasUrl ? `url("${canvasUrl}")` : "none" }}></div>
      {/* )} */}
      <Canvas/>
    </div>
  );
}

function needUpdate(prevProps, nextProps){
  return true;
}

// export const AvatarPreviewContainer = memo(AvatarPreviewContainerChild,(prevProps, nextProps) => needUpdate(prevProps, nextProps));
// export default AvatarPreviewContainer;