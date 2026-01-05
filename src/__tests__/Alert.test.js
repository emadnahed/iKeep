import React from 'react';
import { render, screen } from '@testing-library/react';
import Alert from '../components/Alert';

describe('Alert Component', () => {
    it('renders nothing when alert prop is null', () => {
        const { container } = render(<Alert alert={null} />);
        expect(container.querySelector('.alert')).toBeNull();
    });

    it('renders success alert correctly', () => {
        const alert = { type: 'success', msg: 'Operation successful!' };
        render(<Alert alert={alert} />);

        expect(screen.getByText('Success')).toBeInTheDocument();
        expect(screen.getByText(/Operation successful!/)).toBeInTheDocument();
        expect(screen.getByRole('alert')).toHaveClass('alert-success');
    });

    it('renders danger alert as Error', () => {
        const alert = { type: 'danger', msg: 'Something went wrong!' };
        render(<Alert alert={alert} />);

        expect(screen.getByText('Error')).toBeInTheDocument();
        expect(screen.getByText(/Something went wrong!/)).toBeInTheDocument();
        expect(screen.getByRole('alert')).toHaveClass('alert-danger');
    });

    it('renders warning alert correctly', () => {
        const alert = { type: 'warning', msg: 'Please be careful!' };
        render(<Alert alert={alert} />);

        expect(screen.getByText('Warning')).toBeInTheDocument();
        expect(screen.getByText(/Please be careful!/)).toBeInTheDocument();
    });
});
