// frontend/src/components/common/LoadingSpinner.jsx
import React from 'react';
import { Spinner } from 'react-bootstrap';

const LoadingSpinner = ({ size = 'md', message = 'Cargando...' }) => {
    return (
        <div className="text-center my-5">
            <Spinner animation="border" role="status" size={size}>
                <span className="visually-hidden">{message}</span>
            </Spinner>
            <p className="mt-2">{message}</p>
        </div>
    );
};

export default LoadingSpinner;