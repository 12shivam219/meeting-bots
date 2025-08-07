// backend/services/EncryptionService.js
const crypto = require('crypto');

class EncryptionService {
  constructor() {
    this.algorithm = 'aes-256-cbc';
    this.key = crypto.scryptSync(process.env.ENCRYPTION_KEY, 'salt', 32);
    this.iv = crypto.randomBytes(16);
  }

  encrypt(text) {
    const cipher = crypto.createCipheriv(this.algorithm, this.key, this.iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return {
      iv: this.iv.toString('hex'),
      content: encrypted
    };
  }

  decrypt(encryptedData) {
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.key,
      Buffer.from(encryptedData.iv, 'hex')
    );
    let decrypted = decipher.update(encryptedData.content, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  // For securely storing meeting passwords
  async encryptMeetingCredentials(meeting) {
    const encrypted = {
      ...meeting.toObject()
    };

    if (meeting.password) {
      encrypted.password = this.encrypt(meeting.password);
    }

    return encrypted;
  }
}