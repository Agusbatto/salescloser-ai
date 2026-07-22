import { BOOK_SECTIONS } from "@/config/sales-book";
import { Card } from "@/components/ui/Card";

export default function LibroPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Libro de ventas</h1>
        <p className="mt-1 text-sm text-gray-500">
          Técnicas de preguntas y metodologías de cierre — las mismas que usa la IA en el
          coach de venta, explicadas para estudiar y profesionalizarte.
        </p>
      </div>

      <Card>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Índice
        </h2>
        <nav className="space-y-1">
          {BOOK_SECTIONS.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="block rounded-md px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            >
              {section.title}
            </a>
          ))}
        </nav>
      </Card>

      {BOOK_SECTIONS.map((section) => (
        <Card key={section.id} id={section.id} className="scroll-mt-6">
          <h2 className="mb-3 text-base font-semibold text-gray-900">{section.title}</h2>
          <div className="space-y-3">
            {section.body.map((paragraph, i) => (
              <p key={i} className="whitespace-pre-line text-sm leading-relaxed text-gray-700">
                {paragraph}
              </p>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
