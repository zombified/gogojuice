let settingsbutton = document.getElementById("settingsbutton");
let settingssection = document.getElementById("settings");
let settingssavebutton = document.getElementById("settingssavebutton");
let formsection = document.getElementById("form");
let addbutton = document.getElementById("addbutton");
let clearbutton = document.getElementById("clearbutton")
let exportbutton = document.getElementById("exportbutton")
let contentsection = document.getElementById("content");

let vehiclelistel = document.getElementById("vehiclelist");
let vehicleselection = document.getElementById("vehicleselection");
let distanceinput = document.getElementById("distanceinput");
let costinput = document.getElementById("costinput");
let fuelinput = document.getElementById("fuelinput");

let datatable = document.getElementById("datatable");

let storage = window.localStorage;


function toggle_settings(event) {
  if(settingssection.style.display !== "none") {
    settingssection.style.display = "none";
    formsection.style.display = "block";
    contentsection.style.display = "block";
  }
  else {
    settingssection.style.display = "block";
    formsection.style.display = "none";
    contentsection.style.display = "none";
  }
}

function generate_vehicle_selection() {
  let vehicleliststr = storage.getItem('setting-vehiclelist')
  if(vehicleliststr === null) {
    vehicleliststr = "vehicle 1";
  }

  vehicleselection.innerHTML = "";

  let vehiclelist = vehicleliststr.split(/\r?\n/);
  for(let i = 0; i < vehiclelist.length; i++ ) {
    let opt = document.createElement("option");
    opt.text = vehiclelist[i];
    opt.value = vehiclelist[i];
    vehicleselection.add(opt);
  }

  // also update text area for settings
  vehiclelistel.value = vehicleliststr;
}

function generate_data_table() {
  let data = storage.getItem('data');
  if(data === null) {
    data = {'items':[]};
  }
  else {
    data = JSON.parse(data);
  }

  datatable.tBodies[0].innerHTML = "";

  let final_data = []
  let last_distance = {};
  for(let i = 0; i < data['items'].length; i++) {
    let vehicle = data['items'][i].v
    let distance = data['items'][i].d
    let cost = data['items'][i].c
    let fuel = data['items'][i].f
    let date = data['items'][i].dt
    let price_per_fuel = Number(cost) / Number(fuel);
    let ld = vehicle in last_distance ? last_distance[vehicle] : 0
    let distance_per_fuel = (Number(distance) - Number(ld)) / Number(fuel);
    last_distance[vehicle] = distance;

    final_data.push({
      v:vehicle,
      d:distance,
      c:cost,
      f:fuel,
      dt:date,
      ppf:price_per_fuel,
      dpf:distance_per_fuel,
    });
  }

  for(let i = final_data.length-1; i >= 0; i--) {
    let row = datatable.tBodies[0].insertRow();
    let vcol = row.insertCell();
    vcol.setAttribute("data-label", "Vehicle")
    vcol.innerHTML = final_data[i].v;

    let dcol = row.insertCell();
    dcol.setAttribute("data-label", "Odometer")
    dcol.innerHTML = final_data[i].d;

    let ccol = row.insertCell();
    ccol.setAttribute("data-label", "Cost")
    ccol.innerHTML = final_data[i].c;

    let fcol = row.insertCell();
    fcol.setAttribute("data-label", "Fuel")
    fcol.innerHTML = final_data[i].f;

    let dtcol = row.insertCell();
    dtcol.setAttribute("data-label", "Date")
    dtcol.innerHTML = final_data[i].dt;

    let ppfcol = row.insertCell();
    ppfcol.setAttribute("data-label", "Cost/Fuel")
    ppfcol.innerHTML = final_data[i].ppf.toFixed(2);

    let dpfcol = row.insertCell();
    dpfcol.setAttribute("data-label", "Distance/Fuel")
    dpfcol.innerHTML = final_data[i].dpf.toFixed(2);
  }
}

function save_settings(event) {
  let vehicleliststr = vehiclelistel.value

  storage.setItem('setting-vehiclelist', vehicleliststr)
  generate_vehicle_selection();
  toggle_settings();
}

function add_record(event) {
  let vehicle = vehicleselection.options[vehicleselection.selectedIndex].value;
  let distance = distanceinput.value;
  let cost = costinput.value;
  let fuel = fuelinput.value;
  let dt = new Date();
  let date = dt.getFullYear() + '-' + dt.getMonth() + '-' + dt.getDay()

  let data = storage.getItem('data');
  if(data === null) {
    data = {'items':[]};
  }
  else {
    data = JSON.parse(data);
  }
  data['items'].push({'v':vehicle,'d':distance,'c':cost,'f':fuel,'dt':date});
  storage.setItem('data', JSON.stringify(data));

  generate_data_table();
}

function clear_records(event) {
  let confirmation = window.confirm("This will remove ALL data stored locally...");
  if(!confirmation) {
    return;
  }

  storage.setItem('data', JSON.stringify({'items':[]}));
  generate_data_table();
  toggle_settings();
}

function export_records(event) {
  let data = storage.getItem('data');
  if(data === null) {
    data = JSON.stringify({'items':[]});
  }
  let datastr = 'data:text/json;charset:utf-8,' + window.encodeURIComponent(data);
  let dt = new Date();
  let anchor = document.createElement('a');
  anchor.setAttribute('href', datastr);
  anchor.setAttribute('download', 'gogojuice-export-'+dt.getFullYear()+'-'+dt.getMonth()+'-'+dt.getDay()+'.json');
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

function init() {
  settingssection.style.display = "none";
  formsection.style.display = "block";
  contentsection.style.display = "block";

  settingsbutton.addEventListener("click", toggle_settings);
  settingssavebutton.addEventListener("click", save_settings);
  addbutton.addEventListener("click", add_record);
  clearbutton.addEventListener("click", clear_records);
  exportbutton.addEventListener("click", export_records);

  generate_vehicle_selection();
  generate_data_table();

  if('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
  }
}


init();
