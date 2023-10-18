export default async function modalStart() {
    // Show modal on button click
      const modal = document.getElementById('modal');
      const btn = document.getElementsByClassName('edit-btn');
      const btnArray = Array.from(btn);
      
      btnArray.forEach(dev => dev.addEventListener('click', e => {
        const deviceInfo = getDeviceInfo(e.currentTarget.id);
        modal.showModal();
        }))
  }