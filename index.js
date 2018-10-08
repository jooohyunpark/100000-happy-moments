////////////////////////////////////////////////////////////////////////
/* set up XMLHttpRequest */
var url = "test.csv";
var oReq = new XMLHttpRequest();
oReq.open("GET", url, true);
oReq.responseType = "arraybuffer";


oReq.onload = function (e) {
    var arraybuffer = oReq.response;

    /* convert data to binary string */
    var data = new Uint8Array(arraybuffer);
    
    var arr = new Array();
    for (var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
    var bstr = arr.join("");

    /* Call XLSX */
    var workbook = XLSX.read(bstr, {
        type: "binary"
    });

    /* DO SOMETHING WITH workbook HERE */
    var first_sheet_name = workbook.SheetNames[0];

    /* Get worksheet */
    var worksheet = workbook.Sheets[first_sheet_name];
    var data = XLSX.utils.sheet_to_json(worksheet, {
        raw: true
    })
    

////////////////////////////////////////////////////////////////////////    
    


let point_num = 100000;

let width = window.innerWidth;
let viz_width = width;
let height = window.innerHeight;

let fov = 80;
let near = 10;
let far = 4000;

        
// Set up camera and scene
let camera = new THREE.PerspectiveCamera(
  fov,
  width / height,
  near,
  far 
);

window.addEventListener('resize', () => {
  width = window.innerWidth;
  viz_width = width;
  height = window.innerHeight;

  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
})
    


    /*
    0 - achivement 
    1 - affection
    2 - enjoy_the_moment
    3 - bonding
    4 - leisure 
    5 - nature
    6 - exercise    
    */   
let color_array = [
//  "#7c40ff",
//  "#00b4eb",
//  "#ef52d1",    
//  "#f57921",    
//  "#2de1a6",
//  "#fec300",
//  "#008f11" 
    
  "#7c40ff",
  "#00b4eb",
  "#ef52d1",    
  "#f57921",    
  "#2de1a6",
  "#fec300",
  "#008f11"   
]

// Add canvas
let renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
    let container = document.getElementById('container');
    container.appendChild(renderer.domElement);
    document.body.appendChild(container);

let zoom = d3.zoom()
  .scaleExtent([getScaleFromZ(far), getScaleFromZ(near)])
  .on('zoom', () =>  {
    let d3_transform = d3.event.transform;
    zoomHandler(d3_transform);
  });

view = d3.select(renderer.domElement);
function setUpZoom() {
  view.call(zoom);    
  let initial_scale = getScaleFromZ(far);
  var initial_transform = d3.zoomIdentity.translate(viz_width/2, height/2).scale(initial_scale);    
  zoom.transform(view, initial_transform);
  camera.position.set(0, 0, far);
}
setUpZoom();

circle_sprite= new THREE.TextureLoader().load(
  "https://fastforwardlabs.github.io/visualization_assets/circle-sprite.png"
)

let radius = 2000;

// Random point in circle code from https://stackoverflow.com/questions/32642399/simplest-way-to-plot-points-randomly-inside-a-circle
function randomPosition(radius) {
  var pt_angle = Math.random() * 2 * Math.PI;
  var pt_radius_sq = Math.random() * radius * radius;
  var pt_x = Math.sqrt(pt_radius_sq) * Math.cos(pt_angle);
  var pt_y = Math.sqrt(pt_radius_sq) * Math.sin(pt_angle);
  return [pt_x, pt_y];
}

let data_points = [];
    
    
for (var i = 0; i < data.length; i++) {
    
  let position = randomPosition(radius);
  let name =  data[i].data;
  let group = data[i].category;
  var colorValue  ; 
    if(group == "achievement") {colorValue = 0} 
    if(group == "affection") {colorValue = 1} 
    if(group == "enjoy_the_moment") {colorValue = 2} 
    if(group == "bonding") {colorValue = 3 } 
    if(group == "leisure") {colorValue = 4} 
    if(group == "nature") {colorValue = 5    } 
    if(group == "exercise") {colorValue = 6}   
    
  let point = { position, name, group, colorValue };
  data_points.push(point);
}

let generated_points = data_points;

let pointsGeometry = new THREE.Geometry();

let colors = [];
for (let datum of generated_points) {
  // Set vector coordinates from data
  let vertex = new THREE.Vector3(datum.position[0], datum.position[1], 0);
  pointsGeometry.vertices.push(vertex);
  let color = new THREE.Color(color_array[datum.colorValue]);
  colors.push(color);
}
pointsGeometry.colors = colors;

let pointsMaterial = new THREE.PointsMaterial({
  size: 4,
  sizeAttenuation: false,
  vertexColors: THREE.VertexColors,
  map: circle_sprite,
  transparent: true
});

let points = new THREE.Points(pointsGeometry, pointsMaterial);

let scene = new THREE.Scene();
scene.add(points);
scene.background = new THREE.Color(0xffffff);

// Three.js render loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

function zoomHandler(d3_transform) {
  let scale = d3_transform.k;
  let x = -(d3_transform.x - viz_width/2) / scale;
  let y = (d3_transform.y - height/2) / scale;
  let z = getZFromScale(scale);
  camera.position.set(x, y, z);
}

function getScaleFromZ (camera_z_position) {
  let half_fov = fov/2;
  let half_fov_radians = toRadians(half_fov);
  let half_fov_height = Math.tan(half_fov_radians) * camera_z_position;
  let fov_height = half_fov_height * 2;
  let scale = height / fov_height; // Divide visualization height by height derived from field of view
  return scale;
}

function getZFromScale(scale) {
  let half_fov = fov/2;
  let half_fov_radians = toRadians(half_fov);
  let scale_height = height / scale;
  let camera_z_position = scale_height / (2 * Math.tan(half_fov_radians));
  return camera_z_position;
}

function toRadians (angle) {
  return angle * (Math.PI / 180);
}

// Hover and tooltip interaction

raycaster = new THREE.Raycaster();
raycaster.params.Points.threshold = 10;

view.on("mousemove", () => {
  let [mouseX, mouseY] = d3.mouse(view.node());
  let mouse_position = [mouseX, mouseY];
checkIntersects(mouse_position);
});

function mouseToThree(mouseX, mouseY) {
  return new THREE.Vector3(
    mouseX / viz_width * 2 - 1,
    -(mouseY / height) * 2 + 1,
    1
  );
}


function checkIntersects(mouse_position) {
  let mouse_vector = mouseToThree(...mouse_position);
  raycaster.setFromCamera(mouse_vector, camera);
  let intersects = raycaster.intersectObject(points);
  if (intersects[0]) {
    let sorted_intersects = sortIntersectsByDistanceToRay(intersects);
    let intersect = sorted_intersects[0];
    let index = intersect.index;
    let datum = generated_points[index];
    highlightPoint(datum);
    showTooltip(mouse_position, datum);
  } else {
    removeHighlights();
    hideTooltip();
  }
}

function sortIntersectsByDistanceToRay(intersects) {
  return _.sortBy(intersects, "distanceToRay");
}

hoverContainer = new THREE.Object3D()
scene.add(hoverContainer);

function highlightPoint(datum) {
  removeHighlights();
  
  let geometry = new THREE.Geometry();
  geometry.vertices.push(
    new THREE.Vector3(
      datum.position[0],
      datum.position[1],
      0
    )
  );
  geometry.colors = [ new THREE.Color(color_array[datum.colorValue]) ];

  let material = new THREE.PointsMaterial({
    size: 26,
    sizeAttenuation: false,
    vertexColors: THREE.VertexColors,
    map: circle_sprite,
    transparent: true
  });
  
  let point = new THREE.Points(geometry, material);
  hoverContainer.add(point);
}

function removeHighlights() {
  hoverContainer.remove(...hoverContainer.children);
}

view.on("mouseleave", () => {
  removeHighlights()
});

// Initial tooltip state
let tooltip_state = { display: "none" }

let tooltip_template = document.createRange().createContextualFragment(`<div id="tooltip" style="display: none; position: absolute; pointer-events: none; font-size: 24px; width: 560px; line-height: 1.2;  color: white; font-family: sans-serif;">
  <div id="point_tip" style="padding: 10px;"></div>
</div>`);
document.body.append(tooltip_template);

    
let $tooltip = document.querySelector('#tooltip');
let $point_tip = document.querySelector('#point_tip');
//let $group_tip = document.querySelector('#group_tip');

function updateTooltip() {
  $tooltip.style.display = tooltip_state.display;
  $tooltip.style.left = tooltip_state.left + 'px';
  $tooltip.style.top = tooltip_state.top + 'px';
  $point_tip.innerText = tooltip_state.name;
  $point_tip.style.background = color_array[tooltip_state.colorValue];
//  $group_tip.innerText = `Group ${tooltip_state.group}`;
}

function showTooltip(mouse_position, datum) {
  let tooltip_width = 560;
  let x_offset ;
  let y_offset ;
    
//    console.log(datum);

    if(mouse_position[0] < width/2 && mouse_position[1] < height/2 ){
         x_offset = 20;
         y_offset = 20;
    }
       if(mouse_position[0] > width/2 && mouse_position[1] < height/2 ){
         x_offset = - 20 - $point_tip.offsetWidth;
         y_offset = 20;
    }
           if(mouse_position[0] < width/2 && mouse_position[1] > height/2 ){
         x_offset = 20;
         y_offset = -20 - $point_tip.offsetHeight; ;
    }
               if(mouse_position[0] > width/2 && mouse_position[1] > height/2 ){
         x_offset = - 20 -  $point_tip.offsetWidth;
         y_offset = - 20 - $point_tip.offsetHeight ;
    }
    
  tooltip_state.display = "block";
  tooltip_state.left = mouse_position[0] + x_offset;
  tooltip_state.top = mouse_position[1] + y_offset;
  tooltip_state.name = datum.name;
  tooltip_state.group = datum.group;
 tooltip_state.colorValue = datum.colorValue;    
//  tooltip_state.height = datum.group;    
  updateTooltip();
}

function hideTooltip() {
  tooltip_state.display = "none";
  updateTooltip();
}
    
    
    
    
////////////////////////////////////////////////////////////////////////    
    
    
    }

oReq.send();


////////////////////////////////////////////////////////////////////////


function trigger() {
    var button = document.getElementById("info");
    var x = document.getElementById("infoContent");

    if (x.style.display == "block") {
        x.style.display = "none";
        button.style.backgroundColor = 'white';
    } else {
        x.style.display = "block";
        button.style.backgroundColor = 'black';
    }
}


