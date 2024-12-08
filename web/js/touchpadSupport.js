/** @type { import("../../../../web/scripts/app.js") } */
import { app } from '../../../scripts/app.js';
const { LGraphCanvas } = window;

const isTouchpad = e => e.wheelDelta ? Boolean(e.wheelDelta % 120) : e.deltaMode === 0;
const isTouchpadZooming = e => e.ctrlKey && Boolean(e.deltaY % 100);
const canTargetScroll = e => e.target.clientHeight < e.target.scrollHeight;

const oldProcessMouseWheel = LGraphCanvas.prototype.processMouseWheel;

// Options
const scrollZooming = true;
const touchpadZooming = false;
const zoomSpeed = 0.2;
const touchpadZoomSpeed = 1;
const allowPanningOverNonScrollableTextareas = true;
const allowZoomingOverTextareas = false;

const isFirefox = "onwheel" in app.canvasEl.parentElement;
let isPanning = false;

const enablePanning = () => isPanning = true;
const disablePanning = () => (isPanning = false, document.removeEventListener("pointermove", disablePanning))

const processMouseWheel = e => {
  const scale = app.canvas.ds.scale;
  const touchpad = isTouchpad(e);
  const touchpadZooming = isTouchpadZooming(e);
  let deltaZoom = 100 / (touchpadZooming ? touchpadZoomSpeed : zoomSpeed) / scale;

  if (e.target.tagName === "TEXTAREA" && allowPanningOverNonScrollableTextareas && !canTargetScroll(e)) enablePanning();

  if (app.canvas.graph && app.canvas.allow_dragcanvas && isPanning) {
    document.addEventListener("pointermove", disablePanning);

    let { deltaX, deltaY } = e;
    if (e.shiftKey) {
      deltaX = e.deltaY;
      deltaY = e.deltaX;
    }

    console.log(isFirefox);
    if ((!isFirefox && (e.metaKey || e.ctrlKey || (scrollZooming && !touchpad))) || (touchpadZooming && touchpad)) {
      if (e.metaKey) deltaZoom *= -1 / 0.5;
      app.canvas.ds.changeScale(scale - e.deltaY / deltaZoom, [e.clientX, e.clientY]);
      app.canvas.graph.change();
    } else app.canvas.ds.mouseDrag(-deltaX, -deltaY);
    
    app.canvas.graph.change();
    e.preventDefault();
    return false;
  } else {
    oldProcessMouseWheel.bind(app.canvas, e);
    if (e.ctrlKey) e.preventDefault();
    return true;
  }
};

console.log(isFirefox);

app.canvasEl.parentElement.addEventListener(isFirefox ? "wheel" : "mousewheel", processMouseWheel);

LGraphCanvas.prototype.processMouseWheel = e => enablePanning();