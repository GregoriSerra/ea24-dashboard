// script.js

// Variables estáticas y configuración inicial
const estadios = [
    { name: 'Camp Nou', lat: 41.38102, lon: 2.12295 },
    { name: 'Wembley', lat: 51.5560, lon: -0.28219 },
    { name: 'San Siro', lat: 45.47808, lon: 9.1214 },
    { name: 'Estadio do Dragäo', lat: 41.1617, lon: -8.5861 },
    { name: 'Allianz Arena', lat: 48.2188, lon: 11.6221 }
];

// Gráficos Highcharts (referencias para actualizar datos sin recrearlos)
let chartPrimerGrafico, chartSegundoGrafico, chartTercerGrafico;

// Función para cargar el primer gráfico: Medias más altas segmentadas por género
function cargarPrimerGrafico() {
    fetch('http://localhost/backend/data.php?tipo=players')
        .then(response => response.json())
        .then(datos => {
            if (!Array.isArray(datos)) {
                console.error('Respuesta inesperada del servidor:', datos);
                return;
            }

            const categoriasMedias = [];
            const hombres = [];
            const mujeres = [];

            datos.forEach(item => {
                if (!categoriasMedias.includes(item.overall)) {
                    categoriasMedias.push(item.overall); // Añadir la media a las categorías
                }

                if (item.gender === 'M') {
                    hombres.push(parseInt(item.count)); // Añadir la cantidad de hombres
                } else if (item.gender === 'F') {
                    mujeres.push(parseInt(item.count)); // Añadir la cantidad de mujeres
                }
            });

            if (!chartPrimerGrafico) {
                // Crear el gráfico si aún no existe
                chartPrimerGrafico = Highcharts.chart('container', {
                    chart: { type: 'column' }, // Tipo columnas
                    title: { text: 'Medias más altas de jugadores (Hombres vs Mujeres)' },
                    xAxis: {
                        categories: categoriasMedias, // Medias como categorías
                        title: { text: 'Media' } // eje X
                    },
                    yAxis: {
                        min: 0,
                        title: { text: 'Número de jugadores' } // eje Y
                    },
                    tooltip: {
                        shared: true,
                        pointFormat: '{series.name}: <b>{point.y}</b><br>'
                    },
                    series: [
                        { name: 'Hombres', data: hombres },
                        { name: 'Mujeres', data: mujeres }
                    ]
                });
            } else {
                // Actualizar los datos del gráfico existente
                chartPrimerGrafico.xAxis[0].setCategories(categoriasMedias);
                chartPrimerGrafico.series[0].setData(hombres);
                chartPrimerGrafico.series[1].setData(mujeres);
            }
        })
        .catch(error => console.error('Error cargando datos de medias altas:', error));
}

// Función para cargar el segundo gráfico: Cantidad de jugadores por liga en un gráfico donut (usando AJAX)
function cargarSegundoGrafico() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://localhost/backend/data.php?tipo=ligas', true);
    xhr.responseType = 'json';

    xhr.onload = function () {
        if (xhr.status === 200) {
            const datos = xhr.response;

            if (!Array.isArray(datos)) {
                console.error('Respuesta inesperada del servidor:', datos);
                return;
            }

            const dataLigas = datos.map(item => ({
                name: item.league, // Nombre de la liga
                y: parseInt(item.total) // Total de jugadores
            }));

            if (!chartSegundoGrafico) {
                // Crear el gráfico si aún no existe
                chartSegundoGrafico = Highcharts.chart('container2', {
                    chart: { type: 'pie' }, // Gráfico tipo pastel
                    title: { text: 'Jugadores por liga en el Top 100' },
                    plotOptions: {
                        pie: {
                            innerSize: '50%',
                            dataLabels: {
                                enabled: true,
                                format: '<b>{point.name}</b>: {point.y}' // Etiqueta con nombre y cantidad
                            }
                        }
                    },
                    series: [{ name: 'Jugadores', colorByPoint: true, data: dataLigas }]
                });
            } else {
                // Actualizar los datos del gráfico existente
                chartSegundoGrafico.series[0].setData(dataLigas);
            }
        } else {
            console.error(`Error en la solicitud AJAX: ${xhr.status}`);
        }
    };

    xhr.onerror = function () {
        console.error('Error de conexión al realizar la solicitud AJAX');
    };

    xhr.send();
}

// Función para cargar el tercer gráfico: Temperatura actual en estadios
function cargarTercerGrafico() {
    const categoriasEstadios = [];
    const temperaturas = [];

    function cargarEstadio(index) {
        if (index >= estadios.length) {
            if (!chartTercerGrafico) {
                // Crear el gráfico si aún no existe
                chartTercerGrafico = Highcharts.chart('container3', {
                    chart: { type: 'column' },
                    title: { text: 'Temperatura actual en estadios principales europeos' },
                    xAxis: { categories: categoriasEstadios },
                    yAxis: { title: { text: 'Temperatura (°C)' } },
                    series: [{ name: 'Temperatura', data: temperaturas }]
                });
            } else {
                // Actualizar los datos del gráfico existente
                chartTercerGrafico.xAxis[0].setCategories(categoriasEstadios);
                chartTercerGrafico.series[0].setData(temperaturas);
            }
            return;
        }

        const estadio = estadios[index];
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${estadio.lat}&longitude=${estadio.lon}&current_weather=true`)
            .then(response => response.json())
            .then(data => {
                categoriasEstadios.push(estadio.name);
                temperaturas.push(data.current_weather.temperature);
                cargarEstadio(index + 1);
            })
            .catch(error => console.error(`Error cargando datos de ${estadio.name}:`, error));
    }

    cargarEstadio(0);
}

// Iniciar la carga inicial y configurar el refresco periódico
document.addEventListener('DOMContentLoaded', function () {
    cargarPrimerGrafico();
    cargarSegundoGrafico();
    cargarTercerGrafico();

    setInterval(() => {
        cargarPrimerGrafico();
        cargarSegundoGrafico();
        cargarTercerGrafico();
    }, 15000);
});

