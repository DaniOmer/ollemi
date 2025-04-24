"use client";

import { useState, useEffect, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Company,
  Service,
  ServiceFormData,
  CompanyFormData,
  ServiceFormSchema,
} from "@/types";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/forms/ImageUpload";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, MapPin, Clock, DollarSign } from "lucide-react";
import Script from "next/script";

// Add type declaration for Google Maps
declare global {
  interface Window {
    google: {
      maps: {
        places: {
          Autocomplete: new (
            input: HTMLInputElement,
            options?: { types: string[] }
          ) => {
            addListener: (event: string, callback: () => void) => void;
            getPlace: () => {
              address_components?: {
                long_name: string;
                short_name: string;
                types: string[];
              }[];
              formatted_address?: string;
            };
          };
        };
      };
    };
  }
}

// Define the service schema for the form
const serviceSchema = z.object({
  name: z.string().min(2, "Service name must be at least 2 characters"),
  description: z.string().default(""),
  duration: z.number().min(5, "Duration must be at least 5 minutes"),
  price: z.number().min(0, "Price must be a positive number"),
  category: z.string().default("general"),
});

// Define the form schema with validation
const companyFormSchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters"),
  description: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  zipcode: z.string().optional(),
  phone: z.string().optional(),
  website: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  imageUrl: z.string().optional(),
  services: z.array(serviceSchema).optional(),
});

type CompanyFormValues = z.infer<typeof companyFormSchema>;

interface CompanyFormProps {
  initialData?: CompanyFormData;
  onSubmit: (data: CompanyFormValues) => void;
  onCancel?: () => void;
  isEditing?: boolean;
  initialServices?: Service[] | ServiceFormSchema[];
  onServiceSubmit?: (service: Omit<Service, "id">) => void;
}

export default function CompanyForm({
  initialData,
  onSubmit,
  onCancel,
  isEditing = false,
  initialServices = [],
  onServiceSubmit,
}: CompanyFormProps) {
  const [imageUrl, setImageUrl] = useState<string>(initialData?.imageUrl || "");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const [googleScriptLoaded, setGoogleScriptLoaded] = useState(false);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      address: initialData?.address || "",
      city: initialData?.city || "",
      zipcode: initialData?.zipcode || "",
      phone: initialData?.phone || "",
      website: initialData?.website || "",
      instagram: initialData?.instagram || "",
      facebook: initialData?.facebook || "",
      imageUrl: initialData?.imageUrl || "",
      services:
        initialServices.map((service) => {
          // Handle both Service and ServiceFormSchema types
          const name = "name" in service ? service.name : "";
          const description =
            "description" in service ? service.description ?? "" : "";
          const duration = "duration" in service ? service.duration : 60;
          const price = "price" in service ? service.price : 0;
          const category =
            "category" in service ? service.category ?? "general" : "general";

          return {
            name,
            description,
            duration,
            price,
            category,
          };
        }) || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "services",
  });

  // Initialize Google Maps Autocomplete when the script is loaded
  useEffect(() => {
    if (googleScriptLoaded && addressInputRef.current) {
      const autocomplete = new window.google.maps.places.Autocomplete(
        addressInputRef.current,
        { types: ["address"] }
      );

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place.address_components) {
          let streetNumber = "";
          let route = "";
          let city = "";
          let zipcode = "";

          for (const component of place.address_components) {
            const componentType = component.types[0];

            switch (componentType) {
              case "street_number":
                streetNumber = component.long_name;
                break;
              case "route":
                route = component.long_name;
                break;
              case "locality":
                city = component.long_name;
                form.setValue("city", city);
                break;
              case "postal_code":
                zipcode = component.long_name;
                form.setValue("zipcode", zipcode);
                break;
            }
          }

          // Set the full address
          if (place.formatted_address) {
            form.setValue("address", place.formatted_address);
          } else if (streetNumber && route) {
            form.setValue("address", `${streetNumber} ${route}`);
          }
        }
      });
    }
  }, [googleScriptLoaded, form]);

  // Update form values when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name || "",
        description: initialData.description || "",
        address: initialData.address || "",
        city: initialData.city || "",
        zipcode: initialData.zipcode || "",
        phone: initialData.phone || "",
        website: initialData.website || "",
        instagram: initialData.instagram || "",
        facebook: initialData.facebook || "",
        imageUrl: initialData.imageUrl || "",
        services:
          initialServices.map((service) => {
            // Handle both Service and ServiceFormSchema types
            const name = "name" in service ? service.name : "";
            const description =
              "description" in service ? service.description ?? "" : "";
            const duration = "duration" in service ? service.duration : 60;
            const price = "price" in service ? service.price : 0;
            const category =
              "category" in service ? service.category ?? "general" : "general";

            return {
              name,
              description,
              duration,
              price,
              category,
            };
          }) || [],
      });
      setImageUrl(initialData.imageUrl || "");
    }
  }, [initialData, initialServices, form]);

  const handleSubmit = (data: CompanyFormValues) => {
    // Include the image URL in the submission
    onSubmit({
      ...data,
      imageUrl,
    });
  };

  const handleImageUploadComplete = (url: string) => {
    setImageUrl(url);
    form.setValue("imageUrl", url);
    setUploadError(null);
  };

  const handleImageUploadError = (error: string) => {
    setUploadError(error);
  };

  const handleAddService = () => {
    append({
      name: "",
      description: "",
      duration: 60,
      price: 0,
      category: "general",
    });
  };

  return (
    <>
      {/* Load Google Maps JavaScript API */}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        onLoad={() => setGoogleScriptLoaded(true)}
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          {/* Company Logo/Image Upload */}
          <div className="flex justify-center mb-6">
            <ImageUpload
              bucket="company-images"
              path={`companies/${initialData?.id || "new"}`}
              onUploadComplete={handleImageUploadComplete}
              onUploadError={handleImageUploadError}
              currentImageUrl={imageUrl}
              className="mb-2"
            />
            {uploadError && (
              <p className="text-red-500 text-sm mt-1">{uploadError}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name*</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter company name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe your company and services"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="col-span-1 md:col-span-3">
                  <FormLabel>Address</FormLabel>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <FormControl>
                      <Input
                        placeholder="Enter street address"
                        className="pl-10"
                        {...field}
                        ref={addressInputRef}
                      />
                    </FormControl>
                  </div>
                  <FormDescription>
                    Start typing to see address suggestions
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter city" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="zipcode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zip Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter zip code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input placeholder="https://yourwebsite.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="instagram"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instagram</FormLabel>
                  <FormControl>
                    <Input placeholder="Instagram handle" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="facebook"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Facebook</FormLabel>
                  <FormControl>
                    <Input placeholder="Facebook page" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Services Section */}
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Services</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddService}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Service
              </Button>
            </div>

            {fields.length === 0 ? (
              <div className="bg-muted p-6 text-center rounded-lg">
                <p className="text-muted-foreground mb-2">
                  No services added yet
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddService}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Service
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <Card key={field.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`services.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Service Name*</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g. Haircut, Massage, etc."
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`services.${index}.duration`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Duration (min)</FormLabel>
                                <div className="relative">
                                  <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                  <FormControl>
                                    <Input
                                      type="number"
                                      className="pl-10"
                                      min={5}
                                      step={5}
                                      {...field}
                                      onChange={(e) =>
                                        field.onChange(parseInt(e.target.value))
                                      }
                                    />
                                  </FormControl>
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`services.${index}.price`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Price</FormLabel>
                                <div className="relative">
                                  <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                  <FormControl>
                                    <Input
                                      type="number"
                                      className="pl-10"
                                      min={0}
                                      step={0.01}
                                      {...field}
                                      onChange={(e) =>
                                        field.onChange(
                                          parseFloat(e.target.value)
                                        )
                                      }
                                    />
                                  </FormControl>
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <FormField
                        control={form.control}
                        name={`services.${index}.description`}
                        render={({ field }) => (
                          <FormItem className="mt-4">
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe this service"
                                className="min-h-[80px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end mt-4">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="w-24"
              >
                Cancel
              </Button>
            )}
            <Button type="submit" className="w-24">
              {isEditing ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
