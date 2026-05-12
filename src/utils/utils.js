const Log = {
    ok: (msg) => console.log(`%c✔ ${msg}`, 'color: #2ecc71; font-weight: bold;'),
    warn: (msg) => console.log(`%c⚠ ${msg}`, 'color: #f1c40f; font-weight: bold;'),
    error: (msg) => console.log(`%c✖ ${msg}`, 'color: #e74c3c; font-weight: bold;'),
    info: (msg) => console.log(`%cℹ ${msg}`, 'color: #3498db;')
};