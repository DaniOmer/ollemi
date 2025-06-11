import { useRouter } from "next/navigation";

import AddReview from "../forms/AddReview";
import { ReviewFormValues } from "../forms/AddReview";
import { Company, Address, Review, User } from "@/types";
import { useAppDispatch, useAppSelector } from "@/lib/redux/store";
import { selectUserReview, setReview } from "@/lib/redux/slices/userSlice";

function ReviewsTab({
  professional,
  user,
}: {
  professional: Company & {
    address?: Address;
    reviews?: Review[];
    rating?: number;
  };
  user?: User;
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const review = useAppSelector(selectUserReview);

  const handleSubmit = (data: ReviewFormValues) => {
    if (!user) {
      dispatch(
        setReview({
          review: data.comment,
          rating: data.rating,
          company_id: professional.id,
        })
      );

      const query = {
        redirect: `/pro/${professional.id}`,
        tab: "reviews",
      };
      const params = new URLSearchParams(query);
      router.push(`/login?${params.toString()}`);
      return;
    }

    console.log(data);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Avis</h2>
        <div className="flex items-center mb-6">
          <div className="flex items-center">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className="w-6 h-6 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.363 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.363-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="ml-2 text-2xl font-bold text-gray-900">
              {professional.reviews?.length
                ? professional.rating?.toFixed(1)
                : "0"}
            </span>
            <span className="ml-1 text-gray-500">
              ({professional.reviews?.length})
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {professional.reviews && professional.reviews.length > 0 ? (
          professional.reviews.map((review: Review) => (
            <div key={review.id} className="border-b border-gray-200 pb-6">
              <div className="flex items-center mb-2">
                <div className="w-10 h-10 rounded-full bg-gray-200 mr-3 flex items-center justify-center text-gray-400">
                  <svg
                    className="w-6 h-6"
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
                <div>
                  <div className="font-medium text-gray-900">Client</div>
                  <div className="text-sm text-gray-500">
                    {new Date(review.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="flex mb-2">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-4 h-4 ${
                      i < review.rating ? "text-yellow-400" : "text-gray-300"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.363 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.363-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700">{review.review}</p>
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-gray-500">
            Aucun avis disponible. Soyez le premier à laisser un avis !
          </div>
        )}
        <AddReview
          isLoggedIn={!!user}
          handleSubmit={handleSubmit}
          data={review || { rating: 0, comment: "" }}
        />
      </div>
    </div>
  );
}
export default ReviewsTab;
