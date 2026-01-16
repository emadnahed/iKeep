import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Signup from '../components/Signup';

// Mock fetch globally
global.fetch = jest.fn();

const mockShowAlert = jest.fn();
const mockNavigate = jest.fn();

// Mock useNavigate
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

const renderSignup = () => {
    return render(
        <BrowserRouter>
            <Signup showAlert={mockShowAlert} />
        </BrowserRouter>
    );
};

describe('Signup Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    it('renders signup form correctly', () => {
        renderSignup();

        expect(screen.getByText('Create your account')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Create a password')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Confirm your password')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });

    it('updates form inputs on change', () => {
        renderSignup();

        const nameInput = screen.getByPlaceholderText('Enter your name');
        const emailInput = screen.getByPlaceholderText('Enter your email');
        const passwordInput = screen.getByPlaceholderText('Create a password');
        const confirmPasswordInput = screen.getByPlaceholderText('Confirm your password');

        fireEvent.change(nameInput, { target: { value: 'John Doe', name: 'name' } });
        fireEvent.change(emailInput, { target: { value: 'john@example.com', name: 'email' } });
        fireEvent.change(passwordInput, { target: { value: 'password123', name: 'password' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'password123', name: 'cpassword' } });

        expect(nameInput.value).toBe('John Doe');
        expect(emailInput.value).toBe('john@example.com');
        expect(passwordInput.value).toBe('password123');
        expect(confirmPasswordInput.value).toBe('password123');
    });

    it('disables submit button when form is invalid', () => {
        renderSignup();

        const submitButton = screen.getByRole('button', { name: /create account/i });
        expect(submitButton).toBeDisabled();
    });

    it('enables submit button when form is valid', () => {
        renderSignup();

        fireEvent.change(screen.getByPlaceholderText('Enter your name'), {
            target: { value: 'John Doe', name: 'name' }
        });
        fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
            target: { value: 'john@example.com', name: 'email' }
        });
        fireEvent.change(screen.getByPlaceholderText('Create a password'), {
            target: { value: 'password1234', name: 'password' }
        });
        fireEvent.change(screen.getByPlaceholderText('Confirm your password'), {
            target: { value: 'password1234', name: 'cpassword' }
        });

        const submitButton = screen.getByRole('button', { name: /create account/i });
        expect(submitButton).not.toBeDisabled();
    });

    it('keeps button disabled when passwords do not match', () => {
        renderSignup();

        fireEvent.change(screen.getByPlaceholderText('Enter your name'), {
            target: { value: 'John Doe', name: 'name' }
        });
        fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
            target: { value: 'john@example.com', name: 'email' }
        });
        fireEvent.change(screen.getByPlaceholderText('Create a password'), {
            target: { value: 'password123', name: 'password' }
        });
        fireEvent.change(screen.getByPlaceholderText('Confirm your password'), {
            target: { value: 'differentpass', name: 'cpassword' }
        });

        const submitButton = screen.getByRole('button', { name: /create account/i });
        expect(submitButton).toBeDisabled();
    });

    it('calls API and navigates on successful signup', async () => {
        fetch.mockResolvedValueOnce({
            json: () => Promise.resolve({ authToken: 'test-token' }),
        });

        renderSignup();

        fireEvent.change(screen.getByPlaceholderText('Enter your name'), {
            target: { value: 'John Doe', name: 'name' }
        });
        fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
            target: { value: 'john@example.com', name: 'email' }
        });
        fireEvent.change(screen.getByPlaceholderText('Create a password'), {
            target: { value: 'password1234', name: 'password' }
        });
        fireEvent.change(screen.getByPlaceholderText('Confirm your password'), {
            target: { value: 'password1234', name: 'cpassword' }
        });

        fireEvent.click(screen.getByRole('button', { name: /create account/i }));

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith(
                'http://localhost:5000/api/auth/createuser',
                expect.objectContaining({
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                })
            );
        });

        await waitFor(() => {
            expect(localStorage.getItem('token')).toBe('test-token');
            expect(mockShowAlert).toHaveBeenCalledWith('Account created successfully!', 'success');
            expect(mockNavigate).toHaveBeenCalledWith('/');
        });
    });

    it('shows error alert on failed signup', async () => {
        fetch.mockResolvedValueOnce({
            json: () => Promise.resolve({ error: 'Email already exists' }),
        });

        renderSignup();

        fireEvent.change(screen.getByPlaceholderText('Enter your name'), {
            target: { value: 'John Doe', name: 'name' }
        });
        fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
            target: { value: 'existing@example.com', name: 'email' }
        });
        fireEvent.change(screen.getByPlaceholderText('Create a password'), {
            target: { value: 'password1234', name: 'password' }
        });
        fireEvent.change(screen.getByPlaceholderText('Confirm your password'), {
            target: { value: 'password1234', name: 'cpassword' }
        });

        fireEvent.click(screen.getByRole('button', { name: /create account/i }));

        await waitFor(() => {
            expect(mockShowAlert).toHaveBeenCalledWith('Email already exists', 'danger');
            expect(mockNavigate).not.toHaveBeenCalled();
        });
    });

    it('handles network error gracefully', async () => {
        fetch.mockRejectedValueOnce(new Error('Network error'));

        renderSignup();

        fireEvent.change(screen.getByPlaceholderText('Enter your name'), {
            target: { value: 'John Doe', name: 'name' }
        });
        fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
            target: { value: 'john@example.com', name: 'email' }
        });
        fireEvent.change(screen.getByPlaceholderText('Create a password'), {
            target: { value: 'password1234', name: 'password' }
        });
        fireEvent.change(screen.getByPlaceholderText('Confirm your password'), {
            target: { value: 'password1234', name: 'cpassword' }
        });

        fireEvent.click(screen.getByRole('button', { name: /create account/i }));

        await waitFor(() => {
            expect(mockShowAlert).toHaveBeenCalledWith('Something went wrong', 'danger');
        });
    });

    it('shows password strength indicator', () => {
        renderSignup();

        const passwordInput = screen.getByPlaceholderText('Create a password');

        // Type weak password
        fireEvent.change(passwordInput, { target: { value: 'abc', name: 'password' } });

        // Password strength bar should appear
        expect(document.querySelector('.password-strength')).toBeInTheDocument();
    });

    it('has link to login page', () => {
        renderSignup();

        const loginLink = screen.getByText('Sign in');
        expect(loginLink).toBeInTheDocument();
        expect(loginLink.closest('a')).toHaveAttribute('href', '/Login');
    });

    it('has link back to welcome page', () => {
        renderSignup();

        const backLink = screen.getByText('Back to home');
        expect(backLink).toBeInTheDocument();
    });
});
