import { Company, Address, TeamMember } from "@/types";

function TeamTabs({
  professional,
}: {
  professional: Company & { address?: Address; team?: TeamMember[] };
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Équipe</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {professional.team && professional.team.length > 0 ? (
          professional.team.map((member: TeamMember) => (
            <div key={member.id} className="text-center">
              <div className="w-24 h-24 mx-auto mb-3 rounded-full overflow-hidden bg-gray-200">
                {member.image_url ? (
                  <img
                    src={member.image_url}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg
                      className="w-12 h-12"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
              <h3 className="font-medium text-gray-900">{member.name}</h3>
              <div className="flex justify-center mt-1">
                <div className="flex items-center">
                  <span className="text-lg font-semibold mr-1">5.0</span>
                  <svg
                    className="w-4 h-4 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.363 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.363-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-10 text-gray-500">
            Aucun membre d'équipe disponible
          </div>
        )}
      </div>
    </div>
  );
}
export default TeamTabs;
