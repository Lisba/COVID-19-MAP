'use strict'

import stylesMap from './stylesMap.js';

const $map = document.querySelector('#map');
let map;

function initMap()
{  
    let map; 
    
    map = new google.maps.Map($map, {
        center: {
            lat: -10,
            lng: -60
        },
    zoom: 3,
    styles: stylesMap
});

return map;
};

map = initMap();

renderData();

async function getData()
{
    try 
    {
        const response = await fetch('https://wuhan-coronavirus-api.laeyoung.endpoint.ainize.ai/jhu-edu/latest');
        const data = await response.json();
        return data;
    }
    catch (error) 
    {
        return error;
    }
}

async function getDataTwo()
{
    try
    {
        const response = await fetch('https://coronavirus-19-api.herokuapp.com/countries');
        const data = await response.json();
        return data;
    }
    catch (error)
    {
        return error;
    }
}

const info = new google.maps.InfoWindow();

function renderInfoData(item, boolean)
{ 
    let stringToRender;

    if(boolean)
    {
        var numCases = Number(item.cases).toLocaleString('es');
        var numDeaths = Number(item.deaths).toLocaleString('es');
        var numRecovered = Number(item.recovered).toLocaleString('es');
        var numCritical = Number(item.critical).toLocaleString('es');
        var numCasesPerMillion = Number(item.casesPerOneMillion).toLocaleString('es');
        var numDeathsPerOneMillion = Number(item.deathsPerOneMillion).toLocaleString('es');
    
        stringToRender = `
            <h3> ${item.country} </h3>
            <p>------------------------------------------</p>
            <p>Confirmados: ${numCases}</p>
            <p>Muertos: ${numDeaths}</p>
            <p>Recuperados: ${numRecovered}</p>
            <p>Casos críticos: ${numCritical}</p>
            <p>Casos por millon: ${numCasesPerMillion}</p>
            <p>Muertes por millon: ${numDeathsPerOneMillion}</p>
            `;
    }
    else
    {
        var numConfirmed = Number(item.confirmed).toLocaleString('es');
        var numDeaths2 = Number(item.deaths).toLocaleString('es');
        var numRecovered2 = Number(item.recovered).toLocaleString('es');

        stringToRender = `
            <h3>${item.provincestate} ${item.countryregion}</h3>
            <p>------------------------------------------</p>
            <p>Confirmados: ${numConfirmed}</p>
            <p>Muertos: ${numDeaths2}</p>
            <p>Recuperados: ${numRecovered2}</p>
            <p>Fecha actualizado: ${item.lastupdate}</p>
            `;
    }
    
    return stringToRender;
}

function RenderInfoCondition(item, dataTwo)
{
    dataTwo.some(element => {
        if(item.provincestate === "")
        {
            if(item.countryregion === element.country)
            {
                if(element.cases >= item.confirmed)
                {
                    info.setContent(renderInfoData(element, true));    
                    return element.country === item.countryregion;
                }
                else
                {
                    info.setContent(renderInfoData(item, false));
                }
            }
            else
            {
                info.setContent(renderInfoData(item, false));
            }
        }
        else
        {
            info.setContent(renderInfoData(item, false));
        }
    });
}

async function renderData()
{
    try
    {
        const data = await getData();
        const dataTwo = await getDataTwo();
        console.log(data);
        console.log(dataTwo);
        
        data.forEach(item => {
    
            if(item.confirmed)
            {
                let tamaño;
    
                    if(item.confirmed > 68000)
                    {
                        tamaño = 170;
                    } else if (item.confirmed<6000)
                    {
                        tamaño = 15;
                    } else
                    {
                        tamaño = item.confirmed/400;      
                    }
    
                var icon = {
                         url: "src/assets/static/icono.png", // url
    
                          scaledSize: new google.maps.Size(tamaño, tamaño), // scaled size
                        };
    
                const marker = new google.maps.Marker(
                    {
                        position: 
                        {
                            lat: item.location.lat,
                            lng: item.location.lng,
                        },
                        map: map,
                        icon: icon
                    }
                    );
                    
                marker.addListener('click', () => {
                    RenderInfoCondition(item, dataTwo);
                    info.open(map, marker);
                });
            }
        });
    }
    catch (error)
    {
        alert('Ocurrió un error al cargar los datos, se recomienda recarga la página');
        console.log(error);
    }
}

async function getTotalData()
{
    try
    {
        const response = await fetch('https://coronavirus-19-api.herokuapp.com/all');
        const data = await response.json();
        return data;
    }
    catch (error)
    {
        return error;
    }
}

(async function totalConfirmedCases()
{
    try
    {
        const $pCases = document.getElementById('confirmedCasesP');
        const totalInfo = await getTotalData();
        console.log(totalInfo);
    
        $pCases.innerHTML = `${totalInfo.cases}`;
    }
    catch (error)
    {
        alert('Ocurrió un error al cargar los datos, se recomienda recarga la página');
        console.log(error);
    }
})();

(async function totalDeathsCases()
{
    try
    {
        const $pCases = document.getElementById('deathCasesP');
        const totalInfo = await getTotalData();
    
        $pCases.innerHTML = `${totalInfo.deaths}`;
    }
    catch (error)
    {
        alert('Ocurrió un error al cargar los datos, se recomienda recarga la página');
        console.log(error);
    }
})();

(async function totalRecoveredCases()
{
    try
    {
        const $pCases = document.getElementById('recoveredCasesP');
        const totalInfo = await getTotalData();
    
        $pCases.innerHTML = `${totalInfo.recovered}`;
    }
    catch (error)
    {
        alert('Ocurrió un error al cargar los datos, se recomienda recarga la página');
        console.log(error);
    }
})();