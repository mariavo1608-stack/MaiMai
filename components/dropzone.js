import { ExcelService } from '../services/excel-service.js';

export class Dropzone {
  /**
   * Initializes the dropzone component.
   * @param {Function} onDataLoaded Callback when data is parsed successfully.
   */
  static init(onDataLoaded) {
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('file-input');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const progressPercent = document.getElementById('progress-percent');
    const dropzoneContent = document.getElementById('dropzone-content');

    if (!dropzone || !fileInput) return;

    // Click to select file
    dropzone.addEventListener('click', () => fileInput.click());

    // Drag-over hover effect
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('border-indigo-500', 'bg-indigo-50/50', 'dark:bg-indigo-950/20');
    });

    ['dragleave', 'dragend'].forEach(event => {
      dropzone.addEventListener(event, () => {
        dropzone.classList.remove('border-indigo-500', 'bg-indigo-50/50', 'dark:bg-indigo-950/20');
      });
    });

    // Handle dropped file
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('border-indigo-500', 'bg-indigo-50/50', 'dark:bg-indigo-950/20');

      if (e.dataTransfer.files.length) {
        this.processFile(e.dataTransfer.files[0], onDataLoaded);
      }
    });

    // Handle input selection
    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length) {
        this.processFile(e.target.files[0], onDataLoaded);
      }
    });
  }

  /**
   * Validates and parses the file.
   */
  static async processFile(file, onDataLoaded) {
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const progressPercent = document.getElementById('progress-percent');
    const dropzoneContent = document.getElementById('dropzone-content');
    const errorMessage = document.getElementById('upload-error-message');

    // Reset error
    if (errorMessage) {
      errorMessage.classList.add('hidden');
      errorMessage.textContent = '';
    }

    // Check extension
    const fileName = file.name;
    const isXlsx = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');

    if (!isXlsx) {
      this.showError('Chỉ chấp nhận file Excel (.xlsx hoặc .xls)');
      return;
    }

    // Prepare parsing UI
    dropzoneContent.classList.add('hidden');
    progressContainer.classList.remove('hidden');

    try {
      const data = await ExcelService.parseExcel(file, (evt) => {
        // Update progress bar
        if (progressBar) progressBar.style.width = `${evt.progress}%`;
        if (progressText) progressText.textContent = evt.message;
        if (progressPercent) progressPercent.textContent = `${evt.progress}%`;
      });

      // Celebrate!
      if (window.confetti) {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });
      }

      onDataLoaded(data);
    } catch (err) {
      console.error(err);
      this.showError(err.message || 'Lỗi trong quá trình xử lý file Excel');
      
      // Reset UI
      dropzoneContent.classList.remove('hidden');
      progressContainer.classList.add('hidden');
    }
  }

  static showError(msg) {
    const errorMessage = document.getElementById('upload-error-message');
    if (errorMessage) {
      errorMessage.classList.remove('hidden');
      errorMessage.textContent = msg;
    } else {
      alert(msg);
    }
  }
}
