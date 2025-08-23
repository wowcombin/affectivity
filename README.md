# 🏗️ Affectivity - Employee Tracking System 2.0

Полная система управления сотрудниками с автоматическим расчетом зарплат, управлением расходами и мониторингом производительности.

## 🌟 Основные возможности

### 👥 Управление персоналом
- **HR Dashboard**: Создание аккаунтов, отправка NDA, управление сотрудниками
- **Система ролей**: Admin, Manager, HR, CFO, Employee, Tester
- **Увольнение сотрудников**: Полное архивирование данных, блокировка IP, отзыв карт

### 💰 Финансовый контроль
- **Автоматический расчет зарплат**: 10% от профита сотрудников + бонусы
- **Управление расходами**: CFO может добавлять расходы, влияющие на расчеты
- **Умная логика расчета**: От брутто при расходах ≤20%, от нетто при расходах >20%
- **Ролевые заработки**: Manager (10%), HR (5%), CFO (5%), Tester (10%)

### 📊 Мониторинг и аналитика
- **Дашборды по ролям**: Специализированные интерфейсы для каждой роли
- **Статистика производительности**: Профит, транзакции, зарплаты
- **Система уведомлений**: Toast уведомления для всех действий

## 🚀 Быстрый старт

### Предварительные требования
- Node.js 18+ 
- npm или yarn
- Supabase аккаунт

### Установка

1. **Клонируйте репозиторий**
```bash
git clone https://github.com/wowcombin/affectivity.git
cd affectivity
```

2. **Установите зависимости**
```bash
npm install
```

3. **Настройте переменные окружения**
Создайте файл `.env.local` в корне проекта:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://izjneklmbzgaihvwgwqx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6am5la2xtYnpnYWlodndnd3F4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5NTQ2NzYsImV4cCI6MjA3MTUzMDY3Nn0.MRzogPjvY8ijSHCXTAhM64BA4bNMuW2J0b4ycBXQMN0

# Supabase Service Role Key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6am5la2xtYnpnYWlodndnd3F4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTk1NDY3NiwiZXhwIjoyMDcxNTMwNjc2fQ.pB86kUf85lgLXmr0ZMaIxC4TOSAV3WjTuoAS69VNkss

# JWT Secret
SUPABASE_JWT_SECRET=BrYds8VsFcXCKdKk5jggXaPF4mO7ZApTFGvTX3rhS/3Pv4oxcK9HlQ43dh5sEXlRynxIztrmOyM0tUtTnjjHzA==
```

4. **Запустите миграции базы данных**
```bash
# Миграции уже включены в проект
# Файл: supabase/migrations/001_initial_schema.sql
```

5. **Запустите проект**
```bash
npm run dev
```

6. **Откройте браузер**
```
http://localhost:3000
```

## 📋 Структура проекта

```
affectivity/
├── app/                    # Next.js App Router
│   ├── api/               # API endpoints
│   │   ├── auth/          # Аутентификация
│   │   ├── users/         # Управление пользователями
│   │   ├── salaries/      # Расчет зарплат
│   │   ├── expenses/      # Управление расходами
│   │   └── employees/     # Управление сотрудниками
│   ├── components/        # React компоненты
│   ├── login/            # Страница входа
│   └── page.tsx          # Главная страница
├── lib/                   # Утилиты и конфигурация
│   ├── supabase/         # Supabase клиенты
│   ├── auth.ts           # Аутентификация
│   ├── salary-calculator.ts # Расчет зарплат
│   └── utils.ts          # Общие утилиты
├── types/                 # TypeScript типы
├── supabase/             # Миграции и схема БД
└── public/               # Статические файлы
```

## 🗄️ Структура базы данных

### Основные таблицы
- **users**: Пользователи системы
- **employees**: Сотрудники (расширение users)
- **transactions**: Транзакции и профит
- **salaries**: Расчеты зарплат
- **expenses**: Расходы компании
- **role_earnings**: Заработки по ролям
- **nda_documents**: NDA документы
- **fired_employees_archive**: Архив уволенных
- **blocked_ips**: Заблокированные IP

## 🔐 Система ролей и прав

### Admin 👑
- Полный доступ ко всем функциям
- Может уволить любого сотрудника
- Управление системой

### Manager 🎯
- Управление командой
- Может уволить Employee и Tester
- 10% от общего профита

### HR 👥
- Создание аккаунтов сотрудников
- Отправка NDA документов
- 5% от общего профита

### CFO 💼
- Управление расходами
- Финансовый контроль
- 5% от общего профита

### Employee 👤
- Личный профиль
- 10% от своего профита + бонусы
- Управление USDT адресом

### Tester 🧪
- Тестирование казино
- 10% от профита по своим сайтам

## 💰 Система расчета зарплат

### Логика расчета
1. **Сотрудники**: 10% от своего профита + бонусы за результат
2. **Manager**: 10% от общего профита всех сотрудников
3. **HR**: 5% от общего профита
4. **CFO**: 5% от общего профита
5. **Tester**: 10% от профита по своим казино

### Учет расходов
- **Расходы ≤ 20%**: Расчет от брутто профита
- **Расходы > 20%**: Расчет от нетто профита (брутто - расходы)

### Бонусы
- **Performance Bonus**: $200 при профите ≥ $2000
- **Leader Bonus**: 10% от профита для лидера месяца

## 🚀 Деплой на Vercel

1. **Подключите репозиторий к Vercel**
2. **Настройте переменные окружения в Vercel Dashboard**
3. **Деплой автоматически запустится**

### Переменные окружения для Vercel
```env
NEXT_PUBLIC_SUPABASE_URL=https://izjneklmbzgaihvwgwqx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_JWT_SECRET=your_jwt_secret
```

## 🔧 API Endpoints

### Аутентификация
- `POST /api/auth/login` - Вход в систему
- `POST /api/auth/logout` - Выход из системы

### Пользователи
- `POST /api/users` - Создание пользователя (HR)
- `GET /api/users` - Список пользователей (HR)

### Зарплаты
- `POST /api/salaries/calculate` - Расчет зарплат (CFO)
- `GET /api/salaries/calculate` - Статистика дашборда

### Расходы
- `POST /api/expenses` - Добавление расхода (CFO)
- `GET /api/expenses` - Список расходов (CFO)

### Сотрудники
- `POST /api/employees/fire` - Увольнение сотрудника (Manager)

### Профиль
- `PUT /api/profile/usdt-address` - Обновление USDT адреса
- `GET /api/profile/usdt-address` - Получение USDT адреса

## 🎨 Технологии

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT + Supabase Auth
- **Notifications**: Sonner
- **Forms**: React Hook Form + Zod

## 📝 Лицензия

MIT License

## 🤝 Поддержка

Для вопросов и поддержки создайте Issue в репозитории.

---

**Affectivity v2.0** - Система управления сотрудниками нового поколения 🚀
