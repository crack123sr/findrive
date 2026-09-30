import { apiClient } from "@/app/api-client.ts";
import { UpdateUserResponse } from "./userType.ts";

export const userApi = apiClient.injectEndpoints({
  endpoints: (builder) => ({
    updateUser: builder.mutation<UpdateUserResponse, FormData>({
      query: (formData) => ({
        url: "/user/update",
        method: "PUT",
        body: formData,
      }),
    }),
  }),
});

export const { useUpdateUserMutation } = userApi;
