const API_URL = `http://${location.hostname}/v3`;

function onToggle(e) {
    // function for toggling rules
    const dhcp = document.getElementById('dhcp');
 
    if (e.target.checked) {
        postAPIToggle('/dhcp/manage', {"enabled": 1});
        dhcp.classList = 'text-base enable-cursor text-gray-700 dark:text-zinc-200';
    }
    else {
        postAPIToggle('/dhcp/manage', {"enabled": 0});
        dhcp.classList = 'text-base enable-cursor text-gray-400 dark:text-zinc-400';
    }
  }

  function onServiceToggle(e) {
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

async function fetchAPIData(apiEndpoint) {
  const response = await fetch(
    `${API_URL}${apiEndpoint}`
  );

  const data = await response.json();

  return data;
};

async function postAPIToggle(apiEndpoint, {enabled}) {
  const response = await fetch(
    `${API_URL}${apiEndpoint}`, {
      method: 'POST',
      body: JSON.stringify({
        enabled,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    }
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


function createNewItem(name, icon, ip, id, pc, inet, online) {
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
  if (inet === '0') {
    divDescHeader.innerHTML= `<div class="text-gray-400 dark:text-zinc-400">${name}</div>`;
  }  else if (pc !== 0) {
    divDescHeader.innerHTML = `${name} <div class="badge text-sm border-orange-800 text-gray-100 rounded-full bg-orange-700">${pc}</div>`;
  } else {
    divDescHeader.innerHTML = `${name}`;
  }
  
  const divDescPara = document.createElement('p');
  if (inet === '0') {
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
    if (inet === '0') {
        divToggle.checked = false;
    } else {
        divToggle.checked = true;
    }

  const divIcon = document.createElement('div');
  divIcon.innerHTML = icon ? '<img class="w-8 h-8 float-right opacity-75" width="32" height="32" src="images/topology_icons/' + icon.toLowerCase() + '" />' : '<img class="w-8 h-8 float-right opacity-75" width="32" height="32" src="/images/topology_icons/unknown.png" />';
  divIcon.classList = 'dark:opacity-100';

  const divSpeed = document.createElement('div');
  divSpeed.className = 'col-span-3';

  const divStatus = document.createElement('p');
  divStatus.className = online ? 'font-semibold text-green-600 dark:text-green-300' : 'text-gray-600 dark:text-zinc-300';
  divStatus.innerHTML = online ? 'Active' : 'Offline';

  divDesc.appendChild(divDescHeader);
  divDesc.appendChild(divDescPara);
  divSpeed.appendChild(divStatus);

  divGrid.appendChild(divDesc);
  divRight.appendChild(divToggle);
  divGrid.appendChild(divRight);
  divGrid.appendChild(divSpeed);
  divGrid.appendChild(divIcon);

  divContainer.appendChild(divGrid);

  div.appendChild(divContainer);

  document.querySelector('#devices').appendChild(div);
}

async function getData() {
  const results = await fetchAPIData('/dhcp');

  const dhcp = document.getElementById('dhcp');

  const divToggle = document.createElement('input');
  divToggle.type = 'checkbox';
  divToggle.setAttribute('id', `block-toggle`);
  divToggle.classList = 'toggle toggle-success';
  if (results['service'] === 'enabled') {
      divToggle.checked = true;
      dhcp.classList = 'text-base enable-cursor text-gray-700 dark:text-zinc-200';
  } else {
      divToggle.checked = false;
      dhcp.classList = 'text-base enable-cursor text-gray-400 dark:text-zinc-400';
  }

  const manage = document.getElementById('dhcp-manage');
  manage.appendChild(divToggle);
}

async function createDeviceOverview() {
  showSpinner('devices-spinner');
  const results = await fetchAPIData('/devices');

  // clear devices
  const devicesAll = document.querySelector('#devices');
  devicesAll.innerHTML = '';

  const clientList = results['results'];

  const devicesTotal = document.querySelector('#devices-total');
  devicesTotal.innerHTML = `Devices <span id="total-online" class="p-1 rounded shadow w-6 bg-white text-orange-700 font-semibold">${clientList.length}</span>`;

  clientList.forEach((device) => {
      createNewItem(device.name, device.icon, device.ip, device.id, device.pc, device.inet, device.online);
      document.getElementById(`inet-${device.ip}`).addEventListener('change', inetToggle);
  })
  hideSpinner();
  modalStart();
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
      console.log(`service true but disabled ${e['service']}`);
      divCheck.checked = false;
      divSpan.classList = 'label-text grayscale opacity-50';
    } else if (Object.keys(serviceMatch).length === 1 && Object.keys(serviceEnabled).length === 1) {
      console.log(`service true ${e['service']}`);
      divCheck.checked = true;
      divSpan.classList = 'label-text';
    } else if (Object.keys(serviceMatch).length === 0 && e['enabled'] === 1) {
      console.log(`service false ${e['service']}`);
      divCheck.checked = false;
      divSpan.classList = 'label-text grayscale opacity-50';
    } else {
      console.log(`both false ${e['service']}`);
      divForm.classList = 'hidden';
    }

    divLabel.appendChild(divSpan);
    divLabel.appendChild(divCheck);
    divForm.appendChild(divLabel);
    divList.appendChild(divForm);
  });

  // create toggle eventlisteners
  pcServices.forEach(e => {
    document.getElementById(e['service']).addEventListener('change', onServiceToggle);
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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
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

// event listeners
document.addEventListener('DOMContentLoaded', () => {
  getData();
  createDeviceOverview();
});

document.getElementById('dhcp-manage').addEventListener('change', onToggle); 
document.getElementById('btn-back').addEventListener('click', () => history.back());

