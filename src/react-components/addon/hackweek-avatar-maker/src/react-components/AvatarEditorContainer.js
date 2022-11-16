import React, { useState, useEffect, useCallback } from "react";
import constants from "../constants";
import { generateWave,camelCase } from "../utils";
import { ToolbarContainer } from "./ToolbarContainer";
import { ButtonTip } from "./ButtonTip";
import { AvatarPreviewContainer } from "./AvatarPreviewContainer";
import { AvatarConfigurationPanel } from "./AvatarConfigurationPanel";
import { AvatarEditor } from "./AvatarEditor";
import { dispatch } from "../dispatch";
import { generateRandomConfig } from "../generate-random-config";
import initialAssets from "../assets";
import { isThumbnailMode } from "../utils";
import debounce from "../utils/debounce";

// Used externally by the generate-thumbnails script
const thumbnailMode = isThumbnailMode();

function checkForStoreRecord(assets,store,initialConfig){
  const categories = Object.keys(assets);
  const camelCasedCategories = categories.map((item) => {return camelCase(item)});
  // console.log("store,",store,categories);
  Object.keys(store.state.profile).forEach((value,index) => {console.log("checkForStoreRecord foreach",value,store.state.profile[value] !== "" , camelCasedCategories.includes(value))},);
  console.log(Object.keys(store.state.profile).some((value,index) => {store.state.profile[value] !== "" && camelCasedCategories.includes(value)}));
  if(Object.keys(store.state.profile).some((value,index) => store.state.profile[value] !== "" && camelCasedCategories.includes(value) )){
    let storeConfig = {};
    categories.forEach((category,index) => {storeConfig[category] = store.state.profile[camelCase(category)] ? store.state.profile[camelCase(category)] : null})
    console.log("checkForStoreRecord a",initialConfig,storeConfig);
    return storeConfig;
  }
    
  else 
    return initialConfig;
}

export function AvatarEditorContainer(props) {
  const {store} = props;
  // const {} = store.state.profile;
  const [assets, setAssets] = useState(initialAssets);
  const [hoveredConfig, setHoveredConfig] = useState({});
  const debouncedSetHoveredConfig = useCallback(debounce(setHoveredConfig), [setHoveredConfig]);
  const [canvasUrl, setCanvasUrl] = useState(null);
  
  const initialConfig = generateRandomConfig(assets);
  const updatedConfig = checkForStoreRecord(assets,store,initialConfig);
  // const [avatarConfig, setAvatarConfig] = useState(initialConfig);
  const [avatarConfig, setAvatarConfig] = useState(updatedConfig);
  const [tipState, setTipState] = useState({ visible: false, text: "", top: 0, left: 0 });

  useEffect(() => {
    if (!thumbnailMode ) {
      dispatch(constants.avatarConfigChanged, { avatarConfig: { ...avatarConfig, ...hoveredConfig } });
    }
    dispatch(constants.reactIsLoaded);
  });

  // TODO: Save the wave to a static image, or actually do some interesting animation with it.
  // useEffect(async () => {
  //   if (canvasUrl === null) {
  //     setCanvasUrl(await generateWave());
  //   }
  // });
  useEffect(
    () => {
      async function setOutsideUrl() {
        if (canvasUrl === null) {
          setCanvasUrl(await generateWave());
        }
      }
      setOutsideUrl();
    },[]);

  function updateAvatarConfig(newConfig) {
    console.log("updateAvatarConfig,",avatarConfig,newConfig);
    setAvatarConfig({ ...avatarConfig, ...newConfig });
  }

  function showTip(text, top, left) {
    setTipState({ visible: true, text, top, left });
  }

  function hideTip() {
    setTipState({ visible: false });
  }

  function capitalize(str) {
    if (!str) return "";
    return str[0].toUpperCase() + str.substring(1);
  }

  // TODO Share this code with the generate-assets script.
  function parseFilename(fullname, categoryNamePrefix, fallbackCategoryName) {
    const filename = fullname.substring(0, fullname.lastIndexOf("."));

    let [hyphenatedCategory, hyphenatedName] = filename.split("_");
    if (!hyphenatedName) {
      hyphenatedCategory = fallbackCategoryName;
      hyphenatedName = filename;
    } else {
      hyphenatedCategory = categoryNamePrefix + "-" + hyphenatedCategory;
    }
    const category = hyphenatedCategory
      .split("-")
      .map((p) => capitalize(p))
      .join(" ");
    const displayName = hyphenatedName
      .split("-")
      .map((p) => capitalize(p))
      .join(" ");
    return [category, displayName];
  }

  function onGLBUploaded(e) {
    
    const file = e.target.files[0];

    let [category, displayName] = parseFilename(file.name, "Uploaded", "Uploads");
    const url = URL.createObjectURL(file);

    const clone = { ...assets };

    clone[category] = clone[category] || {
      parts: [
        {
          displayName: "None",
          value: null,
        },
      ],
    };
    // clone[category] ={
    //   parts: [
    //     {
    //       displayName: "None",
    //       value: null,
    //     },
    //   ],
    // };
    
    // clone[category].clear();
    // console.log("onGLBUploaded",e,clone,displayName,url,category);
    clone[category].parts.push({
      displayName,
      value: url,
    });

    setAssets(clone);
    console.log("onGLBUploaded",e,clone,displayName,url,category);
    updateAvatarConfig({ [category]: url });
  }

  function randomizeConfig() {
    setAvatarConfig(generateRandomConfig(assets));
  }

  return (
    <AvatarEditor
      {...{
        thumbnailMode,
        leftPanel: (
          <AvatarConfigurationPanel
            {...{
              avatarConfig,
              assets,
              onScroll: () => {
                hideTip();
              },
              onSelectAvatarPart: ({ categoryName, part }) => {
                updateAvatarConfig({ [categoryName]: part.value });
              },
              onHoverAvatarPart: ({ categoryName, part, tip, rect }) => {
                debouncedSetHoveredConfig({ [categoryName]: part.value });
                showTip(tip, rect.bottom, rect.left + rect.width / 2);
              },
              onUnhoverAvatarPart: () => {
                debouncedSetHoveredConfig({});
                hideTip();
              },
            }}
          />
        ),
        rightPanel: <AvatarPreviewContainer {...{ thumbnailMode, canvasUrl }} />,
        buttonTip: <ButtonTip {...tipState} />,
        toolbar: <ToolbarContainer {...{ onGLBUploaded, randomizeConfig }} />,
      }}
    />
  );
}
