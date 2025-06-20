import sgMail from '@sendgrid/mail';

// Configurar SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

async function sendToOutlook() {
  const testEmail = 'jacobopp.27@outlook.com';
  
  console.log('📧 Enviando correo de prueba a:', testEmail);
  
  const emailData = {
    to: testEmail,
    from: {
      email: 'admin@villaalcielo.com',
      name: 'Villa al Cielo'
    },
    subject: '🏕️ Villa al Cielo - Prueba de Correo Sistema',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h1 style="color: #6b705c; text-align: center; margin-bottom: 30px;">
            🏕️ Villa al Cielo
          </h1>
          
          <h2 style="color: #2d5a27; border-bottom: 2px solid #6b705c; padding-bottom: 10px;">
            Prueba del Sistema de Correos
          </h2>
          
          <div style="background-color: #e8f2f7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6b705c;">
            <h3 style="color: #1e40af; margin-top: 0;">Detalles de la Prueba</h3>
            <p><strong>Fecha/Hora:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Servicio:</strong> SendGrid</p>
            <p><strong>Destinatario:</strong> ${testEmail}</p>
            <p><strong>Remitente:</strong> admin@villaalcielo.com</p>
          </div>
          
          <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
            <h3 style="color: #059669; margin-top: 0;">¿Recibiste este correo?</h3>
            <p>Si estás leyendo este mensaje, significa que:</p>
            <ul>
              <li>✅ El sistema de correos está funcionando</li>
              <li>✅ SendGrid está entregando correctamente</li>
              <li>✅ Tu cuenta de Outlook está recibiendo nuestros correos</li>
            </ul>
            
            <p><strong>¡Importante!</strong> Si este correo llegó a tu carpeta de SPAM:</p>
            <ol>
              <li>Márcalo como "No es spam"</li>
              <li>Agrega admin@villaalcielo.com a tus contactos</li>
              <li>Esto mejorará la entrega futura</li>
            </ol>
          </div>
          
          <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h3 style="color: #856404; margin-top: 0;">Información de Contacto</h3>
            <p><strong>Villa al Cielo</strong></p>
            <p>📧 Email: admin@villaalcielo.com</p>
            <p>📱 WhatsApp: +57 310 502 3711</p>
            <p>📍 Barbosa, Antioquia, Colombia</p>
          </div>
          
          <p style="text-align: center; color: #666; margin-top: 30px; font-style: italic;">
            Conexión, Tranquilidad y Naturaleza
          </p>
        </div>
      </div>
    `,
    replyTo: 'admin@villaalcielo.com',
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
  };

  try {
    const result = await sgMail.send(emailData);
    console.log('✅ Correo enviado exitosamente');
    console.log('📋 Message ID:', result[0].headers['x-message-id']);
    console.log('📋 Status Code:', result[0].statusCode);
    console.log('📋 Response Body:', result[0].body);
    
    console.log('\n📬 INSTRUCCIONES PARA EL DESTINATARIO:');
    console.log('1. Revisa tu bandeja de entrada en jacobopp.27@outlook.com');
    console.log('2. Si no aparece inmediatamente, revisa la carpeta de CORREO NO DESEADO');
    console.log('3. La entrega puede tomar entre 1-5 minutos');
    console.log('4. Si está en spam, márcalo como "No es spam"');
    
    return true;
  } catch (error) {
    console.error('❌ Error al enviar correo:', error.message);
    if (error.response) {
      console.error('📋 Detalles del error:', error.response.body);
    }
    return false;
  }
}

sendToOutlook().catch(console.error);