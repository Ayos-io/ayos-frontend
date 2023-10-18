
// get the current software version
async function getData() {
    const results = await fetchAPIData('/software/current');
    
    document.querySelector('#software-version').innerText = results['sw_version'];
    let swDate = parseInt(`${results['sw_installed']}000`); // JS uses milliseconds instead of seconds
    swDate = new Date(swDate);
    document.querySelector('#software-date').innerText = swDate.toDateString();
}

document.addEventListener("DOMContentLoaded", () => {
    getData();
})

async function fetchAPIData(endpoint) {
  const API_URL = `http://${location.hostname}/v3`;
  
    const response = await fetch(
      `${API_URL}${endpoint}`
    );
  
    const data = await response.json();
  
    return data;
  }

  document.getElementById('btn-back').addEventListener('click', () => history.back());