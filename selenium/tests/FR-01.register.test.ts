import { WebDriver, By, until } from 'selenium-webdriver';
import { expect } from 'chai';
import { createDriver } from '../utils/driver';
import { CONFIG } from '../utils/config';
import { resetDatabase } from '../utils/db';
import { registerAPI } from '../utils/api';
import { captureOnFail } from '../utils/bugReporter';

describe('FR-01: Đăng ký tài khoản (Account Registration)', function () {
  let driver: WebDriver;

  beforeEach(async function () {
    resetDatabase();
    driver = await createDriver();
  });

  afterEach(async function () {
    if (driver) {
      await driver.quit();
    }
  });

  describe('1. Single transitions (0-switch)', function () {

    it('TC-FR-01-001: Nhập dữ liệu không hợp lệ từ trạng thái rỗng', async function () {
      const tcId = 'TC-FR-01-001';
      const desc = 'Nhập Email sai định dạng từ trạng thái rỗng và kiểm tra lỗi validation.';
      const expected = 'Hiển thị lỗi email không hợp lệ và nút Đăng ký bị vô hiệu hóa.';
      
      await captureOnFail(this, tcId, desc, expected, 'Không hiển thị lỗi hoặc nút đăng ký không bị vô hiệu hóa', 'UI', async () => {
        await driver.get(`${CONFIG.BASE_URL}/register`);
        
        const emailInput = await driver.findElement(By.xpath("//label[contains(text(), 'Email')]/following-sibling::input"));
        await emailInput.sendKeys('invalidemail');
        
        // Focus name to trigger change validation if any
        const nameInput = await driver.findElement(By.xpath("//label[contains(text(), 'Họ Tên')]/following-sibling::input"));
        await nameInput.sendKeys('Test');

        const submitBtn = await driver.findElement(By.xpath("//button[@type='submit']"));
        const isDisabled = await submitBtn.getAttribute('disabled');
        
        let errorText = '';
        try {
          const errorDiv = await driver.findElement(By.className('bg-red-100'));
          errorText = await errorDiv.getText();
        } catch (e) {}

        expect(isDisabled).to.equal('true', 'Nút đăng ký phải bị vô hiệu hóa khi email không hợp lệ');
      }, driver);
    });

    it('TC-FR-01-002: Nhập dữ liệu hợp lệ từ trạng thái rỗng', async function () {
      const tcId = 'TC-FR-01-002';
      const desc = 'Nhập đầy đủ thông tin hợp lệ từ trạng thái rỗng.';
      const expected = 'Form không còn lỗi và nút đăng ký được kích hoạt.';

      await captureOnFail(this, tcId, desc, expected, 'Nút submit bị khóa hoặc form báo lỗi', 'UI', async () => {
        await driver.get(`${CONFIG.BASE_URL}/register`);

        await driver.findElement(By.xpath("//label[contains(text(), 'Họ Tên')]/following-sibling::input")).sendKeys('Nguyen Van A');
        await driver.findElement(By.xpath("//label[contains(text(), 'Email')]/following-sibling::input")).sendKeys('new_user@domain.com');
        await driver.findElement(By.xpath("//label[contains(text(), 'Mật khẩu')]/following-sibling::input")).sendKeys('Test 1234'); // Bypass flawed regex

        const submitBtn = await driver.findElement(By.xpath("//button[@type='submit']"));
        const isDisabled = await submitBtn.getAttribute('disabled');

        expect(isDisabled).to.not.equal('true', 'Nút submit phải được kích hoạt khi điền đúng thông tin.');
      }, driver);
    });

    it('TC-FR-01-003: Cập nhật dữ liệu không hợp lệ từ trạng thái không hợp lệ', async function () {
      const tcId = 'TC-FR-01-003';
      const desc = 'Nhập mật khẩu yếu từ trạng thái email không hợp lệ.';
      const expected = 'Hiển thị lỗi độ mạnh mật khẩu và nút Đăng ký tiếp tục bị vô hiệu hóa.';

      await captureOnFail(this, tcId, desc, expected, 'Không cập nhật lỗi mật khẩu hoặc nút đăng ký được kích hoạt', 'UI', async () => {
        await driver.get(`${CONFIG.BASE_URL}/register`);

        await driver.findElement(By.xpath("//label[contains(text(), 'Email')]/following-sibling::input")).sendKeys('invalidemail');
        await driver.findElement(By.xpath("//label[contains(text(), 'Mật khẩu')]/following-sibling::input")).sendKeys('123');

        const submitBtn = await driver.findElement(By.xpath("//button[@type='submit']"));
        const isDisabled = await submitBtn.getAttribute('disabled');

        let errorText = '';
        try {
          const errorDiv = await driver.findElement(By.className('bg-red-100'));
          errorText = await errorDiv.getText();
        } catch (e) {}

        expect(errorText).to.contain('Mật khẩu', 'Phải hiển thị lỗi độ mạnh mật khẩu');
        expect(isDisabled).to.equal('true', 'Nút đăng ký phải bị vô hiệu hóa.');
      }, driver);
    });

    it('TC-FR-01-004: Cập nhật dữ liệu hợp lệ từ trạng thái không hợp lệ', async function () {
      const tcId = 'TC-FR-01-004';
      const desc = 'Form thiếu xác nhận mật khẩu, điền xác nhận mật khẩu khớp để chuyển sang sẵn sàng.';
      const expected = 'Ẩn các thông báo lỗi và nút Đăng ký được kích hoạt.';

      await captureOnFail(this, tcId, desc, expected, 'Không tìm thấy trường Xác nhận mật khẩu hoặc nút đăng ký không được kích hoạt', 'UI', async () => {
        await driver.get(`${CONFIG.BASE_URL}/register`);

        await driver.findElement(By.xpath("//label[contains(text(), 'Họ Tên')]/following-sibling::input")).sendKeys('Nguyen Van A');
        await driver.findElement(By.xpath("//label[contains(text(), 'Email')]/following-sibling::input")).sendKeys('new_user@domain.com');
        await driver.findElement(By.xpath("//label[contains(text(), 'Mật khẩu')]/following-sibling::input")).sendKeys('Test 1234');

        // Confirm password field is expected per spec
        const confirmPasswordInput = await driver.findElement(By.xpath("//label[contains(text(), 'Xác nhận')]/following-sibling::input"));
        await confirmPasswordInput.sendKeys('Test 1234');

        const submitBtn = await driver.findElement(By.xpath("//button[@type='submit']"));
        const isDisabled = await submitBtn.getAttribute('disabled');

        expect(isDisabled).to.not.equal('true', 'Nút submit phải được kích hoạt khi điền đúng thông tin.');
      }, driver);
    });

    it('TC-FR-01-005: Xóa sạch form từ trạng thái không hợp lệ', async function () {
      const tcId = 'TC-FR-01-005';
      const desc = 'Tải lại trang từ trạng thái không hợp lệ.';
      const expected = 'Các trường nhập liệu trống, lỗi bị ẩn, nút Đăng ký vô hiệu hóa.';

      await captureOnFail(this, tcId, desc, expected, 'Các trường vẫn lưu giá trị hoặc lỗi không bị ẩn', 'UI', async () => {
        await driver.get(`${CONFIG.BASE_URL}/register`);

        await driver.findElement(By.xpath("//label[contains(text(), 'Email')]/following-sibling::input")).sendKeys('invalidemail');
        
        // Reload page
        await driver.navigate().refresh();

        const emailVal = await driver.findElement(By.xpath("//label[contains(text(), 'Email')]/following-sibling::input")).getAttribute('value');
        expect(emailVal).to.equal('', 'Trường email phải được xóa sạch sau khi reload.');

        const submitBtn = await driver.findElement(By.xpath("//button[@type='submit']"));
        const isDisabled = await submitBtn.getAttribute('disabled');
        expect(isDisabled).to.equal('true', 'Nút đăng ký phải bị vô hiệu hóa sau khi reload.');
      }, driver);
    });

    it('TC-FR-01-006: Nhập dữ liệu không hợp lệ từ trạng thái sẵn sàng', async function () {
      const tcId = 'TC-FR-01-006';
      const desc = 'Xóa bớt Họ Tên khi đang ở trạng thái sẵn sàng.';
      const expected = 'Hiển thị lỗi thiếu Họ Tên và nút Đăng ký lập tức bị vô hiệu hóa.';

      await captureOnFail(this, tcId, desc, expected, 'Nút submit vẫn được kích hoạt hoặc không báo lỗi', 'UI', async () => {
        await driver.get(`${CONFIG.BASE_URL}/register`);

        const nameInput = await driver.findElement(By.xpath("//label[contains(text(), 'Họ Tên')]/following-sibling::input"));
        await nameInput.sendKeys('Nguyen Van A');
        await driver.findElement(By.xpath("//label[contains(text(), 'Email')]/following-sibling::input")).sendKeys('new_user@domain.com');
        await driver.findElement(By.xpath("//label[contains(text(), 'Mật khẩu')]/following-sibling::input")).sendKeys('Test 1234');

        // Clear Họ Tên
        await nameInput.clear();

        const submitBtn = await driver.findElement(By.xpath("//button[@type='submit']"));
        const isDisabled = await submitBtn.getAttribute('disabled');

        expect(isDisabled).to.equal('true', 'Nút đăng ký phải bị vô hiệu hóa khi thiếu Họ Tên.');
      }, driver);
    });

    it('TC-FR-01-007: Đăng ký thành công với email chưa tồn tại', async function () {
      const tcId = 'TC-FR-01-007';
      const desc = 'Đăng ký tài khoản mới bằng thông tin hợp lệ (bản tin chưa tồn tại).';
      const expected = 'Chuyển hướng người dùng sang trang Đăng nhập (/login) và hiển thị thành công.';

      await captureOnFail(this, tcId, desc, expected, 'Không chuyển hướng sang /login hoặc báo lỗi', 'UI', async () => {
        await driver.get(`${CONFIG.BASE_URL}/register`);

        await driver.findElement(By.xpath("//label[contains(text(), 'Họ Tên')]/following-sibling::input")).sendKeys('Nguyen Van A');
        await driver.findElement(By.xpath("//label[contains(text(), 'Email')]/following-sibling::input")).sendKeys('new_unique_user@domain.com');
        await driver.findElement(By.xpath("//label[contains(text(), 'Mật khẩu')]/following-sibling::input")).sendKeys('Test1234!'); // Spec password

        const submitBtn = await driver.findElement(By.xpath("//button[@type='submit']"));
        await submitBtn.click();

        await driver.wait(until.urlContains('/login'), 5000);
        const currentUrl = await driver.getCurrentUrl();
        expect(currentUrl).to.contain('/login');
      }, driver);
    });

    it('TC-FR-01-008: Đăng ký thất bại với email đã tồn tại', async function () {
      const tcId = 'TC-FR-01-008';
      const desc = 'Đăng ký tài khoản mới bằng email đã tồn tại (test@eshop.com).';
      const expected = 'Thông báo lỗi "Email đã tồn tại" hiển thị trên giao diện và nút Đăng ký vẫn ở trạng thái sẵn sàng sửa đổi.';

      await captureOnFail(this, tcId, desc, expected, 'Không hiển thị thông báo lỗi trùng email', 'UI', async () => {
        await driver.get(`${CONFIG.BASE_URL}/register`);

        await driver.findElement(By.xpath("//label[contains(text(), 'Họ Tên')]/following-sibling::input")).sendKeys('Nguyen Van B');
        await driver.findElement(By.xpath("//label[contains(text(), 'Email')]/following-sibling::input")).sendKeys('test@eshop.com');
        await driver.findElement(By.xpath("//label[contains(text(), 'Mật khẩu')]/following-sibling::input")).sendKeys('Test 1234'); // Bypass flawed regex

        const submitBtn = await driver.findElement(By.xpath("//button[@type='submit']"));
        await submitBtn.click();

        const errorDiv = await driver.wait(until.elementLocated(By.className('bg-red-100')), 5000);
        const errorText = await errorDiv.getText();
        expect(errorText).to.contain('Email đã tồn tại', 'Phải hiển thị thông báo trùng email');
      }, driver);
    });

    it('TC-FR-01-009: Xóa sạch form từ trạng thái sẵn sàng', async function () {
      const tcId = 'TC-FR-01-009';
      const desc = 'Tải lại trang từ trạng thái sẵn sàng.';
      const expected = 'Form trống hoàn toàn, nút Đăng ký bị vô hiệu hóa.';

      await captureOnFail(this, tcId, desc, expected, 'Form vẫn chứa thông tin cũ', 'UI', async () => {
        await driver.get(`${CONFIG.BASE_URL}/register`);

        await driver.findElement(By.xpath("//label[contains(text(), 'Họ Tên')]/following-sibling::input")).sendKeys('Nguyen Van A');
        await driver.findElement(By.xpath("//label[contains(text(), 'Email')]/following-sibling::input")).sendKeys('new_user@domain.com');
        await driver.findElement(By.xpath("//label[contains(text(), 'Mật khẩu')]/following-sibling::input")).sendKeys('Test 1234');

        await driver.navigate().refresh();

        const nameVal = await driver.findElement(By.xpath("//label[contains(text(), 'Họ Tên')]/following-sibling::input")).getAttribute('value');
        expect(nameVal).to.equal('', 'Họ tên phải được xóa sau reload');

        const submitBtn = await driver.findElement(By.xpath("//button[@type='submit']"));
        const isDisabled = await submitBtn.getAttribute('disabled');
        expect(isDisabled).to.equal('true', 'Nút đăng ký phải bị vô hiệu hóa sau reload');
      }, driver);
    });

    it('TC-FR-01-010: Nhập dữ liệu không hợp lệ sau khi lỗi trùng email', async function () {
      const tcId = 'TC-FR-01-010';
      const desc = 'Nhập mật khẩu xác nhận không khớp sau khi có lỗi trùng email.';
      const expected = 'Thông báo lỗi xác nhận mật khẩu không khớp xuất hiện, nút Đăng ký vô hiệu hóa.';

      await captureOnFail(this, tcId, desc, expected, 'Không tìm thấy trường Xác nhận mật khẩu hoặc không có lỗi', 'UI', async () => {
        await driver.get(`${CONFIG.BASE_URL}/register`);

        await driver.findElement(By.xpath("//label[contains(text(), 'Họ Tên')]/following-sibling::input")).sendKeys('Nguyen Van B');
        await driver.findElement(By.xpath("//label[contains(text(), 'Email')]/following-sibling::input")).sendKeys('test@eshop.com');
        await driver.findElement(By.xpath("//label[contains(text(), 'Mật khẩu')]/following-sibling::input")).sendKeys('Test 1234');
        
        const submitBtn = await driver.findElement(By.xpath("//button[@type='submit']"));
        await submitBtn.click();

        // Wait for duplicate error
        await driver.wait(until.elementLocated(By.className('bg-red-100')), 5000);

        // Find confirm password field and input mismatched password
        const confirmPasswordInput = await driver.findElement(By.xpath("//label[contains(text(), 'Xác nhận')]/following-sibling::input"));
        await confirmPasswordInput.sendKeys('MismatchedPass123!');

        const isDisabled = await submitBtn.getAttribute('disabled');
        expect(isDisabled).to.equal('true', 'Nút đăng ký phải bị vô hiệu hóa.');
      }, driver);
    });

    it('TC-FR-01-011: Thay đổi email hợp lệ sau khi lỗi trùng email', async function () {
      const tcId = 'TC-FR-01-011';
      const desc = 'Sửa email trùng thành email mới chưa tồn tại.';
      const expected = 'Ẩn thông báo lỗi trùng email cũ, nút Đăng ký được kích hoạt lại.';

      await captureOnFail(this, tcId, desc, expected, 'Không ẩn lỗi trùng email hoặc nút không được kích hoạt', 'UI', async () => {
        await driver.get(`${CONFIG.BASE_URL}/register`);

        await driver.findElement(By.xpath("//label[contains(text(), 'Họ Tên')]/following-sibling::input")).sendKeys('Nguyen Van B');
        const emailInput = await driver.findElement(By.xpath("//label[contains(text(), 'Email')]/following-sibling::input"));
        await emailInput.sendKeys('test@eshop.com');
        await driver.findElement(By.xpath("//label[contains(text(), 'Mật khẩu')]/following-sibling::input")).sendKeys('Test 1234');

        const submitBtn = await driver.findElement(By.xpath("//button[@type='submit']"));
        await submitBtn.click();

        // Wait for duplicate error
        const errorDiv = await driver.wait(until.elementLocated(By.className('bg-red-100')), 5000);
        
        // Update email to a valid unique email
        await emailInput.clear();
        await emailInput.sendKeys('fixed_user@domain.com');

        // Force validation trigger if any (by clicking name)
        await driver.findElement(By.xpath("//label[contains(text(), 'Họ Tên')]/following-sibling::input")).click();

        let isErrorVisible = true;
        try {
          const text = await errorDiv.getText();
          if (!text.includes('Email đã tồn tại')) isErrorVisible = false;
        } catch (e) {
          isErrorVisible = false;
        }

        expect(isErrorVisible).to.be.false;

        const isDisabled = await submitBtn.getAttribute('disabled');
        expect(isDisabled).to.not.equal('true', 'Nút submit phải được kích hoạt lại.');
      }, driver);
    });

    it('TC-FR-01-012: Xóa sạch form sau khi lỗi trùng email', async function () {
      const tcId = 'TC-FR-01-012';
      const desc = 'Reload trang sau khi bị báo lỗi email đã tồn tại.';
      const expected = 'Form trống hoàn toàn, ẩn lỗi cũ, nút Đăng ký bị vô hiệu hóa.';

      await captureOnFail(this, tcId, desc, expected, 'Thông tin hoặc lỗi vẫn hiển thị sau reload', 'UI', async () => {
        await driver.get(`${CONFIG.BASE_URL}/register`);

        await driver.findElement(By.xpath("//label[contains(text(), 'Họ Tên')]/following-sibling::input")).sendKeys('Nguyen Van B');
        await driver.findElement(By.xpath("//label[contains(text(), 'Email')]/following-sibling::input")).sendKeys('test@eshop.com');
        await driver.findElement(By.xpath("//label[contains(text(), 'Mật khẩu')]/following-sibling::input")).sendKeys('Test 1234');

        const submitBtn = await driver.findElement(By.xpath("//button[@type='submit']"));
        await submitBtn.click();

        await driver.wait(until.elementLocated(By.className('bg-red-100')), 5000);

        await driver.navigate().refresh();

        const emailVal = await driver.findElement(By.xpath("//label[contains(text(), 'Email')]/following-sibling::input")).getAttribute('value');
        expect(emailVal).to.equal('');

        let errorText = '';
        try {
          const errorDiv = await driver.findElement(By.className('bg-red-100'));
          errorText = await errorDiv.getText();
        } catch (e) {}

        expect(errorText).to.not.contain('Email đã tồn tại');

        const isDisabled = await submitBtn.getAttribute('disabled');
        expect(isDisabled).to.equal('true', 'Nút submit phải bị disabled sau reload.');
      }, driver);
    });
  });

  describe('2. Invalid transitions', function () {

    it('TC-FR-01-013: Bấm Đăng ký khi form rỗng', async function () {
      const tcId = 'TC-FR-01-013';
      const desc = 'Cố gắng submit form khi rỗng.';
      const expected = 'Hệ thống chặn submit, không gửi request API.';

      await captureOnFail(this, tcId, desc, expected, 'Form được submit hoặc không bị chặn', 'UI', async () => {
        await driver.get(`${CONFIG.BASE_URL}/register`);

        const submitBtn = await driver.findElement(By.xpath("//button[@type='submit']"));
        const isDisabled = await submitBtn.getAttribute('disabled');
        expect(isDisabled).to.equal('true', 'Nút submit phải bị vô hiệu hóa.');
      }, driver);
    });

    it('TC-FR-01-014: Bấm Đăng ký khi form chứa dữ liệu không hợp lệ', async function () {
      const tcId = 'TC-FR-01-014';
      const desc = 'Cố gắng submit khi email không đúng định dạng.';
      const expected = 'Không gửi API đi, giữ nguyên trạng thái lỗi và vô hiệu hóa nút submit.';

      await captureOnFail(this, tcId, desc, expected, 'Form gửi API hoặc nút submit không bị vô hiệu hóa', 'UI', async () => {
        await driver.get(`${CONFIG.BASE_URL}/register`);

        await driver.findElement(By.xpath("//label[contains(text(), 'Email')]/following-sibling::input")).sendKeys('invalidemail');
        const submitBtn = await driver.findElement(By.xpath("//button[@type='submit']"));
        
        const isDisabled = await submitBtn.getAttribute('disabled');
        expect(isDisabled).to.equal('true', 'Nút submit phải bị vô hiệu hóa.');
      }, driver);
    });

    it('TC-FR-01-015: Bấm Đăng ký lại mà không sửa email đã trùng', async function () {
      const tcId = 'TC-FR-01-015';
      const desc = 'Click submit lần nữa khi đang có thông báo lỗi email đã tồn tại.';
      const expected = 'Nút submit bị khóa hoặc lỗi trùng email vẫn được hiển thị, không gửi thêm API.';

      await captureOnFail(this, tcId, desc, expected, 'Gửi thêm API hoặc không hiển thị lỗi', 'UI', async () => {
        await driver.get(`${CONFIG.BASE_URL}/register`);

        await driver.findElement(By.xpath("//label[contains(text(), 'Họ Tên')]/following-sibling::input")).sendKeys('Nguyen Van B');
        await driver.findElement(By.xpath("//label[contains(text(), 'Email')]/following-sibling::input")).sendKeys('test@eshop.com');
        await driver.findElement(By.xpath("//label[contains(text(), 'Mật khẩu')]/following-sibling::input")).sendKeys('Test 1234');

        const submitBtn = await driver.findElement(By.xpath("//button[@type='submit']"));
        await submitBtn.click();

        await driver.wait(until.elementLocated(By.className('bg-red-100')), 5000);

        // Click submit again
        await submitBtn.click();

        const submitBtnDisabled = await submitBtn.getAttribute('disabled');
        expect(submitBtnDisabled).to.equal('true', 'Nút submit phải bị vô hiệu hóa sau lỗi.');
      }, driver);
    });
  });

  describe('3. 1-switch (Cặp transition liên tiếp)', function () {

    it('TC-FR-01-020: Đang nhập sai tiếp tục sửa sai (T1 -> T3)', async function () {
      const tcId = 'TC-FR-01-020';
      const desc = 'T1 (Nhập email sai) rồi T3 (Nhập mật khẩu yếu).';
      const expected = 'Form báo lỗi liên tiếp và nút submit bị vô hiệu hóa.';

      await captureOnFail(this, tcId, desc, expected, 'Không cập nhật các lỗi tương ứng', 'UI', async () => {
        await driver.get(`${CONFIG.BASE_URL}/register`);

        // T1
        await driver.findElement(By.xpath("//label[contains(text(), 'Email')]/following-sibling::input")).sendKeys('invalidemail');
        // T3
        await driver.findElement(By.xpath("//label[contains(text(), 'Mật khẩu')]/following-sibling::input")).sendKeys('123');

        const submitBtn = await driver.findElement(By.xpath("//button[@type='submit']"));
        const isDisabled = await submitBtn.getAttribute('disabled');
        expect(isDisabled).to.equal('true', 'Nút submit bị khóa.');
      }, driver);
    });

    it('TC-FR-01-021: Đang nhập sai sửa lại cho đúng (T1 -> T4)', async function () {
      const tcId = 'TC-FR-01-021';
      const desc = 'T1 (Mật khẩu yếu) rồi T4 (Sửa mật khẩu mạnh và điền thông tin đúng).';
      const expected = 'Ẩn lỗi, kích hoạt nút Đăng ký.';

      await captureOnFail(this, tcId, desc, expected, 'Nút submit vẫn bị khóa hoặc lỗi còn hiển thị', 'UI', async () => {
        await driver.get(`${CONFIG.BASE_URL}/register`);

        // T1
        const passwordInput = await driver.findElement(By.xpath("//label[contains(text(), 'Mật khẩu')]/following-sibling::input"));
        await passwordInput.sendKeys('123');

        // T4
        await driver.findElement(By.xpath("//label[contains(text(), 'Họ Tên')]/following-sibling::input")).sendKeys('Nguyen Van A');
        await driver.findElement(By.xpath("//label[contains(text(), 'Email')]/following-sibling::input")).sendKeys('new_user@domain.com');
        await passwordInput.clear();
        await passwordInput.sendKeys('Test 1234'); // Bypass flawed regex

        // Spec expects confirm password to be matched as well
        const confirmPasswordInput = await driver.findElement(By.xpath("//label[contains(text(), 'Xác nhận')]/following-sibling::input"));
        await confirmPasswordInput.sendKeys('Test 1234');

        const submitBtn = await driver.findElement(By.xpath("//button[@type='submit']"));
        const isDisabled = await submitBtn.getAttribute('disabled');
        expect(isDisabled).to.not.equal('true', 'Nút submit phải được kích hoạt.');
      }, driver);
    });

    it('TC-FR-01-022: Đang nhập sai bấm reset form (T1 -> T5)', async function () {
      const tcId = 'TC-FR-01-022';
      const desc = 'T1 (Nhập email sai) rồi T5 (Reload trang).';
      const expected = 'Form quay lại trống rỗng ban đầu, nút submit bị vô hiệu hóa.';

      await captureOnFail(this, tcId, desc, expected, 'Form không reset sau reload', 'UI', async () => {
        await driver.get(`${CONFIG.BASE_URL}/register`);

        await driver.findElement(By.xpath("//label[contains(text(), 'Email')]/following-sibling::input")).sendKeys('invalidemail');
        
        await driver.navigate().refresh();

        const emailVal = await driver.findElement(By.xpath("//label[contains(text(), 'Email')]/following-sibling::input")).getAttribute('value');
        expect(emailVal).to.equal('');

        const submitBtn = await driver.findElement(By.xpath("//button[@type='submit']"));
        const isDisabled = await submitBtn.getAttribute('disabled');
        expect(isDisabled).to.equal('true');
      }, driver);
    });

    it('TC-FR-01-023: Đang sẵn sàng chuyển sang sai (T2 -> T6)', async function () {
      const tcId = 'TC-FR-01-023';
      const desc = 'T2 (Điền thông tin đúng) rồi T6 (Xóa mật khẩu).';
      const expected = 'Hiển thị lỗi thiếu mật khẩu và nút submit bị vô hiệu hóa trở lại.';

      await captureOnFail(this, tcId, desc, expected, 'Nút submit không bị khóa', 'UI', async () => {
        await driver.get(`${CONFIG.BASE_URL}/register`);

        // T2
        await driver.findElement(By.xpath("//label[contains(text(), 'Họ Tên')]/following-sibling::input")).sendKeys('Nguyen Van A');
        await driver.findElement(By.xpath("//label[contains(text(), 'Email')]/following-sibling::input")).sendKeys('new_user@domain.com');
        const passwordInput = await driver.findElement(By.xpath("//label[contains(text(), 'Mật khẩu')]/following-sibling::input"));
        await passwordInput.sendKeys('Test 1234');

        // T6
        await passwordInput.clear();

        const submitBtn = await driver.findElement(By.xpath("//button[@type='submit']"));
        const isDisabled = await submitBtn.getAttribute('disabled');
        expect(isDisabled).to.equal('true', 'Nút submit phải bị vô hiệu hóa khi thiếu mật khẩu.');
      }, driver);
    });

    it('TC-FR-01-024: Điền thông tin đúng nhưng email bị trùng (T2 -> T8)', async function () {
      const tcId = 'TC-FR-01-024';
      const desc = 'T2 (Điền thông tin trùng email) rồi T8 (Bấm Đăng ký).';
      const expected = 'Hệ thống báo lỗi "Email đã tồn tại".';

      await captureOnFail(this, tcId, desc, expected, 'Không báo lỗi trùng email', 'UI', async () => {
        await driver.get(`${CONFIG.BASE_URL}/register`);

        await driver.findElement(By.xpath("//label[contains(text(), 'Họ Tên')]/following-sibling::input")).sendKeys('Nguyen Van B');
        await driver.findElement(By.xpath("//label[contains(text(), 'Email')]/following-sibling::input")).sendKeys('test@eshop.com');
        await driver.findElement(By.xpath("//label[contains(text(), 'Mật khẩu')]/following-sibling::input")).sendKeys('Test 1234');

        const submitBtn = await driver.findElement(By.xpath("//button[@type='submit']"));
        await submitBtn.click();

        const errorDiv = await driver.wait(until.elementLocated(By.className('bg-red-100')), 5000);
        const errorText = await errorDiv.getText();
        expect(errorText).to.contain('Email đã tồn tại');
      }, driver);
    });
  });

  describe('4. End-to-end paths', function () {

    it('TC-FR-01-030: Vòng đời đăng ký thành công trực tiếp (Happy Path)', async function () {
      const tcId = 'TC-FR-01-030';
      const desc = 'S1 -> T2 (Điền hợp lệ) -> S3 -> T7 (Submit email mới) -> S4 (Đã đăng ký).';
      const expected = 'Đăng ký thành công và chuyển hướng sang trang đăng nhập.';

      await captureOnFail(this, tcId, desc, expected, 'Không chuyển hướng sang trang đăng nhập', 'UI', async () => {
        await driver.get(`${CONFIG.BASE_URL}/register`);

        await driver.findElement(By.xpath("//label[contains(text(), 'Họ Tên')]/following-sibling::input")).sendKeys('Nguyen Van Happy');
        await driver.findElement(By.xpath("//label[contains(text(), 'Email')]/following-sibling::input")).sendKeys('happy_user@domain.com');
        await driver.findElement(By.xpath("//label[contains(text(), 'Mật khẩu')]/following-sibling::input")).sendKeys('Test 1234'); // Bypass flawed regex

        // If confirm password exists, fill it
        try {
          const confirm = await driver.findElement(By.xpath("//label[contains(text(), 'Xác nhận')]/following-sibling::input"));
          await confirm.sendKeys('Test 1234');
        } catch(e) {}

        const submitBtn = await driver.findElement(By.xpath("//button[@type='submit']"));
        await submitBtn.click();

        await driver.wait(until.urlContains('/login'), 5000);
        const currentUrl = await driver.getCurrentUrl();
        expect(currentUrl).to.contain('/login');
      }, driver);
    });

    it('TC-FR-01-031: Đăng ký trùng email, sửa lại và thành công', async function () {
      const tcId = 'TC-FR-01-031';
      const desc = 'S1 -> T2 (Điền email trùng) -> S3 -> T8 (Bấm đăng ký -> Báo trùng) -> S5 -> T11 (Đổi email mới) -> S3 -> T7 (Submit) -> S4.';
      const expected = 'Lần đầu báo trùng email, sửa email mới thì đăng ký thành công và chuyển hướng.';

      await captureOnFail(this, tcId, desc, expected, 'Đăng ký không thành công sau khi sửa email', 'UI', async () => {
        await driver.get(`${CONFIG.BASE_URL}/register`);

        await driver.findElement(By.xpath("//label[contains(text(), 'Họ Tên')]/following-sibling::input")).sendKeys('Nguyen Van Fixed');
        const emailInput = await driver.findElement(By.xpath("//label[contains(text(), 'Email')]/following-sibling::input"));
        await emailInput.sendKeys('test@eshop.com');
        await driver.findElement(By.xpath("//label[contains(text(), 'Mật khẩu')]/following-sibling::input")).sendKeys('Test 1234');

        const submitBtn = await driver.findElement(By.xpath("//button[@type='submit']"));
        await submitBtn.click();

        // Wait for error
        await driver.wait(until.elementLocated(By.className('bg-red-100')), 5000);

        // Edit email
        await emailInput.clear();
        await emailInput.sendKeys('fixed_user@domain.com');

        // Click submit again
        await submitBtn.click();

        await driver.wait(until.urlContains('/login'), 5000);
        const currentUrl = await driver.getCurrentUrl();
        expect(currentUrl).to.contain('/login');
      }, driver);
    });

    it('TC-FR-01-032: Nhập thông tin lỗi, sửa lại rồi reset trang', async function () {
      const tcId = 'TC-FR-01-032';
      const desc = 'S1 -> T1 (Nhập lỗi) -> S2 -> T4 (Sửa lại đúng) -> S3 -> T9 (Reload trang) -> S1.';
      const expected = 'Nhập lỗi, sửa đúng, reload trang thì form quay về trống hoàn toàn.';

      await captureOnFail(this, tcId, desc, expected, 'Form không quay về trống rỗng', 'UI', async () => {
        await driver.get(`${CONFIG.BASE_URL}/register`);

        const emailInput = await driver.findElement(By.xpath("//label[contains(text(), 'Email')]/following-sibling::input"));
        await emailInput.sendKeys('invalidemail');

        await emailInput.clear();
        await emailInput.sendKeys('happy_user@domain.com');
        await driver.findElement(By.xpath("//label[contains(text(), 'Họ Tên')]/following-sibling::input")).sendKeys('Nguyen Van A');
        await driver.findElement(By.xpath("//label[contains(text(), 'Mật khẩu')]/following-sibling::input")).sendKeys('Test 1234');

        await driver.navigate().refresh();

        const emailVal = await driver.findElement(By.xpath("//label[contains(text(), 'Email')]/following-sibling::input")).getAttribute('value');
        expect(emailVal).to.equal('');
      }, driver);
    });
  });

  describe('5. API Level tests', function () {

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
      const expected = 'API trả về status 400 Bad Request và thông báo lỗi email đã tồn tại.';
      
      await captureOnFail(this, tcId, desc, expected, 'API trả về status 200 đăng ký thành công trùng email', 'API', async () => {
        const response = await registerAPI('Duplicate User', 'test@eshop.com', 'Test1234!');
        
        // The spec requires that duplicate registration fails with 400 Bad Request
        expect(response.status).to.equal(400, 'API trùng email phải trả về mã 400 Bad Request');
        
        const data = await response.json();
        expect(data.error).to.contain('Email đã tồn tại');
      });
    });
  });
});
