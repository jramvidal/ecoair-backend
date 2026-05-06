import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as path from 'path';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor() {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    try {
      // 1. Intentamos leer desde variables de entorno (Render/Producción)
      if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            // Render a veces escapa los saltos de línea, así que nos aseguramos de reemplazarlos
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          }),
        });
        this.logger.log('Firebase Admin SDK initialized successfully (via Env Vars)');
      } else {
        // 2. Si no hay variables, intentamos leer el archivo local (Desarrollo)
        const fs = require('fs');
        const serviceAccountPath = path.resolve(process.cwd(), 'firebase-service-account.json');
        
        if (fs.existsSync(serviceAccountPath)) {
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccountPath),
          });
          this.logger.log('Firebase Admin SDK initialized successfully (via JSON file)');
        } else {
          this.logger.warn('No Firebase credentials found. Push notifications will not work.');
        }
      }
    } catch (error) {
      this.logger.error('Failed to initialize Firebase Admin SDK', error);
    }
  }

  /**
   * Envía una notificación push a una lista de tokens.
   */
  async sendMulticastNotification(tokens: string[], title: string, body: string, data?: any) {
    if (!tokens || tokens.length === 0) {
      return;
    }

    try {
      const message: admin.messaging.MulticastMessage = {
        notification: {
          title,
          body,
        },
        data: data || {},
        tokens,
      };

      const response = await admin.messaging().sendEachForMulticast(message);
      
      this.logger.log(`Notifications sent: ${response.successCount} successful, ${response.failureCount} failed`);
      
      // Aquí se podrían limpiar los tokens que han fallado por estar caducados
      if (response.failureCount > 0) {
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            this.logger.warn(`Failed to send to token ${tokens[idx]}: ${resp.error}`);
            // TODO: Delete invalid tokens from DB
          }
        });
      }
    } catch (error) {
      this.logger.error('Error sending multicast push notification', error);
    }
  }
}
