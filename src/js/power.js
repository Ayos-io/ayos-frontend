const restartBtn = document.querySelector('#restart-btn');
const powerModal = document.querySelector('#power-modal');
const cancelButton = document.querySelector("#cancel");
const restartConfirmBtn = document.querySelector('#restart-confirm');

// Update button opens a modal dialog
restartBtn.addEventListener("click", () => {
  powerModal.showModal("#restart-button");
  console.log('restart confirmation needed');
});

// Form cancel button closes the dialog box
cancelButton.addEventListener("click", () => {
  powerModal.close("cancel restart");
  console.log('cancelled');
});

// Yes selected so reboot
restartConfirmBtn.addEventListener("click", () => {
  console.log('restart confirmed')
  //restart();
});


// restart
async function restart() {
  const results = await fetchAPIData('/global/reboot','reboot');
}

async function fetchAPIData(endpoint, action) {
  const API_URL = `http://${location.hostname}/v3`;
  
    const response = await fetch(
      `${API_URL}${endpoint}?action=${action}`
    );
  
    const data = await response.json();
  
    return data;
  }

  document.getElementById('btn-back').addEventListener('click', () => history.back());