import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from '../components/Navbar';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

const renderNavbar = () => {
    return render(
        <BrowserRouter>
            <Navbar />
        </BrowserRouter>
    );
};

describe('Navbar Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    it('renders brand name correctly', () => {
        renderNavbar();
        expect(screen.getByText('iKeep')).toBeInTheDocument();
    });

    it('renders Home and About links', () => {
        renderNavbar();
        expect(screen.getByText('Home')).toBeInTheDocument();
        expect(screen.getByText('About')).toBeInTheDocument();
    });

    it('shows Login and Sign Up buttons when not authenticated', () => {
        renderNavbar();
        expect(screen.getByText('Login')).toBeInTheDocument();
        expect(screen.getByText('Sign Up')).toBeInTheDocument();
    });

    it('shows Log Out button when authenticated', () => {
        localStorage.setItem('token', 'test-token');
        renderNavbar();
        expect(screen.getByText('Log Out')).toBeInTheDocument();
        expect(screen.queryByText('Login')).not.toBeInTheDocument();
    });

    it('handles logout correctly', () => {
        localStorage.setItem('token', 'test-token');
        renderNavbar();

        fireEvent.click(screen.getByText('Log Out'));

        expect(localStorage.getItem('token')).toBeNull();
        expect(mockNavigate).toHaveBeenCalledWith('/welcome');
    });
});
