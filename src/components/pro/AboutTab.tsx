import { Company, Address } from "@/types";

function AboutTab({
  professional,
}: {
  professional: Company & { address?: Address };
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">À propos</h2>

      {professional.description ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <p className="text-gray-700 whitespace-pre-line">
            {professional.description}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6 text-center text-gray-500">
          Aucune description disponible
        </div>
      )}

      {/* Carte */}
      <div className="h-64 bg-gray-200 rounded-lg mb-6">
        <div className="w-full h-full flex items-center justify-center text-gray-400">
          Carte
        </div>
      </div>

      {/* Informations de contact */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Contact</h3>
        <div className="space-y-3">
          {professional.address && (
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-gray-500 mt-0.5 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <p className="text-gray-700">
                {professional.address.formatted_address}
              </p>
            </div>
          )}
          {professional.phone && (
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-gray-500 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              <a
                href={`tel:${professional.phone}`}
                className="text-gray-700 hover:text-gray-900"
              >
                {professional.phone}
              </a>
            </div>
          )}
          {professional.website && (
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-gray-500 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                />
              </svg>
              <a
                href={professional.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 hover:text-gray-900"
              >
                {professional.website}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default AboutTab;
