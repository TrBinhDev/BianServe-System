<div align="center">

# 🍽️ BianServe

**Hệ thống gọi món nhà hàng qua mã QR**

[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![Next.js](https://img.shields.io/badge/Next.js-14.x-000000?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-5.x-2D3748?style=flat-square&logo=prisma)](https://prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16.x-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://postgresql.org)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.x-010101?style=flat-square&logo=socket.io)](https://socket.io)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![MIT License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

BianServe là nền tảng gọi món và quản lý nhà hàng không chạm (contactless), cho phép khách hàng quét mã QR tại bàn để đặt món, theo dõi đơn hàng theo thời gian thực — không cần app, không cần nhân viên phục vụ trực tiếp.

</div>

---

## 📋 Mục lục

- [Tổng quan](#-tổng-quan)
- [Kiến trúc hệ thống](#️-kiến-trúc-hệ-thống)
- [Tính năng](#-tính-năng)
- [Tech Stack](#️-tech-stack)
- [Cài đặt & Chạy thử](#-cài-đặt--chạy-thử)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
- [Tài liệu thiết kế](#-tài-liệu-thiết-kế)
- [Nhóm phát triển](#-nhóm-phát-triển)

---

## 🌐 Tổng quan

BianServe giải quyết ba vấn đề vận hành cốt lõi của nhà hàng:

| Vấn đề | Giải pháp |
|---|---|
| Khách phải gọi nhân viên để đặt món | Quét QR → gọi món trực tiếp trên điện thoại |
| Trạng thái đơn hàng không minh bạch | Cập nhật realtime qua Socket.io |
| Quản lý thủ công, dễ sai sót | Dashboard tập trung với RBAC và báo cáo tự động |

---

## 🏗️ Kiến trúc hệ thống

Dự án theo mô hình **Monorepo** với 3 ứng dụng độc lập:

```
BIANSERVE-SYSTEM/
├── apps/
│   ├── server/         # REST API + WebSocket (Node.js + Express)
│   ├── management/     # Dashboard quản lý (Next.js) — Admin / Staff
│   └── storefront/     # Giao diện gọi món (Next.js) — Khách hàng
├── docs/               # Tài liệu thiết kế từng module
├── docker-compose.yml  # PostgreSQL, Redis
└── README.md
```

**Luồng dữ liệu chính:**

```
Khách quét QR  ──►  Storefront  ──►  API Server  ──►  PostgreSQL
                                          │
                                     Socket.io
                                          │
                    Management  ◄─────────┘  (realtime update)
```

---

## ✨ Tính năng

### 👨‍💼 Dành cho Admin & Staff

**Phân quyền & Xác thực**
- Đăng nhập JWT, RBAC hai cấp: `Admin` (toàn quyền) và `Staff` (xử lý đơn).

**Quản lý bàn & QR**
- CRUD bàn ăn, theo dõi trạng thái (trống / đang phục vụ).
- Tự động sinh QR khi tạo bàn; hỗ trợ tải về và in mã.

**Quản lý menu**
- CRUD danh mục và món ăn.
- Cập nhật menu đồng bộ realtime đến tất cả thiết bị khách đang mở.

**Quản lý đơn hàng**
- Xem danh sách đơn theo thời gian thực.
- Xác nhận và chuyển trạng thái: `Pending → Confirmed → Completed / Cancelled`.

**Khuyến mãi**
- Tạo mã giảm giá theo % hoặc số tiền cố định.
- Cấu hình điều kiện áp dụng và giới hạn lượt dùng.

**Báo cáo & Thống kê**
- Tổng hợp doanh thu, đơn hàng, món bán chạy, hiệu quả khuyến mãi.
- Xuất báo cáo định dạng **Excel** và **PDF**.

**Feedback**
- Xem và quản lý đánh giá từ khách hàng.

---

### 📱 Dành cho Khách hàng (Storefront)

- Quét QR tại bàn → nhận diện bàn tự động, không cần đăng nhập.
- Duyệt menu realtime, thêm ghi chú cho từng món.
- Quản lý giỏ hàng và áp dụng mã khuyến mãi.
- Theo dõi trạng thái đơn hàng theo thời gian thực qua Socket.io.

---

## 🛠️ Tech Stack

| Thành phần | Công nghệ |
|---|---|
| **Backend** | Node.js 18, Express 4, TypeScript 5 |
| **Frontend — Admin** | Next.js 14 (App Router), TypeScript, TailwindCSS |
| **Frontend — Store** | Next.js 14, TypeScript, TailwindCSS |
| **Database** | PostgreSQL 16, Prisma ORM 5 |
| **Realtime** | Socket.io 4 |
| **QR Code** | `qrcode` |
| **Export** | ExcelJS, PDFKit |
| **Infra** | Docker Compose (PostgreSQL, Redis) |

---

## 🚀 Cài đặt & Chạy thử

### Yêu cầu

- Node.js ≥ 18
- Docker & Docker Compose

### 1. Clone repository

```bash
git clone https://github.com/TrBinhDev/bianserve-system.git
cd bianserve-system
```

### 2. Khởi động database

```bash
docker-compose up -d
```

### 3. Cài dependencies & migrate database

```bash
npm install
cd apps/server
npx prisma migrate dev
```

### 4. Cấu hình biến môi trường

Tạo file `.env` trong `apps/server/`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/bianserve"
JWT_SECRET="your_jwt_secret"
PORT=4000
```

### 5. Chạy toàn bộ hệ thống

```bash
# Từ thư mục gốc
npm run dev
```

| Ứng dụng | URL mặc định |
|---|---|
| API Server | `http://localhost:4000` |
| Management Dashboard | `http://localhost:3000` |
| Storefront | `http://localhost:3001` |

---

## 📁 Cấu trúc thư mục

<details>
<summary>Xem chi tiết</summary>

```
apps/
├── server/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── services/
│   │   └── socket/
│   └── prisma/
│       └── schema.prisma
│
├── management/
│   └── src/
│       ├── app/          # Next.js App Router
│       ├── components/
│       └── lib/
│
└── storefront/
    └── src/
        ├── app/
        ├── components/
        └── lib/
```

</details>

---

## 📄 Tài liệu thiết kế

Chi tiết thiết kế từng module nằm trong thư mục [`/docs`](docs/):

| Module | Nội dung |
|---|---|
| Module 1 | Auth & Phân quyền — JWT, RBAC (Admin / Staff) |
| Module 2 | Quản lý bàn ăn — CRUD, trạng thái bàn |
| Module 3 | Quản lý QR Code — sinh mã, tải về, in |
| Module 4 | Danh mục & Món ăn — CRUD, đồng bộ realtime |
| Module 5 | Đơn hàng — tạo, theo dõi, hủy đơn realtime |
| Module 6 | Khuyến mãi — mã giảm giá, điều kiện, giới hạn |
| Module 7 | Báo cáo & Thống kê — xuất Excel / PDF |
| Module 8 | Feedback & Đánh giá — xem, xóa |

---

## 👥 Nhóm phát triển

| Thành viên | Vai trò |
|---|---|
| [**TrBinhDev**](https://github.com/TrBinhDev) | Full-stack Developer |

---

## 📜 Giấy phép

Phân phối dưới giấy phép **MIT**. Xem file [LICENSE](LICENSE) để biết thêm.