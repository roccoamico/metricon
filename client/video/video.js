// Crea il grafico iniziale
let videoChart;

document.getElementById('urlForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const url = document.getElementById('urlInput').value;

  const response = await fetch(`/api/video?url=${url}`);
  const data = await response.json();

  const statsVideo = document.getElementById('statsvideo');

  if (response.ok) {
    document.getElementById('errorBox').classList.add('d-none');

    document.getElementById('videoViewCount').textContent = "";
    document.getElementById('likeCount').textContent = "";
    document.getElementById('commentCount').textContent = "";

    document.getElementById('videoViewCount').textContent = data.viewCount;
    document.getElementById('likeCount').textContent = data.likeCount;
    document.getElementById('commentCount').textContent = data.commentCount;

    const chartData = {
      labels: ['Likes', 'Comments'],
      datasets: [
        {
          data: [data.likeCount, data.commentCount],
          backgroundColor: ['rgba(54, 162, 235, 0.2)', 'rgba(255, 99, 132, 0.2)'],
          borderColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)'],
          borderWidth: 1
        }
      ]
    };

    const canvas = document.getElementById('videoChart');
    const ctx = canvas.getContext('2d');

    // Se il grafico esiste già, distruggilo prima di crearne uno nuovo
    if (videoChart) {
      videoChart.destroy();
    }

    videoChart = new Chart(ctx, {
      type: 'pie',
      data: chartData,
      options: {
        title: {
          display: true,
          text: 'Statistiche video'
        }
      }
    });

    statsVideo.classList.remove('d-none');
  } else {
    statsVideo.classList.add('d-none');
    document.getElementById('errorBox').classList.remove('d-none');
  }
});
