import type { Metadata } from "next";
import Link from "next/link";
import { Bullets, LegalPage, Strong } from "@/components/legal/LegalPage";
import { legal } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Términos y condiciones",
  description: "Condiciones de compra, envíos, pagos, derecho de retracto, reversión del pago, garantías y agendamiento de visitas en INNOVA Seguridad y Sistemas.",
  alternates: { canonical: "/terminos-y-condiciones" },
};

const mail = (
  <a href={`mailto:${legal.email}`} className="text-lime-400 hover:text-white">
    {legal.email}
  </a>
);

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Compras seguras"
      title="Términos y condiciones"
      intro="Estas son las reglas de juego para comprar en nuestra tienda y agendar servicios. Las escribimos claras para que sepas exactamente qué esperar y cuáles son tus derechos."
      sections={[
        {
          id: "vendedor",
          title: "Quién te vende",
          body: (
            <>
              <p>
                La tienda en línea y los servicios de <Strong>{legal.tradeName}</Strong> son ofrecidos por <Strong>{legal.owner}</Strong>, {legal.idLabel},{" "}
                {legal.personType.toLowerCase()}.
              </p>
              <Bullets
                items={[
                  <>Domicilio: {legal.registeredAddress}</>,
                  <>Punto de atención: {legal.storeAddress}</>,
                  <>Correo: {mail}</>,
                  <>Teléfonos / WhatsApp: {legal.phones.join(" · ")}</>,
                  <>Horario de atención: {legal.hours}</>,
                ]}
              />
              <p>
                Al hacer un pedido o agendar una cita aceptas estos términos y nuestra{" "}
                <Link href="/politica-de-privacidad" className="text-lime-400 hover:text-white">
                  política de tratamiento de datos
                </Link>
                . Se rigen por las leyes de Colombia, en especial la Ley 1480 de 2011 (Estatuto del Consumidor) y la Ley 527 de 1999 (comercio electrónico).
              </p>
            </>
          ),
        },
        {
          id: "productos",
          title: "Productos, precios y disponibilidad",
          body: (
            <Bullets
              items={[
                <>
                  Los precios están en <Strong>pesos colombianos (COP)</Strong> y son el valor final del producto: como no somos responsables de IVA, no se suma ningún impuesto
                  adicional. El valor del envío se muestra aparte antes de confirmar.
                </>,
                "Las fotos son de referencia: el color, el empaque o detalles menores pueden variar sin cambiar las características técnicas descritas.",
                "Los productos marcados como agotados no se pueden comprar. Si al confirmar tu pedido algo se agota, te avisamos y te ofrecemos un reemplazo o la devolución total de tu dinero.",
                "Si por un error evidente un precio se publica muy por debajo de su valor real, te contactaremos antes de despachar para que decidas si continúas o cancelas sin costo.",
                "La instalación no está incluida en el precio de los productos, salvo que la ficha lo diga. Puedes cotizarla con nosotros.",
              ]}
            />
          ),
        },
        {
          id: "compra",
          title: "Cómo funciona la compra",
          body: (
            <>
              <p>Antes de confirmar puedes revisar y corregir tu carrito, tus datos y el método de entrega. Al confirmar recibes un código de pedido (INN-…) para cualquier consulta.</p>
              <Bullets
                items={[
                  <>
                    <Strong>Pago en línea:</Strong> pagas con tarjeta, PSE, Nequi u otros medios en la página segura de Wompi (Bancolombia). El pedido queda confirmado cuando Wompi
                    aprueba el pago. Wompi te envía el comprobante.
                  </>,
                  <>
                    <Strong>Pedido por WhatsApp:</Strong> el pedido se registra y se abre WhatsApp con el detalle. Allí te confirmamos disponibilidad, el valor del envío si aplica y
                    el medio de pago (transferencia, Nequi o pago en tienda). El pedido se despacha cuando el pago esté confirmado.
                  </>,
                ]}
              />
            </>
          ),
        },
        {
          id: "envios",
          title: "Envíos y entregas",
          body: (
            <Bullets
              items={[
                <>
                  <Strong>Armenia:</Strong> entrega gratuita. Coordinamos contigo el día y la franja horaria por WhatsApp.
                </>,
                <>
                  <Strong>Recoger en tienda:</Strong> sin costo, en {legal.storeAddress}, en horario de atención, presentando tu código de pedido.
                </>,
                <>
                  <Strong>Resto del país:</Strong> el valor del envío se acuerda contigo antes del despacho y se hace con una transportadora. Te compartimos la guía de seguimiento.
                </>,
                "El plazo de entrega se te informa al confirmar el pedido. Si no se acordó un plazo, la entrega se hará en máximo 30 días calendario, como establece la ley. Si no cumplimos el plazo, puedes cancelar el pedido y te devolvemos el dinero.",
                "Al recibir, revisa el paquete. Si llega abierto o dañado, déjalo anotado en la guía y escríbenos de inmediato.",
              ]}
            />
          ),
        },
        {
          id: "retracto",
          title: "Derecho de retracto",
          body: (
            <>
              <p>
                Como compraste a distancia, puedes <Strong>arrepentirte de la compra dentro de los 5 días hábiles siguientes a la entrega</Strong> (artículo 47 de la Ley 1480 de 2011),
                sin dar explicaciones.
              </p>
              <Bullets
                items={[
                  <>Avísanos por {mail} o WhatsApp con tu código de pedido.</>,
                  "Devuelve el producto en las mismas condiciones en que lo recibiste: sin uso, completo y en su empaque original.",
                  "Los costos de transporte de la devolución corren por tu cuenta.",
                  "Te devolvemos el dinero en máximo 30 días calendario desde que ejerces el derecho, por el mismo medio de pago o el que acordemos.",
                  "No aplica a servicios que ya empezaron a prestarse con tu acuerdo (por ejemplo, una instalación realizada), a productos hechos o configurados a tu medida, ni a productos que por su naturaleza no se puedan devolver, según lo previsto en la ley.",
                ]}
              />
            </>
          ),
        },
        {
          id: "reversion",
          title: "Reversión del pago",
          body: (
            <>
              <p>
                Si pagaste en línea (tarjeta, PSE u otro medio electrónico) puedes pedir la <Strong>reversión del pago</Strong> (artículo 51 de la Ley 1480 de 2011 y Decreto 1074 de
                2015) cuando:
              </p>
              <Bullets
                items={[
                  "Fuiste víctima de fraude o la compra no fue hecha por ti.",
                  "La operación no fue solicitada.",
                  "No recibiste el producto.",
                  "El producto recibido no corresponde a lo que pediste o está defectuoso.",
                ]}
              />
              <p>
                Debes pedirla dentro de los <Strong>5 días hábiles siguientes</Strong> a la fecha en que conociste la situación, escribiéndonos a {mail} con tu código de pedido y el
                motivo, y avisar también a la entidad que emitió tu medio de pago (tu banco). Si recibiste el producto, debes devolverlo en el mismo estado.
              </p>
            </>
          ),
        },
        {
          id: "garantia",
          title: "Garantías",
          body: (
            <>
              <Bullets
                items={[
                  <>
                    <Strong>Equipos:</Strong> normalmente un (1) año, sujeto al plazo informado por el fabricante o proveedor y a la garantía legal.
                  </>,
                  <>
                    <Strong>Instalaciones:</Strong> tres (3) meses de garantía comercial sobre los trabajos de instalación, conexión, montaje y configuración realizados por nuestro
                    personal, contados desde la entrega del servicio.
                  </>,
                  "Ambas garantías son independientes y no limitan los derechos de garantía legal que te da la Ley 1480 de 2011.",
                  "No cubren, entre otros, daños por golpes, humedad, descargas o variaciones eléctricas externas, mal uso o intervención de terceros, cuando se demuestre técnicamente su relación con la falla.",
                ]}
              />
              <p>
                Consulta el detalle completo, las exclusiones y cómo solicitarla en nuestra{" "}
                <Link href="/politica-de-garantia" className="text-lime-400 hover:text-white">
                  política de garantía
                </Link>
                .
              </p>
            </>
          ),
        },
        {
          id: "agenda",
          title: "Agendamiento de visitas técnicas",
          body: (
            <Bullets
              items={[
                "En la agenda en línea eliges el servicio, el día y una franja de 2 horas entre los horarios disponibles. El horario queda apartado mientras confirmamos.",
                <>
                  <Strong>La cita queda confirmada cuando te respondemos por WhatsApp.</Strong> Si por alguna razón no podemos atenderla, te proponemos otro horario.
                </>,
                "La hora indica la franja de llegada del técnico. Por favor ten a alguien mayor de edad en el lugar durante la visita.",
                "Si necesitas cancelar o cambiar la cita, avísanos por WhatsApp con la mayor anticipación posible.",
                "Si la visita tiene costo, te lo informamos antes de confirmarla. Las cotizaciones de instalación se entregan por escrito.",
              ]}
            />
          ),
        },
        {
          id: "pqr",
          title: "Peticiones, quejas y reclamos",
          body: (
            <>
              <p>
                Puedes escribirnos a {mail}, por WhatsApp al {legal.whatsappLabel} o visitarnos en el punto de atención. Respondemos en máximo <Strong>15 días hábiles</Strong>.
              </p>
              <p>
                Si no quedas satisfecho, puedes acudir a la{" "}
                <a href={legal.sic.url} target="_blank" rel="noopener noreferrer" className="text-lime-400 hover:text-white">
                  {legal.sic.name}
                </a>
                , autoridad de protección al consumidor en Colombia.
              </p>
            </>
          ),
        },
        {
          id: "otros",
          title: "Otras condiciones",
          body: (
            <Bullets
              items={[
                "Los textos, diseños, logos y fotos de esta página son de INNOVA Seguridad y Sistemas o se usan con autorización; no pueden copiarse sin permiso. Las marcas de los productos pertenecen a sus fabricantes.",
                "Podemos actualizar estos términos. Los cambios aplican a los pedidos y citas hechos después de su publicación.",
                `Versión ${legal.version} · vigente desde el ${legal.updatedAt}.`,
              ]}
            />
          ),
        },
      ]}
    />
  );
}
