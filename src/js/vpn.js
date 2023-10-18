const API_URL = `http://${location.hostname}/v3`;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getIdEditBtn(e) {
  // regex to get the vpn_id back
  return e.replace(/btn-edit-/g, '');
}

// get the multi-select values in an array
function getValues(id) {
  let result = [];
  let collection = document.querySelectorAll("#" + id + " option");
  collection.forEach(function (x) {
    if (x.selected) {
      result.push(x.value);
    }
  });
  return result;
  }

async function editVPN(e) {
  const id = getIdEditBtn(e.currentTarget.id);

  const results = await fetchAPIData(`/network/vpn/${id}`);

  document.getElementById('del-vpn').addEventListener('click', (e) => {
    e.preventDefault();
    delVPN(id);
  },
  false,);

  document.getElementById('btn-edit-save').addEventListener('click', (e) => {
    e.preventDefault();
    onSubmitEdit(id);
  },
  false,);

  // add description of VPN
  document.getElementById('edit-vpn-description').innerText = results.description;

  // add multi-select device
  const div = document.getElementById('device-select');
  div.innerHTML = '';

  // select all and select devices options
  const divRadioAll = document.createElement('div');
  divRadioAll.classList = 'form-control';
  const divRadioDevice = document.createElement('div');
  divRadioDevice.classList = 'form-control';
  const radioLabelAll = document.createElement('label');
  radioLabelAll.classList = 'label cursor-pointer';
  const radioLabelDevice = document.createElement('label');
  radioLabelDevice.classList = 'label cursor-pointer';
  
  const radioSpanAll = document.createElement('span');
  radioSpanAll.classList = 'label-text';
  radioSpanAll.innerText = 'All Devices';

  const radioSpanDevice = document.createElement('span');
  radioSpanDevice.classList = 'label-text';
  radioSpanDevice.innerText = 'Select Devices';

  const selectAll = document.createElement('input');
  selectAll.type = 'radio';
  selectAll.name = 'radio-select';
  selectAll.setAttribute('id', 'select-all');
  selectAll.classList = 'radio checked:bg-orange-700 dark:checked:bg-orange-300';

  const selectDevice = document.createElement('input');
  selectDevice.type = 'radio';
  selectDevice.name = 'radio-select';
  selectDevice.setAttribute('id', 'select-device');
  selectDevice.classList = 'radio checked:bg-blue-900 dark:checked:bg-sky-300';

  if (results.devices === 'any') {
    selectAll.checked = true;
  } else {
    selectDevice.checked = true;
  }

  radioLabelAll.appendChild(radioSpanAll);
  radioLabelAll.appendChild(selectAll);
  divRadioAll.appendChild(radioLabelAll);

  radioLabelDevice.appendChild(radioSpanDevice);
  radioLabelDevice.appendChild(selectDevice);
  divRadioDevice.appendChild(radioLabelDevice);

  div.appendChild(divRadioAll);
  div.appendChild(divRadioDevice);
  
  const select = document.createElement('select');
  select.setAttribute('name', 'vpn-devices[]');
  select.setAttribute('id', 'multi-select');
  if (selectAll.checked) {
    select.classList = 'select select-bordered text-sm max-w-xs text-center hidden';
  } else {
    select.classList = 'select select-bordered text-sm max-w-xs text-center';
  }
  select.multiple = true;
  
  // get devices to populate select
  let devices = await fetchAPIData('/devices');
  devices = devices['results'];
  devices.forEach(item => {
    const option = document.createElement('option');
    option.value = item.ip;
    option.text = `${item.name} [${item.ip}]`;

    // check which devices are selected for this VPN
    if (Array.isArray(results.devices)) {
      devArray = results.devices.split(',');
      // check if the ip is in the array of devices
      if (devArray.indexOf(item.ip) > -1) {
        option.selected = true;
      }
    } else if (results.devices === item.ip) { // only one device selected for this VPN
      option.selected = true;
    } else { // we have a string of IPs, convert to array and check the options for the IPs
      const devicesArray = results.devices.split(' ');
      if (devicesArray.indexOf(item.ip) > -1) {
        option.selected = true;
      }
    }
    
    
    select.appendChild(option);
  });

  div.appendChild(select);

  // add a listener to check for change on radio buttons
  const radioEvent = document.querySelectorAll('input[type="radio"]');
  radioEvent.forEach((item) => {
    item.addEventListener('input', (e) => {
      if (e.target.id === 'select-device') {
        // trigger to show multi select device
        select.classList.toggle('hidden');
      } else if (e.target.id === 'select-all') {
        select.classList.toggle('hidden');
      }
    });
  });

  // Show modal on button click
  const modal = document.getElementById('modal-edit');
  modal.showModal();
}

function showSpinner() {
  document.getElementById('overview').outerHTML = '<div id="overview" class="w-full h-screen pt-10 text-center"><span class="loading loading-spinner"></span></div>';
}
function hideSpinner() {
  document.getElementById('overview').remove('w-full h-screen pt-10 text-center"><span class="loading loading-spinner');
}

// no async as we want it to block further processing until confirm
async function delVPN(id) {
  const modal = document.getElementById('modal-edit');

  postAPIDel(id);

  // confirm deletion
  // @TODO delete confirm

  await sleep(300);
  getVPNs();
  modal.close();

}

async function toggleVPN(e) {  
  const id = e.target.id.replace(/vpn-/g, '');
  const state = e.target.checked;
  const div = document.getElementById(id);
  const h1  = div.children[0];
  const p =div.children[1];
  const p2 = div.children[2];

  if (state) {
    postAPIAction(id, 'start');
    h1.classList = 'text-base enable-cursor font-medium text-gray-700 dark:text-zinc-200 overflow-hidden';
    p.classList = 'text-sm font-light text-gray-700 dark:text-zinc-200';
    p2.classList = 'text-sm font-light text-gray-700 dark:text-zinc-200';
  } else {
    postAPIAction(id, 'stop');
    h1.classList = 'text-base enable-cursor font-medium text-gray-400 dark:text-zinc-400 overflow-hidden';
    p.classList = 'text-sm font-light text-gray-400 dark:text-zinc-400';
    p2.classList = 'text-sm font-light text-gray-400 dark:text-zinc-400';
  }

}

async function getVPNs() {
  showSpinner();
  const results = await fetchAPIData('/network/vpn');
  const vpns = results['results'];

  // hide spinner when we appendChild
  document.querySelector('#overview').outerHTML = '<div id="overview" class="grid gird-cols-1 md:grid-cols-2 xl:grid-cols-3 m-2"></div>';
  const div = document.querySelector('#overview');

  vpns.forEach(item => {
    const divP = document.createElement('div');
    divP.classList = 'p-2';

    const divCard = document.createElement('div');
    divCard.classList = 'bg-gray-100 dark:bg-zinc-800 dark:border-zinc-700 p-2 border rounded-lg';

    const divGrid = document.createElement('div');
    divGrid.classList = 'grid grid-cols-4 gap-2';
    divGrid.setAttribute('id', `vpnId-${item.vpn_id}`);

    const divClick = document.createElement('div');
    divClick.classList = 'edit-btn col-span-3 mr-2 cursor-pointer';
    divClick.setAttribute('id', `${item.vpn_id}`);
    const h1 = document.createElement('h1');
    const status = item.state;
    if (status === 'up') {
      h1.classList = 'text-base enable-cursor font-medium text-gray-700 dark:text-zinc-200 overflow-hidden';
      h1.innerHTML = `${item.description}`;
    } else {
      h1.classList = 'text-base enable-cursor font-medium text-gray-400 dark:text-zinc-400 overflow-hidden';
      h1.innerHTML = `${item.description}`;
    }

    const p = document.createElement('p');
    if (status === 'up') {
      p.classList = 'text-sm font-light text-gray-600 dark:text-zinc-300';
    } else {
      p.classList = 'text-sm font-light text-gray-400 dark:text-zinc-400';
    }
    p.innerHTML = `<small>ENDPOINT:</small> ${item.endpoint}:${item.port}`;
    
    const pDevice = document.createElement('p');
    if (status === 'up') {
      pDevice.classList = 'text-sm font-light text-gray-600 dark:text-zinc-300';
    } else {
      pDevice.classList = 'text-sm font-light text-gray-400 dark:text-zinc-400';
    }
    let devicesDesc;
    if (Array.isArray(item.devices)) {
      devicesDesc = item.devices.forEach ((e) => {
        `[${e}]`;
      });
    } else {
      devicesDesc = item.devices;
    }
    pDevice.innerHTML = `<small>DEVICES:</small> ${devicesDesc}`;

    const divSelect = document.createElement('div');
    divSelect.className = 'text-right';

    const divToggle = document.createElement('input');
    divToggle.type = 'checkbox';
    divToggle.setAttribute('id', `vpn-${item.vpn_id}`);
    divToggle.classList = 'toggle toggle-success';
    if (status === 'up') {
        divToggle.checked = true;
    } else {
        divToggle.checked = false;
    }

    divClick.appendChild(h1);
    divClick.appendChild(p);
    divClick.appendChild(pDevice);

    divSelect.appendChild(divToggle);

    divGrid.appendChild(divClick);
    divGrid.appendChild(divSelect);

    divCard.appendChild(divGrid);
    divP.appendChild(divCard);
    div.appendChild(divP);

    divToggle.addEventListener('change', toggleVPN);
    document.getElementById(`${item.vpn_id}`).addEventListener('click', editVPN);
  });
}

async function addConfig() {
  // Show modal on button click
  const modal = document.getElementById('modal-add');

   // add event listener for optional settings show
   const btnOptional = document.getElementById('btn-vpn-optional');

   btnOptional.addEventListener('click', (e) => {
    e.preventDefault();
    const divToggle = document.getElementById('add-optional-settings');

    if (divToggle.className !== 'block') {
      divToggle.classList.replace('hidden', 'block');
      btnOptional.innerText = 'Hide Optional Settings';
    } else {
      divToggle.classList.replace('block', 'hidden');
      btnOptional.innerText = 'Show Optional Settings';
    }
  });

  // create select device access
  modal.showModal();
}

function importConfig() {
  // Show import configuration modal
  const modal = document.getElementById('modal-import');
  modal.showModal();

  // read uploaded file and disect for sending to server as addConfig()
  const fileInput  = document.getElementById('vpn-file');
  const reader = new FileReader();
  let error, private_key, address, dns_1, public_key, allowed_ips, allowed_ips_clean, endpoint, port, description;

  function handleEvent(e) {

    console.log(`${e.type}: ${e.loaded} bytes transferred`);
  
    if (e.type === 'load') {
        // disect the data from the uploaded file
        const re_private_key = /PrivateKey[\s+]=[\s]+([\w\+\/\=]+)/g;
        private_key = re_private_key.exec(reader.result);
        private_key = private_key[1];

        // fix this regex still
        const re_address = /Address[\s]+=[\s]+(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\/\d{1,2})/g;
        address = re_address.exec(reader.result);
        address = address[1];

        const re_dns = /DNS[\s]+=[\s]+(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/g;
        dns_1 = re_dns.exec(reader.result);
        dns_1 = dns_1[1];

        const re_public_key = /PublicKey[\s+]=[\s]+([\w\+\/\=]+)/g;
        public_key = re_public_key.exec(reader.result);
        public_key = public_key[1];

        const re_allowed_ips = /AllowedIPs = ([\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\/\d{1,2}\,\s]+)/g;
        allowed_ips = re_allowed_ips.exec(reader.result);
        allowed_ips_clean = allowed_ips[1].trim();

        const re_endpoint = /Endpoint[\s]+=[\s]+(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\:\d{1,5}/g;
        endpoint = re_endpoint.exec(reader.result);
        endpoint = endpoint[1];

        const re_port = /Endpoint[\s]+=[\s]+\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\:(\d{1,5})/g;
        port = re_port.exec(reader.result);
        port = port[1];

        if (port >= 1 && port <= 65535) {
        // port is correct
        } else {
        error = "Port is not in the correct range";
        }

        description = `VPN-${endpoint}`;

        document.getElementById('btn-import-save').addEventListener('click', () => {
    
            if (!error) {
                let formParams = {
                    description,
                    private_key,
                    address,
                    dns_1,
                    public_key,
                    'allowed_ips': allowed_ips_clean,
                    endpoint,
                    port,
                };
        
                postAPIData('/network/vpn/add', formParams);
            }
        });
    }
  }

  function addListeners(reader) {
    reader.addEventListener("loadstart", handleEvent);
    reader.addEventListener("load", handleEvent);
    reader.addEventListener("loadend", handleEvent);
    reader.addEventListener("progress", handleEvent);
    reader.addEventListener("error", handleEvent);
    reader.addEventListener("abort", handleEvent);
  }

  // read file on file select
  function handleSelected(e) {
      const selectedFile = fileInput.files[0];
      if (selectedFile) {
        addListeners(reader);
        reader.readAsText(selectedFile);
      }
  }

  fileInput.addEventListener('change', handleSelected);

  // add another event listener so we can allow the import to finish and show the new vpn right away
  document.getElementById('btn-import-save').addEventListener('click', async () => {
    await sleep(400);
    getVPNs();
    modal.close();
    //selectedFile.value = ''; // clear the input file
    fileInput.value = '';
  });
}

async function onSubmitEdit(id) {
  //function submitting the data input
  const modal = document.getElementById('modal-edit');

  let formParams = {};
  const formAdd = document.getElementById('form-edit-configuration');
  const deviceAll = document.getElementById('select-all');
  const device = document.getElementById('select-device');
  let vpnDevices;
  if (device.checked) {
    vpnDevices = getValues('device-select');
    vpnDevices = vpnDevices.toString();
    vpnDevices = vpnDevices.replace(/\,/g, ' ');
  } else if (deviceAll.checked) {
    vpnDevices = 'any';
  }
  const action = "device";
  
  postAPIDevice(id, action, vpnDevices);

  await sleep(300);
  getVPNs();
  modal.close();
  //clear vpnDevices array
  vpnDevices = '';
}

async function onSubmit() {
  //function submitting the data input
 const modal = document.getElementById('modal-add');

  let formParams = {};
  const formAdd = document.getElementById('form-configuration');
  const formData = new FormData(formAdd);
  for (const pair of formData.entries()) {
    // console.log(`${pair[0]}, ${pair[1]}`);
    formParams[pair[0]] = pair[1].trim();
  }

  postAPIData('/network/vpn/add', formParams);
  getVPNs();
  modal.close();
  formParams = '';
}

async function fetchAPIData(apiEndpoint) {
  const response = await fetch(
    `${API_URL}${apiEndpoint}`
  );

  const data = await response.json();

  return data;
};

async function postAPIData(apiEndpoint, {description, private_key, address, dns_1, dns_2, public_key, allowed_ips, endpoint, port}) {
  const response = await fetch(
    `${API_URL}${apiEndpoint}`, {
      method: 'POST',
      body: JSON.stringify({
        description,
        private_key,
        address,
        dns_1,
        dns_2,
        public_key,
        allowed_ips,
        endpoint,
        port
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  const data = await response.json();

  return data;
};

async function postAPIAction(id, action) {
  const response = await fetch(
    `${API_URL}/network/vpn/manage`, {
      method: 'POST',
      body: JSON.stringify({
        id,
        action,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  const data = await response.json();

  return data;
};

async function postAPIDevice(id, action, devices) {
  const response = await fetch(
    `${API_URL}/network/vpn/manage`, {
      method: 'POST',
      body: JSON.stringify({
        id,
        action,
        devices,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  const data = await response.json();

  return data;
};

async function postAPIDel(id) {
  const response = await fetch(
    `${API_URL}/network/vpn/del`, {
      method: 'POST',
      body: JSON.stringify({
        id,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  const data = await response.json();

  return data;
};

document.addEventListener('DOMContentLoaded', () => {
  getVPNs();
});

// event listeners
document.getElementById('btn-add-vpn').addEventListener('click', addConfig);
// document.getElementById('btn-back').addEventListener('click', () => history.back());
document.getElementById('btn-import-vpn').addEventListener('click', importConfig);
document.getElementById('btn-add-save').addEventListener('click', onSubmit);
// document.getElementById('btn-edit-save').addEventListener('click', onSubmit);

