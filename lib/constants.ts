// Константы проекта Affectivity

// Роли пользователей
export const USER_ROLES = {
  ADMIN: 'Admin',
  CFO: 'CFO',
  MANAGER: 'Manager',
  EMPLOYEE: 'Employee',
  TESTER: 'Tester',
} as const

export const USER_ROLE_LABELS = {
  [USER_ROLES.ADMIN]: '👑 Администратор',
  [USER_ROLES.CFO]: '💰 CFO',
  [USER_ROLES.MANAGER]: '👔 Менеджер',
  [USER_ROLES.EMPLOYEE]: '👷 Сотрудник',
  [USER_ROLES.TESTER]: '🧪 Тестировщик',
} as const

// Статусы карт
export const CARD_STATUSES = {
  FREE: 'free',
  ASSIGNED: 'assigned',
  IN_PROCESS: 'in_process',
  COMPLETED: 'completed',
  BLOCKED: 'blocked',
} as const

export const CARD_STATUS_LABELS = {
  [CARD_STATUSES.FREE]: '🆓 Свободна',
  [CARD_STATUSES.ASSIGNED]: '📌 Назначена',
  [CARD_STATUSES.IN_PROCESS]: '⏳ В работе',
  [CARD_STATUSES.COMPLETED]: '✅ Завершена',
  [CARD_STATUSES.BLOCKED]: '🚫 Заблокирована',
} as const

// Типы карт
export const CARD_TYPES = {
  DEBIT: 'debit',
  CREDIT: 'credit',
  PREPAID: 'prepaid',
} as const

export const CARD_TYPE_LABELS = {
  [CARD_TYPES.DEBIT]: '💳 Дебетовая',
  [CARD_TYPES.CREDIT]: '💳 Кредитная',
  [CARD_TYPES.PREPAID]: '💳 Предоплаченная',
} as const

// Статусы транзакций
export const TRANSACTION_STATUSES = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const

export const TRANSACTION_STATUS_LABELS = {
  [TRANSACTION_STATUSES.PENDING]: '⏳ В ожидании',
  [TRANSACTION_STATUSES.COMPLETED]: '✅ Завершена',
  [TRANSACTION_STATUSES.FAILED]: '❌ Ошибка',
  [TRANSACTION_STATUSES.CANCELLED]: '🚫 Отменена',
} as const

// Типы транзакций
export const TRANSACTION_TYPES = {
  DEPOSIT: 'deposit',
  WITHDRAWAL: 'withdrawal',
} as const

export const TRANSACTION_TYPE_LABELS = {
  [TRANSACTION_TYPES.DEPOSIT]: '💰 Депозит',
  [TRANSACTION_TYPES.WITHDRAWAL]: '💸 Вывод',
} as const

// Действия для логов
export const LOG_ACTIONS = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  VIEW: 'view',
  EXPORT: 'export',
  IMPORT: 'import',
  ASSIGN: 'assign',
  UNASSIGN: 'unassign',
} as const

export const LOG_ACTION_LABELS = {
  [LOG_ACTIONS.LOGIN]: '🔐 Вход в систему',
  [LOG_ACTIONS.LOGOUT]: '🚪 Выход из системы',
  [LOG_ACTIONS.CREATE]: '➕ Создание',
  [LOG_ACTIONS.UPDATE]: '✏️ Обновление',
  [LOG_ACTIONS.DELETE]: '🗑️ Удаление',
  [LOG_ACTIONS.VIEW]: '👁️ Просмотр',
  [LOG_ACTIONS.EXPORT]: '📤 Экспорт',
  [LOG_ACTIONS.IMPORT]: '📥 Импорт',
  [LOG_ACTIONS.ASSIGN]: '📌 Назначение',
  [LOG_ACTIONS.UNASSIGN]: '🔓 Снятие назначения',
} as const

// Типы уведомлений
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
} as const

// Пагинация
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 25,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
  MAX_PAGE_SIZE: 100,
} as const

// Форматы экспорта
export const EXPORT_FORMATS = {
  JSON: 'json',
  CSV: 'csv',
  EXCEL: 'excel',
} as const

export const EXPORT_FORMAT_LABELS = {
  [EXPORT_FORMATS.JSON]: '📄 JSON',
  [EXPORT_FORMATS.CSV]: '📊 CSV',
  [EXPORT_FORMATS.EXCEL]: '📈 Excel',
} as const

// Валюты
export const CURRENCIES = {
  USD: 'USD',
  EUR: 'EUR',
  RUB: 'RUB',
  USDT: 'USDT',
} as const

export const CURRENCY_SYMBOLS = {
  [CURRENCIES.USD]: '$',
  [CURRENCIES.EUR]: '€',
  [CURRENCIES.RUB]: '₽',
  [CURRENCIES.USDT]: '₮',
} as const

// Страны
export const COUNTRIES = {
  US: 'US',
  RU: 'RU',
  GB: 'GB',
  DE: 'DE',
  FR: 'FR',
  CA: 'CA',
  AU: 'AU',
} as const

export const COUNTRY_LABELS = {
  [COUNTRIES.US]: '🇺🇸 США',
  [COUNTRIES.RU]: '🇷🇺 Россия',
  [COUNTRIES.GB]: '🇬🇧 Великобритания',
  [COUNTRIES.DE]: '🇩🇪 Германия',
  [COUNTRIES.FR]: '🇫🇷 Франция',
  [COUNTRIES.CA]: '🇨🇦 Канада',
  [COUNTRIES.AU]: '🇦🇺 Австралия',
} as const

// API эндпоинты
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
  },
  USERS: '/api/users',
  BANKS: '/api/banks',
  CARDS: '/api/cards',
  CARD_ASSIGN: '/api/cards/assign',
  CASINOS: '/api/casinos',
  EMPLOYEES: '/api/employees',
  TRANSACTIONS: '/api/transactions',
  REPORTS: '/api/reports',
  LOGS: '/api/logs',
  DASHBOARD: '/api/dashboard',
  PROFILE: {
    USDT_ADDRESS: '/api/profile/usdt-address',
  },
} as const

// HTTP статусы
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const

// Сообщения об ошибках
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Необходима авторизация',
  FORBIDDEN: 'Недостаточно прав',
  NOT_FOUND: 'Ресурс не найден',
  VALIDATION_ERROR: 'Ошибка валидации',
  INTERNAL_ERROR: 'Внутренняя ошибка сервера',
  NETWORK_ERROR: 'Ошибка сети',
  TIMEOUT_ERROR: 'Превышено время ожидания',
} as const

// Сообщения об успехе
export const SUCCESS_MESSAGES = {
  CREATED: 'Успешно создано',
  UPDATED: 'Успешно обновлено',
  DELETED: 'Успешно удалено',
  ASSIGNED: 'Успешно назначено',
  UNASSIGNED: 'Назначение снято',
  EXPORTED: 'Данные экспортированы',
  IMPORTED: 'Данные импортированы',
} as const

// Лимиты
export const LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_UPLOAD_FILES: 5,
  MAX_SEARCH_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 1000,
  MAX_NOTES_LENGTH: 500,
  MAX_PASSWORD_LENGTH: 128,
  MIN_PASSWORD_LENGTH: 8,
  MAX_USERNAME_LENGTH: 50,
  MIN_USERNAME_LENGTH: 3,
  MAX_EMAIL_LENGTH: 255,
  MAX_NAME_LENGTH: 100,
} as const

// Регулярные выражения
export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  USERNAME: /^[a-zA-Z0-9_]{3,50}$/,
  CARD_NUMBER: /^\d{4}\s\d{4}\s\d{4}\s\d{4}$/,
  USDT_ADDRESS: /^0x[a-fA-F0-9]{40}$/,
  IP_ADDRESS: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
} as const

// Настройки кэширования
export const CACHE = {
  DEFAULT_TTL: 5 * 60 * 1000, // 5 минут
  LONG_TTL: 30 * 60 * 1000, // 30 минут
  SHORT_TTL: 1 * 60 * 1000, // 1 минута
} as const

// Настройки дебаунса
export const DEBOUNCE = {
  SEARCH: 300, // 300ms
  SAVE: 1000, // 1 секунда
  SCROLL: 100, // 100ms
} as const

// Настройки троттлинга
export const THROTTLE = {
  API_CALLS: 1000, // 1 секунда
  SCROLL: 100, // 100ms
  RESIZE: 250, // 250ms
} as const

// Настройки анимации
export const ANIMATION = {
  DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
  },
  EASING: {
    EASE_IN: 'cubic-bezier(0.4, 0, 1, 1)',
    EASE_OUT: 'cubic-bezier(0, 0, 0.2, 1)',
    EASE_IN_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const

// Настройки уведомлений
export const NOTIFICATION = {
  AUTO_HIDE_DELAY: 5000, // 5 секунд
  MAX_VISIBLE: 5,
  POSITION: 'top-right',
} as const

// Настройки дашборда
export const DASHBOARD = {
  REFRESH_INTERVAL: 30 * 1000, // 30 секунд
  MAX_RECENT_ITEMS: 10,
  CHART_HEIGHT: 300,
} as const

// Настройки отчетов
export const REPORTS = {
  DEFAULT_DATE_RANGE: 30, // 30 дней
  MAX_DATE_RANGE: 365, // 1 год
  EXPORT_FILENAME_PREFIX: 'affectivity-report',
} as const

// Настройки безопасности
export const SECURITY = {
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 часа
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 минут
  PASSWORD_EXPIRY_DAYS: 90,
} as const

// Настройки мониторинга
export const MONITORING = {
  HEALTH_CHECK_INTERVAL: 60 * 1000, // 1 минута
  ERROR_REPORTING_THRESHOLD: 5,
  PERFORMANCE_THRESHOLD: 3000, // 3 секунды
} as const

// Настройки разработки
export const DEVELOPMENT = {
  DEBUG_MODE: process.env.NODE_ENV === 'development',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  API_TIMEOUT: 10000, // 10 секунд
} as const

// Настройки продакшена
export const PRODUCTION = {
  MINIFY: true,
  COMPRESS: true,
  CACHE_HEADERS: true,
  SECURITY_HEADERS: true,
} as const

// Настройки тестирования
export const TESTING = {
  TIMEOUT: 10000, // 10 секунд
  RETRY_ATTEMPTS: 3,
  SCREENSHOT_ON_FAILURE: true,
} as const

// Экспорт всех констант
export default {
  USER_ROLES,
  USER_ROLE_LABELS,
  CARD_STATUSES,
  CARD_STATUS_LABELS,
  CARD_TYPES,
  CARD_TYPE_LABELS,
  TRANSACTION_STATUSES,
  TRANSACTION_STATUS_LABELS,
  TRANSACTION_TYPES,
  TRANSACTION_TYPE_LABELS,
  LOG_ACTIONS,
  LOG_ACTION_LABELS,
  NOTIFICATION_TYPES,
  PAGINATION,
  EXPORT_FORMATS,
  EXPORT_FORMAT_LABELS,
  CURRENCIES,
  CURRENCY_SYMBOLS,
  COUNTRIES,
  COUNTRY_LABELS,
  API_ENDPOINTS,
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  LIMITS,
  REGEX,
  CACHE,
  DEBOUNCE,
  THROTTLE,
  ANIMATION,
  NOTIFICATION,
  DASHBOARD,
  REPORTS,
  SECURITY,
  MONITORING,
  DEVELOPMENT,
  PRODUCTION,
  TESTING,
}
