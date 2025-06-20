import sgMail from '@sendgrid/mail';
import { google } from 'googleapis';
import type { Reservation, Cabin } from '@shared/schema';

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Configurar Gmail API con OAuth2
let oauth2Client: any = null;
let gmail: any = null;

if (process.env.GMAIL_CLIENT_ID && process.env.GMAIL_CLIENT_SECRET && process.env.GMAIL_REFRESH_TOKEN) {
  oauth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URI || 'urn:ietf:wg:oauth:2.0:oob'
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN,
  });

  gmail = google.gmail({ version: 'v1', auth: oauth2Client });
}

// Use verified Villa al Cielo email address
const OWNER_EMAIL = "admin@villaalcielo.com";

// Check if required environment variables exist
if (!process.env.SENDGRID_API_KEY) {
  console.warn("SENDGRID_API_KEY not found, email functionality will be disabled");
}

if (!process.env.SENDGRID_VERIFIED_SENDER) {
  console.warn("SENDGRID_VERIFIED_SENDER not found, using default sender");
}

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

// Función para obtener el dominio del correo
function getDomain(email: string): string {
  return email.split('@')[1].toLowerCase();
}

// Función para enviar con Gmail API
async function sendWithGmail(params: EmailParams): Promise<boolean> {
  if (!gmail) {
    throw new Error('Gmail API not configured');
  }

  try {
    const utf8Subject = `=?utf-8?B?${Buffer.from(params.subject).toString('base64')}?=`;
    const messageParts = [
      `From: Villa al Cielo <${process.env.GMAIL_EMAIL || OWNER_EMAIL}>`,
      `To: ${params.to}`,
      `Subject: ${utf8Subject}`,
      'Content-Type: text/html; charset=utf-8',
      '',
      params.html || params.text || '',
    ];
    const message = messageParts.join('\n');
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    console.log(`Email sent with Gmail API to ${params.to}`);
    return true;
  } catch (error) {
    console.error('Gmail API failed:', error);
    throw error;
  }
}

// Función para enviar con SendGrid
async function sendWithSendGrid(params: EmailParams): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    throw new Error('SendGrid API key not configured');
  }

  const result = await sgMail.send({
    to: params.to,
    from: {
      email: OWNER_EMAIL,
      name: 'Villa al Cielo'
    },
    subject: params.subject,
    text: params.text || params.subject,
    html: params.html,
    replyTo: OWNER_EMAIL,
    headers: {
      'X-Mailer': 'Villa al Cielo Reservation System',
      'X-Priority': '3',
      'Importance': 'Normal'
    },
    trackingSettings: {
      clickTracking: { enable: false },
      openTracking: { enable: false },
      subscriptionTracking: { enable: false }
    }
  });

  console.log(`Email sent with SendGrid to ${params.to}`);
  return true;
}

async function sendEmail(params: EmailParams): Promise<boolean> {
  const domain = getDomain(params.to);
  
  try {
    console.log(`Sending email to: ${params.to} (domain: ${domain})`);
    console.log(`Subject: ${params.subject}`);

    // Use SendGrid as primary service (Gmail API temporarily disabled due to permission issues)
    await sendWithSendGrid(params);
    return true;
    
  } catch (error: any) {
    console.error('Email service failed, logging details for manual processing:');
    console.error('Error:', error.message);
    console.error('Full error:', error);
    
    // Log email content for manual processing
    logEmailDetails(params);
    return false;
  }
}

function logEmailDetails(params: EmailParams) {
  console.log('\n=== EMAIL LOG ===');
  console.log(`TO: ${params.to}`);
  console.log(`FROM: ${params.from}`);
  console.log(`SUBJECT: ${params.subject}`);
  console.log('CONTENT:');
  console.log(params.text || 'No text content');
  console.log('=================\n');
}

export async function sendReservationConfirmationToGuest(
  reservation: Reservation,
  cabin: Cabin
): Promise<boolean> {
  const checkInDate = new Date(reservation.checkIn).toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const checkOutDate = new Date(reservation.checkOut).toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const asadoText = reservation.includesAsado ? "Kit de Asado y " : "";
  const totalFormatted = reservation.totalPrice.toLocaleString('es-CO');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1e40af; text-align: center;">Villa al Cielo</h1>
      <h2 style="color: #2d5a27;">¡Reserva Recibida!</h2>
      
      <p>Hola <strong>${reservation.guestName}</strong>,</p>
      
      <p>¡Gracias por elegirnos! Hemos recibido tu solicitud de reserva. Tu reserva está <strong>congelada por 24 horas</strong> mientras realizas el abono del 50%.</p>
      
      <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #2d5a27; margin-top: 0;">Detalles de tu Reserva</h3>
        <p><strong>Código de Confirmación:</strong> ${reservation.confirmationCode}</p>
        <p><strong>Cabaña:</strong> ${cabin.name}</p>
        <p><strong>Entrada:</strong> ${checkInDate}</p>
        <p><strong>Salida:</strong> ${checkOutDate}</p>
        <p><strong>Huéspedes:</strong> ${reservation.guests}</p>
        <p><strong>Incluye:</strong> ${asadoText}Desayuno</p>
        <p><strong>Total a Pagar:</strong> $${totalFormatted} COP</p>
      </div>
      
      <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #92400e; margin-top: 0;">Instrucciones de Pago - Abono del 50%</h3>
        <p><strong>Monto del Abono:</strong> $${Math.round(reservation.totalPrice * 0.5).toLocaleString('es-CO')} COP</p>
        <p><strong>Titular:</strong> Jacobo Posada</p>
        <p><strong>Banco:</strong> Bancolombia - Ahorros</p>
        <p><strong>Número de Cuenta:</strong> 55182818363</p>
        
        <div style="margin: 20px 0;">
          <a href="https://wa.me/573108249004?text=Hola,%20adjunto%20comprobante%20de%20pago%20para%20la%20reserva%20con%20código:%20${reservation.confirmationCode}" 
             style="background-color: #25D366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
            Enviar Comprobante por WhatsApp
          </a>
        </div>
        
        <p style="margin-top: 15px;"><strong>¿Tienes dudas o inquietudes?</strong></p>
        <a href="https://wa.me/573108249004?text=Hola,%20tengo%20una%20consulta%20sobre%20mi%20reserva%20con%20código:%20${reservation.confirmationCode}" 
           style="background-color: #1e40af; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">
          Contactar por WhatsApp
        </a>
        
        <p style="margin-top: 15px;"><strong>Importante:</strong></p>
        <ul>
          <li>Tienes <strong>24 horas</strong> para realizar el abono</li>
          <li>Incluye tu código de confirmación: <strong>${reservation.confirmationCode}</strong></li>
        </ul>
      </div>
      
      <p style="text-align: center; color: #6b7280;">
        <em>Conexión, Tranquilidad y Naturaleza</em><br>
        Villa al Cielo - Barbosa, Antioquia
      </p>
    </div>
  `;

  return await sendEmail({
    to: reservation.guestEmail,
    from: OWNER_EMAIL,
    subject: `Reserva Recibida - ${reservation.confirmationCode} - Villa al Cielo`,
    html
  });
}

export async function sendReservationNotificationToOwner(
  reservation: Reservation,
  cabin: Cabin
): Promise<boolean> {
  const checkInDate = new Date(reservation.checkIn).toLocaleDateString('es-CO');
  const checkOutDate = new Date(reservation.checkOut).toLocaleDateString('es-CO');
  const frozenUntil = reservation.frozenUntil ? new Date(reservation.frozenUntil).toLocaleString('es-CO') : 'N/A';
  const totalFormatted = reservation.totalPrice.toLocaleString('es-CO');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1e40af;">Nueva Reserva Pendiente</h1>
      
      <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px;">
        <h3>Detalles del Cliente</h3>
        <p><strong>Nombre:</strong> ${reservation.guestName}</p>
        <p><strong>Email:</strong> ${reservation.guestEmail}</p>
        <p><strong>Código:</strong> ${reservation.confirmationCode}</p>
      </div>
      
      <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Detalles de la Reserva</h3>
        <p><strong>Cabaña:</strong> ${cabin.name}</p>
        <p><strong>Entrada:</strong> ${checkInDate}</p>
        <p><strong>Salida:</strong> ${checkOutDate}</p>
        <p><strong>Huéspedes:</strong> ${reservation.guests}</p>
        <p><strong>Total:</strong> $${totalFormatted} COP</p>
        <p><strong>Incluye Asado:</strong> ${reservation.includesAsado ? 'Sí' : 'No'}</p>
        <p><strong>Congelada hasta:</strong> ${frozenUntil}</p>
      </div>
      
      <p style="color: #dc2626;"><strong>Esperando comprobante de pago del cliente.</strong></p>
    </div>
  `;

  return await sendEmail({
    to: OWNER_EMAIL,
    from: OWNER_EMAIL,
    subject: `Nueva Reserva Pendiente - ${reservation.confirmationCode}`,
    html
  });
}

export async function sendReservationConfirmedToGuest(
  reservation: Reservation,
  cabin: Cabin
): Promise<boolean> {
  const checkInDate = new Date(reservation.checkIn).toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const checkOutDate = new Date(reservation.checkOut).toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1e40af; text-align: center;">Villa al Cielo</h1>
      <h2 style="color: #059669;">¡Reserva Confirmada!</h2>
      
      <p>Hola <strong>${reservation.guestName}</strong>,</p>
      
      <p>¡Excelente noticia! Tu pago ha sido confirmado y tu reserva está <strong>confirmada</strong>.</p>
      
      <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #059669; margin-top: 0;">Tu Reserva Confirmada</h3>
        <p><strong>Código:</strong> ${reservation.confirmationCode}</p>
        <p><strong>Cabaña:</strong> ${cabin.name}</p>
        <p><strong>Entrada:</strong> ${checkInDate}</p>
        <p><strong>Salida:</strong> ${checkOutDate}</p>
        <p><strong>Huéspedes:</strong> ${reservation.guests}</p>
      </div>
      
      <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #1e40af; margin-top: 0;">Información del Lugar</h3>
        <p><strong>Dirección:</strong> Villa al Cielo, Barbosa, Antioquia</p>
        <p><strong>Ubicación:</strong> <a href="https://maps.google.com/?q=6.478320,-75.258720" style="color: #1e40af; text-decoration: none;">Ver en Google Maps</a></p>
        <p><strong>Check-in:</strong> 3:00 PM</p>
        <p><strong>Check-out:</strong> 12:00 PM</p>
        <p><strong>Contacto:</strong> +57 310 502 3711</p>
        <p><strong>Email:</strong> ${OWNER_EMAIL}</p>
        
        <p style="margin-top: 15px;"><strong>Qué incluye tu reserva:</strong></p>
        <ul>
          <li>Alojamiento en cabaña ${cabin.name}</li>
          <li>Desayuno</li>
          ${reservation.includesAsado ? '<li>Kit de Asado (2 bisteces, 2 chorizos, 2 arepas)</li>' : ''}
          <li>Acceso a todas las amenidades (jacuzzi, malla catamarán, etc.)</li>
          <li>Cocina interior completamente equipada</li>
          <li>Comedor exterior</li>
        </ul>
      </div>
      
      <p>¡Esperamos darte la bienvenida pronto a Villa al Cielo!</p>
      
      <p style="text-align: center; color: #6b7280;">
        <em>Conexión, Tranquilidad y Naturaleza</em><br>
        Villa al Cielo - Barbosa, Antioquia
      </p>
    </div>
  `;

  return await sendEmail({
    to: reservation.guestEmail,
    from: OWNER_EMAIL,
    subject: `¡Reserva Confirmada! - ${reservation.confirmationCode} - Villa al Cielo`,
    html
  });
}

export async function sendReservationExpiredToGuest(
  reservation: Reservation,
  cabin: Cabin
): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1e40af; text-align: center;">Villa al Cielo</h1>
      <h2 style="color: #dc2626;">Reserva Expirada</h2>
      
      <p>Hola <strong>${reservation.guestName}</strong>,</p>
      
      <p>Lamentamos informarte que tu reserva con código <strong>${reservation.confirmationCode}</strong> ha expirado por falta de pago dentro del período de 12 horas.</p>
      
      <p>Si aún estás interesado en hospedarte en Villa al Cielo, puedes realizar una nueva reserva en nuestro sitio web.</p>
      
      <p>¡Esperamos verte pronto!</p>
      
      <p style="text-align: center; color: #6b7280;">
        <em>Conexión, Tranquilidad y Naturaleza</em><br>
        Villa al Cielo - Barbosa, Antioquia
      </p>
    </div>
  `;

  return await sendEmail({
    to: reservation.guestEmail,
    from: OWNER_EMAIL,
    subject: `Reserva Expirada - ${reservation.confirmationCode} - Villa al Cielo`,
    html
  });
}