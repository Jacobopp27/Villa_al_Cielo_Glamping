import { MailService } from '@sendgrid/mail';
import type { Reservation, Cabin } from '@shared/schema';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

const mailService = new MailService();
mailService.setApiKey(process.env.SENDGRID_API_KEY);

const OWNER_EMAIL = "villaalcielo@example.com"; // Cambiar por el email real del propietario

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    await mailService.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
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
      
      <p>Hemos recibido tu solicitud de reserva. Tu reserva está <strong>congelada por 12 horas</strong> mientras realizas el pago.</p>
      
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
        <h3 style="color: #92400e; margin-top: 0;">Instrucciones de Pago</h3>
        <p><strong>Banco:</strong> Bancolombia</p>
        <p><strong>Tipo de Cuenta:</strong> Ahorros</p>
        <p><strong>Número de Cuenta:</strong> 12345678901</p>
        <p><strong>Titular:</strong> Villa al Cielo</p>
        <p><strong>Monto:</strong> $${totalFormatted} COP</p>
        
        <p style="margin-top: 15px;"><strong>Importante:</strong></p>
        <ul>
          <li>Tienes <strong>12 horas</strong> para realizar el pago</li>
          <li>Envía el comprobante de pago a: <strong>${OWNER_EMAIL}</strong></li>
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
        <p><strong>Check-in:</strong> 3:00 PM</p>
        <p><strong>Check-out:</strong> 12:00 PM</p>
        <p><strong>Contacto:</strong> ${OWNER_EMAIL}</p>
        
        <p style="margin-top: 15px;"><strong>Qué incluye tu reserva:</strong></p>
        <ul>
          <li>Alojamiento en cabaña ${cabin.name}</li>
          <li>Desayuno</li>
          ${reservation.includesAsado ? '<li>Kit de Asado (2 bisteces, 2 chorizos, 2 arepas)</li>' : ''}
          <li>Acceso a áreas comunes</li>
          <li>WiFi gratuito</li>
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