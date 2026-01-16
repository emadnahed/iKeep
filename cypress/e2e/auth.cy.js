/// <reference types="cypress" />

describe('Authentication Flow', () => {
    const testUser = {
        name: 'E2E Test User',
        email: `e2e-test-${Date.now()}@example.com`,
        password: 'password123',
    };

    beforeEach(() => {
        cy.clearLocalStorage();
    });

    it('should show login and signup buttons on homepage', () => {
        cy.visit('/');
        cy.contains('Login').should('be.visible');
        cy.contains('Sign up').should('be.visible');
    });

    it('should navigate to signup page', () => {
        cy.visit('/');
        cy.contains('Sign up').click();
        cy.url().should('include', '/Signup');
    });

    it('should create a new account', () => {
        cy.visit('/Signup');
        cy.get('input[name="name"]').type(testUser.name);
        cy.get('input[name="email"]').type(testUser.email);
        cy.get('input[name="password"]').type(testUser.password);
        cy.get('input[name="cpassword"]').type(testUser.password);
        cy.get('button[type="submit"]').click();

        // Should redirect to home after successful signup
        cy.url().should('eq', Cypress.config().baseUrl + '/');
        cy.contains('Log Out').should('be.visible');
    });

    it('should login with existing account', () => {
        // First create a user
        cy.visit('/Signup');
        const uniqueEmail = `login-test-${Date.now()}@example.com`;
        cy.get('input[name="name"]').type('Login Test User');
        cy.get('input[name="email"]').type(uniqueEmail);
        cy.get('input[name="password"]').type('password123');
        cy.get('input[name="cpassword"]').type('password123');
        cy.get('button[type="submit"]').click();
        cy.url().should('eq', Cypress.config().baseUrl + '/');

        // Logout
        cy.contains('Log Out').click();

        // Now login
        cy.visit('/Login');
        cy.get('input[name="email"]').type(uniqueEmail);
        cy.get('input[name="password"]').type('password123');
        cy.get('button[type="submit"]').click();

        cy.url().should('eq', Cypress.config().baseUrl + '/');
        cy.contains('Log Out').should('be.visible');
    });

    it('should show error for invalid login', () => {
        cy.visit('/Login');
        cy.get('input[name="email"]').type('nonexistent@example.com');
        cy.get('input[name="password"]').type('wrongpassword');
        cy.get('button[type="submit"]').click();

        // Should show error alert
        cy.contains('Error').should('be.visible');
    });
});
