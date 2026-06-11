# Module 1: Auth & Phân quyền

## 1. Tổng quan

Hệ thống xác thực cho trang quản lý. Khách hàng scan QR không cần đăng nhập.

## 2. Roles

| Role    | Mô tả                    |
| ------- | ------------------------ |
| `admin` | Quản lý toàn bộ hệ thống |
| `staff` | Nhân viên, quyền hạn chế |

## 3. Phân quyền (RBAC Matrix)

| Chức năng             | Admin | Staff                      |
| --------------------- | ----- | -------------------------- |
| Xem dashboard         | ✅    | ✅                         |
| Xem/xác nhận đơn hàng | ✅    | ✅                         |
| CRUD bàn ăn           | ✅    | ❌                         |
| CRUD món/danh mục     | ✅    | ❌                         |
| Quản lý nhân viên     | ✅    | ❌                         |
| Quản lý khuyến mãi    | ✅    | ❌                         |
| Xem thống kê          | ✅    | ✅ (chỉ xem, không export) |
| Xem feedback          | ✅    | ✅                         |

## 4. Database

### Bảng `accounts`

| Column       | Type       | Ghi chú                                              |
| ------------ | ---------- | ---------------------------------------------------- |
| `id`         | UUID       | Primary key                                          |
| `code`       | String(10) | Mã nhân viên 10 số random, unique, dùng để đăng nhập |
| `password`   | String     | Bcrypt hashed                                        |
| `role`       | Enum       | `admin` \| `staff`                                   |
| `is_active`  | Boolean    | Mặc định `true`                                      |
| `created_at` | DateTime   |                                                      |
| `updated_at` | DateTime   |                                                      |

## 5. API Endpoints

### Public

| Method | Endpoint           | Mô tả                           |
| ------ | ------------------ | ------------------------------- |
| `POST` | `/api/auth/login`  | Đăng nhập, trả về JWT           |
| `POST` | `/api/auth/logout` | Logout, clear token phía client |

### Admin only

| Method  | Endpoint                           | Mô tả                                                |
| ------- | ---------------------------------- | ---------------------------------------------------- |
| `POST`  | `/api/admin/accounts`              | Tạo tài khoản nhân viên                              |
| `GET`   | `/api/admin/accounts`              | Danh sách tài khoản (có phân trang + lọc + tìm kiếm) |
| `PATCH` | `/api/admin/accounts/:id/password` | Đổi password                                         |
| `PATCH` | `/api/admin/accounts/:id/status`   | Khóa / mở khóa tài khoản                             |

### Cả admin và staff đều dùng

| Method | Endpoint       | Mô tả                                    |
| ------ | -------------- | ---------------------------------------- |
| `GET`  | `/api/auth/me` | Lấy thông tin user hiện tại (code, role) |

### Query params cho GET /api/admin/accounts

| Param       | Type    | Mô tả                       |
| ----------- | ------- | --------------------------- |
| `page`      | Int     | Mặc định 1                  |
| `limit`     | Int     | Mặc định 20                 |
| `role`      | String  | Lọc theo role (admin/staff) |
| `is_active` | Boolean | Lọc theo trạng thái         |
| `search`    | String  | Tìm kiếm theo code          |

## 6. Middleware

- `authenticate` — Verify JWT, gắn user info vào request
- `authorize(role)` — Kiểm tra role trước khi vào route

## 7. Socket Event

| Event            | Chiều           | Mô tả                              |
| ---------------- | --------------- | ---------------------------------- |
| `account_locked` | Server → Client | Bắn xuống khi admin khóa tài khoản |

**Flow:**

1. Admin gọi `PATCH /api/admin/accounts/:id/status` với `is_active: false`
2. Server emit `account_locked` kèm `userId`
3. Client bắt event → clear token → redirect về trang login

## 8. Seed

- Script seed 1 tài khoản admin mặc định khi khởi tạo hệ thống
- Code và password mặc định cấu hình qua `.env`

## 9. Ghi chú

- Password nhân viên do admin set (8 số), không bắt buộc đổi sau lần đầu
- JWT không có blacklist, thời hạn token cấu hình qua `.env`
- Không dùng middleware check DB cho account bị khóa, chỉ dùng Socket

---

# Module 2: Quản lý bàn ăn

## 1. Tổng quan

Quản lý danh sách bàn ăn trong nhà hàng.

## 2. Phân quyền

| Chức năng   | Admin | Staff |
| ----------- | ----- | ----- |
| CRUD bàn ăn | ✅    | ❌    |

## 3. Database

### Bảng `tables`

| Column         | Type     | Ghi chú                     |
| -------------- | -------- | --------------------------- |
| `id`           | UUID     | Primary key                 |
| `table_number` | String   | Số bàn (unique)             |
| `capacity`     | Int      | Số ghế                      |
| `status`       | Enum     | `available` \| `occupied`   |
| `qr_code`      | String   | Lưu URL hoặc text để tạo QR |
| `created_at`   | DateTime |                             |
| `updated_at`   | DateTime |                             |

## 4. API Endpoints (Admin only)

| Method   | Endpoint                | Mô tả                                          |
| -------- | ----------------------- | ---------------------------------------------- |
| `GET`    | `/api/admin/tables`     | Danh sách bàn (có phân trang + lọc + tìm kiếm) |
| `GET`    | `/api/admin/tables/:id` | Chi tiết bàn                                   |
| `POST`   | `/api/admin/tables`     | Tạo bàn mới (tự động gen QR code)              |
| `PUT`    | `/api/admin/tables/:id` | Cập nhật bàn                                   |
| `DELETE` | `/api/admin/tables/:id` | Xóa bàn                                        |

### Query params cho GET /api/admin/tables

| Param    | Type   | Mô tả                                |
| -------- | ------ | ------------------------------------ |
| `page`   | Int    | Mặc định 1                           |
| `limit`  | Int    | Mặc định 20                          |
| `status` | String | Lọc theo status (available/occupied) |
| `search` | String | Tìm kiếm theo table_number           |

## 5. Ghi chú

- `status` tự động cập nhật khi có đơn hàng active (module Đơn hàng sẽ xử lý)
- `qr_code` tự động gen khi tạo bàn (module 3)

---

# Module 3: Quản lý QR Code

## 1. Tổng quan

Quản lý mã QR cho từng bàn. QR code được gen tự động khi tạo bàn.

## 2. Phân quyền

| Chức năng         | Admin | Staff |
| ----------------- | ----- | ----- |
| Gen lại QR code   | ✅    | ❌    |
| Tải xuống / In QR | ✅    | ❌    |

## 3. Lưu trữ

Không có bảng riêng. QR code lưu trong cột `qr_code` của bảng `tables` (module 2).

Nội dung QR code là URL: `https://yourdomain.com/order/{tableId}`

## 4. API Endpoints (Admin only)

| Method | Endpoint                              | Mô tả                                      |
| ------ | ------------------------------------- | ------------------------------------------ |
| `GET`  | `/api/admin/tables/:id/qr`            | Lấy file ảnh QR code của bàn               |
| `POST` | `/api/admin/tables/:id/qr/regenerate` | Gen lại QR code mới (cập nhật cột qr_code) |
| `GET`  | `/api/admin/tables/:id/qr/download`   | Tải file QR (PNG/SVG)                      |
| `GET`  | `/api/admin/tables/:id/qr/print`      | Xuất file PDF để in                        |

## 5. Luồng xử lý

1. **Tạo bàn** (module 2) → tự động gen QR → lưu vào `qr_code`
2. **Gen lại** → tạo URL mới → ghi đè `qr_code` cũ
3. **Tải/In** → đọc `qr_code` từ DB → sinh ảnh → trả về file

## 6. Ghi chú

- Nên dùng thư viện `qrcode` (Node.js) để sinh QR
- QR format phổ biến: PNG (in được) hoặc SVG (nhẹ)

---

# Module 4: Danh mục & Món ăn

## 1. Tổng quan

Quản lý menu nhà hàng: danh mục món và món ăn.

## 2. Phân quyền

| Chức năng     | Admin | Staff |
| ------------- | ----- | ----- |
| CRUD danh mục | ✅    | ❌    |
| CRUD món ăn   | ✅    | ❌    |
| Xem danh mục  | ✅    | ✅    |
| Xem món ăn    | ✅    | ✅    |

## 3. Database

### Bảng `categories`

| Column       | Type     | Ghi chú                      |
| ------------ | -------- | ---------------------------- |
| `id`         | UUID     | Primary key                  |
| `name`       | String   | Tên danh mục (unique)        |
| `sort_order` | Int      | Thứ tự hiển thị (mặc định 0) |
| `is_active`  | Boolean  | Hiển thị trên menu hay không |
| `created_at` | DateTime |                              |
| `updated_at` | DateTime |                              |

### Bảng `products`

| Column         | Type          | Ghi chú                           |
| -------------- | ------------- | --------------------------------- |
| `id`           | UUID          | Primary key                       |
| `name`         | String        | Tên món                           |
| `description`  | String?       | Mô tả món (nullable)              |
| `price`        | Decimal(10,2) | Giá bán                           |
| `image_url`    | String?       | Link ảnh món (nullable)           |
| `category_id`  | UUID          | Foreign key → categories.id       |
| `is_available` | Boolean       | Còn bán hay không (mặc định true) |
| `created_at`   | DateTime      |                                   |
| `updated_at`   | DateTime      |                                   |

### Quan hệ

- `categories` (1) → `products` (N)
- Khi xóa danh mục → cần xử lý: hoặc không cho xóa nếu còn món, hoặc set `category_id = NULL`

## 4. API Endpoints (Admin only)

### Categories

| Method   | Endpoint                    | Mô tả                                               |
| -------- | --------------------------- | --------------------------------------------------- |
| `GET`    | `/api/admin/categories`     | Danh sách danh mục (có phân trang + lọc + tìm kiếm) |
| `POST`   | `/api/admin/categories`     | Tạo danh mục                                        |
| `PUT`    | `/api/admin/categories/:id` | Sửa danh mục                                        |
| `DELETE` | `/api/admin/categories/:id` | Xóa danh mục                                        |

### Products

| Method   | Endpoint                               | Mô tả                                          |
| -------- | -------------------------------------- | ---------------------------------------------- |
| `GET`    | `/api/admin/products`                  | Danh sách món (có phân trang + lọc + tìm kiếm) |
| `GET`    | `/api/admin/products/:id`              | Chi tiết món                                   |
| `POST`   | `/api/admin/products`                  | Tạo món                                        |
| `PUT`    | `/api/admin/products/:id`              | Sửa món                                        |
| `DELETE` | `/api/admin/products/:id`              | Xóa món                                        |
| `PATCH`  | `/api/admin/products/:id/availability` | Cập nhật trạng thái (còn/hết)                  |

### Query params cho GET /api/admin/categories

| Param       | Type    | Mô tả                      |
| ----------- | ------- | -------------------------- |
| `page`      | Int     | Mặc định 1                 |
| `limit`     | Int     | Mặc định 20                |
| `is_active` | Boolean | Lọc theo trạng thái        |
| `search`    | String  | Tìm kiếm theo tên danh mục |

### Query params cho GET /api/admin/products

| Param          | Type    | Mô tả                       |
| -------------- | ------- | --------------------------- |
| `page`         | Int     | Mặc định 1                  |
| `limit`        | Int     | Mặc định 20                 |
| `category_id`  | UUID    | Lọc theo danh mục           |
| `is_available` | Boolean | Lọc theo trạng thái còn bán |
| `search`       | String  | Tìm kiếm theo tên món       |

## 5. API Endpoints (Public - cho khách hàng)

| Method | Endpoint    | Mô tả                                                                          |
| ------ | ----------- | ------------------------------------------------------------------------------ |
| `GET`  | `/api/menu` | Lấy toàn bộ menu (categories + products, chỉ is_active và is_available = true) |

## 6. Ghi chú

- `description` có thể null
- `image_url` có thể null (nếu chưa có ảnh)
- Sắp xếp mặc định: categories theo `sort_order` ASC, products theo `name` ASC
- Khi xóa danh mục: nên check ràng buộc, nếu còn món thì báo lỗi

---

# Module 5: Đơn hàng

## 1. Tổng quan

Quản lý đơn hàng từ khi khách tạo đến khi hoàn thành.

## 2. Phân quyền

| Chức năng                               | Admin | Staff |
| --------------------------------------- | ----- | ----- |
| Xem danh sách đơn hàng                  | ✅    | ✅    |
| Xem chi tiết đơn hàng                   | ✅    | ✅    |
| Xác nhận đơn hàng (pending → confirmed) | ✅    | ✅    |
| Từ chối/Hủy đơn hàng                    | ✅    | ✅    |
| Hoàn thành đơn (confirmed → completed)  | ✅    | ✅    |

## 3. Database

### Bảng `orders`

| Column          | Type          | Ghi chú                                                |
| --------------- | ------------- | ------------------------------------------------------ |
| `id`            | UUID          | Primary key                                            |
| `order_code`    | String        | Mã đơn hàng (format: ORD + timestamp, unique)          |
| `table_id`      | UUID          | Foreign key → tables.id                                |
| `total_amount`  | Decimal(10,2) | Tổng tiền                                              |
| `status`        | Enum          | `pending` \| `confirmed` \| `completed` \| `cancelled` |
| `cancel_reason` | String?       | Lý do hủy (nullable, chỉ khi status = cancelled)       |
| `cancelled_by`  | UUID?         | Foreign key → accounts.id (ai hủy)                     |
| `created_at`    | DateTime      |                                                        |
| `updated_at`    | DateTime      |                                                        |

### Bảng `order_items`

| Column       | Type          | Ghi chú                         |
| ------------ | ------------- | ------------------------------- |
| `id`         | UUID          | Primary key                     |
| `order_id`   | UUID          | Foreign key → orders.id         |
| `product_id` | UUID          | Foreign key → products.id       |
| `quantity`   | Int           | Số lượng                        |
| `unit_price` | Decimal(10,2) | Giá tại thời điểm đặt           |
| `note`       | String?       | Ghi chú (bớt hành, nhiều đá...) |
| `created_at` | DateTime      |                                 |

### Quan hệ

- `orders` (1) → `order_items` (N)
- `orders` (N) → `tables` (1)
- `orders` (N) → `accounts` (1) qua `cancelled_by`

## 4. API Endpoints

### Public (khách hàng - từ web scan QR)

| Method   | Endpoint                             | Mô tả                                 |
| -------- | ------------------------------------ | ------------------------------------- |
| `POST`   | `/api/orders`                        | Tạo đơn hàng mới (kèm table_id từ QR) |
| `GET`    | `/api/orders/:orderId`               | Lấy trạng thái đơn hàng               |
| `POST`   | `/api/orders/:orderId/items`         | Thêm món vào đơn (gọi thêm)           |
| `PUT`    | `/api/orders/:orderId/items/:itemId` | Sửa số lượng món                      |
| `DELETE` | `/api/orders/:orderId/items/:itemId` | Xóa món khỏi đơn                      |

### Admin & Staff

| Method  | Endpoint                       | Mô tả                                                 |
| ------- | ------------------------------ | ----------------------------------------------------- |
| `GET`   | `/api/admin/orders`            | Danh sách đơn hàng (có phân trang + lọc + tìm kiếm)   |
| `GET`   | `/api/admin/orders/:id`        | Chi tiết đơn hàng                                     |
| `PATCH` | `/api/admin/orders/:id/status` | Cập nhật trạng thái (pending → confirmed → completed) |
| `POST`  | `/api/admin/orders/:id/cancel` | Hủy đơn hàng (kèm lý do)                              |

### Query params cho GET /api/admin/orders

| Param        | Type   | Mô tả                                                   |
| ------------ | ------ | ------------------------------------------------------- |
| `page`       | Int    | Mặc định 1                                              |
| `limit`      | Int    | Mặc định 20                                             |
| `status`     | String | Lọc theo status (pending/confirmed/completed/cancelled) |
| `table_id`   | UUID   | Lọc theo bàn                                            |
| `start_date` | Date   | Lọc từ ngày (YYYY-MM-DD)                                |
| `end_date`   | Date   | Lọc đến ngày (YYYY-MM-DD)                               |
| `search`     | String | Tìm kiếm theo order_code                                |

## 5. Socket Events (Realtime)

### Server → Client

| Event                  | Payload                              | Khi nào bắn               |
| ---------------------- | ------------------------------------ | ------------------------- |
| `order_created`        | `{ orderId, tableId, totalAmount }`  | Khách tạo đơn mới         |
| `order_status_changed` | `{ orderId, status, cancelReason? }` | Staff cập nhật trạng thái |
| `order_cancelled`      | `{ orderId, reason }`                | Đơn hàng bị hủy           |

### Client → Server

| Event             | Payload       | Mô tả                                  |
| ----------------- | ------------- | -------------------------------------- |
| `join_order_room` | `{ orderId }` | Khách hàng join phòng để nhận cập nhật |

### Luồng realtime

**Luồng 1: Khách tạo đơn**

1. Khách POST `/api/orders`
2. Server tạo order → emit `order_created` đến admin/staff
3. Admin/Staff thấy đơn mới xuất hiện realtime

**Luồng 2: Staff xác nhận đơn**

1. Staff PATCH `/api/admin/orders/:id/status` (pending → confirmed)
2. Server emit `order_status_changed` đến phòng `order_{orderId}`
3. Web khách hàng nhận event → cập nhật UI ("Đơn hàng đã được xác nhận")

**Luồng 3: Staff hủy đơn**

1. Staff POST `/api/admin/orders/:id/cancel` (kèm lý do)
2. Server emit `order_cancelled` đến phòng `order_{orderId}`
3. Web khách hàng nhận event → hiển thị lý do hủy

## 6. Ghi chú

- Khi tạo đơn, `table.status` tự động chuyển thành `occupied`
- Khi đơn hoàn thành (completed), `table.status` chuyển lại `available`
- `cancelled_by` lưu ID của staff/admin hủy đơn
- Socket rooms: mỗi order có 1 room riêng theo `orderId`

---

# Module 6: Khuyến mãi

## 1. Tổng quan

Quản lý mã giảm giá, áp dụng cho đơn hàng.

## 2. Phân quyền

| Chức năng                | Admin | Staff |
| ------------------------ | ----- | ----- |
| CRUD khuyến mãi          | ✅    | ❌    |
| Xem danh sách khuyến mãi | ✅    | ✅    |
| Áp dụng mã (khi tạo đơn) | ✅    | ✅    |

## 3. Database

### Bảng promotions

| Column              | Type           | Ghi chú                            |
| ------------------- | -------------- | ---------------------------------- |
| id                  | UUID           | Primary key                        |
| name                | String         | Tên khuyến mãi                     |
| code                | String         | Mã giảm giá (unique)               |
| type                | Enum           | PERCENT / FIXED_AMOUNT             |
| value               | Decimal(10,2)  | 10 = 10%, hoặc 50000 = 50k         |
| min_order_value     | Decimal(10,2)? | Tổng đơn tối thiểu                 |
| max_discount_amount | Decimal(10,2)? | Giảm tối đa (chỉ dùng cho PERCENT) |
| time_start          | Time?          | Khung giờ bắt đầu                  |
| time_end            | Time?          | Khung giờ kết thúc                 |
| day_of_week         | Int[]?         | 1-7 (CN=1, T2=2...)                |
| usage_limit         | Int?           | Tổng số lượt tối đa                |
| used_count          | Int            | Đã dùng bao nhiêu lượt             |
| per_user_limit      | Int?           | Mỗi user dùng mấy lần              |
| start_date          | DateTime       | Ngày bắt đầu                       |
| end_date            | DateTime       | Ngày kết thúc                      |
| is_active           | Boolean        | Mặc định true                      |
| created_at          | DateTime       |                                    |
| updated_at          | DateTime       |                                    |

### Bảng trung gian promotion_products

| Column       | Type                 |
| ------------ | -------------------- |
| promotion_id | UUID → promotions.id |
| product_id   | UUID → products.id   |

### Bảng trung gian promotion_categories

| Column       | Type                 |
| ------------ | -------------------- |
| promotion_id | UUID → promotions.id |
| category_id  | UUID → categories.id |

### Bảng promotion_usages

| Column          | Type                 |
| --------------- | -------------------- |
| id              | UUID                 |
| promotion_id    | UUID → promotions.id |
| user_session_id | String               |
| order_id        | UUID → orders.id     |
| used_at         | DateTime             |

## 4. API Endpoints

### Public

GET /api/promotions - Danh sách KM đang hoạt động

POST /api/promotions/apply - Kiểm tra và tính tiền giảm

Payload gửi lên:

- code: "SUMMER10"
- cart_items: [ { product_id, quantity, unit_price } ]
- user_session_id: "session_123"

Response trả về:

- valid: true/false
- discount_amount: 10000
- final_amount: 90000
- message: "Áp dụng thành công"

### Admin only

| Method   | Endpoint                    | Mô tả                                                 |
| -------- | --------------------------- | ----------------------------------------------------- |
| `GET`    | `/api/admin/promotions`     | Danh sách khuyến mãi (có phân trang + lọc + tìm kiếm) |
| `GET`    | `/api/admin/promotions/:id` | Chi tiết                                              |
| `POST`   | `/api/admin/promotions`     | Tạo                                                   |
| `PUT`    | `/api/admin/promotions/:id` | Sửa                                                   |
| `DELETE` | `/api/admin/promotions/:id` | Xóa                                                   |

### Query params cho GET /api/admin/promotions

| Param        | Type    | Mô tả                        |
| ------------ | ------- | ---------------------------- |
| `page`       | Int     | Mặc định 1                   |
| `limit`      | Int     | Mặc định 20                  |
| `is_active`  | Boolean | Lọc theo trạng thái          |
| `start_date` | Date    | Lọc từ ngày bắt đầu          |
| `end_date`   | Date    | Lọc đến ngày kết thúc        |
| `search`     | String  | Tìm kiếm theo name hoặc code |

## 5. Socket Events

promotions_updated (Server → Client) - Bắn khi admin CRUD khuyến mãi

Client nhận event → gọi lại GET /api/promotions → cập nhật danh sách.

## 6. Logic kiểm tra khi áp dụng mã

Thứ tự kiểm tra:

1. Mã tồn tại?
2. is_active = true?
3. start_date ≤ now ≤ end_date?
4. usage_limit? → used_count < usage_limit
5. time_start/time_end? → giờ hiện tại trong khoảng
6. day_of_week? → ngày hiện tại trong mảng
7. min_order_value? → tổng đơn ≥ min_order_value
8. applicable_products/categories? → chỉ tính trên sản phẩm hợp lệ
9. per_user_limit? → kiểm tra bảng promotion_usages

Cách tính tiền giảm:

- PERCENT: discount = total_valid_products \* value / 100
- FIXED_AMOUNT: discount = value
- Nếu có max_discount_amount → discount = min(discount, max_discount_amount)

Sau khi áp dụng thành công (khi tạo đơn):

- Tăng used_count lên 1
- Thêm record vào promotion_usages

## 7. Ghi chú

- Nếu không có ràng buộc sản phẩm/danh mục → áp dụng toàn bộ giỏ hàng
- per_user_limit dùng user_session_id (cookie/localStorage)

---

# Module 7: Báo cáo & Thống kê

## 1. Tổng quan

Thống kê dữ liệu từ các module trước, xuất báo cáo.

## 2. Phân quyền

| Chức năng      | Admin | Staff                      |
| -------------- | ----- | -------------------------- |
| Xem thống kê   | ✅    | ✅ (chỉ xem, không export) |
| Export báo cáo | ✅    | ❌                         |

## 3. Các thống kê chính

### 3.1. Thống kê Doanh thu

- Theo ngày / tuần / tháng / năm
- So sánh tăng/giảm so với kỳ trước (%)

**Nguồn:** `orders` với status = `completed`

### 3.2. Thống kê Đơn hàng

- Tổng số đơn (theo khoảng thời gian)
- Phân bố theo status: pending, confirmed, completed, cancelled
- Tỉ lệ hủy đơn (cancelled / total)
- Giờ cao điểm (group by hour)

**Nguồn:** `orders`

### 3.3. Thống kê Món ăn

- Top 10 món bán chạy nhất (theo số lượng)
- Top 10 món bán chạy nhất (theo doanh thu)
- Top 5 món bị hủy nhiều nhất (nếu có lưu trong order_items)

**Nguồn:** `order_items` + `products`

### 3.4. Thống kê Bàn

- Doanh thu theo từng bàn
- Số đơn theo từng bàn
- Bàn có doanh thu cao nhất

**Nguồn:** `orders` + `tables`

### 3.5. Thống kê Khuyến mãi

- Mã nào được dùng nhiều nhất
- Tổng tiền giảm theo từng mã

**Nguồn:** `promotion_usages` + `promotions`

## 4. API Endpoints

### Xem thống kê (Admin & Staff)

| Method | Endpoint                           | Mô tả                                  |
| ------ | ---------------------------------- | -------------------------------------- |
| `GET`  | `/api/admin/statistics/revenue`    | Doanh thu theo ngày/tuần/tháng/năm     |
| `GET`  | `/api/admin/statistics/orders`     | Thống kê đơn hàng                      |
| `GET`  | `/api/admin/statistics/products`   | Top món ăn                             |
| `GET`  | `/api/admin/statistics/tables`     | Thống kê bàn                           |
| `GET`  | `/api/admin/statistics/promotions` | Thống kê khuyến mãi                    |
| `GET`  | `/api/admin/statistics/dashboard`  | Tổng hợp số liệu cho dashboard (nhanh) |

**Query params chung:**

- `start_date` (YYYY-MM-DD)
- `end_date` (YYYY-MM-DD)
- `type` (day/week/month/year) - cho doanh thu

### Export báo cáo (Admin only)

| Method | Endpoint                                | Mô tả                        |
| ------ | --------------------------------------- | ---------------------------- |
| `GET`  | `/api/admin/statistics/export/revenue`  | Export doanh thu (Excel/PDF) |
| `GET`  | `/api/admin/statistics/export/orders`   | Export danh sách đơn hàng    |
| `GET`  | `/api/admin/statistics/export/products` | Export top món               |

**Query params:** `format` (excel / pdf), `start_date`, `end_date`

## 5. Dashboard (Trang chủ admin)

Hiển thị các chỉ số nhanh:

| Chỉ số                          | Nguồn                                  |
| ------------------------------- | -------------------------------------- |
| Doanh thu hôm nay               | orders (completed, created_at = today) |
| Số đơn hôm nay                  | orders (created_at = today)            |
| Đơn pending cần xử lý           | orders (status = pending)              |
| Top 5 món bán chạy nhất hôm nay | order_items + orders                   |
| Tỉ lệ lấp đầy bàn               | tables (occupied / total)              |

## 6. Ghi chú

- Staff chỉ xem được, không gọi API export
- Export dùng thư viện: `exceljs` (Excel), `pdfkit` (PDF)
- Cache các thống kê nặng (có thể dùng Redis) để tránh query DB nhiều lần
- Mặc định thống kê lấy theo tháng hiện tại nếu không truyền date

---

# Module 8: Feedback & Đánh giá

## 1. Tổng quan

Khách hàng gửi đánh giá sau khi dùng món. Admin/staff xem và quản lý.

## 2. Phân quyền

| Chức năng              | Admin                        | Staff |
| ---------------------- | ---------------------------- | ----- |
| Xem danh sách feedback | ✅                           | ✅    |
| Xóa feedback (spam)    | ✅                           | ❌    |
| Gửi feedback           | Khách hàng (không cần login) |       |

## 3. Database

### Bảng `feedbacks`

| Column       | Type     | Ghi chú                      |
| ------------ | -------- | ---------------------------- |
| `id`         | UUID     | Primary key                  |
| `order_id`   | UUID     | Foreign key → orders.id      |
| `table_id`   | UUID     | Foreign key → tables.id      |
| `rating`     | Int      | 1-5 sao                      |
| `comment`    | String?  | Nội dung đánh giá (nullable) |
| `created_at` | DateTime |                              |

## 4. API Endpoints

### Public (khách hàng)

POST /api/feedbacks - Gửi đánh giá

Payload gửi lên:

- order_id: "uuid"
- table_id: "uuid"
- rating: 5
- comment: "Món ngon, phục vụ tốt"

### Admin & Staff

| Method   | Endpoint                   | Mô tả                                               |
| -------- | -------------------------- | --------------------------------------------------- |
| `GET`    | `/api/admin/feedbacks`     | Danh sách feedback (có phân trang + lọc + tìm kiếm) |
| `DELETE` | `/api/admin/feedbacks/:id` | Xóa feedback (admin only)                           |

### Query params cho GET /api/admin/feedbacks

| Param        | Type   | Mô tả                 |
| ------------ | ------ | --------------------- |
| `page`       | Int    | Mặc định 1            |
| `limit`      | Int    | Mặc định 20           |
| `rating`     | Int    | Lọc theo số sao (1-5) |
| `start_date` | Date   | Lọc từ ngày           |
| `end_date`   | Date   | Lọc đến ngày          |
| `search`     | String | Tìm kiếm theo comment |

## 5. Ghi chú

- Không cần realtime (socket)
- Có thể thêm tính năng trả lời feedback sau (nâng cao)
- Nên giới hạn mỗi order chỉ gửi feedback 1 lần (unique order_id)
