import { CheckCircle, Mail, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ReservationSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  guestEmail: string;
  confirmationCode: string;
}

export default function ReservationSuccessModal({
  isOpen,
  onClose,
  guestEmail,
  confirmationCode
}: ReservationSuccessModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <DialogTitle className="text-xl font-semibold text-green-800">
            ¡Reserva Congelada con Éxito!
          </DialogTitle>
          <DialogDescription className="text-center space-y-3 mt-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Mail className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-800">Correo Enviado</span>
              </div>
              <p className="text-sm text-blue-700 mb-2">
                Se envió un correo a:
              </p>
              <p className="font-mono text-sm bg-white px-3 py-2 rounded border text-blue-900">
                {guestEmail}
              </p>
            </div>

            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-amber-600" />
                <span className="font-medium text-amber-800">Tu Código de Reserva</span>
              </div>
              <p className="font-mono text-lg font-bold text-amber-900 bg-white px-3 py-2 rounded border">
                {confirmationCode}
              </p>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800 font-medium mb-2">
                ¿No ves el correo en tu bandeja principal?
              </p>
              <ul className="text-xs text-yellow-700 text-left space-y-1">
                <li>• Revisa tu carpeta de <strong>SPAM</strong></li>
                <li>• Busca en <strong>Correo no deseado</strong></li>
                <li>• Puede tardar unos minutos en llegar</li>
              </ul>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-green-800 font-medium mb-1">
                Siguiente Paso
              </p>
              <p className="text-xs text-green-700">
                Realiza el abono del 50% siguiendo las instrucciones del correo para confirmar tu reserva
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-center mt-6">
          <Button 
            onClick={onClose}
            className="bg-olive hover:bg-olive/90 px-8"
          >
            Entendido
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}