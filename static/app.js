document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('image');
  const label = document.querySelector('.custom-file-upload');

  if (fileInput && label) {
    fileInput.addEventListener('change', () => {
      const fileName = fileInput.files[0] ? fileInput.files[0].name : 'Choose Image';
      label.textContent = fileName;
    });
  }
});
