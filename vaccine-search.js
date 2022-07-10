let date = '';
const getDate = fetch('https://api.covid19india.org/data.json');
getDate.then((res) => {
    let obj = res.json();
    obj.then((data) => {
        date = data['statewise'][0]['lastupdatedtime'];
    }).catch((err) => {
        console.log(err);
    })
}).catch((err) => {
    console.log(err);
})


const get_state_id_api = fetch('https://cdn-api.co-vin.in/api/v2/admin/location/states');
get_state_id_api.then((data) => {
    let obj = data.json()
    obj.then((data) => {
        console.log(data);
        getStateIdFromInputTag(data['states']);
    }).catch((err) => {
        console.log(err);
    })
});

function getStateIdFromInputTag(data) {
    let text = '';
    Array.from(data).forEach((ele) => {
        text += `
       <option id='${ele['state_id']}'>${ele['state_id']}. ${ele['state_name']}</option>
       `

    });
    // console.log(text);
    document.getElementById('checkForVaccine').innerHTML += text;
    getDistrictFromState();
}

function getDistrictFromState() {
    let cfv = document.getElementById('checkForVaccine'),
        k1 = '';
    cfv.addEventListener('click', (ele) => {
        k1 = ele.target.value.toString().split('.');
        document.getElementById('selectDistrict').innerHTML = ' <option>Select District</option>';
        console.log(k1[0]);
        if (!ele.target.value.toString().includes('Select State/UTs')) {
            const get_district_id_api = fetch('https://cdn-api.co-vin.in/api/v2/admin/location/districts/' + k1[0]);
            getDistrict(get_district_id_api);
        }
    });

}




function getDistrict(get_district_id_api) {
    console.log("Entered in Get id by district");
    let array = [],
        index = 0;
    get_district_id_api.then((data) => {
        let obj = data.json();
        obj.then((res) => {
            let text = '';
            Array.from(res['districts']).forEach((ele) => {
                    // array.push({
                    //     id: ++index,
                    //     name_id: ele['district_id']
                    // });
                    text += `
              <option>${ele['district_id']}. ${ele['district_name']}</option>
              `
                })
                // console.log(text);
            document.getElementById('selectDistrict').innerHTML += text;
            exportDataToTable2(array);
        })
    }).catch((err) => {
        console.log(err);
    })
}

function exportDataToTable2(data) {
    let selectDistrict = document.getElementById('selectDistrict');
    let k = '',
        id = 0,
        getText = '',
        dateFormatter = '';
    selectDistrict.addEventListener('click', (e) => {
        getText = e.target.value;
        k = getText.toString().split('.');
        // let id = data[k[0] - 1]['name_id'];
        id = k[0];
        console.log(k)
        let d = date.toString().split('/');
        dateFormatter = d[0] + '-' + d[1] + '-' + new Date().getFullYear();
        // console.log(new Date().getDay());



        if (!getText.includes('Select District')) {
            const apiCallForExportDataToTable2 = fetch('https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByDistrict?district_id=' + id.toString() + '&date=' + dateFormatter.toString());
            apiCallForExportDataToTable2.then((data) => {
                let obj = data.json();
                obj.then((res) => {
                    console.log(res);
                    exportData(res['sessions']);
                }).catch((err) => {
                    console.log(err);
                })
            }).catch((err) => {
                console.log(err);
            })
        }
    })
}

function exportData(data) {
    let addRow = '';
    Array.from(data).forEach((ele) => {
            addRow += `
             <tr>
                <td>${ele['name']}</td>
                <td>${ele['address']},${ele['district_name']}, ${ele['state_name']}</td>
                <td>${ele['vaccine']}</td>
                <td>${ele['available_capacity']}</td>
                <td>${ele['date']}</td>
                <td>${ele['fee_type']}</td>
             </tr>
             `
        })
        // console.log(addRow);
    if (addRow === '')
        document.getElementById('table2').children[1].innerHTML = `
        <tr>
        <td colspan="6" style="text-align: center;">
        <h2>Data For the Selected District Is Not Available</h2>
        </td>
        </tr>`;
    else {
        document.getElementById('table2').innerHTML = `
      <thead>
      <tr>
          <th>Center Name</th>
          <th>Address</th>
          <th>Vaccine Name</th>
          <th>Available Vaccine Capacity</th>
          <th>Availabilty Date</th>
          <th>Fee Type</th>
      </tr>
  </thead>
  <tbody>
      <tr>
          <td colspan="6">
              <h2>Select a district to View Current Stats</h2>
          </td>
      </tr>
  </tbody>
      `;
        document.getElementById('table2').children[1].innerHTML = addRow;
    }

}
let vaccineTableAppendOrDeleteCounter = 0;
document.getElementById('closeBtn').addEventListener('click', (e) => {
    if (vaccineTableAppendOrDeleteCounter % 2 == 0) {
        document.getElementsByClassName('tableForVaccineAvailabilty')[0].innerHTML = '';
        vaccineTableAppendOrDeleteCounter++;
    } else {
        let table2Create = document.createElement('table');
        table2Create.id = 'table2';
        table2Create.innerHTML = `
       <thead>
       <tr>
           <th>Center Name</th>
           <th>Address</th>
           <th>Vaccine Name</th>
           <th>Available Vaccine Capacity</th>
           <th>Availabilty Date</th>
           <th>Fee Type</th>
       </tr>
   </thead>
   <tbody>
       <tr>
           <td colspan="6">
               <h2>Select a district to View Current Stats</h2>
           </td>
       </tr>
   </tbody>
       `;
        document.getElementsByClassName('tableForVaccineAvailabilty')[0].appendChild(table2Create);
        vaccineTableAppendOrDeleteCounter++;
    }
})