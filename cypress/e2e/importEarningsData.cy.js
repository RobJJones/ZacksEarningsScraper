import dayjs from 'dayjs'

afterEach(function() {
  if (this.currentTest.state === 'failed') {
    Cypress.runner.stop()
  }
});

describe('template spec', () => {

    const siteURL = 'https://www.zacks.com/earnings/earnings-calendar?icid=earnings-earnings-nav_tracking-zcom-main_menu_wrapper-earnings_calendar'
    const header = '"Symbol","Company","Market Cap(M)","Time","Estimate","Reported","Surprise","%Surp","%Price Change**","%Rev Surprise","Date"'

    function loadData(directory, isEarnings) {

        cy.visit(siteURL)

        cy.get('#date_select', { timeout: 10000 }).click();
        cy.get('#prevCal', { timeout: 10000 }).click();

        for (var monthCount=1; monthCount<=3; monthCount++) {

            cy.get('#minical_place_holder').then(($calendar) => {

                for (var dayOfMonth=1; dayOfMonth<=31; dayOfMonth++) {

                    if ($calendar.find('[id="dt_'+dayOfMonth+'"]').length>0) {

                        cy.get('#dt_'+dayOfMonth, { timeout: 10000 }).click();
                        cy.wait(2000)

                        if (!isEarnings)  cy.get('#tab9', { timeout: 10000 }).scrollIntoView().click();

                        cy.get('.buttons-csv', { timeout: 10000 }).click();

                        cy.wait(3000)

                        cy.get('#tabHeader').then($value => {
                            const date = $value.text().replace(' Earnings Announcements','')
                                .replace(' Sales', '')
                                .replace(',','')

                            cy.log('Processing '+date)

                            cy.readFile('cypress/downloads/Earnings\ Calendar\ -\ Zacks\ Investment\ Research.csv')
                                .should('exist')
                                .then($fileContents => {

                                    cy.wait(2000)

                                    var headerRemoved = false
                                    var lines = $fileContents.split("\n")
                                    var newContents = '';

                                    //Assert correct records read from file
                                    cy.get('#earnings_rel_data_all_table_info')
                                        .then($footerText => {

                                            var recordCount = parseInt($footerText.text().split(' ').at(5), 10);
                                            if (recordCount!==0) expect(recordCount).to.equal(lines.length-1)
                                        })

                                    lines.forEach($line => {
                                        if (headerRemoved) {
                                            const parsedDate = dayjs(date, 'MMMM D YYYY').format('DD/MM/YYYY')

                                            if ($line.length>0) newContents+=$line + ', '+parsedDate+'\n'
                                        } else {
                                            headerRemoved = true
                                        }
                                    })

                                    if (newContents.length>0) {
                                        cy.writeFile(directory+date+".csv", newContents)
                                    }
                                })
                            })

                        cy.get('#date_select', { timeout: 10000 }).click();
                    }
                }
            })

            cy.get('#prevCal', { timeout: 10000 }).click();
        }
    }

//    it('Load Earnings Data', function() {
//       loadData('earnings/', true);
//    })

    it('Load Revenue Data', function() {
        loadData('revenue/', false);
    })
})