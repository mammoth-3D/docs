<!DOCTYPE html>
<html>
<head>
  <title>behemoth BOM Generator</title>
</head>
<body>

<h2>BOM Configuration</h2>

<label><strong>3D Printer</strong></label><br>
<select id="printer">
  <option value="">-- Select Printer --</option>
  <option>behemoth</option>
  <option>Voron 2.4</option>
  <option>Voron Trident</option>
</select><br><br>

<label><strong>Printer Size</strong></label><br>
<select id="size">
  <option value="">-- Select Size --</option>
  <option>300</option>
  <option>350</option>
  <option>400</option>
</select><br><br>

<label><strong>Hotend</strong></label><br>
<select id="hotend">
  <option value="">-- Select Hotend --</option>
  <option>Hell Fire</option>
  <option>Goliath Air</option>
  <option>Goliath Water</option>
  <option>Rapido</option>
  <option>Tricorn</option>
</select><br><br>

<label><strong>X Axis</strong></label><br>
<select id="axis"></select><br><br>

<label><strong>XY Belts</strong></label><br>
<select id="belt">
  <option value="">-- Select Belt --</option>
  <option>9mm</option>
  <option>12mm</option>
</select><br><br>

<label><strong>Motor Shaft Diameter</strong></label><br>
<select id="diameter">
  <option value="">-- Select Diameter --</option>
  <option>5mm</option>
  <option>8mm</option>
</select><br><br>

<label><strong>Motor Shaft Length</strong></label><br>
<select id="length">
  <option value="">-- Select Length --</option>
  <option>20mm to 25mm</option>
  <option>30mm to 40mm</option>
  <option>55mm to 60mm</option>
</select>

<br><br>

<button onclick="downloadCSV()">Download CSV</button>

<hr>

<table border="1" width="100%">
<thead>
<tr>
  <th>Qty</th>
  <th>Part Number</th>
  <th>Description</th>
  <th>Link</th>
</tr>
</thead>
<tbody id="bomTable">
<tr><td colspan="4">Make selections</td></tr>
</tbody>
</table>

<script>

// ---------------- DATA ----------------
let bom = {};

// ---------------- PART NUMBER ----------------
function makePartNumber(name){
  return "BH-" + name
    .toLowerCase()
    .replace(/behemoth/g, "")
    .replace(/voron/g, "")
    .replace(/v24/g, "")
    .replace(/vt/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toUpperCase()
    .substring(0, 40);
}

// ---------------- LINK ----------------
function makeLink(partNumber){
  return `https://behemoth.local/${partNumber}`;
}

// ---------------- ADD ITEM ----------------
function addItem(qty, name){

  const key = makePartNumber(name);

  if(!bom[key]){
    bom[key] = {
      qty: 0,
      part: key,
      desc: name,
      link: makeLink(key)
    };
  }

  bom[key].qty += qty;
}

// ---------------- AXIS RULE (UPDATED) ----------------
function updateAxis(){

  const size = sizeEl.value;
  axisEl.innerHTML = `<option value="">-- Select Axis --</option>`;

  if(!size) return;

  if(size === "300"){
    axisEl.innerHTML += `<option>High Speed 300</option>`;
    axisEl.innerHTML += `<option>High Temp 300</option>`;
  }

  if(size === "350"){
    axisEl.innerHTML += `<option>High Speed 350</option>`;
    axisEl.innerHTML += `<option>High Temp 350</option>`;
  }

  if(size === "400"){
    // 🚨 ONLY HIGH TEMP ALLOWED
    axisEl.innerHTML += `<option>High Temp 400</option>`;
  }
}

// ---------------- MAIN ----------------
function generateBOM(){

  bom = {};

  const printer = printerEl.value;
  const size = sizeEl.value;
  const hotend = hotendEl.value;
  const axis = axisEl.value;
  const belt = beltEl.value;
  const diameter = diameterEl.value;
  const length = lengthEl.value;

  if(!printer || !size || !hotend || !axis || !belt || !diameter || !length){
    table.innerHTML = "<tr><td colspan='4'>⚠️ Complete selections</td></tr>";
    return;
  }

  // ---------------- SAFETY CHECK ----------------
  if(size === "400" && axis.includes("High Speed")){
    table.innerHTML = "<tr><td colspan='4'>❌ Invalid: 400 only supports High Temp axis</td></tr>";
    return;
  }

  // ---------------- BASE ----------------
  const baseSets = [
    "Set1 X1 Y1 Motor Mount",
    "Set2 X Y Motor Mount",
    "Set3 X1 Y1 Idler Pack",
    "Set4 Tension Arms",
    "Set5 X Y Idler Pack",
    "Set6 XY Joiners",
    "Set22 Toolhead"
  ];

  baseSets.forEach(s => addItem(1, s));

  if(printer === "behemoth" || printer === "Voron 2.4"){
    addItem(1, "Set12 V24 Fixed Z Joints");
  }

  if(printer === "Voron Trident"){
    addItem(1, "Set13 VT Fixed Z Joints");
  }

  // ---------------- HOTEND ----------------
  if(hotend === "Hell Fire"){
    addItem(1, "Set25 Hell Fire Plate");
    addItem(1, "Set28 Hell Fire 150W");
  } else {
    addItem(1, "Set26 Universal Hotend Plate");
  }

  // ---------------- AXIS ----------------
  addItem(1, axis + " X-Axis");

  // ---------------- BELT ----------------
  if(belt === "9mm"){
    addItem(6, "Set14 9mm Idler Teeth");
    addItem(8, "Set15 9mm Idler Smooth");
    addItem(1, "Set23 9mm Clamp");
  } else {
    addItem(6, "Set16 12mm Idler Teeth");
    addItem(8, "Set17 12mm Idler Smooth");
    addItem(1, "Set24 12mm Clamp");
  }

  // ---------------- BEARINGS ----------------
  if(diameter === "8mm"){
    addItem(8, "8mm Bearings");
  }

  // ---------------- SHAFT RULE ----------------
  const longShaft = (length === "55mm to 60mm");

  if(!longShaft){

    if(diameter === "5mm"){
      addItem(4, "5mm Shaft Couplers");
      addItem(4, "M5 70mm Dowel Pins");
    }

    if(diameter === "8mm"){
      addItem(4, "8mm Shaft Couplers");
      addItem(4, "M8 70mm Dowel Pins");
    }
  }

  render();
}

// ---------------- RENDER ----------------
function render(){

  let html = "";

  Object.keys(bom).forEach(k => {

    const i = bom[k];

    html += `
      <tr>
        <td>${i.qty}</td>
        <td>${i.part}</td>
        <td>${i.desc}</td>
        <td><a href="${i.link}" target="_blank">Open</a></td>
      </tr>`;
  });

  table.innerHTML = html;
}

// ---------------- CSV ----------------
function downloadCSV(){

  generateBOM();

  let rows = [["Qty","Part Number","Description","Link"]];

  Object.keys(bom).forEach(k => {
    const i = bom[k];
    rows.push([i.qty, i.part, i.desc, i.link]);
  });

  const csv = rows.map(r =>
    r.map(v => `"${v}"`).join(",")
  ).join("\n");

  const blob = new Blob([csv], {type:"text/csv"});
  const a = document.createElement("a");

  a.href = URL.createObjectURL(blob);
  a.download = "behemoth BOM.csv";
  a.click();
}

// ---------------- ELEMENTS ----------------
const printerEl = document.getElementById("printer");
const sizeEl = document.getElementById("size");
const hotendEl = document.getElementById("hotend");
const axisEl = document.getElementById("axis");
const beltEl = document.getElementById("belt");
const diameterEl = document.getElementById("diameter");
const lengthEl = document.getElementById("length");
const table = document.getElementById("bomTable");

// events
sizeEl.addEventListener("change", updateAxis);
document.querySelectorAll("select").forEach(s =>
  s.addEventListener("change", generateBOM)
);

</script>

</body>
</html>