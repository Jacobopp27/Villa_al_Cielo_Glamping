import sgMail from '@sendgrid/mail';
import { google } from 'googleapis';
import fs from 'fs';

// Configurar SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Configurar Gmail API
let oauth2Client = null;
let gmail = null;

if (process.env.GMAIL_CLIENT_ID && process.env.GMAIL_CLIENT_SECRET && process.env.GMAIL_REFRESH_TOKEN) {
  oauth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    'urn:ietf:wg:oauth:2.0:oob'
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN,
  });

  gmail = google.gmail({ version: 'v1', auth: oauth2Client });
}

async function testGmailAPI() {
  console.log('🔍 DIAGNÓSTICO Gmail API:');
  console.log('- Client ID:', process.env.GMAIL_CLIENT_ID ? 'Configurado' : 'NO CONFIGURADO');
  console.log('- Client Secret:', process.env.GMAIL_CLIENT_SECRET ? 'Configurado' : 'NO CONFIGURADO');
  console.log('- Refresh Token:', process.env.GMAIL_REFRESH_TOKEN ? 'Configurado' : 'NO CONFIGURADO');
  console.log('- Gmail Email:', process.env.GMAIL_EMAIL || 'NO CONFIGURADO');

  if (!gmail) {
    console.log('❌ Gmail API no configurado correctamente');
    return false;
  }

  try {
    // Verificar token de acceso
    const tokenInfo = await oauth2Client.getAccessToken();
    console.log('✅ Token de acceso obtenido exitosamente');
    
    // Verificar perfil
    const profile = await gmail.users.getProfile({ userId: 'me' });
    console.log('✅ Perfil Gmail:', profile.data.emailAddress);
    
    return true;
  } catch (error) {
    console.log('❌ Error en Gmail API:', error.message);
    return false;
  }
}

async function testSendGrid() {
  console.log('\n🔍 DIAGNÓSTICO SendGrid:');
  console.log('- API Key:', process.env.SENDGRID_API_KEY ? 'Configurado' : 'NO CONFIGURADO');
  console.log('- Verified Sender:', process.env.SENDGRID_VERIFIED_SENDER || 'NO CONFIGURADO');

  if (!process.env.SENDGRID_API_KEY) {
    console.log('❌ SendGrid no configurado');
    return false;
  }

  try {
    // Verificar API key con una consulta simple
    await sgMail.send({
      to: 'test@example.com',
      from: 'admin@villaalcielo.com',
      subject: 'Test',
      text: 'Test',
      mailSettings: {
        sandboxMode: { enable: true }
      }
    });
    console.log('✅ SendGrid API key válido');
    return true;
  } catch (error) {
    console.log('❌ Error en SendGrid:', error.message);
    return false;
  }
}

async function sendTestEmailWithHeaders(email, service) {
  console.log(`\n📧 Enviando correo de prueba via ${service}:`);
  
  const subject = `Villa al Cielo - Prueba ${service} - ${new Date().toLocaleString()}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #6b705c; text-align: center;">Villa al Cielo</h1>
      <h2 style="color: #2d5a27;">Prueba de Entregabilidad - ${service}</h2>
      
      <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Detalles de la Prueba</h3>
        <p><strong>Servicio:</strong> ${service}</p>
        <p><strong>Fecha/Hora:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Destino:</strong> ${email}</p>
      </div>
      
      <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Instrucciones</h3>
        <p>Si recibes este correo:</p>
        <ol>
          <li>Revisa tu carpeta de SPAM/Correo no deseado</li>
          <li>Marca como "No es spam" si está ahí</li>
          <li>Confirma la recepción</li>
        </ol>
      </div>
      
      <p style="text-align: center; color: #666; margin-top: 30px;">
        <strong>Villa al Cielo - Sistema de Correos</strong><br>
        admin@villaalcielo.com
      </p>
    </div>
  `;

  if (service === 'Gmail API') {
    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
    const messageParts = [
      `From: Villa al Cielo <${process.env.GMAIL_EMAIL}>`,
      `To: ${email}`,
      `Subject: ${utf8Subject}`,
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      'X-Mailer: Villa al Cielo System',
      'Reply-To: admin@villaalcielo.com',
      '',
      html,
    ];
    const message = messageParts.join('\n');
    const encodedMessage = Buffer.from(message)
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
    
    console.log('✅ Gmail API - Mensaje enviado, ID:', result.data.id);
    return result.data.id;
  } else if (service === 'SendGrid') {
    const result = await sgMail.send({
      to: email,
      from: {
        email: 'admin@villaalcielo.com',
        name: 'Villa al Cielo'
      },
      subject: subject,
      html: html,
      replyTo: 'admin@villaalcielo.com',
      headers: {
        'X-Mailer': 'Villa al Cielo System'
      },
      trackingSettings: {
        clickTracking: { enable: false },
        openTracking: { enable: false }
      }
    });
    
    console.log('✅ SendGrid - Mensaje enviado');
    return result[0].headers['x-message-id'];
  }
}

// Función principal de diagnóstico
async function runDiagnostics() {
  console.log('🚀 INICIANDO DIAGNÓSTICO COMPLETO DEL SISTEMA DE CORREOS\n');
  
  const gmailOK = await testGmailAPI();
  const sendgridOK = await testSendGrid();
  
  console.log('\n📋 RESUMEN DE CONFIGURACIÓN:');
  console.log('Gmail API:', gmailOK ? '✅ Funcionando' : '❌ Error');
  console.log('SendGrid:', sendgridOK ? '✅ Funcionando' : '❌ Error');
  
  if (!gmailOK && !sendgridOK) {
    console.log('\n❌ NINGÚN SERVICIO FUNCIONA - REVISAR CONFIGURACIÓN');
    return;
  }
  
  const testEmail = 'jnicolasnvi7@hotmail.com';
  
  console.log('\n🎯 ENVIANDO CORREOS DE PRUEBA:');
  
  try {
    if (gmailOK) {
      const gmailId = await sendTestEmailWithHeaders(testEmail, 'Gmail API');
      console.log('Gmail Message ID:', gmailId);
    }
    
    if (sendgridOK) {
      const sendgridId = await sendTestEmailWithHeaders(testEmail, 'SendGrid');
      console.log('SendGrid Message ID:', sendgridId);
    }
    
    console.log('\n📬 INSTRUCCIONES:');
    console.log('1. Revisa tu bandeja de entrada en', testEmail);
    console.log('2. Si no aparece, revisa la carpeta de SPAM');
    console.log('3. Espera hasta 5 minutos para la entrega');
    console.log('4. Algunos filtros de Outlook pueden tardar más');
    
  } catch (error) {
    console.log('\n❌ ERROR AL ENVIAR:', error.message);
    console.log('Detalles:', error);
  }
}

runDiagnostics().catch(console.error);