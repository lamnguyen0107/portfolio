# UI/UX Pro Max - Skill Design Principles

Dựa trên việc nghiên cứu core principles của **UI/UX Pro Max**, đây là những kiến thức và nguyên tắc cốt lõi được áp dụng cho thiết kế UI/UX hiện đại, đặc biệt là cho Portfolio (Creative/Services domain):

## 1. Design Patterns & Styles Ưu Tiên
*   **Hero-Centric Design**: Gây ấn tượng mạnh ngay màn hình đầu tiên.
*   **Bento Box Grid**: Phân bổ thông tin tính năng, dịch vụ, quy trình (How I Work) thành các mảng khối rõ ràng, dễ scan.
*   **Glassmorphism & Soft UI Evolution**: Sử dụng hiệu ứng kính mờ (backdrop-filter) kết hợp viền sáng mỏng (inner glow) và đổ bóng mềm (soft shadows) tạo độ nổi 3D, mang lại cảm giác premium.
*   **Dark Mode (OLED) hoặc Atmosphere Gradient**: Nền sâu (deep background) kết hợp ánh sáng tụ (glow) giúp các thành phần UI nổi bật hơn.

## 2. Typography & Hierarchy (Nghệ thuật chữ)
*   **Pairing**: Kết hợp một font Serif sang trọng (như Playfair Display, Cormorant Garamond) với một font Sans-Serif hiện đại (như Manrope, Inter) để cân bằng giữa sự thanh lịch và dễ đọc.
*   **Kinetic Typography**: Các text lớn ở Header hoặc Hero cần có hiệu ứng xuất hiện (reveal) mượt mà làm điểm nhấn.
*   **Chỉnh Chu Từng Pixel**: Chú ý Line-height (1.5 - 1.6 cho body text, hẹp hơn cho Heading), tracking phù hợp để tránh bị vỡ nhịp điệu (rhythm) của đoạn văn.

## 3. Micro-interactions & Effects (Tương tác siêu nhỏ)
*   Tất cả các hiệu ứng Hover (chuột vào), Focus (bàn phím), Active (click) phải mượt mà.
*   **Transitions**: Thời gian chuyển đổi lý tưởng là `200ms - 300ms`, dùng hàm gia tốc dạng `cubic-bezier`.
*   Tránh các hiệu ứng chuyển động giật cục hoặc quá lòe loẹt. Dùng hover scale nhẹ (1.02x) và tăng độ sáng/sáng của shadow.

## 4. Accessibility & UX Best Practices (Trải nghiệm người dùng)
*   Đảm bảo Contrast Ratio tối thiểu **4.5:1** (WCAG AA). Text trên nền trong suốt phải luôn đọc được (có text-shadow mỏng nếu cần).
*   Giao diện thân thiện ngón tay (Touch targets lớn hơn 44x44px trên mobile).
*   Tối giản hóa thông tin (Eliminate Noise): Less is more.

## 5. Anti-Patterns (Những thứ cần tránh)
*   Shadows quá cứng, màu đen đặc (`rgba(0,0,0,0.5)`). Hãy chuyển sang shadow tán rộng và độ mờ cực thấp.
*   Sử dụng màu sắc cơ bản (bậc 1) gây chói mắt. Hãy thay bằng màu được tinh chỉnh với sắc độ pastel hoặc nhám.
*   Giao diện thiếu khoảng trắng (White space). Khoảng trống chính là nơi để thiết kế "thở".
