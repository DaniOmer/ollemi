"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  fetchUserProfile,
  fetchUserPreferences,
  fetchUserFavorites,
  fetchUserPoints,
  fetchUserAppointmentHistory,
  selectUserProfile,
  selectUserPreferences,
  selectUserFavorites,
  selectUserPoints,
  selectUserAppointmentHistory,
  selectUserLoading,
  selectUserError,
  updateUserPreferences,
  updateUserProfile,
} from "@/lib/redux/slices/userSlice";
import { FavoriteProfessional } from "@/lib/services/user";
import {
  selectIsAuthenticated,
  selectUser,
} from "@/lib/redux/slices/authSlice";
import {
  fetchAppointments,
  selectPastAppointments,
  selectAppointmentsLoading,
} from "@/lib/redux/slices/appointmentsSlice";
import { AppDispatch } from "@/lib/redux/store";
import { Appointment } from "@/types";
import React, { ChangeEvent, FormEvent } from "react";

// Icons
import {
  UserIcon,
  Cog6ToothIcon,
  HeartIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

export default function UserDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  // Redux state
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const profile = useSelector(selectUserProfile);
  const preferences = useSelector(selectUserPreferences);
  const favorites = useSelector(selectUserFavorites);
  const appointmentHistory = useSelector(selectPastAppointments);
  const userLoading = useSelector(selectUserLoading);
  const appointmentsLoading = useSelector(selectAppointmentsLoading);
  const error = useSelector(selectUserError);
  const loading = userLoading || appointmentsLoading;

  // Local state
  const [activeTab, setActiveTab] = useState("profile");
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingPreferences, setEditingPreferences] = useState(false);
  const [profileForm, setProfileForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });
  const [preferencesForm, setPreferencesForm] = useState({
    notifications_enabled: false,
    theme: "system",
    language: "english",
  });

  useEffect(() => {
    // Fetch user data
    dispatch(fetchUserProfile());
    dispatch(fetchUserPreferences());
    dispatch(fetchUserFavorites());
    dispatch(fetchAppointments());
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    // Update local form state when profile data loads
    if (profile) {
      setProfileForm({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        email: profile.email || "",
        phone: profile.phone || "",
      });
    }
  }, [profile]);

  useEffect(() => {
    // Update local form state when preferences data loads
    if (preferences) {
      setPreferencesForm({
        notifications_enabled: preferences.notifications_enabled || false,
        theme: preferences.theme || "system",
        language: preferences.language || "english",
      });
    }
  }, [preferences]);

  // Form handlers
  const handleProfileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePreferencesChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setPreferencesForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const saveProfile = () => {
    dispatch(updateUserProfile(profileForm));
    setEditingProfile(false);
  };

  const savePreferences = () => {
    // Cast to appropriate type before dispatching
    const typedPreferences = {
      notifications_enabled: preferencesForm.notifications_enabled,
      theme: preferencesForm.theme as "light" | "dark" | "system",
      language: preferencesForm.language,
    };
    dispatch(updateUserPreferences(typedPreferences));
    setEditingPreferences(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto p-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="ml-4 text-lg font-medium text-gray-700">
              Loading your dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Navigation tabs
  const tabs = [
    { id: "profile", name: "Profile", icon: UserIcon },
    { id: "preferences", name: "Preferences", icon: Cog6ToothIcon },
    { id: "favorites", name: "Favorites", icon: HeartIcon },
    { id: "appointments", name: "Appointments", icon: CalendarIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <div className="sm:hidden">
            <select
              className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
            >
              {tabs.map((tab) => (
                <option key={tab.id} value={tab.id}>
                  {tab.name}
                </option>
              ))}
            </select>
          </div>
          <div className="hidden sm:block">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px" aria-label="Tabs">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm
                        ${
                          activeTab === tab.id
                            ? "border-blue-500 text-blue-600"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }
                      `}
                    >
                      <Icon className="w-5 h-5 mx-auto mb-1" />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
                <button
                  onClick={() => setEditingProfile(!editingProfile)}
                  className={`inline-flex items-center px-4 py-2 rounded-md shadow-sm text-sm font-medium
                    ${
                      editingProfile
                        ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                >
                  {editingProfile ? (
                    <>
                      <XCircleIcon className="h-5 w-5 mr-2" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <PencilIcon className="h-5 w-5 mr-2" />
                      Edit Profile
                    </>
                  )}
                </button>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                {!editingProfile ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        First Name
                      </p>
                      <p className="mt-1 text-lg text-gray-900">
                        {profile?.first_name || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Last Name
                      </p>
                      <p className="mt-1 text-lg text-gray-900">
                        {profile?.last_name || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Email Address
                      </p>
                      <p className="mt-1 text-lg text-gray-900">
                        {profile?.email || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Phone Number
                      </p>
                      <p className="mt-1 text-lg text-gray-900">
                        {profile?.phone || "-"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label
                          htmlFor="first_name"
                          className="block text-sm font-medium text-gray-700"
                        >
                          First Name
                        </label>
                        <input
                          type="text"
                          name="first_name"
                          id="first_name"
                          value={profileForm.first_name}
                          onChange={handleProfileChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="last_name"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Last Name
                        </label>
                        <input
                          type="text"
                          name="last_name"
                          id="last_name"
                          value={profileForm.last_name}
                          onChange={handleProfileChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          value={profileForm.email}
                          onChange={handleProfileChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="phone"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          id="phone"
                          value={profileForm.phone}
                          onChange={handleProfileChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={saveProfile}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <CheckIcon className="h-5 w-5 mr-2" />
                        Save Changes
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === "preferences" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  My Preferences
                </h2>
                <button
                  onClick={() => setEditingPreferences(!editingPreferences)}
                  className={`inline-flex items-center px-4 py-2 rounded-md shadow-sm text-sm font-medium
                    ${
                      editingPreferences
                        ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                >
                  {editingPreferences ? (
                    <>
                      <XCircleIcon className="h-5 w-5 mr-2" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <PencilIcon className="h-5 w-5 mr-2" />
                      {preferences ? "Edit Preferences" : "Create Preferences"}
                    </>
                  )}
                </button>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                {!editingPreferences ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Notifications
                      </p>
                      <p className="mt-1 flex items-center text-lg text-gray-900">
                        {preferences?.notifications_enabled ? (
                          <>
                            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                            Enabled
                          </>
                        ) : (
                          <>
                            <XCircleIcon className="h-5 w-5 text-red-500 mr-2" />
                            Disabled
                          </>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Theme</p>
                      <p className="mt-1 text-lg text-gray-900">
                        {preferences?.theme || "System"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Language
                      </p>
                      <p className="mt-1 text-lg text-gray-900">
                        {preferences?.language || "English"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="flex items-center">
                          <input
                            id="notifications_enabled"
                            name="notifications_enabled"
                            type="checkbox"
                            checked={preferencesForm.notifications_enabled}
                            onChange={handlePreferencesChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label
                            htmlFor="notifications_enabled"
                            className="ml-2 block text-sm text-gray-900"
                          >
                            Enable Notifications
                          </label>
                        </div>
                      </div>
                      <div>
                        <label
                          htmlFor="theme"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Theme
                        </label>
                        <select
                          id="theme"
                          name="theme"
                          value={preferencesForm.theme}
                          onChange={handlePreferencesChange}
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                        >
                          <option value="system">System</option>
                          <option value="light">Light</option>
                          <option value="dark">Dark</option>
                        </select>
                      </div>
                      <div>
                        <label
                          htmlFor="language"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Language
                        </label>
                        <select
                          id="language"
                          name="language"
                          value={preferencesForm.language}
                          onChange={handlePreferencesChange}
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                        >
                          <option value="english">English</option>
                          <option value="french">French</option>
                          <option value="spanish">Spanish</option>
                          <option value="german">German</option>
                          <option value="portuguese">Portuguese</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={savePreferences}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <CheckIcon className="h-5 w-5 mr-2" />
                        Save Preferences
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* Favorites Tab */}
          {activeTab === "favorites" && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                My Favorite Professionals
              </h2>

              {favorites && favorites.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favorites.map((favorite: FavoriteProfessional) => (
                    <div
                      key={favorite.id}
                      className="bg-gray-50 rounded-lg overflow-hidden shadow-sm transition-all hover:shadow-md"
                    >
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {favorite.name}
                          </h3>
                          <HeartIcon className="h-6 w-6 text-red-500" />
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                          {favorite.businessName}
                        </p>
                        <div className="flex justify-between">
                          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            View Profile
                          </button>
                          <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <HeartIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">
                    No favorites yet
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Start adding professionals to your favorites list.
                  </p>
                  <div className="mt-6">
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Browse Professionals
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Appointments Tab */}
          {activeTab === "appointments" && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                My Appointments
              </h2>

              {appointmentHistory && appointmentHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Date & Time
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Professional
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Service
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {appointmentHistory.map((appointment: Appointment) => (
                        <tr key={appointment.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {new Date(
                                appointment.start_time
                              ).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(
                                appointment.start_time
                              ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {appointment.client_name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              Service ID: {appointment.service_id}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                                ${
                                  appointment.status === "completed"
                                    ? "bg-green-100 text-green-800"
                                    : appointment.status === "cancelled"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-blue-100 text-blue-800"
                                }
                              `}
                            >
                              {appointment.status.charAt(0).toUpperCase() +
                                appointment.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button className="text-blue-600 hover:text-blue-900 mr-3">
                              Details
                            </button>
                            {appointment.status !== "completed" &&
                              appointment.status !== "cancelled" && (
                                <button className="text-red-600 hover:text-red-900">
                                  Cancel
                                </button>
                              )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">
                    No appointments found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    You don't have any past or upcoming appointments.
                  </p>
                  <div className="mt-6">
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Book an Appointment
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
