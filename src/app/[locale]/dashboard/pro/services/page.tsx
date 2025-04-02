"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus } from "lucide-react";

// Components
import ServiceCard from "@/components/professional/ServiceCard";
import ServiceForm from "@/components/professional/ServiceForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Redux
import {
  fetchServices,
  createServiceThunk,
  updateServiceThunk,
  deleteServiceThunk,
  selectServices,
  selectCompaniesLoading,
  selectCompaniesError,
} from "@/lib/redux/slices/companiesSlice";
import { selectUserProfile } from "@/lib/redux/slices/userSlice";
import { AppDispatch } from "@/lib/redux/store";
import { Service } from "@/types";

export default function ServicesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector(selectUserProfile);
  const services = useSelector(selectServices);
  const loading = useSelector(selectCompaniesLoading);
  const error = useSelector(selectCompaniesError);

  // UI state
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Fetch services on component mount
  useEffect(() => {
    console.log("User : ", user);
    if (user?.company_id) {
      dispatch(fetchServices(user.company_id));
    }
  }, [dispatch, user?.company_id]);

  // Handle service form submission
  const handleServiceSubmit = (
    formData: Omit<Service, "id" | "company_id">
  ) => {
    if (editingService) {
      dispatch(
        updateServiceThunk({
          id: editingService.id,
          service: { ...formData, company_id: user?.company_id || "" },
          companyId: user?.company_id || "",
        })
      );
    } else {
      dispatch(
        createServiceThunk({
          service: { ...formData, company_id: user?.company_id || "" },
          companyId: user?.company_id || "",
        })
      );
    }
    setShowServiceForm(false);
    setEditingService(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Services</h1>
          <p className="text-muted-foreground">
            Gérez vos services et leurs tarifs
          </p>
        </div>
        <Button onClick={() => setShowServiceForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un service
        </Button>
      </div>

      {/* Service Form Modal */}
      {showServiceForm && (
        <Card>
          <CardContent className="pt-6">
            <ServiceForm
              initialData={editingService}
              onSubmit={handleServiceSubmit}
              onCancel={() => {
                setShowServiceForm(false);
                setEditingService(null);
              }}
              isEditing={!!editingService}
            />
          </CardContent>
        </Card>
      )}

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((service: Service) => (
          <ServiceCard
            key={service.id}
            service={service}
            onEdit={(service) => {
              setEditingService(service);
              setShowServiceForm(true);
            }}
            onDelete={(serviceId) => {
              if (
                window.confirm(
                  "Êtes-vous sûr de vouloir supprimer ce service ?"
                )
              ) {
                dispatch(
                  deleteServiceThunk({
                    id: serviceId,
                    companyId: user?.company_id || "",
                  })
                );
              }
            }}
          />
        ))}
      </div>

      {/* Empty State */}
      {services.length === 0 && !loading && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <h3 className="text-lg font-medium text-foreground">
                Aucun service
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Commencez par ajouter votre premier service.
              </p>
              <Button className="mt-4" onClick={() => setShowServiceForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un service
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
