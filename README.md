# Incident Report Web Application (`incident-report-app`)

เว็บแอปพลิเคชันระบบรายงานเหตุการณ์ (**Incident Report**) ออกแบบและพัฒนาขึ้นสำหรับจัดการและติดตามปัญหาด้านความปลอดภัย (**Safety**) และการบำรุงรักษา (**Maintenance**) พร้อมหน้าจอ Dashboard, ฟิลเตอร์ค้นหา, สถิติภาพรวม และระบบจัดการข้อมูล (CRUD) ครบวงจร

---

## 🏗 โครงสร้างและสถาปัตยกรรมระบบ (Architecture)

โปรเจกต์นี้แยกโครงสร้างระหว่างฝั่ง **Frontend** และ **Backend** อย่างชัดเจน เพื่อความสะอาด เรียบร้อย และพร้อมสำหรับการตรวจ Code Review:

```
incident-report-app/
├── backend/                         # Go (Golang) RESTful API Server
│   ├── cmd/
│   │   └── server/
│   │       └── main.go              # Entry point ของ Server, CORS Middleware, Router
│   ├── internal/
│   │   ├── database/
│   │   │   └── db.go                # SQLite Database connection, Table Schema & Seeding
│   │   ├── handler/
│   │   │   └── incident_handler.go  # HTTP Handlers (REST endpoints, Validation, JSON Error)
│   │   ├── model/
│   │   │   └── incident.go          # Go Structs, Data validation logic
│   │   └── repository/
│   │       └── incident_repository.go # SQLite Data Access Layer & Statistics queries
│   ├── data/
│   │   └── incidents.db             # ฐานข้อมูล SQLite (สร้างอัตโนมัติเมื่อรัน)
│   ├── go.mod
│   └── go.sum
│
├── frontend/                        # React + TypeScript Web Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx           # หัวข้อแอป ไอคอนแบรนด์ และปุ่ม New report
│   │   │   ├── StatsSummary.tsx     # การ์ดสรุปยอด Total, Open, In Progress, Success
│   │   │   ├── FilterBar.tsx        # ช่องค้นหาข้อความ และดรอปดาวน์ฟิลเตอร์ Category / Status
│   │   │   ├── IncidentCard.tsx     # การ์ดแสดงรายการเหตุการณ์ พร้อม Badge และ Action buttons
│   │   │   ├── IncidentModal.tsx    # หน้าต่าง Modal สร้างใหม่ (Create) และแก้ไข (Edit)
│   │   │   ├── DeleteConfirmModal.tsx # หน้าต่างยืนยันการลบ (Delete Confirmation)
│   │   │   └── Pagination.tsx       # ส่วนแบ่งหน้า (Pagination)
│   │   ├── services/
│   │   │   └── api.ts               # ฟังก์ชันเรียก REST API เชื่อมต่อกับ Backend
│   │   ├── types/
│   │   │   └── incident.ts          # TypeScript Interfaces & Types
│   │   ├── utils/
│   │   │   └── formatters.ts        # Helper แปลงรูปแบบวันที่และเวลา
│   │   ├── App.tsx                  # คอมโพเนนต์หลักที่รวม State และฟีเจอร์ทั้งหมด
│   │   ├── main.tsx                 # จุดเริ่มต้น React App
│   │   └── index.css                # ดีไซน์ระบบ UI/UX ตาม Mockup (Responsive Mobile + Desktop)
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── context.md                       # ข้อกำหนดโจทย์ (ห้ามแก้ไข)
└── README.md                        # เอกสารแนะนำการติดตั้งและใช้งาน
```

---

## 🛠 Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Lucide Icons, Vanilla CSS Design System
- **Backend**: Go (Golang) 1.22+, `net/http` RESTful API, CORS Middleware
- **Database**: SQLite (ขับเคลื่อนด้วย `modernc.org/sqlite` ซึ่งเป็น Pure Go Driver 100% ไม่ต้องติดตั้ง CGO / MinGW / GCC เพิ่มเติมบน Windows)

---

## 🚀 วิธีการรันโปรเจกต์ (Step-by-Step Instructions)

### 1. ความต้องการของระบบ (Prerequisites)
- [Node.js](https://nodejs.org/) (เวอร์ชัน 18 ขึ้นไป แนะนำ v20 หรือ v24)
- [Go (Golang)](https://go.dev/) (เวอร์ชัน 1.22 ขึ้นไป)

---

### 2. การรัน Backend (Go RESTful API)

1. เปิด Terminal / PowerShell หน้าต่างที่ 1
2. ไปที่โฟลเดอร์ `backend`:
   ```bash
   cd backend
   ```
3. ดาวน์โหลด Dependencies (หากรันครั้งแรก):
   ```bash
   go mod tidy
   ```
4. เริ่มรัน Backend Server:
   ```bash
   go run ./cmd/server
   ```
5. Server จะเริ่มทำงานที่:
   ```
   http://localhost:8080
   ```
   *(ฐานข้อมูล SQLite จะถูกสร้างและลงข้อมูลตัวอย่างเริ่มต้น 7 รายการให้อัตโนมัติในโฟลเดอร์ `backend/data/incidents.db`)*

---

### 3. การรัน Frontend (React + TypeScript)

1. เปิด Terminal / PowerShell หน้าต่างที่ 2
2. ไปที่โฟลเดอร์ `frontend`:
   ```bash
   cd frontend
   ```
3. ติดตั้ง Node Packages (หากรันครั้งแรก):
   ```bash
   npm install
   ```
4. สั่งรัน Development Server:
   ```bash
   npm run dev
   ```
5. เปิดเบราว์เซอร์แล้วเข้าใช้งานได้ทันทีที่:
   ```
   http://localhost:5173
   ```

---

## 📡 รายละเอียด RESTful API Endpoints

| Method | Endpoint | คำอธิบาย | Query Params / Payload |
|---|---|---|---|
| `GET` | `/api/health` | ตรวจสอบสถานะ Server | - |
| `GET` | `/api/stats` | ดึงสถิติจำนวนเหตุการณ์แยกตามสถานะ | คืนค่า `{ total, open, in_progress, success }` |
| `GET` | `/api/incidents` | ดึงรายการเหตุการณ์ทั้งหมด | `?q=` (ค้นหา), `?category=`, `?status=` |
| `GET` | `/api/incidents/:id` | ดึงข้อมูลเหตุการณ์รายตัว | - |
| `POST` | `/api/incidents` | สร้างรายงานเหตุการณ์ใหม่ | JSON: `{ title, description, category, status }` |
| `PUT` | `/api/incidents/:id` | อัปเดตข้อมูลรายงานเหตุการณ์ | JSON: `{ title, description, category, status }` |
| `DELETE` | `/api/incidents/:id` | ลบรายงานเหตุการณ์ | คืนค่าข้อความยืนยันการลบ |

---

## 🔒 กฎการตรวจสอบข้อมูล (Input Validation & Type Safety)

- **Title**: จำเป็นต้องกรอก (ความยาวไม่เกิน 100 ตัวอักษร)
- **Description**: จำเป็นต้องกรอก (ไม่เป็นค่าว่าง)
- **Category**: รับเฉพาะค่า `"Safety"` หรือ `"Maintenance"` เท่านั้น
- **Status**: รับเฉพาะค่า `"Open"`, `"In Progress"` หรือ `"Success"` เท่านั้น
- **Created At**: วันที่และเวลาจะถูกบันทึกอัตโนมัติเมื่อสร้างรายการ และไม่อนุญาตให้แก้ไขในโหมด Edit
