import jwt from 'jsonwebtoken';

describe('Store Page', () => {
    before(() => {
        const defaultSettings = { orchestratorIp: '192.168.99.100', isOrchestratorOnline: true };
        cy.request('POST', '/test/reset', { defaultSettings });
        cy.request('POST', '/test/users', { users: [{ email: 'contact@ethibox.fr', password: 'myp@ssw0rd' }] });
    });

    it('Should display packages after connect', () => {
        cy.visit('/login');
        cy.get('input[name="email"]').type('contact@ethibox.fr');
        cy.get('input[name="password"]').type('myp@ssw0rd{enter}');
        cy.get('.item[href="/store"]').click({ force: true });
        cy.contains('.cards .card:last-child', 'Blog');
    });

    it('Should install an application', () => {
        const token = jwt.sign({ userId: 1 }, 'mysecret', { expiresIn: '1d' });
        cy.visit('/store', { onBeforeLoad: (win) => { win.localStorage.setItem('token', token); } });
        cy.get('.cards .card:first-child .buttons').click();
        cy.get('.cards .card:first-child input').type('myapp{enter}');
        cy.get('.cards .card:first-child .header').contains('myapp');
    });

    it('Should display an error if application has a bad name', () => {
        const token = jwt.sign({ userId: 1 }, 'mysecret', { expiresIn: '1d' });
        cy.visit('/store', { onBeforeLoad: (win) => { win.localStorage.setItem('token', token); } });
        cy.get('.cards .card:last-child .buttons').click();
        cy.get('.cards .card:last-child input').type('Bad.Name{enter}');
        cy.get('.cards .card:last-child').contains('Please enter a valid name');
    });

    it('Should display an error if duplicate name application', () => {
        const token = jwt.sign({ userId: 1 }, 'mysecret', { expiresIn: '1d' });
        cy.visit('/store', { onBeforeLoad: (win) => { win.localStorage.setItem('token', token); } });
        cy.get('.cards .card:last-child .buttons').click();
        cy.get('.cards .card:last-child input').type('myapp{enter}');
        cy.get('.cards .card:last-child').contains('Application\'s name already taken');
    });

    it.skip('Should display alert notification when an action stuck', () => {
        const token = jwt.sign({ userId: 1 }, 'mysecret', { expiresIn: '1d' });
        cy.visit('/store', { onBeforeLoad: (win) => { win.localStorage.setItem('token', token); } });
        cy.get('.cards .card:first-child .buttons').click();
        cy.get('.cards .card:first-child input').type('myapp{enter}');
        cy.get('.cards .card:first-child .header').contains('myapp');
        cy.wait(15000);
        cy.contains('.ui-alerts', 'Internal error!');
    });

    it('Should block action if orchestrator is offline', () => {
        cy.request('POST', '/test/settings', { settings: [
            { name: 'isOrchestratorOnline', value: false },
        ] });

        const token = jwt.sign({ userId: 1 }, 'mysecret', { expiresIn: '1d' });
        cy.visit('/store', { onBeforeLoad: (win) => { win.localStorage.setItem('token', token); } });
        cy.get('.cards .card:first-child .buttons').click();
        cy.get('.cards .card:first-child input').type('myapp2{enter}');
        cy.contains('.modal', 'Orchestrator connection failed!');
    });

    it('Should display empty store if no packages', () => {
        cy.request('POST', '/test/reset', { disableSynchronizeStore: true });
        cy.request('DELETE', '/test/packages');
        cy.request('POST', '/test/users', { users: [{ email: 'contact@ethibox.fr', password: 'myp@ssw0rd' }] });
        const token = jwt.sign({ userId: 1 }, 'mysecret', { expiresIn: '1d' });
        cy.visit('/store', { onBeforeLoad: (win) => { win.localStorage.setItem('token', token); } });
        cy.contains('.main', 'Store is empty');
    });
});
