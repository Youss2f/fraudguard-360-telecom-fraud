import crypto from 'crypto'

// Encryption configuration
const ENCRYPTION_CONFIG = {
  algorithm: 'aes-256-gcm',
  keyLength: 32, // 256 bits
  ivLength: 16,  // 128 bits
  tagLength: 16, // 128 bits
  saltLength: 32, // 256 bits
}

// Get encryption key from environment or generate one
function getEncryptionKey(): Buffer {
  const keyString = process.env.ENCRYPTION_KEY
  
  if (keyString) {
    // Use provided key
    return Buffer.from(keyString, 'hex')
  }
  
  // For demo mode, use a deterministic key based on secret
  const secret = process.env.NEXTAUTH_SECRET || 'demo-secret-key'
  return crypto.scryptSync(secret, 'salt', ENCRYPTION_CONFIG.keyLength)
}

// Encrypt sensitive data
export function encryptData(data: string): string {
  try {
    if (!data) return data

    const key = getEncryptionKey()
    const iv = crypto.randomBytes(ENCRYPTION_CONFIG.ivLength)
    
    const cipher = crypto.createCipher(ENCRYPTION_CONFIG.algorithm, key)
    cipher.setAAD(Buffer.from('fraudguard-data'))
    
    let encrypted = cipher.update(data, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    const tag = cipher.getAuthTag()
    
    // Combine iv + tag + encrypted data
    const combined = iv.toString('hex') + tag.toString('hex') + encrypted
    return combined
    
  } catch (error) {
    console.error('Encryption failed:', error)
    // In demo mode, return original data if encryption fails
    return data
  }
}

// Decrypt sensitive data
export function decryptData(encryptedData: string): string {
  try {
    if (!encryptedData) return encryptedData

    const key = getEncryptionKey()
    
    // Extract components
    const ivHex = encryptedData.slice(0, ENCRYPTION_CONFIG.ivLength * 2)
    const tagHex = encryptedData.slice(ENCRYPTION_CONFIG.ivLength * 2, (ENCRYPTION_CONFIG.ivLength + ENCRYPTION_CONFIG.tagLength) * 2)
    const encrypted = encryptedData.slice((ENCRYPTION_CONFIG.ivLength + ENCRYPTION_CONFIG.tagLength) * 2)
    
    const iv = Buffer.from(ivHex, 'hex')
    const tag = Buffer.from(tagHex, 'hex')
    
    const decipher = crypto.createDecipher(ENCRYPTION_CONFIG.algorithm, key)
    decipher.setAAD(Buffer.from('fraudguard-data'))
    decipher.setAuthTag(tag)
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
    
  } catch (error) {
    console.error('Decryption failed:', error)
    // In demo mode, return original data if decryption fails
    return encryptedData
  }
}

// Hash sensitive data (one-way)
export function hashData(data: string, salt?: string): string {
  try {
    const actualSalt = salt || crypto.randomBytes(ENCRYPTION_CONFIG.saltLength).toString('hex')
    const hash = crypto.scryptSync(data, actualSalt, 64).toString('hex')
    return `${actualSalt}:${hash}`
  } catch (error) {
    console.error('Hashing failed:', error)
    return data
  }
}

// Verify hashed data
export function verifyHash(data: string, hashedData: string): boolean {
  try {
    const [salt, hash] = hashedData.split(':')
    const dataHash = crypto.scryptSync(data, salt, 64).toString('hex')
    return hash === dataHash
  } catch (error) {
    console.error('Hash verification failed:', error)
    return false
  }
}

// Mask sensitive data for logging/display
export function maskSensitiveData(data: string, type: 'phone' | 'email' | 'id' | 'generic' = 'generic'): string {
  if (!data) return data

  switch (type) {
    case 'phone':
      // Mask phone number: +1234567890 -> +123***7890
      if (data.length > 6) {
        return data.slice(0, 4) + '*'.repeat(data.length - 7) + data.slice(-3)
      }
      break
      
    case 'email':
      // Mask email: user@domain.com -> u***@domain.com
      const [username, domain] = data.split('@')
      if (username && domain && username.length > 2) {
        return username[0] + '*'.repeat(username.length - 2) + username.slice(-1) + '@' + domain
      }
      break
      
    case 'id':
      // Mask ID: 123456789 -> 123***789
      if (data.length > 6) {
        return data.slice(0, 3) + '*'.repeat(data.length - 6) + data.slice(-3)
      }
      break
      
    case 'generic':
    default:
      // Generic masking: show first and last 2 characters
      if (data.length > 4) {
        return data.slice(0, 2) + '*'.repeat(data.length - 4) + data.slice(-2)
      }
      break
  }

  // Fallback for short strings
  return '*'.repeat(data.length)
}

// Secure data object for database storage
export function secureDataObject(obj: Record<string, any>, fieldsToEncrypt: string[] = []): Record<string, any> {
  const secured = { ...obj }

  // Default fields that should always be encrypted
  const defaultEncryptedFields = [
    'firstName',
    'lastName',
    'email',
    'address',
    'idNumber',
    'phoneNumber',
    'msisdn',
    'imsi',
    'imei',
  ]

  const allEncryptedFields = [...new Set([...defaultEncryptedFields, ...fieldsToEncrypt])]

  for (const field of allEncryptedFields) {
    if (secured[field] && typeof secured[field] === 'string') {
      secured[field] = encryptData(secured[field])
    }
  }

  return secured
}

// Decrypt data object from database
export function decryptDataObject(obj: Record<string, any>, fieldsToDecrypt: string[] = []): Record<string, any> {
  const decrypted = { ...obj }

  // Default fields that should always be decrypted
  const defaultDecryptedFields = [
    'firstName',
    'lastName',
    'email',
    'address',
    'idNumber',
    'phoneNumber',
    'msisdn',
    'imsi',
    'imei',
  ]

  const allDecryptedFields = [...new Set([...defaultDecryptedFields, ...fieldsToDecrypt])]

  for (const field of allDecryptedFields) {
    if (decrypted[field] && typeof decrypted[field] === 'string') {
      decrypted[field] = decryptData(decrypted[field])
    }
  }

  return decrypted
}

// Generate secure random token
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex')
}

// Generate API key
export function generateApiKey(): string {
  const prefix = 'fg_' // FraudGuard prefix
  const timestamp = Date.now().toString(36)
  const random = crypto.randomBytes(16).toString('hex')
  return `${prefix}${timestamp}_${random}`
}

// Validate data integrity
export function createDataSignature(data: any): string {
  const dataString = typeof data === 'string' ? data : JSON.stringify(data)
  const key = getEncryptionKey()
  return crypto.createHmac('sha256', key).update(dataString).digest('hex')
}

export function verifyDataSignature(data: any, signature: string): boolean {
  const expectedSignature = createDataSignature(data)
  return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedSignature, 'hex'))
}

// GDPR compliance helpers
export function anonymizeData(obj: Record<string, any>): Record<string, any> {
  const anonymized = { ...obj }
  
  // Fields to anonymize for GDPR compliance
  const fieldsToAnonymize = [
    'firstName',
    'lastName',
    'email',
    'address',
    'idNumber',
    'phoneNumber',
  ]

  for (const field of fieldsToAnonymize) {
    if (anonymized[field]) {
      anonymized[field] = `[ANONYMIZED_${field.toUpperCase()}]`
    }
  }

  // Keep technical identifiers but mark as anonymized
  if (anonymized.msisdn) {
    anonymized.msisdn = `ANON_${hashData(anonymized.msisdn).slice(0, 8)}`
  }
  
  if (anonymized.imsi) {
    anonymized.imsi = `ANON_${hashData(anonymized.imsi).slice(0, 8)}`
  }

  return anonymized
}

// Check if encryption is enabled
export function isEncryptionEnabled(): boolean {
  return process.env.ENABLE_ENCRYPTION !== 'false'
}

// Safe encryption wrapper (falls back to original data if encryption disabled)
export function safeEncrypt(data: string): string {
  return isEncryptionEnabled() ? encryptData(data) : data
}

// Safe decryption wrapper
export function safeDecrypt(data: string): string {
  return isEncryptionEnabled() ? decryptData(data) : data
}
