import { WebDriver } from 'selenium-webdriver';
import * as fs from 'fs';
import * as path from 'path';
const addContext = require('mochawesome/addContext');

/**
 * Wraps test assertions/logic and handles failures by logging them to BUGS.md,
 * capturing a screenshot (for UI level tests), and appending context to Mochawesome HTML report.
 */
export async function captureOnFail(
  testContext: any,
  tcId: string,
  description: string,
  expected: string,
  actual: string,
  level: 'UI' | 'API',
  action: () => Promise<void> | void,
  driver?: WebDriver
) {
  try {
    await action();
  } catch (error: any) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const bugDir = path.resolve(__dirname, '../bug-snapshots');
    
    if (!fs.existsSync(bugDir)) {
      fs.mkdirSync(bugDir, { recursive: true });
    }

    let screenshotPathRelative = '';
    if (level === 'UI' && driver) {
      try {
        const screenshot = await driver.takeScreenshot();
        const screenshotName = `${tcId}-${timestamp}.png`;
        const screenshotPath = path.join(bugDir, screenshotName);
        fs.writeFileSync(screenshotPath, screenshot, 'base64');
        
        // Relative path from selenium/mochawesome-report/ to selenium/bug-snapshots/
        screenshotPathRelative = `../bug-snapshots/${screenshotName}`;
        
        // Attach to mochawesome HTML report
        addContext(testContext, {
          title: 'Bug Screenshot',
          value: screenshotPathRelative
        });
      } catch (screenshotError) {
        console.error('Failed to take screenshot:', screenshotError);
      }
    }

    // Add text info to mochawesome HTML report
    addContext(testContext, { title: 'Test Case ID', value: tcId });
    addContext(testContext, { title: 'Description', value: description });
    addContext(testContext, { title: 'Expected', value: expected });
    addContext(testContext, { title: 'Actual', value: error.message || actual });

    // Append to BUGS.md
    const bugsFile = path.join(bugDir, 'BUGS.md');
    if (!fs.existsSync(bugsFile)) {
      fs.writeFileSync(
        bugsFile,
        `# Nhật ký Bug — EShop Selenium Automation\n\n| TC ID | Mô tả | Expected | Actual | Mức | Bằng chứng | Thời điểm |\n|---|---|---|---|---|---|---|\n`
      );
    }

    const screenshotMarkdown = screenshotPathRelative
      ? `[Ảnh](${screenshotPathRelative})`
      : 'N/A (API)';

    const cleanExpected = expected.replace(/\r?\n/g, ' ').replace(/\|/g, '\\|');
    const cleanActual = (error.message || actual).replace(/\r?\n/g, ' ').replace(/\|/g, '\\|');

    const bugRow = `| ${tcId} | ${description} | ${cleanExpected} | ${cleanActual} | ${level} | ${screenshotMarkdown} | ${new Date().toLocaleString()} |\n`;
    fs.appendFileSync(bugsFile, bugRow);

    // Re-throw to fail the test properly
    throw error;
  }
}
