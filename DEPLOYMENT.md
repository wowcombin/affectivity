# 🚀 Деплой Affectivity на Vercel

## Подготовка к деплою

### 1. Настройка Supabase

1. **Создайте проект в Supabase** (если еще не создан)
2. **Выполните миграции базы данных**:
   - Скопируйте содержимое файла `supabase/migrations/001_initial_schema.sql`
   - Выполните SQL в Supabase SQL Editor

### 2. Настройка переменных окружения в Vercel

В Vercel Dashboard → Settings → Environment Variables добавьте:

```env
NEXT_PUBLIC_SUPABASE_URL=https://izjneklmbzgaihvwgwqx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6am5la2xtYnpnYWlodndnd3F4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5NTQ2NzYsImV4cCI6MjA3MTUzMDY3Nn0.MRzogPjvY8ijSHCXTAhM64BA4bNMuW2J0b4ycBXQMN0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6am5la2xtYnpnYWlodndnd3F4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTk1NDY3NiwiZXhwIjoyMDcxNTMwNjc2fQ.pB86kUf85lgLXmr0ZMaIxC4TOSAV3WjTuoAS69VNkss
SUPABASE_JWT_SECRET=BrYds8VsFcXCKdKk5jggXaPF4mO7ZApTFGvTX3rhS/3Pv4oxcK9HlQ43dh5sEXlRynxIztrmOyM0tUtTnjjHzA==
```

### 3. Деплой на Vercel

1. **Подключите репозиторий к Vercel**:
   - Перейдите на [vercel.com](https://vercel.com)
   - Нажмите "New Project"
   - Выберите репозиторий `wowcombin/affectivity`
   - Настройте переменные окружения (см. выше)

2. **Настройки деплоя**:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

3. **Деплой**:
   - Нажмите "Deploy"
   - Дождитесь завершения сборки

### 4. Инициализация базы данных

После успешного деплоя:

1. **Создайте тестовых пользователей** через Supabase Dashboard:
   ```sql
   -- Admin
   INSERT INTO users (username, email, password_hash, full_name, role, is_active)
   VALUES ('admin', 'admin@affectivity.com', '$2a$12$...', 'Администратор', 'Admin', true);
   
   -- Manager
   INSERT INTO users (username, email, password_hash, full_name, role, is_active)
   VALUES ('manager', 'manager@affectivity.com', '$2a$12$...', 'Менеджер', 'Manager', true);
   
   -- HR
   INSERT INTO users (username, email, password_hash, full_name, role, is_active)
   VALUES ('hr', 'hr@affectivity.com', '$2a$12$...', 'HR Менеджер', 'HR', true);
   
   -- CFO
   INSERT INTO users (username, email, password_hash, full_name, role, is_active)
   VALUES ('cfo', 'cfo@affectivity.com', '$2a$12$...', 'Финансовый Директор', 'CFO', true);
   
   -- Employee
   INSERT INTO users (username, email, password_hash, full_name, role, usdt_address, usdt_network, is_active)
   VALUES ('employee', 'employee@affectivity.com', '$2a$12$...', 'Сотрудник', 'Employee', '0x742d35Cc6634C0532925a3b844Bc454e44348f44', 'BEP20', true);
   
   -- Tester
   INSERT INTO users (username, email, password_hash, full_name, role, usdt_address, usdt_network, is_active)
   VALUES ('tester', 'tester@affectivity.com', '$2a$12$...', 'Тестировщик', 'Tester', '0x1234567890123456789012345678901234567890', 'BEP20', true);
   ```

2. **Создайте записи в таблице employees**:
   ```sql
   INSERT INTO employees (user_id, percentage_rate, is_active)
   SELECT id, 10.00, true FROM users WHERE role IN ('Employee', 'Tester');
   ```

### 5. Тестовые аккаунты

После инициализации используйте:

- **👑 Admin**: `admin` / `admin123`
- **🎯 Manager**: `manager` / `manager123`
- **👥 HR**: `hr` / `hr123`
- **💼 CFO**: `cfo` / `cfo123`
- **👤 Employee**: `employee` / `employee123`
- **🧪 Tester**: `tester` / `tester123`

## Проверка работоспособности

1. **Откройте сайт**: `https://affectivity.vercel.app`
2. **Войдите в систему** с любым тестовым аккаунтом
3. **Проверьте дашборд** в зависимости от роли
4. **Протестируйте функции**:
   - HR: Создание пользователей
   - CFO: Добавление расходов, расчет зарплат
   - Manager: Управление сотрудниками
   - Employee: Просмотр профиля

## Мониторинг и поддержка

### Логи
- **Vercel**: Function Logs в Dashboard
- **Supabase**: Logs в Dashboard

### Обновления
1. Внесите изменения в код
2. Запушьте в GitHub
3. Vercel автоматически пересоберет проект

### Резервное копирование
- **База данных**: Supabase автоматически создает бэкапы
- **Код**: GitHub репозиторий

## Troubleshooting

### Ошибки деплоя
1. Проверьте переменные окружения
2. Убедитесь, что все зависимости установлены
3. Проверьте логи сборки в Vercel

### Ошибки базы данных
1. Проверьте подключение к Supabase
2. Убедитесь, что миграции выполнены
3. Проверьте права доступа

### Ошибки аутентификации
1. Проверьте JWT_SECRET
2. Убедитесь, что пользователи созданы
3. Проверьте хеши паролей

---

**🎉 Поздравляем! Ваша система Affectivity успешно развернута на Vercel!**
