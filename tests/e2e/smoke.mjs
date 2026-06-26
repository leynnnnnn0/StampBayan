import process from 'node:process';
import puppeteer from 'puppeteer';

const baseUrl = process.env.E2E_BASE_URL || 'http://127.0.0.1:8000';

const checks = [
    {
        path: '/',
        expected: /StampBayan|loyalty/i,
    },
    {
        path: '/login',
        expected: /business account|email|password/i,
    },
    {
        path: '/customer/login',
        expected: /customer|email|password/i,
    },
    {
        path: '/staff/login',
        expected: /staff account|username|password/i,
    },
];

const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

try {
    const page = await browser.newPage();
    page.setDefaultTimeout(15_000);

    for (const check of checks) {
        const response = await page.goto(`${baseUrl}${check.path}`, {
            waitUntil: 'networkidle0',
        });

        if (!response?.ok()) {
            throw new Error(`${check.path} returned HTTP ${response?.status()}`);
        }

        const bodyText = await page.evaluate(() => document.body.innerText);

        if (!check.expected.test(bodyText)) {
            throw new Error(`${check.path} did not render expected content`);
        }
    }

    console.log(`E2E smoke checks passed against ${baseUrl}`);
} finally {
    await browser.close();
}
