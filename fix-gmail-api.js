import { google } from 'googleapis';

async function diagnoseGmailAPI() {
  console.log('🔍 Diagnosticando problema con Gmail API...');
  
  const oauth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    'urn:ietf:wg:oauth:2.0:oob'
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN,
  });

  try {
    // Verificar token de acceso
    console.log('🔑 Obteniendo token de acceso...');
    const { credentials } = await oauth2Client.refreshAccessToken();
    console.log('✅ Token de acceso obtenido');
    
    // Verificar scopes disponibles
    console.log('📋 Scopes incluidos en el token:', credentials.scope);
    
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    
    // Verificar perfil básico
    console.log('👤 Verificando perfil de usuario...');
    const profile = await gmail.users.getProfile({ userId: 'me' });
    console.log('✅ Email autorizado:', profile.data.emailAddress);
    console.log('📊 Total de mensajes:', profile.data.messagesTotal);
    
    // Probar envío de correo con configuración básica
    console.log('📧 Probando envío básico...');
    
    const testMessage = [
      `From: ${profile.data.emailAddress}`,
      'To: jacobopp.27@outlook.com',
      'Subject: Villa al Cielo - Prueba Gmail API Corregida',
      'Content-Type: text/html; charset=utf-8',
      '',
      `<div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #6b705c;">Villa al Cielo - Gmail API Funcionando</h2>
        <p>Este correo fue enviado exitosamente usando Gmail API con permisos corregidos.</p>
        <p><strong>Fecha:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Desde:</strong> ${profile.data.emailAddress}</p>
        <p>Si recibes este mensaje, Gmail API está funcionando correctamente.</p>
      </div>`
    ].join('\n');

    const encodedMessage = Buffer.from(testMessage)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const result = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    console.log('✅ Gmail API - Correo enviado exitosamente!');
    console.log('📋 Message ID:', result.data.id);
    
    return true;
    
  } catch (error) {
    console.log('❌ Error detallado:', error.message);
    
    if (error.code === 403) {
      console.log('🔒 Error 403 - Permisos insuficientes');
      console.log('💡 Soluciones posibles:');
      console.log('1. Verificar que el token tenga scope "https://www.googleapis.com/auth/gmail.send"');
      console.log('2. Re-autorizar la aplicación con los scopes correctos');
      console.log('3. Verificar que la cuenta Gmail tenga permisos de envío habilitados');
    }
    
    if (error.code === 401) {
      console.log('🔑 Error 401 - Token expirado o inválido');
      console.log('💡 Intentando refrescar token...');
    }
    
    console.log('📋 Detalles completos del error:', error);
    return false;
  }
}

diagnoseGmailAPI().catch(console.error);