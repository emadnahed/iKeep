/// <reference types="cypress" />

describe('Notes Management Flow', () => {
    const testUser = {
        name: 'Notes Test User',
        email: `notes-test-${Date.now()}@example.com`,
        password: 'password123',
    };

    before(() => {
        // Create and login a user before running notes tests
        cy.visit('/Signup');
        cy.get('input[name="name"]').type(testUser.name);
        cy.get('input[name="email"]').type(testUser.email);
        cy.get('input[name="password"]').type(testUser.password);
        cy.get('input[name="cpassword"]').type(testUser.password);
        cy.get('button[type="submit"]').click();
        cy.url().should('eq', Cypress.config().baseUrl + '/');
    });

    beforeEach(() => {
        // Login before each test
        cy.visit('/Login');
        cy.get('input[name="email"]').type(testUser.email);
        cy.get('input[name="password"]').type(testUser.password);
        cy.get('button[type="submit"]').click();
        cy.url().should('eq', Cypress.config().baseUrl + '/');
    });

    it('should display the notes section', () => {
        cy.contains('Your Notes').should('be.visible');
    });

    it('should add a new note', () => {
        // Fill in the add note form
        cy.get('input#title').type('E2E Test Note');
        cy.get('input#description').type('This is a test note created by Cypress E2E');
        cy.get('input#tag').type('e2e');
        cy.contains('button', 'Add Note').click();

        // Verify the note appears in the list
        cy.contains('E2E Test Note').should('be.visible');
    });

    it('should edit an existing note', () => {
        // First add a note
        cy.get('input#title').type('Note to Edit');
        cy.get('input#description').type('Original description');
        cy.get('input#tag').type('edit');
        cy.contains('button', 'Add Note').click();

        // Wait for note to appear
        cy.contains('Note to Edit').should('be.visible');

        // Click edit button on the note
        cy.get('.card').contains('Note to Edit').parent().parent()
            .find('[class*="edit"]').click();

        // Update in modal
        cy.get('.modal-body input#etitle').clear().type('Updated Note Title');
        cy.get('.modal-body input#edescription').clear().type('Updated description');
        cy.contains('button', 'Update Note').click();

        // Verify update
        cy.contains('Updated Note Title').should('be.visible');
    });

    it('should delete a note', () => {
        // First add a note to delete
        cy.get('input#title').type('Note to Delete');
        cy.get('input#description').type('This note will be deleted');
        cy.get('input#tag').type('delete');
        cy.contains('button', 'Add Note').click();

        // Wait for note to appear
        cy.contains('Note to Delete').should('be.visible');

        // Click delete button
        cy.get('.card').contains('Note to Delete').parent().parent()
            .find('[class*="delete"]').click();

        // Verify deletion (note should not be visible anymore)
        cy.contains('Note to Delete').should('not.exist');
    });
});
