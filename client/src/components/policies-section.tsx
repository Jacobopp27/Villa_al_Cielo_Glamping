import { Shield, Clock, Baby, PawPrint, DollarSign } from "lucide-react";

export default function PoliciesSection() {
  return (
    <section id="policies" className="py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-montserrat font-bold text-3xl text-[hsl(var(--nature-olive))] mb-4">
            Políticas y Condiciones de Reserva
          </h2>
          <p className="text-lg text-[hsl(var(--nature-text))] max-w-2xl mx-auto">
            Conoce nuestras políticas para garantizar una experiencia segura y placentera para todos
          </p>
        </div>
        
        <div className="space-y-8">
          {/* Política de menores de edad */}
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-[hsl(var(--nature-olive))] rounded-lg flex items-center justify-center flex-shrink-0">
                <Baby className="text-white w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-montserrat font-semibold text-xl text-[hsl(var(--nature-olive))] mb-3">
                  1. Ingreso de menores de edad
                </h3>
                <p className="text-[hsl(var(--nature-text))] leading-relaxed">
                  No se permite el ingreso de menores de edad que no estén acompañados por sus padres o tutores legales.
                </p>
              </div>
            </div>
          </div>

          {/* Política de mascotas */}
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-[hsl(var(--nature-olive))] rounded-lg flex items-center justify-center flex-shrink-0">
                <PawPrint className="text-white w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-montserrat font-semibold text-xl text-[hsl(var(--nature-olive))] mb-3">
                  2. Política de mascotas
                </h3>
                <p className="text-[hsl(var(--nature-text))] leading-relaxed">
                  No se permite el ingreso de mascotas. En caso de evidenciar la presencia de alguna mascota dentro de las cabañas, se aplicará una multa de $200.000 COP.
                </p>
              </div>
            </div>
          </div>

          {/* Responsabilidad por daños */}
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-[hsl(var(--nature-olive))] rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="text-white w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-montserrat font-semibold text-xl text-[hsl(var(--nature-olive))] mb-3">
                  3. Responsabilidad por daños
                </h3>
                <p className="text-[hsl(var(--nature-text))] leading-relaxed">
                  Cualquier daño causado por los huéspedes a las instalaciones, mobiliario o elementos de las cabañas será evaluado y cobrado al responsable según el valor de la reparación o reposición.
                </p>
              </div>
            </div>
          </div>

          {/* Política de cancelación */}
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-[hsl(var(--nature-olive))] rounded-lg flex items-center justify-center flex-shrink-0">
                <DollarSign className="text-white w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-montserrat font-semibold text-xl text-[hsl(var(--nature-olive))] mb-3">
                  4. Política de cancelación
                </h3>
                <p className="text-[hsl(var(--nature-text))] leading-relaxed">
                  Las cancelaciones deben realizarse con mínimo 5 días hábiles de anticipación a la fecha de la reserva. Cancelaciones fuera de este plazo no serán reembolsadas bajo ninguna circunstancia.
                </p>
              </div>
            </div>
          </div>

          {/* Horario de llegada */}
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-[hsl(var(--nature-olive))] rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="text-white w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-montserrat font-semibold text-xl text-[hsl(var(--nature-olive))] mb-3">
                  5. Horario de llegada
                </h3>
                <p className="text-[hsl(var(--nature-text))] leading-relaxed">
                  El horario máximo de check-in es a las 7:00 p.m. Si el huésped no ha llegado antes de esa hora, la reserva será cancelada automáticamente y no se realizará devolución del dinero.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-[hsl(var(--nature-text))]/70">
            Al realizar una reserva, aceptas automáticamente estas políticas y condiciones.
          </p>
        </div>
      </div>
    </section>
  );
}