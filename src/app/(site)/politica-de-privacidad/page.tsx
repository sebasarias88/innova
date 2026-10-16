import type { Metadata } from "next";
import { Bullets, LegalPage, Strong } from "@/components/legal/LegalPage";
import { legal } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Política de tratamiento de datos personales",
  description: "Cómo INNOVA Seguridad y Sistemas recolecta, usa y protege tus datos personales, y cómo ejercer tus derechos (Ley 1581 de 2012).",
  alternates: { canonical: "/politica-de-privacidad" },
};

const mail = (
  <a href={`mailto:${legal.email}`} className="text-lime-400 hover:text-white">
    {legal.email}
  </a>
);

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Habeas data"
      title="Política de tratamiento de datos personales"
      intro="Tus datos son tuyos. Aquí te contamos qué información recolectamos, para qué la usamos, con quién la compartimos y cómo puedes consultarla, corregirla o pedir que la borremos."
      sections={[
        {
          id: "responsable",
          title: "Responsable del tratamiento",
          body: (
            <>
              <p>
                El responsable del tratamiento de tus datos personales es <Strong>{legal.owner}</Strong>, {legal.personType.toLowerCase()}, identificado con{" "}
                {legal.idLabel}, quien opera el establecimiento de comercio <Strong>{legal.tradeName}</Strong>.
              </p>
              <Bullets
                items={[
                  <>Domicilio: {legal.registeredAddress}</>,
                  <>Punto de atención: {legal.storeAddress}</>,
                  <>Correo para datos personales: {mail}</>,
                  <>Teléfonos / WhatsApp: {legal.phones.join(" · ")}</>,
                ]}
              />
              <p>
                Esta política se expide en cumplimiento de la Ley Estatutaria 1581 de 2012, el Decreto 1377 de 2013 (compilado en el Decreto Único 1074 de 2015) y demás normas que
                las modifiquen o complementen.
              </p>
            </>
          ),
        },
        {
          id: "datos",
          title: "Datos que recolectamos",
          body: (
            <>
              <p>Solo pedimos los datos necesarios para atender tu solicitud:</p>
              <Bullets
                items={[
                  <>
                    <Strong>Identificación y contacto:</Strong> nombre, celular / WhatsApp, correo (opcional) y cédula o NIT (opcional, para la factura).
                  </>,
                  <>
                    <Strong>Ubicación:</Strong> ciudad y dirección de entrega o de la visita técnica.
                  </>,
                  <>
                    <Strong>Pedidos y citas:</Strong> productos, valores, método de pago, estado del pago, servicio, fecha y hora agendada y las notas que nos escribas.
                  </>,
                  <>
                    <Strong>Datos técnicos:</Strong> dirección IP y datos del navegador, usados solo por seguridad (por ejemplo, para evitar abusos y fraudes).
                  </>,
                ]}
              />
              <p>
                <Strong>No recibimos ni guardamos los datos de tu tarjeta o cuenta bancaria.</Strong> Los pagos en línea los procesa directamente Wompi (Bancolombia) en su propia página
                segura. Tampoco pedimos datos sensibles (salud, origen étnico, creencias, biometría, etc.) ni datos de menores de edad.
              </p>
            </>
          ),
        },
        {
          id: "finalidades",
          title: "Para qué usamos tus datos",
          body: (
            <Bullets
              items={[
                "Registrar, preparar, entregar y hacer seguimiento a tus pedidos.",
                "Agendar, confirmar, reprogramar y realizar las visitas técnicas e instalaciones.",
                "Comunicarnos contigo por WhatsApp, llamada o correo sobre tu pedido, cita, garantía o solicitud.",
                "Verificar pagos, prevenir fraudes y proteger la seguridad de la tienda.",
                "Emitir facturas y cumplir obligaciones legales, contables y tributarias.",
                "Atender peticiones, quejas, reclamos, garantías, retractos y reversiones de pago.",
                "Solo si nos autorizas por separado: enviarte promociones y novedades. Puedes pedir que no te escribamos más en cualquier momento.",
              ]}
            />
          ),
        },
        {
          id: "encargados",
          title: "Con quién compartimos tus datos",
          body: (
            <>
              <p>No vendemos ni alquilamos tus datos. Los compartimos únicamente con proveedores que nos ayudan a prestar el servicio, bajo deberes de confidencialidad y seguridad:</p>
              <Bullets
                items={[
                  <>
                    <Strong>Supabase</Strong>: base de datos donde se guardan los pedidos y las citas.
                  </>,
                  <>
                    <Strong>Vercel</Strong>: alojamiento de la página web.
                  </>,
                  <>
                    <Strong>Wompi (Bancolombia)</Strong>: procesamiento de pagos en línea.
                  </>,
                  <>
                    <Strong>WhatsApp (Meta)</Strong>: cuando decides enviarnos tu pedido o cita por ese medio.
                  </>,
                  <>Empresas de transporte, cuando el pedido se envía a otra ciudad (solo nombre, teléfono y dirección de entrega).</>,
                ]}
              />
              <p>
                Algunos de estos proveedores tienen servidores fuera de Colombia, por lo que puede haber una <Strong>transmisión internacional de datos</Strong> a países con niveles
                adecuados de protección. Al aceptar esta política autorizas esa transmisión, que se hace solo para las finalidades aquí descritas. También entregaremos datos a
                autoridades cuando una ley u orden judicial lo exija.
              </p>
            </>
          ),
        },
        {
          id: "derechos",
          title: "Tus derechos",
          body: (
            <>
              <p>Como titular de los datos tienes derecho a:</p>
              <Bullets
                items={[
                  "Conocer, actualizar y rectificar tus datos personales.",
                  "Pedir prueba de la autorización que nos diste.",
                  "Ser informado sobre el uso que le hemos dado a tus datos.",
                  "Revocar la autorización y/o pedir que borremos tus datos, cuando no exista un deber legal o contractual de conservarlos.",
                  "Presentar quejas ante la Superintendencia de Industria y Comercio (SIC) después de haber agotado el trámite con nosotros.",
                  "Acceder gratuitamente a tus datos.",
                ]}
              />
            </>
          ),
        },
        {
          id: "procedimiento",
          title: "Cómo hacer consultas y reclamos",
          body: (
            <>
              <p>
                Escríbenos a {mail} o por WhatsApp al {legal.whatsappLabel}, indicando tu nombre, número de documento, un medio de contacto y qué necesitas. Si actúas en nombre de otra
                persona, adjunta el documento que te autoriza.
              </p>
              <Bullets
                items={[
                  <>
                    <Strong>Consultas</Strong> (saber qué datos tenemos): respondemos en máximo <Strong>10 días hábiles</Strong>. Si no es posible, te avisamos el motivo y respondemos
                    dentro de los 5 días hábiles siguientes.
                  </>,
                  <>
                    <Strong>Reclamos</Strong> (corregir, actualizar, borrar o revocar): respondemos en máximo <Strong>15 días hábiles</Strong>. Si no es posible, te avisamos y
                    respondemos dentro de los 8 días hábiles siguientes. Si el reclamo está incompleto, te pediremos lo que falta dentro de los 5 días siguientes.
                  </>,
                ]}
              />
            </>
          ),
        },
        {
          id: "seguridad",
          title: "Seguridad y conservación",
          body: (
            <>
              <p>
                Protegemos tus datos con conexiones cifradas (HTTPS), acceso restringido al panel administrativo con verificación en dos pasos, permisos mínimos por usuario y registro
                de cambios. Ningún sistema es 100 % infalible, pero trabajamos para prevenir accesos no autorizados, pérdida o alteración de la información.
              </p>
              <p>
                Conservamos los datos mientras sean necesarios para las finalidades descritas y durante el tiempo que exijan las normas contables, tributarias y de protección al
                consumidor. Después los eliminamos o anonimizamos.
              </p>
            </>
          ),
        },
        {
          id: "cookies",
          title: "Cookies y almacenamiento del navegador",
          body: (
            <>
              <p>
                Esta página usa <Strong>solo cookies y almacenamiento técnico</Strong>, necesarios para que funcione. No usamos cookies de publicidad ni de analítica, y no rastreamos
                tu navegación en otros sitios.
              </p>
              <Bullets
                items={[
                  <>
                    <Strong>Carrito de compras</Strong> (almacenamiento local de tu navegador): guarda los productos que agregas. Puedes borrarlo vaciando el carrito.
                  </>,
                  <>
                    <Strong>Pedido en línea</Strong> (cookie <code className="font-mono text-sm text-white">innova_order</code>, 6 horas): permite mostrarte el resultado de tu pago al
                    volver de Wompi.
                  </>,
                  <>
                    <Strong>Sesión del panel administrativo</Strong>: solo para el personal de INNOVA que inicia sesión.
                  </>,
                ]}
              />
              <p>Si en el futuro usamos herramientas de analítica o publicidad, te pediremos tu consentimiento antes de activarlas.</p>
            </>
          ),
        },
        {
          id: "autorizacion",
          title: "Autorización y vigencia",
          body: (
            <>
              <p>
                Al marcar la casilla de aceptación en el carrito o en la agenda, nos das tu autorización previa, expresa e informada para tratar tus datos según esta política. Guardamos
                la fecha y la versión aceptada como prueba.
              </p>
              <p>
                Esta política rige desde el {legal.updatedAt} (versión {legal.version}). Si la cambiamos de forma importante, lo publicaremos en esta página antes de aplicarla. Tus datos
                permanecerán en nuestra base de datos mientras se cumplan las finalidades descritas.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
