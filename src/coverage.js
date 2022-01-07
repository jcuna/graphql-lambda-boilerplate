const XMLSplitter = require('xml-splitter')
const fs = require('fs')

fs.readFile('tests/coverage/clover.xml', (err, xml) => {
    const xs = new XMLSplitter('/coverage')
    xs.on('data', data => {
        const metrics = data.project.metrics

        const functionRate = parseFloat(parseInt(metrics.coveredmethods) / parseInt(metrics.methods))
        const lineRate = parseFloat(parseInt(metrics.coveredstatements) / parseInt(metrics.statements))
        const branchRate = parseFloat(parseInt(metrics.coveredconditionals) / parseInt(metrics.conditionals))

        const percent = Math.floor(((functionRate + lineRate + branchRate) / 3) * 100)

        let color = 'green'
        if (percent < 85) {
            color = percent > 50 ? 'yellow' : 'red'
        }

        console.log('FUNC_RATE=' + functionRate)
        console.log('LINE_RATE=' + lineRate)
        console.log('BRANCH_RATE=' + branchRate)
        console.log('PERCENT=' + percent + '%')
        console.log('COLOR=' + color)

    }).parseString(xml)
})
