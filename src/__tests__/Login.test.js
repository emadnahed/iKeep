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

        expect(screen.getByText('Login to continue to iKeep')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    });

    it('updates email and password inputs on change', () => {
        renderLogin();

        const emailInput = screen.getByPlaceholderText('Enter email');
        const passwordInput = screen.getByPlaceholderText('Password');

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

        fireEvent.change(screen.getByPlaceholderText('Enter email'), {
            target: { value: 'test@example.com', name: 'email' }
        });
        fireEvent.change(screen.getByPlaceholderText('Password'), {
            target: { value: 'password123', name: 'password' }
        });
        fireEvent.click(screen.getByRole('button', { name: /submit/i }));

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

        fireEvent.change(screen.getByPlaceholderText('Enter email'), {
            target: { value: 'wrong@example.com', name: 'email' }
        });
        fireEvent.change(screen.getByPlaceholderText('Password'), {
            target: { value: 'wrongpass', name: 'password' }
        });
        fireEvent.click(screen.getByRole('button', { name: /submit/i }));

        await waitFor(() => {
            expect(mockShowAlert).toHaveBeenCalledWith('Invalid credentials', 'danger');
            expect(mockNavigate).not.toHaveBeenCalled();
        });
    });
});
