'use strict'
import stylesMap from './stylesMap.js';
import { manualCoordinates } from '../manualCoordinates.js'

let map;

function initMap()
{
    const $map = document.querySelector('#map');
    return new google.maps.Map($map, {
        center: {
            lat: -10,
            lng: -60
        },
        zoom: 3,
        styles: stylesMap
    });
};

map = initMap();
renderData();

async function getData()
{
    try
    {
        const response = await fetch('https://corona-api.com/countries');
        return await response.json();
    }
    catch (error)
    {
        return error;
    }
}

const errorHandler = (error) => {
    alert('Ocurrió un error al cargar los datos, se recomienda recarga la página');
    console.error(error);
}

const info = new google.maps.InfoWindow();

function renderInfoData(item)
{
    let stringToRender = null;
    if(item)
    {
        const numCases = Number(item.latest_data.confirmed).toLocaleString('es');
        const numDeaths = Number(item.latest_data.deaths).toLocaleString('es');
        const numRecovered = Number(item.latest_data.recovered).toLocaleString('es');
        const numCritical = Number(item.latest_data.critical).toLocaleString('es');
        const numCasesPerMillion = Number(item.latest_data.calculated.cases_per_million_population).toLocaleString('es');
        const numDeathRate = Number(item.latest_data.calculated.death_rate).toLocaleString('es');
        const updatedAt = item.updated_at;
        stringToRender = `
            <h3> ${item.name} </h3>
            <p>------------------------------------------</p>
            <p>Confirmados: ${numCases}</p>
            <p>Muertes: ${numDeaths}</p>
            <p>Recuperados: ${numRecovered}</p>
            <p>Casos críticos: ${numCritical}</p>
            <p>Casos por millon: ${numCasesPerMillion}</p>
            <p>Tasa de muertes: ${numDeathRate}</p>
            <p>Actualizado el: ${updatedAt}</p>`;
    }
    return stringToRender;
}

const manualCoordinatesProvider = (item) => {
  return manualCoordinates[item?.name] || item.coordinates;
}

async function renderData()
{
    try
    {
        const { data } = await getData();
        data?.forEach(item => {
            if(item.latest_data?.confirmed)
            {
                let iconSize;

                item.latest_data.confirmed > 100_000
                ? iconSize = 66
                : item.latest_data.confirmed < 10_000
                  ? iconSize = 6
                  : iconSize = item.latest_data.confirmed / 1_500;

                let icon = {
                    url: "src/assets/static/icono.png",
                    scaledSize: new google.maps.Size(iconSize, iconSize),
                };

                const marker = new google.maps.Marker({
                        position: {
                            lat: item.coordinates.latitude || parseFloat(manualCoordinatesProvider(item).latitude),
                            lng: item.coordinates.longitude || parseFloat(manualCoordinatesProvider(item).longitude),
                        },
                        map: map,
                        icon: icon
                    });

                marker.addListener('click', () => {
                    info.setContent(renderInfoData(item));
                    info.open(map, marker);
                });
            }
        });
    }
    catch (error)
    {
        errorHandler(error);
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
        const { cases } = await getTotalData();

        $pCases.innerHTML = `${Number(cases).toLocaleString('es')}`;
    }
    catch (error)
    {
        errorHandler(error);
    }
})();

(async function totalDeathsCases()
{
    try
    {
        const $pCases = document.getElementById('deathCasesP');
        const { deaths } = await getTotalData();

        $pCases.innerHTML = `${Number(deaths).toLocaleString('es')}`;
    }
    catch (error)
    {
        errorHandler(error);
    }
})();

(async function totalRecoveredCases()
{
    try
    {
        const $pCases = document.getElementById('recoveredCasesP');
        const { recovered } = await getTotalData();

        $pCases.innerHTML = `${Number(recovered).toLocaleString('es')}`;
    }
    catch (error)
    {
        errorHandler(error);
    }
})();