const API_URL = `http://${location.hostname}/v3`;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function delConfig(id) {
  const modal = document.getElementById('modal-edit');

  postAPIDel('/parental/services/manage', {'id': id, 'action': 'delete'});

  await sleep(300);
  getData();
  modal.close();
}

function showSpinner() {
  document.getElementById('pc-services').innerHTML = '<span class="loading loading-spinner mt-10"></span>';
}

function onToggle(e) {
    // function for toggling rules
    const id = e.target.id.replace(/rule-/g, '');
    const div = document.getElementById(id);
    const divChild = div.firstElementChild;
 
    if (e.target.checked) {
        postAPIToggle('/parental/services/manage', { "id": +id, "enabled": 1});
        div.classList = 'flex inline text-base enable-cursor text-gray-700 dark:text-zinc-200';
        divChild.classList = '';
    }
    else {
        postAPIToggle('/parental/services/manage', { "id": +id, "enabled": 0});
        div.classList = 'flex inline text-base enable-cursor text-gray-400 dark:text-zinc-400';
        divChild.classList = 'opacity-50 grayscale';
    }
  }

function getIdEditBtn(e) {
  // regex to get the rule id back
  return e.replace(/btn-edit-/g, '');
}
  
async function editRule(e) {
    const id = getIdEditBtn(e.currentTarget.id);
  
    const results = await fetchAPIData(`/parental/services/${id}`);
    const service = results['results'][0];

    document.getElementById('del-rule').addEventListener('click', (e) => {
      e.preventDefault();
      delConfig(id);
    },
    false,);
  
    const editRule = document.getElementById('edit-rule');
    editRule.innerText = `${service['label']}`;
  
    // Show modal on button click
    const modal = document.getElementById('modal-edit');
    modal.showModal();
  
  }

async function getData() {
    showSpinner();
    const results = await fetchAPIData('/parental/services');
    const services = results['services'];
    const div = document.getElementById('pc-services');
    div.innerHTML = '';
    
    services.forEach(item => {
        const divMain = document.createElement('div');
        divMain.classList = 'grid grid-flow-row-dense grid-cols-2 p-3 border-b dark:border-zinc-700 dark:bg-zinc-800';

        const divWidth = document.createElement('div');
        divWidth.classList = 'w-full';

        const divId = document.createElement('div');
        divId.setAttribute('id', item.id);

        // check if enabled
        const status = +item.enabled;

        if (status) {
            divId.classList = 'flex inline text-base enable-cursor text-gray-700 dark:text-zinc-200 font-medium';
            divId.innerHTML = `<img src="images/services/${item.service}.png" height="32" width="32" /> <span class="pl-3">${item.label}</span>`;
        } else {
            divId.classList = 'flex inline text-base enable-cursor text-gray-400 dark:text-zinc-400';
            divId.innerHTML = `<img src="images/services/${item.service}.png" height="32" width="32" class="opacity-50 grayscale" /> <span class="pl-3">${item.label}</span>`;
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
    
        divWidth.appendChild(divId);
        divMain.appendChild(divWidth);

        divSelect.appendChild(divToggle);
        divMain.appendChild(divSelect);

        div.appendChild(divMain);
        
        document.getElementById(item.id).addEventListener('click', editRule);
  });

    // create checkbox eventlisteners
    const toggles = document.querySelectorAll('input[type=checkbox]'); 
    toggles.forEach(toggle => {
        toggle.addEventListener('change', onToggle);
    });
    
}

async function fetchAPIData(endpoint) {
    const response = await fetch(
      `${API_URL}${endpoint}`
    );
  
    const data = await response.json();
  
    return data;
  }

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
  
  async function postAPIDel(apiEndpoint, {id, action}) {
    const response = await fetch(
      `${API_URL}${apiEndpoint}`, {
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

  document.getElementById('btn-back').addEventListener('click', () => history.back());
  document.addEventListener("DOMContentLoaded", () => {getData();});