import { Photo, Company, Address } from "@/types";

function PhotosTab({
  professional,
}: {
  professional: Company & { address?: Address; photos?: Photo[] };
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Photos</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {professional.photos && professional.photos.length > 0 ? (
          professional.photos.map((photo: Photo, index: number) => (
            <div
              key={photo.id || index}
              className="aspect-square bg-gray-200 rounded-lg overflow-hidden"
            >
              <img
                src={photo.url}
                alt={photo.alt || `${professional.name} - Photo ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-10 text-gray-500">
            Aucune photo disponible
          </div>
        )}
      </div>
    </div>
  );
}
export default PhotosTab;
