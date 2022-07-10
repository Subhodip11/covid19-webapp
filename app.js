const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const axios = require('axios').default;
const dotenv = require('dotenv');

app.use(cors());
dotenv.config()

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }))
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.static(__dirname + '/public'));



app.get('/', (req, res) => {
    axios.get('https://api.covid19india.org/data.json').then(async data => {

        let apiData = await data.data['statewise'];
        res.render('index.ejs', { data: await apiData });


    }).catch((err) => {
        console.log(err);
    });

});

app.post('/search', (req, res) => {
    const searchValue = req.body.searchValue;
    // console.log(searchValue)
    axios.get('https://api.covid19india.org/data.json').then(data => {

        let apiData = data.data['statewise'];
        let timeout = 2000;
        setTimeout(async() => {
            if (apiData.length == 0)
                timeout = 2000
            else {
                let flag = false;

                for (let i = 0; i < apiData.length; i++) {
                    console.log(apiData[i].state, searchValue)
                    if (apiData[i].state.toLowerCase() === searchValue.toLowerCase()) {
                        console.log('entered here')
                        flag = true
                        console.log(apiData[i])
                        res.render('index.ejs', { data: await [apiData[i]] });
                        break;
                    }
                }

                if (!flag)
                    res.render('index', { data: [apiData[0]] })
                timeout = 0
            }

        }, timeout);



    }).catch((err) => {
        console.log(err);
    });
})

app.get('/worldData', (req, res) => {
    const payload = {
        "method": "GET",
        "headers": {
            "x-rapidapi-key": process.env.API_KEy,
            "x-rapidapi-host": process.env.RAPID_API_HOST
        }
    };

    const payload2 = {
        "method": "GET",
        "headers": {
            "x-rapidapi-key": process.env.API_KEY,
            "x-rapidapi-host": process.env.RAPID_API_HOST
        }
    }
    axios.get('https://vaccovid-coronavirus-vaccine-and-treatment-tracker.p.rapidapi.com/api/npm-covid-data/countries', payload).then(async worldData => {


        axios.get('https://vaccovid-coronavirus-vaccine-and-treatment-tracker.p.rapidapi.com/api/news/get-vaccine-news/0', payload2).then(async worldNews => {
            // console.log(worldNews.data)
            res.render('worldData', { data: await worldData.data, newsData: await worldNews.data['news'] })
        }).catch(err => console.log(err))

    }).catch(err => console.log(err))

})

app.get('/district/:statecode', (req, res) => {

    const statecode = req.params.statecode;
    axios.get('https://api.covid19india.org/state_district_wise.json')
        .then(data => {
            const k = data.data[statecode]['districtData'];
            let stateArr = []
                //filtering out the name of state required
            for (let i in k) {
                let stateObj = {
                    state: i,
                    stateData: k[i]
                }
                stateArr.push(stateObj);
            }
            console.log(stateArr)
            res.render('districtWiseData', { data: stateArr, stateID: req.params.statecode });
        }).catch(err => console.log(err))
});
app.post('/district/search/:statecode', (req, res) => {
    const statecode = req.params.statecode;
    const { searchValue } = req.body;
    // console.log(searchValue)
    axios.get('https://api.covid19india.org/state_district_wise.json')
        .then(data => {
            const k = data.data[statecode]['districtData'];
            let stateArr = []
                //filtering out the name of state required
            for (let i in k) {
                let stateObj = {
                    state: i,
                    stateData: k[i]
                }
                stateArr.push(stateObj);
            }
            // console.log(stateArr)
            let searchData = [];
            stateArr.forEach(ele => {
                if (ele.state.toLowerCase() === searchValue.toLowerCase())
                    searchData.push({
                        state: ele.state,
                        stateData: ele.stateData
                    })
            })
            res.render('districtWiseData', { data: searchData, stateID: req.params.statecode });
        }).catch(err => console.log(err))
})
app.get('/vaccineSearch', (req, res) => {
    res.sendFile('views/vaccine-search.html', { root: __dirname });
});

app.get('/vaccineSearchPinWise', (req, res) => {
    res.sendFile('views/vaccine-search-pin.html', { root: __dirname })
})



const port = process.env.PORT || 2121;
app.listen(port, () => {
    console.log('Port is active at 2121');
})