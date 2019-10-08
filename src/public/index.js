        
        $(document).ready(function () {
          function getReports(){
            return fetch('getReports')
          }
          $('#btnGet1').click(function () {
             getReports().then(res => {
              res.json().then(jsonRes => $("#reportsContatiner").append(`<div>${jsonRes.header}</div>`))
            } )
          });
          $('#btnGet10').click(function () {
            var arr = [];
            for (var i = 0; i < 10; i++) {
              arr.push(getReports());
            }
            Promise.all(arr).then(res => {
              for (var i = 0; i < res.length; i++) {
                res[i].json().then(jsonRes => $("#reportsContatiner").append(`<div>${jsonRes.header}</div>`))
              }
            } )
         });
       });