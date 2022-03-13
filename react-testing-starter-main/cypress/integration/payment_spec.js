
const { v4: uuidv4 } = require('uuid')

describe('payment', () => {
    it('user can make payment', () => {
        //login
        cy.visit('/'); //user will visit the root of the site
        cy.findByRole('textbox', {  name: /username/i}).type('johndoe')
        cy.findByLabelText(/password/i).type('s3cret')
        cy.findByRole('checkbox', {  name: /remember me/i}).check()
        cy.findByRole('button', {  name: /sign in/i}).click()

        //check account balance
        let oldBalance;
        cy.get('[data-test=sidenav-user-balance]').then($balance => oldBalance = $balance.text());

        //click on new button 
        cy.findByRole('button', {  name: /new/i}).click()

        //search for user
        cy.findByRole('textbox').type('devon becker')
        cy.findByText(/devon becker/i).click()

        //add amount and note and click pay
        const paymentAmount = "5.00"
        cy.findByPlaceholderText(/amount/i).type(paymentAmount)
        const note = uuidv4()
        cy.findByPlaceholderText(/add a note/i).type(note)
        cy.findByRole('button', {  name: /pay/i}).click()

        //click return to transactions button
        cy.findByText(/return to transactions/i).click()

        //go to personal payments by clicking on mine tab
          //need force:true bc if the element we are trying to click is being covered by another element. Will force cypress to click on element even though it's hidden
        cy.findByRole('tab', { name: /mine/i }).click();

        //click on a previous transaction/ payment
        cy.findByText(note).click({ force: true });

        //verify if payment was paid
        cy.findByText(`-$${paymentAmount}`).should('be.visible')
        cy.findByText(note).should('be.visible')

        //verify if correct payment amount was deducted
        cy.get('[data-test=sidenav-user-balance]').then($balance => {
            const convertedOldBalance = parseFloat(oldBalance.replace(/\$|,/g, "")) //replace $ and , .The g is global search, looking in whole string and returning the matches 
            const convertedNewBalance = parseFloat($balance.text().replace(/\$|,/g, ""))
            expect(convertedOldBalance - convertedNewBalance).to.equal(parseFloat(paymentAmount))
        });
    })
})