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

(api.interceptors.response as AxiosInterceptorManager<AxiosResponse<ErrorDto>>).use(function (response) {
  if (response.status > 300) {
    const error = document.createElement("div");
    error.className = "ui error message";
    const content = document.createElement("p");
    content.innerText = response.data.message;
    error.appendChild(content);
    document.body.appendChild(error);
    setTimeout(() => error.remove(), 3000);
    throw response.data;
  }

  return response;
})