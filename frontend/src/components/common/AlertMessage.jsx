// frontend/src/components/common/AlertMessage.jsx
import React from 'react';
import { Alert } from 'react-bootstrap';

const AlertMessage = ({ variant = 'info', children }) => {
    return (
        <Alert variant={variant} className="mt-3">
            {children}
        </Alert>
    );
};

export default AlertMessage;