// import * as THREE from "../lib/three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
// import { OrbitControls } from "../lib/three/examples/jsm/controls/OrbitControls";
import * as THREE from "three";
import constants from "./constants";
import { exportAvatar } from "./export";
import {
  loadGLTF,
  loadGLTFCached,
  forEachMaterial,
  generateEnvironmentMap,
  createSky,
  isThumbnailMode,
  findChildrenByType,
  camelCase,
  GLTFBinarySplitterPlugin,
  snapshot,
  upload
} from "./utils";
import { renderThumbnail } from "./render-thumbnail";
import { combine } from "./mesh-combination";
import { getMaterialInfo } from "./get-material-info";
import { urlFor } from "./url-for";
import { createSkydome } from "./create-skydome";
import uvScroll from "./uv-scroll";
import idleEyes from "./idle-eyes";
import assets from "./assets";
import debugConfig from "./debug-config";
// call to update cache for components
import { UpdateStore } from "../../../room/CustAvatarPopover";
import { dispatch } from "./dispatch";
// Used to test mesh combination
import { fetchReticulumAuthenticated } from "../../../../utils/phoenix-utils";
window.combineCurrentAvatar = async function () {
  return await combine({ avatar: state.avatarGroup });
};

function importAll(r) {
  let modelDict = {};
  r.keys().map(item => { 
    console.log(item,r(item))
    modelDict[item.replace('./', '')] = r(item); 
  });
  return modelDict;
}

const modelDict = importAll(require.context("../../../../assets/avatarMaker/models", false, /\.glb$/));
console.log("modelDict",modelDict);
let requestId = 0;
const initState = {
  reactIsLoaded: false,
  shouldResize: true,
  didInit: false,
  scene: null,
  camera: null,
  renderer: null,
  controls: null,
  clock: null,
  delta: 0,
  envMap: null,
  avatarGroup: null,
  testExportGroup: null,
  avatarNodes: {},
  avatarConfig: {},
  newAvatarConfig: {},
  shouldApplyNewAvatarConfig: false,
  shouldExportAvatar: false,
  shouldSaveAvatar: false,
  shouldResetView: false,
  thumbnailConfig: {},
  shouldRenderThumbnail: false,
  shouldRotateLeft: false,
  shouldRotateRight: false,
  idleEyesMixers: {},
  uvScrollMaps: {},
  quietMode: false,
  shouldRenderInQuietMode: true,
  shouldApplyMorphRelationships: false,
  avatarGroupCategoryUuidMapping: {},
  storeAvatarPart: {},
  haveStoreCache: false,
};
let state = JSON.parse(JSON.stringify(initState));
let canvasElement = document.getElementsByTagName("canvas");

let canvasElement2 = document.getElementById("sceneAvatar");

const AVATARS_API = "/api/v1/avatars";

console.log("canvasElement,",canvasElement,canvasElement2);
// let a = HTMLCanvasElement(canvasElement);
window.gameState = state;

window.onresize = () => {
  state.shouldResize = true;
};
document.addEventListener(constants.reactIsLoaded, () => {
  state.reactIsLoaded = true;
});
document.addEventListener(constants.avatarConfigChanged, (e) => {
  console.log("addEventListener avatarConfigChanged",e);
  state.newAvatarConfig = e.detail.avatarConfig;
  state.shouldApplyNewAvatarConfig = true;
});
document.addEventListener(constants.renderThumbnail, (e) => {
  state.thumbnailConfig = e.detail.thumbnailConfig;
  state.shouldRenderThumbnail = true;
});
document.addEventListener(constants.exportAvatar, () => {
  state.shouldExportAvatar = true;
});
document.addEventListener(constants.resetView, () => {
  state.shouldResetView = true;
});
document.addEventListener(constants.saveAvatar, () => {
  state.shouldSaveAvatar = true;
});
document.addEventListener(constants.clearCache, () => {

});

function onKeyChange(e) {
  // console.log("e",e,e.key);
  switch (e.key) {
    case "ArrowRight":
      state.shouldRotateRight = e.type === "keydown";
      break;
    case "ArrowLeft":
      state.shouldRotateLeft = e.type === "keydown";
      break;
  }
}
["keydown", "keyup"].map((e) => {
  document.addEventListener(e, onKeyChange);
});
document.addEventListener("blur", () => {
  state.shouldRotateLeft = false;
  state.shouldRotateRight = false;
});

function ensureAvatarNode(category) {
  if (!state.avatarNodes[category]) {
    state.avatarNodes[category] = new THREE.Group();
    state.avatarGroup.add(state.avatarNodes[category]);
    state.avatarGroupCategoryUuidMapping[camelCase(category)] = state.avatarNodes[category].uuid;
  }
}

function resetView() {
  state.controls.reset();
}

function store(store){

  const categories = new Set((Object.keys(state.newAvatarConfig).concat(Object.keys(state.avatarConfig)).map((item) => {return camelCase(item)})));
  console.log("store,",store,categories,state);
  if(Object.keys(store).some((value,index) => {store[value] !== "" && categories.has(value)}))
    state.haveStoreCache = true;
}

function init() {
  console.log("init start",state);
  console.log("store",dispatch("getStore",{callback: store}));
  THREE.Cache.enabled = !isThumbnailMode();

  const scene = new THREE.Scene();
  state.scene = scene;

  const skydome = createSkydome(isThumbnailMode() ? 2 : 400);
  scene.add(skydome);

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0.6, 1);
  camera.childrenNeedMatrixWorldUpdate = true;
  camera.matrixAutoUpdate = true;

  state.camera = camera;
  console.log("camera,",camera);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 4.0);
  directionalLight.position.set(10, 20, 5);
  scene.add(directionalLight);

  // TODO: Square this with react

  
  const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("sceneAvatar"), antialias: true });
  renderer.physicallyCorrectLights = true;
  renderer.gammaOutput = true;
  state.renderer = renderer;

  state.clock = new THREE.Clock();

  const sky = createSky();
  state.envMap = generateEnvironmentMap(sky, renderer);

  const controls = new OrbitControls(camera, renderer.domElement);
  
  controls.target = new THREE.Vector3(0, 0.5, 0);
  controls.update();
  controls.saveState();
  state.controls = controls;
  state.currentCameraPosition = new THREE.Vector3(0,0,0);
  state.prevCameraPosition = new THREE.Vector3(0,0,0);

  // TODO Remove this test code
  state.testExportGroup = new THREE.Group();
  scene.add(state.testExportGroup);

  state.avatarGroup = new THREE.Group();
  scene.add(state.avatarGroup);

  console.log("init end",state);
}

function playClips(scene, clips) {
  if (!scene.animations) return;

  const mixer = new THREE.AnimationMixer(scene);

  for (const clip of clips) {
    const animation = scene.animations.find(a => a.name === clip)
    if (animation) {
      const action = mixer.clipAction(animation);
      action.play();
    }
  }

  mixer.update(0);
}

function initializeGltf(key, gltf) {
  if (idleEyes.hasIdleEyes(gltf)) {
    state.idleEyesMixers[key] = idleEyes.mixerForGltf(gltf);
  }

  if (state.uvScrollMaps[key]) {
    state.uvScrollMaps[key].length = 0;
  }

  gltf.scene.traverse((obj) => {
    forEachMaterial(obj, (material) => {
      if (material.isMeshStandardMaterial) {
        material.envMap = state.envMap;
        material.envMapIntensity = 0.4;
        if (material.map) {
          material.map.anisotropy = state.renderer.capabilities.getMaxAnisotropy();
        }
        material.needsUpdate = true;
      }
    });

    if (uvScroll.isValidMesh(obj)) {
      state.uvScrollMaps[key] = state.uvScrollMaps[key] || [];
      state.uvScrollMaps[key].push(uvScroll.initialStateForMesh(obj));
    }
  });
}

function saveInitialMorphTargetInfluences(node) {
  node.traverse((obj) => {
    if (obj.morphTargetInfluences && !obj.userData.initialMorphTargetInfluences) {
      obj.userData.initialMorphTargetInfluences = obj.morphTargetInfluences.slice(0);
    }
  });
}

function resetMorphTargetInfluences(node) {
  for (const mesh of findChildrenByType(node, "SkinnedMesh")) {
    if (!mesh.morphTargetInfluences) continue;
    for (let i = 0; i < mesh.morphTargetInfluences.length; i++) {
      mesh.morphTargetInfluences[i] = mesh.userData.initialMorphTargetInfluences[i];
    }
  }
}

function applyMorphRelationships(part) {
  if (!part.morphRelationships) return;

  for (const { targetCategoryName, targetMorphName, targetMorphValue } of part.morphRelationships) {
    const mesh = state.avatarNodes[targetCategoryName].getObjectByProperty("type", "SkinnedMesh");
    if (!mesh || !mesh.morphTargetDictionary) continue;

    const morphTargetIndex = mesh.morphTargetDictionary[targetMorphName];
    if (morphTargetIndex !== undefined) {
      mesh.morphTargetInfluences[morphTargetIndex] = targetMorphValue;
    }
  }
}

async function loadIntoGroup({ category, part, group, cached = true }) {
  try {
   
    const load = cached ? loadGLTFCached : loadGLTF;
    
    let url = urlFor(part);
    url = url.startsWith('blob') ? url : modelDict[part+".glb"];
    const gltf = await load(url);
    // const gltf = await load(urlFor(part));

    if (state.avatarConfig[category] !== part) return;
    console.log("loadIntoGroup",load,gltf,url);
    // TODO Make sure we need to do this.
    // Stash animations on the Object3D so that we can use them during export.
    gltf.scene.animations = gltf.animations;

    saveInitialMorphTargetInfluences(gltf.scene);

    initializeGltf(category, gltf);

    group.clear();
    group.add(gltf.scene);
    state.shouldRenderInQuietMode = true;

    return gltf.scene;
  } catch (ex) {
    console.error("Failed to load avatar part", category, part, ex);
    if (state.avatarConfig[category] !== part) return;
    group.clear();
    state.shouldRenderInQuietMode = true;
    return;
  }
}

function tick(time) {
  {
    if (state.reactIsLoaded && !state.didInit) {
      state.didInit = true;
      init();
    }
    if (!state.didInit) {
      // requestId = requestAnimationFrame(tick);
      startAnimation();
      return;
    }
  }

  {
    state.delta = state.clock.getDelta();
  }

  {
    if (state.shouldResize) {
      state.shouldResize = false;
      const { renderer, camera } = state;

      const width = renderer.domElement.parentNode.clientWidth;
      const height = renderer.domElement.parentNode.clientHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      console.log("camera",camera.position,width,height);
      state.shouldRenderInQuietMode = true;
    }
  }

  {
    if (state.shouldApplyNewAvatarConfig) {
      state.shouldApplyNewAvatarConfig = false;

      const categories = new Set(Object.keys(state.newAvatarConfig).concat(Object.keys(state.avatarConfig)));

      for (const category of categories) {
        ensureAvatarNode(category);

        if (state.newAvatarConfig[category] !== state.avatarConfig[category]) {
          state.avatarConfig[category] = state.newAvatarConfig[category];
          state.storeAvatarPart[camelCase(category)] = state.newAvatarConfig[category] || "";
          if (state.newAvatarConfig[category] !== null) {
            loadIntoGroup({ category, part: state.newAvatarConfig[category], group: state.avatarNodes[category] }).then(
              () => {
                console.log("state.avatarNodes[category]",category,state.avatarNodes[category]);
                state.shouldApplyMorphRelationships = true;
              }
            );
          } else {
            state.avatarNodes[category].clear();
            state.shouldApplyMorphRelationships = true;
            state.shouldRenderInQuietMode = true;
          }
        }
      }
    }
  }

  {
    if (state.shouldApplyMorphRelationships) {
      state.shouldApplyMorphRelationships = false;

      for (const categoryName of Object.keys(state.avatarConfig)) {
        if (!state.avatarConfig[categoryName] || !assets[categoryName]) continue;

        resetMorphTargetInfluences(state.avatarNodes[categoryName]);

        const currentPart = assets[categoryName].parts.find((part) => part.value === state.avatarConfig[categoryName]);

        applyMorphRelationships(currentPart);
      }
    }
  }

  {
    if (state.shouldRenderThumbnail) {
      state.shouldRenderThumbnail = false;

      const { category, part } = state.thumbnailConfig;

      ensureAvatarNode(category);

      for (const category of Object.keys(state.avatarNodes)) {
        state.avatarNodes[category].clear();
      }

      state.avatarConfig[category] = part;

      loadIntoGroup({ category, part, group: state.avatarNodes[category], cached: false }).then((gltfScene) => {
        renderThumbnail(state.renderer, state.scene, gltfScene, category, part);
      });
    }
  }

  {
    if (state.shouldExportAvatar) {
      state.shouldExportAvatar = false;

      // Reset all idle eyes animations before cloning or exporting the avatar
      // so that we don't export it mid-blink.
      Object.values(state.idleEyesMixers).forEach(mixer => {
        mixer.setTime(0);
      });

      exportAvatar(state.avatarGroup).then(({ glb }) => {
        const blob = new Blob([glb], { type: "application/octet-stream" });
        const url = URL.createObjectURL(blob);

        if (!debugConfig.disableDownload) {
          const el = document.createElement("a");
          el.style.display = "none";
          el.href = url;
          el.download = "custom_avatar.glb";
          el.click();
          el.remove();
        }

        if (debugConfig.debugExports) {
          loadGLTF(url).then((gltf) => {
            initializeGltf("testExportGroup", gltf);
            state.testExportGroup.clear();
            state.testExportGroup.add(gltf.scene);
            gltf.scene.position.set(0.5, 0, 0);
          });
        }
      });
    }
  }

  {
    if(state.shouldSaveAvatar){
      state.shouldSaveAvatar = false;

      console.log("saveAvatarGroup",state.avatarGroup);
      // UpdateStore(state.avatarGroup)
      dispatch("updateAvatarGroupToCache",{avatarGroup: state.avatarGroup,avatarGroupCategoryUuidMapping: state.avatarGroupCategoryUuidMapping,storeAvatarPart:state.storeAvatarPart});

      exportAvatar(state.avatarGroup).then(async ({ glb }) => {
        console.log("glb,",glb);
        const blob = new Blob([glb], { type: "application/octet-stream" });
        const url = URL.createObjectURL(blob);

        let avatarState = {
          name: "test",
          files:{
            glb:url
          }
        };

        let previewGltfUrl = URL.createObjectURL(blob);

        const gltfLoader = new GLTFLoader().register(parser => new GLTFBinarySplitterPlugin(parser));
        const gltfUrl = URL.createObjectURL(blob);
        const onProgress = console.log;
        let inputfiles = {};
        await new Promise((resolve, reject) => {
          // GLTFBinarySplitterPlugin saves gltf and bin in gltf.files
          gltfLoader.load(
            gltfUrl,
            // url,
            result => {
              inputfiles.gltf = result.files.gltf;
              inputfiles.bin = result.files.bin;
              resolve(result);
            },
            onProgress,
            reject
          );
        });
  
        URL.revokeObjectURL(gltfUrl);
        console.log("canvasElement,",canvasElement);
        // inputfiles.thumbnail = new File([await snapshot((canvasElement[1]))], "thumbnail.png", {
        //   type: "image/png"
        // });
    
        // const filesToUpload = ["gltf", "bin", "base_map", "emissive_map", "normal_map", "orm_map", "thumbnail"].filter(
        //   k => blob === null || blob instanceof Blob
        // );
    
        // // this.setState({ uploading: true });
    
        // const fileUploads = await Promise.all(filesToUpload.map(f => inputfiles[f] && upload(inputfiles[f])));
        // const avatar = {
        //   // ...this.state.avatar,
        //   parent_avatar_listing_id: "",
        //   name:"test",
        //   attributions: {
        //     creator: ""
        //   },
        //   files: fileUploads
        //     .map((resp, i) => [filesToUpload[i], resp && [resp.file_id, resp.meta.access_token, resp.meta.promotion_token]])
        //     .reduce((o, [k, v]) => ({ ...o, [k]: v }), {})
        // };

        // fetchReticulumAuthenticated(
        //   avatar.avatar_id ? `"/api/v1/avatars/${avatar.avatar_id}` : AVATARS_API,
        //   avatar.avatar_id ? "PUT" : "POST",
        //   { avatar }
        // ).then(({ avatars }) => avatars[0]);
    
      })
    }

  }

  {
    if (state.shouldResetView) {
      state.shouldResetView = false;
      resetView();
    }
  }

  {
    let speed = 0;
    if (state.shouldRotateLeft) {
      speed -= 30;
    }
    if (state.shouldRotateRight) {
      speed += 30;
    }
    const { controls } = state;
    controls.autoRotate = true;
    controls.autoRotateSpeed = speed;
    // console.log("controls before,",JSON.parse(JSON.stringify(controls)));
    controls.update();
    // console.log("update ok,",controls.update());
    // console.log("controls before,",controls);
  }

  {
    for (const categoryName in state.idleEyesMixers) {
      if (!state.idleEyesMixers.hasOwnProperty(categoryName)) continue;
      const mixer = state.idleEyesMixers[categoryName];
      mixer.update(state.delta);
    }
  }

  {
    for (const categoryName in state.uvScrollMaps) {
      if (!state.uvScrollMaps.hasOwnProperty(categoryName)) continue;
      for (const uvScrollState of state.uvScrollMaps[categoryName]) {
        uvScroll.update(uvScrollState, state.delta);
      }
    }
  }

  {
    const { camera, prevCameraPosition, currentCameraPosition } = state;
    const didCameraMove = !prevCameraPosition.equals(currentCameraPosition.setFromMatrixPosition(camera.matrixWorld));
    prevCameraPosition.copy(currentCameraPosition);
    if (didCameraMove) {
      state.shouldRenderInQuietMode = true;
    }
  }

  {
    // requestId = window.requestAnimationFrame(tick);
    startAnimation();
  }

  {
    const { renderer, scene, camera, controls } = state;
    if (!state.quietMode || state.shouldRenderInQuietMode) {
      state.shouldRenderInQuietMode = false;
      // console.log("renderer in game");
      renderer.render(scene, camera);
    }
  }
}

export function cancelAnimation(){
  window.cancelAnimationFrame(requestId);
  // console.log("state cancelANimation,",state);
  state = JSON.parse(JSON.stringify(initState));
  window.gameState = state;
}

export function startAnimation(){
  requestId = window.requestAnimationFrame(tick);
}

export function saveAvatarCache(){

}

startAnimation();

