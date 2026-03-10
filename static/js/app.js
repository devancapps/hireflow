/**
 * HireFlow — Main UI Logic
 * Handles upload page interactions, file selection, and processing flow.
 */

// ─── Upload Page Logic ─────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    // Only run upload logic if we're on the upload page
    const dropZone = document.getElementById('dropZone');
    if (!dropZone) return;

    const fileInput = document.getElementById('fileInput');
    const selectedFile = document.getElementById('selectedFile');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const removeFile = document.getElementById('removeFile');
    const processBtn = document.getElementById('processBtn');
    const processingOverlay = document.getElementById('processingOverlay');
    const clientSelect = document.getElementById('clientSelect');

    let currentFile = null;

    // ─── Drag and Drop ─────────────────────────────────────────────
    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    });

    // ─── File Handling ─────────────────────────────────────────────
    function handleFileSelect(file) {
        if (!file.name.toLowerCase().endsWith('.pdf')) {
            showToast('Please select a PDF file', 'error');
            return;
        }

        if (file.size > 20 * 1024 * 1024) {
            showToast('File too large. Maximum size is 20MB.', 'error');
            return;
        }

        currentFile = file;
        fileName.textContent = file.name;
        fileSize.textContent = formatFileSize(file.size);
        selectedFile.classList.add('visible');
        dropZone.classList.add('has-file');
        processBtn.disabled = false;
    }

    if (removeFile) {
        removeFile.addEventListener('click', (e) => {
            e.stopPropagation();
            currentFile = null;
            fileInput.value = '';
            selectedFile.classList.remove('visible');
            dropZone.classList.remove('has-file');
            processBtn.disabled = true;
        });
    }

    // ─── Process Button ────────────────────────────────────────────
    if (processBtn) {
        processBtn.addEventListener('click', () => {
            if (!currentFile) return;
            startProcessing();
        });
    }

    function startProcessing() {
        // Show overlay
        processingOverlay.classList.add('active');

        // Animate steps
        const steps = processingOverlay.querySelectorAll('.status-step');
        const stepDelay = 1500;

        steps.forEach((step, index) => {
            setTimeout(() => {
                // Mark previous as done
                if (index > 0) {
                    steps[index - 1].classList.remove('active');
                    steps[index - 1].classList.add('done');
                }
                step.classList.add('active');
            }, index * stepDelay);
        });

        // Start actual upload after brief delay
        setTimeout(() => {
            uploadFile();
        }, 500);
    }

    async function uploadFile() {
        const formData = new FormData();
        formData.append('file', currentFile);
        formData.append('client_id', clientSelect ? clientSelect.value : '15650');

        try {
            const response = await fetch('/process', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                // Mark all steps as done
                const steps = processingOverlay.querySelectorAll('.status-step');
                steps.forEach(step => {
                    step.classList.remove('active');
                    step.classList.add('done');
                });

                // Brief delay then redirect
                setTimeout(() => {
                    window.location.href = `/review/${data.upload_id}`;
                }, 800);
            } else {
                processingOverlay.classList.remove('active');
                showToast(data.error || 'Processing failed', 'error');
            }
        } catch (error) {
            processingOverlay.classList.remove('active');
            showToast('Network error: ' + error.message, 'error');
        }
    }
});

// ─── Utility Functions ─────────────────────────────────────────────────

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function showToast(message, type = 'info') {
    // Remove existing toasts
    const existing = document.querySelectorAll('.toast');
    existing.forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
    `;
    document.body.appendChild(toast);

    // Auto-remove after 5s
    setTimeout(() => {
        if (toast.parentElement) {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 300);
        }
    }, 5000);
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Copied to clipboard!', 'success');
    }).catch(() => {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('Copied to clipboard!', 'success');
    });
}

function syntaxHighlightJSON(json) {
    if (typeof json !== 'string') {
        json = JSON.stringify(json, null, 2);
    }
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(
        /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
        function (match) {
            let cls = 'json-number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'json-key';
                } else {
                    cls = 'json-string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'json-boolean';
            } else if (/null/.test(match)) {
                cls = 'json-null';
            }
            return '<span class="' + cls + '">' + match + '</span>';
        }
    );
}
