import {
  formatCurrency,
  formatDate,
  formatPercentage,
  formatNumber,
  getRelativeTime,
  isValidEmail,
  validateBEP20Address,
  validateCardNumber,
  maskCardNumber,
  generateId,
  generatePassword,
  getStatusColor,
  getStatusIcon,
  getRoleColor,
  getRoleIcon,
  formatFileSize,
  formatDuration,
  getInitials,
  isEmpty,
  deepClone,
} from '../lib/utils'

describe('Utils', () => {
  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56')
      expect(formatCurrency(0)).toBe('$0.00')
      expect(formatCurrency(1000000)).toBe('$1,000,000.00')
    })

    it('should format with different currencies', () => {
      expect(formatCurrency(1234.56, 'EUR')).toBe('€1,234.56')
      expect(formatCurrency(1234.56, 'RUB')).toContain('RUB')
      expect(formatCurrency(1234.56, 'RUB')).toContain('1,234.56')
    })
  })

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const testDate = new Date('2023-01-15T10:30:00')
      const result = formatDate(testDate)
      expect(result).toContain('15')
      expect(result).toContain('2023')
    })
  })

  describe('formatPercentage', () => {
    it('should format percentage correctly', () => {
      expect(formatPercentage(25)).toContain('25')
      expect(formatPercentage(25)).toContain('%')
      expect(formatPercentage(12.5)).toContain('12,5')
      expect(formatPercentage(0)).toContain('0')
    })
  })

  describe('formatNumber', () => {
    it('should format numbers correctly', () => {
      expect(formatNumber(1234)).toContain('1')
      expect(formatNumber(1234)).toContain('234')
      expect(formatNumber(1000000)).toContain('1')
      expect(formatNumber(1000000)).toContain('000')
      expect(formatNumber(0)).toBe('0')
    })
  })

  describe('getRelativeTime', () => {
    it('should return correct relative time', () => {
      const now = new Date()
      const oneMinuteAgo = new Date(now.getTime() - 60000)
      const result = getRelativeTime(oneMinuteAgo)
      expect(result).toBe('1 мин назад')
    })
  })

  describe('isValidEmail', () => {
    it('should validate email correctly', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true)
      expect(isValidEmail('invalid-email')).toBe(false)
      expect(isValidEmail('test@')).toBe(false)
      expect(isValidEmail('@example.com')).toBe(false)
    })
  })

  describe('validateBEP20Address', () => {
    it('should validate BEP20 address correctly', () => {
      expect(validateBEP20Address('0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6')).toBe(true)
      expect(validateBEP20Address('0x1234567890123456789012345678901234567890')).toBe(true)
      expect(validateBEP20Address('invalid-address')).toBe(false)
      expect(validateBEP20Address('0x123')).toBe(false)
    })
  })

  describe('validateCardNumber', () => {
    it('should validate card number correctly', () => {
      expect(validateCardNumber('1234 5678 9012 3456')).toBe(true)
      expect(validateCardNumber('1234567890123456')).toBe(false)
      expect(validateCardNumber('1234 5678 9012')).toBe(false)
      expect(validateCardNumber('invalid')).toBe(false)
    })
  })

  describe('maskCardNumber', () => {
    it('should mask card number correctly', () => {
      expect(maskCardNumber('1234 5678 9012 3456')).toBe('1234 **** **** 3456')
      expect(maskCardNumber('1234567890123456')).toBe('1234 **** **** 3456')
      expect(maskCardNumber('1234')).toBe('1234')
    })
  })

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId()
      const id2 = generateId()
      
      expect(id1).toBeDefined()
      expect(id2).toBeDefined()
      expect(id1).not.toBe(id2)
      expect(typeof id1).toBe('string')
    })
  })

  describe('generatePassword', () => {
    it('should generate passwords with correct length', () => {
      const password1 = generatePassword(8)
      const password2 = generatePassword(16)
      
      expect(password1.length).toBe(8)
      expect(password2.length).toBe(16)
      expect(typeof password1).toBe('string')
    })
  })

  describe('getStatusColor', () => {
    it('should return correct status colors', () => {
      expect(getStatusColor('completed')).toBe('from-green-500 to-green-600')
      expect(getStatusColor('pending')).toBe('from-yellow-500 to-yellow-600')
      expect(getStatusColor('failed')).toBe('from-red-500 to-red-600')
      expect(getStatusColor('unknown')).toBe('from-gray-500 to-gray-600')
    })
  })

  describe('getStatusIcon', () => {
    it('should return correct status icons', () => {
      expect(getStatusIcon('completed')).toBe('✅')
      expect(getStatusIcon('pending')).toBe('⏳')
      expect(getStatusIcon('failed')).toBe('❌')
      expect(getStatusIcon('unknown')).toBe('❓')
    })
  })

  describe('getRoleColor', () => {
    it('should return correct role colors', () => {
      expect(getRoleColor('Admin')).toBe('from-red-500 to-red-600')
      expect(getRoleColor('CFO')).toBe('from-purple-500 to-purple-600')
      expect(getRoleColor('Manager')).toBe('from-blue-500 to-blue-600')
      expect(getRoleColor('Employee')).toBe('from-green-500 to-green-600')
      expect(getRoleColor('Tester')).toBe('from-yellow-500 to-yellow-600')
    })
  })

  describe('getRoleIcon', () => {
    it('should return correct role icons', () => {
      expect(getRoleIcon('Admin')).toBe('👑')
      expect(getRoleIcon('CFO')).toBe('💰')
      expect(getRoleIcon('Manager')).toBe('👔')
      expect(getRoleIcon('Employee')).toBe('👷')
      expect(getRoleIcon('Tester')).toBe('🧪')
    })
  })

  describe('formatFileSize', () => {
    it('should format file size correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes')
      expect(formatFileSize(1024)).toBe('1 KB')
      expect(formatFileSize(1024 * 1024)).toBe('1 MB')
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB')
    })
  })

  describe('formatDuration', () => {
    it('should format duration correctly', () => {
      expect(formatDuration(30)).toBe('30с')
      expect(formatDuration(90)).toBe('1м 30с')
      expect(formatDuration(3661)).toBe('1ч 1м 1с')
    })
  })

  describe('getInitials', () => {
    it('should return correct initials', () => {
      expect(getInitials('John Doe')).toBe('JD')
      expect(getInitials('Jane')).toBe('J')
      expect(getInitials('')).toBe('?')
    })
  })

  describe('isEmpty', () => {
    it('should check if object is empty', () => {
      expect(isEmpty({})).toBe(true)
      expect(isEmpty([])).toBe(true)
      expect(isEmpty('')).toBe(true)
      expect(isEmpty(null)).toBe(true)
      expect(isEmpty(undefined)).toBe(true)
      expect(isEmpty({ key: 'value' })).toBe(false)
      expect(isEmpty([1, 2, 3])).toBe(false)
      expect(isEmpty('hello')).toBe(false)
    })
  })

  describe('deepClone', () => {
    it('should clone objects deeply', () => {
      const original = { a: 1, b: { c: 2 } }
      const cloned = deepClone(original)
      
      expect(cloned).toEqual(original)
      expect(cloned).not.toBe(original)
      expect(cloned.b).not.toBe(original.b)
    })

    it('should handle null and undefined', () => {
      expect(deepClone(null)).toBe(null)
      expect(deepClone(undefined)).toBe(undefined)
    })

    it('should handle dates', () => {
      const date = new Date()
      const cloned = deepClone(date)
      
      expect(cloned).toEqual(date)
      expect(cloned).not.toBe(date)
    })
  })
})
