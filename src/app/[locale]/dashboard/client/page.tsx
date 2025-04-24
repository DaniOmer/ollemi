"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  fetchUserProfile,
  fetchUserFavorites,
  selectUserProfile,
  selectUserFavorites,
  selectUserLoading,
} from "@/lib/redux/slices/userSlice";
import { selectIsAuthenticated } from "@/lib/redux/slices/authSlice";

import {
  fetchBookingByUserIdThunk,
  selectBookingByUserId,
  selectBookingLoading,
} from "@/lib/redux/slices/bookingSlice";

import { AppDispatch } from "@/lib/redux/store";
import { Booking } from "@/types";

// Icons
import {
  UserIcon,
  Cog6ToothIcon,
  HeartIcon,
  CalendarIcon,
  ClockIcon,
  ArrowRightIcon,
  CalculatorIcon,
  FireIcon,
} from "@heroicons/react/24/outline";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function UserDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  // Redux state
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUserProfile);
  const profile = useSelector(selectUserProfile);
  const favorites = useSelector(selectUserFavorites);
  const bookingHistory = useSelector(selectBookingByUserId);
  const userLoading = useSelector(selectUserLoading);
  const bookingLoading = useSelector(selectBookingLoading);
  const loading = userLoading || bookingLoading;

  useEffect(() => {
    // Fetch user data
    if (!profile || !favorites || !bookingHistory) {
      dispatch(fetchUserProfile());
      dispatch(fetchUserFavorites());
      dispatch(fetchBookingByUserIdThunk(user?.id));
    }
  }, [dispatch, isAuthenticated]);

  // Get upcoming appointments (future dates)
  const upcomingAppointments = bookingHistory
    ?.filter(
      (booking: Booking) =>
        new Date(booking.start_time) > new Date() &&
        booking.status !== "cancelled"
    )
    .sort(
      (a: Booking, b: Booking) =>
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    )
    .slice(0, 3);

  // Get recent completed appointments
  const recentCompletedAppointments = bookingHistory
    ?.filter((booking: Booking) => booking.status === "completed")
    .sort(
      (a: Booking, b: Booking) =>
        new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
    )
    .slice(0, 3);

  // Statistics
  const totalAppointments = bookingHistory?.length || 0;
  const totalFavorites = favorites?.length || 0;
  const completedAppointments =
    bookingHistory?.filter((booking: Booking) => booking.status === "completed")
      .length || 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Navigation tabs
  const tabs = [
    { id: "profile", name: "Profile", icon: UserIcon },
    { id: "preferences", name: "Preferences", icon: Cog6ToothIcon },
    { id: "favorites", name: "Favorites", icon: HeartIcon },
    { id: "appointments", name: "Appointments", icon: CalendarIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-4 md:py-8 px-3 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="bg-white rounded-xl shadow-sm mb-4 md:mb-8 p-4 md:p-6">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            Welcome back, {profile?.first_name || "User"}!
          </h1>
          <p className="text-gray-600 mt-1 text-sm md:text-base">
            Here's what's happening with your account
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {/* Main Content - Left Column */}
          <div className="md:col-span-1 lg:col-span-2 space-y-4 md:space-y-8 order-2 lg:order-1">
            {/* Upcoming Appointments */}
            <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
              <div className="flex justify-between items-center mb-4 md:mb-6">
                <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2 text-blue-500" />
                  Upcoming Appointments
                </h2>
                <Link
                  href="/dashboard/client/bookings"
                  className="text-xs md:text-sm text-blue-600 hover:text-blue-800 flex items-center"
                >
                  View all <ArrowRightIcon className="h-4 w-4 ml-1" />
                </Link>
              </div>

              {upcomingAppointments && upcomingAppointments.length > 0 ? (
                <div className="space-y-3 md:space-y-4">
                  {upcomingAppointments.map((booking: Booking) => (
                    <div
                      key={booking.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center border border-gray-100 rounded-lg p-3 md:p-4 hover:bg-gray-50"
                    >
                      <div className="bg-blue-100 rounded-full p-3 mr-4 mb-2 sm:mb-0">
                        <ClockIcon className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                      </div>
                      <div className="flex-grow mb-2 sm:mb-0">
                        <p className="font-medium text-gray-900">
                          {booking.company?.name || "Appointment"}
                        </p>
                        <p className="text-xs md:text-sm text-gray-500">
                          {formatDate(booking.start_time)} at{" "}
                          {formatTime(booking.start_time)}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          router.push(`/dashboard/client/bookings`)
                        }
                        className="text-xs bg-blue-100 text-blue-800 py-1 px-3 rounded-full w-full sm:w-auto text-center"
                      >
                        Details
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 md:py-8 bg-gray-50 rounded-lg">
                  <CalendarIcon className="mx-auto h-8 w-8 md:h-10 md:w-10 text-gray-400" />
                  <h3 className="mt-2 text-sm md:text-base font-medium text-gray-900">
                    No upcoming appointments
                  </h3>
                  <p className="mt-1 text-xs md:text-sm text-gray-500">
                    Schedule your next appointment now
                  </p>
                  <div className="mt-4 md:mt-6">
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 border border-transparent rounded-md shadow-sm text-xs md:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                      onClick={() => router.push("/professionals")}
                    >
                      Book an Appointment
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
              <div className="flex justify-between items-center mb-4 md:mb-6">
                <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center">
                  <FireIcon className="h-5 w-5 mr-2 text-orange-500" />
                  Recent Activity
                </h2>
              </div>

              {recentCompletedAppointments &&
              recentCompletedAppointments.length > 0 ? (
                <div className="space-y-3 md:space-y-4">
                  {recentCompletedAppointments.map((booking: Booking) => (
                    <div
                      key={booking.id}
                      className="border-l-4 border-green-500 pl-3 md:pl-4 py-2"
                    >
                      <p className="font-medium text-gray-900 text-sm md:text-base">
                        Completed appointment with{" "}
                        {booking.company?.name || "Professional"}
                      </p>
                      <p className="text-xs md:text-sm text-gray-500">
                        {formatDate(booking.start_time)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 md:py-6 bg-gray-50 rounded-lg">
                  <p className="text-xs md:text-sm text-gray-500">
                    No recent activity to display
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-4 md:space-y-8 order-1 lg:order-2">
            {/* Profile Summary */}
            <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
              <div className="flex justify-between items-center mb-3 md:mb-4">
                <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center">
                  <UserIcon className="h-5 w-5 mr-2 text-purple-500" />
                  Profile Summary
                </h2>
                <Link
                  href="/dashboard/client/settings"
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Edit
                </Link>
              </div>
              <div className="space-y-2 md:space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Name</p>
                  <p className="font-medium text-sm md:text-base">
                    {profile?.first_name} {profile?.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-medium text-sm md:text-base overflow-hidden text-ellipsis">
                    {profile?.email}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="font-medium text-sm md:text-base">
                    {profile?.phone || "-"}
                  </p>
                </div>
                <Link
                  href="/dashboard/client/settings"
                  className="block mt-3 md:mt-4 text-center text-xs md:text-sm text-blue-600 hover:text-blue-800 py-1.5 md:py-2 border border-blue-200 rounded-lg hover:bg-blue-50"
                >
                  View Full Profile
                </Link>
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center mb-4 md:mb-6">
                <CalculatorIcon className="h-5 w-5 mr-2 text-green-500" />
                Your Statistics
              </h2>
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="bg-blue-50 p-3 md:p-4 rounded-lg text-center">
                  <p className="text-xl md:text-3xl font-bold text-blue-600">
                    {totalAppointments}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Total Appointments
                  </p>
                </div>
                <div className="bg-purple-50 p-3 md:p-4 rounded-lg text-center">
                  <p className="text-xl md:text-3xl font-bold text-purple-600">
                    {completedAppointments}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">Completed</p>
                </div>
                <div className="bg-pink-50 p-3 md:p-4 rounded-lg text-center">
                  <p className="text-xl md:text-3xl font-bold text-pink-600">
                    {totalFavorites}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">Favorite Pros</p>
                </div>
                <div className="bg-green-50 p-3 md:p-4 rounded-lg text-center">
                  <p className="text-xl md:text-3xl font-bold text-green-600">
                    {completedAppointments > 0 ? "★★★★☆" : "-"}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">Average Rating</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4">
                Quick Actions
              </h2>
              <div className="space-y-2 md:space-y-3">
                <button
                  onClick={() => router.push("/professionals")}
                  className="w-full text-left px-3 md:px-4 py-2 md:py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center text-xs md:text-sm"
                >
                  <CalendarIcon className="h-4 w-4 md:h-5 md:w-5 mr-2 md:mr-3" />
                  Book New Appointment
                </button>
                <button
                  onClick={() => router.push("/dashboard/client/bookings")}
                  className="w-full text-left px-3 md:px-4 py-2 md:py-3 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200 flex items-center text-xs md:text-sm"
                >
                  <ClockIcon className="h-4 w-4 md:h-5 md:w-5 mr-2 md:mr-3" />
                  Manage Appointments
                </button>
                <button
                  onClick={() => router.push("/dashboard/client/settings")}
                  className="w-full text-left px-3 md:px-4 py-2 md:py-3 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200 flex items-center text-xs md:text-sm"
                >
                  <Cog6ToothIcon className="h-4 w-4 md:h-5 md:w-5 mr-2 md:mr-3" />
                  Account Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
