# Study Plan

Ứng dụng Next.js cho học sinh xây dựng lộ trình học tập, làm bài đánh giá và
luyện tập. Xác thực dùng Firebase Authentication; quyền truy cập máy chủ và dữ
liệu học tập dùng Firebase Admin/Firestore.

## Chạy local

1. Cài dependency:

   ```bash
   npm ci
   ```

2. Tạo `.env.local` với các biến sau:

   ```text
   NEXT_PUBLIC_FIREBASE_API_KEY=
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
   NEXT_PUBLIC_FIREBASE_APP_ID=
   FIREBASE_PROJECT_ID=
   FIREBASE_CLIENT_EMAIL=
   FIREBASE_PRIVATE_KEY=
   ```

   `FIREBASE_PRIVATE_KEY` phải là private key của service account; giữ bí mật và
   không commit file môi trường.

3. Bật Email/Password và Google trong Firebase Authentication, sau đó chạy:

   ```bash
   npm run dev
   ```

## Kiểm tra và triển khai Firebase

```bash
npm run lint
npm run build
```

`firebase.json` khai báo Firestore rules/indexes và Storage rules. Có thể triển
khai bằng Firebase CLI đã cài và đăng nhập:

```bash
firebase deploy --only firestore:rules,firestore:indexes,storage
```

Firestore client rules chỉ cho phép chủ tài khoản đọc hồ sơ và cập nhật tên/ảnh;
quyền quản trị, bài làm và lộ trình được xử lý qua API server-side. Storage hiện
đang khóa đọc/ghi vì ứng dụng chưa có luồng tải nội dung lên.

## Luồng hiện có

- Đăng ký/đăng nhập, xác minh email, Google login và session cookie HttpOnly.
- Onboarding với mục tiêu, học lực, lịch học và bài kiểm tra đầu vào được chấm
  ở server.
- Sinh và lưu lộ trình 4 tuần theo hồ sơ, đánh dấu nhiệm vụ hoàn thành và lưu
  kết quả luyện tập trong Firestore.
- Practice API yêu cầu session; answer key không được gửi xuống client.

## Giới hạn cần biết

- Bài tập hiện là catalog mẫu trong mã nguồn; cần CMS và lưu nội dung thật trước
  khi dùng cho nhiều lớp/học sinh.
- Chấm bài tự luận hiện là heuristic/rubric ở server, **chưa kết nối mô hình AI**.
  Không gửi bài làm học sinh tới dịch vụ AI bên ngoài khi chưa có lựa chọn nhà
  cung cấp, cấu hình và thông báo quyền riêng tư phù hợp.
- Lộ trình hiện tạo khung nhiệm vụ theo môn và mức độ học lực; chưa tích hợp thư
  viện bài giảng phong phú, lịch sử mastery chi tiết hay điều chỉnh tự động theo
  từng kết quả assessment.
