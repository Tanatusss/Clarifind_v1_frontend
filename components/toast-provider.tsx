"use client";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export function ToastProvider() {
  return (
    <ToastContainer
      position="top-right"
      autoClose={3000}
      newestOnTop
      theme="colored"
      // กันโดนบังด้วย header fixed/overlay ต่าง ๆ
      style={{ zIndex: 999999 }}
    />
  );
}
