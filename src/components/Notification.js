import React from "react";
import { Alert } from "react-bootstrap";

const Notification = ({ show, message, variant = "success", onClose }) => {
  if (!show) return null;

  return (
    <Alert variant={variant} onClose={onClose} dismissible>
      {message}
    </Alert>
  );
};

export default Notification;
