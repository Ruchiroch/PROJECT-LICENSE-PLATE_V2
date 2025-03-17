'use client';
import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const showToast = (message, type = 'default') => {
  if (type === 'success') {
    toast.success(message, { icon: '✅' });
  } else if (type === 'error') {
    toast.error(message, { icon: '❌' });
  } else {
    toast(message);
  }
};

const Toast = () => (
  <ToastContainer
    position="top-right"
    autoClose={2000}
    hideProgressBar={false}
    newestOnTop={false}
    closeOnClick
    rtl={false}
    pauseOnFocusLoss
    draggable
    pauseOnHover
    theme="light"
  />
);

export default Toast;
