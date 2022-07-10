let globalObject = '';
const apiCall = fetch('https://api.covid19india.org/data.json');
apiCall.then((res) => {
    let covid19Data = res.json();
    covid19Data.then((data) => {
        globalObject = data['statewise'];
        vaccination_dose(data['tested']);
    })
}).catch((err) => {
    console.log(err);
});

function vaccination_dose(data) {

    let textFormatter = `
     <h2>${Number(data[data.length-1]['totaldosesadministered']).toLocaleString('en-US')}</h2>
     <hr>
     <h3>Total Vaccination Doses</h3>
    `
    console.log(textFormatter);
    document.querySelector('.vaccination-dose-status').innerHTML = textFormatter;
    textFormatter = `
    <h2>${Number(data[data.length-1]['samplereportedtoday']).toLocaleString('en-US')} Samples where tested on ${data[data.length-1]['testedasof']}</h2>
    <p>Till date ${Number(data[data.length-1]['totalsamplestested']).toLocaleString('en-US')} samples are tested</p>
    `
    document.querySelector('.sample-test-status').innerHTML = textFormatter;
}

//fetch the second api