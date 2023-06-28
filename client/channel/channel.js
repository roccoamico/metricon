document.getElementById('channelForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  
  const channel = document.getElementById('channelInput').value;

  const response = await fetch(`/api/channel?channel=${channel}`);
  const responsePopular = await fetch(`/api/popularVideos?channel=${channel}`);

  const data = await response.json();
  const dataPopular = await responsePopular.json();

  const videos = dataPopular.videos || []; // Verifica se dataPopular.videos è definito

  const statsChannel = document.getElementById('statschannel');

  if (response.ok) {
    // errobox nascosta
    document.getElementById('errorBox').classList.add('d-none');

    // Azzeramento dei valori delle statistiche
    document.getElementById('subscriberCount').textContent = '';
    document.getElementById('viewCount').textContent = '';
    document.getElementById('videoCount').textContent = '';
    document.getElementById('hiddenSubscriberCount').textContent = '';
    document.getElementById('country').textContent = '';
    document.getElementById('madeForKids').textContent = '';

    // Nuova assegnazione
    document.getElementById('subscriberCount').textContent = data.subscriberCount;
    document.getElementById('viewCount').textContent = data.viewCount;
    document.getElementById('videoCount').textContent = data.videoCount;
    document.getElementById('hiddenSubscriberCount').textContent = data.hiddenSubscriberCount;
    document.getElementById('country').textContent = data.country;
    document.getElementById('madeForKids').textContent = data.madeForKids;
  
    createBarChart(videos);

    statsChannel.classList.remove('d-none');
  } else {
    statsChannel.classList.add('d-none');
    document.getElementById('errorBox').classList.remove('d-none');
  }
});

function createBarChart(videos) {
  // Estrai i dati necessari per il grafico (titoli dei video e visualizzazioni)
  const labels = videos.map(video => video.title);
  const views = videos.map(video => video.viewCount);

  const existingChart = Chart.getChart("popularVideosChart");
  if (existingChart) {
    existingChart.destroy();
  }

  // Configurazione del grafico
  const chartConfig = {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Visualizzazioni',
        data: views,
        backgroundColor:['rgba(54, 162, 235, 0.5)','rgba(255, 159, 64, 0.2)', 'rgba(255, 205, 86, 0.2)','rgba(54, 162, 235, 0.2)', 'rgba(153, 102, 255, 0.2)'],
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        datalabels: {
          anchor: 'end',
          align: 'end'
        }
      }]
    },
    options: {
      plugins: {
        datalabels: {
          color: '#333', // colore del testo delle etichette
          font: {
            weight: 'bold'
          },
          formatter: (value, context) => {
            return value; // visualizza il valore delle visualizzazioni come etichetta
          }
        }
      },
      responsive: true,
      plugins: {
        title: {
          display: true,
          font: {
            size: 18,
            weight: 'bold'
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Visualizzazioni'
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    }
  };

  // Creazione del grafico a barre
  const ctx = document.getElementById('popularVideosChart').getContext('2d');
  new Chart(ctx, chartConfig);
}
