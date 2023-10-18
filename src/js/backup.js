const API_URL = `http://${location.hostname}/v3`;

async function getData() {
    const results = await fetchAPIData('/backups');

    const div = document.getElementById('backup-list');
  
    if (results['results'].length !== 0) {
        results['results'].forEach(e => {
        // @TODO create download link per backup and restore option
        console.log(`backup ${e['name']}`);
        });
    }
    else {
        div.innerHTML = 'No backups at this time.';
    }

  
    // document.querySelector('#last-update').innerHTML = `${results['last_update']}<br /><small>Total ${results['total_urls']}</small>`;
  }

function backupNow() {
    postAPI('/backups', {"backup": 1});
}

async function fetchAPIData(apiEndpoint) {
  const response = await fetch(
    `${API_URL}${apiEndpoint}`
  );

  const data = await response.json();

  return data;
};

async function postAPI(apiEndpoint, {backup}) {
  const response = await fetch(
    `${API_URL}${apiEndpoint}`, {
      method: 'POST',
      body: JSON.stringify({
        backup,
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


// event listeners
document.addEventListener('DOMContentLoaded', () => {
  getData();
});

document.getElementById('backup-btn').addEventListener('click', backupNow);
document.getElementById('btn-back').addEventListener('click', () => history.back());