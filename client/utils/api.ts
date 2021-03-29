import { ErrorDto } from "@common/dto/error.dto";
import axios, { AxiosInterceptorManager, AxiosResponse } from "axios";
import { getAuth } from "./useAuth";

export const api = axios.create({
  baseURL: "/api",
  validateStatus: () => true,
});

api.interceptors.request.use(function (config) {
  if (getAuth()) config.headers.common = {
    ...config.headers.common,
    "Authorization": `Bearer ${getAuth()?.access_token}`,
  }
  return config;
}, function (error) {
  console.error(error);
  return Promise.reject(error);
});