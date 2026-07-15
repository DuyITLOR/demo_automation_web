import { WebDriver, By, until } from 'selenium-webdriver';
import { expect } from 'chai';
import { createDriver } from '../utils/driver';
import { CONFIG } from '../utils/config';
import { resetDatabase } from '../utils/db';
import { registerAPI } from '../utils/api';
import { captureOnFail } from '../utils/bugReporter';

describe('FR-01: Đăng ký tài khoản (Account Registration)', function () {
  let driver: WebDriver;

  // Run before each test to reset the database and prepare the webdriver
  beforeEach(async function () {
    resetDatabase();
    driver = await createDriver();
  });

  // Run after each test to clean up the browser session
  afterEach(async function () {
    if (driver) {
      await driver.quit();
    }
  });

  describe('1. Single transitions (0-switch) & Invalid transitions (UI Level)', function () {
    
    it('TC-FR-01-001: Nhập dữ liệu không hợp lệ từ trạng thái rỗng (S1 Idle -> S2 Incomplete/Invalid)', async function () {
      const tcId = 'TC-FR-01-001';
      const desc = 'Nhập Email sai định dạng từ trạng thái rỗng và kiểm tra hiển thị lỗi validation.';
      const expected = 'Form hiển thị lỗi định dạng email không hợp lệ và nút submit bị vô hiệu hóa.';
      
      await captureOnFail(this, tcId, desc, expected, 'Không có lỗi hiển thị', 'UI', async () => {
        await driver.get(`${CONFIG.BASE_URL}/register`);
        
        // Enter invalid email format
        const emailInput = await driver.findElement(By.xpath("//label[contains(text(), 'Email')]/following-sibling::input"));
        await emailInput.sendKeys('invalidemail');
        
        // Enter some other fields to trigger field check
        const nameInput = await driver.findElement(By.xpath("//label[contains(text(), 'Họ Tên')]/following-sibling::input"));
        await nameInput.sendKeys('Test User');
        
        // Verify submit button is disabled OR an error message is shown.
        // Spec says: "Email phải có định dạng hợp lệ (user@domain.com) và nút submit bị khóa/vô hiệu hóa".
        const submitBtn = await driver.findElement(By.xpath("//button[@type='submit']"));
        const isDisabled = await submitBtn.getAttribute('disabled');
        
        // Let's also check if an error is displayed
        let errorText = '';
        try {
          const errorDiv = await driver.findElement(By.className('bg-red-100'));
          errorText = await errorDiv.getText();
        } catch (e) {
          // Error element might not be present
        }

        expect(isDisabled || errorText).to.not.be.null;
        expect(isDisabled).to.equal('true', 'Nút submit phải bị disabled khi email không hợp lệ');
      }, driver);
    });

    it('TC-FR-01-002: Nhập dữ liệu hợp lệ từ trạng thái rỗng (S1 Idle -> S3 Ready)', async function () {
      const tcId = 'TC-FR-01-002';
      const desc = 'Nhập đầy đủ thông tin hợp lệ và kiểm tra nút đăng ký được kích hoạt.';
      const expected = 'Form không còn lỗi và nút đăng ký được kích hoạt.';
      
      await captureOnFail(this, tcId, desc, expected, 'Nút submit không hoạt động hoặc form báo lỗi', 'UI', async () => {
        await driver.get(`${CONFIG.BASE_URL}/register`);
        
        const nameInput = await driver.findElement(By.xpath("//label[contains(text(), 'Họ Tên')]/following-sibling::input"));
        await nameInput.sendKeys('Nguyen Van A');
        
        const emailInput = await driver.findElement(By.xpath("//label[contains(text(), 'Email')]/following-sibling::input"));
        await emailInput.sendKeys('new_user@domain.com');
        
        const passwordInput = await driver.findElement(By.xpath("//label[contains(text(), 'Mật khẩu')]/following-sibling::input"));
        // Standard strong password meeting spec requirements (min 8 chars, uppercase, lowercase, number, special char)
        await passwordInput.sendKeys('Test1234!');
        
        const submitBtn = await driver.findElement(By.xpath("//button[@type='submit']"));
        const isDisabled = await submitBtn.getAttribute('disabled');
        
        expect(isDisabled).to.not.equal('true', 'Nút submit phải được kích hoạt khi điền đúng thông tin.');
      }, driver);
    });

    it('TC-FR-01-007: Đăng ký thành công với email chưa tồn tại (S3 Ready -> S4 Registered)', async function () {
      const tcId = 'TC-FR-01-007';
      const desc = 'Điền thông tin hợp lệ và bấm đăng ký với email mới.';
      const expected = 'Đăng ký thành công, chuyển hướng người dùng sang trang Đăng nhập (/login).';
      
      await captureOnFail(this, tcId, desc, expected, 'Đăng ký không thành công hoặc không chuyển hướng', 'UI', async () => {
        await driver.get(`${CONFIG.BASE_URL}/register`);
        
        await driver.findElement(By.xpath("//label[contains(text(), 'Họ Tên')]/following-sibling::input")).sendKeys('Nguyen Van A');
        await driver.findElement(By.xpath("//label[contains(text(), 'Email')]/following-sibling::input")).sendKeys('new_unique_user@domain.com');
        
        // Note: Due to frontend regex bug, using 'Test1234!' (which has special char but no space) 
        // will fail on UI validation. We use it to verify spec compliance.
        await driver.findElement(By.xpath("//label[contains(text(), 'Mật khẩu')]/following-sibling::input")).sendKeys('Test1234!');
        
        // Wait, does confirm password exist? Spec: "Phải có trường Xác nhận mật khẩu".
        // Let's attempt to find the confirm password field. Since it does not exist in the HTML,
        // this findElement call will fail, which correctly identifies a missing requirement bug!
        const confirmPasswordInput = await driver.findElement(By.xpath("//label[contains(text(), 'Xác nhận')]/following-sibling::input"));
        await confirmPasswordInput.sendKeys('Test1234!');
        
        const submitBtn = await driver.findElement(By.xpath("//button[@type='submit']"));
        await submitBtn.click();
        
        // Assert redirect to login page
        await driver.wait(until.urlContains('/login'), 5000);
        const currentUrl = await driver.getCurrentUrl();
        expect(currentUrl).to.contain('/login');
      }, driver);
    });

    it('TC-FR-01-008: Đăng ký thất bại với email đã tồn tại (S3 Ready -> S5 Error_Email_Exists)', async function () {
      const tcId = 'TC-FR-01-008';
      const desc = 'Đăng ký tài khoản mới bằng email đã tồn tại (test@eshop.com).';
      const expected = 'Hệ thống báo lỗi "Email đã tồn tại" và không cho phép đăng ký trùng.';
      
      await captureOnFail(this, tcId, desc, expected, 'Đăng ký thành công hoặc không hiển thị thông báo lỗi trùng email', 'UI', async () => {
        await driver.get(`${CONFIG.BASE_URL}/register`);
        
        await driver.findElement(By.xpath("//label[contains(text(), 'Họ Tên')]/following-sibling::input")).sendKeys('Nguyen Van B');
        await driver.findElement(By.xpath("//label[contains(text(), 'Email')]/following-sibling::input")).sendKeys('test@eshop.com');
        
        // We use a password that bypasses the flawed frontend regex (must have space and no special char)
        // just to get the API submit to go through, so we can test the backend duplicate email check.
        // Flawed regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\s)[A-Za-z\d\s]{8,}$/
        await driver.findElement(By.xpath("//label[contains(text(), 'Mật khẩu')]/following-sibling::input")).sendKeys('Test 1234');
        
        const submitBtn = await driver.findElement(By.xpath("//button[@type='submit']"));
        await submitBtn.click();
        
        // Look for the error message
        const errorDiv = await driver.wait(until.elementLocated(By.className('bg-red-100')), 5000);
        const errorText = await errorDiv.getText();
        
        expect(errorText).to.contain('Email đã tồn tại');
      }, driver);
    });

    it('TC-FR-01-013: Bấm Đăng ký khi form rỗng (S1 Idle + submit - Invalid Transition)', async function () {
      const tcId = 'TC-FR-01-013';
      const desc = 'Cố gắng submit khi form rỗng.';
      const expected = 'Hệ thống chặn submit, không gửi request API.';
      
      await captureOnFail(this, tcId, desc, expected, 'Form được submit hoặc không bị chặn', 'UI', async () => {
        await driver.get(`${CONFIG.BASE_URL}/register`);
        
        const submitBtn = await driver.findElement(By.xpath("//button[@type='submit']"));
        
        // Verify submit is disabled
        const isDisabled = await submitBtn.getAttribute('disabled');
        expect(isDisabled).to.equal('true', 'Nút submit phải bị vô hiệu hóa khi form rỗng.');
      }, driver);
    });
  });

  describe('2. API Level tests', function () {

    it('TC-FR-01-API-007: Đăng ký thành công via API', async function () {
      const tcId = 'TC-FR-01-007 (API)';
      const desc = 'Gửi request đăng ký tài khoản với email chưa tồn tại.';
      const expected = 'API trả về status 200 OK và thông báo đăng ký thành công.';
      
      await captureOnFail(this, tcId, desc, expected, 'API trả về mã lỗi hoặc thất bại', 'API', async () => {
        const response = await registerAPI('Nguyen Van API', 'api_user@domain.com', 'Test1234!');
        expect(response.status).to.equal(200, 'API đăng ký phải trả về mã 200 OK');
        
        const data = await response.json();
        expect(data.message).to.equal('User registered successfully');
      });
    });

    it('TC-FR-01-API-008: Đăng ký thất bại với email đã tồn tại via API', async function () {
      const tcId = 'TC-FR-01-008 (API)';
      const desc = 'Gửi request đăng ký với email đã tồn tại (test@eshop.com).';
      const expected = 'API trả về status 400 Bad Request hoặc 500 và thông báo lỗi email đã tồn tại.';
      
      await captureOnFail(this, tcId, desc, expected, 'API trả về status 200 đăng ký thành công trùng email', 'API', async () => {
        const response = await registerAPI('Duplicate User', 'test@eshop.com', 'Test1234!');
        
        // The spec requires that email must be unique, so registering a duplicate email should fail.
        expect(response.status).to.not.equal(200, 'API không được phép trả về 200 khi trùng email');
        
        const data = await response.json();
        expect(data.error).to.contain('unique'); // sqlite constraint error or custom error message
      });
    });
  });
});
