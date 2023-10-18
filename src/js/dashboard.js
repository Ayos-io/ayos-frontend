const socket = new WebSocket(`ws://${location.hostname}:8082`);
const API_URL = `http://${location.hostname}/v3`;

function createNewItem(name, icon, ip, ds, us, id, pc, inet) {
  const div = document.createElement('div');
  div.className = 'p-2';
  div.setAttribute('id', id);

  const divContainer = document.createElement('div');
  divContainer.className = ('bg-gray-100 dark:bg-zinc-800 dark:border-zinc-700 p-2 border rounded-lg');

  const divGrid = document.createElement('div');
  divGrid.className = 'grid grid-cols-4 gap-2';

  const divDesc = document.createElement('div');
  divDesc.classList = 'edit-btn col-span-3 mr-2 cursor-pointer';
  divDesc.setAttribute('id', `btn-${id}`);

  const divDescHeader = document.createElement('h1');
  divDescHeader.className = 'text-base font-medium text-gray-700 dark:text-zinc-200 overflow-hidden';
  if (inet === 0) {
    divDescHeader.innerHTML= `<div class="text-gray-400 dark:text-zinc-400">${name}</div>`;
  }  else if (pc !== 0) {
    divDescHeader.innerHTML = `${name} <div class="badge text-sm border-orange-800 text-gray-100 rounded-full bg-orange-700">${pc}</div>`;
  } else {
    divDescHeader.innerHTML = `${name}`;
  }
  
  const divDescPara = document.createElement('p');
  if (inet === 0) {
    divDescPara.className = 'text-sm text-gray-300 dark:text-zinc-400';
  } else {
    divDescPara.className = 'text-sm text-gray-600 dark:text-zinc-300';
  }
  divDescPara.innerText = ip;

  const divRight = document.createElement('div');
  divRight.classList ='text-right';
  const divToggle = document.createElement('input');
    divToggle.type = 'checkbox';
    divToggle.setAttribute('id', `inet-${ip}`);
    divToggle.classList = 'toggle toggle-success';
    if (inet === 0) {
        divToggle.checked = false;
    } else {
        divToggle.checked = true;
    }

  const divIcon = document.createElement('div');
  divIcon.innerHTML = icon ? '<img class="w-8 h-8 float-right opacity-75" width="32" height="32" src="images/topology_icons/' + icon.toLowerCase() + '" />' : '<img class="w-8 h-8 float-right opacity-75" width="32" height="32" src="/images/topology_icons/unknown.png" />';
  divIcon.classList = 'dark:opacity-100';
  divIcon.setAttribute('id', `icon-${id}`);

  const divSpeed = document.createElement('div');
  divSpeed.className = 'col-span-3';

  const divSpeedDs = document.createElement('p');
  divSpeedDs.className = 'text-xs font-semibold text-blue-900 dark:text-sky-300';
  divSpeedDs.setAttribute('id', `ds-${id}`);
  divSpeedDs.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="relative inline h-4 w-4"><path fill-rule="evenodd" d="M10 5a.75.75 0 01.75.75v6.638l1.96-2.158a.75.75 0 111.08 1.04l-3.25 3.5a.75.75 0 01-1.08 0l-3.25-3.5a.75.75 0 111.08-1.04l1.96 2.158V5.75A.75.75 0 0110 5z" clip-rule="evenodd" /></svg> ${ds}`;

  const divSpeedUs = document.createElement('p');
  divSpeedUs.className = 'text-xs font-semibold text-orange-700 dark:text-orange-300';
  divSpeedUs.setAttribute('id', `us-${id}`);
  divSpeedUs.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="relative inline h-4 w-4"><path fill-rule="evenodd" d="M10 15a.75.75 0 01-.75-.75V7.612L7.29 9.77a.75.75 0 01-1.08-1.04l3.25-3.5a.75.75 0 011.08 0l3.25 3.5a.75.75 0 11-1.08 1.04l-1.96-2.158v6.638A.75.75 0 0110 15z" clip-rule="evenodd" /></svg> ${us}`;;

  divDesc.appendChild(divDescHeader);
  divDesc.appendChild(divDescPara);

  divSpeed.appendChild(divSpeedDs);
  divSpeed.appendChild(divSpeedUs);

  divGrid.appendChild(divDesc);
  divRight.appendChild(divToggle);
  divGrid.appendChild(divRight);
  divGrid.appendChild(divSpeed);
  divGrid.appendChild(divIcon);

  divContainer.appendChild(divGrid);

  div.appendChild(divContainer);

  document.querySelector('#devices-online').appendChild(div);
}

// current bandwidth consumption
function updateBwCurrent(ds, us) {
  document.querySelector('#bw-ds-current').innerText = ds;
  document.querySelector('#bw-us-current').innerText = us;
}

// current bandwidth devices online
function updateBwDevice(ds,us, id) {
  const elemCheck = document.getElementById(`ds-${id}`);
  if (elemCheck) {
    document.getElementById(`ds-${id}`).innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="relative inline h-4 w-4"><path fill-rule="evenodd" d="M10 5a.75.75 0 01.75.75v6.638l1.96-2.158a.75.75 0 111.08 1.04l-3.25 3.5a.75.75 0 01-1.08 0l-3.25-3.5a.75.75 0 111.08-1.04l1.96 2.158V5.75A.75.75 0 0110 5z" clip-rule="evenodd" /></svg> ${ds}`;
    document.getElementById(`us-${id}`).innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="relative inline h-4 w-4"><path fill-rule="evenodd" d="M10 15a.75.75 0 01-.75-.75V7.612L7.29 9.77a.75.75 0 01-1.08-1.04l3.25-3.5a.75.75 0 011.08 0l3.25 3.5a.75.75 0 11-1.08 1.04l-1.96-2.158v6.638A.75.75 0 0110 15z" clip-rule="evenodd" /></svg> ${us}`;
  } else {
    createDeviceOverview();
  }
}

// calculate uptime from time ticks
function format(ticks){
  let days = Math.floor(ticks / 8640000);
  let hours = Math.floor(ticks % 8640000 / 360000);
  let minutes = Math.floor(ticks % 360000 /6000);

  if (days === 0) {
    days = '';
  } else if (days === 1) {
    days = `${days} day`;
  } else {
    days = `${days} days`;
  }
  if (hours === 0) {
    hours = '';
  } else if (hours ===1) {
    hours = `${hours} hr and`;
  } else {
    hours = `${hours} hrs and`;
  }
  if (minutes === 1) {
    minutes = `${minutes} min`;
  } else {
    minutes = `${minutes} mins`;
  }
  return `${days} ${hours} ${minutes}`;
}

async function createDeviceOverview() {
  showSpinner('devices-spinner');
  const results = await fetchAPIData('/dashboard/devices');
  updateBwCurrent(results['ds_bw'], results['us_bw']);

  // clear devices online
  const devicesOnline = document.querySelector('#devices-online');
  devicesOnline.innerHTML = '';

  const clientList = results['results'];

  const devicesTotal = document.querySelector('#devices-total');
  devicesTotal.innerHTML = `Devices Online <span id="total-online" class="p-1 rounded shadow w-6 bg-white text-orange-700 font-semibold">${clientList.length}</span>`;

  clientList.forEach((device) => {
      createNewItem(device.name, device.icon, device.ip, device.ds, device.us, device.id, device.pc, device.inet);
      document.getElementById(`inet-${device.ip}`).addEventListener('change', inetToggle);
      document.getElementById(`icon-${device.id}`).addEventListener('click', iconChange);
  })
  hideSpinner();
  modalStart();
}

function iconChange(e) {
  const id = e.currentTarget.id.replace(/icon-/g, '');
  const modal = document.getElementById('modal-icon');
  modal.showModal();

  // read uploaded file
  const fileInput  = document.getElementById('icon-file');
  const reader = new FileReader();

  function handleEvent(e) {
    console.log(`${e.type}: ${e.loaded} bytes transferred`);
  }

  document.getElementById('btn-icon-save').addEventListener('click', () => {
    console.log(`save image`);
  });

  function addListeners(reader) {
    reader.addEventListener("loadstart", handleEvent);
    reader.addEventListener("load", handleEvent);
    reader.addEventListener("loadend", handleEvent);
    reader.addEventListener("progress", handleEvent);
    reader.addEventListener("error", handleEvent);
    reader.addEventListener("abort", handleEvent);
  }

  const previewIcon = document.getElementById('preview-icon');

  function handleSelected(e) {
    const selectedFile = fileInput.files[0];

    if (/\.(jpe?g|png|gif)$/i.test(selectedFile.name)) {
      addListeners(reader);
      reader.readAsDataURL(selectedFile);
    }
    else {
      const errorSpan = document.createElement('span');
      errorSpan.classList = 'text-danger font-semibold';
      errorSpan.innerText = 'Please use an image file like .jgp, .png or .gif';
      previewIcon.appendChild(errorSpan);
      selectedFile.value = ''; // clear the input file
      fileInput.value = '';
    }
  }

  fileInput.addEventListener('change', handleSelected); 

  // add another event listener so we can allow the import to finish and show the new vpn right away
  document.getElementById('btn-icon-save').addEventListener('click', async () => {
    await sleep(400);
    createDeviceOverview();
    modal.close();
    fileInput.value = '';
  });
  console.log(`icon click ${id}`);
  // const results = await fetchAPIData(`/dashboard/device/${id}`);
  // @TODO icon change
}

async function getBandwidth() {

  showSpinner('bandwidth-spinner');
  const results = await fetchAPIData('/dashboard');

  document.querySelector('#bw-ds-today').innerText = results['bw_ds_day'];
  document.querySelector('#bw-us-today').innerText = results['bw_us_day'];
  document.querySelector('#bw-ds-month').innerText = results['bw_ds_month'];
  document.querySelector('#bw-us-month').innerText = results['bw_us_month'];
  document.querySelector('#month').innerText = results['month'];
  const internetStatus = results['internet'];
  const inetId = document.querySelector('#internet-status');
  // Uptime
  let upTime = parseInt(results['uptime']); 

  // we if internetStatus === 0, we actually want to call another API which checks DNS, IP, DHCP, etc. to see 
  // if we can pinpoint what the problem is better
  internetStatus === 1 ? inetId.innerHTML = `<span class="text-green-600 font-semibold">Up and running</span><br /><p class="pt-2 text-gray-500 text-sm">${format(upTime)}</p>`
      : inetId.innerHTML = '<span class="text-red-600 font-semibold">Unable to connect to the internet</span>';

  hideSpinner();
}

// add a timeout before we connect to the websocket to allow content to load
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Create WebSocket connection.
async function startWebsocket() {
  await sleep(1000);
  // Listen for messages
  socket.onmessage = (event) => {
    const bwCurrent = JSON.parse(event.data);
    updateBwCurrent(bwCurrent['ds_bw'], bwCurrent['us_bw']);

    const clientList = bwCurrent['results'];
    
    clientList.forEach((d) => {
      updateBwDevice(d['ds'], d['us'], d['id']);
    })

    const devicesTotal = document.querySelector('#total-online');
    devicesTotal.innerText = clientList.length;

    // document.querySelector('#devices-online').appendChild(div);
  };
}

async function modalStart() {
  await sleep(500);
 
  // Show device modal on button click
  const btn = document.getElementsByClassName('edit-btn');
  const btnArray = Array.from(btn);
  btnArray.forEach(dev => dev.addEventListener('click', e => {
    const deviceInfo = getDeviceInfo(e.currentTarget.id);
  }));
}

function onToggle(e) {
  // function for toggling parental rules
  const ip = document.getElementById('modal-ip').innerText;
  const service = e.currentTarget.id;

  if (e.target.checked) {
    // enabled = 1 we means we block the service
    postAPIData('/parental/manage', { "ip": ip, "service": service, "enabled": 1});
    e.target.previousElementSibling.classList = 'label-text';
  }
  else {
    // enabled = 0 , means we allow the service
    postAPIData('/parental/manage', { "ip": ip, "service": service, "enabled": 0});
    e.target.previousElementSibling.classList = 'label-text grayscale opacity-50';
  }

}

function inetToggle(e) {
  // function for toggling internet
  const ip = e.currentTarget.id.replace(/inet-/g, '');
  
  if (e.target.checked) {
    // enabled = 0 we means we allow the service
    postAPIData('/network/internet/device', { "ip": ip, "enabled": 0});
  }
  else {
    // enabled = 1 , means we block the service
    postAPIData('/network/internet/device', { "ip": ip, "enabled": 1});
  }

}

function showSpinner(e) {
  const spinner = document.getElementById(e);
  const span = document.createElement('span');
  span.classList = 'text-center loading loading-spinner mt-10';
  const div = document.createElement('div');
  div.classList = 'w-full text-center div-spinner';

  div.appendChild(span);
  spinner.appendChild(div);
}
function hideSpinner() {
  document.querySelector('.loading-spinner').remove();
  document.querySelector('.div-spinner').remove();
}

// function to get device configuration data
async function getDeviceInfo(e) {

  const btnId = e;
  const deviceInfo = document.getElementById(btnId).innerHTML;

  document.getElementById(btnId).innerHTML = '<span class="loading loading-spinner"></span>';

  const id = e.replace(/btn-/g, '');
  
  const modal = document.getElementById('modal');
  const results = await fetchAPIData(`/dashboard/device/${id}`);

  // build the list of pc services to allow to toggle
  let pcServices = await fetchAPIData(`/parental/services`);
  pcServices = pcServices['services'];
  
  const span = document.querySelectorAll('.label-text');
  span.forEach(e => {
    e.classList = 'label-text';
  });

  const header = document.getElementById('modal-name-header');
  if (results['icon']) {
    header.innerHTML = `<img id="edit-icon-${results['id']}" class="w-7 h-7 inline" src="images/topology_icons/${results['icon']}" /> <div id="edit-name-${results['id']}" class="inline" contenteditable="true">${results['name']}</div>`;
  } else {
    header.innerHTML = `<img id="edit-icon-${results['id']}" class="w-7 h-7 inline unknown-device" src="images/topology_icons/unknown.png" /> <div id="edit-name-${results['id']}" class="inline" contenteditable="true">${results['name']}</div>`;
  }

  const headerIp = document.getElementById('modal-ip');
  headerIp.innerHTML = `<span class="text-sm text-gray-600 dark:text-zinc-400">${results['ip']}</span>`;

  // get element where we want to append the list to
  const divList = document.getElementById('pc-services-list');
  divList.innerHTML = '';

  // Create a list of toggable pc services
  pcServices.forEach(e => {
    const divForm = document.createElement('div');
    
    const divLabel = document.createElement('label');
    divLabel.classList = 'label cursor-pointer';
    
    const divSpan = document.createElement('span');
    divSpan.setAttribute('id', `span-${e['service']}`);
    divSpan.innerHTML = `<img src="images/services/${e['service']}.png" height="32" width="32" class="p-0 pb-3 inline"/> ${e['label']}`;
    const divCheck = document.createElement('input');
    divCheck.type = "checkbox";
    divCheck.classList = 'toggle toggle-error';
    divCheck.setAttribute('id', e['service']);

    // check if this service is assigned to this device for toggle status
    const parental = results['parental'];
    const serviceMatch = parental.filter(item => item.service === e['service']); // get what services for the device are set
    const serviceEnabled = parental.filter(item => item.service === e['service'] && item.enabled === '1');

    if (Object.keys(serviceMatch).length === 1 && Object.keys(serviceEnabled).length === 0) {
      divCheck.checked = false;
      divSpan.classList = 'label-text grayscale opacity-50';
    } else if (Object.keys(serviceMatch).length === 1 && Object.keys(serviceEnabled).length === 1) {
      divCheck.checked = true;
      divSpan.classList = 'label-text';
    } else if (Object.keys(serviceMatch).length === 0 && e['enabled'] === 1) {
      divCheck.checked = false;
      divSpan.classList = 'label-text grayscale opacity-50';
    } else {
      divForm.classList = 'hidden';
    }

    divLabel.appendChild(divSpan);
    divLabel.appendChild(divCheck);
    divForm.appendChild(divLabel);
    divList.appendChild(divForm);
  });

  // create toggle eventlisteners
  pcServices.forEach(e => {
    document.getElementById(e['service']).addEventListener('change', onToggle);
  });

  // check editing of name or icon to enable save button
  const saveBtn = document.getElementById('btn-edit-save');
  const editName = document.getElementById(`edit-name-${results['id']}`).addEventListener('click', (() => {
    // enable save
    saveBtn.innerHTML = 'Save';
    saveBtn.disabled = false;
  }));

  // save change of name
  saveBtn.addEventListener('click', (() => {
    onEditSubmit(`edit-name-${results['id']}`);
  }))

  modal.showModal();
  // reset text of card
  document.getElementById(btnId).innerHTML= deviceInfo;
}

document.addEventListener('DOMContentLoaded', () => {
  createDeviceOverview();
  getBandwidth();
  startWebsocket();
});

async function onEditSubmit(e) {
  const modal = document.getElementById('modal');

  let deviceName = document.getElementById(e).innerText;
  // let icon = document.getElementById()
  console.log(`edit name ${deviceName}`);
  const id = e.replace(/edit-name-/g, '');
  console.log(`id ${id}`);

  if (deviceName) {
    icon = '';
    postAPIDevice('/device/update', {id, 'name': deviceName, icon});
  } else if (icon) {
    name = '';
    postAPIDevice('/device/update', {id, 'name': deviceName, icon});
  }

  createDeviceOverview();
  modal.close();
  const saveBtn = document.getElementById('btn-edit-save');
  saveBtn.innerHTML = '';
  saveBtn.disabled = true;
}

async function fetchAPIData(apiEndpoint) {
  const response = await fetch(
    `${API_URL}${apiEndpoint}`
  );

  const data = await response.json();

  return data;
};

async function postAPIData(apiEndpoint, {ip, service, enabled}) {
  const response = await fetch(
    `${API_URL}${apiEndpoint}`, {
      method: 'POST',
      body: JSON.stringify({
        ip,
        service,
        enabled,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    }
    
  );

  const data = await response.json();

  await sleep(300);
  createDeviceOverview();

  return data;
};

async function postAPIDevice(apiEndpoint, {id, 'name': deviceName, icon}) {

  const response = await fetch(
    `${API_URL}${apiEndpoint}`, {
      method: 'POST',
      body: JSON.stringify({
        id,
        'name': deviceName,
        icon,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    }
    
  );

const data = await response.json();

  await sleep(300);
  createDeviceOverview();

  return data;
};