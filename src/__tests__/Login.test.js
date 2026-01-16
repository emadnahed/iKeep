import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../components/Login';

// Mock fetch globally
global.fetch = jest.fn();

const mockShowAlert = jest.fn();
const mockNavigate = jest.fn();

// Mock useNavigate
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

const renderLogin = () => {
    return render(
        <BrowserRouter>
            <Login showAlert={mockShowAlert} />
        </BrowserRouter>
    );
};

describe('Login Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    it('renders login form correctly', () => {
        renderLogin();

        expect(screen.getByText('Welcome back')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('updates email and password inputs on change', () => {
        renderLogin();

        const emailInput = screen.getByPlaceholderText('Enter your email');
        const passwordInput = screen.getByPlaceholderText('Enter your password');

        fireEvent.change(emailInput, { target: { value: 'test@example.com', name: 'email' } });
        fireEvent.change(passwordInput, { target: { value: 'password123', name: 'password' } });

        expect(emailInput.value).toBe('test@example.com');
        expect(passwordInput.value).toBe('password123');
    });

    it('calls API and navigates on successful login', async () => {
        fetch.mockResolvedValueOnce({
            json: () => Promise.resolve({ success: true, authToken: 'test-token' }),
        });

        renderLogin();

        fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
            target: { value: 'test@example.com', name: 'email' }
        });
        fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
            target: { value: 'password123', name: 'password' }
        });
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith(
                'http://localhost:5000/api/auth/login',
                expect.objectContaining({
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                })
            );
        });

        await waitFor(() => {
            expect(localStorage.getItem('token')).toBe('test-token');
            expect(mockShowAlert).toHaveBeenCalledWith('Logged in successfully', 'success');
            expect(mockNavigate).toHaveBeenCalledWith('/');
        });
    });

    it('shows error alert on failed login', async () => {
        fetch.mockResolvedValueOnce({
            json: () => Promise.resolve({ success: false, error: 'Invalid credentials' }),
        });

        renderLogin();

        fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
            target: { value: 'wrong@example.com', name: 'email' }
        });
        fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
            target: { value: 'wrongpass', name: 'password' }
        });
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

        await waitFor(() => {
            expect(mockShowAlert).toHaveBeenCalledWith('Invalid credentials', 'danger');
            expect(mockNavigate).not.toHaveBeenCalled();
        });
    });

    it('disables submit button when fields are empty', () => {
        renderLogin();

        const submitButton = screen.getByRole('button', { name: /sign in/i });
        expect(submitButton).toBeDisabled();
    });

    it('enables submit button when fields are filled', () => {
        renderLogin();

        fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
            target: { value: 'test@example.com', name: 'email' }
        });
        fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
            target: { value: 'password123', name: 'password' }
        });

        const submitButton = screen.getByRole('button', { name: /sign in/i });
        expect(submitButton).not.toBeDisabled();
    });

    it('shows iKeep branding', () => {
        renderLogin();

        expect(screen.getByText('iKeep')).toBeInTheDocument();
    });

    it('has link to signup page', () => {
        renderLogin();

        const signupLink = screen.getByText('Create one');
        expect(signupLink).toBeInTheDocument();
        expect(signupLink.closest('a')).toHaveAttribute('href', '/Signup');
    });

    it('has link back to welcome page', () => {
        renderLogin();

        const backLink = screen.getByText('Back to home');
        expect(backLink).toBeInTheDocument();
    });

    it('handles network error gracefully', async () => {
        fetch.mockRejectedValueOnce(new Error('Network error'));

        renderLogin();

        fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
            target: { value: 'test@example.com', name: 'email' }
        });
        fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
            target: { value: 'password123', name: 'password' }
        });
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

        await waitFor(() => {
            expect(mockShowAlert).toHaveBeenCalledWith('Something went wrong', 'danger');
        });
    });
});
