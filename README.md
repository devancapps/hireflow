# HireFlow

**ProService New Hire Packet Automation Prototype**

HireFlow uses AI-powered document processing to automate the extraction and validation of handwritten new hire packet data for ProService Hawaii. Upload a scanned PDF, and HireFlow will extract employee information using Claude Vision AI, validate it against client-specific PrismHR codes, and generate the API payload ready for submission.

## Features

- **AI-Powered Extraction** — Claude Vision reads handwritten forms and extracts employee data
- **Scan Quality Scoring** — Automatic quality analysis of each scanned page
- **Packet Completeness Check** — Verifies all required forms are present
- **Code Validation** — Maps extracted values to valid PrismHR client codes
- **Side-by-Side Review** — View the original PDF alongside extracted/validated data
- **Missing Info Email** — Auto-generates email drafts requesting missing information
- **Mock PrismHR Submission** — Generates the `importEmployees` API payload

## Prerequisites

- **Python 3.11+**
- **poppler-utils** (required for `pdf2image`)
  - **Mac:** `brew install poppler`
  - **Linux:** `sudo apt-get install poppler-utils`
  - **Windows:** Download from [poppler releases](https://github.com/oschwartz10612/poppler-windows/releases)

## Setup

1. **Clone / extract the project:**

   ```bash
   cd hireflow
   ```

2. **Create a virtual environment (recommended):**

   ```bash
   python3 -m venv venv
   source venv/bin/activate  # Mac/Linux
   # or: venv\Scripts\activate  # Windows
   ```

3. **Install dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment:**

   Copy `.env.example` to `.env` and add your Anthropic API key (or use the pre-filled one):

   ```bash
   cp .env.example .env
   ```

5. **Run the app:**

   ```bash
   python app.py
   ```

6. **Open in browser:**

   Navigate to [http://localhost:5001](http://localhost:5001)

## Testing

Use the provided test PDFs:

- `New Hire Packet - Taylor Swift.pdf` (12 pages, complete packet with direct deposit)
- `New Hire Packet - LeBron James.pdf` (8 pages, no direct deposit filled)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.11+, Flask |
| AI / OCR | Anthropic Claude API (claude-sonnet) |
| PDF Rendering | PDF.js (Mozilla, CDN) |
| Frontend | HTML5, CSS3, Vanilla JS |
| Styling | Custom CSS — dark navy + ProService blue |
| Client Codes | `data/client_codes.json` |
| PDF Processing | `pdf2image` + `Pillow` |

## Project Structure

```
hireflow/
├── app.py                    # Flask app, all routes
├── validator.py              # Validation engine
├── .env                      # API key config
├── .env.example              # Template
├── requirements.txt
├── README.md
├── data/
│   └── client_codes.json     # Jordan's Surf Shack valid codes
├── uploads/                  # Temp storage for uploaded PDFs
├── static/
│   ├── css/
│   │   └── styles.css
│   └── js/
│       ├── app.js            # Main UI logic
│       └── pdf-viewer.js     # PDF.js viewer controls
└── templates/
    ├── index.html            # Upload screen
    └── review.html           # Review + validation screen
```

## Author

Devan Capps
