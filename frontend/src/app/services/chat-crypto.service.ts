import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ChatCryptoService {
  private static readonly PRIVATE_KEY_STORAGE = 'chat_private_key_v1';
  private static readonly PUBLIC_KEY_STORAGE = 'chat_public_key_v1';
  private static readonly RSA_ALGO: RsaHashedKeyGenParams = {
    name: 'RSA-OAEP',
    modulusLength: 2048,
    publicExponent: new Uint8Array([1, 0, 1]),
    hash: 'SHA-256',
  };

  private privateKey: CryptoKey | null = null;
  private publicKey: CryptoKey | null = null;
  private conversationKeys = new Map<string, CryptoKey>();

  async ensureIdentity(): Promise<void> {
    if (this.privateKey && this.publicKey) {
      return;
    }

    const privateJwk = localStorage.getItem(
      ChatCryptoService.PRIVATE_KEY_STORAGE,
    );
    const publicJwk = localStorage.getItem(
      ChatCryptoService.PUBLIC_KEY_STORAGE,
    );

    if (privateJwk && publicJwk) {
      this.privateKey = await window.crypto.subtle.importKey(
        'jwk',
        JSON.parse(privateJwk) as JsonWebKey,
        ChatCryptoService.RSA_ALGO,
        true,
        ['decrypt'],
      );

      this.publicKey = await window.crypto.subtle.importKey(
        'jwk',
        JSON.parse(publicJwk) as JsonWebKey,
        ChatCryptoService.RSA_ALGO,
        true,
        ['encrypt'],
      );

      return;
    }

    const pair = await window.crypto.subtle.generateKey(
      ChatCryptoService.RSA_ALGO,
      true,
      ['encrypt', 'decrypt'],
    );

    this.privateKey = pair.privateKey;
    this.publicKey = pair.publicKey;

    const exportedPrivate = await window.crypto.subtle.exportKey(
      'jwk',
      pair.privateKey,
    );
    const exportedPublic = await window.crypto.subtle.exportKey(
      'jwk',
      pair.publicKey,
    );

    localStorage.setItem(
      ChatCryptoService.PRIVATE_KEY_STORAGE,
      JSON.stringify(exportedPrivate),
    );
    localStorage.setItem(
      ChatCryptoService.PUBLIC_KEY_STORAGE,
      JSON.stringify(exportedPublic),
    );
  }

  async getPublicKeyBundle(): Promise<string> {
    await this.ensureIdentity();

    const publicJwk = localStorage.getItem(
      ChatCryptoService.PUBLIC_KEY_STORAGE,
    );
    if (!publicJwk) {
      throw new Error('Unable to read chat public key');
    }

    return this.toBase64(publicJwk);
  }

  async buildConversationKeyBundles(recipientPublicKeyBundle: string): Promise<{
    initiatorKeyBundle: string;
    recipientKeyBundle: string;
  }> {
    await this.ensureIdentity();

    if (!this.publicKey) {
      throw new Error('Missing local public key');
    }

    const recipientPublicKey = await this.importPublicKeyBundle(
      recipientPublicKeyBundle,
    );
    const conversationKey = await window.crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt'],
    );

    const rawKey = await window.crypto.subtle.exportKey('raw', conversationKey);

    const initiatorEnvelope = await window.crypto.subtle.encrypt(
      { name: 'RSA-OAEP' },
      this.publicKey,
      rawKey,
    );

    const recipientEnvelope = await window.crypto.subtle.encrypt(
      { name: 'RSA-OAEP' },
      recipientPublicKey,
      rawKey,
    );

    return {
      initiatorKeyBundle: this.toBase64(initiatorEnvelope),
      recipientKeyBundle: this.toBase64(recipientEnvelope),
    };
  }

  async setConversationKeyFromBundle(
    conversationId: string,
    myKeyBundle: string,
  ): Promise<void> {
    await this.ensureIdentity();

    if (!this.privateKey) {
      throw new Error('Missing local private key');
    }

    if (this.conversationKeys.has(conversationId)) {
      return;
    }

    const decryptedRawKey = await window.crypto.subtle.decrypt(
      { name: 'RSA-OAEP' },
      this.privateKey,
      this.fromBase64(myKeyBundle),
    );

    const key = await window.crypto.subtle.importKey(
      'raw',
      decryptedRawKey,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt'],
    );

    this.conversationKeys.set(conversationId, key);
  }

  async encryptMessage(
    conversationId: string,
    plainText: string,
  ): Promise<{
    encryptedContent: string;
    iv: string;
    algorithm: string;
  }> {
    const key = this.conversationKeys.get(conversationId);
    if (!key) {
      throw new Error('Conversation key not loaded');
    }

    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const payload = new TextEncoder().encode(plainText);

    const encrypted = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      payload,
    );

    return {
      encryptedContent: this.toBase64(encrypted),
      iv: this.toBase64(iv.buffer),
      algorithm: 'AES-GCM',
    };
  }

  async decryptMessage(
    conversationId: string,
    encryptedContent: string,
    iv: string,
  ): Promise<string> {
    const key = this.conversationKeys.get(conversationId);
    if (!key) {
      throw new Error('Conversation key not loaded');
    }

    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: new Uint8Array(this.fromBase64(iv)),
      },
      key,
      this.fromBase64(encryptedContent),
    );

    return new TextDecoder().decode(decrypted);
  }

  private async importPublicKeyBundle(bundle: string): Promise<CryptoKey> {
    const decoded = this.fromBase64(bundle);
    const jwk = JSON.parse(new TextDecoder().decode(decoded)) as JsonWebKey;

    return window.crypto.subtle.importKey(
      'jwk',
      jwk,
      ChatCryptoService.RSA_ALGO,
      true,
      ['encrypt'],
    );
  }

  private toBase64(data: ArrayBuffer | string): string {
    const bytes =
      typeof data === 'string'
        ? new TextEncoder().encode(data)
        : new Uint8Array(data);

    let binary = '';
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });

    return window.btoa(binary);
  }

  private fromBase64(base64: string): ArrayBuffer {
    const binary = window.atob(base64);
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }

    return bytes.buffer;
  }
}
