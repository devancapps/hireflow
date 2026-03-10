/**
 * HireFlow — PDF Viewer Controls
 * Handles PDF.js rendering, page navigation, and zoom controls.
 */

class PDFViewer {
    constructor(options = {}) {
        this.container = options.container || document.getElementById('pdfCanvas');
        this.pageInfo = options.pageInfo || document.getElementById('pageInfo');
        this.prevBtn = options.prevBtn || document.getElementById('prevPage');
        this.nextBtn = options.nextBtn || document.getElementById('nextPage');
        this.zoomInBtn = options.zoomInBtn || document.getElementById('zoomIn');
        this.zoomOutBtn = options.zoomOutBtn || document.getElementById('zoomOut');
        this.zoomLabel = options.zoomLabel || document.getElementById('zoomLabel');
        this.fitWidthBtn = options.fitWidthBtn || document.getElementById('fitWidth');
        this.fitPageBtn = options.fitPageBtn || document.getElementById('fitPage');

        this.pdfDoc = null;
        this.currentPage = 1;
        this.totalPages = 0;
        this.scale = 1.0;
        this.fitMode = 'width'; // 'width', 'page', or null
        this.rendering = false;
        this.pendingPage = null;

        this.ZOOM_STEPS = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 3.0];
        this.MIN_ZOOM = 0.25;
        this.MAX_ZOOM = 3.0;

        this._bindEvents();
    }

    _bindEvents() {
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prevPage());
        }
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.nextPage());
        }
        if (this.zoomInBtn) {
            this.zoomInBtn.addEventListener('click', () => this.zoomIn());
        }
        if (this.zoomOutBtn) {
            this.zoomOutBtn.addEventListener('click', () => this.zoomOut());
        }
        if (this.fitWidthBtn) {
            this.fitWidthBtn.addEventListener('click', () => this.fitToWidth());
        }
        if (this.fitPageBtn) {
            this.fitPageBtn.addEventListener('click', () => this.fitToPage());
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            // Don't capture if user is typing in an input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
                return;
            }
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                this.prevPage();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                this.nextPage();
            } else if (e.key === '+' || e.key === '=') {
                e.preventDefault();
                this.zoomIn();
            } else if (e.key === '-') {
                e.preventDefault();
                this.zoomOut();
            }
        });

        // Re-render on window resize if in fit mode
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (this.fitMode && this.pdfDoc) {
                    this.renderPage(this.currentPage);
                }
            }, 250);
        });
    }

    async loadDocument(url) {
        try {
            // Set worker source
            if (typeof pdfjsLib !== 'undefined') {
                pdfjsLib.GlobalWorkerOptions.workerSrc =
                    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            }

            const loadingTask = pdfjsLib.getDocument(url);
            this.pdfDoc = await loadingTask.promise;
            this.totalPages = this.pdfDoc.numPages;
            this.currentPage = 1;
            this.updatePageInfo();
            await this.renderPage(1);
            return true;
        } catch (error) {
            console.error('Error loading PDF:', error);
            if (this.container) {
                this.container.innerHTML = `
                    <div style="display:flex;align-items:center;justify-content:center;height:300px;color:#8B9BB4;">
                        <div style="text-align:center;">
                            <div style="font-size:48px;margin-bottom:12px;">📄</div>
                            <div>Failed to load PDF</div>
                            <div style="font-size:12px;margin-top:4px;">${error.message}</div>
                        </div>
                    </div>
                `;
            }
            return false;
        }
    }

    async renderPage(pageNum) {
        if (!this.pdfDoc) return;

        if (this.rendering) {
            this.pendingPage = pageNum;
            return;
        }

        this.rendering = true;

        try {
            const page = await this.pdfDoc.getPage(pageNum);
            const viewport = page.getViewport({ scale: 1.0 });

            // Calculate scale based on fit mode
            if (this.fitMode === 'width' && this.container) {
                const containerWidth = this.container.parentElement
                    ? this.container.parentElement.clientWidth - 32
                    : 600;
                this.scale = containerWidth / viewport.width;
            } else if (this.fitMode === 'page' && this.container) {
                const containerWidth = this.container.parentElement
                    ? this.container.parentElement.clientWidth - 32
                    : 600;
                const containerHeight = this.container.parentElement
                    ? this.container.parentElement.clientHeight - 80
                    : 800;
                const scaleX = containerWidth / viewport.width;
                const scaleY = containerHeight / viewport.height;
                this.scale = Math.min(scaleX, scaleY);
            }

            const scaledViewport = page.getViewport({ scale: this.scale });

            // Create or reuse canvas
            let canvas = this.container.querySelector('canvas');
            if (!canvas) {
                canvas = document.createElement('canvas');
                this.container.innerHTML = '';
                this.container.appendChild(canvas);
            }

            const context = canvas.getContext('2d');
            canvas.height = scaledViewport.height;
            canvas.width = scaledViewport.width;

            const renderContext = {
                canvasContext: context,
                viewport: scaledViewport,
            };

            await page.render(renderContext).promise;

            this.currentPage = pageNum;
            this.updatePageInfo();
            this.updateZoomLabel();

        } catch (error) {
            console.error('Error rendering page:', error);
        } finally {
            this.rendering = false;

            if (this.pendingPage !== null) {
                const pending = this.pendingPage;
                this.pendingPage = null;
                this.renderPage(pending);
            }
        }
    }

    prevPage() {
        if (this.currentPage <= 1) return;
        this.renderPage(this.currentPage - 1);
    }

    nextPage() {
        if (this.currentPage >= this.totalPages) return;
        this.renderPage(this.currentPage + 1);
    }

    goToPage(pageNum) {
        if (pageNum < 1 || pageNum > this.totalPages) return;
        this.renderPage(pageNum);
    }

    zoomIn() {
        this.fitMode = null;
        // Find next zoom step
        const currentIdx = this.ZOOM_STEPS.findIndex(z => z >= this.scale);
        if (currentIdx < this.ZOOM_STEPS.length - 1) {
            this.scale = this.ZOOM_STEPS[currentIdx + 1];
        } else {
            this.scale = Math.min(this.scale + 0.25, this.MAX_ZOOM);
        }
        this.renderPage(this.currentPage);
    }

    zoomOut() {
        this.fitMode = null;
        // Find previous zoom step
        const currentIdx = this.ZOOM_STEPS.findIndex(z => z >= this.scale);
        if (currentIdx > 0) {
            this.scale = this.ZOOM_STEPS[currentIdx - 1];
        } else {
            this.scale = Math.max(this.scale - 0.25, this.MIN_ZOOM);
        }
        this.renderPage(this.currentPage);
    }

    fitToWidth() {
        this.fitMode = 'width';
        if (this.fitWidthBtn) this.fitWidthBtn.classList.add('active');
        if (this.fitPageBtn) this.fitPageBtn.classList.remove('active');
        this.renderPage(this.currentPage);
    }

    fitToPage() {
        this.fitMode = 'page';
        if (this.fitPageBtn) this.fitPageBtn.classList.add('active');
        if (this.fitWidthBtn) this.fitWidthBtn.classList.remove('active');
        this.renderPage(this.currentPage);
    }

    updatePageInfo() {
        if (this.pageInfo) {
            this.pageInfo.textContent = `Page ${this.currentPage} of ${this.totalPages}`;
        }
        if (this.prevBtn) {
            this.prevBtn.disabled = this.currentPage <= 1;
        }
        if (this.nextBtn) {
            this.nextBtn.disabled = this.currentPage >= this.totalPages;
        }
    }

    updateZoomLabel() {
        if (this.zoomLabel) {
            this.zoomLabel.textContent = `${Math.round(this.scale * 100)}%`;
        }
    }
}

// Export for use
if (typeof window !== 'undefined') {
    window.PDFViewer = PDFViewer;
}
