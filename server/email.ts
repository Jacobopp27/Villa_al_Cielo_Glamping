import { MailService } from '@sendgrid/mail';
import { google } from 'googleapis';
import type { Reservation, Cabin } from '@shared/schema';

const sgMail = new MailService();

// Configurar SendGrid con la nueva API key
sgMail.setApiKey('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');

// Email del propietario - debes verificar este email en SendGrid
const OWNER_EMAIL = 'jacobopp.27@outlook.com';

// Configuración de Gmail API (temporalmente deshabilitada)
let gmail: any = null;

// Inicializar Gmail API solo si todas las credenciales están disponibles
if (process.env.GMAIL_CLIENT_ID && process.env.GMAIL_CLIENT_SECRET && 
    process.env.GMAIL_REFRESH_TOKEN && process.env.GMAIL_EMAIL) {
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      'https://developers.google.com/oauthplayground'
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GMAIL_REFRESH_TOKEN,
    });

    gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  } catch (error) {
    console.log('Gmail API configuration skipped due to:', error.message);
  }
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
  if (!email || typeof email !== 'string') {
    console.error('Invalid email provided to getDomain:', email);
    return '';
  }
  const parts = email.split('@');
  if (parts.length < 2) {
    console.error('Invalid email format:', email);
    return '';
  }
  return parts[1].toLowerCase();
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

    console.log(`Email sent with Gmail to ${params.to}`);
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

  const domain = getDomain(params.to);
  const isMicrosoft = domain.includes('outlook') || domain.includes('hotmail') || domain.includes('live') || domain.includes('msn');

  const emailConfig: any = {
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
      'Importance': 'Normal',
      // Headers específicos para Microsoft
      'X-MS-Exchange-Organization-SCL': '-1',
      'X-Spam-Status': 'No',
      'X-Spam-Score': '0.0',
      'Authentication-Results': 'spf=pass smtp.mailfrom=villaalcielo.com'
    },
    trackingSettings: {
      clickTracking: { enable: false },
      openTracking: { enable: false },
      subscriptionTracking: { enable: false },
      ganalytics: { enable: false }
    },
    mailSettings: {
      sandboxMode: { enable: false },
      bypassListManagement: { enable: false },
      footer: { enable: false },
      spamCheck: { enable: false }
    }
  };

  // Configuraciones adicionales para Microsoft
  if (isMicrosoft) {
    emailConfig.categories = ['transactional', 'reservation', 'villa-al-cielo'];
    emailConfig.customArgs = {
      'message_type': 'reservation',
      'domain_type': 'microsoft'
    };
  }

  const result = await sgMail.send(emailConfig);

  console.log(`Email sent with SendGrid to ${params.to}${isMicrosoft ? ' (Microsoft domain - enhanced configuration)' : ''}`);
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

  const domain = getDomain(reservation.guestEmail);
  const isMicrosoft = domain.includes('outlook') || domain.includes('hotmail') || domain.includes('live') || domain.includes('msn');
  
  // Contenido específico para Microsoft (más formal, sin palabras que activen spam)
  const html = isMicrosoft ? `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
      <div style="background-color: #6b705c; padding: 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Villa al Cielo</h1>
        <p style="color: #ffe8d6; margin: 5px 0 0 0;">Glamping Experience - Barbosa, Antioquia</p>
      </div>
      
      <div style="padding: 30px 20px;">
        <h2 style="color: #6b705c; margin-top: 0;">Confirmación de Solicitud de Reserva</h2>
        
        <p>Estimado/a <strong>${reservation.guestName}</strong>,</p>
        
        <p>Le confirmamos que hemos recibido su solicitud de alojamiento en nuestras instalaciones. La reserva se encuentra en proceso de confirmación durante las próximas 24 horas.</p>
        
        <div style="background-color: #f8f9fa; padding: 25px; border-left: 4px solid #6b705c; margin: 25px 0;">
          <h3 style="color: #6b705c; margin-top: 0;">Información de la Reserva</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #e9ecef;"><strong>Código de Referencia:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #e9ecef;">${reservation.confirmationCode}</td></tr>
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #e9ecef;"><strong>Cabaña:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #e9ecef;">${cabin.name}</td></tr>
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #e9ecef;"><strong>Fecha de Ingreso:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #e9ecef;">${checkInDate}</td></tr>
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #e9ecef;"><strong>Fecha de Salida:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #e9ecef;">${checkOutDate}</td></tr>
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #e9ecef;"><strong>Huéspedes:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #e9ecef;">${reservation.guests}</td></tr>
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #e9ecef;"><strong>Servicios Incluidos:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #e9ecef;">${asadoText}Desayuno</td></tr>
            <tr><td style="padding: 8px 0;"><strong>Valor Total:</strong></td><td style="padding: 8px 0; font-weight: bold; color: #6b705c;">$${totalFormatted} COP</td></tr>
          </table>
        </div>
        
        <div style="background-color: #fff3cd; padding: 25px; border-radius: 8px; margin: 25px 0;">
          <h3 style="color: #856404; margin-top: 0;">Instrucciones para Confirmación de Reserva</h3>
          <p><strong>Anticipo Requerido:</strong> $${Math.round(reservation.totalPrice * 0.5).toLocaleString('es-CO')} COP (50% del valor total)</p>
          <p><strong>Datos Bancarios:</strong></p>
          <ul style="list-style: none; padding: 0;">
            <li><strong>Beneficiario:</strong> Jacobo Posada</li>
            <li><strong>Entidad Bancaria:</strong> Bancolombia</li>
            <li><strong>Tipo de Cuenta:</strong> Ahorros</li>
            <li><strong>Número de Cuenta:</strong> 55182818363</li>
          </ul>
          
          <p style="margin-top: 20px;"><strong>Para confirmar su reserva:</strong></p>
          <p>Envíe el comprobante de pago a través de WhatsApp al número <strong>+57 310 824 9004</strong> indicando el código de referencia <strong>${reservation.confirmationCode}</strong>.</p>
          
          <div style="margin: 20px 0; text-align: center;">
            <a href="https://wa.me/573108249004?text=Buenos%20días,%20adjunto%20comprobante%20de%20pago%20para%20la%20reserva%20código:%20${reservation.confirmationCode}" 
               style="background-color: #6b705c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Enviar Comprobante de Pago
            </a>
          </div>
        </div>
        
        <div style="background-color: #d1ecf1; padding: 20px; border-radius: 8px; margin: 25px 0;">
          <h4 style="color: #0c5460; margin-top: 0;">Información Importante</h4>
          <ul>
            <li>Tiempo límite para confirmación: <strong>24 horas</strong> a partir de la recepción de este mensaje</li>
            <li>La reserva se mantendrá disponible únicamente durante este período</li>
            <li>Para consultas adicionales, contactar al +57 310 824 9004</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef;">
          <p style="color: #6c757d; font-size: 14px; margin: 0;">
            <strong>Villa al Cielo</strong><br>
            Experiencia de Glamping - Barbosa, Antioquia<br>
            <em>Conexión, Tranquilidad y Naturaleza</em>
          </p>
        </div>
      </div>
    </div>` : `
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
    </div>`;

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

  const asadoText = reservation.includesAsado ? "Sí" : "No";
  const totalFormatted = reservation.totalPrice.toLocaleString('es-CO');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1e40af; text-align: center;">Villa al Cielo - Admin</h1>
      <h2 style="color: #dc2626;">Nueva Reserva Pendiente</h2>
      
      <p>Se ha recibido una nueva reserva que requiere confirmación:</p>
      
      <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
        <h3 style="color: #dc2626; margin-top: 0;">Detalles de la Reserva</h3>
        <p><strong>Código:</strong> ${reservation.confirmationCode}</p>
        <p><strong>Huésped:</strong> ${reservation.guestName}</p>
        <p><strong>Email:</strong> ${reservation.guestEmail}</p>
        <p><strong>Cabaña:</strong> ${cabin.name}</p>
        <p><strong>Entrada:</strong> ${checkInDate}</p>
        <p><strong>Salida:</strong> ${checkOutDate}</p>
        <p><strong>Huéspedes:</strong> ${reservation.guests}</p>
        <p><strong>Incluye Asado:</strong> ${asadoText}</p>
        <p><strong>Total:</strong> $${totalFormatted} COP</p>
        <p><strong>Abono Esperado:</strong> $${Math.round(reservation.totalPrice * 0.5).toLocaleString('es-CO')} COP</p>
      </div>
      
      <div style="margin: 30px 0; text-align: center;">
        <a href="https://villa-al-cielo.replit.app/admin" 
           style="background-color: #1e40af; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
          Ir al Panel de Administración
        </a>
      </div>
      
      <p style="font-size: 14px; color: #6b7280;">
        El huésped tiene 24 horas para realizar el abono del 50%. 
        Después de este tiempo, la reserva expirará automáticamente.
      </p>
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

  const asadoText = reservation.includesAsado ? "Kit de Asado y " : "";
  const totalFormatted = reservation.totalPrice.toLocaleString('es-CO');
  const remainingAmount = Math.round(reservation.totalPrice * 0.5);

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1e40af; text-align: center;">Villa al Cielo</h1>
      <h2 style="color: #059669;">¡Reserva Confirmada!</h2>
      
      <p>Hola <strong>${reservation.guestName}</strong>,</p>
      
      <p>¡Excelente! Tu reserva ha sido <strong>confirmada</strong>. Estamos emocionados de recibirte en Villa al Cielo.</p>
      
      <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
        <h3 style="color: #059669; margin-top: 0;">Detalles de tu Reserva Confirmada</h3>
        <p><strong>Código de Confirmación:</strong> ${reservation.confirmationCode}</p>
        <p><strong>Cabaña:</strong> ${cabin.name}</p>
        <p><strong>Entrada:</strong> ${checkInDate}</p>
        <p><strong>Salida:</strong> ${checkOutDate}</p>
        <p><strong>Huéspedes:</strong> ${reservation.guests}</p>
        <p><strong>Incluye:</strong> ${asadoText}Desayuno</p>
        <p><strong>Total:</strong> $${totalFormatted} COP</p>
        <p><strong>Saldo Pendiente:</strong> $${remainingAmount.toLocaleString('es-CO')} COP (se paga al momento del check-in)</p>
      </div>
      
      <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #92400e; margin-top: 0;">Información Importante</h3>
        <ul>
          <li><strong>Check-in:</strong> A partir de las 3:00 PM</li>
          <li><strong>Check-out:</strong> Hasta las 12:00 PM</li>
          <li><strong>Ubicación:</strong> Barbosa, Antioquia</li>
          <li><strong>Contacto:</strong> +57 310 824 9004</li>
        </ul>
      </div>
      
      <div style="margin: 30px 0; text-align: center;">
        <a href="https://wa.me/573108249004?text=Hola,%20tengo%20una%20consulta%20sobre%20mi%20reserva%20confirmada%20${reservation.confirmationCode}" 
           style="background-color: #25D366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
          Contactar por WhatsApp
        </a>
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
      
      <p>Lamentamos informarte que tu reserva con código <strong>${reservation.confirmationCode}</strong> ha expirado debido a que no se recibió el abono dentro del tiempo límite de 24 horas.</p>
      
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