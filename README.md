# 🚀 Affectivity - Система управления финансовыми операциями

Современная веб-платформа для управления банками, картами, транзакциями и сотрудниками с ролевой системой доступа.

## 📋 Содержание

- [Особенности](#особенности)
- [Технологии](#технологии)
- [Структура проекта](#структура-проекта)
- [Установка](#установка)
- [Конфигурация](#конфигурация)
- [API Документация](#api-документация)
- [Роли пользователей](#роли-пользователей)
- [Разработка](#разработка)
- [Деплой](#деплой)
- [Мониторинг](#мониторинг)

## ✨ Особенности

### 🔐 Безопасность
- JWT аутентификация
- Ролевая система доступа (Admin, CFO, Manager, Employee, Tester)
- Row Level Security (RLS) в базе данных
- Логирование всех действий пользователей

### 📊 Управление данными
- **Банки**: Управление банковскими счетами и аккаунтами
- **Карты**: Система карт с назначением сотрудникам
- **Казино**: Управление казино и их статусами
- **Сотрудники**: Полное управление персоналом
- **Транзакции**: Отслеживание всех финансовых операций
- **Отчеты**: Детальная аналитика и экспорт данных

### 🎨 Пользовательский интерфейс
- Современный адаптивный дизайн
- Темная тема с градиентами
- Интерактивные компоненты
- Поиск и фильтрация
- Пагинация для больших списков
- Экспорт данных в JSON, CSV, Excel

### 📈 Аналитика
- Дашборд с ключевыми метриками
- Статистика по картам и транзакциям
- Детальные отчеты
- Визуализация данных

## 🛠 Технологии

### Frontend
- **Next.js 14** - React фреймворк
- **TypeScript** - Типизация
- **Tailwind CSS** - Стилизация
- **Sonner** - Уведомления
- **React Hooks** - Управление состоянием

### Backend
- **Next.js API Routes** - Серверные эндпоинты
- **Supabase** - База данных и аутентификация
- **PostgreSQL** - Основная база данных
- **JWT** - Токены аутентификации
- **bcryptjs** - Хеширование паролей

### Инфраструктура
- **Vercel** - Хостинг и деплой
- **GitHub** - Система контроля версий
- **Supabase** - Backend-as-a-Service

## 📁 Структура проекта

```
affectivity/
├── app/                          # Next.js App Router
│   ├── api/                      # API эндпоинты
│   │   ├── auth/                 # Аутентификация
│   │   ├── banks/                # Управление банками
│   │   ├── cards/                # Управление картами
│   │   ├── casinos/              # Управление казино
│   │   ├── dashboard/            # Дашборд API
│   │   ├── employees/            # Управление сотрудниками
│   │   ├── logs/                 # Система логирования
│   │   ├── reports/              # Отчеты
│   │   ├── transactions/         # Транзакции
│   │   └── users/                # Управление пользователями
│   ├── components/               # React компоненты
│   │   ├── Button.tsx           # Кнопка
│   │   ├── Navigation.tsx       # Навигация
│   │   ├── SearchFilter.tsx     # Поиск и фильтры
│   │   ├── ExportData.tsx       # Экспорт данных
│   │   ├── Pagination.tsx       # Пагинация
│   │   └── NotificationCenter.tsx # Уведомления
│   ├── banks/                   # Страница банков
│   ├── cards/                   # Страница карт
│   ├── casinos/                 # Страница казино
│   ├── dashboard/               # Главный дашборд
│   ├── employees/               # Страница сотрудников
│   ├── logs/                    # Страница логов (Admin)
│   ├── profile/                 # Профиль пользователя
│   ├── reports/                 # Страница отчетов
│   ├── transactions/            # Страница транзакций
│   ├── users/                   # Страница пользователей (Admin)
│   ├── login/                   # Страница входа
│   └── page.tsx                 # Главная страница
├── lib/                         # Утилиты и конфигурация
│   ├── supabase/                # Supabase клиенты
│   └── utils.ts                 # Общие утилиты
├── scripts/                     # Скрипты для базы данных
├── supabase/                    # Миграции базы данных
│   └── migrations/              # SQL миграции
├── types/                       # TypeScript типы
└── public/                      # Статические файлы
```

## 🚀 Установка

### Предварительные требования
- Node.js 18+ 
- npm или yarn
- Git
- Supabase аккаунт

### 1. Клонирование репозитория
```bash
git clone https://github.com/wowcombin/affectivity.git
cd affectivity
```

### 2. Установка зависимостей
```bash
npm install
```

### 3. Настройка переменных окружения
Создайте файл `.env.local`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_JWT_SECRET=your_jwt_secret

# Database
POSTGRES_URL=your_postgres_url
POSTGRES_URL_NON_POOLING=your_postgres_non_pooling_url

# Vercel (опционально)
VERCEL_TOKEN=your_vercel_token
TEAM_ID=your_team_id
```

### 4. Настройка базы данных
```bash
# Применение миграций
npx supabase db push

# Или создание таблиц вручную
npm run create-tables
```

### 5. Запуск в режиме разработки
```bash
npm run dev
```

Приложение будет доступно по адресу [http://localhost:3000](http://localhost:3000)

## ⚙️ Конфигурация

### Роли пользователей
- **Admin**: Полный доступ ко всем функциям
- **CFO**: Управление финансами, банками, картами
- **Manager**: Управление сотрудниками и транзакциями
- **Employee**: Базовый доступ к своим данным
- **Tester**: Тестирование функций

### Настройка RLS (Row Level Security)
Все таблицы защищены политиками RLS:
- Пользователи видят только свои данные
- Администраторы имеют полный доступ
- Менеджеры могут управлять подчиненными

## 📚 API Документация

### Аутентификация
Все API запросы требуют JWT токен в заголовке:
```
Authorization: Bearer <token>
```

### Основные эндпоинты

#### 🔐 Аутентификация
- `POST /api/auth/login` - Вход в систему
- `POST /api/auth/logout` - Выход из системы
- `GET /api/auth/me` - Получение текущего пользователя

#### 🏦 Банки
- `GET /api/banks` - Получение списка банков
- `POST /api/banks` - Создание банка
- `PUT /api/banks/[id]` - Обновление банка
- `DELETE /api/banks/[id]` - Удаление банка

#### 💳 Карты
- `GET /api/cards` - Получение списка карт
- `POST /api/cards` - Создание карты
- `POST /api/cards/assign` - Назначение карты сотруднику
- `DELETE /api/cards/assign?card_id=id` - Снятие назначения

#### 🎰 Казино
- `GET /api/casinos` - Получение списка казино
- `POST /api/casinos` - Создание казино

#### 👥 Сотрудники
- `GET /api/employees` - Получение списка сотрудников
- `POST /api/employees` - Создание сотрудника

#### 💰 Транзакции
- `GET /api/transactions` - Получение транзакций
- `POST /api/transactions` - Создание транзакции

#### 📊 Отчеты
- `GET /api/reports?type=summary` - Сводный отчет
- `GET /api/reports?type=transactions` - Отчет по транзакциям
- `GET /api/reports?type=cards` - Отчет по картам

#### 📋 Логи
- `GET /api/logs` - Получение логов активности (Admin)
- `POST /api/logs` - Создание записи лога

#### 👤 Пользователи
- `GET /api/users` - Получение списка пользователей (Admin)
- `POST /api/users` - Создание пользователя (Admin)

#### 📊 Дашборд
- `GET /api/dashboard` - Данные для дашборда

### Примеры запросов

#### Создание транзакции
```bash
curl -X POST /api/transactions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "employee_id": "uuid",
    "card_id": "uuid", 
    "casino_id": "uuid",
    "transaction_type": "deposit",
    "amount": 1000.00,
    "profit": 50.00,
    "status": "completed",
    "notes": "Тестовая транзакция"
  }'
```

#### Получение отчета
```bash
curl -X GET "/api/reports?type=summary&startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer <token>"
```

## 🔧 Разработка

### Структура компонентов
Все компоненты следуют единому стилю:
- TypeScript для типизации
- Tailwind CSS для стилей
- Эмодзи для иконок
- Адаптивный дизайн

### Добавление новой страницы
1. Создайте папку в `app/`
2. Добавьте `page.tsx`
3. Обновите навигацию в `Navigation.tsx`
4. Создайте API эндпоинты при необходимости

### Добавление нового API
1. Создайте файл в `app/api/`
2. Реализуйте GET/POST методы
3. Добавьте аутентификацию и авторизацию
4. Обновите документацию

### Стилизация
Используйте предустановленные классы Tailwind:
```tsx
// Карточка
<div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">

// Градиентная кнопка
<button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">

// Статус
<span className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 rounded-full">
```

## 🚀 Деплой

### Vercel (рекомендуется)
1. Подключите репозиторий к Vercel
2. Настройте переменные окружения
3. Деплой автоматический при push в main

### Ручной деплой
```bash
# Сборка
npm run build

# Деплой
npm run deploy
```

### Переменные окружения для продакшена
```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
SUPABASE_JWT_SECRET=your_production_jwt_secret
POSTGRES_URL=your_production_postgres_url
```

## 📊 Мониторинг

### Логи Vercel
```bash
# Просмотр логов деплоя
npx vercel logs

# Мониторинг в реальном времени
npx vercel logs --follow
```

### Мониторинг базы данных
- Supabase Dashboard для просмотра запросов
- Логи активности в таблице `activity_logs`
- Метрики производительности

### Алерты
- Ошибки деплоя через Vercel
- Проблемы с базой данных через Supabase
- Критические ошибки приложения

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте ветку для новой функции
3. Внесите изменения
4. Добавьте тесты
5. Создайте Pull Request

## 📄 Лицензия

MIT License - см. файл [LICENSE](LICENSE)

## 📞 Поддержка

- **Email**: support@affectivity.com
- **Telegram**: @affectivity_support
- **Issues**: [GitHub Issues](https://github.com/wowcombin/affectivity/issues)

## 🎯 Roadmap

### Версия 2.0
- [ ] Мобильное приложение
- [ ] Real-time уведомления
- [ ] Интеграция с криптобиржами
- [ ] Расширенная аналитика
- [ ] API для внешних интеграций

### Версия 3.0
- [ ] Искусственный интеллект для анализа
- [ ] Автоматические торговые стратегии
- [ ] Мультиязычность
- [ ] Темная/светлая тема
- [ ] PWA функциональность

---

**Сделано с ❤️ командой Affectivity**
