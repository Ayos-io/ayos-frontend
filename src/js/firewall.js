const API_URL = `http://${location.hostname}/v3`;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getIdEditBtn(e) {
  // regex to get the vpn_id back
  return e.replace(/btn-edit-/g, '');
}

async function editRule(e) {
  const id = getIdEditBtn(e.currentTarget.id);
  const results = await fetchAPIData(`/network/firewall/${id}`);
  const rule = results['results'][0];

  // document.getElementById('del-vpn').addEventListener('click', delVPN);
  document.getElementById('del-vpn').addEventListener('click', (e) => {
    e.preventDefault();
    delConfig(id);
  },
  false,);

  const editRule = document.getElementById('edit-rule');

  if (rule.type === 'block') {
      editRule.innerHTML = `${rule.from} -> ${rule.to}`;
  } else {
      editRule.innerHTML = `${rule.from} -> ${rule.to}:${rule.port ? rule.port : ''}`;
  }

  // Show modal on button click
  const modal = document.getElementById('modal-edit');
  modal.showModal();

}

async function getRules() {
  // spinner
  showSpinner();

  const results = await fetchAPIData('/network/firewall');
  const rules = results['results'];

  let blockExists;
  let forwardExists;

  // port forwarding
  const divPf = document.querySelector('#port-forward');
  divPf.innerHTML = '';
  divPf.classList = '';

  // block connections
  const divBc = document.querySelector('#block-connection');
  divBc.innerHTML = '';

  const divGridPf = document.createElement('div');
  divGridPf.classList = 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 m-2';
  const divGridBc = document.createElement('div');
  divGridBc.classList = 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 m-2';

  rules.forEach(item => {
    const div1 = document.createElement('div');
    div1.classList = 'p-2';

    const div12 = document.createElement('div');
    div12.classList = 'bg-gray-100 dark:bg-zinc-800 dark:border-zinc-700 p-2 border rounded-lg';

    const div123 = document.createElement('div');
    div123.classList = 'grid grid-cols-4 gap-2';

    const divEdit = document.createElement('div');
    divEdit.classList = 'edit-btn col-span-3 mr-2 cursor-pointer';
    divEdit.setAttribute('id', `${item.id}`);

    const h1 = document.createElement('h1');

    // check if enabled
    const status = +item.enabled;
    const port = item.port;

    if (status) {
      h1.classList = 'text-base enable-cursor font-medium text-gray-700 dark:text-zinc-200 overflow-hidden';
    } else {
      h1.classList = 'text-base enable-cursor font-medium text-gray-400 dark:text-zinc-400 overflow-hidden';
    }
    if (item.type === 'block') {
      // add block header as we have block rules
      blockExists = 1;
      h1.innerHTML = `${item.from} -> ${item.to}`;
    } else if (item.type === 'port-forward') {
      // add port forward header as we have port-forward  rules
      forwardExists = 1;
      h1.innerHTML = `${item.from} -> ${item.to}:${port ? port : ''}`;
    }

    const p = document.createElement('p');
    if (status) {
        p.classList = 'line-clamp-3 font-light text-sm text-gray-700 dark:text-zinc-200';
    } else {
        p.classList = 'line-clamp-3 font-light text-sm text-gray-400 dark:text-zinc-400';
    }
    if (item.description) {
      p.innerHTML = `hits: ${item.hits} (${item.description})`;
    } else {
      p.innerHTML = `hits: ${item.hits}`;
    }

    const divSelect = document.createElement('div');
    divSelect.className = 'text-right';

    const divToggle = document.createElement('input');
    divToggle.type = 'checkbox';
    divToggle.setAttribute('id', `rule-${item.id}`);
    divToggle.classList = 'toggle toggle-success';
    if (status) {
        divToggle.checked = true;
    } else {
        divToggle.checked = false;
    }
    
    divEdit.appendChild(h1);
    divEdit.appendChild(p);
    div123.appendChild(divEdit);

    divSelect.appendChild(divToggle);
    div123.appendChild(divSelect);
    div12.appendChild(div123);
    div1.appendChild(div12);
    if (item.type === 'block') {
      divGridBc.appendChild(div1);
    } else {
      divGridPf.appendChild(div1);
    }

  });
  
  if (blockExists) {
    const divBlock = document.createElement('div');
    divBlock.classList = 'text-xl p-4 font-semibold bg-gray-100 dark:bg-zinc-900 dark:border-zinc-700 border-b shadow-sm';
    divBlock.innerText = 'Block Rules';
    divBc.prepend(divBlock);
    divBc.appendChild(divGridBc);
  }
  if (forwardExists) {
    const divBlock = document.createElement('div');
    divBlock.classList = 'text-xl p-4 font-semibold bg-gray-100 dark:bg-zinc-900 dark:border-zinc-700 border-b shadow-sm';
    divBlock.innerText = 'Port Forwarding';
    divPf.prepend(divBlock);
    divPf.appendChild(divGridPf);
  }
    // create checkbox eventlisteners
    const toggles = document.querySelectorAll('input[type=checkbox]'); 
    toggles.forEach(toggle => {
        toggle.addEventListener('change', onToggle);
    });

    // create edit click for each
    rules.forEach(item => {
      document.getElementById(item.id).addEventListener('click', editRule);
    })
}

async function addConfig() {
  // Show modal on button click
  const modal = document.getElementById('modal-add');
  const typeSelect = document.getElementById('type-select');
  // reset select
  typeSelect.value = '';
 
  const div = document.getElementById('new-rule');
  div.classList = 'hidden';

  const pf = document.getElementById('add-portforward');

  typeSelect.addEventListener('change', () => {
    div.classList.remove('hidden');

    if (typeSelect.value === 'block') {
      pf.classList = 'hidden';
    }
    if (typeSelect.value === 'port-forward') {
      pf.classList.remove('hidden');
    }

  })

  modal.showModal();
}

function showSpinner() {
  document.getElementById('port-forward').outerHTML = '<div id="port-forward" class="w-full h-screen pt-10 text-center"><span class="loading loading-spinner"></span></div>';
}

async function delConfig(id) {
  const modal = document.getElementById('modal-edit');

  postAPIDel('/network/firewall/manage', {'id': id, 'del': 1});

  // confirm deletion
  // @TODO delete confirm

  await sleep(300);
  getRules();
  modal.close();
}

function onToggle(e) {
    // function for toggling rules
    const id = e.target.id.replace(/rule-/g, '');
    const div = document.getElementById(id);
    const h1 = div.firstElementChild;
    const p = div.lastElementChild;
 
    if (e.target.checked) {
        postAPIToggle('/network/firewall/manage', { "id": +id, "enabled": 1});
        h1.classList = 'text-base enable-cursor text-gray-700 dark:text-zinc-200';
        p.classList = 'line-clamp-3 font-light text-sm text-gray-600 dark:text-zinc-300';
    }
    else {
        postAPIToggle('/network/firewall/manage', { "id": +id, "enabled": 0});
        h1.classList = 'text-base enable-cursor text-gray-400 dark:text-zinc-400';
        p.classList = 'line-clamp-3 font-light text-sm text-gray-300 dark:text-zinc-500';
    }
  }
  
  // function to get device configuration data
  async function getRule(id) {
    const results = await fetchAPIData(`/network/firewall/${id}`);
  
    // reset checkboxes
    const checkboxes = document.querySelectorAll('input[type=checkbox');
    checkboxes.forEach(e => {
      e.checked = true;
    });
    const span = document.querySelectorAll('.label-text');
    span.forEach(e => {
      e.classList = 'label-text';
    });
  
    const header = document.getElementById('modal-name-header');
    header.innerHTML = `${results['name']}`;
  
    const headerIp = document.getElementById('modal-ip');
    headerIp.innerHTML = `<span class="text-sm text-gray-600 dark:text-zinc-300">${results['ip']}</span>`;
  
  }

async function fwLogs() {
  // Show logs modal
  const modal = document.getElementById('modal-logs');
  document.getElementById('btn-logs').innerHTML = '<span class="text-gray-700 dark:text-gray-200 loading loading-spinner"></span><div class="pl-3 text-gray-700 dark:text-gray-200">Loading...please be patient.</div>';

  const results = await fetchAPIData('/network/firewall/logs');
  const logs = results['results'];

  // port forwarding
  const div = document.querySelector('#form-logs');
  div.innerHTML = '';

  const divStart = document.createElement('div');
  divStart.classList = 'overflow-x-auto';

  const table = document.createElement('table');
  table.classList = 'table table-xs table-pin-rows';
  table.innerHTML = '<thead><tr><th>Time</th><th>Status</th><th>Source</th><th>Port</th><th>Destination</th><th>Port</th></tr></thead>';

  const tbody = document.createElement('tbody');
  
  logs.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${item.timestamp}</td><td>${item.action}</td><td>${item.ip_src}</td><td>${item.port_src}</td><td>${item.ip_dst}</td><td>${item.port_dst}</td>`;
    
    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  divStart.appendChild(table);
  div.appendChild(divStart);

  modal.showModal();

  document.getElementById('btn-logs').innerHTML= '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6"><path fill-rule="evenodd" d="M2.625 6.75a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875 0A.75.75 0 018.25 6h12a.75.75 0 010 1.5h-12a.75.75 0 01-.75-.75zM2.625 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zM7.5 12a.75.75 0 01.75-.75h12a.75.75 0 010 1.5h-12A.75.75 0 017.5 12zm-4.875 5.25a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875 0a.75.75 0 01.75-.75h12a.75.75 0 010 1.5h-12a.75.75 0 01-.75-.75z" clip-rule="evenodd" /></svg><div class="pl-3">Firewall Logs</div>';
}

async function onSubmit(e) {
  // check if we are add or editing
  const btn = e.currentTarget.id;
  let modal;

  if (btn === 'btn-add-save') {
    //function submitting the data input
    modal = document.getElementById('modal-add');

    let formParams = {};
    const formAdd = document.getElementById('form-configuration');
    const formData = new FormData(formAdd);
    for (const pair of formData.entries()) {
      // console.log(`${pair[0]}, ${pair[1]}`);
      formParams[pair[0]] = pair[1].trim();
    }

    postAPIData('/network/firewall/add', formParams);
    
  }

  await sleep(300);
  getRules();
  modal.close();
}

async function fetchAPIData(apiEndpoint) {
  const response = await fetch(
    `${API_URL}${apiEndpoint}`
  );

  const data = await response.json();

  return data;
};

async function postAPIData(apiEndpoint, {source, destination, type, description, protocol, port}) {
  const response = await fetch(
    `${API_URL}${apiEndpoint}`, {
      method: 'POST',
      body: JSON.stringify({
        source,
        destination,
        type,
        description,
        protocol,
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

async function postAPIToggle(apiEndpoint, {id, enabled}) {
  const response = await fetch(
    `${API_URL}${apiEndpoint}`, {
      method: 'POST',
      body: JSON.stringify({
        id,
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

async function postAPIDel(apiEndpoint, {id, del}) {
  const response = await fetch(
    `${API_URL}${apiEndpoint}`, {
      method: 'POST',
      body: JSON.stringify({
        id,
        'delete': del,
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
  getRules();
});

// create checkbox eventlisteners
const toggles = document.querySelectorAll('input[type=checkbox]'); 
toggles.forEach(toggle => {
  toggle.addEventListener('change', onToggle);
});
// event listeners
document.getElementById('btn-add-rule').addEventListener('click', addConfig);
document.getElementById('btn-add-save').addEventListener('click', onSubmit);
document.getElementById('btn-logs').addEventListener('click', fwLogs);

