// Cypress commands file
// You can create custom commands here

Cypress.Commands.add('login', (email, password) => {
    cy.visit('/Login');
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get('button[type="submit"]').click();
});
