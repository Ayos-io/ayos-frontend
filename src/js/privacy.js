const API_URL = `http://${location.hostname}/v3`;

function onToggle(e) {
  const service = e.currentTarget.id.replace(/-manage/g, '');
  const serviceText = document.getElementById(service);
    // function for toggling rules
  const blocker = document.getElementById('blocker');
 
  if (e.target.checked) {
      postAPIToggle('/adblock/manage', {"service": service, "enabled": "enable"});
      serviceText.classList = 'text-base enable-cursor text-gray-700 dark:text-zinc-200';
  }
  else {
      postAPIToggle('/adblock/manage', {"service": service, "enabled": "disable"});
      serviceText.classList = 'text-base enable-cursor text-gray-400 dark:text-zinc-400';
  }
}


async function blockLogs() {
  // Show logs modal
  const modal = document.getElementById('modal-logs');
  document.getElementById('btn-logs').innerHTML = '<span class="text-gray-700 dark:text-gray-200 loading loading-spinner"></span><div class="pl-3 text-gray-700 dark:text-gray-200">Loading...please be patient.</div>';

  const results = await fetchAPIData('/adblock/log');
  const logs = results['results'];

  // port forwarding
  const div = document.querySelector('#form-logs');
  div.innerHTML = '';

  const divStart = document.createElement('div');
  divStart.classList = 'overflow-x-auto';

  const table = document.createElement('table');
  table.classList = 'table table-xs table-pin-rows';
  table.innerHTML = '<thead><tr><th>Time</th><th>URL</th><th>Device</th><th>Device IP</th></tr></thead>';

  const tbody = document.createElement('tbody');
  
  logs.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${item.timestamp}</td><td>${item.dns_name}</td><td>${item.name}</td><td>${item.source}</td>`;
    
    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  divStart.appendChild(table);
  div.appendChild(divStart);

  modal.showModal();

  document.getElementById('btn-logs').innerHTML= '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6"><path fill-rule="evenodd" d="M2.625 6.75a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875 0A.75.75 0 018.25 6h12a.75.75 0 010 1.5h-12a.75.75 0 01-.75-.75zM2.625 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zM7.5 12a.75.75 0 01.75-.75h12a.75.75 0 010 1.5h-12A.75.75 0 017.5 12zm-4.875 5.25a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875 0a.75.75 0 01.75-.75h12a.75.75 0 010 1.5h-12a.75.75 0 01-.75-.75z" clip-rule="evenodd" /></svg><div class="pl-3">Blocker Logs</div>';
}

async function fetchAPIData(apiEndpoint) {
  const response = await fetch(
    `${API_URL}${apiEndpoint}`
  );

  const data = await response.json();

  return data;
};

async function postAPIToggle(apiEndpoint, {service, enabled}) {
  const response = await fetch(
    `${API_URL}${apiEndpoint}`, {
      method: 'POST',
      body: JSON.stringify({
        service,
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

// calculate uptime from seconds
function format(s){
  let days = Math.floor(s / 86400);
  let hours = Math.floor(s % 86400 / 3600);
  let minutes = Math.floor(s % 3600 /60);
  let seconds = Math.floor(s % 60 /60)

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

async function getData() {
  const results = await fetchAPIData('/adblock');

  results['blocklist'].forEach(e => {
      const toggle = document.createElement('input');
      toggle.type = 'checkbox';
      toggle.setAttribute('id', `${e['service']}-toggle`);
      toggle.classList = 'toggle toggle-success';

      // we might have services here that are not in the html template
      // @TODO, needs to be done properly
      if (document.getElementById(e['service'])) {
        document.getElementById(e['service']).innerHTML = `${e['service'].charAt(0).toUpperCase() + e['service'].slice(1)}<br /><small class="text-xs">${e['count']} in list</small>`;
      } else {
        const toggle = document.createElement('input');
        toggle.type = 'checkbox';
        toggle.setAttribute('id', `${e['service']}-toggle`);
        toggle.classList = 'toggle toggle-success';

        const newTr = document.createElement('tr');
        const newTd = document.createElement('td');
        newTd.classList = 'border-b border-slate-300 dark:border-slate-700 p-3 text-slate-800 dark:text-slate-200';

        const newDiv = document.createElement('div');
        newDiv.setAttribute('id', `${e['service']}`);
        newDiv.classList = 'text-base';
        newDiv.innerHTML = `${e['service'].charAt(0).toUpperCase() + e['service'].slice(1)}<br /><small class="text-xs">${e['count']} in list</small>`;

        const newTdRight = document.createElement('td');
        newTdRight.classList = 'border-b border-slate-300 dark:border-slate-700 text-gray-500 text-right p-3';

        const newDivRight = document.createElement('div');
        newDivRight.setAttribute('id', `${e['service']}-manage`);
        newDivRight.classList = 'text-base';

        newTd.appendChild(newDiv);
        newTdRight.append(newDivRight);
        newTr.appendChild(newTd);
        newTr.appendChild(newTdRight);

        document.querySelector('tbody').appendChild(newTr);

      }

      if (e['enabled'] === '1') {
        toggle.checked = true;
        document.getElementById(e['service']).classList = 'text-base text-gray-700 dark:text-zinc-200';
      } else {
        toggle.checked = false;
        document.getElementById(e['service']).classList = 'text-base text-gray-400 dark:text-zinc-400';
      }
      document.getElementById(`${e['service']}-manage`).appendChild(toggle);
      document.getElementById(`${e['service']}-manage`).addEventListener('change', onToggle);
  });
  document.querySelector('#last-update').innerHTML = `${results['last_update']}<br /><small>Total ${results['total_urls']}</small>`;
}


// event listeners
document.addEventListener('DOMContentLoaded', () => {
  getData();
});
document.getElementById('btn-logs').addEventListener('click', blockLogs);

