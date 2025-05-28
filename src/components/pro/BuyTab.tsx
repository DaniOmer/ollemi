import { Address, Company } from "@/types";
import { useTranslations } from "@/hooks/useTranslations";

function BuyTab({
  professional,
}: {
  professional: Company & { address?: Address };
}) {
  const { t } = useTranslations();
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Acheter</h2>

      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                Abonnements
              </h3>
              <p className="text-sm text-gray-500">
                Achetez une série de séances.
              </p>
            </div>
            <button className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800">
              Acheter
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                Cartes cadeaux
              </h3>
              <p className="text-sm text-gray-500">
                Faites-vous plaisir ou gâtez vos proches en leur offrant des
                prestations.
              </p>
            </div>
            <button className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800">
              Acheter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default BuyTab;
