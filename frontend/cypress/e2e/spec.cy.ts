describe('Boutique User Flow', () => {
  it('logs in and opens chat successfully', () => {
    // Step 1: Visit homepage
    cy.visit('http://localhost:4200/');
    cy.contains('Boutique').should('exist');

    // Step 2: Navigate to login (if not automatically redirected)
    cy.url().should('include', '/login');

    // Step 3: Fill in login credentials
    cy.get('input[formControlName="email"]').type('testuser@example.com');
    cy.get('input[formControlName="password"]').type('123456');

    // Step 4: Submit login form
    cy.get('button[type="submit"]').click();

    // Step 5: Verify redirect to dashboard
    cy.url().should('include', '/user/dashboard');
    cy.contains('Dashboard').should('exist');

    // Step 6: Navigate to chat
    cy.get('a').contains('Chat').click();
    cy.url().should('include', '/user/dashboard/chat');

    // Step 7: Check that chat loads correctly
    cy.contains('Messages').should('exist');
    cy.contains('Start a conversation').should('exist');

    // Optional: open new conversation modal
    cy.get('button').contains('+').click();
    cy.contains('Start New Conversation').should('be.visible');
  });
});
