# Todo Uygulaması

Bu proje, bir Todo (Görev Yönetim) uygulamasıdır. Aşağıdaki teknolojileri içerir:

- Node.js (Express.js)
- MongoDB (veritabanı)
- RabbitMQ (iş kuyruğu)
- Microservice mimarisi (Worker servisler)
- Socket.IO (gerçek zamanlı bildirimler)
- Node-RED (görsel akış tasarımı, CRUD örnekleri)
- Docker ve Docker Compose (konteynerleştirme)
- Nginx (Frontend için basit servis, Dockerfile içerisinde)
- SurveyJS (frontend form oluşturma)
- DataTables (listeleme/tablo görünümü)

## Proje Yapısı

```
.
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── categoryController.js
│   │   ├── taskController.js
│   │   ├── taskGatewayController.js
│   │   ├── userController.js
│   │   └── userGatewayController.js
│   ├── middlewares/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── Category.js
│   │   ├── Task.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── taskRoutes.js
│   │   └── userRoutes.js
│   ├── services/
│   │   ├── rabbitMQ.js
│   │   └── socket.js
│   ├── todoService.js
│   ├── userService.js
│   ├── server.js
│   ├── config/
│   │   └── config.js
│   ├── package.json
│   ├── Dockerfile
│   └── ...
├── frontend/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── tasks.html
│   ├── categories.html
│   ├── users.html
│   ├── scripts/
│   │   ├── config.js
│   │   ├── login.js
│   │   ├── register.js
│   │   ├── tasks.js
│   │   ├── categories.js
│   │   └── users.js
│   ├── package.json
│   ├── Dockerfile
│   └── ...
├── docker-compose.yml
└── README.md
```

## Kurulum

### 1. Kaynak Kodun Edinilmesi

```bash
git clone <repository-url>
cd <repository-folder>
```

### 2. Ortam Değişkenlerinin Ayarlanması

Proje içerisinde .env dosyası veya docker-compose.yml dosyası üzerinden aşağıdaki değişkenlerin tanımlandığından emin olun:

- MONGO_URI: MongoDB bağlantı adresi (örn. mongodb://mongodb:27017/todo-app)
- PORT: Uygulamanın dinleyeceği port (örn. 4000)
- JWT_SECRET: JWT token oluştururken kullanılacak gizli anahtar
- RABBITMQ_URI: RabbitMQ bağlantı adresi (örn. amqp://user:pass@rabbitmq:5672)

### 3. Docker ve Docker Compose ile Çalıştırma

```bash
docker-compose up --build
```

Bu komutla beraber:

- mongo:4.4 imajı ile MongoDB başlatılır.
- rabbitmq:3-management imajı ile RabbitMQ başlatılır (5672 ve 15672 portları).
- backend dizini içerisindeki Dockerfile build edilir ve todo-backend olarak başlatılır (4000 portu).
- frontend dizini içerisindeki Dockerfile build edilir ve todo-frontend olarak başlatılır (3000 portu).
- İki farklı worker da (todo-worker, user-worker) RabbitMQ ve MongoDB'ye bağlanır.

Ardından aşağıdaki servisler çalışıyor olacaktır:

| Servis | URL | Açıklama |
|--------|-----|-----------|
| Backend | http://localhost:4000 | Node.js/Express.js API |
| Frontend | http://localhost:3000 | Nginx üzerinde yayınlanan statik dosyalar |
| MongoDB | mongodb://localhost:27017 | Veritabanı (default 27017) |
| RabbitMQ | http://localhost:15672 | RabbitMQ Yönetim Konsolu (default user/pass) |

Not: Yönetim paneline erişmek için localhost:15672 üzerinden RabbitMQ kullanıcı adı ve şifrenizi giriniz (varsayılanı user, pass).

## Proje Mimarisi

### Backend (Express.js):

- /api/auth, /api/users, /api/tasks, /api/categories gibi uç noktaları (routes) barındırır.
- Socket.IO entegrasyonu sayesinde anlık bildirimler gönderebilir.
- RabbitMQ ile iletişime geçebilir (publish).

### Microservice Worker'lar:

- todoService.js: "task_queue" kuyruğunu tüketir. Gelen "create" aksiyonunda, MongoDB'ye yeni Task kaydı oluşturur. Ardından Socket.IO ile geri bildirim yapar.
- userService.js: "user_queue" kuyruğunu tüketir. Gelen "create" aksiyonunda, MongoDB'ye yeni User kaydı oluşturur. Ardından Socket.IO ile geri bildirim yapar.

### Socket.IO:

- Backend üzerinde socket.js ile init edilir.
- Worker'lar da socket.io-client ile backend'e bağlanır.
- Görev veya kullanıcı oluşturma gibi olaylar tetiklendiğinde, gerçek zamanlı bildirim gönderilir.

### Node-RED:

- server.js içinde Node-RED entegrasyonu yapılmıştır.
- /red path'i üzerinden Node-RED editörü çalışır.
- /api path'i de Node-RED'in akışlarının httpNodeRoot olarak kullanılır.
- Örnek CRUD akışları (flows.json) proje içinde gösterilmiştir.

### Frontend (Nginx):

- index.html, login.html, register.html, tasks.html, categories.html, users.html gibi sayfalar yer alır.
- SurveyJS ile form oluşturma.
- DataTables ile veri listeleme/tablo düzeni.
- Socket.IO üzerinden anlık bildirimleri dinleme (görev oluşturma, görev güncelleme vb.).
- Tarayıcı tarafında localStorage içinde JWT token saklama ve her istek için Authorization header'a ekleme.

## API Kullanımı

### Kimlik Doğrulama

#### Kayıt Ol

POST /api/auth/register

```json
{
  "email": "user@example.com",
  "password": "secret",
  "role": "user" 
}
```

#### Giriş Yap

POST /api/auth/login

```json
{
  "email": "user@example.com",
  "password": "secret"
}
```

Dönen cevaptaki token değeri, sonrasında tüm isteklerde Bearer Token olarak kullanılmalıdır:

```
Authorization: Bearer <token>
```

### Kategoriler

| Endpoint | Metot | Açıklama | Auth Gerekiyor |
|----------|--------|-----------|----------------|
| /api/categories | POST | Yeni kategori oluşturur | Evet |
| /api/categories | GET | Tüm kategorileri listeler | Evet |
| /api/categories/:categoryId | GET | Tek bir kategori getirir | Evet |
| /api/categories/:categoryId | PUT | Kategori günceller | Evet |
| /api/categories/:categoryId | DELETE | Kategori siler | Evet |

### Görevler

| Endpoint | Metot | Açıklama | Auth Gerekiyor |
|----------|--------|-----------|----------------|
| /api/tasks | POST | Yeni görev oluşturur (RabbitMQ) | Evet |
| /api/tasks | GET | Görevleri listeler | Evet |
| /api/tasks/:taskId | GET | Tek görevi getirir | Evet |
| /api/tasks/:taskId | PUT | Görev günceller | Evet |
| /api/tasks/:taskId | DELETE | Görev siler | Evet |

Not: POST /api/tasks isteği direkt veritabanına değil RabbitMQ kuyruğuna eklenir (taskGatewayController). Worker (todoService.js) kuyruğu tüketerek görevi veritabanına kaydeder ve Socket.IO üzerinden "taskCreated" bildirimi gönderir.

### Kullanıcılar

| Endpoint | Metot | Açıklama | Auth Gerekiyor | Admin Gerekli? |
|----------|--------|-----------|----------------|----------------|
| /api/users | GET | Tüm kullanıcıları listeler | Evet | Evet |
| /api/users/:userId | GET | Tek kullanıcı bilgisi alır | Evet | Evet |
| /api/users | POST | Yeni kullanıcı oluşturur (RabbitMQ) | Evet | Evet |
| /api/users/:userId | PUT | Kullanıcı günceller (parola/rol değişimi) | Evet | Evet |
| /api/users/:userId | DELETE | Kullanıcı siler | Evet | Evet |

Not: POST /api/users isteği, RabbitMQ kuyruğuna eklenir (userGatewayController). Worker (userService.js) kuyruğu tüketerek kullanıcıyı veritabanına kaydeder ve Socket.IO üzerinden "userCreated" bildirimi gönderir.

## Socket.IO Olayları

- **taskCreated**: Worker'dan tetiklenir. Frontend bu olayı dinleyerek yeni oluşturulan görevi tabloya ekler.
- **taskUpdated**: Görev güncellendiğinde tetiklenir.
- **taskDeleted**: Görev silindiğinde tetiklenir.
- **userCreated**: Yeni kullanıcı oluşturulduğunda tetiklenir (admin yetkili kullanıcılar için).

## Node-RED Entegrasyonu

- httpAdminRoot = /red
  - Tarayıcıdan http://localhost:4000/red adresine giderek Node-RED editörüne erişebilirsiniz.
- httpNodeRoot = /api
  - Node-RED akışları /api altında çalışır (Örnek: /node-red/categories gibi).
- Örnek akışlar flows.json içerisinde mevcuttur. Dilerseniz Node-RED editöründen import edebilirsiniz.