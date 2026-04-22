import { z } from "zod";

const addVehicleValidationSchema = z.object({
  body: z.object({
    preferredService: z.string().optional(),
    car_brand: z.string({ required_error: "Car brand is required" }),
    car_model: z.string({ required_error: "Car model is required" }),
    manufacturing_year: z.number({
      required_error: "Manufacturing year is required",
    }),
    license_plate_number: z.string({
      required_error: "License plate number is required",
    }),
    car_color: z.string({ required_error: "Car color is required" }),
    car_information_details: z.record(z.unknown(), {
      required_error: "Car information details is required",
    }),
  }),
});

export const VehicleValidation = {
  addVehicleValidationSchema,
};
