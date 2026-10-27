# Bharat Mata Inter College — Website Starter

This project keeps each public page and each role dashboard in a separate HTML file and is structured for GitHub Pages + Google Sheets / Google Apps Script.

## Included pages
- `index.html` — public homepage
- `about.html`, `academics.html`, `admission.html`, `results.html`, `notices.html`, `gallery.html`, `contact.html`
- `login.html` — shared role selection login page
- `admin.html`, `teacher.html`, `student.html` — separate role dashboards
- `assets/css/style.css` — responsive design
- `assets/js/config.js` — public API URL configuration
- `assets/js/app.js` — frontend interactions
- `backend/Code.gs` — Apps Script backend starter

## Deploy frontend to GitHub Pages
1. Create a new GitHub repository.
2. Upload all files and folders in this project; keep the folder structure unchanged.
3. In repository **Settings → Pages**, choose the deployment branch (usually `main`) and root folder.
4. Save and wait for GitHub Pages to publish. Open the generated Pages URL.

## Set up Google Sheets backend
1. Go to `script.google.com` and create a new Apps Script project.
2. Copy `backend/Code.gs` into the Apps Script editor.
3. Save, select `setupSheets` and run it manually. Approve the requested Google permissions. It creates the database spreadsheet and required tabs.
4. In the editor, run `createFirstAdmin("your_username", "YOUR_LONG_UNIQUE_PASSWORD", "Main Admin")` manually with a unique password of at least 12 characters. Never put the password in this repository.
5. Deploy → New deployment → Web app. Execute as **Me**. Choose access appropriate to your use case; a public endpoint needs additional security review.
6. Copy the Web App URL ending in `/exec` into `assets/js/config.js` as `apiUrl`.
7. Commit the config change and test admission submission and login.

## Important limitations before real school use
This is a **starter foundation**, not a completed commercial ERP. The initial backend implements sheet setup, admission enquiry submission, role login/session checks and a basic admin summary. It does not yet implement all modules listed in the original specification (fees, attendance, marks, PDF receipts, file uploads, ID cards, parent portal, etc.). Those must be implemented and tested in phases.

Google Apps Script + Sheets is convenient for a small school but is not equivalent to a production relational database. Do not store highly sensitive student documents or financial data until access controls, retention, backups and privacy practices have been reviewed. Session tokens use Apps Script CacheService and can expire; users may need to sign in again.

## Photo upload / Google Drive
The admission form in this starter does **not** upload photos yet. Drive upload requires a dedicated backend action with file size/type validation and careful permissions. Do not collect student photos or documents until this is implemented and tested.

## CORS note
GitHub Pages and Apps Script are separate origins. Test API calls from the actual published Pages URL. If browser CORS prevents reading Apps Script responses, use a supported hosting/API architecture rather than a public unauthenticated proxy.

## Security notes
- Hiding a dashboard link is not authorization. Backend must validate every privileged request.
- The public repository contains frontend source; never put passwords, private keys, or privileged credentials in it.
- Before production, add rate limits, stronger password hashing/salting, password reset, session revocation, complete role authorization, audit coverage, backups and automated tests.
